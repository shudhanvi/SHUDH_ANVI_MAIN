// import { X } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";

// // -------------------------------------------
// // Script loading utilities
// // -------------------------------------------
// let pluginRegistrationPromise = null;

// const loadScript = (src) =>
//   new Promise((resolve, reject) => {
//     const existing = document.querySelector(`script[src="${src}"]`);
//     if (existing) return resolve();

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
//     const libs = Promise.all([
//       loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
//       loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
//     ]);

//     loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
//       .then(() => loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0"))
//       .then(() => libs)
//       .then(resolve)
//       .catch(reject);
//   });

//   return pluginRegistrationPromise;
// };

// // -------------------------------------------
// // MAIN COMPONENT
// // -------------------------------------------
// export const RobotReportPopup = ({ reportData, onClose }) => {
//   const chartRefs = useRef({});
//   const printableRef = useRef(null);

//   const [libsLoaded, setLibsLoaded] = useState(false);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   const data = reportData || {};

//   // Detect if backend response is SINGLE ROBOT or MULTIPLE ROBOTS
//   const isSingle = Boolean(data["Robot ID"]);
//   const isMulti = Boolean(data["Total Robots"]);

//   // Prevent scroll behind popup
//   useEffect(() => {
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => (document.body.style.overflow = prev);
//   }, []);

//   // -------------------------------------------
//   // Chart creator
//   // -------------------------------------------
//   const createChart = (id, type, labels, values, options = {}) => {
//     const ctx = chartRefs.current[id];
//     if (!ctx || !window.Chart) return;

//     if (ctx.chartInstance) ctx.chartInstance.destroy();

//     ctx.chartInstance = new window.Chart(ctx, {
//       type,
//       data: {
//         labels,
//         datasets: [
//           {
//             data: values,
//             borderColor: "#0097b2",
//             backgroundColor: "#0097b233",
//             fill: type === "line",
//             tension: 0.3
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         animation: false,
//         plugins: { legend: { display: false } },
//         ...options
//       }
//     });
//   };

//   // -------------------------------------------
//   // Initialize charts based on layout type
//   // -------------------------------------------
//   useEffect(() => {
//     const initCharts = () => {
//       // SINGLE ROBOT → Show robot vs fleet comparison
//       if (isSingle && data["Robot Avg Op Time vs Fleet Avg"]) {
//         const comp = data["Robot Avg Op Time vs Fleet Avg"];

//         createChart(
//           "robotVsFleetChart",
//           "bar",
//           ["Robot Avg", "Fleet Avg"],
//           [comp["Robot Avg"], comp["Fleet Avg"]],
//           { scales: { y: { beginAtZero: true } } }
//         );
//       }

//       // MULTI ROBOT → Show monthly trend
//       const monthlyTrend = data["Average Operation Time Trend (Monthly)"];
//       if (Array.isArray(monthlyTrend) && monthlyTrend.length > 0) {
//         createChart(
//           "monthlyTrendChart",
//           "line",
//           monthlyTrend.map((m) => m.month),
//           monthlyTrend.map((m) => m["Avg Operation Time"])
//         );
//       }
//     };

//     registerPlugins().then(() => {
//       setLibsLoaded(true);
//       if (window.Chart && window.ChartDataLabels) {
//         try {
//           window.Chart.register(window.ChartDataLabels);
//         } catch {}
//       }
//       initCharts();
//     });
//   }, [data]);

//   // -------------------------------------------
//   // PDF GENERATION
//   // -------------------------------------------
//   useEffect(() => {
//     if (!isGeneratingPDF) return;

//     const generatePdf = async () => {
//       try {
//         const html2canvas = window.html2canvas;
//         const jsPDF = window.jspdf?.jsPDF;

//         if (!html2canvas || !jsPDF) return;

//         const element = printableRef.current;
//         const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fff" });

//         const img = canvas.toDataURL("image/png");
//         const pdf = new jsPDF("p", "mm", "a4");

//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const pageHeight = pdf.internal.pageSize.getHeight();
//         const imgHeight = (canvas.height * pageWidth) / canvas.width;

//         pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);

//         pdf.save(`Robot-Report-${data["Robot ID"] || "Summary"}.pdf`);
//       } catch {}
//       setIsGeneratingPDF(false);
//     };

//     generatePdf();
//   }, [isGeneratingPDF]);

//   const handleDownloadPDF = () => {
//     if (!libsLoaded) return alert("Libraries not ready");
//     setIsGeneratingPDF(true);
//   };

//   // -------------------------------------------
//   // UI
//   // -------------------------------------------
//   return (
//     <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg w-full max-w-6xl shadow-xl">

//         {/* PRINT AREA */}
//         <div ref={printableRef}>
//           {/* HEADER */}
//           <div className="flex justify-between items-center p-4 border-b">
//             <h2 className="text-2xl font-bold">
//               {isSingle ? `Robot Report – ${data["Robot ID"]}` : "Robot Performance Summary"}
//             </h2>
//             <button className="text-3xl cursor-pointer" onClick={onClose}><X /></button>
//           </div>

//           {/* CONTENT */}
//           <div className="report-content-scroll max-h-[80vh] overflow-y-auto p-6">

//             {/* ---------- SINGLE ROBOT METRICS ---------- */}
//             {isSingle && (
//               <>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//                   <InfoCard title="Robot ID" value={data["Robot ID"]} />
//                   <InfoCard title="Total Operations" value={data["Total Operations"]} />
//                   <InfoCard title="Avg Operation Time" value={`${data["Average Operation Time (min)"]} min`} />
//                   <InfoCard title="Total Operation Time" value={`${data["Total Operation Time (min)"]} min`} />
//                   <InfoCard title="Last Manhole" value={data["Last Manhole Handled"]} />
//                   <InfoCard title="Last Operation Date" value={data["Last Operation Date"]} />
//                   <InfoCard title="Last Operation Time" value={`${data["Last Operation Time (min)"]} min`} />
//                   <InfoCard title="Next Expected Operation" value={data["Next Expected Operation Date"]} />
//                   <InfoCard title="Robot Utilization (%)" value={`${data["Robot Utilization %"]}%`} />
//                 </div>

//                 {/* Robot vs Fleet Comparison */}
//                 {data["Robot Avg Op Time vs Fleet Avg"] && (
//                   <ChartCard
//                     title="Robot vs Fleet Avg Operation Time"
//                     chartId="robotVsFleetChart"
//                     chartRef={(el) => (chartRefs.current.robotVsFleetChart = el)}
//                   />
//                 )}

//                 {/* Top 5 Manholes */}
//                 <SectionTable
//                   title="Top 5 Manholes Handled"
//                   rows={data["Top 5 Manholes Handled"] || []}
//                   columns={[
//                     { key: "Operations", label: "Manhole ID" },
//                     { key: "count", label: "Count" }
//                   ]}
//                 />
//               </>
//             )}

//             {/* ---------- MULTI ROBOT METRICS ---------- */}
//             {isMulti && (
//               <>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//                   <InfoCard title="Total Robots" value={data["Total Robots"]} />
//                   <InfoCard title="Total Operations" value={data["Total Operations"]} />
//                   <InfoCard title="Avg Operation Time" value={`${data["Average Operation Time (min)"]} min`} />
//                 </div>

//                 {/* Monthly Trend */}
//                 {data["Average Operation Time Trend (Monthly)"]?.length > 0 && (
//                   <ChartCard
//                     title="Monthly Average Operation Time"
//                     chartId="monthlyTrendChart"
//                     chartRef={(el) => (chartRefs.current.monthlyTrendChart = el)}
//                   />
//                 )}

//                 {/* Tables */}
//                 <SectionTable
//                   title="Top 5 Most Served Manholes"
//                   rows={data["Top 5 Most Served Manholes"] || []}
//                   columns={[
//                     { key: "Operations", label: "Manhole ID" },
//                     { key: "count", label: "Operations Count" }
//                   ]}
//                 />

//                 <SectionTable
//                   title="Performance Order of Selected Robots"
//                   rows={data["Performance Order of Selected Robots"] || []}
//                   columns={[
//                     { key: "Robot ID", label: "Robot ID" },
//                     { key: "Efficiency (ops/day)", label: "Efficiency (ops/day)" }
//                   ]}
//                 />
//               </>
//             )}
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="p-4 border-t bg-gray-50 flex justify-end">
//           <button
//             onClick={handleDownloadPDF}
//             className="px-6 py-2 bg-[#0097b2] text-white rounded-lg"
//           >
//             {isGeneratingPDF ? "Generating..." : "Download PDF"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --------------------------------------------
// // Subcomponents
// // --------------------------------------------
// const InfoCard = ({ title, value }) => (
//   <div className="p-4 bg-gray-50 border rounded text-center shadow-sm">
//     <p className="text-sm text-gray-600">{title}</p>
//     <p className="text-xl font-bold">{value ?? "N/A"}</p>
//   </div>
// );

// const ChartCard = ({ title, chartId, chartRef }) => (
//   <div className="bg-white border rounded shadow p-4 mb-8">
//     <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
//     <div className="relative h-64">
//       <canvas id={chartId} ref={chartRef} className="absolute inset-0"></canvas>
//     </div>
//   </div>
// );

// const SectionTable = ({ title, rows, columns }) => (
//   <div className="bg-white border rounded shadow p-6 mb-8">
//     <h2 className="text-lg font-bold border-l-4 border-[#0097b2] pl-3 mb-3">{title}</h2>

//     <table className="w-full border-collapse">
//       <thead>
//         <tr className="bg-gray-100">
//           {columns.map((col) => (
//             <th key={col.key} className="p-2 border text-left">{col.label}</th>
//           ))}
//         </tr>
//       </thead>

//       <tbody>
//         {rows.map((row, idx) => (
//           <tr key={idx} className="hover:bg-gray-50">
//             {columns.map((col) => (
//               <td key={col.key} className="p-2 border">{row[col.key]}</td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// export default RobotReportPopup;

import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

/* --------------------- Script loader & plugin register --------------------- */

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
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
      loadScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"),
    ])
      .then(() =>
        // optional datalabels plugin — safe to fail
        loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0").catch(() => null)
      )
      .then(resolve)
      .catch(reject);
  });

  return pluginRegistrationPromise;
};

/* -------------------------------- Helpers --------------------------------- */

const safeNumber = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v === "number") return v;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sortedMonthEntries = (obj = {}) =>
  Object.entries(obj || {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

/* ----------------------- UNIVERSAL SIZE CONSTANTS ------------------------- */

const CHART_HEIGHT_PX = 220; // Universal chart height (you chose 220px)
const INFOCARD_MIN_HEIGHT = 100; // universal info card min height
const SECTION_GAP = "mb-8";

/* ----------------------- CHART / UI BUILDERS ------------------------------ */

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

    // destroy existing
    if (chartRef.current) {
      try {
        chartRef.current.destroy();
      } catch {}
      chartRef.current = null;
    }

    chartRef.current = new window.Chart(ctx, config);

    return () => {
      try {
        chartRef.current?.destroy();
      } catch {}
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <div style={{ height: `${CHART_HEIGHT_PX}px`, width: "100%" }} className="relative">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

const ChartBlock = ({ title, children }) => (
  <div className="w-full md:w-1/2 p-2">
    <div className="bg-white border border-gray-300 rounded p-3 h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

const ChartRow = ({ children }) => <div className="flex flex-wrap -m-2 mb-6">{children}</div>;

/* -------------------------- Render helpers -------------------------------- */

const ArrayTable = ({ columns = [], rows = [], emptyMessage = "No records found" }) => {
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
            <td className="p-3 border text-gray-600" colSpan={Math.max(finalColumns.length, 1)}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={idx} className="bg-white align-top hover:bg-gray-50">
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

const KeyValueTable = ({ data = {}, emptyMessage = "No records found" }) => {
  const entries = Object.entries(data || {});
  if (entries.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-300 rounded p-3 mb-4 text-gray-600">
        {emptyMessage}
      </div>
    );
  }
  return (
    <table className="w-full border border-gray-300 text-left bg-white mb-4 table-fixed">
      <thead className="bg-gray-200 text-gray-800">
        <tr>
          <th className="p-2 border ">Key</th>
          <th className="p-2 border ">Value</th>
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
                String(v ?? "N/A")
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ChartPlaceholder = ({ message }) => (
  <div className="w-full p-4 border border-gray-200 rounded bg-white text-gray-600">{message}</div>
);

/* --------------------------- Subcomponents -------------------------------- */

const InfoCard = ({ title, value }) => (
  <div
    className="p-4 bg-gray-50 border rounded text-center shadow-sm"
    style={{ minHeight: INFOCARD_MIN_HEIGHT }}
  >
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-xl font-bold">{value === null || value === undefined || value === "" ? "N/A" : value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className={SECTION_GAP}>
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

/* --------------------------- Main component -------------------------------- */

export const RobotReportPopup = ({ reportData, onClose }) => {
  const printableRef = useRef(null);
  const chartRefs = useRef({});
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const data = reportData || {};

  const isSingle = Boolean(data["Robot ID"]);
  const isMulti = Boolean(data["Total Robots"]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    registerPlugins()
      .then(() => {
        setLibsLoaded(true);
        // register datalabels plugin if loaded
        if (window.Chart && window.ChartDataLabels) {
          try {
            window.Chart.register(window.ChartDataLabels);
          } catch {}
        }
        // populate initial canvas-based charts after libs load
        initCanvasCharts();
      })
      .catch(() => setLibsLoaded(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* --------------------------- Canvas-based chart helpers ------------------------ */
  const destroyCanvasChart = (id) => {
    try {
      const el = chartRefs.current[id];
      if (el && el.chartInstance) {
        el.chartInstance.destroy();
        el.chartInstance = null;
      }
    } catch (e) {}
  };

  const createCanvasChart = (id, type, labels = [], values = [], options = {}) => {
    const el = chartRefs.current[id];
    if (!el || !window.Chart) return;
    try {
      if (el.chartInstance) {
        el.chartInstance.destroy();
        el.chartInstance = null;
      }
    } catch (e) {}
    try {
      el.chartInstance = new window.Chart(el, {
        type,
        data: {
          labels,
          datasets: [
            {
              data: values,
              borderColor: "#0097b2",
              backgroundColor: type === "bar" ? "#0097b233" : "#0097b233",
              fill: type === "line",
              tension: 0.25,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
          ...options,
        },
      });
    } catch (err) {
      console.error("createCanvasChart error", err);
    }
  };

  const initCanvasCharts = () => {
    if (!libsLoaded) return;

    // SINGLE charts
    if (isSingle) {
      // Monthly Operation Frequency
      const monthlyFreq = sortedMonthEntries(data["Monthly Operation Frequency"] || {});
      if (monthlyFreq.length > 0) {
        createCanvasChart(
          "singleMonthlyFreq",
          "bar",
          monthlyFreq.map(([m]) => m),
          monthlyFreq.map(([, v]) => safeNumber(v))
        );
      } else {
        destroyCanvasChart("singleMonthlyFreq");
      }

      // Robot vs Fleet Avg
      const comp = data["Robot Avg Op Time vs Fleet Avg"];
      if (comp && (comp["Robot Avg"] !== undefined || comp["Fleet Avg"] !== undefined)) {
        createCanvasChart(
          "robotVsFleetCanvas",
          "bar",
          ["Robot Avg", "Fleet Avg"],
          [safeNumber(comp["Robot Avg"]), safeNumber(comp["Fleet Avg"])]
        );
      } else {
        destroyCanvasChart("robotVsFleetCanvas");
      }

      // Operation Time Trend (weekly)
      const weeklyTrend = Array.isArray(data["Operation Time Trend (This Month-weekly wise)"])
        ? data["Operation Time Trend (This Month-weekly wise)"]
        : [];
      if (weeklyTrend.length > 0) {
        createCanvasChart(
          "singleWeeklyTrend",
          "line",
          weeklyTrend.map((t) => t.week ?? t.label ?? ""),
          weeklyTrend.map((t) => safeNumber(t["Avg Operation Time"] ?? t.value))
        );
      } else {
        destroyCanvasChart("singleWeeklyTrend");
      }
    }

    // MULTI charts
    if (isMulti) {
      // Monthly Operation Count
      const monthlyCount = sortedMonthEntries(data["Monthly Operation Count"] || {});
      if (monthlyCount.length > 0) {
        createCanvasChart(
          "aggMonthlyCount",
          "bar",
          monthlyCount.map(([m]) => m),
          monthlyCount.map(([, v]) => safeNumber(v))
        );
      } else {
        destroyCanvasChart("aggMonthlyCount");
      }

      // Monthly Active Hours
      const monthlyActive = sortedMonthEntries(data["Monthly Active Hours"] || {});
      if (monthlyActive.length > 0) {
        createCanvasChart(
          "aggMonthlyActive",
          "bar",
          monthlyActive.map(([m]) => m),
          monthlyActive.map(([, v]) => safeNumber(v))
        );
      } else {
        destroyCanvasChart("aggMonthlyActive");
      }

      // Monthly Utilization Percentage
      const monthlyUtil = sortedMonthEntries(data["Monthly Utilization Percentage"] || {});
      if (monthlyUtil.length > 0) {
        createCanvasChart(
          "aggMonthlyUtil",
          "line",
          monthlyUtil.map(([m]) => m),
          monthlyUtil.map(([, v]) => safeNumber(v))
        );
      } else {
        destroyCanvasChart("aggMonthlyUtil");
      }

      // Monthly Avg Operation Time (trend)
      const avgTrendArray = Array.isArray(data["Average Operation Time Trend (Monthly)"])
        ? data["Average Operation Time Trend (Monthly)"]
        : [];
      if (avgTrendArray.length > 0) {
        createCanvasChart(
          "aggMonthlyAvg",
          "line",
          avgTrendArray.map((r) => r.month),
          avgTrendArray.map((r) => safeNumber(r["Avg Operation Time"] ?? r.value))
        );
      } else {
        const fallbackAvg = sortedMonthEntries(data["Monthly Average Operation Time (min)"] || {});
        if (fallbackAvg.length > 0) {
          createCanvasChart(
            "aggMonthlyAvg",
            "line",
            fallbackAvg.map(([m]) => m),
            fallbackAvg.map(([, v]) => safeNumber(v))
          );
        } else {
          destroyCanvasChart("aggMonthlyAvg");
        }
      }
    }
  };

  // re-init canvas-based charts when libs/data changes
  useEffect(() => {
    initCanvasCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libsLoaded, data]);

  /* ------------------------------ PDF export ------------------------------- */

  useEffect(() => {
    if (!isGeneratingPDF) return;
    const generatePdf = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;
      if (!html2canvas || !jsPDF) {
        alert("PDF libraries are not ready");
        setIsGeneratingPDF(false);
        return;
      }
      try {
        const canvas = await html2canvas(printableRef.current, { scale: 2, useCORS: true, backgroundColor: "#fff" });
        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);
        pdf.save(`Robot-Report-${data["Robot ID"] || "Aggregate"}.pdf`);
      } catch (e) {
        console.error("PDF error", e);
        alert("Failed to generate PDF");
      }
      setIsGeneratingPDF(false);
    };
    generatePdf();
  }, [isGeneratingPDF, data]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) return alert("Libraries not ready");
    setIsGeneratingPDF(true);
  };

  /* ---------------------------- Data snippets ------------------------------ */

  // SINGLE specific
  const singleMonthlyFreq = sortedMonthEntries(data["Monthly Operation Frequency"] || {});
  const singleLast10 = Array.isArray(data["Last 10 Operations"]) ? data["Last 10 Operations"] : [];
  const singleTop5 = Array.isArray(data["Top 5 Manholes Handled"]) ? data["Top 5 Manholes Handled"] : [];
  const singleTimelineToday = Array.isArray(data["Timeline Today"]) ? data["Timeline Today"] : [];
  const singleManholesToday = Array.isArray(data["Manholes Handled Today"]) ? data["Manholes Handled Today"] : [];
  const singleOpTimePerManholeToday = isPlainObject(data["Operation Time Per Manhole (Today)"])
    ? data["Operation Time Per Manhole (Today)"]
    : {};

  // MULTI specific
  const aggMonthlyCount = sortedMonthEntries(data["Monthly Operation Count"] || {});
  const aggMonthlyActive = sortedMonthEntries(data["Monthly Active Hours"] || {});
  const aggMonthlyUtil = sortedMonthEntries(data["Monthly Utilization Percentage"] || {});
  const aggAvgTrend = Array.isArray(data["Average Operation Time Trend (Monthly)"]) ? data["Average Operation Time Trend (Monthly)"] : [];
  const aggTop5 = Array.isArray(data["Top 5 Most Served Manholes"]) ? data["Top 5 Most Served Manholes"] : [];
  const aggPerformanceOrder = Array.isArray(data["Performance Order of Selected Robots"]) ? data["Performance Order of Selected Robots"] : [];

  /* -------------------------------- Render --------------------------------- */

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-xl">

        {/* print area */}
        <div ref={printableRef}>
          {/* header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold">
              {isSingle ? `Robot Report – ${data["Robot ID"]}` : "Robot Performance Summary"}
            </h2>
            <button className="text-3xl cursor-pointer" onClick={onClose}><X /></button>
          </div>

          {/* content */}
          <div className="report-content-scroll max-h-[80vh] overflow-y-auto p-6">

            {/* ---------- SINGLE ROBOT UI ---------- */}
            {isSingle && (
              <>
                {/* Info cards grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <InfoCard title="Robot ID" value={data["Robot ID"]} />
                   <InfoCard title="Total Operations" value={data["Total Operations"] ?? 0} />
                  {/* <InfoCard title="Total Operations Today" value={data["Total Operations Today"] ?? 0} /> */}
                  {/* <InfoCard title="Total Operation Time (min)" value={data["Total Operation Time (min)"] ?? 0} />  */}
                  <InfoCard title="Average Operation Time (min)" value={data["Average Operation Time (min)"] ?? "N/A"} />
                  {/* <InfoCard title="Average Operation Time Today" value={data["Average Operation Time Today"] ?? 0} />
                  <InfoCard title="Highest Operation Time Today" value={data["Highest Operation Time Today"] ?? 0} /> */}
                  {/* <InfoCard title="Idle Time Today (min)" value={data["Idle Time Today (min)"] ?? 0} /> */}
                  <InfoCard title="Last Manhole Handled" value={data["Last Manhole Handled"] ?? "N/A"} />
                  <InfoCard title="Last Operation Date" value={data["Last Operation Date"] ?? "N/A"} />
                  <InfoCard title="Last Operation Time (min)" value={data["Last Operation Time (min)"] ?? 0} />
                  <InfoCard title="Next Expected Operation Date" value={data["Next Expected Operation Date"] ?? "N/A"} />
                  <InfoCard title="Robot Utilization %" value={data["Robot Utilization %"] ?? "N/A"} />
                </div>

                {/* charts auto-packed */}
                <ChartRow>
                  {/* monthly freq */}
                  <ChartBlock title="Monthly Operation Frequency">
                    {singleMonthlyFreq.length > 0 ? (
                      <ChartCanvas
                        type="bar"
                        deps={[singleMonthlyFreq, libsLoaded]}
                        getData={() => ({
                          labels: singleMonthlyFreq.map(([m]) => m),
                          datasets: [{ label: "Ops", data: singleMonthlyFreq.map(([, v]) => safeNumber(v)) }],
                        })}
                        getOptions={() => ({ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } })}
                      />
                    ) : (
                      <ChartPlaceholder message={singleMonthlyFreq.length === 0 ? "No chart data available" : "No chart data available"} />
                    )}
                  </ChartBlock>

                  {/* robot vs fleet */}
                  <ChartBlock title="Robot Avg vs Fleet Avg">
                    {data["Robot Avg Op Time vs Fleet Avg"] && (data["Robot Avg Op Time vs Fleet Avg"]["Robot Avg"] !== undefined || data["Robot Avg Op Time vs Fleet Avg"]["Fleet Avg"] !== undefined) ? (
                      <canvas ref={(el) => (chartRefs.current.robotVsFleetCanvas = el)} id="robotVsFleetCanvas" />
                    ) : (
                      <ChartPlaceholder message={isPlainObject(data["Robot Avg Op Time vs Fleet Avg"]) && Object.keys(data["Robot Avg Op Time vs Fleet Avg"] || {}).length === 0 ? "No activity today" : "No chart data available"} />
                    )}
                  </ChartBlock>

                  {/* weekly trend */}
                  <ChartBlock title="Operation Time Trend (This Month - weekly)">
                    {Array.isArray(data["Operation Time Trend (This Month-weekly wise)"]) && data["Operation Time Trend (This Month-weekly wise)"].length > 0 ? (
                      <canvas ref={(el) => (chartRefs.current.singleWeeklyTrend = el)} id="singleWeeklyTrendCanvas" />
                    ) : (
                      <ChartPlaceholder message={Array.isArray(data["Operation Time Trend (This Month-weekly wise)"]) ? (data["Operation Time Trend (This Month-weekly wise)"].length === 0 ? "No chart data available" : "No chart data available") : "No chart data available"} />
                    )}
                  </ChartBlock>

                  {/* placeholder to keep grid tidy
                  <div className="w-full md:w-1/2 p-2">
                    <div style={{ height: `${CHART_HEIGHT_PX}px` }} className="bg-white border border-gray-200 rounded p-3" />
                  </div> */}
                </ChartRow>

                {/* Tables / lists */}
                {/* ----------- Today's Operation Summary Table ----------- */}
<Section title="Today's Operational Metrics">
  <ArrayTable
    columns={[
      { key: "Total Operations Today", label: "Total Operations Today" },
      { key: "Average Operation Time Today", label: "Average Operation Time Today" },
      { key: "Highest Operation Time Today", label: "Highest Operation Time Today" },
      { key: "Idle Time Today (min)", label: "Idle Time Today (min)" },
    ]}
    rows={[
      {
        "Total Operations Today": data["Total Operations Today"] ?? "N/A",
        "Average Operation Time Today": data["Average Operation Time Today"] ?? "N/A",
        "Highest Operation Time Today": data["Highest Operation Time Today"] ?? "N/A",
        "Idle Time Today (min)": data["Idle Time Today (min)"] ?? "N/A",
      }
    ]}
  />
</Section>





                <Section title="Last 10 Operations">
                  <ArrayTable
                    columns={[
                      { key: "date", label: "Date" },
                      { key: "operation_time_minutes", label: "Operation Time (min)" },
                      { key: "manhole_id", label: "Manhole ID" },
                      // { key: "robot_id", label: "Robot ID" },
                    ]}
                    rows={singleLast10}
                    emptyMessage={singleLast10.length === 0 ? "No records found" : "No records found"}
                  />
                </Section>

                <Section title="Top 5 Manholes Handled">
                  <ArrayTable
                    columns={[{ key: "Operations", label: "Manhole ID" }, { key: "count", label: "Count" }]}
                    rows={singleTop5}
                    emptyMessage={singleTop5.length === 0 ? "No records found" : "No records found"}
                  />
                </Section>

                <Section title="Manholes Handled Today">
                  <ArrayTable rows={singleManholesToday} emptyMessage={singleManholesToday.length === 0 ? "No activity today" : "No records found"} />
                </Section>

                <Section title="Timeline Today">
                  <ArrayTable rows={singleTimelineToday} emptyMessage={singleTimelineToday.length === 0 ? "No activity today" : "No records found"} />
                </Section>

                <Section title="Operation Time Per Manhole (Today)">
                  <KeyValueTable data={singleOpTimePerManholeToday} emptyMessage={Object.keys(singleOpTimePerManholeToday).length === 0 ? "No activity today" : "No records found"} />
                </Section>
              </>
            )}

            {/* ---------- MULTI ROBOT UI ---------- */}
            {isMulti && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <InfoCard title="Total Robots" value={data["Total Robots"] ?? "N/A"} />
                  <InfoCard title="Total Operations" value={data["Total Operations"] ?? 0} />
                  <InfoCard title="Average Operation Time (min)" value={data["Average Operation Time (min)"] ?? "N/A"} />
                </div>

                <ChartRow>
                  <ChartBlock title="Monthly Operation Count">
                    {aggMonthlyCount.length > 0 ? (
                      <ChartCanvas
                        type="bar"
                        deps={[aggMonthlyCount, libsLoaded]}
                        getData={() => ({
                          labels: aggMonthlyCount.map(([m]) => m),
                          datasets: [{ label: "Ops", data: aggMonthlyCount.map(([, v]) => safeNumber(v)) }],
                        })}
                        getOptions={() => ({ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } })}
                      />
                    ) : (
                      <ChartPlaceholder message={aggMonthlyCount.length === 0 ? "No chart data available" : "No chart data available"} />
                    )}
                  </ChartBlock>

                  <ChartBlock title="Monthly Active Hours">
                    {aggMonthlyActive.length > 0 ? (
                      <ChartCanvas
                        type="bar"
                        deps={[aggMonthlyActive, libsLoaded]}
                        getData={() => ({
                          labels: aggMonthlyActive.map(([m]) => m),
                          datasets: [{ label: "Hours", data: aggMonthlyActive.map(([, v]) => safeNumber(v)) }],
                        })}
                        getOptions={() => ({ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } })}
                      />
                    ) : (
                      <ChartPlaceholder message={aggMonthlyActive.length === 0 ? "No chart data available" : "No chart data available"} />
                    )}
                  </ChartBlock>

                  <ChartBlock title="Monthly Utilization (%)">
                    {aggMonthlyUtil.length > 0 ? (
                      <ChartCanvas
                        type="line"
                        deps={[aggMonthlyUtil, libsLoaded]}
                        getData={() => ({
                          labels: aggMonthlyUtil.map(([m]) => m),
                          datasets: [{ label: "Util %", data: aggMonthlyUtil.map(([, v]) => safeNumber(v)) }],
                        })}
                        getOptions={() => ({ plugins: { legend: { display: false } }, scales: { x: {
      offset: true,      // <-- pushes x-axis labels away from the Y-axis
      grid: { display: false }
    }, y: { beginAtZero: true } } })}
                      />
                    ) : (
                      <ChartPlaceholder message={aggMonthlyUtil.length === 0 ? "No chart data available" : "No chart data available"} />
                    )}
                  </ChartBlock>

                  <ChartBlock title="Monthly Avg Operation Time">
                    {aggAvgTrend.length > 0 ? (
                      <ChartCanvas
                        type="line"
                        deps={[aggAvgTrend, libsLoaded]}
                        getData={() => ({
                          labels: aggAvgTrend.map((r) => r.month),
                          datasets: [{ label: "Avg Time", data: aggAvgTrend.map((r) => safeNumber(r["Avg Operation Time"])) }],
                        })}
                        getOptions={() => ({ plugins: { legend: { display: false } }, scales: { x: {
      offset: true,      // <-- pushes x-axis labels away from the Y-axis
      grid: { display: false }
    }, y: { beginAtZero: true } } })}
                      />
                    ) : (
                      <ChartPlaceholder message={aggAvgTrend.length === 0 ? "No chart data available" : "No chart data available"} />
                    )}
                  </ChartBlock>
                </ChartRow>

                <Section title="Top 5 Most Served Manholes">
                  <ArrayTable
                    columns={[{ key: "Operations", label: "Manhole ID" }, { key: "count", label: "Count" }]}
                    rows={aggTop5}
                    emptyMessage={aggTop5.length === 0 ? "No records found" : "No records found"}
                  />
                </Section>

                <Section title="Performance Order of Selected Robots">
                  <ArrayTable
                    columns={[{ key: "Robot ID", label: "Robot ID" }, { key: "Efficiency (ops/day)", label: "Efficiency (operations per day)" }]}
                    rows={aggPerformanceOrder}
                    emptyMessage={aggPerformanceOrder.length === 0 ? "No records found" : "No records found"}
                  />
                </Section>
              </>
            )}
          </div>
        </div>

        {/* footer */}
        {/* <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-[#0097b2] text-white rounded-lg"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default RobotReportPopup;
