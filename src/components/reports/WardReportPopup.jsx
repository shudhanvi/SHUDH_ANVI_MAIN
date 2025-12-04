import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// -----------------------
// Dynamic Script Loading
// -----------------------
let pluginRegistrationPromise = null;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const exists = document.querySelector(`script[src="${src}"]`);
    if (exists) return resolve();

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

const registerPlugins = () => {
  if (pluginRegistrationPromise) return pluginRegistrationPromise;

  pluginRegistrationPromise = new Promise((resolve, reject) => {
    const libsPromise = Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      ),
    ]);

    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
    )
      .then(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"
        )
      )
      .then(() => libsPromise)
      .then(resolve)
      .catch(reject);
  });

  return pluginRegistrationPromise;
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------
export const WardReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});
  const printableRef = useRef(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // FIXED: Report data is FLAT (NOT nested in .data)
  const data = reportData || {};

  // console.log("WardReportPopup received:", reportData);

  // Lock Scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original || "auto");
  }, []);

  // -----------------------------
  // Chart Creation
  // -----------------------------
  const createChart = (id, type, labels, values, colors = [], options = {}) => {
    const ctx = chartRefs.current[id];
    if (!ctx || !window.Chart) return;

    if (ctx.chartInstance) ctx.chartInstance.destroy();

    ctx.chartInstance = new window.Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: "",
            data: values,
            backgroundColor: colors.length ? colors : "#3b82f6",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { position: "bottom" },
          datalabels: {
            display: true,
            color: type === "pie" ? "#fff" : "#4b5563",
            font: { weight: "bold" },
            formatter: (val, ctx) => {
              if (type === "pie") {
                const total = ctx.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                return total > 0
                  ? `${((val / total) * 100).toFixed(1)}%`
                  : "";
              }
              return val;
            },
          },
        },
        scales: options.scales,
      },
    });
  };

  // Load libs → Create Charts
  useEffect(() => {
    registerPlugins()
      .then(() => {
        setLibsLoaded(true);

        if (window.Chart && window.ChartDataLabels) {
          try {
            window.Chart.register(window.ChartDataLabels);
          } catch {}
        }

        // LAND USE CHART
        if (data["Land Use Distribution"]) {
          const LU = data["Land Use Distribution"];
          createChart(
            "landUseChart",
            "pie",
            Object.keys(LU),
            Object.values(LU),
            ["#10b981", "#3b82f6", "#ef4444"]
          );
        }
      })
      .catch((err) => console.error("Lib loading error:", err));

    return () => {
      Object.values(chartRefs.current).forEach((c) =>
        c?.chartInstance?.destroy()
      );
    };
  }, [data]);

  // --------------------------------------------------
  // OLD WORKING PDF LOGIC (MERGED EXACTLY AS-IS)
  // --------------------------------------------------
  useEffect(() => {
    if (!isGeneratingPDF) return;

    const generatePdf = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;
      const element = printableRef.current;
      const content = element.querySelector(".report-content-scroll");

      if (!html2canvas || !jsPDF) {
        alert("PDF libraries not loaded");
        setIsGeneratingPDF(false);
        return;
      }

      const originalHeight = content.style.height;
      const originalOverflow = content.style.overflow;

      content.style.height = `${content.scrollHeight}px`;
      content.style.overflow = "visible";

      await new Promise((r) => setTimeout(r, 50));

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#fff",
          ignoreElements: (el) => el.classList.contains("no-print-pdf"),
        });

        content.style.height = originalHeight;
        content.style.overflow = originalOverflow;

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);

        const pdfHeight =
          (imgProps.height * pageWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("Ward_Report.pdf");
      } catch (err) {
        console.error("PDF Error:", err);
        content.style.height = originalHeight;
        content.style.overflow = originalOverflow;
      }

      setIsGeneratingPDF(false);
    };

    generatePdf();
  }, [isGeneratingPDF]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) {
      alert("PDF libs not loaded yet.");
      return;
    }
    setIsGeneratingPDF(true);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.6)] flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-lg shadow-lg flex flex-col">

        <div ref={printableRef}>
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">📊 Ward Report </h2>
            <button className="text-4xl no-print-pdf" onClick={onClose}>
              <X />
            </button>
          </div>

          {/* CONTENT */}
          <div
            className={`report-content-scroll p-6 ${
              isGeneratingPDF ? "overflow-visible h-auto" : "overflow-y-auto max-h-[80vh]"
            }`}
          >

            {/* INFO CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Total Manholes in Area" value={data["Total Manholes in Area"]} />
              <InfoCard label="Total Operations" value={data["Total Operations"]} />
              <InfoCard label="Total Operations in Last Month" value={data["Total Operations in Last Month"]} />
              <InfoCard label="Average Operation Time (min)" value={data["Average Operation Time (min)"]} />
            </div>

            {/* LAND USE CHART */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <ChartCard
                title="Land Use Distribution"
                chartId="landUseChart"
                chartRef={(el) => (chartRefs.current.landUseChart = el)}
              />
            </div>

            {/* TABLES */}
            <div className="space-y-6 mb-6">
              <TableSection
                title="Top 5 Robots by Utilization in This Area"
                data={data["Top 5 Robots by Utilization in This Area"]}
              />

              <TableSection
                title="Top 10 Manholes with Operation-Time Anomalies(Last 30 Days)"
                data={data["Top 10 Manholes with Operation-Time Anomalies(Last 30 Days)"]}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            disabled={isGeneratingPDF || !libsLoaded}
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-[#1E9AB0] text-white rounded-lg hover:bg-[#187A8A]"
          >
            {isGeneratingPDF ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// SUB COMPONENTS
// --------------------------------------------------
const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 border rounded-lg p-4 text-center">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value ?? "N/A"}</p>
  </div>
);

const ChartCard = ({ title, chartId, chartRef }) => (
  <div className="bg-white border rounded-lg shadow p-4 h-72 flex flex-col">
    <h4 className="text-center font-semibold mb-2">{title}</h4>
    <div className="relative flex-grow">
      <canvas id={chartId} ref={chartRef} className="absolute top-0 left-0 w-full h-full"></canvas>
    </div>
  </div>
);

const TableSection = ({ title, data }) => (
  <div className="bg-white border rounded-lg shadow p-5">
    <h3 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-2">{title}</h3>
    <Table data={data} />
  </div>
);

const Table = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="text-gray-500">No data available.</div>;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 border font-semibold text-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {headers.map((h, i) => (
                <td key={i} className="px-4 py-2 border text-gray-800">
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WardReportPopup;
