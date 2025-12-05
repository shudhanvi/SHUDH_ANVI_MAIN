import React from 'react';

const CureComp = () => {
  // Data
  const data = {
    robots: {
      available: 50,
      required: 73,
      desc: "Current fleet insufficient to meet required cleaning frequency."
    },
    zones: {
      label: "Zones [1 , 3]",
      actions: ["Replace Pipes", "Emergency Clean"],
      desc: "Commercial hotspots face repeated clogs; analyze flow to locate choke point."
    },
    manholes: {
      ids: ["MH0621-01-410", "MH0621-01-210", "MH0621-03-245","MH0621-03-110", "MH0621-03-251"],
      desc: "Manholes requiring urgent corrective cleaning or structural inspection."
    }
  };

  // Shared Class for the Card Wrapper (From your first snippet)
  const cardClass = "w-full text-gray-900 place-content-center rounded-xl hover:scale-103 shadow-sm shadow-gray-300 hover:shadow-md hover:shadow-gray-500 hover:-translate-y-1 transition-all duration-200 bg-white border border-gray-100";
  
  // Shared Class for the Inner Container
  const innerClass = "w-full h-full flex flex-col justify-between items-start gap-3 cursor-pointer p-5 text-left";

  return (
    <ul className="w-full max-w-[600px] m-0 p-0 flex flex-col gap-6 mx-auto mt-8 bg-white px-[30px] py-[30px] rounded-2xl">
      
      {/* CARD 1: FLEET (Custom Layout: 50 vs 73) */}
      <li className={cardClass}>
        <div className={innerClass}>
          <div className="w-full">
            <h5 className="text-lg font-[600] text-gray-800 mb-3">Fleet Availability</h5>
            
            {/* New Fleet Layout */}
            <div className="flex items-end gap-3 mb-2">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-green-600 leading-none">{data.robots.available}</span>
                <span className="text-xs font-bold text-green-700 uppercase">Available</span>
              </div>
              <span className="text-2xl text-gray-300 font-light">/</span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-400 leading-none">{data.robots.required}</span>
                <span className="text-xs font-bold text-gray-400 uppercase">Required</span>
              </div>
            </div>
          </div>
          
          {/* Analysis Description */}
          <p className="text-sm font-[400] text-red-600 bg-red-50 p-2 rounded-md w-full border border-red-100">
            {data.robots.desc}
          </p>
        </div>
      </li>

      {/* CARD 2: ZONES */}
     <li className={cardClass}>
  <div className={innerClass}>
    
    {/* Header: Target Zone */}
    <div className="w-full flex justify-between items-start border-b border-gray-100 pb-3">
      <div>
        <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Target Area</h5>
        <div className="text-xl font-bold text-gray-800">{data.zones.label}</div>
      </div>
      <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-100">
        High Priority
      </div>
    </div>

    {/* Middle: Action Checklist */}
    <div className="w-full py-2">
      <p className="text-xs font-semibold text-gray-500 mb-2">Required Interventions:</p>
      <div className="space-y-2">
        {/* Mapping actions + Added Structural Inspection */}
        {[...data.zones.actions, "Structural Inspection"].map((act) => (
          <div key={act} className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            {/* Visual Indicator */}
            <span className={`w-2 h-2 rounded-full ${act === "Structural Inspection" ? "bg-purple-500" : "bg-blue-500"}`}></span>
            <span className="text-sm font-medium text-gray-700">{act}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Footer: Analysis Description */}
    <div className="w-full mt-auto pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 leading-relaxed">
        <span className="font-bold text-gray-700">Analysis: </span>
        {data.zones.desc}
      </p>
    </div>

  </div>
</li>
      {/* CARD 3: MANHOLES */}
      <li className={cardClass}>
        <div className={innerClass}>
          <div className="w-full">
             <h5 className="text-lg font-[600] text-gray-800 mb-3">Critical Manholes</h5>
             <div className="grid grid-cols-2 gap-2 mb-3">
                {data.manholes.ids.map((id) => (
                    <div key={id} className="font-mono text-xs font-semibold bg-gray-100 p-1.5 rounded text-center text-gray-700">
                        {id}
                    </div>
                ))}
             </div>
          </div>

          {/* Analysis Description */}
          <p className="text-sm font-[400] text-gray-500 bg-gray-50 p-2 rounded-md w-full">
            {data.manholes.desc}
          </p>
        </div>
      </li>

    </ul>
  );
};

export default CureComp;