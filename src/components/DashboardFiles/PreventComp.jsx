import React from 'react';

const PreventComp = () => {
  // Data Configuration
  const weatherAlert = {
    title: "Heavy Rain Expected",
    timeline: "In 3 Days",
  };

  const fleetData = {
    overutilized: ["SB-002", "SB-042", "SB-058", "SB-009", "SB-015"],
    underutilized: ["SB-008", "SB-034"],
    desc: "Deploy underutilized robots to vulnerable areas."
  };

  const zoneData = {
    zones: "Zones 3 & 5",
    risk: "Flood Risk",
    action: "Clean High-Risk Manholes Immediately", // Moved here
    targets: ["MH0621-03-109", "MH0621-04-19", "MH0621-01-256", "MH0621-04-350", "MH0621-06-154"]
  };

  const networkData = {
    focus: ["MH0621-034", "MH0621-057"],
    desc: "Simulation indicates blockage at MH-034 will cause backflow into residential lines within 48 hours."
  };

  // Shared Styles
  const cardBase = "bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden";
  const cardPad = "p-5";

  return (
    <div className="w-full max-w-[700px] mx-auto mt-8 font-sans bg-white px-[30px] py-[30px] rounded-2xl">
      
      {/* 1. WEATHER ALERT (Separate Box) */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center mb-6 shadow-sm">
         <div className="flex items-center gap-3">
       
            <h2 className="text-lg font-bold text-blue-900">{weatherAlert.title}</h2>
         </div>
         <span className="bg-white text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-blue-100">
           {weatherAlert.timeline}
         </span>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 2. FLEET REASSIGNMENT (Left Column) */}
    <div className={`${cardBase} flex flex-col h-full`}>
    <div className={cardPad}>
        <h5 className="text-md font-bold text-gray-800 mb-1">Workload Reassignment</h5>
        <p className="text-xs text-gray-400 mb-4">Balance fleet load before rain</p>
        
        {/* 1. Overloaded Section */}
        <div className="mb-4">
            <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                High Load (Reduce Usage)
            </p>
            <div className="flex flex-wrap gap-2">
                {fleetData.overutilized.slice(0, 5).map(id => (
                    <span key={id} className="text-xs font-mono bg-white border border-red-200 text-red-700 px-2 py-1 rounded">
                        {id}
                    </span>
                ))}
            </div>
        </div>

        {/* 2. Deploy Section */}
        <div>
            <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Available for Deployment
            </p>
            <div className="flex flex-wrap gap-2">
                {fleetData.underutilized.map(id => (
                    <span key={id} className="text-xs font-mono bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded font-bold shadow-sm">
                        {id}
                    </span>
                ))}
            </div>
        </div>
    </div>
</div>

        {/* 3. PRIORITY ZONES (Right Column - With Action Text) */}
   <div className={`${cardBase} flex flex-col h-full`}>
    <div className={cardPad}>
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
            <h5 className="text-md font-bold text-gray-800">Priority: {zoneData.zones}</h5>
            <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">
                {zoneData.risk}
            </span>
        </div>
    
        {/* Action Alert */}
        <div className="bg-red-50 border border-red-100 p-2 rounded mb-3">
            <p className="text-xs font-bold text-red-700 leading-tight">
                Action: {zoneData.action}
            </p>
        </div>
        
        {/* Full List of Manholes */}
        <p className="text-xs font-semibold text-gray-500 mb-2">
            Target Manholes ({zoneData.targets.length}):
        </p>
        <div className="flex flex-wrap gap-2">
            {zoneData.targets.map((target) => (
                <span key={target} className="text-[10px] font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {target}
                </span>
            ))}
        </div>
    </div>
</div>

        {/* 4. NETWORK ANALYSIS (Full Width - White BG - Medium Image) */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <div>
                    <h5 className="text-md font-bold text-gray-800">Network Vulnerability Analysis</h5>
                    <p className="text-xs text-gray-500">Predictive Flow Modeling</p>
                </div>
                <div className="flex gap-2">
                    {networkData.focus.map(mh => (
                    <span key={mh} className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                        {mh}
                    </span>
                    ))}
                </div>
            </div>
            
            {/* MEDIUM IMAGE CONTAINER */}
            <div className="w-full flex justify-center mb-4">
                <div className="w-full max-w-[310px] h-[220px] bg-slate-50 border border-slate-100 rounded-lg overflow-hidden relative">
                    {/* Placeholder Image */}
                    <img 
                        src="/images/network.jpeg" 
                        alt="Network Map" 
                        className="w-full h-full object-contain"
                    />
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-700 font-medium text-center max-w-lg mx-auto">
                <span className="text-purple-600 font-bold">Insight: </span> 
                {networkData.desc}
            </p>
        </div>

      </div>
    </div>
  );
};

export default PreventComp;