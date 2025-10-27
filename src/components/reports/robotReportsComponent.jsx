import React, { useEffect, useState } from "react";
import { RobotReportPopup } from "./RobotReportPopup";
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from "./Pagination";
import DatePicker from "react-datepicker";
import { backendApi } from "../../utils/backendApi";

const parseCsvRow = (row) => {
    // ... (your parsing function is fine, no changes needed)
    const values = [];
    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;
    let match;
    while ((match = regex.exec(row))) {
        const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
        values.push(value);
        if (match[0].slice(-1) !== ',') break;
    }
    return values;
};

// FIX 4 (Recommended): Remove the unused 'filteredData' prop from the component's signature.
export const RobotReportsComponent = ({ division, section, city, onBack }) => {
    const [robots, setRobots] = useState([]);
    const [filteredRobots, setFilteredRobots] = useState([]);
    const [selectedRobots, setSelectedRobots] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
     // --- State for the new date pickers ---
      const [fromDate, setFromDate] = useState('');
      const [toDate, setToDate] = useState('');
    
       const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
    
//     const formatDate = (date) => {
//   const d = new Date(date);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   return `${year}-${month}-${day}`; // 👈 yyyy-mm-dd format
// };


    // FIX 1: Pass the component's state 'filteredRobots' to the pagination hook, not the prop.
    const {
        currentPage,
        totalPages,
        currentItems: currentManholes,
        indexOfFirstItem,
        indexOfLastItem,
        handleNextPage,
        handlePrevPage,
    } = usePagination(filteredRobots, 50); // Use filteredRobots state here

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
                setRobots(data);
            } catch (err) {
                console.error("Error loading CSV:", err);
            }
        };
        fetchCSV();
    }, []);

    useEffect(() => {
        if (!robots.length) return;
        const normalizeForComparison = (str) => str?.toLowerCase() || "";
        const filtered = robots.filter((robot) => {
            const robotDivision = normalizeForComparison(robot.Division);
            const robotSection = normalizeForComparison(robot.Section);
            const robotCity = normalizeForComparison(robot.City);
            const checkDivision = () => {
                if (!division) return true;
                const searchParts = normalizeForComparison(division).match(/[a-z0-9]+/g) || [];
                return searchParts.every(part => robotDivision.includes(part));
            };
            const sectionMatch = section ? robotSection.includes(normalizeForComparison(section)) : true;
            const cityMatch = city ? robotCity.includes(normalizeForComparison(city)) : true;
            return checkDivision() && sectionMatch && cityMatch;
        });
        const uniqueRobots = Array.from(new Map(filtered.map((r) => [r.device_id, r])).values());
        setFilteredRobots(uniqueRobots);
        setSelectedRobots([]);
        setSelectAll(false);
    }, [robots, division, section, city]);


    const handleCheckboxChange = (device_id) => {
        setSelectedRobots((prev) =>
            prev.includes(device_id) ? prev.filter((id) => id !== device_id) : [...prev, device_id]
        );
    };

    const handleSelectAll = () => {
        // Logic to select all items currently visible on the page
        const currentPageRobotIds = currentManholes.map(r => r.device_id);
        const allOnPageSelected = currentPageRobotIds.every(id => selectedRobots.includes(id));

        if (allOnPageSelected) {
            // Deselect all on the current page
            setSelectedRobots(prev => prev.filter(id => !currentPageRobotIds.includes(id)));
        } else {
            // Select all on the current page that aren't already selected
            setSelectedRobots(prev => [...new Set([...prev, ...currentPageRobotIds])]);
        }
        setSelectAll(!allOnPageSelected);
    };


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
                dateRange: {
            from: fromDate,
            to: toDate,
        },
            },
            command: "generate_robot_report",
        };
        console.log("sending:",payload)
        try {
            const response = await fetch( backendApi.robotsReportUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json().catch(() => ({ message: "Server returned a 400 Bad Request with no details." }));
                    console.error("Server validation error:", errorData);
                    throw new Error(`Server error 400: Bad Request. The server rejected the data. Details: ${JSON.stringify(errorData)}`);
                }
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            console.log("Backend response:", data);
            setReportData(data);
            setShowPopup(true);
        } catch (error) {
            console.error("Error fetching report data:", error);
            alert(`Failed to fetch report data. ${error.message}`);
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
                  {/* 🔹 Date Pickers */}
                  <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px] bg-white  rounded-lg border-[1.5px] border-[#E1E7EF] ">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From
                      </label>
                      <DatePicker
                        selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
                        onChange={(date) => setFromDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select from date"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md  focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
                      />
                    </div>
            
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To
                      </label>
                      <DatePicker
                        selected={toDate ? new Date(toDate.split("-").reverse().join("-")) : null}
                        onChange={(date) => setToDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select to date"
                        minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md  focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
                      />
                    </div>
                  </div>
            <div className="bg-white rounded-lg p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] overflow-y-auto relative">
                <div className="flex items-center justify-between mb-4 pb-4">
                    <div className="flex gap-[20px] items-center">
                        <div className="flex flex-col gap-[4px]">
                            <h3 className="text-[20px] font-semibold text-gray-800">{section || division} - Select Robots</h3>
                            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4 text-[15px] rounded border-gray-300 focus:ring-[#1E9AB0] accent-[#1E9AB0]" />
                                Select All
                            </label>
                        </div>
                    </div>
                    <div className='flex items-center gap-x-6'>
                        <p className="text-sm text-gray-700 font-medium">{selectedRobots.length} of {filteredRobots.length} selected</p>
                        <button
                            onClick={handleViewReport}
                            disabled={isLoading}
                            className={`px-6 py-2.5 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] ${(isLoading || selectedRobots.length === 0) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#187A8A]'}`}
                        >
                            {isLoading ? "Generating..." : "View Selected Report"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-[340px]  auto-rows-max">
                    {/* FIX 3: Map over the paginated items 'currentManholes' instead of all 'filteredRobots' */}
                    {currentManholes.map((robot) => (
                        <label key={robot.device_id} className="flex items-center gap-2 px-4 py-4 h-[58px] rounded-lg cursor-pointer bg-[#F9FAFB]">
                            <input type="checkbox" checked={selectedRobots.includes(robot.device_id)} onChange={() => handleCheckboxChange(robot.device_id)} className="h-4 w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]" />
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

