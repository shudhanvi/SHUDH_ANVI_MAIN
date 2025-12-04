import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

let pluginRegistrationPromise = null;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
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
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    ])
      .then(resolve)
      .catch(reject);
  });

  return pluginRegistrationPromise;
};

export const ManholeReportPopup = ({ reportData, onClose }) => {
  const printableRef = useRef(null);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const d = reportData || {};

  const isSingle = Boolean(d["Manhole ID"]);
  const isAggregate = Boolean(d["Total Manholes"]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    registerPlugins().then(() => setLibsLoaded(true));
  }, []);

  // PDF GENERATION
  useEffect(() => {
    if (!isGeneratingPDF) return;

    const generatePdf = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;

      if (!html2canvas || !jsPDF) return;

      const element = printableRef.current;

      try {
        const canvas = await html2canvas(element, { scale: 2 });
        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(img, "PNG", 0, 0, width, height);
        pdf.save(`Manhole-Report-${d["Manhole ID"] || "Aggregate"}.pdf`);
      } catch (e) {
        console.error("PDF Error:", e);
      }

      setIsGeneratingPDF(false);
    };

    generatePdf();
  }, [isGeneratingPDF]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) return alert("PDF libraries loading...");
    setIsGeneratingPDF(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-300">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isSingle
                ? `Manhole Report – ${d["Manhole ID"]}`
                : `Aggregate Report (${d["Total Manholes"]} Manholes)`}
            </h1>
            <p className="text-gray-600 text-sm">
              {isSingle ? "Detailed manhole operational analysis" : "Zone-level multi-manhole analysis"}
            </p>
          </div>

          <button className="text-2xl cursor-pointer text-gray-700" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div
          ref={printableRef}
          className="p-6 max-h-[75vh] overflow-y-auto bg-gray-50 text-gray-800"
        >

          {/* 🔹 SINGLE MANHOLE LAYOUT */}
          {isSingle && (
            <>
              {/* MANHOLE INFO */}
              <h2 className="text-lg font-semibold mb-3">Manhole Information</h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Manhole ID" value={d["Manhole ID"]} />
                <InfoCard title="Installation Year" value={d["Installation Year"]} />
                <InfoCard title="Latitude" value={d["Latitude"]} />
                <InfoCard title="Longitude" value={d["Longitude"]} />
              </div>

              {/* OPERATION SUMMARY */}
              <h2 className="text-lg font-semibold mb-3">Operation Summary</h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Number of Operations" value={d["Number of Operations"]} />
                <InfoCard title="Avg Operation Time" value={`${d["Average Operation Time (min)"]} min`} />
                <InfoCard title="Days Since Last Cleaning" value={d["Days Since Last Cleaning"]} />
                <InfoCard title="Last Operation Date" value={d["Last Operation Date"]} />
                <InfoCard title="Next Cleaning Date" value={d["Predicted Next Cleaning Date"]} />
              </div>

              {/* ANOMALIES */}
              <h2 className="text-lg font-semibold mb-3">Operation Time-Based Anomalies (Last 30 Days)</h2>

              {Array.isArray(d["Operation Time-Based Anomalies(last 30 days)"]) &&
              d["Operation Time-Based Anomalies(last 30 days)"].length > 0 ? (
                <Table
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "operation_time", label: "Operation Time" },
                    { key: "avg_time", label: "Average Time" },
                    { key: "difference", label: "Difference" }
                  ]}
                  rows={d["Operation Time-Based Anomalies(last 30 days)"]}
                />
              ) : (
                <p className="text-gray-600 mb-6">No anomalies detected.</p>
              )}
            </>
          )}

          {/* 🔹 MULTI-MANHOLE AGGREGATE LAYOUT */}
          {isAggregate && (
            <>
              {/* SUMMARY CARDS */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Total Manholes" value={d["Total Manholes"]} />
                <InfoCard title="Total Operations" value={d["Total Operations"]} />
                <InfoCard title="Avg Operation Time" value={`${d["Average Operation Time (min)"]} min`} />
              </div>

              {/* HIGH PRIORITY */}
              <Section title="Priority of Selected Manholes">
                <Table
                  rows={d["Priority of Selected Manholes (Based on Predicted Next Cleaning Date)"] || []}
                  columns={[
                    { key: "Manhole ID", label: "Manhole ID" },
                    { key: "Predicted Next Cleaning Date", label: "Next Cleaning Date" }
                  ]}
                />
              </Section>

              {/* MOST FREQUENTLY CLEANED */}
              <Section title="Cleaning Frequency of Selected Manholes">
                <Table
                  rows={d["Cleaning Frequency of Selected Manholes"] || []}
                  columns={[
                    { key: "Manhole ID", label: "Manhole ID" },
                    { key: "Operations", label: "Times Cleaned" }
                  ]}
                />
              </Section>

              {/* ANOMALIES */}
              <Section title="Top 10 Operation-Time Anomalies (Last 30 Days)">
                <Table
                  rows={d["Top 10 Operation-Time Anomalies (Last 30 Days)"] || []}
                  columns={[
                    { key: "Date", label: "Date" },
                    { key: "Manhole ID", label: "Manhole ID" },
                    { key: "Robot ID", label: "Robot ID" },
                    { key: "Actual Time", label: "Actual Time" },
                    { key: "Average Time", label: "Average Time" },
                    { key: "Difference", label: "Difference" }
                  ]}
                />
              </Section>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-300 flex justify-end bg-gray-100">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 text-white rounded-lg"
            style={{ backgroundColor: "#0097b2" }}
          >
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------- SUBCOMPONENTS -----------------

const InfoCard = ({ title, value }) => (
  <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
    <h3 className="text-xl font-bold text-gray-900">{value ?? "N/A"}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

const Table = ({ columns, rows }) => (
  <table className="w-full border border-gray-300 text-left bg-white mb-4">
    <thead className="bg-gray-200 text-gray-800">
      <tr>
        {columns.map((c) => (
          <th key={c.key} className="p-2 border border-gray-300">
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, idx) => (
        <tr key={idx} className="bg-white">
          {columns.map((c) => (
            <td key={c.key} className="p-2 border border-gray-300">
              {row[c.key] ?? "N/A"}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default ManholeReportPopup;
