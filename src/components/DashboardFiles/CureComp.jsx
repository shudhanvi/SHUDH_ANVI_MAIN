import React from 'react';

const CureComp = () => {
  // Data
  const data = {
    robots: {
      available: 50,
      required: 73,
      desc: "Current robot fleet is falling short of required cleaningcapacity,posing a risk of service in coming weeks."
    },
    zones: {
      label: "Zones [1 , 3]",
      actions: ["Replace Pipes", "Emergency Clean"],
      desc: "Commercial hotspots are consistently hitting high clog levels,signalling possible choke points that could escalate if not adressed."
    },
    manholes: {
      ids: ["MH0621-01-410", "MH0621-01-210", "MH0621-03-245","MH0621-03-110", "MH0621-03-251"],
      desc: "Manholes requiring urgent corrective cleaning or structural inspection."
    }
  };

  // Shared Class for the Card Wrapper (From your first snippet)
  const cardClass = "w-full text-gray-900 place-content-center rounded-xl   shadow-sm shadow-gray-300 hover:shadow-md   bg-white border border-gray-100";
  
  // Shared Class for the Inner Container
  const innerClass = "w-full h-full flex flex-col justify-between items-start gap-3 cursor-pointer p-5 text-left";

  return (
    <ul className="w-full max-w-[600px] m-0 p-0 flex flex-col gap-6 mx-auto mt-8 bg-white px-[30px] py-[30px] rounded-2xl">
      
      {/* CARD 1: FLEET (Custom Layout: 50 vs 73) */}
      <li className={cardClass}>
        <div className={innerClass}>
          <div className="w-full">
            <h5 className="text-lg font-[600] text-gray-800 mb-3">Robots Availability</h5>
            
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
          <p className="text-sm font-[400] text-gray-900 italic bg-blue-50 p-2 rounded-md w-full border border-blue-100">
            {data.robots.desc}
          </p>
        </div>
      </li>
 {/* CARD: COMMERCIAL HOTSPOTS */}
<li className={cardClass}>
  <div className={innerClass}>
    
    {/* Header */}
    <div className="w-full flex justify-between items-start mb-2">
      <div>
         <h5 className="text-lg font-[600] text-gray-800">Commercial Hotspots</h5>
         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Repeated Clogs</p>
      </div>
      
    </div>

    {/* Insight Quote */}
    <div className="w-full bg-blue-50 border border-blue-100 p-2.5 rounded-lg mb-3">
        <p className="text-xs font-medium text-gray-900 italic leading-snug">
            High commercial footfall — persistent choke points detected.
        </p>
    </div>

    {/* Zone List */}
    <div className="w-full space-y-2 mb-3">
        {[
            { zone: "Zone 3", loc: "Restaurant corridor near Somajiguda Circle" },
            { zone: "Zone 5", loc: "Hotel belt around Nagarjuna Circle" },
            { zone: "Zone 8", loc: "Street-food stretch near Khairatabad Road" }
        ].map((item) => (
            <div key={item.zone} className="flex flex-col border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                <span className="text-xs font-bold text-gray-800">{item.zone}</span>
                <span className="text-[11px] text-gray-500 font-medium">{item.loc}</span>
            </div>
        ))}
    </div>

    {/* Recommendation Footer */}
    <div className="w-full mt-auto pt-3 border-t border-gray-100">
        <p className="  text-gray-500 leading-relaxed text-[12px] bg-blue-50 p-2 rounded-l">
            <span className="font-bold text-gray-700">Action: </span>
            Increase routine cleaning cycles and deploy high-capacity robots in peak-risk hours; run targeted evening inspections.
        </p>
    </div>
  </div>
</li>
{/* CARD: AGING INFRASTRUCTURE */}
<li className={cardClass}>
  <div className={innerClass}>
    
    {/* Header */}
    <div className="w-full flex justify-between items-start mb-2">
      <div>
         <h5 className="text-lg font-[600] text-gray-800 leading-tight">Very Old Infrastructure</h5>
         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-0.5">High Failure Probability</p>
      </div>
      <span className="bg-blue-50 text-gray-800 px-2 py-1 rounded text-[10px] font-bold border border-blue-100">
         Zone 7
      </span>
    </div>

    {/* Diagnosis Quote */}
    <div className="w-full bg-blue-50 border border-blue-100 p-2.5 rounded-lg mb-3">
        <p className="text-xs font-medium text-gray-900 italic leading-snug">
            Cluster of old pipes + manholes needs phased modernization.
        </p>
    </div>

    {/* Technical Details */}
    <div className="w-full space-y-3 mb-2">
        
        {/* Location & Age */}
        <div>
            <div className="text-xs font-bold text-gray-700 mb-1">Old Somajiguda Residential Block</div>
            <div className="flex gap-2 flex-wrap">
                {["0621-07-60", "0621-07-61", "0621-07-62","0621-07-63", "0621-07-64"].map(id => (
                    <span key={id} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-1 rounded border border-gray-200">
                        MH{id}  
                    </span>
                ))}
            </div>
        </div>

        {/* Material Issues */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 leading-tight">
            <span className="font-bold text-gray-800">Current Material:</span> SWP & CI 
            <br/>
            <span className="text-red-500 font-medium">→ Weak under modern flow loads</span>
        </div>
    </div>

    {/* Action Footer */}
    <div className="w-full mt-auto pt-3 border-t border-gray-100">
        <p className="text-[12px] text-gray-500  leading-relaxed bg-blue-50 p-2 rounded-l">
            <span className="font-bold text-gray-700">Action: </span>
            Replace with <span className="font-bold text-blue-600">PVC/RCC NP3</span> and reconstruct manhole rings.
        </p>
    </div>
  </div>
</li>

    </ul>
  );
};

export default CureComp;