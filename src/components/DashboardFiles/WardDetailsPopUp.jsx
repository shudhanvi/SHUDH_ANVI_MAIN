

// // export default WardDetailsPopUp;
import React, { useState, useMemo } from "react"; // <-- Import useMemo
import Alerts from "./Alerts";
 

const WardDetailsPopUp = ({ wardData, alertData, onManholeSelect, onClose, selectedWard, setSelectedWard }) => { // Using onClose passed from MapComponent

  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false); // For report loading state
 
  if (!wardData) {
     console.error("WardDetailsPopUp received undefined wardData prop.");
     return null; // Don't render if data is missing
  }

  // Destructure properties from wardData for easier access
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
    zone, // Corresponds to 'division' for the API
    Area_name,
    waste_colleccted,
  } = wardData;

  const finalSNo = sNo || SNo || wardData.s_no || "N/A";

  // --- Calculate total alert count using useMemo ---
  const totalAlertCount = useMemo(() => {
    if (!alertData) return 0; // Handle case where alertData might be undefined/null initially
    return alertData.reduce((count, zoneGroup) => count + (zoneGroup.alerts?.length || 0), 0); // Safely sum lengths
  }, [alertData]);
  // --- End calculation ---

  // Define styles for active/inactive tabs based on your last provided code
  const activeClasses =
    "bg-[#1E9AB033] text-gray-900 font-bold hover:text-gray-800"; // Added font-bold for active
  const inactiveClasses = "text-gray-600 hover:text-gray-800";

  // Function to handle report generation API call
  const handleOpenReport = async () => {
    setIsLoading(true);
    // setReportData(null); // Reset report data if managing state here
    // setShowPopup(false); // Hide previous popup if managing state here
    const payload = {
      division: zone,
      area: Area_name,
      command: "generate_ward_report",
    };

    console.log("Sending payload to backend:", payload);

    try {
      // --- Replace with your actual API endpoint ---
      // MOCK RESPONSE:
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      const mockResponseData = {
              message: "Report generated successfully (mock)",
              data: { /* ... mock data ... */ }
      };
      const response = {
          ok: true, status: 200,
          json: async () => (mockResponseData)
      };
      // const response = await fetch(backendApi.wardsReportUrl, { method: "POST", /*...*/ });
      // --- END MOCK / Replace ---

      if (!response.ok) {
        if (response.status === 400) {
           const errorData = await response.json().catch(() => ({ message: "Server returned a 400 Bad Request." }));
           throw new Error(`Server validation error: ${JSON.stringify(errorData)}`);
         }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);
      // setReportData(data); // Uncomment if managing state here
      // setShowPopup(true);  // Uncomment if managing state here
      alert("Report generated successfully! (Check console for mock data)"); // Simple alert for now
    } catch (error) {
      console.error("Error fetching ward report:", error);
      alert(`Failed to generate the report. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    // Main container with overflow handling
        <div className="flex w-full h-max  relative flex-col p-2 rounded-xl   border-gray-400   shadow-gray-300">
      <div
        className="w-full flex justify-between items-center sticky top-2 p-4 rounded-t-xl"
        style={{
          background:
            "linear-gradient(94.24deg, #1E9AB0 0%, #2A9FB4 43.66%, #87C4CF 99.59%)",
        }}
      >
        <div className="flex flex-col justify-center relative align-middle gap-2 text-white text-left">
          <h1 className="text-xl font-bold ">{`Ward: ${Area_name}`}</h1>
          <p className="text-[12px]">{`Division :${zone}`}</p>
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
            onClick={() => handleOpenReport()}
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
      {/* Tab Container & Content */}
      <div className="ward-table-box mt-0 px-4 pt-3 flex flex-col flex-grow overflow-y-auto"> {/* Scrollable content */}
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
            </> )}

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