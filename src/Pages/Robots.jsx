import { useState, useEffect } from "react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bot, Calendar, Download, MapPin, Funnel } from 'lucide-react';
import { Clock } from 'lucide-react';
import { Trash } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

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

    const openRoboCardPopUp = (i) => {
        document.body.style.position = "fixed";
        setSelectedDevice(i);
    }

    const closeRoboCardPopUp = () => {
        document.body.style.position = "static";
        setSelectedDevice('');
    }

    useEffect(() => {
        Papa.parse("/datafiles/records_updated.csv", {
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


        }
        else if (selectedDivision && !selectedArea) {
            let filtered = data.filter((item) => item.division === selectedDivision);
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
        }
        else {
            setFilteredData([]);
        }
    };
    const [showResults, setShowResults] = useState(false); // new state

    const apply = () => {
        let filtereds = data.filter((item) => item.division === selectedDivision);

        if (fromDate && toDate) {
            filtereds = filtereds.filter((item) => {
                const ts = new Date(item.timestamp);
                return ts >= fromDate && ts <= toDate;
            });
        }

        setFilteredData(filtereds);
        setShowResults(true); // show results after clicking apply
    };




    return (
        <div className="">
            {/* Header */}
            <section className="section1 mt-10 mx-auto text-center w-full">
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


            {/* Display Filtered Data */}
            <section className=" w-[1400px] px-20">
                {filteredData.length > 0 ? (
                    <>
                        <div className="h-20 flex justify-between text-2xl text-bold mx-20 mt-10">
                            <h1>Showing Bots from {selectedDivision}   </h1>
                            <span className="text-black">No.of Bots-{filteredData.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  px-0">
                            {filteredData.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => openRoboCardPopUp(item)}
                                    className="cursor-pointer bg-white border border-gray-400 rounded-xl  px-2 h-80 max-w hover:shadow-xl hover:shadow-blue-200 hover:scale-105 transition-shadow duration-300"
                                >
                                    <div className="flex flex-row">
                                        <img
                                            src="/images/Robo.jpg"
                                            alt="Device"
                                            className="w-40 h-40 mt-3 object-cover rounded-lg mb-4"
                                        />
                                        <div className="flex text-sm pl-2 text-gray-600 text-start items-center">
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
                                                    Last operation: {new Date(item.timestamp).toLocaleDateString()}
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
                                                <p className="flex items-center mb-2">
                                                    <span className="text-lg">
                                                        <img
                                                            src="/icons/map-pin-icon.png"
                                                            alt="Last Operation Icon"
                                                            className="inline-block w-4 h-4 mr-1"
                                                        />
                                                    </span>
                                                    Ward: {item.area}
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
                        </div> </>

                ) : (
                    <p className="text-gray-500 text-center mt-4">
                        No data available for this selection.
                    </p>
                )}
            </section>

            {/* Modal */}
            {selectedDevice && (
                <div className="fixed inset-0 h-screen flex items-center justify-center bg-transparent bg-opacity-50 z-[910]">
                    <div className="w-full h-screen bg-[#00000099] flex place-content-center">
                    <div className="bg-white w-11/12 lg:w-3/4 rounded-lg p-6 overflow-y-auto max-h-[100vh] relative right-5 top-5 shadow-2xl border border-gray-300">

                        <button
                            onClick={() => closeRoboCardPopUp()}
                            className="absolute right-6 text-gray-500 hover:text-black text-5xl top-[10px] "
                        >
                            ×
                        </button>

                        {/* Modal Content */}
                        <div className="flex flex-row justify-between ">

                            <div className="text-start w-[45%]">
                                <h1 className="text-start text-3xl font-bold mb-2">Operational Details</h1>
                            </div>
                            <div className="text-start w-[45%]">
                                <h1 className="text-start text-3xl font-bold mb-2">Operation History</h1>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between ">
                            <div className="w-[45%] ">
                                <div className="flex flex-col justify-start text-gray-500 w-full">
                                    <span className="text-start"><img src="/icons/map-marker-icon.png" alt="" className="inline-block w-4 h-4 mr-1 " />Division:{selectedDevice.division}</span><br />
                                    <span className="text-start"><img src="/icons/map-marker2-icon.png" alt="" className="inline-block w-4 h-4 mr-1 " />Section:{selectedDevice.area}</span>

                                </div>
                                <div className="grid grid-cols-2 w-full text-start text-gray-500 mt-5 gap-y-6">
                                    <span><Calendar className="inline-block w-10 h-10 mr-1 bg-blue-100 p-2 rounded-md" color="#348feb" />Date : <b className="text-black font-semibold">{new Date(selectedDevice.timestamp).toLocaleDateString()}</b></span>
                                    <span><Clock className="inline-block w-10 h-10 mr-1 bg-blue-100 p-2 rounded-md" color="#348feb" />Starting Time : <b className="text-black font-semibold">{new Date(selectedDevice.timestamp).toLocaleTimeString()}</b></span>
                                    <span><Trash className="inline-block w-10 h-10 mr-1 bg-blue-100 p-2 rounded-md" color="#348feb" />Waste Collected : <b className="text-black font-semibold">{selectedDevice.waste_collected_kg}kgs</b></span>
                                    <span><Clock className="inline-block w-10 h-10 mr-1 bg-blue-100 p-2 rounded-md" color="#348feb" />Task Duration: <b className="text-black font-semibold">{selectedDevice.operation_time_minutes} mins</b></span>
                                    <span><Bot className="inline-block w-10 h-10 mr-1 bg-blue-100 p-2 rounded-md" color="#348feb" />Robo Id: <b className="text-black font-semibold">{selectedDevice.robo_id}</b></span>
                                    <span className="text-2xl text-black pl-2" >Gas Level:<span style={{
                                        color:
                                            selectedDevice.gas_level?.toLowerCase() === "high"
                                                ? "red"
                                                : selectedDevice.gas_level?.toLowerCase() === "medium"
                                                    ? "orange"
                                                    : "green",
                                    }}> {selectedDevice.gas_level
                                        ? selectedDevice.gas_level.charAt(0).toUpperCase() + selectedDevice.gas_level.slice(1).toLowerCase()
                                        : ""}</span></span>
                                    <span><MapPin className="inline-block w-10 h-10 mr-1 bg-blue-100 p-2 rounded-md" color="#348feb" />{selectedDevice.area}</span>
                                </div>
                                <h1 className=" font-semibold px-3 pt-8 text-start">{selectedDevice.location}</h1>
                                <div className=" w-full text-start text-gray-500 mt-5 bg-gray-200 rounded-lg ">

                                    {/* Map Container */}
                                    <div className="bd-gray">
                                        {selectedDevice?.location ? (
                                            (() => {
                                                const [lat, lng] = selectedDevice.location.split(',').map(Number);
                                                return (
                                                    <MapContainer center={[lat, lng]} zoom={23} className="h-40 rounded-lg">
                                                        <TileLayer
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        />
                                                        <Marker position={[lat, lng]}>
                                                            <Popup>{selectedDevice.location}</Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                );
                                            })()
                                        ) : (
                                            <p>No location available</p>
                                        )}
                                    </div>
                                </div>
                                <h1 className="font-semibold px-3 pt-8 text-start">Operation Images</h1>
                                <div className="h-45 rounded-lg mt-10 p-3 w-full grid grid-cols-2 gap-2">
                                    <img src={selectedDevice.image_url ? selectedDevice.image_url : '/images/before.png'} alt="Operation" className="h-full object-cover rounded-lg border border-gray-100" />

                                    <img src={selectedDevice.image_url ? selectedDevice.image_url : '/images/after.png'} alt="Operation" className="h-full object-cover rounded-lg border border-gray-100" />
                                </div>
                                <div className="mt-5 flex justify-center w-full pb-10">
                                    <p className=" flex items-center justify-center h-15 bg-[#1A8BA8] w-full text-white rounded-md"><Download className="inline-block w-5 h-5 mr-1 " color="white" />Generate Operation Report</p>
                                </div>
                            </div>






                            <div className="  w-[45%]">
                                <h1 className="text-start mt-2 "> <span className="inline-block w-3 h-3 mr-5"><Funnel /></span>Filter by Date</h1>
                                <div className="flex flex-row w-full justify-between mb-5 mt-3 gap-2">

                                    <div className="text-start w-[45%] mt-2 ">

                                        <label className="block font-semibold mb-1">From Date</label>
                                        <input type="date" className="border border-gray-300 rounded-md p-2 w-full" value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setFromDate(new Date(e.target.value))} />
                                    </div>
                                    <div className="text-start w-[45%] mt-2">
                                        <label className="block font-semibold mb-1">To Date</label>
                                        <input type="date" className="border border-gray-300 rounded-md p-2 w-full " value={toDate ? toDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setToDate(new Date(e.target.value))} />
                                    </div>
                                    <div>
                                        <button className="bg-[#1A8BA8] text-white rounded-md h-10 text-sm px-6 mt-8.5" onClick={apply}>Filter</button>
                                    </div>

                                </div>


                                <div className="max-h-190 shadow overflow-y-auto  rounded-md p-2">
                                    <ul className="space-y-3">
                                        {showResults && filteredData.map((history, index) => (
                                            <li key={index} className="flex items-center justify-between pb-5">
                                                <span>{new Date(history.timestamp).toLocaleDateString()}</span>
                                                <span>{new Date(history.timestamp).toLocaleTimeString()}</span>
                                                <button
                                                    className="text-blue-500"
                                                    onClick={() => setSelectedDevice(history)}
                                                >
                                                    View More
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>


                        </div>
                    </div>
                       </div>                 


                </div>



            )
            }
        </div >
    );
}