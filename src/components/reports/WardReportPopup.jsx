import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(...registerables, ChartDataLabels);

export const WardReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});

  const data = reportData.data;

  // --- Chart helper function ---
  const createChart = (id, type, labels, values, colors = [], options = {}) => {
    const ctx = chartRefs.current[id];
    if (!ctx) return;

    if (ctx.chartInstance) ctx.chartInstance.destroy();

    ctx.chartInstance = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: "",
            data: values,
            backgroundColor: colors.length ? colors : "#3b82f6",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          datalabels: {
            color: type === "pie" ? "#fff" : "#4b5563",
            font: { weight: "bold" },
            formatter: (val, ctx) => {
              if (type === "pie") {
                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                return total ? ((val / total) * 100).toFixed(1) + "%" : "";
              }
              return val;
            },
          },
          ...options.plugins,
        },
        scales: options.scales,
      },
    });
  };

  // --- Initialize charts ---
  useEffect(() => {
    chartRefs.current = {
      manholeConditionChart: document.getElementById("manholeConditionChart"),
      landUseChart: document.getElementById("landUseChart"),
      sewerLengthChart: document.getElementById("sewerLengthChart"),
      junctionTypeChart: document.getElementById("junctionTypeChart"),
      cloggingChart: document.getElementById("cloggingChart"),
      dailyOpsChart: document.getElementById("dailyOpsChart"),
    };

    if (data["Manhole Condition Distribution"]) {
      createChart(
        "manholeConditionChart",
        "pie",
        Object.keys(data["Manhole Condition Distribution"]),
        Object.values(data["Manhole Condition Distribution"]),
        ["#22c55e", "#fbbf24", "#ef4444", "#3b82f6"]
      );
    }

    if (data["Land Use Distribution"]) {
      createChart(
        "landUseChart",
        "pie",
        Object.keys(data["Land Use Distribution"]),
        Object.values(data["Land Use Distribution"]),
        ["#3b82f6", "#f97316", "#10b981", "#facc15"]
      );
    }

    if (data["Sewer Length by Area"]) {
      createChart(
        "sewerLengthChart",
        "bar",
        Object.keys(data["Sewer Length by Area"]),
        Object.values(data["Sewer Length by Area"]),
        ["#3b82f6", "#f97316", "#10b981", "#facc15"],
        { scales: { y: { beginAtZero: true } } }
      );
    }

    if (data["Junction Type Distribution"]) {
      createChart(
        "junctionTypeChart",
        "pie",
        Object.keys(data["Junction Type Distribution"]),
        Object.values(data["Junction Type Distribution"]),
        ["#3b82f6", "#f97316", "#10b981", "#facc15", "#ef4444"]
      );
    }

    if (data["Clogging Incidents by Junction Type"]) {
      createChart(
        "cloggingChart",
        "bar",
        Object.keys(data["Clogging Incidents by Junction Type"]),
        Object.values(data["Clogging Incidents by Junction Type"]),
        ["#3b82f6", "#f97316", "#10b981", "#facc15", "#ef4444"],
        { scales: { y: { beginAtZero: true } } }
      );
    }

    if (data["Daily Operations (Last 30 Days)"]) {
      createChart(
        "dailyOpsChart",
        "line",
        data["Daily Operations (Last 30 Days)"].map((d) => d.Date),
        data["Daily Operations (Last 30 Days)"].map((d) => d.Operations),
        ["#3b82f6"],
        { scales: { y: { beginAtZero: true } } }
      );
    }
  }, [data]);

  // --- Print handler ---
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-900 p-4">
      <style>
        {`
        @media print {
          body > *:not(.printable-area) {
            display: none;
          }
          .no-print {
            display: none;
          }
        }
      `}
      </style>
      <div className="bg-white w-full max-w-7xl rounded-lg shadow-xl relative printable-area overflow-y-auto max-h-[90vh] p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 no-print">
          <h2 className="text-2xl font-bold text-gray-800">📊 Ward Report - Hasmathpet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl">
            &times;
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InfoCard label="Total Operations" value={data["Total Operations"]} />
          <InfoCard label="Avg Operation Time (min)" value={data["Average Operation Time (min)"]} />
          <InfoCard label="Avg Waste Collected (kg)" value={data["Average Waste Collected (kg)"]} />
          <InfoCard label="Total Waste Collected (kg)" value={data["Total Waste Collected (kg)"]} />
          <InfoCard label="Avg Blockage Level" value={`${data["Average Blockage Level (numeric)"]} (${data["Average Blockage Level (text)"]})`} />
          <InfoCard label="Date Range" value={data["Date Range"]} />
        </div>

        <div className="flex flex-col gap-[20px] justify-evenly mb-[10px]">
          <div className="flex ">
          <div className="p-[10px] bg-white rounded-2xl border border-gray-200 shadow-md ">
            <img className="h-[300px] aspect-[16/14]" src="/images/Landuse.jpg" />
            <h3 className="text-center text-lg font-bold">Landuse</h3>
          </div>
          <div className="p-[10px] bg-white rounded-2xl border border-gray-200 shadow-md ">
            <img className="h-[300px] aspect-[16/14]" src="/images/Surface.jpg" alt="" />
            <h3 className="text-center text-lg font-bold">Surface</h3>
          </div>
          </div>

<div className="flex">
          <div className="p-[10px] bg-white rounded-2xl border border-gray-200 shadow-md ">
            <img className="h-[300px] aspect-[16/14]" src="/images/Hotspot.jpg" alt="" />
            <h3 className="text-center text-lg font-bold">Hotspot</h3>
          </div>
          <div className="p-[10px] bg-white rounded-2xl border border-gray-200 shadow-md ">
            <img className="h-[300px] aspect-[16/14]" src="/images/SewageNetwork.png" alt="" />
            <h3 className="text-center text-lg font-bold">SewageNetwork</h3>
          </div>
          </div>
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          <ChartCard title="Manhole Condition Distribution" chartId="manholeConditionChart" chartRef={(el) => (chartRefs.current.manholeConditionChart = el)} />
          <ChartCard title="Land Use Distribution" chartId="landUseChart" chartRef={(el) => (chartRefs.current.landUseChart = el)} />
          <ChartCard title="Sewer Length by Area" chartId="sewerLengthChart" chartRef={(el) => (chartRefs.current.sewerLengthChart = el)} />
          <ChartCard title="Junction Type Distribution" chartId="junctionTypeChart" chartRef={(el) => (chartRefs.current.junctionTypeChart = el)} />
          <ChartCard title="Clogging Incidents by Junction Type" chartId="cloggingChart" chartRef={(el) => (chartRefs.current.cloggingChart = el)} />
          <ChartCard title="Daily Operations (Last 30 Days)" chartId="dailyOpsChart" chartRef={(el) => (chartRefs.current.dailyOpsChart = el)} />
        </div>

        {/* Top 5 Manholes Table */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-2">Top 5 Manholes by Cleaning Priority</h3>
          <Table data={data["Top 5 Manholes by Cleaning Priority"]} />
        </div>

        {/* Top 5 Robots Table */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-2">Top 5 Robots by Performance</h3>
          <Table data={data["Top 5 Robots by Performance"]} />
        </div>

        {/* Print Button */}
        <div className="flex justify-end no-print">
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

// --- Subcomponents ---
const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow-sm">
    <p className="text-gray-500 font-medium">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

const ChartCard = ({ title, chartId, chartRef }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64">
    <h4 className="text-center font-semibold mb-2">{title}</h4>
    <canvas id={chartId} ref={chartRef}></canvas>
  </div>
);

const Table = ({ data }) => {
  if (!data || data.length === 0) return <div>No data available.</div>;

  const headers = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 text-left bg-gray-50 font-semibold border border-gray-300">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {headers.map((h, i) => (
                <td key={i} className="px-4 py-2 border border-gray-300">{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
