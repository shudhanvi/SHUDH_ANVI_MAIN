import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup as LeafletPopup,
  useMap,
} from "react-leaflet";
import DatePicker from "react-datepicker";
import {
  MapPin,
  MapPinned,
  Bot,
  Calendar,
  Clock,
  Funnel,
  CalendarIcon,
  ClockIcon,
  Download,
  Settings,
} from "lucide-react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "react-datepicker/dist/react-datepicker.css";

import { fetchRobotOperations } from "../../api/robots";

/* ================= LEAFLET FIX ================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).href,
  iconUrl: new URL(
    "leaflet/dist/images/marker-icon.png",
    import.meta.url
  ).href,
  shadowUrl: new URL(
    "leaflet/dist/images/marker-shadow.png",
    import.meta.url
  ).href,
});

const DEFAULT_CENTER = [17.45709, 78.37077]; // Hyderabad center as fallback
const PAGE_LIMIT = 50;

/* ========================================================= */

export const RobotPopupComponent = ({
  activeRobot,
  closePopup,
}) => {
  /* ================= STATE ================= */
  const [operations, setOperations] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("manhole");
  const [selectedHistory, setSelectedHistory] = useState(null);

  // const formatTime = (timestamp) => {
  //   if (!timestamp) return "-";
  //   const date = new Date(timestamp);
  //   const hours = String(date.getHours()).padStart(2, "0");
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  //   const seconds = String(date.getSeconds()).padStart(2, "0");
  //   return `${hours}:${minutes}:${seconds}`;
  // };

  const formatTime = (timestamp) => {
  if (!timestamp) return "-";

  // Convert to Date
  const date = new Date(timestamp);

  // Add 5 hours 30 minutes (330 minutes)
 if (currentRecord.division === "Division 15 (Durgam Cheruvu)") {
    date.setMinutes(date.getMinutes() + 330); // 5h 30m
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

  const totalCount = Number(activeRobot.count || 0);
  const isDateFiltered = Boolean(appliedRange.from || appliedRange.to);

  /* ================= SCROLL LOCK ================= */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  /* ================= FETCH ================= */
  const fetchData = async (loadMore = false, showloading = true) => {
    if (!activeRobot.device_id) return;

    // prevent duplicate calls
    if (loadMore && fetchingMore) return;

    // stop when total reached (only if no date filter)
    if (!isDateFiltered && operations.length >= totalCount) {
      setHasMore(false);
      return;
    }

    // 🔑 CRITICAL: capture offset BEFORE async call
    const requestOffset = loadMore ? offset : 0;

    // console.log("➡️ REQUEST OFFSET:", requestOffset);

    try {
      loadMore ? setFetchingMore(true) : (showloading ? setLoading(true) : setLoading(false));

      const payload = {
        device_id: activeRobot.device_id,
        division: activeRobot.division,
        section: activeRobot.section,
        from_date: activeRobot.from_date,
        to_date: activeRobot.to_date,
        // limit: PAGE_LIMIT,
        // offset: requestOffset,
      };

      if (appliedRange.from) {
        payload.from_date = appliedRange.from.toISOString();
      }

      if (appliedRange.to) {
        payload.to_date = appliedRange.to.toISOString();
      }

      // console.log("📤 PAYLOAD SENT:", payload);

      const res = await fetchRobotOperations(payload, 50, requestOffset);
      const newOps = res?.operations || [];

      // console.log(
      //   "⬅️ RECEIVED:",
      //   newOps.length,
      //   "records starting from offset",
      //   requestOffset
      // );

      if (newOps.length === 0) {
        setHasMore(false);
        return;
      }

      !showloading ? setOperations(newOps) :
        setOperations((prev) =>
          loadMore ? [...prev, ...newOps] : newOps
        );

      // 🔑 offset MUST increase by what backend returned
      setOffset((prev) => prev + newOps.length);

      if (newOps.length < PAGE_LIMIT) {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load operation history");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };


  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    setOperations([]);
    setOffset(0);
    setHasMore(true);
    setSelectedHistory(null);
    fetchData(false);
  }, [activeRobot]);

  /* ================= APPLY DATE FILTER ================= */
  const applyDateFilter = () => {
    // setOperations([]);
    setOffset(0);
    setHasMore(true);
    setSelectedHistory(null);

    setAppliedRange({
      from: fromDate,
      to: toDate,
    });

    fetchData(false, false);
  };

  /* ================= SCROLL LOAD ================= */
  const onScroll = () => {
    const el = historyRef.current;
    if (!el || !hasMore || fetchingMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      // console.log("scroll calling")
      fetchData(true);
    }
  };

  /* ================= NORMALIZE ================= */
  const normalizedOps = useMemo(() => {
    return operations.map((op) => {
      const isPipe = op.op_type === "pipe inspection";
      return {
        ...op,
        operation_type: op.op_type || "manhole cleaning",
        start_ts: op.op_start_time,
        end_ts: op.op_end_time ,
        before_img: op.before_op_image_url || op.before_path || "",
        after_img: op.after_op_image_url || op.after_path || "",
        video: op.op_video_url || "",
        lat: Number(op.op_latitude),
        lng: Number(op.op_longitude),
      };
    });
  }, [operations]);

  /* ================= TAB FILTER ================= */
  const activeOps =
    activeTab === "pipe"
      ? normalizedOps.filter((o) => o.op_type === "pipe inspection")
      : normalizedOps.filter((o) => o.op_type !== "pipe inspection");

  const current = selectedHistory || activeOps[0];

  /* ================= MAP ================= */
  const hasValidLocation =
    current &&
    !isNaN(current.op_latitude) &&
    !isNaN(current.op_longitude) &&
    current.op_latitude !== 0 &&
    current.op_longitude !== 0;

  const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(
        hasValidLocation ? [lat, lng] : DEFAULT_CENTER,
        map.getZoom()
      );
    }, [lat, lng, map]);
    return null;
  };

  /* ================= LOADING ================= */
  if (loading) {
  return (
    <div className="fixed inset-0 z-[910] bg-[#00000099] flex justify-center items-center">
      <div className="bg-white w-full max-w-[1000px] rounded-lg px-6 py-5 max-h-[95vh] overflow-hidden">

       

        {/* TABS */}
        <div className="flex gap-6 mt-2 border-b pb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* HEADERS */}
        <div className="flex justify-between pt-5">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-5 w-[200px]" />
        </div>

        {/* BODY */}
        <div className="flex justify-between mt-4">

          {/* LEFT PANEL */}
          <div className="w-[48%] space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-5">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* MAP */}
            <Skeleton className="h-44 w-full mt-6" />

            {/* MEDIA */}
            <Skeleton className="h-5 w-48 mt-6" />
            <Skeleton className="h-[180px] w-full mt-2" />

            {/* BUTTON */}
            <Skeleton className="h-[48px] w-full mt-6 rounded-[16px]" />
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[48%] space-y-4">
            <Skeleton className="h-4 w-40" />

            <div className="flex gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-32" />
            </div>

           

            {/* HISTORY LIST */}
            <div className="space-y-3 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-[910] bg-[#00000099] flex justify-center items-center">
      <div className="bg-white w-full max-w-[1000px] rounded-lg px-6 py-5 relative max-h-[95vh] overflow-y-auto custom-scrollbar" >

        {/* CLOSE */}
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
                <span className="flex ">
                  <Settings className="inline-block w-10 h-10 mr-3 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                   <span className="flex flex-col ml-2">
                    Operation Type
                    <span className="text-[#21232C] text-[16px]">
                      {currentRecord.operation_type === "manhole_cleaning" ? "Manhole Cleaning":"Pipe Inspection"}
                    </span>
                  </span>
                </span>
               
                <span className="flex flex-row">
                  <Clock className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2">
                    Start Time
                    <span className="text-[#21232C] text-[16px]">
                      {formatTime( currentRecord.operation_type === "manhole_cleaning" ? currentRecord.timestamp : currentRecord.pipe_inspection_starttime )}
                    </span>
                  </span>
                </span>
                <span className="flex flex-row">
                  <Clock className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md" color="#0380FC" />
                  <span className="flex flex-col ml-2">
                    End Time
                    <span className="text-[#21232C] text-[16px]">
                      {formatTime( currentRecord.operation_type === "manhole_cleaning" ? currentRecord.endtime : currentRecord.pipe_inspection_endtime )}
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
                        const totalSec = Number(currentRecord?.operation_type === "manhole_cleaning" ? currentRecord.operation_time_minutes : currentRecord.pipe_inspection_operationtime);
                        if (isNaN(totalSec) || totalSec < 0) return "-";

                        const hours = Math.floor(totalSec / 3600);
                        const minutes = Math.floor((totalSec % 3600) / 60);
                        const seconds = Math.floor(totalSec % 60);

                        let result = "";

                        if (hours > 0) result += `${hours} hr${hours > 1 ? "s" : ""} `;
                        if (minutes > 0) result += `${minutes} min${minutes > 1 ? "s" : ""} `;
                        if (seconds > 0 || result === "") result += `${seconds} sec${seconds !== 1 ? "s" : ""}`;

                        return result.trim();
                      })()}
                    </span>

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
              </div>


             <div className="w-full h-50 text-start text-[#21232C] mt-[24px] bg-gray-100 rounded-lg p-2">

  {(() => {
    const lat = Number(currentRecord?.latitude);
    const lng = Number(currentRecord?.longitude);

    // Check if valid and not 0
    const isValidLocation =
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0;

    // Default fallback location
    const defaultLat = 17.45709;
    const defaultLng = 78.37077;

    // Final values
    const finalLat = isValidLocation ? lat : defaultLat;
    const finalLng = isValidLocation ? lng : defaultLng;

    return (
      <>
        <div className="flex flex-row justify-between">
          <h1 className="pb-1 text-start">
            {`${finalLat.toFixed(5)}, ${finalLng.toFixed(5)}`}
          </h1>

          <h1>Manhole ID : {currentRecord?.manhole_id}</h1>
        </div>

        <div className="bd-gray">

          {currentRecord ? (
            <MapContainer
              center={[finalLat, finalLng]}
              zoom={15}
              className="h-40 rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <Marker position={[finalLat, finalLng]}>
                <LeafletPopup>
                  {currentRecord.area ||
                    currentRecord.section ||
                    "Unknown Location"}
                </LeafletPopup>
              </Marker>

              <RecenterMap
                lat={finalLat}
                lng={finalLng}
              />

            </MapContainer>
          ) : (
            <p className="text-gray-500 flex items-center justify-center h-40">
              No location available
            </p>
          )}

        </div>
      </>
    );
  })()}

</div>

              {/* {console.log("LatLng:", lat, lng)} */}

              {/* Images and Report */}
             {/* ================= Operation Media ================= */}
<h1 className="text-[16px] text-[#21232C] mt-[24px] text-start">
  {currentRecord?.operation_type === "pipe_inspection"
    ? "Operation Video"
    : "Operation Images"}
</h1>

<div className="rounded-lg mt-2 w-full bg-gray-100 overflow-y-auto">
  {currentRecord?.operation_type === "pipe_inspection" ? (
    /* ================= PIPE INSPECTION → VIDEO ================= */
    <div className="h-[165px] flex items-center justify-center p-2">
      {currentRecord?.video_url ? (
        <video
          ref={videoRef}
          src={currentRecord.video_url}
          controls
          className="w-full h-full rounded-lg object-cover bg-black"
        />
      ) : (
        <div className="text-gray-500 text-sm flex items-center justify-center h-full">
          No video available
        </div>
        {/* HEADER */}
        {activeOps.length ===0 ?(<></>):(
        <div className="flex justify-between pt-3">
          <h1 className="text-[18px] w-[48%]">Operational Details</h1>
          <h1 className="text-[18px] w-[48%]">Operation History</h1>
        </div>
        )}
        {/* BODY */}
        <div className="flex justify-between mt-4 min-h-[420px]">

  {activeOps.length === 0 ? (
    /* ================= EMPTY STATE (INSIDE BODY) ================= */
    <>
      {/* LEFT SIDE MESSAGE */}
      <div className="w-[90%] min-h-[95vh] flex items-center justify-center text-gray-500 text-center text-[16px] px-4">
        No {activeTab === "pipe"
          ? "Pipe Inspection"
          : "Manhole Cleaning"} operations are performed in this location
      </div>

     
    </>
  ) : (
    /* ================= NORMAL TWO-PANEL LAYOUT ================= */
    <>
      {/* ================= LEFT PANEL ================= */}
      <div className="w-[48%] min-h-[420px]">
        <p className="text-sm text-[#676D7E]">
          <MapPin className="inline w-4 mr-2 text-[#0380FC]" />
          Division: {current.op_division || "-"}
        </p>

        <p className="text-sm text-[#676D7E] mt-2">
          <MapPinned className="inline w-4 mr-2 text-[#0380FC]" />
          Section: { current.op_section || "-"}
        </p>

        <div className="grid grid-cols-2 gap-y-6 mt-5 text-sm">
          <Info icon={Bot} label="Device ID" value={current.device_id} />
          <Info
            icon={Settings}
            label="Operation Type"
            value={activeTab === "pipe" ? "Pipe Inspection" : "Manhole Cleaning"}
          />
          <Info icon={Clock} label="Start Time" value={formatTime(current.start_ts,current.op_division)} />
          <Info icon={Clock} label="End Time" value={formatTime(current.end_ts,current.op_division)} />
          <Info
            icon={Clock}
            label="Task Duration"
            value={formatDuration(
              current.op_duration_sec || current.duration_seconds
            )}
          />
          <Info icon={Calendar} label="Date" value={formatDate(current.start_ts)} />
        </div>

        {/* MAP */}
                  <div className="w-full h-50 text-start text-[#21232C] mt-[24px] bg-gray-100 rounded-lg p-2">

  {(() => {
    const lat = Number(current?.op_latitude);
    const lng = Number(current?.op_longitude);

    // Check if valid and not 0
    const isValidLocation =
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0;

    // Default fallback location
    const defaultLat = 17.45709;
    const defaultLng = 78.37077;

    // Final values
    const finalLat = isValidLocation ? lat : defaultLat;
    const finalLng = isValidLocation ? lng : defaultLng;

    return (
      <>
        <div className="flex flex-row justify-between">
          <h1 className="pb-1 text-start">
            {`${finalLat.toFixed(5)}, ${finalLng.toFixed(5)}`}
          </h1>

          <h1>Manhole ID : {current?.mh_id}</h1>
        </div>

        <div className="bd-gray">

          {current ? (
            <MapContainer
              center={[finalLat, finalLng]}
              zoom={15}
              className="h-40 rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <Marker position={[finalLat, finalLng]}>
                <LeafletPopup>
                  {current.area ||
                    current.section ||
                    "Unknown Location"}
                </LeafletPopup>
              </Marker>

              <RecenterMap
                lat={finalLat}
                lng={finalLng}
              />

            </MapContainer>
          ) : (
            <p className="text-gray-500 flex items-center justify-center h-40">
              No location available
            </p>
          )}

        </div>
      </>
    );
  })()}

</div>

        <h1 className="text-[16px] mt-6">
          {activeTab === "pipe" ? "Operation Video" : "Operation Images"}
        </h1>

        {activeTab === "pipe" ? (
          current.video ? (
            <video
              src={current.video}
              controls
              className="w-full h-[180px] bg-black rounded-lg mt-2"
            />
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-500">
              No video available
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-100 p-[4px] rounded-[6px]">
            <img
              src={current.before_img || "/images/before.png"}
              className="h-[150px] object-cover rounded"
            />
            <img
              src={current.after_img || "/images/after.png"}
              className="h-[150px] object-cover rounded"
            />
          </div>
        )}

        <button className="w-full mt-6 h-[48px] bg-[#1A8BA8] text-white rounded-[16px]">
          <Download className="inline w-5 mr-2" />
          Generate Operation Report
        </button>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-[48%]">
        {/* FILTER LABEL */}
<div className="flex items-center text-sm text-[#676D7E] mb-2">
  <Funnel className="mr-2" />
  Filter by Date Range
</div>

{/* FILTER CONTROLS */}
<div className="flex items-end gap-3">
  <div className="w-full">
    <DateField
      value={fromDate}
      setValue={setFromDate}
      minDate={activeRobot.from_date}
      maxDate={activeRobot.to_date || new Date()}
      placeholder={formatDate(activeRobot.from_date )|| "From Date" }

    />
  </div>

  <div className="w-full">
    <DateField
      value={toDate}
      setValue={setToDate}
      minDate={activeRobot.from_date}
      maxDate={activeRobot.to_date }
      placeholder={formatDate(activeRobot.to_date) || "To Date"}
    />
  </div>

  <button
  onClick={applyDateFilter}
  disabled={!fromDate && !toDate}
  className={`
    px-5 py-2 h-[40px] whitespace-nowrap rounded-md text-white
    transition-colors
    ${
      !fromDate && !toDate
        ? "bg-[#1A8BA8] cursor-not-allowed"
        : "bg-[#1A8BA8] hover:bg-[#157a92]"
    }
  `}
>
  Apply
</button>

</div>


        <div
          ref={historyRef}
          onScroll={onScroll}
          className="h-80 mt-4 overflow-y-auto shadow rounded-md p-2 custom-scrollbar"
        >
          {activeOps.map((h, i) => {
  const isActive =
    selectedHistory &&
    selectedHistory.start_ts === h.start_ts &&
    selectedHistory.device_id === h.device_id;

  return (
    <div
      key={i}
      className={`flex justify-between items-center py-2 px-2 mb-[6px] rounded-md cursor-pointer transition-colors
        ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}
      `}
      onClick={() => setSelectedHistory(h)}
    >
      <div className="text-[16px]">
        <CalendarIcon className="inline h-4 mr-1" />
        {formatDate(h.start_ts)}
        <ClockIcon className="inline h-4 ml-4 mr-1" />
        {formatTime(h.start_ts,current.op_division)}
      </div>

      <button
        className={`btn-view-more flex items-center rounded-[6px] h-8 px-2 text-[14px] transition-colors
          bg-blue-500 text-white
        `}
        onClick={(e) => {
          e.stopPropagation(); // 🔑 prevent double click issue
          setSelectedHistory(h);
        }}
      >
        View More
      </button>
    </div>
  );
})}

          {fetchingMore && (
            <div className="text-center text-gray-400 text-sm py-2">
              Loading more…
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>

      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const Info = ({ icon: Icon, label, value }) => (
  <span className="flex">
    <Icon className="w-10 h-10 p-2 bg-[#0380FC10] text-[#0380FC] rounded-md" />
    <span className="ml-2">
      {label}
      <div className="text-[#21232C] text-[16px]">{value || "-"}</div>
    </span>
  </span>
);

const DateField = ({ value, setValue, placeholder, minDate,maxDate }) => (
  <div className="relative w-full">
    <DatePicker
      selected={value}
      onChange={(date) => setValue(date)}
      placeholderText={placeholder}
      className="border p-2 rounded w-full pr-8"
      maxDate={maxDate}
      minDate={minDate}
    />
    {value && (
      <button
        onClick={() => setValue(null)}
        className="absolute right-2 top-[10px] text-gray-500 hover:text-black"
      >
        ×
      </button>
    )}
  </div>
);

const formatDate = (ts) => {
  
  return ts ? new Date(ts).toLocaleDateString("en-GB") : "";

}
  const formatTime = (timestamp,division) => {
  if (!timestamp) return "-";

  // Convert to Date
  const date = new Date(timestamp);

  // Add 5 hours 30 minutes (330 minutes)
 const div = (division || "").toLowerCase().trim();

  if (div.includes("durgam")) {
    date.setMinutes(date.getMinutes() + 330); // 5h 30m
  }


  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const formatDuration = (totalSeconds) => {
  const secs = Number(totalSeconds);

  if (isNaN(secs) || secs < 0) return "-";

  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = Math.floor(secs % 60);

  let result = [];

  if (hours > 0) result.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes > 0) result.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
  if (seconds > 0 || result.length === 0)
    result.push(`${seconds} sec${seconds !== 1 ? "s" : ""}`);

  return result.join(" ");
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);
