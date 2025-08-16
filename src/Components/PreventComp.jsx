const PreventComp = () => {
  const sensorReadings = [
    { id: "GS-001", CO: 0.9, CH4: 12.2, H2S: 5.1, linkedMH: "MH-120" },
    { id: "GS-014", CO: 1.3, CH4: 50.1, H2S: 7.9, linkedMH: "MH-045" },
  ];

  const blockageHistory = [
    { code: "MH-034", desc: "3 Clogs in last 50 days" },
    { code: "MH-057", desc: "2 Clogs in last 40 days" },
  ];

  const upcomingMaintenance = [
    { code: "MH-034", dueDate: "2025-08-20" },
    { code: "MH-057", dueDate: "2025-08-25" },
  ];

  return (
    <div className="prevent-comp w-full max-w-[600px] p-5 space-y-6 bg-white rounded-lg shadow-md mx-auto mt-8">
      {/* live Sensor Reading */}
      <div className="bg-white p-5 shadow shadow-gray-300 rounded-xl">
        <h3 className="font-semibold text-md mb-1 text-left">
          Live Sensor Reading
        </h3>
        <p className="text-gray-600 text-sm mb-3 text-left">
          Act early. Reduce Downtime
        </p>
        <table className="w-full text-sm border-gray-300 rounded text-left">
          <thead className="bg-gray-50 font-[600]">
            <tr>
              <th className="border-b border-gray-300 p-2">Sensor ID</th>
              <th className="border-b border-gray-300 p-2">CO</th>
              <th className="border-b border-gray-300 p-2">CH4</th>
              <th className="border-b border-gray-300 p-2">H2S</th>
              <th className="border-b border-gray-300 p-2">Linked MH</th>
            </tr>
          </thead>
          <tbody className="font-[300]">
            {sensorReadings.map(({ id, CO, CH4, H2S, linkedMH }) => (
              <tr
                key={id}
                className={CH4 > 50 || H2S > 7 ? "bg-yellow-50" : ""}
              >
                <td className="p-2 border-b border-gray-200">{id}</td>
                <td className="p-2 border-b border-gray-200">
                  {CO.toFixed(1)}
                </td>
                <td
                  className={`p-2 border-b border-gray-200 ${
                    CH4 > 50 ? "text-red-600 font-semibold" : ""
                  }`}
                >
                  {CH4.toFixed(1)}
                </td>
                <td
                  className={`p-2 border-b border-gray-200 ${
                    H2S > 7 ? "text-red-600 font-semibold" : ""
                  }`}
                >
                  {H2S.toFixed(1)}
                </td>
                <td className="p-2 border-b border-gray-200">{linkedMH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Box 2 */}
      <div className="blockage-history mt-6 grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* blockage-history */}
        <div className="bg-white p-3 shadow flex flex-col gap-1.5 shadow-gray-300 rounded-xl border border-gray-200 text-left">
          <h4 className="font-semibold mb-2">Blockage History</h4>
          {blockageHistory.map(({ code, desc }) => (
            <div
              key={code}
              className="bg-white border rounded-xl border-gray-300 px-3 py-2 mb-2"
            >
              <div className="font-semibold text-sm">{code}</div>
              <div className="text-gray-600 font-[600] text-[10px]">{desc}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Maintanence */}
        <div className="bg-white p-3 shadow flex flex-col gap-1.5 shadow-gray-300 rounded-xl border border-gray-200 text-left">
          <h4 className="font-semibold mb-2">Upcoming Maintenance</h4>
          {upcomingMaintenance.map(({ code, dueDate }) => (
            <div
              key={code}
              className="bg-white border rounded-xl border-gray-300 px-3 py-2 mb-2"
            >
              <div className="font-semibold text-sm">{code}</div>
              <div className="text-gray-600 font-[600] text-[10px]">
                Due By {dueDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Box 3 */}
      <div className="bg-white shadow pt-3 flex flex-col gap-1.5 shadow-gray-300 rounded-xl border border-gray-200 text-left">
        {/* <div className="network-analysis mt-6 bg-gray-50 border border-gray-200 rounded p-4 max-w-3xl mx-auto"> */}
        <h4 className="font-semibold text-md px-3">Network Analysis</h4>
        <p className="text-gray-600 text-[12px] font-[600] mb-3 px-3">
          How upcoming MH-034 and MH-057 can create issues in the network
        </p>
        <div className="aspect-w-16 aspect-h-9 h-auto relative">
          <img
            src="/images/prevent-map.png"
            className="w-full max-w-3xl m-auto object-contain"
            alt="Detailed network map visualization highlighting MH-034 and MH-057 with surrounding pipeline and infrastructure"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      </div>
    </div>
  );
};

export default PreventComp;
