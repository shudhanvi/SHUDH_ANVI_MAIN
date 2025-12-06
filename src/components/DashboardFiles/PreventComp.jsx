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
  };

  const zoneData = {
    targets: ["MH0621-06-68", "MH0621-03-117", "MH0621-04-215", "MH0621-02-352", "MH0621-05-75"]
  };

  const networkData = {
    desc: "Simulation indicates blockage at MH0621-04-19 will cause backflow into residential lines within 48 hours."
  };

  const inflowData = [
    { id: "MH0621-04-108", issue: "High inflow surge detected – check top cover sealing." },
    { id: "MH0621-04-355", issue: "Water ingress under heavy rain – inspect side wall leaks." },
    { id: "MH0621-04-355", issue: "Repeated water entry events – verify lid settlement." },
    { id: "MH0621-07-114", issue: "Possible ground water inflow – CCTV inspection recommended." }
  ];

  // Shared Styles
  const cardBase = "bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden w-full h-full";
  const cardPad = "p-5";

  return (
    <div className="w-full max-w-[700px] mx-auto mt-8 font-sans bg-white px-[25px] py-[30px] rounded-2xl shadow-sm border border-gray-100">
      
      {/* WEATHER ALERT HEADER */}
 
      <div className="flex flex-col gap-5">

        {/* --- TOP ROW: FLEET & ADVANCE CLEANING (Side by Side) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. FLEET REASSIGNMENT */}
            <div className={cardBase}>
            <div className={cardPad}>
                <h5 className="text-md font-bold text-gray-800 mb-1">Workload Reassignment</h5>
                <p className="text-xs text-gray-400 mb-4">  BALANCE ROBOT LOAD BEFORE RAIN</p>
                
                <div className="space-y-4">
                    {/* Overloaded */}
                    <div>
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            High Load (Reduce Usage)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {fleetData.overutilized.slice(0, 5).map(id => (
                            <span key={id} className="text-xs font-mono bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded">
                                {id}
                            </span>
                            ))}
                        </div>
                    </div>

                    {/* Deploy */}
                    <div>
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Available for Deployment
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {fleetData.underutilized.map(id => (
                            <span key={id} className="text-xs font-mono bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded font-bold shadow-sm">
                                {id}
                            </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* 2. ADVANCE CLEANING */}
            <div className={cardBase}>
            <div className={cardPad}>
                <div className="flex justify-between items-start mb-3">
                <div>
                    <h5 className="text-md font-bold text-gray-800 leading-tight">Advance Cleaning</h5>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                    Predicted High-Risk Manholes
                    </p>
                </div>
                </div>
            
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
                <p className="text-xs font-medium text-blue-800 italic leading-snug">
                    Clean these manholes in advance; they are predicted to clog next.
                </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                {zoneData.targets.map((target) => (
                    <div 
                    key={target} 
                    className="text-[10px] font-mono px-2 py-1.5 rounded border border-gray-200 bg-white text-gray-700 font-semibold shadow-sm flex items-center gap-1"
                    >
                    {target}
                   
                    </div>
                ))}
                </div>

                <p className="text-[10px] text-gray-400 mt-3 font-medium flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                All approaching predicted next cleaning date
                </p>
            </div>
            </div>
        </div>


        {/* --- BOTTOM ROW: NETWORK & INFLOW (Side by Side) --- */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
         
            <div className={cardBase}>
                 
            {/* 3. NETWORK VULNERABILITY */}<div className="p-5 border-gray-100">
                        <h5 className="text-md font-bold text-gray-800">Network Vulnerability</h5>
                        <p className="text-xs text-gray-500">Predictive Flow Modeling</p>
                    </div>
                <div className="p-0 flex flex-col h-full">
                    
                    
                    <div className="w-full h-[450px] bg-slate-50 relative overflow-hidden">
                        <img 
                            src="/images/network.jpeg" 
                            alt="Network Map" 
                            className="w-full h-auto object-fit" 
                            onError={(e) => {e.target.style.display='none'}}
                        />
                    </div>

              
                <div className="p-5">
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                            <span className="text-gray-900 font-extrabold">Insight: </span> 
                            {networkData.desc}
                        </p>
                    </div>
                      </div>
            </div>
            
                    

            {/* 4. MONITOR HIGH-INFLOW */}
            <div className={cardBase}>
            <div className={cardPad}>
                <div className="flex justify-between items-start mb-3">
                <div>
                    <h5 className="text-md font-bold text-gray-800 leading-tight">Monitor High-Inflow</h5>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                    During Rainfall
                    </p>
                </div>
                <span className="bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-[10px] font-bold border border-cyan-100 flex items-center gap-1">
                    Alert
                </span>
                </div>
            
                <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-lg mb-4">
                <p className="text-xs font-medium text-cyan-900 italic leading-snug">
                    "Check sealing and water entry in these manholes during rainfall."
                </p>
                </div>
                
                <div className="space-y-3">
                {inflowData.map((item, index) => (
                    <div key={index} className="flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 w-max px-1.5 py-0.5 rounded mb-1 border border-cyan-100">
                        {item.id}
                    </span>
                    <p className="text-xs text-gray-600 font-medium leading-tight pl-1">
                        {item.issue}
                    </p>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PreventComp;