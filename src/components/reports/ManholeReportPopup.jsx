// import { X } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";

// let pluginRegistrationPromise = null;

// const loadScript = (src) =>
//   new Promise((resolve, reject) => {
//     if (document.querySelector(`script[src="${src}"]`)) return resolve();
//     const s = document.createElement("script");
//     s.src = src;
//     s.async = true;
//     s.onload = resolve;
//     s.onerror = reject;
//     document.body.appendChild(s);
//   });

// const registerPlugins = () => {
//   if (pluginRegistrationPromise) return pluginRegistrationPromise;

//   pluginRegistrationPromise = new Promise((resolve, reject) => {
//     Promise.all([
//       loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
//       loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
//     ])
//       .then(resolve)
//       .catch(reject);
//   });

//   return pluginRegistrationPromise;
// };

// export const ManholeReportPopup = ({ reportData, onClose }) => {
//   const printableRef = useRef(null);
//   const [libsLoaded, setLibsLoaded] = useState(false);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   const d = reportData || {};

//   const isSingle = Boolean(d["Manhole ID"]);
//   const isAggregate = Boolean(d["Total Manholes"]);

//   useEffect(() => {
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => (document.body.style.overflow = prev);
//   }, []);

//   useEffect(() => {
//     registerPlugins().then(() => setLibsLoaded(true));
//   }, []);

//   // PDF GENERATION
//   useEffect(() => {
//     if (!isGeneratingPDF) return;

//     const generatePdf = async () => {
//       const html2canvas = window.html2canvas;
//       const jsPDF = window.jspdf?.jsPDF;

//       if (!html2canvas || !jsPDF) return;

//       const element = printableRef.current;

//       try {
//         const canvas = await html2canvas(element, { scale: 2 });
//         const img = canvas.toDataURL("image/png");
//         const pdf = new jsPDF("p", "mm", "a4");

//         const width = pdf.internal.pageSize.getWidth();
//         const height = (canvas.height * width) / canvas.width;

//         pdf.addImage(img, "PNG", 0, 0, width, height);
//         pdf.save(`Manhole-Report-${d["Manhole ID"] || "Aggregate"}.pdf`);
//       } catch (e) {
//         console.error("PDF Error:", e);
//       }

//       setIsGeneratingPDF(false);
//     };

//     generatePdf();
//   }, [isGeneratingPDF]);

//   const handleDownloadPDF = () => {
//     if (!libsLoaded) return alert("PDF libraries loading...");
//     setIsGeneratingPDF(true);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
//       <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl flex flex-col">

//         {/* HEADER */}
//         <div className="flex justify-between items-center p-5 border-b border-gray-300">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">
//               {isSingle
//                 ? `Manhole Report – ${d["Manhole ID"]}`
//                 : `Aggregate Report (${d["Total Manholes"]} Manholes)`}
//             </h1>
//             <p className="text-gray-600 text-sm">
//               {isSingle ? "Detailed manhole operational analysis" : "Zone-level multi-manhole analysis"}
//             </p>
//           </div>

//           <button className="text-2xl cursor-pointer text-gray-700" onClick={onClose}>
//             <X />
//           </button>
//         </div>

//         {/* CONTENT */}
//         <div
//           ref={printableRef}
//           className="p-6 max-h-[75vh] overflow-y-auto bg-gray-50 text-gray-800"
//         >

//           {/* 🔹 SINGLE MANHOLE LAYOUT */}
//           {isSingle && (
//             <>
//               {/* MANHOLE INFO */}
//               <h2 className="text-lg font-semibold mb-3">Manhole Information</h2>

//               <div className="grid md:grid-cols-3 gap-4 mb-6">
//                 <InfoCard title="Manhole ID" value={d["Manhole ID"]} />
//                 <InfoCard title="Installation Year" value={d["Installation Year"]} />
//                 <InfoCard title="Latitude" value={d["Latitude"]} />
//                 <InfoCard title="Longitude" value={d["Longitude"]} />
//               </div>

//               {/* OPERATION SUMMARY */}
//               <h2 className="text-lg font-semibold mb-3">Operation Summary</h2>

//               <div className="grid md:grid-cols-3 gap-4 mb-6">
//                 <InfoCard title="Number of Operations" value={d["Number of Operations"]} />
//                 <InfoCard title="Avg Operation Time" value={`${d["Average Operation Time (min)"]} min`} />
//                 <InfoCard title="Days Since Last Cleaning" value={d["Days Since Last Cleaning"]} />
//                 <InfoCard title="Last Operation Date" value={d["Last Operation Date"]} />
//                 <InfoCard title="Next Cleaning Date" value={d["Predicted Next Cleaning Date"]} />
//               </div>

//               {/* ANOMALIES */}
//               <h2 className="text-lg font-semibold mb-3">Operation Time-Based Anomalies (Last 30 Days)</h2>

//               {Array.isArray(d["Operation Time-Based Anomalies(last 30 days)"]) &&
//               d["Operation Time-Based Anomalies(last 30 days)"].length > 0 ? (
//                 <Table
//                   columns={[
//                     { key: "date", label: "Date" },
//                     { key: "operation_time", label: "Operation Time" },
//                     { key: "avg_time", label: "Average Time" },
//                     { key: "difference", label: "Difference" }
//                   ]}
//                   rows={d["Operation Time-Based Anomalies(last 30 days)"]}
//                 />
//               ) : (
//                 <p className="text-gray-600 mb-6">No anomalies detected.</p>
//               )}
//             </>
//           )}

//           {/* 🔹 MULTI-MANHOLE AGGREGATE LAYOUT */}
//           {isAggregate && (
//             <>
//               {/* SUMMARY CARDS */}
//               <div className="grid md:grid-cols-3 gap-4 mb-6">
//                 <InfoCard title="Total Manholes" value={d["Total Manholes"]} />
//                 <InfoCard title="Total Operations" value={d["Total Operations"]} />
//                 <InfoCard title="Avg Operation Time" value={`${d["Average Operation Time (min)"]} min`} />
//               </div>

//               {/* HIGH PRIORITY */}
//               <Section title="Priority of Selected Manholes">
//                 <Table
//                   rows={d["Priority of Selected Manholes (Based on Predicted Next Cleaning Date)"] || []}
//                   columns={[
//                     { key: "Manhole ID", label: "Manhole ID" },
//                     { key: "Predicted Next Cleaning Date", label: "Next Cleaning Date" }
//                   ]}
//                 />
//               </Section>

//               {/* MOST FREQUENTLY CLEANED */}
//               <Section title="Cleaning Frequency of Selected Manholes">
//                 <Table
//                   rows={d["Cleaning Frequency of Selected Manholes"] || []}
//                   columns={[
//                     { key: "Manhole ID", label: "Manhole ID" },
//                     { key: "Operations", label: "Times Cleaned" }
//                   ]}
//                 />
//               </Section>

//               {/* ANOMALIES */}
//               <Section title="Top 10 Operation-Time Anomalies (Last 30 Days)">
//                 <Table
//                   rows={d["Top 10 Operation-Time Anomalies (Last 30 Days)"] || []}
//                   columns={[
//                     { key: "Date", label: "Date" },
//                     { key: "Manhole ID", label: "Manhole ID" },
//                     { key: "Robot ID", label: "Robot ID" },
//                     { key: "Actual Time", label: "Actual Time" },
//                     { key: "Average Time", label: "Average Time" },
//                     { key: "Difference", label: "Difference" }
//                   ]}
//                 />
//               </Section>
//             </>
//           )}
//         </div>

//         {/* FOOTER */}
//         <div className="p-4 border-t border-gray-300 flex justify-end bg-gray-100">
//           <button
//             onClick={handleDownloadPDF}
//             className="px-6 py-2 text-white rounded-lg"
//             style={{ backgroundColor: "#0097b2" }}
//           >
//             {isGeneratingPDF ? "Generating..." : "Download PDF"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ---------------- SUBCOMPONENTS -----------------

// const InfoCard = ({ title, value }) => (
//   <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
//     <h3 className="text-xl font-bold text-gray-900">{value ?? "N/A"}</h3>
//     <p className="text-gray-600 text-sm">{title}</p>
//   </div>
// );

// const Section = ({ title, children }) => (
//   <div className="mb-8">
//     <h2 className="text-lg font-semibold mb-3">{title}</h2>
//     {children}
//   </div>
// );

// const Table = ({ columns, rows }) => (
//   <table className="w-full border border-gray-300 text-left bg-white mb-4">
//     <thead className="bg-gray-200 text-gray-800">
//       <tr>
//         {columns.map((c) => (
//           <th key={c.key} className="p-2 border border-gray-300">
//             {c.label}
//           </th>
//         ))}
//       </tr>
//     </thead>
//     <tbody>
//       {rows.map((row, idx) => (
//         <tr key={idx} className="bg-white">
//           {columns.map((c) => (
//             <td key={c.key} className="p-2 border border-gray-300">
//               {row[c.key] ?? "N/A"}
//             </td>
//           ))}
//         </tr>
//       ))}
//     </tbody>
//   </table>
// );

// export default ManholeReportPopup;

import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed, Map, MapPin } from 'lucide-react';
import MiniMap from "./MiniMap";


/* --------------------- Script loader & plugin register --------------------- */

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
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
      loadScript("https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js"),
    ])
      .then(resolve)
      .catch(reject);
  });

  return pluginRegistrationPromise;
};

/* -------------------------------- Helpers --------------------------------- */

const safeNumber = (v, fallback = 0) => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number") return v;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sortedMonthEntries = (obj = {}) =>
  Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

/* ----------------------- CHART WRAPPER SYSTEM ---------------------------- */

const ChartCanvas = ({ type = "bar", getData, getOptions, deps = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!window.Chart) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const config = {
      type,
      data: getData(),
      options: getOptions ? getOptions() : {},
    };

    if (chartRef.current) {
      try {
        chartRef.current.destroy();
      } catch {}
    }

    chartRef.current = new window.Chart(ctx, config);

    return () => {
      try {
        chartRef.current?.destroy();
      } catch {}
      chartRef.current = null;
    };
    // eslint-disable-next-line
  }, deps);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: "180px" }} // small uniform height
    />
  );
};

const ChartBlock = ({ title, children }) => (
  <div className="w-full h-[30%] md:w-1/2 p-2">
    <div className="bg-white border border-gray-300 rounded p-3">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  </div>
);

const ChartRow = ({ children }) => <div className="flex flex-wrap -m-2 mb-6">{children}</div>;

/* --------------------------- Table / Renderers --------------------------- */

const ArrayTable = ({ columns = [], rows = [] }) => {
  const finalColumns =
    columns.length > 0
      ? columns
      : rows[0]
      ? Object.keys(rows[0]).map((k) => ({ key: k, label: k }))
      : [];
  return (
    <table className="w-full border border-gray-300 text-left bg-white mb-4 table-fixed">
      <thead className="bg-gray-200 text-gray-800">
        <tr>
          {finalColumns.map((c) => (
            <th key={c.key} className="p-2 border">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className="p-2 border" colSpan={finalColumns.length}>
              <span className="text-gray-600">No records</span>
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={idx} className="bg-white align-top">
              {finalColumns.map((c) => (
                <td key={c.key} className="p-2 border align-top">
                  {isPlainObject(row[c.key]) || Array.isArray(row[c.key]) ? (
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(row[c.key], null, 2)}</pre>
                  ) : (
                    (row[c.key] ?? row[c.key.toLowerCase()] ?? row[c.label] ?? "N/A").toString()
                  )}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

const KeyValueTable = ({ data = {} }) => {
  const entries = Object.entries(data);
  if (!entries.length) return <p className="text-gray-600">No records</p>;
  return (
    <table className="w-full border border-gray-300 text-left bg-white mb-4 table-fixed">
      <thead className="bg-gray-200 text-gray-800">
        <tr>
          <th className="p-2 border">Key</th>
          <th className="p-2 border">Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k}>
            <td className="p-2 border align-top">{k}</td>
            <td className="p-2 border">
              {Array.isArray(v) || isPlainObject(v) ? (
                <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(v, null, 2)}</pre>
              ) : (
                String(v)
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/* --------------------------- Main component ------------------------------- */

export const ManholeReportPopup = ({ reportData, onClose,manholeloc }) => {
  const printableRef = useRef(null);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const d = reportData || {};
  const location = {
  lat: parseFloat(d.Latitude),
  lon: parseFloat(d.Longitude)
};
// console.log("Location:", location);

const multiplelocations = manholeloc || [];



  const isSingle = Boolean(d["Manhole ID"]);
  const isAggregate = Boolean(d["Total Manholes"]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    registerPlugins()
      .then(() => setLibsLoaded(true))
      .catch(() => setLibsLoaded(false));
  }, []);

  /* ---------------------------- PDF GENERATION ----------------------------- */

  useEffect(() => {
    if (!isGeneratingPDF) return;
    const generate = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;
      if (!html2canvas || !jsPDF) {
        alert("PDF libs not available");
        setIsGeneratingPDF(false);
        return;
      }
      try {
        const canvas = await html2canvas(printableRef.current, { scale: 2, useCORS: true });
        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(img, "PNG", 0, 0, width, height);
        pdf.save(`Manhole-Report-${d["Manhole ID"] || "Aggregate"}.pdf`);
      } catch (e) {
        console.error(e);
        alert("PDF export failed. Check console.");
      }
      setIsGeneratingPDF(false);
    };
    generate();
  }, [isGeneratingPDF, d]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) return alert("Libraries still loading or failed");
    setIsGeneratingPDF(true);
  };

  /* ----------------------------- Prepare data ------------------------------ */

  // SINGLE
  const singleMonthlyFreq = sortedMonthEntries(d["Monthly Operation Frequency"] || {});
  const singleLast10 = Array.isArray(d["Last 10 Operations"]) ? d["Last 10 Operations"] : [];
  const singleAnomalies = Array.isArray(d["Operation Time-Based Anomalies(last 30 days)"])
    ? d["Operation Time-Based Anomalies(last 30 days)"]
    : [];
  const singleMonthlyAvg = sortedMonthEntries(d["Monthly Average Operation Time (min)"] || {});

  // AGGREGATE
  const aggMonthlyFreq = sortedMonthEntries(d["Monthly Operation Frequency"] || {});
  const aggMonthlyAvg = sortedMonthEntries(d["Monthly Average Operation Time (min)"] || {});
  const cleaningFreq = Array.isArray(d["Cleaning Frequency of Selected Manholes"])
    ? d["Cleaning Frequency of Selected Manholes"]
    : [];
  const priorityList = Array.isArray(d["Priority of Selected Manholes (Based on Predicted Next Cleaning Date)"])
    ? d["Priority of Selected Manholes (Based on Predicted Next Cleaning Date)"]
    : [];
  const top10Anomalies = Array.isArray(d["Top 10 Operation-Time Anomalies (Last 30 Days)"])
    ? d["Top 10 Operation-Time Anomalies (Last 30 Days)"]
    : [];

  /* ------------------------------- Render --------------------------------- */

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-300">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isSingle ? `Manhole Report – ${d["Manhole ID"]}` : `Aggregate Report (${d["Total Manholes"] ?? "N/A"})`}
            </h1>
            <p className="text-gray-600 text-sm">
              {isSingle ? "Detailed manhole operational analysis" : "Zone-level multi-manhole analysis"}
            </p>
          </div>

          <button className="text-2xl cursor-pointer text-gray-700" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div ref={printableRef} className="p-6 max-h-[85vh] overflow-y-auto bg-gray-50 text-gray-800">

          {/* ----------------- SINGLE MANHOLE UI (ONLY SINGLE FIELDS) ----------------- */}
          {isSingle && (
            <>
              {/* Info cards */}
              <h2 className="text-lg font-semibold mb-3">Manhole Information</h2>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <InfoCard title="Manhole ID" value={d["Manhole ID"]} />
                <InfoCard title="Installation Year" value={d["Installation Year"]} />
                <InfoCard title="Latitude" value={d["Latitude"]} />
                <InfoCard title="Longitude" value={d["Longitude"]} />
              </div>

              <h2 className="text-lg font-semibold mb-3">Operation Summary</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Number of Operations" value={d["Number of Operations"]} />
                <InfoCard title="Average Operation Time (min)" value={d["Average Operation Time (min)"]} />
                <InfoCard title="Days Since Last Cleaning" value={d["Days Since Last Cleaning"]} />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Last Operation Date" value={d["Last Operation Date"]} />
                <InfoCard title="Predicted Next Cleaning Date" value={d["Predicted Next Cleaning Date"]} />
                <InfoCard
                  title="Monthly Ops (latest month)"
                  value={singleMonthlyFreq.length ? singleMonthlyFreq[singleMonthlyFreq.length - 1][1] : "N/A"}
                />
              </div>

<div className="w-full flex justify-center mb-[20px]">
<MiniMap locations={[location]} height="250px" width="50%" />
</div>

              {/* Charts: only time series charts for single */}
              <ChartRow>
                {singleMonthlyFreq.length > 0 && (
                  <ChartBlock title="Monthly Operation Frequency">
                    <ChartCanvas
                      type="bar"
                      deps={[singleMonthlyFreq, libsLoaded]}
                      getData={() => ({
                        labels: singleMonthlyFreq.map(([m]) => m),
                        datasets: [
                          {
                            label: "Ops",
                            data: singleMonthlyFreq.map(([, v]) => safeNumber(v)),
                            borderWidth: 1,
                          },
                        ],
                      })}
                      getOptions={() => ({
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      })}
                    />
                  </ChartBlock>
                )}

                {/* {singleAnomalies.length > 0 && (
                  <ChartBlock title="Anomaly Differences (visual)">
                    <ChartCanvas
                      type="scatter"
                      deps={[singleAnomalies, libsLoaded]}
                      getData={() => ({
                        datasets: [
                          {
                            label: "Difference",
                            data: singleAnomalies.map((a) => ({ x: a.date ?? a.Date, y: safeNumber(a.difference ?? (safeNumber(a.operation_time) - safeNumber(a.avg_time)) ) })),
                            pointRadius: 4,
                          },
                        ],
                      })}
                      getOptions={() => ({
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { type: "category", labels: singleAnomalies.map((a) => a.date ?? a.Date) },
                          y: { beginAtZero: true },
                        },
                      })}
                    />
                  </ChartBlock>
                )} */}

                {singleMonthlyAvg.length > 0 && (
  <ChartBlock title="Monthly Average Operation Time (min)">
    <ChartCanvas
      type="bar"
      deps={[singleMonthlyAvg, libsLoaded]}
      getData={() => ({
        labels: singleMonthlyAvg.map(([m]) => m),
        datasets: [
          {
            label: "Avg Time (min)",
            data: singleMonthlyAvg.map(([, v]) => safeNumber(v)),
            borderWidth: 1,
          },
        ],
      })}
      getOptions={() => ({
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      })}
    />
  </ChartBlock>
)}

              </ChartRow>

              {/* Tables: record-based data for single (no duplication of charted monthly data) */}
              <h3 className="text-lg font-semibold mb-2">Last 10 Operations</h3>
              <ArrayTable
                columns={[
                  { key: "date", label: "Date" },
                  { key: "operation_time_minutes", label: "Operation Time (min)" },
                  // { key: "robot_id", label: "Robot ID" },
                  // { key: "notes", label: "Notes" },
                ]}
                rows={singleLast10}
              />

              <h3 className="text-lg font-semibold mb-2">Operation Time-Based Anomalies (Last 30 Days)</h3>
              <ArrayTable
                columns={[
                  { key: "date", label: "Date" },
                  { key: "operation_time", label: "Operation Time (min)" },
                  { key: "avg_time", label: "Average Time" },
                  { key: "difference", label: "Difference" },
                  // { key: "robot_id", label: "Robot ID" },
                ]}
                rows={singleAnomalies}
              />
            </>
          )}

          {/* ----------------- AGGREGATE UI (ONLY AGGREGATE FIELDS) ----------------- */}
          {isAggregate && (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Total Manholes" value={d["Total Manholes"]} />
                <InfoCard title="Total Operations" value={d["Total Operations"]} />
                <InfoCard title="Average Operation Time (min)" value={d["Average Operation Time (min)"]} />
              </div>


<div className="w-full flex justify-center mb-[20px]">
  <MiniMap locations={multiplelocations} height="350px" width="100%" />
</div>

              {/* Charts for aggregate time-series */}
              <ChartRow>
                {aggMonthlyFreq.length > 0 && (
                  <ChartBlock title="Monthly Operation Frequency">
                    <ChartCanvas
                      type="bar"
                      deps={[aggMonthlyFreq, libsLoaded]}
                      getData={() => ({
                        labels: aggMonthlyFreq.map(([m]) => m),
                        datasets: [
                          {
                            label: "Ops",
                            data: aggMonthlyFreq.map(([, v]) => safeNumber(v)),
                            borderWidth: 1,
                          },
                        ],
                      })}
                      getOptions={() => ({
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      })}
                    />
                  </ChartBlock>
                )}

                {aggMonthlyAvg.length > 0 && (
                  <ChartBlock title="Monthly Average Operation Time (min)">
                    <ChartCanvas
                      type="bar"
                      deps={[aggMonthlyAvg, libsLoaded]}
                      getData={() => ({
                        labels: aggMonthlyAvg.map(([m]) => m),
                        datasets: [
                          {
                            label: "Avg Time (min)",
                            data: aggMonthlyAvg.map(([, v]) => safeNumber(v)),
                            borderWidth: 1,
                            
                          },
                        ],
                      })}
                      getOptions={() => ({
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      })}
                    />
                  </ChartBlock>
                )}
              </ChartRow>

              {/* Tables for aggregate lists (no duplication of monthly charts) */}
              <Section title="Priority of Selected Manholes">
                <ArrayTable
                  columns={[
                    { key: "Manhole ID", label: "Manhole ID" },
                    { key: "Predicted Next Cleaning Date", label: "Next Cleaning Date" },
                    // { key: "priority_score", label: "Priority Score" },
                  ]}
                  rows={priorityList}
                />
              </Section>

              <Section title="Cleaning Frequency of Selected Manholes">
                <ArrayTable
                  columns={[
                    { key: "Manhole ID", label: "Manhole ID" },
                    { key: "Operations", label: "Times Cleaned" },
                  ]}
                  rows={cleaningFreq}
                />
              </Section>

              <Section title="Top 10 Operation-Time Anomalies (Last 30 Days)">
                <ArrayTable
                  columns={[
                    { key: "Date", label: "Date" },
                    { key: "Manhole ID", label: "Manhole ID" },
                    // { key: "Robot ID", label: "Robot ID" },
                    { key: "Actual Time", label: "Operation Time" },
                    { key: "Average Time", label: "Average Time" },
                    { key: "Difference", label: "Difference" },
                  ]}
                  rows={top10Anomalies}
                />
              </Section>
            </>
          )}
        </div>

        {/* FOOTER */}
        {/* <div className="p-4 border-t border-gray-300 flex justify-end bg-gray-100">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 text-white rounded-lg"
            style={{ backgroundColor: "#0097b2" }}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

/* ------------------------- Subcomponents -------------------------------- */

const InfoCard = ({ title, value }) => (
  <div className="bg-white border rounded-lg p-4 text-center">
    <h3 className="text-xl font-bold">{value ?? "N/A"}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

export default ManholeReportPopup;
