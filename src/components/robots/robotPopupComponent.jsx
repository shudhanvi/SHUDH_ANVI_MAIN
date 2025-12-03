import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup as LeafletPopup, useMap } from "react-leaflet";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "leaflet/dist/leaflet.css";
import DatePicker from "react-datepicker";
import {
  MapPin,
  MapPinned,
  Bot,
  Calendar,
  Clock,
  Trash,
  Funnel,
  CalendarIcon,
  ClockIcon,
  Download,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OperationPopup } from "./OperationPopup";
// ✅ Fix Leaflet marker issue for Vite/Render builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});


export const RobotPopupComponent = ({ activeRecord, closePopup }) => {
  const [detailedFromDate, setDetailedFromDate] = useState(null);
  const [detailedToDate, setDetailedToDate] = useState(null);
  const [detailedFilteredData, setDetailedFilteredData] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showOperationPopup, setShowOperationPopup] = useState(false);


  // ✅ Consistent Date & Time formatting (DD/MM/YYYY and 24-hour HH:mm:ss)
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };



  useEffect(() => {
    // Disable background scroll
    document.body.style.overflow = "hidden";

    return () => {
      // Re-enable scroll when popup closes
      document.body.style.overflow = "auto";
    };
  }, []);


  // Initialize filtered data to all operation history initially
  useEffect(() => {
    if (activeRecord?.operation_history) {
      setDetailedFilteredData(activeRecord.operation_history);
    }
  }, [activeRecord]);

  const applyFilter = () => {
    if (!activeRecord?.operation_history) {
      setDetailedFilteredData([]);
      return;
    }

    const filtered = activeRecord.operation_history.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const fromValid = detailedFromDate ? itemDate >= detailedFromDate : true;
      const toValid = detailedToDate ? itemDate <= detailedToDate : true;
      return fromValid && toValid;
    });

    setDetailedFilteredData(filtered);
  };
  // Determine which record to show in right panel
  const currentRecord = selectedHistory || activeRecord;



  let lat = currentRecord?.latitude;
  let lng = currentRecord?.longitude;
  const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
  };


  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-transparent bg-opacity-50 z-[910]">
      <div className="w-full h-screen bg-[#00000099] flex place-content-center">
        <div className="mx-auto bg-white w-full max-w-[1000px] rounded-lg px-6 overflow-y-auto max-h-[100vh] relative top-5 shadow-2xl border border-gray-297 custom-scrollbar">
          <button
            onClick={closePopup}
            className="popup-btn absolute right-6 text-gray-500 hover:text-black text-5xl top-[10px] cursor-pointer "
          >
            ×
          </button>

          {/* Header */}
          <div className="flex flex-row justify-between pt-5">
            <div className="text-start w-[48%]">
              <h1 className="text-start text-[18px] mb-2">Operational Details</h1>
            </div>
            <div className="text-start w-[48%]">
              <h1 className="text-start text-[18px] mb-2">Operation History</h1>
            </div>
          </div>

          <div className="flex flex-row justify-between px-1">
            {/* Left Panel */}
            <div className="w-[48%]">
              <div className="flex flex-col justify-start text-gray-500 w-full">
                <span className="text-start text-[14px] text-[#676D7E]">
                  <MapPin className="inline-block w-4 mr-2 mb-1 text-blue-600" />
                  Division: {currentRecord?.division || "- "}
                </span>
                <br />
                <span className="text-start text-[14px] text-[#676D7E]">
                  <MapPinned className="inline-block w-4 mr-2 mb-1 text-blue-500" />
                  Section: {currentRecord?.area || "- "}
                </span>
              </div>

              <div className="grid grid-cols-2 w-full text-start text-[14px] text-[#676D7E] mt-5 gap-y-6">
                <span className="flex flex-row">
                  <Bot className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2 text-[14px]">
                    Device Id
                    <span className="text-[#21232C] text-[16px]">{currentRecord.device_id}</span>
                  </span>
                </span>
                <span className="flex flex-row">
                  <Calendar className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2">
                    Date
                    <span className="text-[#21232C] text-[16px]">
                      {formatDate(currentRecord.timestamp)}
                    </span>
                  </span>
                </span>
                <span className="flex flex-row">
                  <Clock className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2">
                    Starting Time
                    <span className="text-[#21232C] text-[16px]">
                      {formatTime(currentRecord.timestamp)}
                    </span>
                  </span>
                </span>
                <span className="flex flex-row">
                  <Clock className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2">
                    Ending Time
                    <span className="text-[#21232C] text-[16px]">
                      {formatTime(currentRecord.timestamp)}
                    </span>
                  </span>
                </span>
                <span className="flex flex-row">
                  <Clock className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2">
                    Task Duration
                    {/* <span className="text-[#21232C] text-[16px]">{currentRecord?.operation_time_minutes || "-"} secs</span> */}
                    <span className="text-[#21232C] text-[16px]">
                      {(() => {
                        const totalSecs = Number(currentRecord?.operation_time_minutes);
                        if (isNaN(totalSecs) || totalSecs < 0) return "-";

                        const hours = Math.floor(totalSecs / 3600);
                        const minutes = Math.floor((totalSecs % 3600) / 60);
                        const seconds = Math.floor(totalSecs % 60);

                        let result = "";

                        if (hours > 0) result += `${hours} hr${hours > 1 ? "s" : ""} `;
                        if (minutes > 0) result += `${minutes} min${minutes > 1 ? "s" : ""} `;
                        if (seconds > 0 || result === "") result += `${seconds} sec${seconds !== 1 ? "s" : ""}`;

                        return result.trim();
                      })()}
                    </span>

                  </span>
                </span>
                
                <span>
                  <MapPin className="inline-block w-10 h-10 mr-3 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  {currentRecord.area}
                </span>
              </div>


              <div className="w-full h-50 text-start text-[#21232C] mt-[24px] bg-gray-100 rounded-lg p-2">
                <div className="flex flex-row justify-between">
                  <h1 className="pb-1 text-start">
  {currentRecord?.latitude && currentRecord?.longitude
    ? `${Number(currentRecord.latitude).toFixed(5)}, ${Number(currentRecord.longitude).toFixed(5)}`
    : "-"
  }
</h1>

                  <h1>Manhole ID : {currentRecord?.manhole_id}</h1>
                </div>

                <div className="bd-gray">
                  {currentRecord &&
                    !isNaN(Number(currentRecord.latitude)) &&
                    !isNaN(Number(currentRecord.longitude)) ? (
                    <MapContainer
                      center={[
                        Number(currentRecord.latitude),
                        Number(currentRecord.longitude),
                      ]}
                      zoom={15}
                      className="h-40 rounded-lg"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />

                      <Marker
                        position={[
                          Number(currentRecord.latitude),
                          Number(currentRecord.longitude),
                        ]}
                      >
                        <LeafletPopup>
                          {currentRecord.area || currentRecord.section || "Unknown Location"}
                        </LeafletPopup>
                      </Marker>

                      <RecenterMap
                        lat={Number(currentRecord.latitude)}
                        lng={Number(currentRecord.longitude)}
                      />
                    </MapContainer>
                  ) : (
                    <p className="text-gray-500 flex items-center justify-center h-40">
                      No location available
                    </p>
                  )}
                </div>
              </div>
              {/* {console.log("LatLng:", lat, lng)} */}

              {/* Images and Report */}
              <h1 className="text-[16px] text-[#21232C] mt-[24px] text-start">Operation Images</h1>
              <div className="rounded-lg mt-2 w-full bg-gray-100 overflow-y-auto">
                <div className="flex justify-around px-2">
                  <h1 className="mt-2">Before</h1>
                  <h1 className="mt-2">After</h1>
                </div>
                <div className="grid grid-cols-2 gap-2  mb-2 h-[165px]">
                  <div className="flex flex-col  gap-2">
                    {currentRecord?.images?.some((op) => op.before)
                      ? currentRecord.images.map((op, i) => op.before && <img key={`before-${i}`} src={op.before} alt={`Before ${i}`} className="h-full object-cover rounded-lg border border-gray-100" />)
                      : <img src={currentRecord.before_path} alt="No Before" className="h-full object-cover rounded-lg border" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    {currentRecord?.images?.some((op) => op.after)
                      ? currentRecord.images.map((op, i) => op.after && <img key={`after-${i}`} src={op.after} alt={`After ${i}`} className="h-full object-cover rounded-lg border border-gray-100" />)
                      : <img src={currentRecord.after_path} alt="No After" className="h-full object-cover rounded-lg border" />}
                  </div>
                </div>

              </div>

              <div className="flex justify-center w-full my-[20px] mb-10">
                {/* <button
                  onClick={() => alert("Report Generated Successfully")}
                  className="flex items-center justify-center h-[48px] bg-[#1A8BA8] text-[16px] w-full text-white rounded-[16px] cursor-pointer btn-hover"
                >
                  <Download className="inline-block w-5 h-5 mr-1" color="white" />
                  Generate Operation Report
                </button> */}

                <button
                  // onClick={() => setShowOperationPopup(true)}
                  className="flex items-center justify-center h-[48px] bg-[#1A8BA8] text-[16px] w-full text-white rounded-[16px] cursor-pointer btn-hover"
                >
                  <Download className="inline-block w-5 h-5 mr-1" color="white" />
                  Generate Operation Report
                </button>



              </div>
            </div>


            {/* Right Panel - Operation History */}
            <div className="w-[48%]">
              <div className="flex flex-row">
                <span className="inline-block text-[#676D7E] mr-2">
                  <Funnel />
                </span>
                <h1 className="text-start text-[14px]"> Filter by Date Range </h1>
              </div>
              <div className="flex flex-row w-full justify-between mb-5 mt-3 gap-2">
                <div className="text-start w-[45%] mt-2 relative">
                  <label className="block text-[16px] text-[#676D7E] mb-1">From Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={detailedFromDate}
                      onChange={(date) => setDetailedFromDate(date)}
                      dateFormat="dd-MM-yyyy"
                      className="border border-gray-300 rounded-md p-2 w-full text-sm pr-8"
                      placeholderText="Select From Date"
                      maxDate={new Date()}
                    />
                    {detailedFromDate && (
                      <button
                        type="button"
                        onClick={() => setDetailedFromDate(null)}
                        className="absolute right-2 top-[10px]  text-black rounded-full w-4 h-4 flex items-center justify-center text-xs  transition cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-start w-[45%] mt-2 relative">
                  <label className="block text-[16px] text-[#676D7E] mb-1">To Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={detailedToDate}
                      onChange={(date) => setDetailedToDate(date)}
                      dateFormat="dd-MM-yyyy"
                      className="border border-gray-300 rounded-md p-2 w-full text-sm pr-8"
                      placeholderText="Select To Date"
                      maxDate={new Date()}
                    />
                    {detailedToDate && (
                      <button
                        type="button"
                        onClick={() => setDetailedToDate(null)}
                        className="absolute right-2 top-[10px]  text-black rounded-full w-4 h-4 flex items-center justify-center text-xs  transition cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    className="bg-[#1A8BA8] cursor-pointer text-white rounded-md h-10 text-sm px-6 mt-8.5 btn-hover"
                    onClick={applyFilter}
                  >
                    Filter
                  </button>
                </div>
              </div>
              <div className="h-80 shadow overflow-y-auto rounded-md py-[8px] px-[10px] custom-scrollbar">
                <ul className="space-y-3">
                  {detailedFilteredData.length > 0 ? (
                    // ✅ Sort by timestamp (latest first)
                    [...detailedFilteredData]
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((history, index) => {
                        const isActive = selectedHistory?.timestamp === history.timestamp;
                        return (
                          <li
                            key={index}
                            className={`flex items-center justify-between h-12 transition-all px-[4px] ${isActive ? "bg-gray-200" : ""
                              }`}
                          >
                            <div>
                              <span className="mr-8 text-[16px]">
                                <CalendarIcon className="h-4 inline-block" />
                                {formatDate(history.timestamp)}

                              </span>
                              <span className="mr-8 text-[16px]">
                                <ClockIcon className="h-4 inline-block" />
                                {formatTime(history.timestamp)}

                              </span>
                            </div>
                            <button
                              className="btn-view-more flex items-center rounded-[6px] cursor-pointer h-8 px-2 transition-colors text-[14px] bg-blue-500 text-white"
                              onClick={() => setSelectedHistory(history)}
                            >
                              View More
                            </button>
                          </li>
                        );
                      })
                  ) : (
                    <li className="text-center text-gray-500 py-4">No Records Found</li>
                  )}
                </ul>
              </div>

            </div>
          </div>
        </div>


      </div>


      {showOperationPopup && (
        <OperationPopup
          record={currentRecord}
          closePopup={() => setShowOperationPopup(false)}
        />
      )}

    </div>

  );
};


