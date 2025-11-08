// import React, { useEffect, useRef } from "react";
// import { X } from 'lucide-react';
// import Chart from 'chart.js/auto'; // Using 'chart.js/auto' registers all basic components
// import ChartDataLabels from 'chartjs-plugin-datalabels';

// // Manually register the datalabels plugin once globally
// Chart.register(ChartDataLabels);

// // --- Helper function for small delays (optional, kept for good practice) ---
// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // --- Print CSS Styles (Unchanged, relies on media query) ---
// const addPrintStyles = () => {
//   const styleId = "ward-report-print-styles";
//   if (document.getElementById(styleId)) return;

//   const style = document.createElement("style");
//   style.id = styleId;
//   style.innerHTML = `
//     @media print {
//       * {
//         -webkit-print-color-adjust: exact !important;
//         print-color-adjust: exact !important;
//         box-shadow: none !important;
//       }

//       @page {
//         size: A4 portrait;
//         margin: 10mm; 
//       }

//       body {
//         background: #fff !important;
//         margin: 0 !important;
//         padding: 0 !important;
//         position: static !important;
//       }

//       body * {
//         visibility: hidden !important;
//       }

//       .print-overlay,
//       .print-overlay * {
//         visibility: visible !important;
//       }

//       /* Reset Print Containers to 0,0 */
//       .print-overlay {
//         position: absolute !important; 
//         top: 0 !important;
//         left: 0 !important;
//         right: 0 !important;
//         bottom: 0 !important;
//         margin: 0 !important;
//         padding: 0 !important;
//         display: block !important;
//       }

//       .printable-popup {
//         position: static !important;
//         width: 100% !important;
//         max-width: 100% !important;
//         border-radius: 0 !important;
//         box-shadow: none !important;
//         overflow: visible !important;
//         margin: 0 !important;
//         padding: 0 !important;
//       }
      
//       /* Ensure header starts at top */
//       .printable-popup > div:first-child {
//         padding-top: 0 !important;
//         padding-left: 1.5rem !important; 
//         padding-right: 1.5rem !important; 
//         border-bottom: 1px solid #ccc !important;
//       }

//       .report-content-scroll {
//         max-height: none !important;
//         overflow: visible !important;
//         padding-top: 1.5rem !important; 
//       }
      
//       /* FIX INFO CARD LAYOUT: Force 4 columns on print, reduced gap */
//       .printable-popup .info-card-grid {
//         display: grid !important;
//         grid-template-columns: repeat(4, 1fr) !important;
//         gap: 4px !important; 
//         margin-bottom: 1rem !important;
//       }
      
//       .printable-popup .chart-grid {
//         display: grid !important;
//         grid-template-columns: 1fr 1fr !important;
//         gap: 8mm !important;
//       }
//       .printable-popup .table-container {
//         page-break-inside: avoid !important;
//       }
//       .page-break {
//         page-break-before: always !important;
//       }
      
//       .no-print {
//         display: none !important;
//       }

//       /* Chart Sizing */
//       .chart-card {
//         page-break-inside: avoid !important;
//         height: 75mm !important; 
//       }
//       .chart-card canvas {
//         position: static !important;
//         height: 100% !important;
//         max-width: 100% !important;
//       }
      
//       /* Table borders ensured */
//       table {
//         table-layout: fixed !important;
//         width: 100% !important;
//       }
//       table, thead, tbody, tr, th, td {
//         border-color: #ccc !important;
//         border: 1px solid #ccc !important;
//       }
//     }
//   `;
//   document.head.appendChild(style);
// };
// // --- End of Print CSS ---


// export const WardReportPopup = ({ reportData, onClose }) => {
//   const chartRefs = useRef({});
//   const printableRef = useRef(null); 
//   const data = reportData?.data || {};

//   // --- useEffect to lock body scroll and set up print styles ---
//   useEffect(() => {
//     addPrintStyles();
//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = originalOverflow || 'auto';
//       const style = document.getElementById('ward-report-print-styles');
//       if (style) {
//         style.parentNode.removeChild(style);
//       }
//     };
//   }, []);

//   const createChart = (id, type, labels, values, colors = [], options = {}) => {
//     const ctx = chartRefs.current[id]; 
//     if (!ctx) return;
//     if (ctx.chartInstance) ctx.chartInstance.destroy();

//     // Now uses the imported Chart object directly
//     ctx.chartInstance = new Chart(ctx, { 
//       type,
//       data: { labels, datasets: [{ label: "", data: values, backgroundColor: colors.length ? colors : "#3b82f6", borderRadius: 4 }] },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         animation: false,
//         plugins: {
//           legend: { position: "bottom" },
//           datalabels: { 
//             display: true, 
//             color: type === "pie" ? "#fff" : "#4b5563",
//             font: { weight: "bold" },
//             formatter: (val, ctx) => {
//               if (type === 'pie') {
//                 const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
//                 return total > 0 ? `${((val / total) * 100).toFixed(1)}%` : "";
//               }
//               return val;
//             },
//           },
//           ...options.plugins,
//         },
//         scales: options.scales,
//       },
//     });
//   };

//   useEffect(() => {
//     // Chart creation runs immediately after mounting
//     if (data["Manhole Condition Distribution"]) createChart("manholeConditionChart", "pie", Object.keys(data["Manhole Condition Distribution"]), Object.values(data["Manhole Condition Distribution"]), ["#22c55e", "#3b82f6", "#eab308", "#ef4444"]);
//     if (data["Land Use Distribution"]) createChart("landUseChart", "pie", Object.keys(data["Land Use Distribution"]), Object.values(data["Land Use Distribution"]), ["#14b8a6", "#0ea5e9", "#10b981", "#8b5cf6"]);
//     if (data["Sewer Length by Area"]) createChart("sewerLengthChart", "bar", Object.keys(data["Sewer Length by Area"]), Object.values(data["Sewer Length by Area"]), ["#3b82f6", "#06b6d4", "#22c55e", "#8b5cf6"], { scales: { y: { beginAtZero: true } } });
//     if (data["Junction Type Distribution"]) createChart("junctionTypeChart", "pie", Object.keys(data["Junction Type Distribution"]), Object.values(data["Junction Type Distribution"]), ["#3b82f6", "#0ea5e9", "#10b981", "#8b5cf6", "#f97316"]);
//     if (data["Clogging Incidents by Junction Type"]) createChart("cloggingChart", "bar", Object.keys(data["Clogging Incidents by Junction Type"]), Object.values(data["Clogging Incidents by Junction Type"]), ["#ef4444", "#f43f5e", "#fb7185", "#3b82f6", "#22c55e"], { scales: { y: { beginAtZero: true } } });
//     if (data["Daily Operations (Last 30 Days)"]) createChart("dailyOpsChart", "line", data["Daily Operations (Last 30 Days)"].map(d => d.Date), data["Daily Operations (Last 30 Days)"].map(d => d.Operations), ["#3b82f6"], { scales: { y: { beginAtZero: true } } });
    
//     // Cleanup
//     return () => {
//       Object.values(chartRefs.current).forEach(ref => {
//         if (ref?.chartInstance) {
//           ref.chartInstance.destroy();
//           ref.chartInstance = null;
//         }
//       });
//     };
//   }, [data]);

//   const handlePrint = () => {
    
//     // Force chart sizing before print
//     Object.values(chartRefs.current).forEach(ref => {
//       if (ref?.chartInstance) {
//         ref.chartInstance.resize();
//         ref.chartInstance.update('none'); 
//       }
//     });

//     // Short delay to ensure redraw completes
//     setTimeout(() => {
//         window.print();
//     }, 100);
//   };

//   return (
//     // Main overlay, centered (used to control visibility during printing)
//     <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.6)] flex justify-center items-center p-4 print-overlay">
//       {/* Popup container - WIDTH CONSTRAINED TO MAX-W-3XL */}
//       <div className="bg-white w-full max-w-[800px] rounded-lg shadow-lg relative flex flex-col printable-popup">
        
//         {/* Printable Wrapper */}
//         <div ref={printableRef} className="w-full">
          
//           {/* Header/Title Bar */}
//           <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-[#e5e7eb] pb-2">
//             <h2 className="text-2xl font-bold text-[#1f2937]">📊 Ward Report - Hasmathpet</h2>
//             <button 
//               onClick={onClose} 
//               className="text-[#111827] text-5xl no-print cursor-pointer"
//             >
//               <X />
//             </button>
//           </div>

//           {/* Printable/Scrollable Area */}
//           <div
//             className="report-content-scroll bg-white p-6 overflow-y-auto custom-scrollbar max-h-[80vh]"
//           >
//             {/* Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 info-card-grid">
//               <InfoCard label="Total Operations" value={data["Total Operations"]} />
//               <InfoCard label="Avg Operation Time (min)" value={data["Average Operation Time (min)"]} />
//               <InfoCard label="Avg Waste Collected (kg)" value={data["Average Waste Collected (kg)"]} />
//               <InfoCard label="Total Waste Collected (kg)" value={data["Total Waste Collected (kg)"]} />
//               <InfoCard label="Avg Blockage Level" value={`${data["Average Blockage Level (numeric)"] || 'N/A'} (${data["Average Blockage Level (text)"] || 'N/A'})`} />
//               <InfoCard label="Date Range" value={data["Date Range"] || 'N/A'} />
//             </div>


//             {/* Placeholder Images */}
//             <div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                   <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px] w-auto border" src="/images/Hotspot.jpg" alt="Hotspot"/><p>Hotspot</p></span>
//                   <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px] w-auto border" src="/images/Landuse.jpg" alt="Landuse"/><p>Landuse</p></span>
//                   <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px] w-auto border" src="/images/SewageNetwork.png" alt="Sewage Network"/><p>Sewage Network</p></span>
//                   <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px] w-auto border" src="/images/Surface.jpg" alt="Surface"/><p>Surface</p></span>
//               </div>
//             </div>


//             {/* Charts (UI Height h-72) */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-6 chart-grid">
//               <ChartCard title="Manhole Condition Distribution" chartId="manholeConditionChart" chartRef={el => chartRefs.current.manholeConditionChart = el} />
//               <ChartCard title="Land Use Distribution" chartId="landUseChart" chartRef={el => chartRefs.current.landUseChart = el} />
//               <ChartCard title="Sewer Length by Area" chartId="sewerLengthChart" chartRef={el => chartRefs.current.sewerLengthChart = el} />
//               <ChartCard title="Junction Type Distribution" chartId="junctionTypeChart" chartRef={el => chartRefs.current.junctionTypeChart = el} />
//               <ChartCard title="Clogging Incidents by Junction Type" chartId="cloggingChart" chartRef={el => chartRefs.current.cloggingChart = el} />
//               <ChartCard title="Daily Operations (Last 30 Days)" chartId="dailyOpsChart" chartRef={el => chartRefs.current.dailyOpsChart = el} />
//             </div>

//             {/* Tables (Forced to new page) */}
//             <div className="page-break space-y-6 mb-6">
//               <TableSection title="Top 5 Manholes by Cleaning Priority" data={data["Top 5 Manholes by Cleaning Priority"]} />
//               <TableSection title="Top 5 Robots by Performance" data={data["Top 5 Robots by Performance"]} />
//             </div>
//           </div>
//         </div>
        
//         {/* Footer */}
//         <div className="flex-shrink-0 flex justify-end p-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg no-print">
//           <button 
//             onClick={handlePrint} 
//             className="px-6 py-2 bg-[#1E9AB0] text-white rounded-lg hover:bg-[#187A8A] disabled:opacity-50 cursor-pointer"
//           >
//             Print Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Subcomponents
// const InfoCard = ({ label, value }) => (
//   <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 text-center shadow-sm">
//     <p className="text-sm text-[#6b7280] font-medium">{label}</p>
//     <p className="text-xl font-bold text-[#111827]">{value || 'N/A'}</p>
//   </div>
// );

// // Chart Card with increased height (h-72) and stabilized containment
// const ChartCard = ({ title, chartId, chartRef }) => (
//   <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm p-4 h-72 flex flex-col chart-card"> 
//     <h4 className="text-center font-semibold mb-2">{title}</h4>
//     <div className="relative flex-grow min-h-0"> 
//       <canvas
//         id={chartId}
//         ref={chartRef}
//         className="w-full h-full"
//       ></canvas>
//     </div>
//   </div>
// );

// const TableSection = ({ title, data }) => (
//   <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm p-5 table-container">
//     <h3 className="text-xl font-semibold mb-4 border-l-4 border-[#3b82f6] pl-2">{title}</h3>
//     <Table data={data} />
//   </div>
// );

// const Table = ({ data }) => {
//   if (!data || data.length === 0) return <div className="text-[#6b7280]">No data available.</div>;
//   const headers = Object.keys(data[0]);
//   return (
//     // table-fixed ensures column widths are respected within the 100% width
//     <table className="min-w-full border-collapse table-fixed"> 
//       <thead className="bg-[#f9fafb]">
//         <tr>{headers.map((h,i) => <th key={i} className="px-4 py-2 text-left border border-[#d1d5db] text-[#374151] font-semibold">{h}</th>)}</tr>
//       </thead>
//       <tbody>
//         {data.map((row,idx) => (
//           <tr key={idx} className="hover:bg-[#f9fafb]">
//             {headers.map((h,i) => <td key={i} className="px-4 py-2 border border-[#d1d5db] text-[#1f2937]">{row[h]}</td>)}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default WardReportPopup;

import React, { useEffect, useRef, useState } from "react";
import { X } from 'lucide-react';
// import { Chart, registerables } from "chart.js"; // <-- REMOVED
// Removed static imports for ChartDataLabels, html2canvas, and jsPDF

// Register Chart.js components
// Chart.register(...registerables); // <-- REMOVED (will be loaded from CDN)

// --- Script Loading and Plugin Registration ---
let pluginRegistrationPromise = null;

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const registerPlugins = () => {
  if (pluginRegistrationPromise) {
    return pluginRegistrationPromise;
  }
  pluginRegistrationPromise = new Promise((resolve, reject) => {
    // Load all non-dependent libs in parallel
    const libsPromise = Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    ]);
    
    // --- FIX: Load Chart.js from CDN *first* ---
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js")
      .then(() => {
        // --- Now window.Chart exists, load plugin which will auto-register ---
        return loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js");
      })
      .then(() => {
        // Wait for the other libs to be done, then resolve all
        return libsPromise;
      })
      .then(() => resolve())
      .catch(reject); // Catch any error from the chain
  });
  return pluginRegistrationPromise;
};
// --- End of Script Loading ---


export const WardReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});
  const printableRef = useRef(null); 
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  const data = reportData?.data || {};

  // --- useEffect to lock body scroll ---
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, []);

  const createChart = (id, type, labels, values, colors = [], options = {}) => {
    const ctx = chartRefs.current[id]; 
    if (!ctx) return;
    if (ctx.chartInstance) ctx.chartInstance.destroy();

    // --- FIX: Use window.Chart ---
    if (!window.Chart) {
      console.error("Chart.js not loaded on window!");
      return;
    }

    ctx.chartInstance = new window.Chart(ctx, { // <-- Use window.Chart
      type,
      data: { labels, datasets: [{ label: "", data: values, backgroundColor: colors.length ? colors : "#3b82f6", borderRadius: 4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { position: "bottom" },
          datalabels: { // The config is still here
            display: true, 
            color: type === "pie" ? "#fff" : "#4b5563",
            font: { weight: "bold" },
            formatter: (val, ctx) => {
              if (type === 'pie') {
                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                return total > 0 ? `${((val / total) * 100).toFixed(1)}%` : "";
              }
              return val;
            },
          },
          ...options.plugins,
        },
        scales: options.scales,
      },
      // No local plugin array needed, it's auto-registered
    });
  };

  useEffect(() => {
    // chartRefs are populated by the ref prop in <ChartCard>

    const createCharts = () => {
      if (data["Manhole Condition Distribution"]) createChart("manholeConditionChart", "pie", Object.keys(data["Manhole Condition Distribution"]), Object.values(data["Manhole Condition Distribution"]), ["#22c55e", "#3b82f6", "#eab308", "#ef4444"]);
      if (data["Land Use Distribution"]) createChart("landUseChart", "pie", Object.keys(data["Land Use Distribution"]), Object.values(data["Land Use Distribution"]), ["#14b8a6", "#0ea5e9", "#10b981", "#8b5cf6"]);
      if (data["Sewer Length by Area"]) createChart("sewerLengthChart", "bar", Object.keys(data["Sewer Length by Area"]), Object.values(data["Sewer Length by Area"]), ["#3b82f6", "#06b6d4", "#22c55e", "#8b5cf6"], { scales: { y: { beginAtZero: true } } });
      if (data["Junction Type Distribution"]) createChart("junctionTypeChart", "pie", Object.keys(data["Junction Type Distribution"]), Object.values(data["Junction Type Distribution"]), ["#3b82f6", "#0ea5e9", "#10b981", "#8b5cf6", "#f97316"]);
      if (data["Clogging Incidents by Junction Type"]) createChart("cloggingChart", "bar", Object.keys(data["Clogging Incidents by Junction Type"]), Object.values(data["Clogging Incidents by Junction Type"]), ["#ef4444", "#f43f5e", "#fb7185", "#3b82f6", "#22c55e"], { scales: { y: { beginAtZero: true } } });
      if (data["Daily Operations (Last 30 Days)"]) createChart("dailyOpsChart", "line", data["Daily Operations (Last 30 Days)"].map(d => d.Date), data["Daily Operations (Last 30 Days)"].map(d => d.Operations), ["#3b82f6"], { scales: { y: { beginAtZero: true } } });
    };

    // Load libs, then create charts
    registerPlugins().then(() => {
      setLibsLoaded(true);

      // --- FIX: Manually register the plugin *just in case* auto-register failed ---
      if (window.Chart && window.ChartDataLabels) {
        try {
          // Try to register it. This might throw an error if already registered.
          window.Chart.register(window.ChartDataLabels);
        } catch (e) {
          console.warn("Could not re-register datalabels plugin (this is probably fine):", e.message);
        }
      } else {
        console.error("Chart.js or ChartDataLabels plugin not found on window object after loading!");
      }
      // --------------------------------------------------------------------------

      // createCharts is now called *after* global registration is complete (or attempted)
      createCharts();
    }).catch(err => {
      console.error("Failed to load external libraries:", err);
      createCharts(); 
    });

    // Cleanup
    return () => {
      Object.values(chartRefs.current).forEach(ref => {
        if (ref?.chartInstance) {
          ref.chartInstance.destroy();
          ref.chartInstance = null;
        }
      });
    };
  }, [data]);

  // --- useEffect for PDF Generation ---
  useEffect(() => {
    if (!isGeneratingPDF) {
      return;
    }

    const generatePdf = async () => {
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf?.jsPDF;
      const element = printableRef.current;
      const contentElement = element.querySelector('.report-content-scroll');

      if (!html2canvas || !jsPDF || !element || !contentElement) {
        console.error("Libs or element not ready");
        setIsGeneratingPDF(false); 
        return;
      }
      
      const originalHeight = contentElement.style.height;
      const originalOverflow = contentElement.style.overflow;

      contentElement.style.height = `${contentElement.scrollHeight}px`; 
      contentElement.style.overflow = 'visible';

      await new Promise(r => setTimeout(r, 50));

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#fff", 
          ignoreElements: (el) => el.classList.contains('no-print-pdf')
        });

        contentElement.style.height = originalHeight;
        contentElement.style.overflow = originalOverflow;

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
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
      } catch (error) {
        console.error("PDF generation error:", error);
        contentElement.style.height = originalHeight; 
        contentElement.style.overflow = originalOverflow;
      } finally {
        setIsGeneratingPDF(false);
      }
    };

    generatePdf(); 

  }, [isGeneratingPDF]);

  // --- PDF Download Handler ---
  const handleDownloadPDF = () => {
    if (isGeneratingPDF || !libsLoaded) {
      if (!libsLoaded) {
         console.error("PDF generation libraries are not loaded.");
         alert("PDF libraries are not loaded yet. Please try again in a moment.");
      }
      return;
    }
    setIsGeneratingPDF(true);
  };

  return (
    // Main overlay, centered
    <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.6)] flex justify-center items-center p-4">
      {/* Popup container */}
      <div className="bg-white w-full max-w-7xl rounded-lg shadow-lg relative flex flex-col">
        
        {/* --- Printable Wrapper (Ref is here) --- */}
        <div ref={printableRef}>
          {/* Header (Inside wrapper) */}
          <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-[#e5e7eb] pb-2">
            <h2 className="text-2xl font-bold text-[#1f2937]">📊 Ward Report - Hasmathpet</h2>
            <button 
              onClick={onClose} 
              className="text-[#111827] text-5xl no-print-pdf cursor-pointer "
            >
              <X />
            </button>
          </div>

          {/* Printable/Scrollable Area (Inside wrapper) */}
          <div
            className={`report-content-scroll bg-white p-6 ${
              !isGeneratingPDF ? 'overflow-y-auto custom-scrollbar max-h-[80vh]' : 'overflow-visible h-auto '
            }`}
          >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Total Operations" value={data["Total Operations"]} />
              <InfoCard label="Avg Operation Time (min)" value={data["Average Operation Time (min)"]} />
              <InfoCard label="Avg Waste Collected (kg)" value={data["Average Waste Collected (kg)"]} />
              <InfoCard label="Total Waste Collected (kg)" value={data["Total Waste Collected (kg)"]} />
              <InfoCard label="Avg Blockage Level" value={`${data["Average Blockage Level (numeric)"] || 'N/A'} (${data["Average Blockage Level (text)"] || 'N/A'})`} />
              <InfoCard label="Date Range" value={data["Date Range"] || 'N/A'} />
            </div>


         <div>
            <div className="flex justify-evenly pb-[25px]">
                <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px]" src="/images/Hotspot.jpg"/><p>Hotspot</p></span>
                <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px]" src="/images/Landuse.jpg"/><p>Landuse</p></span>
            </div>
            <div className="flex justify-evenly pb-[25px]">
                <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px]" src="/images/SewageNetwork.png"/><p>Sewage Network</p></span>
                <span className="p-2 items-center justify-center shadow-md bg-white rounded-[10px] flex flex-col"><img className="h-[220px]" src="/images/Surface.jpg"/><p>Surface</p></span>
            </div>
         </div>


            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-6">
              <ChartCard title="Manhole Condition Distribution" chartId="manholeConditionChart" chartRef={el => chartRefs.current.manholeConditionChart = el} />
              <ChartCard title="Land Use Distribution" chartId="landUseChart" chartRef={el => chartRefs.current.landUseChart = el} />
              <ChartCard title="Sewer Length by Area" chartId="sewerLengthChart" chartRef={el => chartRefs.current.sewerLengthChart = el} />
              <ChartCard title="Junction Type Distribution" chartId="junctionTypeChart" chartRef={el => chartRefs.current.junctionTypeChart = el} />
              <ChartCard title="Clogging Incidents by Junction Type" chartId="cloggingChart" chartRef={el => chartRefs.current.cloggingChart = el} />
              <ChartCard title="Daily Operations (Last 30 Days)" chartId="dailyOpsChart" chartRef={el => chartRefs.current.dailyOpsChart = el} />
            </div>

            {/* Tables */}
            <div className="space-y-6 mb-6">
              <TableSection title="Top 5 Manholes by Cleaning Priority" data={data["Top 5 Manholes by Cleaning Priority"]} />
              <TableSection title="Top 5 Robots by Performance" data={data["Top 5 Robots by Performance"]} />
            </div>
          </div>
        </div>
        {/* --- End of Printable Wrapper --- */}

        {/* Footer (Outside wrapper) */}
        <div className="flex-shrink-0 flex justify-end p-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg">
          <button 
            onClick={handleDownloadPDF} 
            className="px-6 py-2 bg-[#1E9AB0] text-white rounded-lg hover:bg-[#187A8A] disabled:opacity-50 cursor-pointer no-print-pdf"
            disabled={isGeneratingPDF || !libsLoaded}
          >
            {isGeneratingPDF ? "Loading...." : (!libsLoaded ? "Loading Libs..." : "Download PDF")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Subcomponents
const InfoCard = ({ label, value }) => (
  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 text-center shadow-sm">
    <p className="text-sm text-[#6b7280] font-medium">{label}</p>
    <p className="text-xl font-bold text-[#111827]">{value || 'N/A'}</p>
  </div>
);

const ChartCard = ({ title, chartId, chartRef }) => (
  <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm p-4 h-74 flex flex-col">
    <h4 className="text-center font-semibold mb-2">{title}</h4>
    <div className="relative flex-grow">
      <canvas
        id={chartId}
        ref={chartRef} // This callback assigns the element to chartRefs.current[chartId]
        className="absolute top-0 left-0 w-full h-full"
      ></canvas>
    </div>
  </div>
);

const TableSection = ({ title, data }) => (
  <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm p-5">
    <h3 className="text-xl font-semibold mb-4 border-l-4 border-[#3b82f6] pl-2">{title}</h3>
    <Table data={data} />
  </div>
);

const Table = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-[#6b7280]">No data available.</div>;
  const headers = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#f9fafb]">
          <tr>{headers.map((h,i) => <th key={i} className="px-4 py-2 text-left border border-[#d1d5db] text-[#374151] font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row,idx) => (
            <tr key={idx} className="hover:bg-[#f9fafb]">
              {headers.map((h,i) => <td key={i} className="px-4 py-2 border border-[#d1d5db] text-[#1f2937]">{row[h]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WardReportPopup;
