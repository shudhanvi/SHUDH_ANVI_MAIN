import { useState, useEffect } from "react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bot, Calendar, Download, MapPin, Funnel } from "lucide-react";
import { Clock } from "lucide-react";
import { Trash } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function Robots() {
  const [data, setData] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [detailedFilteredData, setDetailedFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [detailedfromdate, setDetailedFromDate] = useState(null);
  const [detailedtodate, setDetailedToDate] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Modal state
  const [selectedDevice, setSelectedDevice] = useState(null);

  // ✅ new states for controlling messages
  const [message, setMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const openRoboCardPopUp = (device) => {
    document.body.style.position = "fixed";
    setSelectedDevice(device);
    setSelectedHistory(null);

    let filtereds = data.filter((item) => item.robo_id === device.robo_id);

    filtereds = filtereds.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    setDetailedFilteredData(filtereds);
    setShowResults(true);
  };

  const closeRoboCardPopUp = () => {
    document.body.style.position = "static";
    setSelectedDevice("");
  };

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        console.log("Fetching data from server...");
        const response = await fetch(
          "https://sewage-bot-poc.onrender.com/api/data",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const serverData = await response.json();

        if (Array.isArray(serverData) && serverData.length > 0) {
          console.log("✅ Data loaded from server");
          setData(serverData);
          const uniqueDivisions = [
            ...new Set(serverData.map((item) => item.division)),
          ];
          setDivisions(uniqueDivisions);
          return;
        } else {
          throw new Error("Server returned empty data");
        }
      } catch (error) {
        console.warn(
          "⚠ Server fetch failed/empty, falling back to CSV:",
          error.message
        );

        Papa.parse("/datafiles/records_updated.csv", {
          download: true,
          header: true,
          complete: (result) => {
            console.log("✅ Data loaded from CSV fallback");
            setData(result.data);
            const uniqueDivisions = [
              ...new Set(result.data.map((item) => item.division)),
            ];
            setDivisions(uniqueDivisions);
          },
          error: (err) => {
            console.error("❌ Failed to load fallback CSV:", err);
          },
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      const divisionAreas = [
        ...new Set(
          data
            .filter((item) => item.division === selectedDivision)
            .map((item) => item.section)
        ),
      ];
      setAreas(divisionAreas);
      setSelectedArea("");
    } else {
      setAreas([]);
    }
  }, [selectedDivision, data]);

  // ✅ updated handleFilter with proper messages
  // ✅ new state
  const [divisionError, setDivisionError] = useState("");

  // ✅ updated handleFilter
  const handleFilter = () => {
    setHasSearched(true);
    setMessage("");
    setDivisionError(""); // reset error

    if (!selectedDivision) {
      setFilteredData([]);
      setDivisionError("*Division required"); // <-- specific error
      return;
    }

    let filtered = data.filter((item) => item.division === selectedDivision);

    if (selectedArea) {
      filtered = filtered.filter((item) => item.section === selectedArea);
    }

    if (fromDate && toDate) {
      filtered = filtered.filter((item) => {
        const ts = new Date(item.timestamp);
        return ts >= fromDate && ts <= toDate;
      });
    }

    const latestByRobot = {};
    for (const row of filtered) {
      const ts = new Date(row.timestamp);
      if (
        !latestByRobot[row.robo_id] ||
        ts > new Date(latestByRobot[row.robo_id].timestamp)
      ) {
        latestByRobot[row.robo_id] = row;
      }
    }

    const limited = Object.values(latestByRobot);
    if (limited.length === 0) {
      setMessage("No data available for selected area.");
    }

    setFilteredData(limited);
  };

  const [showResults, setShowResults] = useState(false);

  const apply = () => {
    if (!selectedDevice) return;

    let filtereds = data.filter(
      (item) => item.robo_id === selectedDevice.robo_id
    );

    if (detailedfromdate && detailedtodate) {
      filtereds = filtereds.filter((item) => {
        const ts = new Date(item.timestamp);
        return ts >= detailedfromdate && ts <= detailedtodate;
      });
    }
    filtereds = filtereds.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    setDetailedFilteredData(filtereds);
    setShowResults(true);
  };

  const activeRecord = selectedHistory || selectedDevice;

  return (
    <div className="w-full px-[10px]">
      <section className="section1 mx-auto">
        <h1>Robot Fleet Management</h1>
        <p>Monitor your autonomus drainage robots</p>
      </section>
      {/* Filters */}
      <section className="flex justify-center h-auto w-full mt-6">
        <div className="flex flex-wrap gap-4 bg-white min-h-35 p-4 rounded-lg border border-gray-300">
          {/* Division */}
          <div className="m-auto text-start">
            <label className="block font-semibold mb-1">Division</label>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setDivisionError("");
              }}
              className="border border-gray-300 rounded-md p-2 w-48 min-w-[12rem]"
            >
              <option value="" className="text-xs">
                Select Division
              </option>
              {divisions.map((div, i) => (
                <option key={i} value={div} className="text-xs">
                  {div}
                </option>
              ))}
            </select>

            <p className="text-red-500 text-xs mt-1 ml-2 h-[20px]">
              {divisionError}
            </p>
          </div>

          {/* Section */}
          <div className="m-auto text-start">
            <label className="block font-semibold mb-1">Section</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-48 min-w-[12rem]"
            >
              <option value="" className="text-xs">
                Select Section
              </option>
              {areas.map((section, i) => (
                <option key={i} value={section} className="text-xs">
                  {section}
                </option>
              ))}
            </select>
            <p className="text-red-500 text-sm mt-1 h-[20px]"></p>
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
            <p className="text-red-500 text-sm mt-1 h-[20px]"></p>
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
            <p className="text-red-500 text-sm mt-1 h-[20px]"></p>
          </div>

          {/* Button */}
          <div className=" m-auto">
            <button
              className="bg-[#1A8BA8] text-white px-6 py-2 rounded-[16px] flex items-center gap-2 cursor-pointer mt-5.5  btn-hover transition-all duration-150"
              onClick={handleFilter}
            >
              <span>
                <img
                  src="/icons/search-icon.png"
                  alt="Search Icon"
                  className="inline-block w-4 h-4"
                />
              </span>
              View Bots
            </button>
            <p className="text-red-500 text-sm mt-1 h-[20px]"></p>
          </div>
        </div>
      </section>

      {/* Display Filtered Data */}
      <section className="max-w-[1400px] px-5">
        {filteredData.length > 0 ? (
          <>
            <div className="h-20 flex justify-between text-2xl text-bold mx-20 mt-10">
              <h1>Showing Bots from {selectedDivision} </h1>
              <span className="text-black">
                No.of Bots-{filteredData.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  px-0">
              {filteredData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => openRoboCardPopUp(item)}
                  className="cursor-pointer bg-white border border-gray-200 rounded-xl  px-2 h-80 max-w hover:shadow-lg hover:shadow-[#1A8BA850] hover:scale-101 transition-all duration-110"
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
                          Last operation:{" "}
                          {new Date(item.timestamp).toLocaleDateString()}
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
                          Ward: {item.section}
                        </p>
                      </div>
                    </div>
                  </div>
                  <hr className="my-4 mx-4 text-gray-400 " />
                  <div className="px-15 py-2">
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="text-2xl ">
                          {item.waste_collected_kg}Kgs
                        </p>
                        <p className="text-xs text-gray-500">Waste Collected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl ">
                          {item.operation_time_minutes}
                        </p>
                        <p className="text-xs text-gray-500">Operations</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>{" "}
          </>
        ) : (
          hasSearched && (
            <p className="text-black-500 text-center  text-xl mt-4">
              {message}
            </p>
          )
        )}
      </section>

      {/* Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 h-screen flex items-center justify-center bg-transparent bg-opacity-50 z-[910]">
          <div className="w-full h-screen bg-[#00000099] flex place-content-center">
            <div className="bg-white w-11/12 lg:w-3/4 rounded-lg p-6 overflow-y-auto max-h-[100vh] relative right-5 top-5 shadow-2xl border border-gray-300">
              <button
                onClick={() => closeRoboCardPopUp()}
                className="popup-cancel-btn absolute right-6 text-gray-500 hover:text-black top-[10px] cursor-pointer"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="flex flex-row justify-around">
                <div className="text-start w-[45%]">
                  <h1 className="text-start text-[18px]  mb-2">
                    Operational Details
                  </h1>
                </div>
                <div className="text-start w-[45%]">
                  <h1 className="text-start text-[18px] mb-2">
                    Operation History
                  </h1>
                </div>
              </div>
              <div className="flex flex-row justify-around ">
                <div className="w-[45%] ">
                  <div className="flex flex-col justify-start text-gray-500 w-full">
                    <span className="text-start text-[14px] text-[#676D7E]">
                      <img
                        src="/icons/map-marker-icon.png"
                        alt=""
                        className="inline-block w-4  mr-1 "
                      />
                      Division:{activeRecord.division}
                    </span>
                    <br />
                    <span className="text-start text-[14px] text-[#676D7E]">
                      <img
                        src="/icons/map-marker2-icon.png"
                        alt=""
                        className="inline-block w-4  mr-1 "
                      />
                      Section:{activeRecord.section}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 w-full text-start text-[14px] text-[#676D7E] mt-5 gap-y-6">
                    <span className="flex flex-row">
                      <Calendar
                        className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md"
                        color="#0380FC"
                      />
                      <span className="flex flex-col ml-2">
                        Date
                        <span className="text-[#21232C] text-[16px]">
                          {" "}
                          {new Date(
                            activeRecord.timestamp
                          ).toLocaleDateString()}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-row">
                      <Clock
                        className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md"
                        color="#0380FC"
                      />
                      <span className="flex flex-col ml-2">
                        Starting Time
                        <span className="text-[#21232C] text-[16px]">
                          {new Date(
                            activeRecord.timestamp
                          ).toLocaleTimeString()}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-row">
                      <Trash
                        className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md"
                        color="#0380FC"
                      />
                      <span className="flex flex-col ml-2">
                        Waste Collected{" "}
                        <span className="text-[#21232C] text-[16px]">
                          {activeRecord.waste_collected_kg}kgs
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-row">
                      <Clock
                        className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md"
                        color="#0380FC"
                      />
                      <span className="flex flex-col ml-2">
                        Task Duration{" "}
                        <span className="text-[#21232C] text-[16px]">
                          {activeRecord.operation_time_minutes} mins
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-row mt-4">
                    <div className="flex flex-col text-start text-[14px] text-[#676D7E]  gap-y-5 w-[50%]">
                      <span className="flex flex-row">
                        <Bot
                          className="inline-block w-10 h-10 mr-1 bg-[#0380FC10] p-2 rounded-md"
                          color="#0380FC"
                        />
                        <span className="flex flex-col ml-2">
                          Robo Id{" "}
                          <span className="text-[#21232C] text-[16px]">
                            {activeRecord.robo_id}
                          </span>
                        </span>
                      </span>
                      <span>
                        {" "}
                        <MapPin
                          className="inline-block w-10 h-10 mr-3 bg-[#0380FC10] p-2 rounded-md"
                          color="#0380FC"
                        />
                        {activeRecord.section}
                      </span>
                    </div>

                    <div className="flex items-center justify-start w-[50%]">
                      <div style={{ width: 90, height: 90 }}>
                        <CircularProgressbar
                          value={
                            activeRecord.gas_level?.toLowerCase() === "low"
                              ? 22
                              : activeRecord.gas_level?.toLowerCase() ===
                                "medium"
                              ? 55
                              : activeRecord.gas_level?.toLowerCase() === "high"
                              ? 80
                              : 0
                          }
                          text={
                            activeRecord.gas_level
                              ? activeRecord.gas_level.charAt(0).toUpperCase() +
                                activeRecord.gas_level.slice(1).toLowerCase()
                              : "N/A"
                          }
                          styles={buildStyles({
                            textSize: "16px",
                            textColor: "#000",
                            pathColor:
                              activeRecord.gas_level?.toLowerCase() === "high"
                                ? "red"
                                : activeRecord.gas_level?.toLowerCase() ===
                                  "medium"
                                ? "orange"
                                : "green",
                            trailColor: "#eee",
                            strokeLinecap: "round",
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className=" w-full text-start text-[#21232C] mt-5 bg-gray-100 rounded-lg p-2 ">
                    <h1 className=" pb-1 text-start">
                      {activeRecord.location}
                    </h1>
                    {/* Map Container */}
                    <div className="bd-gray">
                      {activeRecord?.location ? (
                        (() => {
                          const [lat, lng] = activeRecord.location
                            .split(",")
                            .map(Number);
                          return (
                            <MapContainer
                              center={[lat, lng]}
                              zoom={23}
                              className="h-40 rounded-lg"
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <Marker position={[lat, lng]}>
                                <Popup>{activeRecord.location}</Popup>
                              </Marker>
                            </MapContainer>
                          );
                        })()
                      ) : (
                        <p>No location available</p>
                      )}
                    </div>
                  </div>
                  <h1 className="text-[16px] text-[#21232C]  pt-5 text-start ">
                    Operation Images
                  </h1>
                  <div className="h-45 rounded-lg mt-2  w-full grid grid-cols-2 gap-2 mb-10">
                    <h1>Before</h1>
                    <h1>After</h1>
                    <img
                      src={
                        activeRecord.image_url
                          ? activeRecord.image_url
                          : "/images/before.png"
                      }
                      alt="Operation"
                      className="h-full object-cover rounded-lg border border-gray-100"
                    />

                    <img
                      src={
                        activeRecord.image_url
                          ? activeRecord.image_url
                          : "/images/after.png"
                      }
                      alt="Operation"
                      className="h-full object-cover rounded-lg border border-gray-100"
                    />
                  </div>
                  <div className=" flex justify-center w-full ">
                    <button className=" flex items-center justify-center h-[48px] bg-[#1A8BA8] text-[16px]  w-full text-white rounded-[16px] cursor-pointer btn-hover">
                      <Download
                        className="inline-block w-5 h-5 mr-1  "
                        color="white"
                      />
                      Generate Operation Report
                    </button>
                  </div>
                </div>

                <div className="  w-[45%]">
                  <div className="flex flex-row">
                    <span className="inline-block text-[#676D7E] mr-2  ">
                      <Funnel />
                    </span>
                    <h1 className="text-start text-[14px] ">
                      {" "}
                      Filter by Date Range
                    </h1>
                  </div>
                  <div className="flex flex-row w-full justify-between mb-5 mt-3 gap-2 ">
                    <div className="text-start w-[45%] mt-2 ">
                      <label className="block text-[16px] text-[#676D7E100] mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={
                          detailedfromdate && !isNaN(detailedfromdate)
                            ? detailedfromdate.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setDetailedFromDate(val);
                        }}
                      />
                    </div>
                    <div className="text-start w-[45%] mt-2">
                      <label className="block text-[16px] text-[#676D7E100] mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-md p-2 w-full "
                        value={
                          detailedtodate && !isNaN(detailedtodate)
                            ? detailedtodate.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setDetailedToDate(val);
                        }}
                      />
                    </div>
                    <div>
                      <button
                        className="bg-[#1A8BA8] cursor-pointer text-white rounded-md h-10 text-sm px-6 mt-8.5 btn-hover"
                        onClick={apply}
                      >
                        Filter
                      </button>
                    </div>
                  </div>

                  <div className="max-h-190 shadow overflow-y-auto  rounded-md p-2">
                    <ul className="space-y-3">
                      {showResults &&
                        detailedFilteredData.map((history, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between pb-5"
                          >
                            <span>
                              <img
                                src="/icons/calendar-icon.png"
                                alt=""
                                className="inline-block h-5 mr-2"
                              />
                              {new Date(history.timestamp).toLocaleDateString()}
                            </span>
                            <span>
                              <img
                                src="/icons/clock-icon.png"
                                alt=""
                                className="inline-block h-5 mr-2"
                                color="black"
                              />
                              {new Date(history.timestamp).toLocaleTimeString()}
                            </span>
                            <button
                              className="text-white text-sm rounded cursor-pointer bg-blue-500 h-8 p-2"
                              onClick={() => setSelectedHistory(history)}
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
      )}
    </div>
  );
}
