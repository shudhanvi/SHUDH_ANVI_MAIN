import { useState, useEffect } from "react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Robots() {
    const [data, setData] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedArea, setSelectedArea] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    // Modal state
    const [selectedDevice, setSelectedDevice] = useState(null);

    useEffect(() => {
        Papa.parse("/datafiles/records.csv", {
            download: true,
            header: true,
            complete: (result) => {
                setData(result.data);
                const uniqueDivisions = [
                    ...new Set(result.data.map((item) => item.division)),
                ];
                setDivisions(uniqueDivisions);
            },
        });
    }, []);

    useEffect(() => {
        if (selectedDivision) {
            const divisionAreas = [
                ...new Set(
                    data
                        .filter((item) => item.division === selectedDivision)
                        .map((item) => item.area)
                ),
            ];
            setAreas(divisionAreas);
            setSelectedArea("");
        } else {
            setAreas([]);
        }
    }, [selectedDivision, data]);

    const handleFilter = () => {
        if (selectedDivision && selectedArea) {
            let filtered = data.filter(
                (item) =>
                    item.division === selectedDivision && item.area === selectedArea
            );

            if (fromDate && toDate) {
                filtered = filtered.filter((item) => {
                    const ts = new Date(item.timestamp);
                    return ts >= fromDate && ts <= toDate;
                });
            }

            const seen = new Set();
            const limited = [];
            for (const row of filtered) {
                if (!seen.has(row.robo_id) && seen.size < 10) {
                    seen.add(row.robo_id);
                    limited.push(row);
                }
            }

            setFilteredData(limited);
        } else {
            setFilteredData([]);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <section className="section1 mt-10">
                <h1 className="text-2xl font-bold">Robot Fleet Management</h1>
                <p className="text-gray-600">Monitor our autonomous drainage Robots</p>
            </section>

            {/* Filters */}
            <section className="flex justify-center h-auto w-full mt-6">
                <div className="flex flex-wrap gap-4 bg-white h-35 p-4 rounded-lg border border-gray-300">
                    {/* Division */}
                    <div className="m-auto text-start">
                        <label className="block font-semibold mb-1">Division</label>
                        <select
                            value={selectedDivision}
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 w-48"
                        >
                            <option value="">Select Division</option>
                            {divisions.map((div, i) => (
                                <option key={i} value={div}>
                                    {div}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Area */}
                    <div className="m-auto text-start">
                        <label className="block font-semibold mb-1">Section</label>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 w-48"
                        >
                            <option value="">Select Area</option>
                            {areas.map((area, i) => (
                                <option key={i} value={area}>
                                    {area}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="m-auto text-start">
                        <label className="block font-semibold mb-1">From Date</label>
                        <DatePicker
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            className="border border-gray-300 rounded-md p-2 w-48"
                            placeholderText="Pick a date"
                        />
                    </div>

                    {/* To Date */}
                    <div className="m-auto text-start">
                        <label className="block font-semibold mb-1">To Date</label>
                        <DatePicker
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            className="border border-gray-300 rounded-md p-2 w-48"
                            placeholderText="Pick a date"
                        />
                    </div>

                    {/* Button */}
                    <div className="flex m-auto">
                        <button
                            className="bg-[#1A8BA8] text-white px-6 py-2 rounded-md flex items-center gap-2 cursor-pointer mt-5.5"
                            onClick={handleFilter}
                        >
                            <span>
                                <img
                                    src="/icons/search-icon.png"
                                    alt="Search Icon"
                                    className="w-4 h-4 "
                                />
                            </span>
                            View Bots
                        </button>
                    </div>
                </div>
            </section>
            <div className="h-20 text-start text-2xl text-bold mx-10 mt-10">
                <h1>Showing Bots from {selectedDivision}</h1>
            </div>

            {/* Display Filtered Data */}
            <section className="">
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                        {filteredData.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedDevice(item)}
                                className="cursor-pointer bg-white border border-gray-400 rounded-xl p-4 h-80 w-90 hover:shadow-xl hover:shadow-blue-200 hover:scale-105 transition-shadow duration-300"
                            >
                                <div className="flex ">
                                    <div>
                                        <img
                                            src="/images/robo.png"
                                            alt="Device"
                                            className="w-full h-40 object-contain rounded-lg mb-4"
                                        />
                                    </div>
                                    <div className="flex text-sm text-gray-600 text-start pl-5 items-center">
                                        <div className="space-y-2">
                                            <p className="flex items-center mb-2">
                                                <span className="text-lg">
                                                    <img
                                                        src="/icons/robot-icon.png"
                                                        alt="Device Icon"
                                                        className="inline-block w-4 h-4 mr-1"
                                                    />
                                                </span>
                                                Device ID: {item.robo_id}
                                            </p>
                                            <p className="flex items-center mb-2">
                                                <span className="text-lg">
                                                    <img
                                                        src="/icons/calendar-icon.png"
                                                        alt="Last Operation Icon"
                                                        className="inline-block w-4 h-4 mr-1"
                                                    />
                                                </span>
                                                Last operation: {item.timestamp}
                                            </p>
                                            <p className="flex items-center mb-2">
                                                <span className="text-lg">
                                                    <img
                                                        src="/icons/gas-icon.png"
                                                        alt="Gas Level Icon"
                                                        className="inline-block w-4 h-4 mr-1"
                                                    />
                                                </span>
                                                Gas level: {item.gas_level}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <hr className="my-4" />
                                <div className="px-15 py-2">
                                    <div className="flex justify-between items-center">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">
                                                {item.waste_collected_kg}Kgs
                                            </p>
                                            <p className="text-xs text-gray-500">Waste Collected</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">
                                                {item.operation_time_minutes}
                                            </p>
                                            <p className="text-xs text-gray-500">Operations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center mt-4">
                        No data available for this selection.
                    </p>
                )}
            </section>

            {/* Modal */}
            {selectedDevice && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white w-11/12 lg:w-3/4 rounded-lg p-6 overflow-y-auto max-h-[90vh]">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedDevice(null)}
                            className="absolute right-6 text-gray-500 hover:text-black text-2xl top-[10px] "
                        >
                            ×
                        </button>

                        {/* Modal Content */}
                        <div className="flex px-5 justify-evenly m-5">
                        <div className="flex flex-row">
                        <div className="flex flex-col">
                            <div className="flex">
                                {/* Left Section */}
                                <div className="text-start ">
                                    <h2 className="text-xl font-bold mb-4">Operation Details</h2>
                                    <p><span><img src="/icons/map-marker-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span> <b>Division:</b> {selectedDevice.division}</p>
                                    <p><span><img src="/icons/map-marker2-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span> <b>Section:</b> {selectedDevice.area}</p>
                                    <p><span><img src="/icons/calendar-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span><b>Date:</b> {new Date(selectedDevice.timestamp).toLocaleDateString()}</p>
                                    <p><span><img src="/icons/clock-blue-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span><b>Starting Time:</b> {new Date(selectedDevice.timestamp).toLocaleTimeString()}</p>
                                    <p><span><img src="/icons/dustbin-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span><b>Waste collected:</b> {selectedDevice.waste_collected_kg}kgs</p>
                                    <p><span><img src="/icons/clock-blue-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span><b>Operating Duration:</b> {selectedDevice.operation_time_minutes} mins</p>
                                    <p><span><img src="/icons/robot-blue-icon.png" alt="" className="inline-block w-4 h-4 mr-1" /></span><b>Device Id:</b> {selectedDevice.robo_id}</p>
                                    <p><b>Gas Level:</b> {selectedDevice.gas_level}</p>
                                </div>

                            </div>

                            </div>
                            </div>


                            {/* Right Section */}
                            <div >
                                <h2 className="text-xl font-bold mb-4">Operating History</h2>
                                <ul className="space-y-3">
                                    <li className="flex items-center justify-between border-b pb-2">
                                        <span>2025-08-04</span>
                                        <span>2:15:30 PM</span>
                                        <button className="text-blue-500">View More</button>
                                    </li>

                                    <li className="flex items-center justify-between border-b pb-2">
                                        <span>2025-08-05</span>
                                        <span>2:15:30 PM</span>
                                        <button className="text-blue-500">View More</button>
                                    </li>
                                </ul>
                            </div>
                            </div>


                        </div>
                    </div>
                  
               
            )
            }
        </div >
    );
}
