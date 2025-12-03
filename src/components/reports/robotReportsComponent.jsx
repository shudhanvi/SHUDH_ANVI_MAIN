import React, { useEffect, useState } from "react";
import { RobotReportPopup } from "./RobotReportPopup";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "./Pagination";
import DatePicker from "react-datepicker";
import { backendApi } from "../../utils/backendApi";
import { useServerData } from "../../context/ServerDataContext";

export const RobotReportsComponent = ({ division, section, city }) => {
  const { data, loading: serverLoading } = useServerData();
  const { RobotsData, OperationsData } = data;

  const [robots, setRobots] = useState([]);
  const [filteredRobots, setFilteredRobots] = useState([]);
  const [selectedRobots, setSelectedRobots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  console.log("✅ RobotsData:", robots);

  // ✅ Helper: Format date to dd-mm-yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ✅ Pagination hook
  const {
    currentPage,
    totalPages,
    currentItems: currentRobots,
    indexOfFirstItem,
    indexOfLastItem,
    handleNextPage,
    handlePrevPage,
  } = usePagination(filteredRobots, 50);

  // ✅ Merge RobotsData + OperationsData into unified robot list
  useEffect(() => {
    if (!RobotsData || !OperationsData) return;

    // Normalize RobotsData
    const normalizedRobots = RobotsData.map((r) => ({
      device_id: r.device_id || r.robot_id || r.bot_id || "Unknown",
      city: r.city || r.district || "",
      division: r.division || "",
      section: r.section || r.area || "",
    }));

    // Normalize OperationsData
    const normalizedOperations = OperationsData.map((o) => ({
      device_id: o.device_id || o.robot_id || o.bot_id || "Unknown",
      city: o.city || o.district || "",
      division: o.division || "",
      section: o.section || o.area || "",
    }));

    // Combine and remove duplicates
    const combined = [...normalizedRobots, ...normalizedOperations];
    const unique = Array.from(new Map(combined.map((r) => [r.device_id, r])).values());

    setRobots(unique);
    // console.log("✅ Combined Robots:", unique);
  }, [RobotsData, OperationsData]);

  // ✅ Apply relaxed filtering
  // useEffect(() => {
  //   if (!robots.length) return;

  //   const normalize = (v) =>
  //     (v || "").toLowerCase().replace(/[\s()_-]+/g, "").trim();

  //   const normCity = normalize(city);
  //   const normDivision = normalize(division);
  //   const normSection = normalize(section);

  //   const filtered = robots.filter((r) => {
  //     const rCity = normalize(r.city);
  //     const rDivision = normalize(r.division);
  //     const rSection = normalize(r.section);

  //     const matchCity = !normCity || rCity.includes(normCity);
  //     const matchDivision = !normDivision || rDivision.includes(normDivision);
  //     const matchSection = !normSection || rSection.includes(normSection);

  //     return matchCity && matchDivision && matchSection;
  //   });

  //   setFilteredRobots(filtered);
  //   setSelectedRobots([]);
  //   setSelectAll(false);
  //   console.log("✅ Filtered Robots:", filtered);
  // }, [robots, city, division, section]);
useEffect(() => {
  if (!robots.length) return;

  const normalize = (v) =>
    (v ?? "")
      .toString()
      .toLowerCase()
      .replace(/[\s()_-]+/g, "")
      .replace(/[0-9]/g, "") // <-- REMOVE DIGITS FROM USER INPUT & ROBOT DATA
      .trim();

  const normCity = normalize(city);
  const normDivision = normalize(division);
  const normSection = normalize(section);

  const looseMatch = (a, b) => {
    if (!b) return true;
    return a.includes(b) || b.includes(a);
  };

  const filtered = robots.filter((r) => {
    const rCity = normalize(r.city);
    const rDivision = normalize(r.division);
    const rSection = normalize(r.section);

    const matchCity = looseMatch(rCity, normCity);
    const matchDivision = looseMatch(rDivision, normDivision);
    const matchSection = looseMatch(rSection, normSection);

    return matchCity && matchDivision && matchSection;
  });

  setFilteredRobots(filtered);
  setSelectedRobots([]);
  setSelectAll(false);

  console.log("✅ Filtered Robots:", filtered);
}, [robots, city, division, section]);

  // ✅ Checkbox handlers
  const handleCheckboxChange = (device_id) => {
    setSelectedRobots((prev) =>
      prev.includes(device_id)
        ? prev.filter((id) => id !== device_id)
        : [...prev, device_id]
    );
  };

  const handleSelectAll = () => {
    const currentIds = currentRobots.map((r) => r.device_id);
    const allSelected = currentIds.every((id) => selectedRobots.includes(id));
    if (allSelected) {
      setSelectedRobots((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedRobots((prev) => [...new Set([...prev, ...currentIds])]);
    }
    setSelectAll(!allSelected);
  };

  // ✅ View report
const handleViewReport = async () => {
  if (selectedRobots.length === 0) {
    alert("Please select at least one robot.");
    return;
  }

  setIsLoading(true);

  const payload = {
    selectedRobots,
    userInputs: {
      division,
      section,
      city,
      dateRange: { from: fromDate, to: toDate },
    },
    command: "generate_robot_report",
  };

  try {
    const response = await fetch(backendApi.robotsReportUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // ✅ Check for non-success responses
    if (!response.ok) {
      if ( response.status === 500|| response.status === 404) {
        // Custom message for 500 error
        throw new Error("No data found in the given date range.");
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    // ✅ Parse and display report
    const data = await response.json();
    setReportData(data);
    setShowPopup(true);

  } catch (err) {
    console.error("Error fetching report:", err);
    alert(err.message || "Failed to fetch report. Please try again later.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      {showPopup && reportData && (
        <RobotReportPopup
          reportData={reportData}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* 🔹 Date Filters */}
      <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px] rounded-lg border-[1.5px] border-[#E1E7EF] bg-white">
       {/* From Date */}
       <div className="relative">
         <label className="block text-sm font-medium text-gray-700 mb-1">
           From
         </label>
         <DatePicker
           selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
           onChange={(date) => setFromDate(date ? formatDate(date) : null)} // ✅ handle null
           dateFormat="dd/MM/yyyy"
           placeholderText="Select from date"
           className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
         />
         {fromDate && (
           <button
             type="button"
             onClick={() => setFromDate(null)} // ✅ clears date
             className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs  transition cursor-pointer"
           >
             ×
           </button>
         )}
       </div>
     
       {/* To Date */}
       <div className="relative">
         <label className="block text-sm font-medium text-gray-700 mb-1">
           To
         </label>
         <DatePicker
           selected={toDate ? new Date(toDate.split("-").reverse().join("-")) : null}
           onChange={(date) => setToDate(date ? formatDate(date) : null)} // ✅ handle null
           dateFormat="dd/MM/yyyy"
           placeholderText="Select to date"
           minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
           className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
         />
         {toDate && (
           <button
             type="button"
             onClick={() => setToDate(null)} // ✅ clears date
             className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs  transition cursor-pointer"
           >
             ×
           </button>
         )}
       </div>
     </div>

      {/* 🔹 Robots List */}
      <div className="bg-white rounded-lg p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4 pb-4">
          <div className="flex flex-col gap-[4px]">
            <h3 className="text-[20px] font-semibold text-gray-800">
              {section || division} - Select Robots
            </h3>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 text-[15px] rounded border-gray-300 focus:ring-[#1E9AB0] accent-[#1E9AB0]"
              />
              Select All
            </label>
          </div>

          <div className="flex items-center gap-x-6">
            <p className="text-sm text-gray-700 font-medium">
              {selectedRobots.length} of {filteredRobots.length} selected
            </p>
            <button
              onClick={handleViewReport}
              disabled={isLoading}
              className="px-6 py-2.5 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] cursor-pointer "
            >
              {isLoading ? "Loading..." : "View Report"}
            </button>
          </div>
        </div>

        {/* ✅ Empty state */}
        {filteredRobots.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No robots found for the selected location.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-[340px] auto-rows-max">
              {currentRobots.map((robot) => (
                <label
                  key={robot.device_id}
                  className="flex items-center gap-2 px-4 py-4 h-[58px] rounded-lg cursor-pointer bg-[#F9FAFB]"
                >
                  <input
                    type="checkbox"
                    checked={selectedRobots.includes(robot.device_id)}
                    onChange={() => handleCheckboxChange(robot.device_id)}
                    className="h-4 w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {robot.device_id}
                  </span>
                </label>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
              firstItemIndex={indexOfFirstItem}
              lastItemIndex={indexOfLastItem}
              totalItems={filteredRobots.length}
            />
          </>
        )}
      </div>
    </>
  );
};