import React, { useState, useEffect, useMemo, useRef } from 'react'; // <-- Import useRef
import DashAccordian from './DashAccordian';

const ManholePopUp = ({
  selectedLocation,
  onClose,
  onGenerateReport,
  onAssignBot,
}) => {
  // State for Blynk Data
  const [blynkWaterLevel, setBlynkWaterLevel] = useState(null);
  const [isBlynkLoading, setIsBlynkLoading] = useState(false); // For initial load
  const [blynkError, setBlynkError] = useState(null);
  const intervalIdRef = useRef(null); // Ref to store interval ID for cleanup

  // console.log("ManholePopUp received selectedLocation:", selectedLocation);

  // --- Effect to Fetch Blynk Data Periodically ---
  useEffect(() => {
    // Function to fetch data from Blynk
    const fetchBlynkData = async (initialLoad = false) => {
      // Only set loading state on the very first fetch for this selection
      if (initialLoad) {
        setIsBlynkLoading(true);
        // Reset errors only on initial load for a new selection
        setBlynkError(null);
      }

      // TODO: Dynamic dataStreamId mapping needed for real app
      const blynkApiUrl = `https://blynk.cloud/external/api/get?token=uIoyHjYevzfdrBa0gYu-VYfuFqFurr6q&dataStreamId=2`;
      const controller = new AbortController(); // New controller for each fetch attempt
      const signal = controller.signal;

      try {
        const response = await fetch(blynkApiUrl, { signal });
        if (!response.ok) {
          throw new Error(`Blynk API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.text();
        // console.log("Blynk API Data:", data); // Keep for debugging if needed
        const level = parseFloat(data);
        if (!isNaN(level)) {
          setBlynkWaterLevel(level);
          // Clear error if a subsequent fetch succeeds
          if (!initialLoad && blynkError) setBlynkError(null);
        } else {
          throw new Error("Received non-numeric data from Blynk");
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching Blynk data:", error);
          setBlynkError(error.message);
          setBlynkWaterLevel(null); // Clear data on error
        }
      } finally {
        // Only set loading to false after the initial load attempt
        if (initialLoad) {
          setIsBlynkLoading(false);
        }
      }
      // Note: We don't return the controller here as interval cleanup handles abort
    };

    // --- Main Effect Logic ---
    if (selectedLocation && selectedLocation.id) {
      // Clear previous interval if it exists
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      // Fetch immediately when the component mounts or selectedLocation changes (initial load)
      fetchBlynkData(true);

      // Set up the interval to fetch every 5 seconds (5000 milliseconds)
      intervalIdRef.current = setInterval(() => {
        fetchBlynkData(false); // Subsequent fetches are not initial loads
      }, 5000);

    } else {
      // If no location selected, clear interval and reset state
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      setBlynkWaterLevel(null);
      setBlynkError(null);
      setIsBlynkLoading(false);
    }

    // Cleanup function: Clear interval when component unmounts or selectedLocation changes
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        // console.log('Blynk fetch interval cleared');
      }
    };
  }, [selectedLocation]); // Re-run effect ONLY when selectedLocation changes
  // --- End Effect ---


  // Original logic - return null if no location selected
  if (!selectedLocation) return null;

  // Helper functions (getStatusColorFromStatus, getStatusIcon) remain the same
  const getStatusColorFromStatus = (status) => { /* ... */ };
  const getStatusIcon = (status) => { /* ... */ };
  const riskLevel = (depth, waterLevel) => { /* ... */ };

  // Destructure original depth
  const { depth_manhole_m: depth } = selectedLocation;

  // Calculate Risk using Blynk Data (useMemo remains the same)
  const risk = useMemo(() => {
    const currentWaterLevel = (blynkWaterLevel !== null && !blynkError) // Removed !isBlynkLoading check here
      ? blynkWaterLevel
      : null;
    return riskLevel(parseFloat(depth), currentWaterLevel);
  }, [depth, blynkWaterLevel, blynkError]); // Dependency on blynkError added


  // Get header color (unchanged)
  const popupHeaderColor = getStatusColorFromStatus(selectedLocation.status);

  // Helper to display Blynk Water Level (Now doesn't show "Loading..." after initial load)
  const displayBlynkWaterLevel = () => {
    if (isBlynkLoading) return <span className="text-gray-500 italic">Loading...</span>; // Only show Loading... initially
    if (blynkError) return <span className="text-red-500 italic">Error</span>;
    if (blynkWaterLevel !== null) return `${blynkWaterLevel.toFixed(2)} Inch`;
    return 'N/A';
  };

  return (
    // --- JSX Structure Remains the Same ---
    <div className="manhole-popup-box bg-grey-50 rounded-xl border-t-0 border-[#333] w-full flex flex-col h-full max-h-full">
      {/* Header */}
      <div className="w-full flex justify-between rounded-t-xl items-center border-[1px] m-auto gap-2 p-4   sticky top-0 bg-white z-10 flex-shrink-0">
        <h4 className="font-[600] text-black">Manhole Details</h4>
        <button
          onClick={onClose}
          className="cursor-pointer text-black hover:text-gray-800 hover:rotate-180 transition-all duration-110"
        >
          <span className="text-2xl font-bold">&#x2715;</span>
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto px-2">

        {/* Info Box */}
        <div className="w-[95%] m-auto rounded-xl flex justify-center items-center p-3 my-4 gap-2 bg-[#FEF9E6]">
          {/* ... Manhole, Ward, Division, Location ... */}
          <div className="manholePopupBox1 w-full flex flex-col justify-center gap-2 text-[12px] text-left text-[#717182]">
            <h4 className="font-[400] grid grid-cols-2 items-center">
              Manhole :{" "}
              <span className="font-[500] text-right text-[#0A0A0A] flex justify-end items-center gap-1">
                {getStatusIcon(selectedLocation.status)}
                {selectedLocation.manhole_id || selectedLocation.id}
              </span>{" "}
            </h4>
            <h4 className="font-[400] grid grid-cols-2">
              Ward :{" "}
              <span className="font-[400] text-right text-[#0A0A0A]">
                {selectedLocation.Area_name || "N/A"}
              </span>{" "}
            </h4>
            <h4 className="font-[400] grid grid-cols-2">
              Division :{" "}
              <span className="font-[400] text-right text-[#0A0A0A]">
                {selectedLocation.Division || "N/A"}
              </span>{" "}
            </h4>
            <h4 className="font-[400] grid grid-cols-2">
              Location :{" "}
              <span className="text-[12px] text-right text-[#0A0A0A]">
                {selectedLocation.latitude?.toFixed(6) || "N/A"},{" "}
                {selectedLocation.longitude?.toFixed(6) || "N/A"}
              </span>{" "}
            </h4>
            {/* --- Display Live Water Level (Uses updated helper) ---
             <h4 className="font-[400] grid grid-cols-2">
                 Live Water Level:{" "}
                 <span className="font-[500] text-right text-[#0A0A0A]">
                    {displayBlynkWaterLevel()}
                 </span>{" "}
             </h4>
             {/* --- Display Calculated Risk (Uses updated calculation) --- */}
            {/* <h4 className="font-[400] grid grid-cols-2">
                 Risk Level:{" "}
                 <span className="font-[500] text-right text-[#0A0A0A]">
                    {risk}%
                 </span>{" "}
             </h4> */}
          </div>
        </div>

        {/* Separated Water Level Display Box */}
        <div className="px-2 py-2 m-2 rounded-md border flex place-content-center">
          {/* This box seems redundant now that level is in the main info box */}
          {/* Consider removing this or repurposing it */}
          <h4 className="font-[400] text-right grid grid-cols-2 ">
            Water Level:{" "}
            <span className="font-[500] text-right text-[#0A0A0A]">
              {displayBlynkWaterLevel()}
            </span>{" "}
          </h4>

        </div>


        {/* Accordion */}
        <div className="mb-4">
          <DashAccordian />
        </div>

      </div> {/* End Scrollable Content Area */}

      {/* Buttons Footer */}
      <div className="w-full flex justify-around items-center gap-2 my-0 px-4 py-3 border-t border-gray-200 flex-shrink-0 bg-white">
        <button
          onClick={() => onGenerateReport("maintenance")}
          className="manhole-popup-btn w-1/2 text-[10px] whitespace-nowrap self-center border border-[#16A249] text-[#16A249] hover:text-white hover:bg-[#16A249] px-6 py-2 rounded-lg font-medium cursor-pointer btn-hover transition-all"
        >
          Generate Report
        </button>
        <button
          onClick={() => {
            onClose();
            alert("Bot assignment requested.");
          }}
          className="manhole-popup-btn w-1/2 text-[10px] whitespace-nowrap self-center bg-[#1E9AB0] text-white px-6 py-2 rounded-lg font-medium cursor-pointer btn-hover transition-all duration-120"
        >
          Assign a Bot
        </button>
      </div>
    </div>
  );
};

export default ManholePopUp;