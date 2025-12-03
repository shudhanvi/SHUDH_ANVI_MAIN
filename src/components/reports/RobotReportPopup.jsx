
// import { X } from 'lucide-react';
// import React, { useEffect, useRef, useState } from 'react';
// // import { Chart, registerables } from 'chart.js'; // <-- REMOVED
// // Removed imports for: ChartDataLabels, html2canvas, jsPDF

// // Chart.register(...registerables); // <-- REMOVED

// // --- Script Loading and Plugin Registration (Copied from WardReportPopup) ---
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


// export const RobotReportPopup = ({ reportData, onClose }) => {
//   const chartRefs = useRef({});
//   const printableRef = useRef(); 
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
//   const [libsLoaded, setLibsLoaded] = useState(false);
//   const isSingle = reportData.analysis_type === 'robot_individual';
//   const data = reportData.data;

//   // --- useEffect to lock body scroll ---
//   useEffect(() => {
//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = originalOverflow || 'auto';
//     };
//   }, []); 

//   // Create charts
//   const createChart = (id, type, labels, values, options = {}, colors = []) => {
//     const ctx = chartRefs.current[id]; // <-- Now gets ref from callback
//     if (!ctx) return;

//     if (ctx.chartInstance) {
//       ctx.chartInstance.destroy();
//     }

//     // --- FIX: Use window.Chart ---
//     if (!window.Chart) {
//       console.error("Chart.js not loaded on window!");
//       return;
//     }

//     ctx.chartInstance = new window.Chart(ctx, { // <-- Use window.Chart
//       type,
//       data: {
//         labels,
//         datasets: [
//           {
//             label: '',
//             data: values,
//             backgroundColor: colors.length ? colors : '#3b82f6',
//             borderRadius: 4
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         animation: false,
//         plugins: {
//           legend: { position: 'bottom' },
//           datalabels: { // <-- Config was already correct
//             display: true, // <-- Make sure this is true
//             color: type === 'pie' ? '#fff' : '#4b5563',
//             font: { weight: 'bold' },
//             formatter: (val, ctx) => {
//               if (type === 'pie') {
//                 const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
//                 return total > 0 ? `${((val / total) * 100).toFixed(1)}%` : '';
//               }
//               return val;
//             }
//           },
//           ...options.plugins
//         },
//         scales: options.scales
//       }
//       // No local plugins array needed
//     });
//   };

//   useEffect(() => {
//     // Chart creation logic
//     const createCharts = () => {
//       if (data['Operations by Blockage Level']) {
//         createChart('opsBlockageChart', 'pie', Object.keys(data['Operations by Blockage Level']), Object.values(data['Operations by Blockage Level']), {}, ['#ef4444', '#fbbf24', '#22c55e']);
//       }
//       if (isSingle && data['Performance Comparison vs All Robots']) {
//         createChart('performanceTimeChart', 'bar', ['Robot', 'All Robots'], [data['Performance Comparison vs All Robots']['Robot Avg Operation Time'], data['Performance Comparison vs All Robots']['All Robots Avg Operation Time']], { scales: { y: { beginAtZero: true } } });
//         createChart('performanceWasteChart', 'bar', ['Robot', 'All Robots'], [data['Performance Comparison vs All Robots']['Robot Avg Waste'], data['Performance Comparison vs All Robots']['All Robots Avg Waste']], { scales: { y: { beginAtZero: true } } });
//       }
//       if (!isSingle && data['Top 5 Performing Robots']) {
//         createChart('topRobotsChart', 'bar', data['Top 5 Performing Robots'].map(r => r['Robot ID']), data['Top 5 Performing Robots'].map(r => r['Efficiency (waste/min)']), { scales: { y: { beginAtZero: true } } });
//       }
//     };
//     
//     registerPlugins().then(() => {
//       setLibsLoaded(true);

//       // --- ADDED: Manual registration (from WardReportPopup) ---
//       if (window.Chart && window.ChartDataLabels) {
//         try {
//           // Try to register it. This might throw an error if already registered.
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
//       createCharts(); // Attempt to create charts anyway (might fail)
//     });
//     
//     return () => {
//       Object.values(chartRefs.current).forEach(ref => {
//         if (ref?.chartInstance) {
//           ref.chartInstance.destroy();
//           ref.chartInstance = null;
//         }
//       });
//     };
//   }, [reportData, data, isSingle]); // Dependencies remain the same

//   // useEffect for PDF Generation
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
//         pdf.save(`Robot-Report-${new Date().toISOString().split('T')[0]}.pdf`);
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

//   // PDF Download Handler
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

//   return (
//     // Main overlay is CENTERED, not scrolling
//     <div className="fixed inset-0 bg-black/50 z-[9999] p-4 flex justify-center items-center">
//       {/* This white box is the popup itself */}
//       <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">

//         {/* --- NEW: Wrapper for printable content --- */}
//         {/* The ref is now here */}
//         <div ref={printableRef}>
//           {/* Header (NOW INSIDE THE REF) */}
//           <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-[#e5e7eb]">
//             <h2 className="text-2xl font-bold text-[#1f2937]">
//               🤖 Robot {isSingle ? 'Individual' : 'Aggregate'} Analysis
//             </h2>
//             {/* --- ADDED 'no-print-pdf' CLASS --- */}
//             <button onClick={onClose} className="text-black text-[20px] font-bold no-print-pdf cursor-pointer"><X/></button>
//           </div>

//           {/* Scrollable Content Area */}
//           <div
//             // --- ADDED 'report-content-scroll' CLASS ---
//             className={`report-content-scroll bg-white p-6 ${!isGeneratingPDF ? 'overflow-y-auto custom-scrollbar max-h-[80vh]' : 'overflow-visible h-auto'}`}
//           >
//             {/* Top Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
//               <InfoCard title="Total Operations" value={data['Total Operations']} />
//               <InfoCard title="Avg Operation Time" value={`${data['Average Operation Time (min)']?.toFixed(2)} min`} />
//               <InfoCard title="Avg Waste Collected" value={`${data['Average Waste Collected (kg)']} kg`} />
//               <InfoCard title="Efficiency (waste/min)" value={data['Efficiency Ratio (waste/min)']} />
//               {isSingle && <InfoCard title="Total Operation Time" value={`${data['Total Operation Time (min)']} min`} />}
//             </div>
//             {/* Timeline */}
//             {isSingle && (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <InfoCard title="Last Operation Date" value={data['Last Operation Date']} />
//                 <InfoCard title="Next Operation Date" value={data['Next Operation Date']} />
//                 <InfoCard title="Days Since / Until" value={`${data['Days Since Last Operation']} / ${data['Days Until Next Operation']}`} />
//               </div>
//             )}
//             {/* Charts (ADDED chartRef prop) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
//               <ChartCard 
//                 title="Operations by Blockage Level" 
//                 chartId="opsBlockageChart" 
//                 chartRef={el => chartRefs.current.opsBlockageChart = el} 
//               />
//               {isSingle && (
//                 <>
//                   <ChartCard 
//                     title="Avg Operation Time Comparison" 
//                     chartId="performanceTimeChart" 
//                     chartRef={el => chartRefs.current.performanceTimeChart = el} 
//                   />
//                   <ChartCard 
//                     title="Avg Waste Comparison" 
//                     chartId="performanceWasteChart"
//                     chartRef={el => chartRefs.current.performanceWasteChart = el} 
//                   />
//                 </>
//               )}
//               {!isSingle && 
//                 <ChartCard 
//                   title="Top 5 Performing Robots" 
//                   chartId="topRobotsChart" 
//                   chartRef={el => chartRefs.current.topRobotsChart = el} 
//                 />
//               }
//             </div>
//             {/* Top 5 Manholes */}
//             {data['Top 5 Manholes Handled'] && (
//               <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-lg p-6 mt-8">
//                 <h2 className="text-lg font-semibold border-l-4 border-[#3b82f6] pl-3 mb-4">Top 5 Manholes Handled</h2>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-[#e5e7eb] border border-[#d1d5db] rounded-lg">
//                     <thead className="bg-[#f9fafb]">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider border-r border-[#d1d5db]">Manhole ID</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider border-r border-[#d1d5db]">Avg Operation Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider border-r border-[#d1d5db]">Waste Collected</th>
//                         {!isSingle && <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">Robot IDs</th>}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-[#e5e7eb]">
//                       {data['Top 5 Manholes Handled'].map((row, idx) => (
//                         <tr key={idx} className="hover:bg-[#f9fafb] transition">
//                           <td className="px-6 py-4 whitespace-nowrap border-r border-[#d1d5db]">{row['Manhole ID']}</td>
//                           <td className="px-6 py-4 whitespace-nowrap border-r border-[#d1d5db]">{row['Avg Operation Time (min)']}</td>
//                           <td className="px-6 py-4 whitespace-nowrap border-r border-[#d1d5db]">{row['Waste Collected (kg)']}</td>
//                           {!isSingle && <td className="px-6 py-4 whitespace-nowrap">{row['Robot IDs']?.join(', ')}</td>}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//   .            </div>
//             )}
//           </div>
//         </div> 
//         {/* --- End of printable wrapper --- */}


//         {/* Footer (NOW OUTSIDE THE REF) */}
//         <div className="flex-shrink-0 flex justify-end p-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg no-print">
//           <button 
//             onClick={handleDownloadPDF} 
//             className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A] disabled:opacity-50 cursor-pointer"
//             disabled={isGeneratingPDF || !libsLoaded}
//           >
//             {isGeneratingPDF ? "Generating..." : (!libsLoaded ? "Loading Libs..." : "Download PDF")}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Helper Subcomponents (STYLES UPDATED) ---
// const InfoCard = ({ title, value }) => (
//   <div className="bg-[#f9fafb] rounded-lg p-4 text-center border border-[#e5e7eb]">
//     <p className="text-sm text-[#6b7280] font-medium">{title}</p>
//     <p className="text-2xl font-bold text-[#111827]">{value || 'N/A'}</p>
//   </div>
// );

// // --- UPDATED ChartCard to accept chartRef ---
// const ChartCard = ({ title, chartId, chartRef }) => (
//   <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-md p-4">
//     <h3 className="m-0 mb-3 text-base text-center font-semibold text-[#1f2937]">{title}</h3>
//     <div className="h-64 md:h-80 relative">
//       <canvas 
//         id={chartId} 
//         ref={chartRef} // <-- ADDED REF
//         className="absolute top-0 left-0 w-full h-full"
//       ></canvas>
//     </div>
//   </div>
// );

// export default RobotReportPopup;


import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// --- Script Loading & Plugin Registration ---
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

export const RobotReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});
  const printableRef = useRef(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // FIXED: Data is NOT inside .data anymore
  const data = reportData;

  const isSingle = true; // Always single robot in new API

  console.log("Received Robot Report:", data);

  // Prevent background scroll
  useEffect(() => {
   const orig = document.body.style.overflow;
   document.body.style.overflow = "hidden";
   return () => (document.body.style.overflow = orig);
  }, []);

  // -----------------------------
  // Chart Creator
  // -----------------------------
  const createChart = (id, type, labels, values, options = {}, colors = []) => {
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
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { position: "bottom" },
          datalabels: {
            display: true,
            color: type === "pie" ? "#fff" : "#374151",
            font: { weight: "bold" },
            formatter: (value, ctx) => {
              if (type === "pie") {
                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
              }
              return value;
            }
          }
        },
        scales: options.scales
      }
    });
  };

  // -----------------------------
  // Initialize Charts
  // -----------------------------
  useEffect(() => {
    const initCharts = () => {
      // Pie: Blockage operations (IF EXISTS)
      if (data["Operations by Blockage Level"]) {
        createChart(
          "opsBlockageChart",
          "pie",
          Object.keys(data["Operations by Blockage Level"]),
          Object.values(data["Operations by Blockage Level"]),
          {},
          ["#ef4444", "#fbbf24", "#22c55e"]
        );
      }

      // Compare Robot vs Fleet
      if (data["Robot Avg Op Time vs Fleet Avg"]) {
        const comp = data["Robot Avg Op Time vs Fleet Avg"];
        createChart(
          "performanceTimeChart",
          "bar",
          ["Robot Avg", "Fleet Avg"],
          [comp["Robot Avg"], comp["Fleet Avg"]],
          { scales: { y: { beginAtZero: true } } }
        );
      }
    };

    registerPlugins()
      .then(() => {
        setLibsLoaded(true);

        if (window.Chart && window.ChartDataLabels) {
          try {
            window.Chart.register(window.ChartDataLabels);
          } catch {}
        }

        initCharts();
      })
      .catch(() => initCharts());

    return () => {
      Object.values(chartRefs.current).forEach((c) => c?.chartInstance?.destroy());
    };
  }, [data]);

  // -----------------------------
  // PDF Generator (Your Working Logic)
  // -----------------------------
  useEffect(() => {
    if (!isGeneratingPDF) return;

    const generatePdf = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;

      const element = printableRef.current;
      const scrollArea = element.querySelector(".report-content-scroll");

      if (!html2canvas || !jsPDF) {
        alert("PDF libraries not ready");
        setIsGeneratingPDF(false);
        return;
      }

      const origHeight = scrollArea.style.height;
      const origOverflow = scrollArea.style.overflow;

      scrollArea.style.height = `${scrollArea.scrollHeight}px`;
      scrollArea.style.overflow = "visible";

      await new Promise((r) => setTimeout(r, 50));

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#fff",
          ignoreElements: (el) => el.classList.contains("no-print-pdf")
        });

        scrollArea.style.height = origHeight;
        scrollArea.style.overflow = origOverflow;

        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        let leftHeight = height;

        pdf.addImage(img, "PNG", 0, 0, width, height);
        leftHeight -= pdf.internal.pageSize.getHeight();

        while (leftHeight > 0) {
          pdf.addPage();
          pdf.addImage(img, "PNG", 0, leftHeight - height, width, height);
          leftHeight -= pdf.internal.pageSize.getHeight();
        }

        pdf.save(`Robot-Report-${data["Robot ID"]}.pdf`);
      } catch (e) {
        console.error("PDF Error", e);
      }

      setIsGeneratingPDF(false);
    };

    generatePdf();
  }, [isGeneratingPDF]);

  const handleDownloadPDF = () => {
    if (!libsLoaded) return alert("PDF libraries still loading...");
    setIsGeneratingPDF(true);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] p-4 flex justify-center items-center">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl flex flex-col relative">

        <div ref={printableRef}>
          {/* HEADER */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold">
              🤖 Robot Report – {data["Robot ID"]}
            </h2>
            <button onClick={onClose} className="text-3xl font-bold cursor-pointer no-print-pdf">
              <X />
            </button>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className={`report-content-scroll p-6 ${isGeneratingPDF ? "overflow-visible" : "overflow-y-auto max-h-[80vh]"}`}>

            {/* METRIC CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <InfoCard title="Robot ID" value={data["Robot ID"]} />
              <InfoCard title="Total Ops" value={data["Total Operations"]} />
              <InfoCard title="Avg Op Time" value={`${data["Average Operation Time (min)"]} min`} />
              <InfoCard title="Total Op Time" value={`${data["Total Operation Time (min)"]} min`} />
              <InfoCard title="Utilization" value={`${data["Robot Utilization %"]} %`} />
            </div>

            {/* FLEET COMPARISON */}
            {data["Robot Avg Op Time vs Fleet Avg"] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <ChartCard
                  title="Robot vs Fleet Avg Time"
                  chartId="performanceTimeChart"
                  chartRef={(el) => (chartRefs.current.performanceTimeChart = el)}
                />
              </div>
            )}

            {/* RECENT ACTIVITY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <InfoCard title="Last Manhole" value={data["Last Manhole Handled"]} />
              <InfoCard title="Last Op Date" value={data["Last Operation Date"]} />
              <InfoCard title="Next Expected Op" value={data["Next Expected Operation Date"]} />
            </div>

            {/* BLOCKAGE PIE */}
            {data["Operations by Blockage Level"] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ChartCard
                  title="Operations By Blockage Level"
                  chartId="opsBlockageChart"
                  chartRef={(el) => (chartRefs.current.opsBlockageChart = el)}
                />
              </div>
            )}

            {/* TOP 5 MANHOLES */}
            {data["Top 5 Manholes Handled"] && (
              <div className="bg-white border rounded-lg shadow p-6 mt-8">
                <h2 className="text-lg font-semibold border-l-4 border-blue-500 pl-3 mb-3">
                  Top 5 Manholes Handled
                </h2>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Manhole / Operation</th>
                      <th className="p-2 border">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data["Top 5 Manholes Handled"].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border">{row["Operations"]}</td>
                        <td className="p-2 border">{row["count"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end p-4 border-t bg-gray-50 no-print-pdf">
          <button
            disabled={!libsLoaded || isGeneratingPDF}
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ title, value }) => (
  <div className="p-4 bg-gray-50 border rounded text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="font-bold text-lg">{value ?? "N/A"}</p>
  </div>
);

const ChartCard = ({ title, chartId, chartRef }) => (
  <div className="p-4 bg-white border rounded shadow">
    <h3 className="text-center font-semibold mb-2">{title}</h3>
    <div className="relative h-64">
      <canvas id={chartId} ref={chartRef} className="absolute inset-0 w-full h-full"></canvas>
    </div>
  </div>
);

export default RobotReportPopup;
