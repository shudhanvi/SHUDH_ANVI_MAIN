 
 import React, { useState } from "react"; // Import useState
import Alerts from "./Alerts";

 
const WardDetailsPopUp = ({ selectedWard, setSelectedWard, wardData }) => {
 
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'alerts'

  if (!selectedWard) return null;

  const wardDetails = selectedWard;
  const {
    "s.no": sNo,
    "S.no": SNo,
    Population,
    Total_sewer_length,
    area,
    landuse_classes,
    no_of_manholes,
    "no_of_robo's": noOfRobos,
    perimeter,
    ward_id,
    zone,
    Area_name,
    waste_colleccted,
  } = wardDetails;

  const finalSNo = sNo || SNo || wardDetails.s_no || "N/A";

  // 2. Define styles for active/inactive tabs
  const activeClasses = 
    "bg-[#1E9AB033] text-gray-900 text-gray-900  bold  hover:text-gray-800"
  const inactiveClasses = "text-gray-600 hover:text-gray-800";

  return (
    <div className="flex w-full h-max  relative flex-col p-2 rounded-xl   border-gray-400   shadow-gray-300">
      <div
        className="w-full flex justify-between items-center sticky -top-2 p-4 rounded-t-xl"
        style={{
          background:
            "linear-gradient(94.24deg, #1E9AB0 0%, #2A9FB4 43.66%, #87C4CF 99.59%)",
        }}
      >
        <div className="flex flex-col justify-center relative align-middle gap-2 text-white text-left">
          <h1 className="text-xl font-bold ">{`Ward: ${Area_name}`}</h1>
          <p className="text-[12px]">{`Ward :${zone}`}</p>
          <button
            type="button"
            className="btn-hover cursor-pointer"
            style={{
              backgroundColor: "green",
              padding: "10px 20px",
              borderRadius: "5px",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            onClick={() => confirm("Generated Report")}
          >
            Generate Report
          </button>
        </div>
        <button
          onClick={() => setSelectedWard("All")}
          className="absolute cursor-pointer top-5 right-2  text-black hover:text-gray-800 hover:rotate-180 transition-all duration-110"
        >
          <span className="text-2xl font-bold">&#x2715;</span>
        </button>
      </div>

      <div className="ward-table-box mt-4 px-2 justify-between">
        {/* 3. Add onClick handlers and conditional styling */}
        <div className="grid grid-cols-2 place-content-center  border-gray-200 justify-start items-center gap-4 border">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-4 cursor-pointer  ${
              activeTab === "details" ? activeClasses : inactiveClasses
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`py-2 px-4 flex items-right gap-2 cursor-pointer  place-content-center-safe ${
              activeTab === "alerts" ? activeClasses : inactiveClasses
            }`}
          >
            Alerts
            {/* You can add a real count here later if you want */}
            {/* <span className="bg-red-100 text-red-700 text-xs font-bold rounded-full px-2 py-0.5">5</span> */}
          </button>
        </div>

        {/* 4. Conditional Rendering for the content */}
        <div>
          {activeTab === "details" && (
            // This is your original Details table
            <>
            <table className="details-table mt-2 w-full bg-white shadow-md text-[12px] font-[400] border-1 border-gray-400 shadow-gray-400 rounded-b-md overflow-hidden text-left">
              <thead>
                <tr className="bg-gray-200 border border-gray-400">
                  <th className="p-2 border border-gray-400">FIELD</th>
                  <th className="p-2">VALUE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    S.No
                  </td>
                  <td className="p-2 border border-gray-400">{finalSNo}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Ward Name
                  </td>
                  <td className="p-2 border border-gray-400">{Area_name}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Ward ID
                  </td>
                  <td className="p-2 border border-gray-400">{ward_id}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    No. of Manholes
                  </td>
                  <td className="p-2 border border-gray-400">
                    {no_of_manholes}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Population
                  </td>
                  <td className="p-2 border border-gray-400">{Population}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Waste Collected (kgs)
                  </td>
                  <td className="p-2 border border-gray-400">
                    {waste_colleccted} kgs
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    No. of Robots
                  </td>
                  <td className="p-2 border border-gray-400">{noOfRobos}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Total Sewer Length (km)
                  </td>
                  <td className="p-2 border border-gray-400">
                    {Total_sewer_length}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Perimeter (m)
                  </td>
                  <td className="p-2 border border-gray-400">{perimeter}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border border-gray-400">
                    Land Use Classes
                  </td>
                  <td className="p-2 border border-gray-400">
                    {landuse_classes}
                  </td>
                </tr>
  
              </tbody>
            </table>
             <div className="demographics-box mt-4 text-left text-md px-2 py-3">
          <h3 className="section-title font-bold">Demographics</h3>
          <div className="demographics-card mt-2 rounded-lg p-4 py-3 shadow-md bg-gray-100 flex justify-between align-middle gap-2">
            <div className="area-label text-sm">Area:</div>
            <div className="area-value text-sm font-semibold">{area} sq.m</div>
          </div>
        </div>
            </>
            
          )}
           {activeTab === "alerts" && (
            // This is where your Alerts component goes
           <Alerts/>
          )}
           

        </div>
      </div>
                       

      {/* Demographics Box (Stays the same) */}
  
    </div>
  );
};

export default WardDetailsPopUp;