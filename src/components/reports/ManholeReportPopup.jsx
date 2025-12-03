// import { X } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";
// // import Chart from "chart.js/auto"; // <-- REMOVED
// // Removed: ChartDataLabels, useReactToPrint

// // --- Script Loading and Plugin Registration ---
// let pluginRegistrationPromise = null;

// const loadScript = (src) => {
//   return new Promise((resolve, reject) => {
//     const existingScript = document.querySelector(`script[src="${src}"]`);
//     if (existingScript) {
//       resolve();
//       return;
//     }
//     const script = document.createElement('script');
//     script.src = src;
//     script.async = true;
//     script.onload = resolve;
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// };

// const registerPlugins = () => {
//   if (pluginRegistrationPromise) {
//     return pluginRegistrationPromise;
//   }
//   // --- UPDATED loading logic ---
//   pluginRegistrationPromise = new Promise((resolve, reject) => {
//     // Load all non-dependent libs in parallel
//     const libsPromise = Promise.all([
//         loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
//         loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
//     ]);
//     
//     // --- FIX: Load Chart.js from CDN *first* ---
//     loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
//       .then(() => {
//         // --- Now window.Chart exists, load plugin which will auto-register ---
//         return loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js");
//       })
//       .then(() => {
//         // Wait for the other libs to be done, then resolve all
//         return libsPromise;
//       })
//       .then(() => resolve())
//       .catch(reject); // Catch any error from the chain
//   });
//   return pluginRegistrationPromise;
// };
// // --- End of Script Loading ---


// export const ManholeReportPopup = ({ reportData, onClose }) => {
//   const printableRef = useRef();
//   const chartCanvasRefs = useRef({}); // <-- Stores <canvas> elements
//   const chartInstanceRefs = useRef({}); // <-- Stores Chart.js instances
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
//   const [libsLoaded, setLibsLoaded] = useState(false);

//   // --- useEffect to lock body scroll ---
//   useEffect(() => {
//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = originalOverflow || 'auto';
//     };
//   }, []);

//   useEffect(() => {
//     if (!reportData?.data) return;

//     // Chart creation logic
//     const createCharts = () => {
//       // --- Safety check for Chart.js global ---
//       if (!window.Chart) {
//         console.error("Chart.js not loaded on window!");
//         return;
//       }

//       const createPie = (id, obj) => {
//         if (!obj) return;
//         const labels = Object.keys(obj);
//         const data = Object.values(obj);
//         const colors = ["#60a5fa", "#22c55e", "#ef4444", "#06b6d4", "#a855f7", "#3b82f6"];
//         
//         // --- Get canvas element from ref ---
//         const ctx = chartCanvasRefs.current[id];
//         if (!ctx) return;

//         // --- Destroy old INSTANCE ---
//         if (chartInstanceRefs.current[id]) chartInstanceRefs.current[id].destroy();

//         // --- Create new instance with window.Chart ---
//         chartInstanceRefs.current[id] = new window.Chart(ctx, {
//           type: "pie",
//           data: { labels, datasets: [{ data, backgroundColor: colors }] },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             animation: false, // For PDF
//             plugins: {
//               legend: { position: "bottom" },
//               datalabels: {
//                 display: true, // <-- Ensure display is true
//                 color: "#fff",
//                 formatter: (v, ctx) => {
//                   const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
//                   return total ? `${((v / total) * 100).toFixed(1)}%` : "";
//                 },
//               },
//             },
//           },
//         });
//       };

//       const createBar = (id, obj, label) => {
//         if (!obj) return;
//         const labels = Object.keys(obj);
//         const data = Object.values(obj);
//         
//         // --- Get canvas element from ref ---
//         const ctx = chartCanvasRefs.current[id];
//         if (!ctx) return;

//         // --- Destroy old INSTANCE ---
//         if (chartInstanceRefs.current[id]) chartInstanceRefs.current[id].destroy();

//         // --- Create new instance with window.Chart ---
//         chartInstanceRefs.current[id] = new window.Chart(ctx, {
//           type: "bar",
//           data: { labels, datasets: [{ label, data, backgroundColor: "#60a5fa" }] },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             animation: false, // For PDF
//             plugins: { 
//               legend: { display: false }, 
//               datalabels: { 
//                 display: true, // <-- Ensure display is true
//                 anchor: "end", 
//                 align: "top",
//                 color: "#4b5563" // <-- Added color for bar charts
//               } 
//             },
//             scales: { y: { beginAtZero: true } },
//           },
//         });
//       };

//       // --- MULTIPLE MANHOLES ---
//       if (reportData.analysis_type === "manhole_aggregate") {
//         const d = reportData.data;
//         createPie("condPie", d["Manhole Condition Distribution"]);
//         createPie("junctionPie", d["Junction Type Distribution"]);
//         createPie("sewerPie", d["Sewer Length by Area Distribution"]);
//         createPie("wastePie", d["Waste Collected(Kg) by Blockage Level"]);
//         createBar("cloggingBar", d["Clogging Incidents by Junction Type"], "Incidents");
//       }

//       // --- SINGLE MANHOLE ---
//       if (reportData.analysis_type === "manhole_individual") {
//         const d = reportData.data;
//         createPie("blockagePie", d["Waste Collected(kg) by Blockage Level"]);
//       }
//     };
//     
//     // Load libs, then create charts
//     registerPlugins().then(() => {
//       setLibsLoaded(true);

//       // --- ADDED: Manual registration (from other popups) ---
//       if (window.Chart && window.ChartDataLabels) {
//         try {
//           window.Chart.register(window.ChartDataLabels);
//         } catch (e) {
//           console.warn("Could not re-register datalabels plugin (this is probably fine):", e.message);
//         }
//       } else {
//         console.error("Chart.js or ChartDataLabels plugin not found on window object after loading!");
//       }
//       // --------------------------------------------------------

//       createCharts();
//     }).catch(err => {
//       console.error("Failed to load external libraries:", err);
//       createCharts(); 
//     });

//     // Cleanup
//     return () => {
//       // --- Updated to destroy from chartInstanceRefs ---
//       Object.values(chartInstanceRefs.current).forEach(chart => {
//         if (chart) chart.destroy();
//       });
//       chartInstanceRefs.current = {};
//       chartCanvasRefs.current = {}; // Also clear canvas refs
//     };
//   }, [reportData]);

//   // --- useEffect for PDF Generation (No changes needed, already uses window) ---
//   useEffect(() => {
//     if (!isGeneratingPDF) {
//       return;
//     }

//     const generatePdf = async () => {
//       const html2canvas = window.html2canvas;
//       const jsPDF = window.jspdf?.jsPDF;
//       const element = printableRef.current;
//       const contentElement = element.querySelector('.report-content-scroll');

//       if (!html2canvas || !jsPDF || !element || !contentElement) {
//         console.error("Libs or element not ready");
//         setIsGeneratingPDF(false); 
//         return;
//       }
//       
//       const originalHeight = contentElement.style.height;
//       const originalOverflow = contentElement.style.overflow;

//       contentElement.style.height = `${contentElement.scrollHeight}px`; 
//       contentElement.style.overflow = 'visible';

//       await new Promise(r => setTimeout(r, 50));

//       try {
//         const canvas = await html2canvas(element, {
//           scale: 2,
//           useCORS: true,
//           allowTaint: true,
//           ignoreElements: (el) => el.classList.contains('no-print-pdf')
//         });

//         contentElement.style.height = originalHeight;
//         contentElement.style.overflow = originalOverflow;

//         const imgData = canvas.toDataURL("image/png");
//         const pdf = new jsPDF("p", "mm", "a4");
//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const pageHeight = pdf.internal.pageSize.getHeight();
//         const imgProps = pdf.getImageProperties(imgData);
//         const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
//         let heightLeft = pdfHeight;
//         let position = 0;

//         pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
//         heightLeft -= pageHeight;

//         while (heightLeft > 0) {
//           position = heightLeft - pdfHeight;
//           pdf.addPage();
//           pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfHeight);
//           heightLeft -= pageHeight;
//         }
//         pdf.save(`Manhole-Report-${new Date().toISOString().split('T')[0]}.pdf`);
//       } catch (error) {
//         console.error("PDF generation error:", error);
//         contentElement.style.height = originalHeight; 
//         contentElement.style.overflow = originalOverflow;
//       } finally {
//         setIsGeneratingPDF(false);
//       }
//     };

//     generatePdf(); 
//   }, [isGeneratingPDF]);

//   // --- PDF Download Handler (No changes needed) ---
//   const handleDownloadPDF = () => {
//     if (isGeneratingPDF || !libsLoaded) {
//       if (!libsLoaded) {
//          console.error("PDF generation libraries are not loaded.");
//          alert("PDF libraries are not loaded yet. Please try again in a moment.");
//       }
//       return;
//     }
//     setIsGeneratingPDF(true);
//   };

//   if (!reportData) return null;

//   const d = reportData.data || {};
//   const isAggregate = reportData.analysis_type === "manhole_aggregate";

//   return (
//     // Main overlay, centered
//     <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-[9999] p-4">
//       {/* Popup container */}
//       <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
//         
//         {/* --- Printable Wrapper (Ref is here) --- */}
//         <div ref={printableRef}>
//           {/* Header (Inside wrapper) */}
//           <div className="flex justify-between items-center bg-white px-6 py-4 rounded-t-lg">
//             <div>
//               <h1 className="text-2xl font-bold">
//                 {isAggregate
//                   ? `Aggregate Report (${reportData.manholes_analyzed} Manholes)`
//                   : `Manhole Report - ${d["Manhole ID"] || "N/A"}`}
//               </h1>
//               <p className="text-sm opacity-90">
//                 {isAggregate
//                   ? "Consolidated analysis across multiple manholes"
//                   : "Detailed individual manhole analysis"}
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-[20px] font-bold text-black no-print-pdf cursor-pointer"
//             >
//               <X />
//             </button>
//           </div>

//           {/* Printable/Scrollable Area (Inside wrapper) */}
//           <div
//             className={`report-content-scroll bg-[#f9fafb] p-6 ${
//               !isGeneratingPDF ? 'overflow-y-auto max-h-[80vh] custom-scrollbar' : 'overflow-visible h-auto'
//             }`}
//           >
//             {isAggregate ? (
//               <>
//                 {/* Summary cards */}
//                 <div className="grid md:grid-cols-3 gap-4 mb-6">
//                   <InfoCard title="Total Manholes" value={d["Total Manholes"]} />
//                   <InfoCard title="Total Operations" value={d["Total Operations"]} />
//                   <InfoCard title="Total Waste (kg)" value={d["Total Waste Collected (kg)"]} />
//                 </div>

//                 {/* Charts */}
//                 <h2 className="text-2xl font-bold text-center bg-[#f3f4f6] text-[#1f2937] py-3 rounded mb-6">
//                   Aggregate Analysis
//                 </h2>

//                 {/* --- UPDATED to pass chartRef --- */}
//                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                   <ChartCard title="Manhole Condition Distribution" id="condPie" chartRef={el => chartCanvasRefs.current.condPie = el} />
//                   <ChartCard title="Junction Type Distribution" id="junctionPie" chartRef={el => chartCanvasRefs.current.junctionPie = el} />
//                   <ChartCard title="Sewer Length by Area" id="sewerPie" chartRef={el => chartCanvasRefs.current.sewerPie = el} />
//                   <ChartCard title="Waste by Blockage Level" id="wastePie" chartRef={el => chartCanvasRefs.current.wastePie = el} />
//                   <ChartCard title="Clogging by Junction Type" id="cloggingBar" chartRef={el => chartCanvasRefs.current.cloggingBar = el} />
//                 </div>
//               </>
//             ) : (
//               <>
//                 {/* Individual manhole details */}
//                 <div className="grid md:grid-cols-3 gap-4 mb-6">
//                   <InfoCard title="Manhole ID" value={d["Manhole ID"]} />
//                   <InfoCard title="Condition" value={d["Condition"]} />
//                   <InfoCard title="Junction Type" value={d["Junction Type"]} />
//                   <InfoCard title="Depth (m)" value={d["Depth (m)"]} />
//                   <InfoCard title="Installation Year" value={d["Installation Year"]} />
//                   <InfoCard title="Land Use Type" value={d["Land Use Type"]} />
//                 </div>

//                 {/* Operation Info */}
//                 <div className="bg-white rounded-xl shadow border border-[#e5e7eb] p-4 mb-6">
//                   <h2 className="text-lg font-semibold border-l-4 border-[#3b82f6] text-[#1f2937] pl-2 mb-3">
//                     Operation Summary
//                   </h2>
//                   <table className="w-full text-left border border-[#e5e7eb] text-sm">
//                     <tbody>
//                       <tr className="border-t border-[#e5e7eb]">
//                         <th className="p-2 font-medium text-[#1f2937]">Number of Operations</th>
//                         <td className="p-2 text-[#374151]">{d["Number of Operations"]}</td>
//                       </tr>
//                       <tr className="border-t border-[#e5e7eb]">
//                         <th className="p-2 font-medium text-[#1f2937]">Last Operation Date</th>
//                         <td className="p-2 text-[#374151]">{d["Last Operation Date"]}</td>
//                </tr>
//                       <tr className="border-t border-[#e5e7eb]">
//                         <th className="p-2 font-medium text-[#1f2937]">Predicted Next Cleaning Date</th>
//                         <td className="p-2 text-[#374151]">{d["Predicted Next Cleaning Date"]}</td>
//                       </tr>
//                    <tr className="border-t border-[#e5e7eb]">
//                         <th className="p-2 font-medium text-[#1f2937]">Time Since Last Operation (days)</th>
//                         <td className="p-2 text-[#374151]">{d["Time Since Last Operation (days)"]}</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Charts */}
//                 <h2 className="text-2xl font-bold text-center bg-[#f3f4f6] text-[#1f2937] py-3 rounded mb-6">
//                   Individual Manhole Analysis
//                 </h2>

//                 {/* --- UPDATED to pass chartRef --- */}
//                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                   <ChartCard title="Waste Collected by Blockage Level" id="blockagePie" chartRef={el => chartCanvasRefs.current.blockagePie = el} />
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//         {/* --- End of Printable Wrapper --- */}


//   {/* Footer (Outside wrapper) */}
//         <div className="flex justify-end p-4 border-t border-[#e5e7eb] bg-[#f3f4f6] rounded-b-lg">
//           <button
//             onClick={handleDownloadPDF}
//             className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A] disabled:opacity-50 cursor-pointer"
//             disabled={isGeneratingPDF || !libsLoaded}
//           >
//            {isGeneratingPDF ? "Loading..." : (!libsLoaded ? "Loading Libs..." : "Download PDF")}   </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Sub Components (STYLES FIXED) ---

// const InfoCard = ({ title, value }) => (
//   <div className="bg-white border border-[#e5e7eb] shadow rounded-xl flex flex-col justify-center items-center p-4">
//     <h3 className="font-semibold text-[#1f2937] text-lg">{value ?? "N/A"}</h3>
//     <p className="text-[#6b7280] text-sm">{title}</p>
//   </div>
// );

// // --- UPDATED to accept chartRef ---
// const ChartCard = ({ title, id, chartRef }) => (
//   <div className="bg-white rounded-xl shadow border border-[#e5e7eb] p-4 text-center">
//   <h3 className="font-semibold text-[#1f2937] mb-3">{title}</h3>
//     {/* Added positioning for canvas */}
//     <div className="relative h-64 w-full">
//       <canvas 
//         id={id} 
//         ref={chartRef} // <-- Added ref callback
//         className="absolute top-0 left-0 w-full h-full"
//       ></canvas>
//     </div>
//   </div>
// );
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
