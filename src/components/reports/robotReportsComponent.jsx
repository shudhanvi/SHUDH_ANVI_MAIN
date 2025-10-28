import React, { useEffect, useState } from "react";
import { RobotReportPopup } from "./RobotReportPopup";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "./Pagination";
import DatePicker from "react-datepicker";
import { backendApi } from "../../utils/backendApi";
import { useServerData } from "../../context/ServerDataContext"; // ✅ import context

const parseCsvRow = (row) => {
  const values = [];
  const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;
  let match;
  while ((match = regex.exec(row))) {
    const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
    values.push(value);
    if (match[0].slice(-1) !== ",") break;
  }
  return values;
};

export const RobotReportsComponent = ({ division, section, city, onBack }) => {
  const { serverData, loading: serverLoading } = useServerData(); // ✅ server data
  const [csvRobots, setCsvRobots] = useState([]);
  const [robots, setRobots] = useState([]);
  const [filteredRobots, setFilteredRobots] = useState([]);

  const [selectedRobots, setSelectedRobots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Format date to dd-mm-yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const {
    currentPage,
    totalPages,
    currentItems: currentManholes,
    indexOfFirstItem,
    indexOfLastItem,
    handleNextPage,
    handlePrevPage,
  } = usePagination(filteredRobots, 50);

  // ✅ Fetch CSV robots
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch("/datafiles/CSVs/Robo_Operations_copy.csv");
        const text = await response.text();
        const rows = text.replace(/\r/g, "").trim().split("\n").filter(Boolean);
        if (rows.length < 2) return;

        const headers = rows[0].split(",").map((h) => h.trim());
        const data = rows.slice(1).map((row) => {
          const values = parseCsvRow(row);
          const obj = headers.reduce((acc, header, i) => {
            acc[header] = values[i] || "";
            return acc;
          }, {});
          return {
            device_id: obj.device_id,
            City: obj.City,
            Division: obj.Division,
            Section: obj.Section,
          };
        });
        setCsvRobots(data);
      } catch (err) {
        console.error("Error loading CSV:", err);
      }
    };
    fetchCSV();
  }, []);

  // ✅ Merge CSV + Server Robots
  useEffect(() => {
    // serverData might have robots array or robot info per section
    const serverRobots = Array.isArray(serverData)
      ? serverData.map((item) => ({
          device_id: item.device_id || item.robot_id || item.bot_id || "Unknown",
          City: item.City || item.city ||item.district|| "",
          Division: item.Division || item.division || "",
          Section: item.Section || item.section ||item.area|| "",
        }))
      : [];

    const combined = [...csvRobots, ...serverRobots];
    setRobots(combined);
  }, [csvRobots, serverData]);

  // ✅ Filter robots by selected city/division/section
  useEffect(() => {
    if (!robots.length) return;

    const normalize = (v) => (v || "").toLowerCase().trim();
    const filtered = robots.filter((r) => {
      const matchCity = city ? normalize(r.City) === normalize(city) : true;
      const matchDivision = division ? normalize(r.Division) === normalize(division) : true;
      const matchSection = section ? normalize(r.Section) === normalize(section) : true;
      return matchCity && matchDivision && matchSection;
    });

    // deduplicate by device_id
    const unique = Array.from(new Map(filtered.map((r) => [r.device_id, r])).values());
    setFilteredRobots(unique);
    setSelectedRobots([]);
    setSelectAll(false);
  }, [robots, city, division, section]);

  // ✅ Checkbox handling
  const handleCheckboxChange = (device_id) => {
    setSelectedRobots((prev) =>
      prev.includes(device_id)
        ? prev.filter((id) => id !== device_id)
        : [...prev, device_id]
    );
  };

  const handleSelectAll = () => {
    const currentIds = currentManholes.map((r) => r.device_id);
    const allSelected = currentIds.every((id) => selectedRobots.includes(id));
    if (allSelected) {
      setSelectedRobots((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedRobots((prev) => [...new Set([...prev, ...currentIds])]);
    }
    setSelectAll(!allSelected);
  };

  // ✅ Fetch Report Data
  const handleViewReport = async () => {
    if (selectedRobots.length === 0) {
      alert("Please select at least one robot.");
      return;
    }
    setIsLoading(true);
    const payload = {
      selectedRobots,
      userInputs: { division, section, city, dateRange: { from: fromDate, to: toDate } },
      command: "generate_robot_report",
    };
    // console.log("sending:", payload);
    try {
      const response = await fetch(backendApi.robotsReportUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setReportData(data);
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching report:", err);
      alert(`Failed to fetch report: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showPopup && reportData && (
        <RobotReportPopup reportData={reportData} onClose={() => setShowPopup(false)} />
      )}

      {/* 🔹 Date filters */}
      <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px] bg-white rounded-lg border-[1.5px] border-[#E1E7EF]">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <DatePicker
            selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setFromDate(formatDate(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select from date"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <DatePicker
            selected={toDate ? new Date(toDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setToDate(formatDate(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select to date"
            minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0]"
          />
        </div>
      </div>

      {/* 🔹 Robot list */}
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
              className={`px-6 py-2.5 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] ${
                isLoading || selectedRobots.length === 0
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#187A8A]"
              }`}
            >
              {isLoading ? "Generating..." : "View Selected Report"}
            </button>
          </div>
        </div>

        {/* ✅ Robots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-[340px] auto-rows-max">
          {currentManholes.map((robot) => (
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
      </div>
    </>
  );
};
