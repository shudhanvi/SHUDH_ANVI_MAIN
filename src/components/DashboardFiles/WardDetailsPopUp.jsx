

// // export default WardDetailsPopUp;
import React, { useState, useMemo } from "react"; // <-- Import useMemo
import Alerts from "./Alerts";


const WardDetailsPopUp = ({ wardData, alertData, onManholeSelect, onClose, selectedWard, setSelectedWard }) => { // Using onClose passed from MapComponent

  // console.log("WardDetailsPopUp received wardData:", wardData);
  const [activeTab, setActiveTab] = useState("details");
  // const [isLoading, setIsLoading] = useState(false); // For report loading state

  if (!wardData) {
    console.error("WardDetailsPopUp received ",wardData);
    return null; // Don't render if data is missing
  }

  // Destructure properties from wardData for easier access
  const {
    "s.no": sNo ,
    "S.no": SNo,
    Population,
    Total_sewer_length,
    area,
    landuse_classes,
    no_of_manholes,
    "no_of_robo's": noOfRobos,
    perimeter,
    ward_id,
    division, // Corresponds to 'division' for the API
    area_name,
    waste_colleccted,
  } = wardData;

  const Wardpopupdata={
   kondapur:{ 
    Population: "",
    SNo: "02",
    Total_sewer_length: "",
    area: "",
    area_name: "Kondapur",
    landuse_classes: "",
    noOfRobos: "01",
    no_of_manholes: "02",
    perimeter: "",
    sNo: "",
    ward_id: "",
    waste_colleccted: ""||"-",
    zone: ""
},
  somajiguda:{Population: "29,830 (approx)",
    SNo: "01",
    Total_sewer_length: "47719.45 kms",
    area: "1.19 sq.kms (approx)",
    area_name: "Somajiguda",
    landuse_classes: "03",
    noOfRobos: "50",
    no_of_manholes: "2324",
    perimeter: "",
    sNo: "",
    ward_id: "",
    waste_colleccted: "",
    zone: ""
  }
}
  // console.log("Destructured wardData:", { sNo, SNo, Population, Total_sewer_length, area, landuse_classes, no_of_manholes, noOfRobos, perimeter, ward_id, division, area_name, waste_colleccted });
  const finalSNo = sNo || SNo || wardData.s_no || "01";

  // --- Calculate total alert count using useMemo ---
  const totalAlertCount = useMemo(() => {
    if (!alertData) return 0; // Handle case where alertData might be "",/null initially
    return alertData.reduce((count, zoneGroup) => count + (zoneGroup.alerts?.length || 0), 0); // Safely sum lengths
  }, [alertData]);
  // --- End calculation ---

  // Define styles for active/inactive tabs based on your last provided code
  const activeClasses =
    "bg-[#1E9AB033] text-gray-900 font-bold hover:text-gray-800"; // Added font-bold for active
  const inactiveClasses = "text-gray-600 hover:text-gray-800";

  return (
    // Main container with overflow handling
    <div className="flex w-full h-max  relative flex-col  rounded-xl  border-gray-400   shadow-gray-300">
      <div
        className="w-full flex justify-between items-center sticky  top-0 p-4 rounded-t-xl "
        style={{
          background:
            "linear-gradient(94.24deg, #1E9AB0 0%, #2A9FB4 43.66%, #87C4CF 99.59%)",
        }}
      >
        <div className="flex flex-col justify-center relative align-middle gap-2 text-white text-left">
          <h1 className="text-xl font-bold ">{`Ward: ${area_name}`}</h1>
          <p className="text-[12px]">{`Division :${division}`}</p>

        </div>
        <button
          onClick={() => setSelectedWard("All")}
          className="absolute cursor-pointer top-5 right-6 text-black hover:text-gray-800 hover:rotate-180 transition-all duration-110"
        >
          <span className="text-2xl font-bold">&#x2715;</span>
        </button>
      </div>
      {/* Tab Container & Content */}
      <div className="ward-table-box mt-0 px-4 pt-2 flex flex-col flex-grow overflow-y-auto"> {/* Scrollable content */}
        {/* Tab Buttons (Grid layout) */}
        <div className="grid grid-cols-2 place-content-center border border-gray-300 rounded-md justify-start items-center gap-0 flex-shrink-0 mb-4 overflow-hidden">
          {/* Details Button */}
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 w-full text-center cursor-pointer text-sm font-medium ${activeTab === "details" ? activeClasses + ' border-r border-gray-300' : inactiveClasses + ' border-r border-gray-300'}`}
          >
            Details
          </button>
          {/* Alerts Button with Count */}
          <button
            onClick={() => setActiveTab("alerts")}
            className={`py-2 w-full text-center flex items-center justify-center gap-1.5 cursor-pointer text-sm font-medium ${activeTab === "alerts" ? activeClasses : inactiveClasses}`}
          >
            Alerts
            {/* Display count if > 0 */}
            {totalAlertCount > 0 && (
              <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${activeTab === 'alerts' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}>
                {totalAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Conditional Content */}
        <div className="flex-grow pb-4">
          {activeTab === "details" && (

            <>
              <table className="details-table mt-2 w-full bg-white shadow-md text-[15px] font-[400] border-1 border-gray-400 shadow-gray-400 rounded-b-md overflow-hidden text-left">
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
                    <td className="p-2 border border-gray-400">{area_name}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold border border-gray-400">
                      Ward ID
                    </td>
                    <td className="p-2 border border-gray-400">{ward_id ?? "17"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold border border-gray-400">
                      No. of Manholes
                    </td>
                    <td className="p-2 border border-gray-400">
                      {no_of_manholes ?? "2458"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold border border-gray-400">
                      Population
                    </td>
                    <td className="p-2 border border-gray-400">{Population ?? "N/A"}</td>
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
                    <td className="p-2 border border-gray-400">{noOfRobos ?? "155"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold border border-gray-400">
                      Total Sewer Length (km)
                    </td>
                    <td className="p-2 border border-gray-400">
                      {Total_sewer_length ?? "47719.45"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold border border-gray-400">
                      Perimeter (m)
                    </td>
                    <td className="p-2 border border-gray-400">{perimeter || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold border border-gray-400">
                      Land Use Classes
                    </td>
                    <td className="p-2 border border-gray-400">
                      {landuse_classes ?? "03"}
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
            </>)}

          {activeTab === "alerts" && (
            // Pass the alertData prop down
            <Alerts alertData={alertData} onManholeSelect={onManholeSelect} />
          )}
        </div>
      </div>

      {/* Optional: Add a Popup/Modal component here to display reportData */}
      {/* {showPopup && <ReportPopup data={reportData} onClose={() => setShowPopup(false)} />} */}

    </div>
  );
};

export default WardDetailsPopUp;



