import React, { useEffect, useState } from "react";
import { RobotReportPopup } from "./RobotReportPopup";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "./Pagination";
import DatePicker from "react-datepicker";
import { backendApi } from "../../utils/backendApi";
import { useServerData } from "../../context/ServerDataContext";

export const RobotReportsComponent = ({ division, section, city }) => {
  const { data } = useServerData();
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
  // console.log("✅ RobotsData:", robots);

  // 🔥 Sort robots by device_id (numeric-aware)
  const sortedRobots = [...filteredRobots].sort((a, b) =>
    (a.device_id || "").localeCompare(b.device_id || "", undefined, { numeric: true })
  );

  // 🔥 Pagination uses sorted robots
  const {
    currentPage,
    totalPages,
    currentItems: currentRobots,
    indexOfFirstItem,
    indexOfLastItem,
    handleNextPage,
    handlePrevPage,
  } = usePagination(sortedRobots, 50);

  // Helper - format date
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // Normalize Robots + Operations data
  useEffect(() => {
    if (!RobotsData || !OperationsData) return;

    const format = (r) => ({
      device_id: r.device_id || r.robot_id || r.bot_id || "Unknown",
      city: r.city || "",
      division: r.division || "",
      section: r.section || "",
    });

    const combined = [...RobotsData.map(format), ...OperationsData.map(format)];
    const unique = Array.from(new Map(combined.map((r) => [r.device_id, r])).values());

    setRobots(unique);
  }, [RobotsData, OperationsData]);

  // Filtering logic — FIXED (no scope bug, clear names)
  useEffect(() => {
    if (!robots || robots.length === 0) {
      setFilteredRobots([]);
      setSelectedRobots([]);
      setSelectAll(false);
      return;
    }

    // normalize value (string -> simplified lowercase)
    const normalize = (v) =>
      String(v ?? "")
        .toLowerCase()
        .replace(/[\s()_-]+/g, "")
        .replace(/[0-9]/g, "")
        .trim();

    // avoid name that can conflict with bundled helpers
    const fuzzyMatch = (a = "", b = "") => {
      // both arguments are normalized strings
      if (!b) return true; // treat empty filter as match-all
      return a.includes(b) || b.includes(a);
    };

    // Compute normalized filters once (important: these must exist before filter runs)
    const normCity = normalize(city);
    const normDivision = normalize(division);
    const normSection = normalize(section);

    const filtered = robots.filter((r) => {
      const rc = normalize(r.city);
      const rd = normalize(r.division);
      const rs = normalize(r.section);

      return fuzzyMatch(rc, normCity) && fuzzyMatch(rd, normDivision) && fuzzyMatch(rs, normSection);
    });

    setFilteredRobots(filtered);
    setSelectedRobots([]);
    setSelectAll(false);
  }, [robots, city, division, section]);

  // -------------------------------------------
  // 🔥 GLOBAL SELECT ALL + SYNC LOGIC
  // -------------------------------------------
  const handleCheckboxChange = (device_id) => {
    setSelectedRobots((prev) => {
      const updated = prev.includes(device_id)
        ? prev.filter((id) => id !== device_id)
        : [...prev, device_id];

      setSelectAll(updated.length === sortedRobots.length);
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      const all = sortedRobots.map((r) => r.device_id);
      setSelectedRobots(all);
    } else {
      setSelectedRobots([]);
    }
    setSelectAll(!selectAll);
  };

  // API call
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
        dateRange: { from: fromDate ? fromDate : null, to: toDate ? toDate : null },
      },
      command: "generate_robot_report",
    };
    // console.log("Sending Payload:", payload);

    try {
      const response = await fetch(backendApi.robotsReportUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // console.log("Response Status:", response);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
      console.log("Received Report Data:", data);
      setShowPopup(true);
    } catch (err) {
      alert(err.message || "Failed to fetch report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showPopup && reportData && (
        <RobotReportPopup reportData={reportData} onClose={() => setShowPopup(false)} />
      )}

      {/* 🔹 Date Filters */}
      <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px] rounded-lg border-[1.5px] border-[#E1E7EF] bg-white">
        {/* From Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <DatePicker
            selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setFromDate(date ? formatDate(date) : null)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select from date"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
          />
          {fromDate && (
            <button
              type="button"
              onClick={() => setFromDate(null)}
              className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs transition cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* To Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <DatePicker
            selected={toDate ? new Date(toDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setToDate(date ? formatDate(date) : null)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select to date"
            minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
          />
          {toDate && (
            <button
              type="button"
              onClick={() => setToDate(null)}
              className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs transition cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 🔹 Robots List */}
      <div className="bg-white rounded-lg p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] relative">
        <div className="flex items-center justify-between mb-4 pb-4">
          <div className="flex flex-col gap-[4px]">
            <h3 className="text-[20px] font-semibold text-gray-800">{section || division} - Select Robots</h3>
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
          <div className="text-center text-gray-500 py-10 relative">No robots found for the selected location.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto h-[350px] auto-rows-max custom-scrollbar">
              {currentRobots.map((robot) => (
                <label key={robot.device_id} className="flex items-center gap-2 px-4 py-4 h-[58px] rounded-lg cursor-pointer bg-[#F9FAFB]">
                  <input
                    type="checkbox"
                    checked={selectedRobots.includes(robot.device_id)}
                    onChange={() => handleCheckboxChange(robot.device_id)}
                    className="h-4 w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]"
                  />
                  <span className="text-sm font-medium text-gray-800">{robot.device_id}</span>
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

export default RobotReportsComponent;
