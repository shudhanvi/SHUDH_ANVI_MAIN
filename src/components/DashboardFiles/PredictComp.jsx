const PredictComp = () => {
  const riskData = [
    { ward: "Ward 18", code: "MH-034", riskPercent: 92 },
    { ward: "Ward 12", code: "MH-058", riskPercent: 82 },
  ];

  const rainfallData = [
    { day: "D1", rainfall: 12 },
    { day: "D2", rainfall: 5 },
    { day: "D3", rainfall: 0 },
    { day: "D4", rainfall: 8 },
    { day: "D5", rainfall: 21 },
    { day: "D6", rainfall: 33 },
    { day: "D7", rainfall: 10 },
  ];

  const sewerFlowZones = [
    { zone: "Zone A", status: "Stable" },
    { zone: "Zone B", status: "Over Flow" },
    { zone: "Zone C", status: "Stable" },
  ];

  const gasRiskZones = {
    location: "North West",
    gas: "H₂S",
    riskLevel: "Elevated",
    riskDesc: "Moderate",
  };

  const StatGraph = () => (
    <svg
      viewBox="0 0 500 200"
      className="w-full h-48"
      aria-label="Line chart representing rainfall trend over last 7 days"
    >
      {/* Axes */}
      <line x1="40" y1="10" x2="40" y2="180" stroke="#bbb" strokeWidth="1" />
      <line x1="40" y1="180" x2="480" y2="180" stroke="#bbb" strokeWidth="1" />
      {/* Y-axis labels */}
      {[0, 9, 18, 27, 36].map((val) => {
        // Map rainfall values to chart height (10 to 180 pixels y-axis)
        const y = 180 - (val / 36) * 170;
        return (
          <g key={val} className="text-gray-500 text-xs">
            <text x="5" y={y + 5} fill="#666">
              {val}
            </text>
            <line
              x1="40"
              y1={y}
              x2="480"
              y2={y}
              stroke="#eee"
              strokeWidth="1"
            />
          </g>
        );
      })}
      {/* X-axis labels and dots */}
      {rainfallData.map(({ day, rainfall }, i) => {
        const x = 40 + i * 65;
        const y = 180 - (rainfall / 36) * 170;
        return (
          <g key={day}>
            <text
              x={x}
              y="195"
              fill="#666"
              className="text-xs"
              textAnchor="middle"
            >
              {day}
            </text>
            <circle cx={x} cy={y} r="4" fill="#38bdf8" />
            <text
              x={x}
              y={y - 10}
              fill="#0590bc"
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
            >
              {rainfall}
            </text>
          </g>
        );
      })}
      {/* Line path */}
      <polyline
        fill="none"
        stroke="#38bdf8"
        strokeWidth="3"
        points={rainfallData
          .map(({ rainfall }, i) => {
            const x = 40 + i * 65;
            const y = 180 - (rainfall / 36) * 170;
            return `${x},${y}`;
          })
          .join(" ")}
      />
    </svg>
  );

  return (
    <div className="predict-comp w-full max-w-[600px] p-5 space-y-6 bg-white rounded-lg shadow-md mx-auto">
      {/* Box-1 Clog Risk */}
      <div className="flex-1 shadow shadow-gray-300 bg-white border border-gray-200 rounded-xl p-4 text-left">
        <h2 className="font-semibold text-xl mb-1">Clog Risk Prediction</h2>
        <p className="text-gray-600 mb-3 text-sm font-semibold">
          See risks before they surge.
        </p>
        {riskData.map(({ ward, code, riskPercent }) => (
          <div
            key={code}
            className="mb-3 p-3 border-1 border-gray-300 rounded-xl flex items-center space-x-4"
          >
            <div className="bg-[#1A8BA8] text-white rounded-xl px-5 py-[10px] text-xs font-semibold">
              {ward}
            </div>
            <div className="flex-1">
              <div className="text-sky-600 font-medium">{code}</div>
              <div className="w-full bg-gray-300 h-2 rounded-full mt-1">
                <div
                  className="bg-[#0380FC] h-2 rounded-full"
                  style={{ width: `${riskPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 text-right font-semibold">{riskPercent}%</div>
          </div>
        ))}
      </div>

      {/* Box-2 Rainfall Trend*/}
      <div className="flex-1 w-full shadow shadow-gray-300 bg-white borde border-gray-200 rounded-xl">
        {/* <h3 className="font-semibold mb-3">Rainfall Trend — Last 7 Days</h3> */}
        {/* <StatGraph /> */}
        <img
          src="/images/cure-bargraph.png"
          className="w-full max-w-3xl m-auto object-contain"
          alt="Cure RainFall Trend Stats Graph"
        />
      </div>

      {/* Box-3 Sewer Flow */}
      <div className="flex-1 shadow shadow-gray-300 bg-white border border-gray-200 rounded-xl p-4 text-left">
        <h3 className="font-semibold mb-3">Sewer Flow ForeCast</h3>
        <div className="flex justify-between align-middle gap-1">
          {sewerFlowZones.map(({ zone, status }) => (
            <div
              key={zone}
              className="bg-gray-50 px-4 py-2 rounded border-1 border-gray-200 shadow hover:shadow-gray-400 font-semibold text-sm text-gray-800 cursor-default"
            >
              {zone} - {status}
            </div>
          ))}
        </div>
      </div>

      {/* Box-4 Gas Risk */}
      <div className="flex-1 shadow shadow-gray-300 bg-white border border-gray-200 rounded-xl p-4 text-left">
        <h3 className="font-semibold mb-3">Gas Risk Zones</h3>
        <div
          // className="inline-block bg-gray-50 p-2 rounded text-gray-700 font-medium"
          className="bg-gray-50 inline-block px-4 py-2 rounded border-1 border-gray-200 shadow hover:shadow-gray-400 font-semibold text-sm text-gray-800 cursor-default"
        >
          {gasRiskZones.location} {gasRiskZones.gas}: {gasRiskZones.riskLevel} -{" "}
          <span className="text-red-600 font-semibold">
            Risk: {gasRiskZones.riskDesc}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictComp;