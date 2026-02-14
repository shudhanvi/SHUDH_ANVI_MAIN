import React from 'react';

const PredictComp = () => {
  // 1. Weather & Location Data
  const weatherAlert = {
    location: "Somajiguda",
    forecast: " Rain Expected",
    timeline: "No Expected Rain",
    desc: "These manholes show high clog risk under rainfall conditions and must be cleaned to prevent overflow or local flooding."
  };
  const highRiskManholes = [
    "MH0621-01-410",
    "MH0621-01-210",
    "MH0621-01-210",
    "MH0621-01-210",
    "MH0621-01-210",
    "MH0621-03-245",
    "MH0621-03-110",
    "MH0621-03-251"
  ];
  // 2. Docket / Pipeline Data
  const docketData = [
    {
      id: "0621-02",
      specs: "150 mm pipe",
      issue: "High rainfall stress; frequent surcharges during storms.",
      action: "Upgrade to 300–450 mm recommended."
    },
    {
      id: "0621-04",
      specs: "200 mm pipe",
      issue: "Nearing capacity; rain increases overload risk.",
      action: "Upgrade to 300 mm advised."
    }
  ];

  // 3. Zone Risk Data
  const zoneRisk = "Ward zones 3 and 5 likely to overflow under higher flow conditions.";

  // Shared Styles
  const cardBase = "bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden";


  return (
    <div className="w-full max-w-[600px] mx-auto mt-8 font-sans bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

      {/* 1. WEATHER ALERT HEADER */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center mb-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{weatherAlert.location}</span>
          </div>
          <h2 className="text-lg font-bold text-blue-900 leading-tight">{weatherAlert.forecast}</h2>
        </div>
        <span className="bg-white text-blue-800 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-blue-100 text-center leading-tight">
          {weatherAlert.timeline}
        </span>
      </div>

      {/* 2. IMAGE SECTION */}
      <div className="w-full h-68 bg-slate-100 rounded-xl border border-slate-200 mb-4 overflow-hidden relative group">
        {/* Replace src with your actual map image */}
        <img
          src="images/Temperature.png"
          alt="Map of Somajiguda high risk manholes"
          className="w-full h-full object-fill opacity-90 group-hover:opacity-100 transition-opacity"
        />

      </div>

      {/* 3. DESCRIPTION CONTENT WITH MANHOLES */}
      <div className="mb-6 border-l-4 border-blue-200 pl-4 py-1">
        <p className="text-sm font-medium text-gray-700 leading-relaxed mb-3">
          {weatherAlert.desc}
        </p>

        {/* 8 Manholes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {highRiskManholes.map((mh, index) => (
            <div key={index} className="bg-blue-50 border border-orange-100 text-[#000000] text-[11px] font-mono font-bold px-1 py-1.5 rounded text-center">
              {mh}
            </div>
          ))}
        </div>
      </div>

      {/* 4. PIPELINE STRESS / DOCKET DATA (Consolidated Card) */}
      <div className={`${cardBase} bg-white`}>
        <div className="p-5">
          {/* Main Heading */}
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-bold text-gray-800">Pipeline Stress Forecast</h3>
          </div>

          {/* Sub-Cards Container */}
          <div className="space-y-4">
            {docketData.map((docket) => (
              <div key={docket.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Docket No</span>
                    <h4 className="text-md font-bold text-gray-800">{docket.id}</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded shadow-sm">
                    {docket.specs}
                  </span>
                </div>

                {/* Issues */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 leading-snug">
                    <span className="text-red-500 font-bold mr-1">Issue:</span>
                    {docket.issue}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex gap-2 items-start shadow-sm">
                  <div className="bg-green-100 p-1 rounded-full text-green-600 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-tight">
                    {docket.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. WARD ZONES ALERT (Footer) */}
      <div className="bg-blue-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 mt-2">

        <div>
          <h5 className="text-sm font-bold text-gray-800 uppercase mb-1">Overflow Warning</h5>
          <p className="text-sm font-medium text-gray-700 leading-snug">
            {zoneRisk}
          </p>
        </div>
      </div>

    </div>
  );
};

export default PredictComp;