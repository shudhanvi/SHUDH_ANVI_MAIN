import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// -------------------------------------------
// Script loading utilities
// -------------------------------------------
let pluginRegistrationPromise = null;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });

const registerPlugins = () => {
  if (pluginRegistrationPromise) return pluginRegistrationPromise;

  pluginRegistrationPromise = new Promise((resolve, reject) => {
    const libs = Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    ]);

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
      .then(() => loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0"))
      .then(() => libs)
      .then(resolve)
      .catch(reject);
  });

  return pluginRegistrationPromise;
};

// -------------------------------------------
// MAIN COMPONENT
// -------------------------------------------
export const RobotReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});
  const printableRef = useRef(null);

  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const data = reportData || {};

  // Detect if backend response is SINGLE ROBOT or MULTIPLE ROBOTS
  const isSingle = Boolean(data["Robot ID"]);
  const isMulti = Boolean(data["Total Robots"]);

  // Prevent scroll behind popup
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  // -------------------------------------------
  // Chart creator
  // -------------------------------------------
  const createChart = (id, type, labels, values, options = {}) => {
    const ctx = chartRefs.current[id];
    if (!ctx || !window.Chart) return;

    if (ctx.chartInstance) ctx.chartInstance.destroy();

    ctx.chartInstance = new window.Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "#0097b2",
            backgroundColor: "#0097b233",
            fill: type === "line",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        ...options
      }
    });
  };

  // -------------------------------------------
  // Initialize charts based on layout type
  // -------------------------------------------
  useEffect(() => {
    const initCharts = () => {
      // SINGLE ROBOT → Show robot vs fleet comparison
      if (isSingle && data["Robot Avg Op Time vs Fleet Avg"]) {
        const comp = data["Robot Avg Op Time vs Fleet Avg"];

        createChart(
          "robotVsFleetChart",
          "bar",
          ["Robot Avg", "Fleet Avg"],
          [comp["Robot Avg"], comp["Fleet Avg"]],
          { scales: { y: { beginAtZero: true } } }
        );
      }

      // MULTI ROBOT → Show monthly trend
      const monthlyTrend = data["Average Operation Time Trend (Monthly)"];
      if (Array.isArray(monthlyTrend) && monthlyTrend.length > 0) {
        createChart(
          "monthlyTrendChart",
          "line",
          monthlyTrend.map((m) => m.month),
          monthlyTrend.map((m) => m["Avg Operation Time"])
        );
      }
    };

    registerPlugins().then(() => {
      setLibsLoaded(true);
      if (window.Chart && window.ChartDataLabels) {
        try {
          window.Chart.register(window.ChartDataLabels);
        } catch {}
      }
      initCharts();
    });
  }, [data]);

  // -------------------------------------------
  // PDF GENERATION
  // -------------------------------------------
  useEffect(() => {
    if (!isGeneratingPDF) return;

    const generatePdf = async () => {
      try {
        const html2canvas = window.html2canvas;
        const jsPDF = window.jspdf?.jsPDF;

        if (!html2canvas || !jsPDF) return;

        const element = printableRef.current;
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fff" });

        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);

        pdf.save(`Robot-Report-${data["Robot ID"] || "Summary"}.pdf`);
      } catch {}
      setIsGeneratingPDF(false);
    };

    generatePdf();
  }, [isGeneratingPDF]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) return alert("Libraries not ready");
    setIsGeneratingPDF(true);
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-xl">

        {/* PRINT AREA */}
        <div ref={printableRef}>
          {/* HEADER */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold">
              {isSingle ? `Robot Report – ${data["Robot ID"]}` : "Robot Performance Summary"}
            </h2>
            <button className="text-3xl cursor-pointer" onClick={onClose}><X /></button>
          </div>

          {/* CONTENT */}
          <div className="report-content-scroll max-h-[80vh] overflow-y-auto p-6">

            {/* ---------- SINGLE ROBOT METRICS ---------- */}
            {isSingle && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <InfoCard title="Robot ID" value={data["Robot ID"]} />
                  <InfoCard title="Total Operations" value={data["Total Operations"]} />
                  <InfoCard title="Avg Operation Time" value={`${data["Average Operation Time (min)"]} min`} />
                  <InfoCard title="Total Operation Time" value={`${data["Total Operation Time (min)"]} min`} />
                  <InfoCard title="Last Manhole" value={data["Last Manhole Handled"]} />
                  <InfoCard title="Last Operation Date" value={data["Last Operation Date"]} />
                  <InfoCard title="Last Operation Time" value={`${data["Last Operation Time (min)"]} min`} />
                  <InfoCard title="Next Expected Operation" value={data["Next Expected Operation Date"]} />
                  <InfoCard title="Robot Utilization (%)" value={`${data["Robot Utilization %"]}%`} />
                </div>

                {/* Robot vs Fleet Comparison */}
                {data["Robot Avg Op Time vs Fleet Avg"] && (
                  <ChartCard
                    title="Robot vs Fleet Avg Operation Time"
                    chartId="robotVsFleetChart"
                    chartRef={(el) => (chartRefs.current.robotVsFleetChart = el)}
                  />
                )}

                {/* Top 5 Manholes */}
                <SectionTable
                  title="Top 5 Manholes Handled"
                  rows={data["Top 5 Manholes Handled"] || []}
                  columns={[
                    { key: "Operations", label: "Manhole ID" },
                    { key: "count", label: "Count" }
                  ]}
                />
              </>
            )}

            {/* ---------- MULTI ROBOT METRICS ---------- */}
            {isMulti && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <InfoCard title="Total Robots" value={data["Total Robots"]} />
                  <InfoCard title="Total Operations" value={data["Total Operations"]} />
                  <InfoCard title="Avg Operation Time" value={`${data["Average Operation Time (min)"]} min`} />
                </div>

                {/* Monthly Trend */}
                {data["Average Operation Time Trend (Monthly)"]?.length > 0 && (
                  <ChartCard
                    title="Monthly Average Operation Time"
                    chartId="monthlyTrendChart"
                    chartRef={(el) => (chartRefs.current.monthlyTrendChart = el)}
                  />
                )}

                {/* Tables */}
                <SectionTable
                  title="Top 5 Most Served Manholes"
                  rows={data["Top 5 Most Served Manholes"] || []}
                  columns={[
                    { key: "Operations", label: "Manhole ID" },
                    { key: "count", label: "Operations Count" }
                  ]}
                />

                <SectionTable
                  title="Performance Order of Selected Robots"
                  rows={data["Performance Order of Selected Robots"] || []}
                  columns={[
                    { key: "Robot ID", label: "Robot ID" },
                    { key: "Efficiency (ops/day)", label: "Efficiency (ops/day)" }
                  ]}
                />
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-[#0097b2] text-white rounded-lg"
          >
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------
// Subcomponents
// --------------------------------------------
const InfoCard = ({ title, value }) => (
  <div className="p-4 bg-gray-50 border rounded text-center shadow-sm">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-xl font-bold">{value ?? "N/A"}</p>
  </div>
);

const ChartCard = ({ title, chartId, chartRef }) => (
  <div className="bg-white border rounded shadow p-4 mb-8">
    <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
    <div className="relative h-64">
      <canvas id={chartId} ref={chartRef} className="absolute inset-0"></canvas>
    </div>
  </div>
);

const SectionTable = ({ title, rows, columns }) => (
  <div className="bg-white border rounded shadow p-6 mb-8">
    <h2 className="text-lg font-bold border-l-4 border-[#0097b2] pl-3 mb-3">{title}</h2>

    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th key={col.key} className="p-2 border text-left">{col.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="p-2 border">{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RobotReportPopup;
