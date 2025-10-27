// // import React from "react";

// // export const ManholeReportPopup = ({ reportData, onClose }) => {
// //   return (
// //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
// //       <div className="bg-white w-[80%] max-w-3xl rounded-lg shadow-xl p-6 relative">
// //         {/* Close Button */}
// //         <button
// //           onClick={onClose}
// //           className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
// //         >
// //           ✕
// //         </button>

// //         <h2 className="text-xl font-semibold text-gray-800 mb-4">
// //           📊 Manhole Report Data
// //         </h2>

// //         {/* Display backend data */}
// //         <div className="overflow-y-auto max-h-[400px]">
// //           <pre className="bg-gray-100 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
// //             {JSON.stringify(reportData, null, 2)}
// //           </pre>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };
// import React, { useEffect, useRef } from 'react';
// import Chart from 'chart.js/auto';
// import { useReactToPrint } from 'react-to-print';

// // Note: Ensure chartjs-plugin-datalabels is loaded via <script> in your index.html

// export const ManholeReportPopup = ({ reportData, onClose }) => {
//   const chartRefs = useRef({});
//   // ✅ FIX #1: This ref is essential for react-to-print
//   const printableComponentRef = useRef();

//   // --- Reusable Chart Drawing Logic ---
//   const updateChart = (id, type, labels, data, config) => {
//     // ✅ FIX #2: Always destroy the old chart before drawing a new one
//     // This prevents memory leaks and rendering errors.
//     if (chartRefs.current[id]) {
//       chartRefs.current[id].destroy();
//     }
//     const ctx = document.getElementById(id);
//     if (ctx) {
//       chartRefs.current[id] = new Chart(ctx, {
//         type,
//         data: { labels, datasets: [{ data, ...config }] },
//         options: { responsive: true, maintainAspectRatio: false, ...config.options },
//       });
//     }
//   };

//   const updatePieChart = (id, labels, data, colors) => {
//     updateChart(id, 'pie', labels, data, {
//       backgroundColor: colors,
//       options: { plugins: { legend: { position: 'bottom' }, datalabels: { color: '#fff', formatter: (v, ctx) => { const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0); return total > 0 ? `${(v / total * 100).toFixed(1)}%` : '0%'; } } } },
//     });
//   };

//   const updateBarChart = (id, labels, data, label) => {
//     updateChart(id, 'bar', labels, data, {
//       label,
//       backgroundColor: '#3b82f6',
//       options: { plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', color: '#4b5563' } }, scales: { y: { beginAtZero: true } } },
//     });
//   };

//   // --- Effect to Draw Charts from Aggregate Data ---
//   useEffect(() => {
//     if (reportData && reportData.data) {
//       // ✅ FIX #3: Delay chart drawing slightly with a timeout.
//       // This ensures the <canvas> elements are ready in the DOM before we try to draw on them.
//       const timer = setTimeout(() => {
//         const data = reportData.data;
//         const wasteData = data["Waste Collected(Kg) by Blockage Level"];
//         if (wasteData) updatePieChart('aggWastePie', Object.keys(wasteData), Object.values(wasteData), ['#f97316', '#eab308', '#ef4444']);
        
//         const conditionData = data["Manhole Condition Distribution"];
//         if (conditionData) updatePieChart('aggConditionPie', Object.keys(conditionData), Object.values(conditionData), ['#22c55e', '#60a5fa', '#ef4444', '#8b5cf6']);
        
//         const sewerData = data["Sewer Length by Area Distribution"];
//         if (sewerData) updatePieChart('aggSewerPie', Object.keys(sewerData), Object.values(sewerData), ['#3b82f6', '#14b8a6', '#a855f7', '#ec4899']);
        
//         const junctionData = data["Junction Type Distribution"];
//         if (junctionData) updateBarChart('aggJunctionBar', Object.keys(junctionData), Object.values(junctionData), 'Count');
        
//         const cloggingData = data["Clogging Incidents by Junction Type"];
//         if (cloggingData) updateBarChart('aggCloggingBar', Object.keys(cloggingData), Object.values(cloggingData), 'Incidents');
//       }, 100); // A small delay of 100ms is usually enough

//       // Cleanup function to clear the timer
//       return () => clearTimeout(timer);
//     }
//   }, [reportData]);

//   // ✅ FIX #4: Correctly configure the useReactToPrint hook
//   const handlePrint = useReactToPrint({
//     content: () => printableComponentRef.current,
//     documentTitle: `Aggregate-Manhole-Report-${new Date().toISOString().split('T')[0]}`
//   });

//   if (!reportData || !reportData.data) return null;

//   const summary = reportData.data;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//       <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-2xl font-bold text-gray-800">📈 Aggregate Manhole Analysis</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
//         </div>

//         {/* --- Scrollable & Printable Content --- */}
//         {/* The ref is attached to this div */}
//         <div ref={printableComponentRef} className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Key Metrics */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
//             <InfoCard title="Manholes Analyzed" value={summary["Total Manholes"]} />
//             <InfoCard title="Total Operations" value={summary["Total Operations"]} />
//             <InfoCard title="Waste Collected" value={`${summary["Total Waste Collected (kg)"]} kg`} />
//             <InfoCard title="Clogging Incidents" value={summary["Total Clogging Incidents Reported"]} />
//             <InfoCard title="Avg. Op Time" value={`${summary["Average Operation Time (min)"].toFixed(2)} min`} />
//           </div>

//           {/* Charts Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//             <ChartCard title="Waste by Blockage Level (Kg)" chartId="aggWastePie" />
//             <ChartCard title="Manhole Condition" chartId="aggConditionPie" />
//             <ChartCard title="Sewer Length by Area (km)" chartId="aggSewerPie" />
//             <ChartCard title="Junction Type Distribution" chartId="aggJunctionBar" />
//             <ChartCard title="Clogging Incidents by Junction" chartId="aggCloggingBar" />
//           </div>
//         </div>

//         {/* --- Footer & Print Button --- */}
//         <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
//           <button onClick={handlePrint} className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A]">
//             Print Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Helper Sub-components ---
// const InfoCard = ({ title, value }) => (
//   <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
//     <p className="text-sm text-gray-600 font-medium">{title}</p>
//     <p className="text-2xl font-bold text-gray-900">{value}</p>
//   </div>
// );

// const ChartCard = ({ title, chartId }) => (
//   <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
//     <h3 className="m-0 mb-3 text-base text-center font-semibold">{title}</h3>
//     <div className="h-64"><canvas id={chartId}></canvas></div>
//   </div>
// );

// import React, { useEffect, useRef } from 'react';
// import Chart from 'chart.js/auto';
// import { useReactToPrint } from 'react-to-print';

// export const ManholeReportPopup = ({ reportData, onClose }) => {
//   const chartRefs = useRef({});
//   const printableRef = useRef();

//   const drawPieChart = (id, labels, data, colors) => {
//     if (chartRefs.current[id]) chartRefs.current[id].destroy();
//     const ctx = document.getElementById(id);
//     if (ctx) {
//       chartRefs.current[id] = new Chart(ctx, {
//         type: 'pie',
//         data: { labels, datasets: [{ data, backgroundColor: colors }] },
//         options: {
//           responsive: true,
//           plugins: {
//             legend: { position: 'bottom' },
//             datalabels: {
//               color: '#fff',
//               formatter: (v, ctx) => {
//                 const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
//                 return total ? `${((v / total) * 100).toFixed(1)}%` : '0%';
//               },
//             },
//           },
//         },
//       });
//     }
//   };

//   const drawBarChart = (id, labels, data, label) => {
//     if (chartRefs.current[id]) chartRefs.current[id].destroy();
//     const ctx = document.getElementById(id);
//     if (ctx) {
//       chartRefs.current[id] = new Chart(ctx, {
//         type: 'bar',
//         data: { labels, datasets: [{ label, data, backgroundColor: '#3b82f6' }] },
//         options: {
//           responsive: true,
//           plugins: {
//             legend: { display: false },
//             datalabels: { anchor: 'end', align: 'top', color: '#4b5563' },
//           },
//           scales: { y: { beginAtZero: true } },
//         },
//       });
//     }
//   };

//   useEffect(() => {
//     if (!reportData?.data) return;
//     const data = reportData.data;

//     // Charts for individual manhole
//     if (reportData.analysis_type === 'manhole_individual') {
//       if (data["Waste Collected(kg) by Blockage Level"])
//         drawPieChart(
//           'singleWastePie',
//           Object.keys(data["Waste Collected(kg) by Blockage Level"]),
//           Object.values(data["Waste Collected(kg) by Blockage Level"]),
//           ['#f97316', '#eab308', '#ef4444']
//         );

//       if (data["Blockage Level Distribution"])
//         drawPieChart(
//           'singleBlockagePie',
//           Object.keys(data["Blockage Level Distribution"]),
//           Object.values(data["Blockage Level Distribution"]),
//           ['#ef4444', '#facc15', '#60a5fa']
//         );

//       if (data["Last 5 Operations Blockage Levels"])
//         drawBarChart(
//           'singleLastOpsBar',
//           data["Last 5 Operations Blockage Levels"].map((_, i) => `Op ${i + 1}`),
//           data["Last 5 Operations Blockage Levels"].map(level => {
//             if (level === 'high') return 3;
//             if (level === 'medium') return 2;
//             return 1;
//           }),
//           'Blockage Level'
//         );
//     }

//     // Charts for aggregate manholes
//     if (reportData.analysis_type === 'manhole_aggregate') {
//       setTimeout(() => {
//         if (data["Waste Collected(Kg) by Blockage Level"])
//           drawPieChart('aggWastePie', Object.keys(data["Waste Collected(Kg) by Blockage Level"]), Object.values(data["Waste Collected(Kg) by Blockage Level"]), ['#f97316', '#eab308', '#ef4444']);

//         if (data["Manhole Condition Distribution"])
//           drawPieChart('aggConditionPie', Object.keys(data["Manhole Condition Distribution"]), Object.values(data["Manhole Condition Distribution"]), ['#22c55e', '#60a5fa', '#ef4444', '#8b5cf6']);

//         if (data["Sewer Length by Area Distribution"])
//           drawPieChart('aggSewerPie', Object.keys(data["Sewer Length by Area Distribution"]), Object.values(data["Sewer Length by Area Distribution"]), ['#3b82f6', '#14b8a6', '#a855f7', '#ec4899']);

//         if (data["Junction Type Distribution"])
//           drawBarChart('aggJunctionBar', Object.keys(data["Junction Type Distribution"]), Object.values(data["Junction Type Distribution"]), 'Count');

//         if (data["Clogging Incidents by Junction Type"])
//           drawBarChart('aggCloggingBar', Object.keys(data["Clogging Incidents by Junction Type"]), Object.values(data["Clogging Incidents by Junction Type"]), 'Incidents');
//       }, 100);
//     }
//   }, [reportData]);

//   const handlePrint = useReactToPrint({
//     content: () => printableRef.current,
//     documentTitle: `Manhole-Report-${new Date().toISOString().split('T')[0]}`,
//   });

//   if (!reportData?.data) return null;

//   const summary = reportData.data;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//       <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-2xl font-bold text-gray-800">
//             📊 {reportData.analysis_type === 'manhole_aggregate' ? 'Aggregate' : 'Individual'} Manhole Report
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
//         </div>

//         <div ref={printableRef} className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* --- Individual Manhole Layout --- */}
//           {reportData.analysis_type === 'manhole_individual' ? (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//                 <InfoCard title="Manhole ID" value={summary["Manhole ID"]} />
//                 <InfoCard title="Type" value={summary["Manhole Type"]} />
//                 <InfoCard title="Condition" value={summary["Condition"]} />
//                 <InfoCard title="Depth (m)" value={summary["Depth (m)"]} />
//                 <InfoCard title="Junction Type" value={summary["Junction Type"]} />
//                 <InfoCard title="Installation Year" value={summary["Installation Year"]} />
//                 <InfoCard title="Connections Total" value={summary["Connections Total"]} />
//                 <InfoCard title="Total Operations" value={summary["Number of Operations"]} />
//                 <InfoCard title="Total Waste Collected" value={`${summary["Total Waste Collected (kg)"]} kg`} />
//                 <InfoCard title="Total Clogging Incidents" value={summary["Total Clogging Incidents Reported"]} />
//                 <InfoCard title="Avg. Operation Time" value={`${summary["Average Operation Time (min)"].toFixed(2)} min`} />
//                 <InfoCard title="Avg. Waste Collected" value={`${summary["Average Waste Collected (kg)"].toFixed(2)} kg`} />
//                 <InfoCard title="Predicted Next Cleaning" value={summary["Predicted Next Cleaning Date"]} />
//                 <InfoCard title="Last Operation Date" value={summary["Last Operation Date"]} />
//                 <InfoCard title="Time Since Last Operation" value={`${summary["Time Since Last Operation (days)"]} days`} />
//                 <InfoCard title="Date Range" value={summary["Date Range"]} />
//                 <InfoCard title="Land Use Type" value={summary["Land Use Type"]} />
//               </div>

//               {/* Charts */}
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//                 {summary["Waste Collected(kg) by Blockage Level"] && (
//                   <ChartCard title="Waste by Blockage Level (Kg)" chartId="singleWastePie" />
//                 )}
//                 {summary["Blockage Level Distribution"] && (
//                   <ChartCard title="Blockage Level Distribution" chartId="singleBlockagePie" />
//                 )}
//                 {summary["Last 5 Operations Blockage Levels"] && (
//                   <ChartCard title="Last 5 Operations Blockage Levels" chartId="singleLastOpsBar" />
//                 )}
//               </div>
//             </>
//           ) : (
//             <>
//               {/* --- Aggregate Layout --- */}
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
//                 <InfoCard title="Manholes Analyzed" value={summary["Total Manholes"]} />
//                 <InfoCard title="Total Operations" value={summary["Total Operations"]} />
//                 <InfoCard title="Waste Collected" value={`${summary["Total Waste Collected (kg)"]} kg`} />
//                 <InfoCard title="Clogging Incidents" value={summary["Total Clogging Incidents Reported"]} />
//                 <InfoCard title="Avg. Op Time" value={`${summary["Average Operation Time (min)"].toFixed(2)} min`} />
//               </div>
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//                 <ChartCard title="Waste by Blockage Level (Kg)" chartId="aggWastePie" />
//                 <ChartCard title="Manhole Condition" chartId="aggConditionPie" />
//                 <ChartCard title="Sewer Length by Area (km)" chartId="aggSewerPie" />
//                 <ChartCard title="Junction Type Distribution" chartId="aggJunctionBar" />
//                 <ChartCard title="Clogging Incidents by Junction" chartId="aggCloggingBar" />
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
//           <button onClick={handlePrint} className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A]">
//             Print Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Helper Components ---
// const InfoCard = ({ title, value }) => (
//   <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
//     <p className="text-sm text-gray-600 font-medium">{title}</p>
//     <p className="text-2xl font-bold text-gray-900">{value}</p>
//   </div>
// );

// const ChartCard = ({ title, chartId }) => (
//   <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
//     <h3 className="m-0 mb-3 text-base text-center font-semibold">{title}</h3>
//     <div className="h-64"><canvas id={chartId}></canvas></div>
//   </div>
// );


import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useReactToPrint } from "react-to-print";

export const ManholeReportPopup = ({ reportData, onClose }) => {
  const printableRef = useRef();
  const chartRefs = useRef({});

  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    documentTitle: "Manhole-Report",
  });

  useEffect(() => {
    if (!reportData?.data) return;

    Chart.register(ChartDataLabels);

    const createPie = (id, obj) => {
      if (!obj) return;
      const labels = Object.keys(obj);
      const data = Object.values(obj);
      const colors = [
        "#60a5fa",
        "#22c55e",
        "#ef4444",
        "#f59e0b",
        "#a855f7",
        "#3b82f6",
      ];
      if (chartRefs.current[id]) chartRefs.current[id].destroy();
      const ctx = document.getElementById(id);
      if (!ctx) return;

      chartRefs.current[id] = new Chart(ctx, {
        type: "pie",
        data: { labels, datasets: [{ data, backgroundColor: colors }] },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            datalabels: {
              color: "#fff",
              formatter: (v, ctx) => {
                const total = ctx.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                return total ? `${((v / total) * 100).toFixed(1)}%` : "";
              },
            },
          },
        },
      });
    };

    const createBar = (id, obj, label) => {
      if (!obj) return;
      const labels = Object.keys(obj);
      const data = Object.values(obj);
      if (chartRefs.current[id]) chartRefs.current[id].destroy();
      const ctx = document.getElementById(id);
      if (!ctx) return;

      chartRefs.current[id] = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets: [{ label, data, backgroundColor: "#60a5fa" }] },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, datalabels: { anchor: "end", align: "top" } },
          scales: { y: { beginAtZero: true } },
        },
      });
    };

    // --- MULTIPLE MANHOLES ---
    if (reportData.analysis_type === "manhole_aggregate") {
      const d = reportData.data;
      createPie("condPie", d["Manhole Condition Distribution"]);
      createPie("junctionPie", d["Junction Type Distribution"]);
      createPie("sewerPie", d["Sewer Length by Area Distribution"]);
      createPie("wastePie", d["Waste Collected(Kg) by Blockage Level"]);
      createBar("cloggingBar", d["Clogging Incidents by Junction Type"], "Incidents");
    }

    // --- SINGLE MANHOLE ---
    if (reportData.analysis_type === "manhole_individual") {
      const d = reportData.data;
      createPie("blockagePie", d["Waste Collected(kg) by Blockage Level"]);
    }
  }, [reportData]);

  if (!reportData) return null;

  const d = reportData.data || {};
  const isAggregate = reportData.analysis_type === "manhole_aggregate";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-900 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-4 rounded-t-lg">
          <div>
            <h1 className="text-2xl font-bold">
              {isAggregate
                ? `Aggregate Report (${reportData.manholes_analyzed} Manholes)`
                : `Manhole Report - ${d["Manhole ID"] || "N/A"}`}
            </h1>
            <p className="text-sm opacity-90">
              {isAggregate
                ? "Consolidated analysis across multiple manholes"
                : "Detailed individual manhole analysis"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-white hover:text-red-300"
          >
            &times;
          </button>
        </div>

        {/* Printable Area */}
        <div ref={printableRef} className="p-6 overflow-y-auto max-h-[80vh] bg-gray-50">
          {isAggregate ? (
            <>
              {/* Summary cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Total Manholes" value={d["Total Manholes"]} />
                <InfoCard title="Total Operations" value={d["Total Operations"]} />
                <InfoCard title="Total Waste (kg)" value={d["Total Waste Collected (kg)"]} />
              </div>

              {/* Charts */}
              <h2 className="text-2xl font-bold text-center bg-gray-100 py-3 rounded mb-6">
                Aggregate Analysis
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ChartCard title="Manhole Condition Distribution" id="condPie" />
                <ChartCard title="Junction Type Distribution" id="junctionPie" />
                <ChartCard title="Sewer Length by Area" id="sewerPie" />
                <ChartCard title="Waste by Blockage Level" id="wastePie" />
                <ChartCard title="Clogging by Junction Type" id="cloggingBar" />
              </div>
            </>
          ) : (
            <>
              {/* Individual manhole details */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard title="Manhole ID" value={d["Manhole ID"]} />
                <InfoCard title="Condition" value={d["Condition"]} />
                <InfoCard title="Junction Type" value={d["Junction Type"]} />
                <InfoCard title="Depth (m)" value={d["Depth (m)"]} />
                <InfoCard title="Installation Year" value={d["Installation Year"]} />
                <InfoCard title="Land Use Type" value={d["Land Use Type"]} />
              </div>

              {/* Operation Info */}
              <div className="bg-white rounded-xl shadow border p-4 mb-6">
                <h2 className="text-lg font-semibold border-l-4 border-blue-500 pl-2 mb-3">
                  Operation Summary
                </h2>
                <table className="w-full text-left border border-gray-200 text-sm">
                  <tbody>
                    <tr className="border-t">
                      <th className="p-2 font-medium">Number of Operations</th>
                      <td className="p-2">{d["Number of Operations"]}</td>
                    </tr>
                    <tr className="border-t">
                      <th className="p-2 font-medium">Last Operation Date</th>
                      <td className="p-2">{d["Last Operation Date"]}</td>
                    </tr>
                    <tr className="border-t">
                      <th className="p-2 font-medium">Predicted Next Cleaning Date</th>
                      <td className="p-2">{d["Predicted Next Cleaning Date"]}</td>
                    </tr>
                    <tr className="border-t">
                      <th className="p-2 font-medium">Time Since Last Operation (days)</th>
                      <td className="p-2">{d["Time Since Last Operation (days)"]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              <h2 className="text-2xl font-bold text-center bg-gray-100 py-3 rounded mb-6">
                Individual Manhole Analysis
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ChartCard title="Waste Collected by Blockage Level" id="blockagePie" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-100 rounded-b-lg">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A]"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---
const InfoCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 shadow rounded-xl flex flex-col justify-center items-center p-4">
    <h3 className="font-semibold text-gray-800 text-lg">{value ?? "N/A"}</h3>
    <p className="text-gray-500 text-sm">{title}</p>
  </div>
);

const ChartCard = ({ title, id }) => (
  <div className="bg-white rounded-xl shadow border p-4 text-center">
    <h3 className="font-semibold mb-3">{title}</h3>
    <canvas id={id} className="w-full h-64"></canvas>
  </div>
);
