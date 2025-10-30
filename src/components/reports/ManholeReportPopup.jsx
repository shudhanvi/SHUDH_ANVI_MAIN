
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
        "#06b6d4",
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
