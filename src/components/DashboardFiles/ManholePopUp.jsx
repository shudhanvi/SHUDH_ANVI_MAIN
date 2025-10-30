 
import { useState, useEffect, useMemo, useRef } from 'react'; // Import React hooks
import DashAccordian from './DashAccordian'; // Assuming this component exists

const ManholePopUp = ({
  selectedLocation,
  onClose,
  onGenerateReport,
  onAssignBot,
}) => {
  // --- State for Blynk Data ---
  const [blynkWaterLevel, setBlynkWaterLevel] = useState(null); // Store fetched level
  const [isBlynkLoading, setIsBlynkLoading] = useState(false); // For initial load
  const [blynkError, setBlynkError] = useState(null);
  const intervalIdRef = useRef(null); // Ref to store interval ID for cleanup

  // console.log("ManholePopUp received selectedLocation:", selectedLocation); // Keep for debugging if needed

  // --- Effect to Fetch Blynk Data Periodically ---
  useEffect(() => {
    // Function to fetch data from Blynk
    const fetchBlynkData = async (initialLoad = false) => {
      if (initialLoad) {
        setIsBlynkLoading(true);
        setBlynkError(null);
      }

      // TODO: Dynamic dataStreamId mapping needed for real app
      const blynkApiUrl = `https://blynk.cloud/external/api/get?token=uIoyHjYevzfdrBa0gYu-VYfuFqFurr6q&dataStreamId=2`; // Ensure Token is correct
      const controller = new AbortController();
      const signal = controller.signal;

      try {
        const response = await fetch(blynkApiUrl, { signal });
        if (!response.ok) {
          throw new Error(`Blynk API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.text();
        const level = parseFloat(data);
        if (!isNaN(level)) {
          setBlynkWaterLevel(level);
          if (!initialLoad && blynkError) setBlynkError(null);
        } else {
          throw new Error("Received non-numeric data from Blynk");
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching Blynk data:", error);
          setBlynkError(error.message);
          setBlynkWaterLevel(null);
        }
      } finally {
        if (initialLoad) {
          setIsBlynkLoading(false);
        }
      }
    };

    // --- Main Effect Logic ---
    if (selectedLocation && selectedLocation.id) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      fetchBlynkData(true); // Fetch immediately
      intervalIdRef.current = setInterval(() => {
        fetchBlynkData(false); // Fetch every 5 seconds
      }, 5000);
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      setBlynkWaterLevel(null);
      setBlynkError(null);
      setIsBlynkLoading(false);
    }

    // Cleanup function
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [selectedLocation, blynkError]); // Added blynkError dependency to potentially clear error state

  // --- Component Logic ---
  if (!selectedLocation) return null;

  // --- Helper function to get color based on status string ---
  const getStatusColorFromStatus = (status) => {
    switch (status) {
      case 'safe': return "#16A249";
      case 'warning': return "#E7B008";
      case 'danger': return "#EF4343";
      default: return "#808080"; // Grey for unknown status
    }
  };

  // --- Helper function to render the status icon ---
  const getStatusIcon = (status) => {
    const color = getStatusColorFromStatus(status);
    // console.log("Status Icon Color:", color, status); // Keep for debugging if needed
    return (
      <div
        className="rounded-full w-[15px] h-[15px] aspect-square border-2 border-white shadow-md shadow-[0px_3.36px_5.04px_-3.36px_#0000001A;]"
        style={{ backgroundColor: color }}
      ></div>
    );
  };

  // --- Helper function to calculate risk level ---
  const riskLevel = (depth, waterLevel) => {
    if (depth <= 0 || waterLevel === null || waterLevel === undefined) return 0; // Handle invalid inputs
    let risk = (waterLevel / depth) * 100;
    if (risk > 100) risk = 100;
    if (risk < 0) risk = 0;
    return parseFloat(risk.toFixed(1));
  };

  // Destructure needed properties from selectedLocation
  const { depth_manhole_m: depth } = selectedLocation;

  // Calculate Risk using useMemo for efficiency
  const risk = useMemo(() => {
    const currentWaterLevel = (blynkWaterLevel !== null && !blynkError)
                                 ? blynkWaterLevel
                                 : null; // Fallback to null if error or no data
    return riskLevel(parseFloat(depth), currentWaterLevel);
  }, [depth, blynkWaterLevel, blynkError]);

  // Helper to display Blynk Water Level state
  const displayBlynkWaterLevel = () => {
      if (isBlynkLoading) return <span className="text-gray-500 italic">Loading...</span>;
      if (blynkError) return <span className="text-red-500 italic">Error</span>;
      if (blynkWaterLevel !== null) return `${blynkWaterLevel.toFixed(2)} Inch`;
      return 'N/A';
  };

  // --- Render JSX ---
  return (
    <div className="manhole-popup-box bg-grey-50 rounded-xl border-t-0 border-[#333] w-full flex flex-col h-full max-h-full">
      {/* Header */}
      <div className="w-full flex justify-between rounded-t-xl items-center border-[1px] m-auto gap-2 p-4 sticky top-0 bg-white z-10 flex-shrink-0">
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
          <div className="manholePopupBox1 w-full flex flex-col justify-center gap-2 text-[12px] text-left text-[#717182]">
            {/* Manhole ID with Status Icon */}
            <h4 className="font-[400] grid grid-cols-2 items-center">
              Manhole :{" "}
              <span className="font-[500] text-right text-[#0A0A0A] flex justify-end items-center gap-1">
                {getStatusIcon(selectedLocation.status)} {/* Status Icon */}
                {selectedLocation.manhole_id || selectedLocation.id} {/* ID */}
              </span>{" "}
            </h4>
            {/* Ward */}
            <h4 className="font-[400] grid grid-cols-2">
              Ward :{" "}
              <span className="font-[400] text-right text-[#0A0A0A]">
                {selectedLocation.Area_name || "N/A"}
              </span>{" "}
            </h4>
            {/* Division */}
            <h4 className="font-[400] grid grid-cols-2">
              Division :{" "}
              <span className="font-[400] text-right text-[#0A0A0A]">
                {selectedLocation.Division || "N/A"}
              </span>{" "}
            </h4>
            {/* Location */}
            <h4 className="font-[400] grid grid-cols-2">
              Location :{" "}
              <span className="text-[12px] text-right text-[#0A0A0A]">
                {selectedLocation.latitude?.toFixed(6) || "N/A"},{" "}
                {selectedLocation.longitude?.toFixed(6) || "N/A"}
              </span>{" "}
            </h4>
            {/* Live Water Level */}
            
          </div>
        </div>

        {/* Separated Water Level Display Box (Optional) */}
        <div className="px-2 py-2 m-2 rounded-md border flex place-content-center">
              <h4 className="font-[400] grid grid-cols-2">
                 Live Water Level:{" "}
                 <span className="font-[500] text-right text-[#0A0A0A]">
                    {displayBlynkWaterLevel()}
                 </span>{" "}
             </h4>
{/*             
              <h4 className="font-[400] grid grid-cols-2">
                 Risk Level:{" "}
                 <span className="font-[500] text-right text-[#0A0A0A]">
                    {risk}%
                 </span>{" "}
             </h4> */}
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
            alert("Bot assignment requested."); // Consider using a less disruptive notification
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