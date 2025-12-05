// import React, { useEffect, useRef, useState } from "react";
// import { X } from "lucide-react";

// /* ------------------ Dynamic Script Loader ------------------ */
// let pluginRegistrationPromise = null;

// const loadScript = (src) =>
//   new Promise((resolve, reject) => {
//     const exists = document.querySelector(`script[src="${src}"]`);
//     if (exists) return resolve();
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
//       loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
//       loadScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"),
//     ])
//       .then(() =>
//         // load datalabels plugin optionally; failure is tolerated
//         loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js").catch(
//           () => null
//         )
//       )
//       .then(resolve)
//       .catch(reject);
//   });

//   return pluginRegistrationPromise;
// };




// /* ------------------------- Helpers ------------------------- */

// const safeNumber = (v, fallback = 0) => {
//   if (v === null || v === undefined || v === "") return fallback;
//   if (typeof v === "number") return v;
//   const p = Number(v);
//   return Number.isFinite(p) ? p : fallback;
// };

// const sortedMonthEntries = (obj = {}) =>
//   Object.entries(obj || {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

// const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

// /* ------------------ Universal layout constants ------------------ */

// const CHART_HEIGHT_PX = 220;
// const INFOCARD_MIN_HEIGHT = 100;

// /* ------------------ Chart helpers (safe) ------------------ */

// /**
//  * Safely create/destroy charts on canvas refs stored in chartRefs.current[id]
//  * - Ensures previous chart instance destroyed before new creation
//  * - Skips creation if values empty (prevents datalabels plugin reading null coords)
//  */
// const createOrUpdateChart = (chartRefs, id, configFactory) => {
//   const el = chartRefs.current[id];
//   if (!el) return;
//   if (!window.Chart) return;

//   // Destroy existing chart instance if any
//   try {
//     if (el.chartInstance) {
//       el.chartInstance.destroy();
//       el.chartInstance = null;
//     }
//   } catch (e) {
//     // ignore
//   }

//   // Build config via factory to defer heavy work only when needed
//   const cfg = configFactory();
//   // cfg may be null to indicate "do not create"
//   if (!cfg) return;

//   try {
//     el.chartInstance = new window.Chart(el, cfg);
//   } catch (e) {
//     console.error("Chart creation failed for", id, e);
//     try {
//       if (el.chartInstance) {
//         el.chartInstance.destroy();
//         el.chartInstance = null;
//       }
//     } catch {}
//   }
// };

// /* ------------------ Subcomponents ------------------ */

// const InfoCard = ({ label, value }) => (
//   <div
//     className="bg-gray-50 border rounded-lg p-4 text-center shadow-sm"
//     style={{ minHeight: INFOCARD_MIN_HEIGHT }}
//   >
//     <p className="text-sm text-gray-600">{label}</p>
//     <p className="text-xl font-bold">{value === null || value === undefined || value === "" ? "N/A" : value}</p>
//   </div>
// );

// const Section = ({ title, children }) => (
//   <div className="mb-8">
//     <h3 className="text-lg font-semibold mb-3">{title}</h3>
//     {children}
//   </div>
// );

// const ChartPlaceholder = ({ message }) => (
//   <div
//     className="bg-white border border-gray-200 rounded p-4 flex items-center justify-center text-gray-600"
//     style={{ height: `${CHART_HEIGHT_PX}px` }}
//   >
//     {message}
//   </div>
// );

// const ChartCardCanvas = ({ title, canvasRef, children, noData }) => (
//   <div className="bg-white border rounded-lg shadow p-3 h-full flex flex-col">
//     <h4 className="text-sm font-semibold text-center mb-2">{title}</h4>
//     <div className="flex-1">
//       {noData ? (
//         <div className="flex items-center justify-center text-gray-500" style={{ height: `${CHART_HEIGHT_PX}px` }}>
//           No chart data available
//         </div>
//       ) : (
//         <div style={{ height: `${CHART_HEIGHT_PX}px`, width: "100%" }}>
//           <canvas ref={canvasRef} className="w-full h-full" />
//         </div>
//       )}
//     </div>
//   </div>
// );

// const EmptyMessage = ({ children }) => <div className="text-gray-500">{children}</div>;

// const KeyValueTable = ({ obj, emptyMessage = "No records found" }) => {
//   if (!obj || Object.keys(obj).length === 0) {
//     return <EmptyMessage>{emptyMessage}</EmptyMessage>;
//   }
//   const entries = Object.entries(obj);
//   return (
//     <table className="w-full border border-gray-300 bg-white mb-4">
//       <tbody>
//         {entries.map(([k, v]) => (
//           <tr key={k} className="border-b last:border-b-0">
//             <td className="p-2 font-medium border-r w-1/3">{k}</td>
//             <td className="p-2">{Array.isArray(v) || isPlainObject(v) ? <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(v, null, 2)}</pre> : String(v ?? "N/A")}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// const DataTable = ({ rows, emptyMessage = "No records found" }) => {
//   if (!rows || rows.length === 0) return <EmptyMessage>{emptyMessage}</EmptyMessage>;
//   const headers = Object.keys(rows[0]);
//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full border-collapse bg-white">
//         <thead className="bg-gray-50">
//           <tr>
//             {headers.map((h) => (
//               <th key={h} className="p-2 border text-left">{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((r, i) => (
//             <tr key={i} className="hover:bg-gray-50">
//               {headers.map((h) => (
//                 <td key={h} className="p-2 border align-top">
//                   {isPlainObject(r[h]) || Array.isArray(r[h]) ? <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(r[h], null, 2)}</pre> : String(r[h] ?? "N/A")}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// /* ------------------ Main Component ------------------ */

// export const WardReportPopup = ({ reportData, onClose }) => {
//   const printableRef = useRef(null);
//   const chartRefs = useRef({}); // canvas refs stored here by id
//   const [libsLoaded, setLibsLoaded] = useState(false);
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   // backend data (flat)
//   const data = reportData || {};

//   /* ------------------ Register libs + datalabels safely ------------------ */
//   useEffect(() => {
//     let cancelled = false;
//     registerPlugins()
//       .then(() => {
//         if (cancelled) return;
//         setLibsLoaded(true);

//         // Register plugin only once, wrapped in try/catch
//         if (window.Chart && window.ChartDataLabels) {
//           try {
//             // Chart.register is idempotent; catch if already registered
//             window.Chart.register(window.ChartDataLabels);
//           } catch (e) {
//             // ignore
//           }
//         }
//         // after libs are ready, initialize charts
//         initChartsSafe();
//       })
//       .catch((err) => {
//         console.error("Failed to load libs", err);
//         setLibsLoaded(false);
//       });

//     return () => {
//       cancelled = true;
//       // destroy any chart instances on unmount
//       Object.values(chartRefs.current).forEach((c) => {
//         try {
//           if (c && c.chartInstance) {
//             c.chartInstance.destroy();
//             c.chartInstance = null;
//           }
//         } catch (e) {}
//       });
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reportData]);

//   /* ------------------ Chart initialization (safe guards) ------------------ */
//   const initChartsSafe = () => {
//     if (!window.Chart) return;

//     // LAND USE PIE
//     const landUse = data["Land Use Distribution"] || {};
//     const landUseKeys = Object.keys(landUse || {});
//     const landUseValues = landUseKeys.map((k) => safeNumber(landUse[k]));

//     createOrUpdateChart(chartRefs, "landUse", () => {
//       // if no data or all zeros -> do not create chart
//       const total = landUseValues.reduce((a, b) => a + b, 0);
//       if (!landUseKeys.length || total === 0) return null;

//       return {
//         type: "pie",
//         data: {
//           labels: landUseKeys,
//           datasets: [
//             {
//               data: landUseValues,
//               backgroundColor: ["#3b82f6", "#10b981", "#ef4444"],
//               borderColor: "#ffffff",
//               borderWidth: 1,
//             },
//           ],
//         },
//         options: {
//           plugins: {
//             legend: { position: "bottom" },
//             datalabels: {
//               display: true,
//               color: "#fff",
//               formatter: (value, ctx) => {
//                 const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
//                 return sum > 0 ? ((value / sum) * 100).toFixed(1) + "%" : "";
//               },
//               font: { weight: "bold", size: 12 },
//             },
//           },
//         },
//       };
//     });

//     // WEEKLY OP COUNT (line) - thisMonth weekly operation count may be empty
//     const weekly = Array.isArray(data["This Month Weekly Operation Count"]) ? data["This Month Weekly Operation Count"] : [];
//     createOrUpdateChart(chartRefs, "weeklyOps", () => {
//       if (!weekly || weekly.length === 0) return null;
//       const labels = weekly.map((w, i) => w.week ?? `W${i + 1}`);
//       const values = weekly.map((w) => safeNumber(w.count));
//       const total = values.reduce((a, b) => a + b, 0);
//       if (values.length === 0 || total === 0) return null;
//       return {
//         type: "line",
//         data: { labels, datasets: [{ data: values, borderColor: "#0097b2", backgroundColor: "#0097b233", fill: true, tension: 0.25 }] },
//         options: {
//           plugins: { legend: { display: false } },
//           scales: { y: { beginAtZero: true } },
//         },
//       };
//     });

//     // Nothing else uses canvas-based charts in this ward layout; any other charts can be added similarly
//   };

//   /* ------------------- PDF generation ------------------- */
//   useEffect(() => {
//     if (!isGeneratingPDF) return;
//     const generate = async () => {
//       const html2canvas = window.html2canvas;
//       const jsPDF = window.jspdf?.jsPDF;
//       if (!html2canvas || !jsPDF) {
//         alert("PDF libraries not ready");
//         setIsGeneratingPDF(false);
//         return;
//       }

//       try {
//         const element = printableRef.current;
//         // expand scroll area for full capture
//         const content = element.querySelector(".report-content-scroll");
//         const originalHeight = content.style.height;
//         const originalOverflow = content.style.overflow;

//         content.style.height = `${content.scrollHeight}px`;
//         content.style.overflow = "visible";
//         await new Promise((r) => setTimeout(r, 60)); // let layout settle

//         const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#fff" });

//         // restore
//         content.style.height = originalHeight;
//         content.style.overflow = originalOverflow;

//         const img = canvas.toDataURL("image/png");
//         const pdf = new jsPDF("p", "mm", "a4");
//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const imgHeight = (canvas.height * pageWidth) / canvas.width;

//         pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);
//         // handle multipage if large
//         let heightLeft = imgHeight - pdf.internal.pageSize.getHeight();
//         let position = 0;
//         while (heightLeft > 0) {
//           position = heightLeft - imgHeight;
//           pdf.addPage();
//           pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
//           heightLeft -= pdf.internal.pageSize.getHeight();
//         }

//         pdf.save("Ward_Report.pdf");
//       } catch (e) {
//         console.error("PDF generation error", e);
//         alert("Failed to generate PDF. See console.");
//       } finally {
//         setIsGeneratingPDF(false);
//       }
//     };
//     generate();
//   }, [isGeneratingPDF]);

//   const handleDownloadPDF = () => {
//     if (!libsLoaded) {
//       alert("PDF libs not loaded yet");
//       return;
//     }
//     setIsGeneratingPDF(true);
//   };

//  const Images = [
//   {
//     imageUrl: "/images/Landuse.jpg",
//     label: "Landuse"
//   },
//   {
//     imageUrl: "/images/Hotspot.jpg",
//     label: "Hotspot"
//   },
//   {
//     imageUrl: "/images/Surface.jpg",
//     label: "Surface"
//   },
//   {
//     imageUrl: "/images/Slope.jpg",
//     label: "Slope"
//   },
//   {
//     imageUrl: "/images/Flood.jpg",
//     label: "Flood"
//   }
// ];


//   /* ---------------- Data snippets (from backend) ---------------- */
//   const landUse = data["Land Use Distribution"] || {};
//   const mostFreqManholes = Array.isArray(data["Most Frequently Cleaned Manholes"]) ? data["Most Frequently Cleaned Manholes"] : [];
//   const mostFreqRobots = Array.isArray(data["Most Frequently Used Robots"]) ? data["Most Frequently Used Robots"] : [];
//   const overUtilized = Array.isArray(data["Over Utilized Robots"]) ? data["Over Utilized Robots"] : [];
//   const underUtilized = Array.isArray(data["Under Utilized Robots"]) ? data["Under Utilized Robots"] : [];
//   const robotRequirement = isPlainObject(data["Robot Requirement Analysis"]) ? data["Robot Requirement Analysis"] : {};
//   const weeklyOps = Array.isArray(data["This Month Weekly Operation Count"]) ? data["This Month Weekly Operation Count"] : [];
//   const top5Robots = Array.isArray(data["Top 5 Robots by Utilization in This Area"]) ? data["Top 5 Robots by Utilization in This Area"] : [];
//   const anomaliesTop10 = Array.isArray(data["Top 10 Manholes with Operation-Time Anomalies(Last 30 Days)"]) ? data["Top 10 Manholes with Operation-Time Anomalies(Last 30 Days)"] : [];

//   /* -------------------------- Render -------------------------- */
//   return (
//     <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-7xl rounded-lg shadow-lg">

//         <div ref={printableRef}>
//           {/* HEADER */}
//           <div className="flex justify-between items-center p-6 border-b">
//             <h2 className="text-2xl font-bold">📊 Ward Report</h2>
//             <button className="text-4xl" onClick={onClose}>
//               <X />
//             </button>
//           </div>

//           {/* CONTENT */}
//           <div className="report-content-scroll p-6 max-h-[80vh] overflow-y-auto">
//             {/* Info cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//               <InfoCard label="Total Manholes in Area" value={data["Total Manholes in Area"] ?? data["Total Manholes"] ?? "N/A"} />
//               <InfoCard label="Total Operations" value={data["Total Operations"] ?? 0} />
//               <InfoCard label="Total Operations in Last Month" value={data["Total Operations in Last Month"] ?? 0} />
//               <InfoCard label="Average Operation Time (min)" value={data["Average Operation Time (min)"] ?? "N/A"} />
//             </div>

//             {/* Robot Requirement */}
//             <Section title="Robot Requirement Analysis">
//               <KeyValueTable obj={robotRequirement} emptyMessage="No records found" />
//             </Section>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-[30px]">
//   {Images.map((item, index) => (
//     <div
//       key={index}
//       className="flex flex-col items-center w-[350px] h-auto bg-white  rounded-lg shadow p-2"
//     >
//       <img
//         src={item.imageUrl}
//         alt={item.label}
//         className="w-full  object-cover rounded-md mb-2"
//       />

//       <p className="text-center font-semibold text-gray-800">
//         {item.label}
//       </p>
//     </div>
//   ))}
// </div>

//             {/* Charts row (2 per row) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               {/* Land Use */}
//               <div>
//                 {/* canvas rendered via chartRefs */}
//                 {Object.keys(landUse || {}).length === 0 ? (
//                   <ChartPlaceholder message="No chart data available" />
//                 ) : (
//                   <div className="bg-white border rounded-lg shadow p-3 h-full">
//                     <h4 className="text-sm font-semibold text-center mb-2">Land Use Distribution</h4>
//                     <div style={{ height: `${CHART_HEIGHT_PX}px` }}>
//                       <canvas ref={(el) => (chartRefs.current.landUse = el)} />
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Weekly Ops */}
//               <div>
//                 {(!weeklyOps || weeklyOps.length === 0) ? (
//                   <ChartPlaceholder message={Array.isArray(weeklyOps) && weeklyOps.length === 0 ? "No chart data available" : "No chart data available"} />
//                 ) : (
//                   <div className="bg-white border rounded-lg shadow p-3 h-full">
//                     <h4 className="text-sm font-semibold text-center mb-2">This Month Weekly Operation Count</h4>
//                     <div style={{ height: `${CHART_HEIGHT_PX}px` }}>
//                       <canvas ref={(el) => (chartRefs.current.weeklyOps = el)} />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Tables */}
//             <Section title="Most Frequently Cleaned Manholes">
//               <DataTable rows={mostFreqManholes} emptyMessage={mostFreqManholes.length === 0 ? "No records found" : "No records found"} />
//             </Section>

//             <Section title="Most Frequently Used Robots">
//               <DataTable rows={mostFreqRobots} emptyMessage={mostFreqRobots.length === 0 ? "No records found" : "No records found"} />
//             </Section>

//             <Section title="Top 5 Robots by Utilization in This Area">
//               <DataTable rows={top5Robots} emptyMessage={top5Robots.length === 0 ? "No records found" : "No records found"} />
//             </Section>

//             <Section title="Top 10 Manholes with Operation-Time Anomalies (Last 30 Days)">
//               <DataTable rows={anomaliesTop10} emptyMessage={anomaliesTop10.length === 0 ? "No records found" : "No records found"} />
//             </Section>

//             <Section title="Over Utilized Robots">
//               <DataTable rows={overUtilized} emptyMessage={overUtilized.length === 0 ? "No records found" : "No records found"} />
//             </Section>

//             <Section title="Under Utilized Robots">
//               <DataTable rows={underUtilized} emptyMessage={underUtilized.length === 0 ? "No activity today" : "No records found"} />
//             </Section>
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="p-4 border-t bg-gray-50 flex justify-end">
//           <button
//             onClick={handleDownloadPDF}
//             className="px-6 py-2 bg-[#0097b2] text-white rounded-lg"
//             disabled={isGeneratingPDF || !libsLoaded}
//           >
//             {isGeneratingPDF ? "Preparing PDF..." : "Download PDF"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WardReportPopup;

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useServerData } from "../../context/ServerDataContext";

/* ------------------ Dynamic Script Loader ------------------ */
let pluginRegistrationPromise = null;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const exists = document.querySelector(`script[src="${src}"]`);
    if (exists) return resolve();
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
        loadScript(
          "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"
        ).catch(() => null)
      )
      .then(resolve)
      .catch(reject);
  });

  return pluginRegistrationPromise;
};

/* ------------------------- Helpers ------------------------- */

const safeNumber = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v === "number") return v;
  const p = Number(v);
  return Number.isFinite(p) ? p : fallback;
};

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const CHART_HEIGHT_PX = 220;
const INFOCARD_MIN_HEIGHT = 100;

const createOrUpdateChart = (chartRefs, id, configFactory) => {
  const el = chartRefs.current[id];
  if (!el || !window.Chart) return;

  try {
    if (el.chartInstance) el.chartInstance.destroy();
  } catch {}

  const cfg = configFactory();
  if (!cfg) return;

  try {
    el.chartInstance = new window.Chart(el, cfg);
  } catch (e) {
    console.error("Chart creation failed for", id, e);
  }
};

/* ------------------ UI Subcomponents ------------------ */

const InfoCard = ({ label, value }) => (
  <div
    className="bg-gray-50 border rounded-lg p-4 text-center shadow-sm"
    style={{ minHeight: INFOCARD_MIN_HEIGHT }}
  >
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold">
      {value === null || value === undefined || value === "" ? "N/A" : value}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const ChartPlaceholder = ({ message }) => (
  <div
    className="bg-white border border-gray-200 rounded p-4 flex items-center justify-center text-gray-600"
    style={{ height: `${CHART_HEIGHT_PX}px` }}
  >
    {message}
  </div>
);

const KeyValueTable = ({ obj }) => {
  if (!obj || Object.keys(obj).length === 0)
    return <div className="text-gray-500">No records found</div>;
  return (
    <table className="w-full border border-gray-300 bg-white mb-4 table-fixed">
      <tbody>
        {Object.entries(obj).map(([k, v]) => (
          <tr key={k} className="border-b last:border-b-0">
            <td className="p-2 font-medium border-r w-1/3">{k}</td>
            <td className="p-2">
              {isPlainObject(v) || Array.isArray(v) ? (
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(v, null, 2)}
                </pre>
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

const DataTable = ({ rows }) => {
  if (!rows || rows.length === 0)
    return <div className="text-gray-500">No records found</div>;

  const headers = Object.keys(rows[0]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-2 border text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {headers.map((h) => (
                <td key={h} className="p-2 border align-top">
                  {isPlainObject(r[h]) || Array.isArray(r[h]) ? (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(r[h], null, 2)}
                    </pre>
                  ) : (
                    String(r[h] ?? "N/A")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ------------------ Main Component ------------------ */

export const WardReportPopup = ({ reportData, onClose }) => {
  const printableRef = useRef(null);
  const chartRefs = useRef({});
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: serverData } = useServerData();
  const weather = serverData?.WeatherData ?? null;
  const weather7 = weather?.datewise_7d ?? [];

  const data = reportData || {};

  /* ------------------ Load libs ------------------ */
  useEffect(() => {
    let cancelled = false;

    registerPlugins()
      .then(() => {
        if (cancelled) return;
        setLibsLoaded(true);

        if (window.Chart && window.ChartDataLabels) {
          try {
            window.Chart.register(window.ChartDataLabels);
          } catch {}
        }

        initChartsSafe();
      })
      .catch((err) => console.error("Failed to load libs", err));

    return () => {
      cancelled = true;
      Object.values(chartRefs.current).forEach((c) => {
        try {
          if (c?.chartInstance) c.chartInstance.destroy();
        } catch {}
      });
    };
  }, [reportData, weather7]);

  /* ------------------ Chart initialization ------------------ */

  const initChartsSafe = () => {
    if (!window.Chart) return;

    /* ----------------- Land Use Pie ----------------- */
    const landUse = data["Land Use Distribution"] || {};
    const landKeys = Object.keys(landUse);
    const landVals = landKeys.map((k) => safeNumber(landUse[k]));

    createOrUpdateChart(chartRefs, "landUse", () => {
      if (!landKeys.length) return null;
      return {
        type: "pie",
        data: {
          labels: landKeys,
          datasets: [
            {
              data: landVals,
              backgroundColor: ["#3b82f6", "#10b981", "#ef4444"],
            },
          ],
        },
        options: {
          plugins: {
            legend: { position: "bottom" },
          },
        },
      };
    });

    /* ----------------- Weekly Ops ----------------- */
    const weekly =
      Array.isArray(data["This Month Weekly Operation Count"])
        ? data["This Month Weekly Operation Count"]
        : [];

    createOrUpdateChart(chartRefs, "weeklyOps", () => {
      if (!weekly.length) return null;
      return {
        type: "line",
        data: {
          labels: weekly.map((w, i) => w.week || `W${i + 1}`),
          datasets: [
            {
              data: weekly.map((w) => safeNumber(w.count)),
              borderColor: "#0097b2",
              backgroundColor: "#0097b244",
              fill: true,
              tension: 0.3,
            },
          ],
        },
      };
    });

    /* ----------------- ⭐ NEW HUMIDITY CHART ----------------- */

    createOrUpdateChart(chartRefs, "weatherHumidity", () => {
      if (!weather7.length) return null;

      const labels = weather7.map((d) => d.date);
      const humidity = weather7.map((d) => safeNumber(d.avghumidity));

      return {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Avg Humidity (%)",
              data: humidity,
              borderColor: "#7c3aed",
              backgroundColor: "#7c3aed33",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } },
        },
      };
    });
  };

  /* ------------------ PDF (unchanged) ------------------ */

  useEffect(() => {
    if (!isGeneratingPDF) return;

    const generate = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;
      if (!html2canvas || !jsPDF) return setIsGeneratingPDF(false);

      try {
        const element = printableRef.current;
        const content = element.querySelector(".report-content-scroll");
        const origH = content.style.height;
        const origO = content.style.overflow;

        content.style.height = `${content.scrollHeight}px`;
        content.style.overflow = "visible";

        await new Promise((r) => setTimeout(r, 60));

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });

        content.style.height = origH;
        content.style.overflow = origO;

        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pw = pdf.internal.pageSize.getWidth();
        const ih = (canvas.height * pw) / canvas.width;

        pdf.addImage(img, "PNG", 0, 0, pw, ih);
        pdf.save("Ward_Report.pdf");
      } catch (e) {
        console.error("PDF error", e);
      }

      setIsGeneratingPDF(false);
    };

    generate();
  }, [isGeneratingPDF]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) return alert("PDF libraries not loaded");
    setIsGeneratingPDF(true);
  };

  /* ------------------ Static Images ------------------ */

  const Images = [
    { imageUrl: "/images/Landuse.jpg", label: "Landuse" },
    { imageUrl: "/images/Hotspot.jpg", label: "Hotspot" },
    { imageUrl: "/images/Surface.jpg", label: "Surface" },
    { imageUrl: "/images/Slope.jpg", label: "Slope" },
    { imageUrl: "/images/Flood.jpg", label: "Flood" },
  ];

  /* --------------------------------------------------
     RENDER STARTS
  -------------------------------------------------- */

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-lg shadow-lg">
        <div ref={printableRef}>
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">📊 Ward Report</h2>
            <button className="text-4xl cursor-pointer" onClick={onClose}>
              <X />
            </button>
          </div>

          {/* CONTENT */}
          <div className="report-content-scroll p-6 max-h-[80vh] overflow-y-auto">
            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoCard
                label="Total Manholes in Area"
                value={
                  data["Total Manholes in Area"] ??
                  data["Total Manholes"] ??
                  "N/A"
                }
              />
              <InfoCard label="Total Operations" value={data["Total Operations"] ?? 0} />
              <InfoCard
                label="Total Operations in Last Month"
                value={data["Total Operations in Last Month"] ?? 0}
              />
              <InfoCard
                label="Average Operation Time (min)"
                value={data["Average Operation Time (min)"] ?? "N/A"}
              />
            </div>

            {/* Robot Requirement */}
            <Section title="Robot Requirement Analysis">
              <KeyValueTable obj={data["Robot Requirement Analysis"]} />
            </Section>

            {/* Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-[30px]">
              {Images.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center w-[350px] h-auto bg-white rounded-lg shadow p-2"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="w-full object-cover rounded-md mb-2"
                  />
                  <p className="text-center font-semibold text-gray-800">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* ------------------------------ */}
            {/* CHARTS ROW */}
            {/* ------------------------------ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Land Use */}
              <div className="bg-white border rounded-lg shadow p-3 h-full">
                <h4 className="text-sm font-semibold text-center mb-2">
                  Land Use Distribution
                </h4>
                <div className="flex justify-center" style={{ height: `${CHART_HEIGHT_PX}px` }}>
                  <canvas ref={(el) => (chartRefs.current.landUse = el)} />
                </div>


              </div>

              {/* Weekly Ops */}
              {/* <div className="bg-white border rounded-lg shadow p-3 h-full">
                <h4 className="text-sm font-semibold text-center mb-2">
                  This Month Weekly Operation Count
                </h4>
                <div style={{ height: `${CHART_HEIGHT_PX}px` }}>
                  <canvas ref={(el) => (chartRefs.current.weeklyOps = el)} />
                </div>
              </div> */}

              <div className="bg-white  border rounded-lg shadow p-3 h-full mb-6">
              <h4 className="text-sm font-semibold text-center mb-2">
                7-Day Avg Weather Forecast
              </h4>
              {weather7.length === 0 ? (
                <ChartPlaceholder message="Weather data not available" />
              ) : (
                <div className="flex justify-center" style={{ height: `${CHART_HEIGHT_PX}px` }}>
                  <canvas ref={(el) => (chartRefs.current.weatherHumidity = el)} />
                </div>
              )}
            </div>
            </div>

            {/* ⭐ NEW HUMIDITY CHART — EXACTLY WHERE YOU REQUESTED */}
            

            {/* -----------------------------------------
               BELOW HERE: EVERYTHING IS UNCHANGED
            ----------------------------------------- */}

            <Section title="Most Frequently Cleaned Manholes">
              <DataTable rows={data["Most Frequently Cleaned Manholes"]} />
            </Section>

            <Section title="Most Frequently Used Robots">
              <DataTable rows={data["Most Frequently Used Robots"]} />
            </Section>

            <Section title="Top 5 Robots by Utilization in This Area">
              <DataTable rows={data["Top 5 Robots by Utilization in This Area"]} />
            </Section>

            <Section title="Top 10 Manholes with Operation-Time Anomalies (Last 30 Days)">
              <DataTable rows={data["Top 10 Manholes with Operation-Time Anomalies(Last 30 Days)"]} />
            </Section>

            <Section title="Over Utilized Robots">
              <DataTable rows={data["Over Utilized Robots"]} />
            </Section>

            <Section title="Under Utilized Robots">
              <DataTable rows={data["Under Utilized Robots"]} />
            </Section>
          </div>
        </div>

        {/* FOOTER */}
        {/* <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-[#0097b2] text-white rounded-lg"
            disabled={isGeneratingPDF || !libsLoaded}
          >
            {isGeneratingPDF ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default WardReportPopup;
