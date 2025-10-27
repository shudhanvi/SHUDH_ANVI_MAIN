// import React, { useEffect, useRef } from 'react';
// import { Chart, registerables } from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { useReactToPrint } from 'react-to-print';

// // Register Chart.js components and plugin
// Chart.register(...registerables, ChartDataLabels);

// export const RobotReportPopup = ({ reportData, onClose }) => {
//   const chartRefs = useRef({});
//   const printableRef = useRef();

//   // Helper functions
//   const createChart = (id, type, labels, data, options = {}, colors = []) => {
//     if (!chartRefs.current[id]) return;
//     if (chartRefs.current[id].chartInstance) chartRefs.current[id].chartInstance.destroy();

//     chartRefs.current[id].chartInstance = new Chart(chartRefs.current[id], {
//       type,
//       data: {
//         labels,
//         datasets: [
//           {
//             label: '',
//             data,
//             backgroundColor: colors.length ? colors : '#3b82f6',
//             borderRadius: 4
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: { position: 'bottom' },
//           datalabels: {
//             color: '#fff',
//             font: { weight: 'bold' },
//             formatter: (value, ctx) => {
//               const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
//               return total ? `${((value / total) * 100).toFixed(1)}%` : '';
//             }
//           },
//           ...options.plugins
//         },
//         scales: options.scales
//       }
//     });
//   };

//   // Draw charts after component mounts
//   useEffect(() => {
//     if (!reportData || !reportData.data) return;

//     const data = reportData.data;

//     // Assign chart refs if not already
//     ['opsBlockageChart', 'performanceCompareChart'].forEach((id) => {
//       if (!chartRefs.current[id]) chartRefs.current[id] = document.getElementById(id);
//     });

//     // Operations by Blockage Level
//     if (data['Operations by Blockage Level']) {
//       createChart(
//         'opsBlockageChart',
//         'pie',
//         Object.keys(data['Operations by Blockage Level']),
//         Object.values(data['Operations by Blockage Level']),
//         {},
//         ['#ef4444', '#fbbf24', '#22c55e']
//       );
//     }

//     // Performance Comparison vs All Robots
//     if (data['Performance Comparison vs All Robots']) {
//       const labels = ['Robot', 'All Robots'];
//       const timeData = [
//         data['Performance Comparison vs All Robots']['Robot Avg Operation Time'],
//         data['Performance Comparison vs All Robots']['All Robots Avg Operation Time']
//       ];
//       const wasteData = [
//         data['Performance Comparison vs All Robots']['Robot Avg Waste'],
//         data['Performance Comparison vs All Robots']['All Robots Avg Waste']
//       ];
//       // Avg Time Bar
//       createChart('performanceCompareChart', 'bar', labels, timeData, {
//         plugins: { legend: { display: false }, datalabels: { color: '#4b5563' } },
//         scales: { y: { beginAtZero: true } }
//       });
//     }

//     return () => {
//       Object.values(chartRefs.current).forEach((ref) => {
//         if (ref?.chartInstance) ref.chartInstance.destroy();
//       });
//     };
//   }, [reportData]);

//   const handlePrint = useReactToPrint({
//     content: () => printableRef.current,
//     documentTitle: `Robot-Report-${new Date().toISOString().split('T')[0]}`
//   });

//   if (!reportData || !reportData.data) return null;

//   const data = reportData.data;
//   const isSingle = reportData.analysis_type.includes('individual');

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//       <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-2xl font-bold text-gray-800">
//             🤖 Robot {isSingle ? 'Individual' : 'Aggregate'} Analysis
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
//         </div>

//         <div ref={printableRef} className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Top Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
//             <InfoCard title="Total Operations" value={data['Total Operations']} />
//             <InfoCard title="Avg Operation Time" value={`${data['Average Operation Time (min)'].toFixed(2)} min`} />
//             <InfoCard title="Avg Waste Collected" value={`${data['Average Waste Collected (kg)']} kg`} />
//             {isSingle && <InfoCard title="Efficiency (waste/min)" value={data['Efficiency Ratio (waste/min)']} />}
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
//             <ChartCard title="Operations by Blockage Level" chartId="opsBlockageChart" />
//             {isSingle && <ChartCard title="Performance Comparison vs All Robots" chartId="performanceCompareChart" />}
//           </div>

//           {/* Top 5 Manholes */}
//           {data['Top 5 Manholes Handled'] && (
//             <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mt-8">
//               <h2 className="text-lg font-semibold border-l-4 border-blue-500 pl-3 mb-4">Top 5 Manholes Handled</h2>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Manhole ID</th>
//                       {isSingle ? (
//                         <>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Avg Operation Time</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Waste Collected (kg)</th>
//                         </>
//                       ) : (
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Avg Operation Time</th>
//                         // Robot IDs can be added if needed
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {data['Top 5 Manholes Handled'].map((row, idx) => (
//                       <tr key={idx} className="hover:bg-blue-50/50 transition">
//                         <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Manhole ID']}</td>
//                         {isSingle ? (
//                           <>
//                             <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Avg Operation Time (min)']}</td>
//                             <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Waste Collected (kg)']}</td>
//                           </>
//                         ) : (
//                           <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Avg Operation Time (min)']}</td>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
//           <button onClick={handlePrint} className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A]">
//             Print Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Helper Subcomponents ---
// const InfoCard = ({ title, value }) => (
//   <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
//     <p className="text-sm text-gray-600 font-medium">{title}</p>
//     <p className="text-2xl font-bold text-gray-900">{value}</p>
//   </div>
// );

// const ChartCard = ({ title, chartId }) => (
//   <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
//     <h3 className="m-0 mb-3 text-base text-center font-semibold">{title}</h3>
//     <div className="h-64 md:h-80"><canvas id={chartId}></canvas></div>
//   </div>
// );


import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useReactToPrint } from 'react-to-print';

Chart.register(...registerables, ChartDataLabels);

export const RobotReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});
  const printableRef = useRef();

  const isSingle = reportData.analysis_type === 'robot_individual';
  const data = reportData.data;

  // Create charts
  const createChart = (id, type, labels, values, options = {}, colors = []) => {
    if (!chartRefs.current[id]) return;
    if (chartRefs.current[id].chartInstance) chartRefs.current[id].chartInstance.destroy();

    chartRefs.current[id].chartInstance = new Chart(chartRefs.current[id], {
      type,
      data: {
        labels,
        datasets: [
          {
            label: '',
            data: values,
            backgroundColor: colors.length ? colors : '#3b82f6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          datalabels: {
            color: type === 'pie' ? '#fff' : '#4b5563',
            font: { weight: 'bold' },
            formatter: (val, ctx) => {
              if (type === 'pie') {
                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                return total ? ((val / total) * 100).toFixed(1) + '%' : '';
              }
              return val;
            }
          },
          ...options.plugins
        },
        scales: options.scales
      }
    });
  };

  useEffect(() => {
    // Assign refs
    ['opsBlockageChart', 'performanceTimeChart', 'performanceWasteChart', 'topRobotsChart'].forEach(id => {
      if (!chartRefs.current[id]) chartRefs.current[id] = document.getElementById(id);
    });

    // Operations by Blockage
    if (data['Operations by Blockage Level']) {
      createChart(
        'opsBlockageChart',
        'pie',
        Object.keys(data['Operations by Blockage Level']),
        Object.values(data['Operations by Blockage Level']),
        {},
        ['#ef4444', '#fbbf24', '#22c55e']
      );
    }

    // Performance comparison (for single robot)
    if (isSingle && data['Performance Comparison vs All Robots']) {
      createChart(
        'performanceTimeChart',
        'bar',
        ['Robot', 'All Robots'],
        [data['Performance Comparison vs All Robots']['Robot Avg Operation Time'], data['Performance Comparison vs All Robots']['All Robots Avg Operation Time']],
        { scales: { y: { beginAtZero: true } } }
      );
      createChart(
        'performanceWasteChart',
        'bar',
        ['Robot', 'All Robots'],
        [data['Performance Comparison vs All Robots']['Robot Avg Waste'], data['Performance Comparison vs All Robots']['All Robots Avg Waste']],
        { scales: { y: { beginAtZero: true } } }
      );
    }

    // Top 5 robots (for aggregate)
    if (!isSingle && data['Top 5 Performing Robots']) {
      createChart(
        'topRobotsChart',
        'bar',
        data['Top 5 Performing Robots'].map(r => r['Robot ID']),
        data['Top 5 Performing Robots'].map(r => r['Efficiency (waste/min)']),
        { scales: { y: { beginAtZero: true } } }
      );
    }

    return () => {
      Object.values(chartRefs.current).forEach(ref => {
        if (ref?.chartInstance) ref.chartInstance.destroy();
      });
    };
  }, [reportData]);

  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    documentTitle: `Robot-Report-${new Date().toISOString().split('T')[0]}`
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-900 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            🤖 Robot {isSingle ? 'Individual' : 'Aggregate'} Analysis
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
        </div>

        <div ref={printableRef} className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <InfoCard title="Total Operations" value={data['Total Operations']} />
            <InfoCard title="Avg Operation Time" value={`${data['Average Operation Time (min)'].toFixed(2)} min`} />
            <InfoCard title="Avg Waste Collected" value={`${data['Average Waste Collected (kg)']} kg`} />
            <InfoCard title="Efficiency (waste/min)" value={data['Efficiency Ratio (waste/min)']} />
            {isSingle && <InfoCard title="Total Operation Time" value={`${data['Total Operation Time (min)']} min`} />}
          </div>

          {/* Timeline (only for single) */}
          {isSingle && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <InfoCard title="Last Operation Date" value={data['Last Operation Date']} />
              <InfoCard title="Next Operation Date" value={data['Next Operation Date']} />
              <InfoCard title="Days Since / Until" value={`${data['Days Since Last Operation']} / ${data['Days Until Next Operation']}`} />
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <ChartCard title="Operations by Blockage Level" chartId="opsBlockageChart" />
            {isSingle && (
              <>
                <ChartCard title="Avg Operation Time Comparison" chartId="performanceTimeChart" />
                <ChartCard title="Avg Waste Comparison" chartId="performanceWasteChart" />
              </>
            )}
            {!isSingle && <ChartCard title="Top 5 Performing Robots" chartId="topRobotsChart" />}
          </div>

          {/* Top 5 Manholes */}
          {data['Top 5 Manholes Handled'] && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mt-8">
              <h2 className="text-lg font-semibold border-l-4 border-blue-500 pl-3 mb-4">Top 5 Manholes Handled</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Manhole ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Avg Operation Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Waste Collected</th>
                      {!isSingle && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Robot IDs</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data['Top 5 Manholes Handled'].map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Manhole ID']}</td>
                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Avg Operation Time (min)']}</td>
                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{row['Waste Collected (kg)']}</td>
                        {!isSingle && <td className="px-6 py-4 whitespace-nowrap">{row['Robot IDs']?.join(', ')}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
          <button onClick={handlePrint} className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A]">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Subcomponents ---
const InfoCard = ({ title, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
    <p className="text-sm text-gray-600 font-medium">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ChartCard = ({ title, chartId }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
    <h3 className="m-0 mb-3 text-base text-center font-semibold">{title}</h3>
    <div className="h-64 md:h-80"><canvas id={chartId}></canvas></div>
  </div>
);
