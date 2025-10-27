import { useState, useEffect, useRef, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bot, Calendar, MapPin, Search, FireExtinguisher } from "lucide-react";
import Papa from "papaparse";
import { useServerData } from "../context/ServerDataContext";
import { RobotPopupComponent } from "../components/robots/RobotPopupComponent";
const userInputsObj = {
  division: "",
  section: "",
  fromDate: "",
  toDate: "",
};

const userInputsErrorObj = {
  division: false,
  section: false,
  fromDate: false,
  toDate: false,
};

export const Robots = () => {
  const { serverData, loading, message } = useServerData();
  const [inputError, setInputError] = useState(userInputsErrorObj);
  const [userInputs, setUserInputs] = useState(userInputsObj);
  const [MainData, setMainData] = useState([]);
  const [staticData, setStaticData] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeRobot, setActiveRobot] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(userInputsObj);
  const backendCalls = useRef({ static: false, server: false });

  // Handle input changes
  const handleInput = (key, value) => {
    setUserInputs((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "division") updated.section = ""; // reset section when division changes
      return updated;
    });
  };

  // Fetch static CSV once
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const res = await fetch("/datafiles/CSVs/Robo_Operations.csv");
        const csvText = await res.text();
        const parsedCSV = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        }).data;
        setStaticData(parsedCSV);
      } catch (err) {
        console.error("Error fetching CSV:", err);
      }
    };
    fetchCSV();
  }, []);

  // Normalize data
  const structingData = (dataObj) => {
    return Object.keys(dataObj).map((index) => {
      const item = dataObj[index];
      return {
        id: item?.id || "-",
        operation_id: item?.operation_id || "-",
        device_id: item?.device_id || item?.deviceId || item?.robot_id || "-",
        before_path: item?.before_path || "-",
        after_path: item?.after_path || "-",
        gas_data_raw: item?.gas_data_raw || "-",
        gas_status: item?.gas_status || "-",
        location: item?.location || "-",
        timestamp: item?.timestamp || item?.time || "-",
        district: item?.district || item?.city || "-",
        division: item?.division || "-",
        area: item?.area || item?.section || "-",
        operation_time_minutes: item?.operation_time_minutes || "-",
        manhole_id: item?.manhole_id || "Unknown",
        waste_collected_kg:
          item?.waste_collected_kg || item?.wasteCollectedKg || "-",
      };
    });
  };

  // Merge static data
  useEffect(() => {
    if (staticData?.length > 0 && !backendCalls.current.static) {
      backendCalls.current.static = true;
      const StaticStructData = structingData(staticData);
      setMainData((prev) => [...prev, ...StaticStructData]);
    }
  }, [staticData]);

  // Merge server data
  useEffect(() => {
    if (serverData?.length > 0 && !backendCalls.current.server) {
      backendCalls.current.server = true;
      const backendStructData = structingData(serverData);
      setMainData((prev) => [...prev, ...backendStructData]);
    }
  }, [serverData]);

  // Build division → section hierarchy
  const hierarchyData = useMemo(() => {
    const hierarchy = {};
    MainData.forEach((item) => {
      const division = item?.division || "-";
      const section = item?.area || "-";

      if (!hierarchy[division]) hierarchy[division] = {};
      if (!hierarchy[division][section]) hierarchy[division][section] = {};
    });
    return hierarchy;
  }, [MainData]);

  const divisions = Object.keys(hierarchyData);
  const sections = userInputs.division
    ? Object.keys(hierarchyData[userInputs.division] || {})
    : [];

  // Filter logic
  const filteredData = useMemo(() => {
    if (!MainData || MainData.length === 0) return [];

    const fromDate = appliedFilters.fromDate
      ? new Date(appliedFilters.fromDate)
      : null;
    const toDate = appliedFilters.toDate
      ? new Date(appliedFilters.toDate)
      : null;

    return MainData.filter((item) => {
      const division = (appliedFilters.division || "")
        .toString()
        .trim()
        .toLowerCase();
      const section = (appliedFilters.section || "")
        .toString()
        .trim()
        .toLowerCase();

      const itemDivision = (item.division || "").toString().trim().toLowerCase();
      const itemSection = (item.area || "").toString().trim().toLowerCase();

      const divisionMatch = !division || itemDivision === division;
      const sectionMatch = !section || itemSection === section;

      const itemTime = item.timestamp ? new Date(item.timestamp) : null;
      const fromOk = !fromDate || (itemTime && itemTime >= fromDate);
      const toOk = !toDate || (itemTime && itemTime <= toDate);

      return divisionMatch && sectionMatch && fromOk && toOk;
    });
  }, [MainData, appliedFilters]);

  // Group filtered data by robot
  const uniqueBots = useMemo(() => {
    const map = new Map();

    filteredData.forEach((op) => {
      const botId = op.device_id || "Unknown";
      if (!map.has(botId)) {
        map.set(botId, {
          device_id: botId,
          gas_status: op.gas_status || "-",
          area: op.area || "-",
          waste_collected_kg: Number(op.waste_collected_kg) || 0,
          operationsCount: 1,
          latestTimestamp: op.timestamp ? new Date(op.timestamp) : null,
        });
      } else {
        const cur = map.get(botId);
        cur.operationsCount += 1;
        cur.waste_collected_kg += Number(op.waste_collected_kg) || 0;
        if (op.timestamp) {
          const d = new Date(op.timestamp);
          if (!cur.latestTimestamp || d > cur.latestTimestamp)
            cur.latestTimestamp = d;
        }
        map.set(botId, cur);
      }
    });

    return Array.from(map.values());
  }, [filteredData]);

  // Handle filter button
  const handleViewBots = () => {
    const errors = { ...userInputsErrorObj };

    if (!userInputs.division) errors.division = true;
    setInputError(errors);

    if (errors.division) return;
    setAppliedFilters(userInputs);
    setShowFiltered(true);
  };

  return (
    <div className="w-full ">
      <section className="section1 border-b-[1.5px] border-[#E1E7EF] py-[10px] px-[30px] bg-white ">
      <h1 className="text-[24px] font-bold">Robots</h1>
      <p className="text-[14px] text-[#65758B]">Monitor and manage robot fleet</p>
      </section>

      {/* Filters */}
      <section className="flex justify-center h-auto w-full mt-6 ">
        <div className="flex flex-wrap justify-evenly gap-[1%] p-[22px] pb-[26px] mx-[30px] rounded-xl border-[1.5px] border-[#E1E7EF]  items-center max-w-[2400px] w-[100%] bg-white ">
          {/* Division */}
          <div className=" text-start relative">
            <label className="block font-semibold mb-1">Division</label>
            <div className="flex flex-col">
              <select
                value={userInputs.division}
                onChange={(e) => handleInput("division", e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full min-w-[150px] text-sm relative "
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
              <span className="absolute bottom-[-20px] ">{inputError.division && (
                <span className="text-red-500 text-xs mt-1 ml-2">
                  *Division required
                </span>
              )}</span>
            </div>
          </div>

          {/* Section */}
          <div className=" text-start">
            <label className="block font-semibold mb-1">Section</label>
            <select
              value={userInputs.section}
              onChange={(e) => handleInput("section", e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full min-w-[150px] text-sm"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className=" text-start relative">
            <label className="block font-semibold mb-1">From Date</label>
            <DatePicker
              selected={userInputs.fromDate}
              onChange={(date) => handleInput("fromDate", date)}
              className="border border-gray-300 rounded-md p-2 w-full text-sm min-w-[150px]"
              placeholderText="Pick a date"
              maxDate={new Date()}
            />
            <Calendar className="absolute top-8 right-2 text-gray-600" />
          </div>

          {/* To Date */}
          <div className=" text-start relative">
            <label className="block font-semibold mb-1">To Date</label>
            <DatePicker
              selected={userInputs.toDate}
              onChange={(date) => handleInput("toDate", date)}
              className="border border-gray-300 rounded-md p-2 w-full text-sm min-w-[150px]"
              placeholderText="Pick a date"
              maxDate={new Date()}
            />
            <Calendar className="absolute top-8 right-2 text-gray-600" />
          </div>

          {/* Button */}
          <div className="">
            <button
              className="bg-[#1A8BA8] text-white px-6 py-2 rounded-[16px] flex items-center gap-2 cursor-pointer mt-5.5 transition-all duration-150"
              onClick={handleViewBots}
            >
              <Search className="w-4.5" />
              View Bots
            </button>
          </div>
        </div>
      </section>

      {/* Data Display */}
      <section className="w-full px-5">
        {loading ? (
          <p className="text-gray-800 text-center text-xl mt-4 animate-pulse">
            {message}
          </p>
        ) : showFiltered ? (
          uniqueBots.length > 0 ? (
            <>
              <div className="h-20 flex justify-between text-2xl text-bold mx-20 mt-10">
                <h1>
                  Showing Bots from{" "}
                  {userInputs?.section || userInputs.division}
                </h1>
                <span className="text-black">
                  No. of Bots - {uniqueBots.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-0">
                {uniqueBots.map((item, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer bg-white border border-gray-200 rounded-xl px-2 h-80 hover:shadow-lg hover:shadow-[#1A8BA850] hover:scale-101 transition-all duration-110"
                    onClick={() => {
                      const botOperations = filteredData.filter(
                        (op) => op.device_id === item.device_id
                      );
                      const latestOp = botOperations.reduce(
                        (a, b) =>
                          new Date(a.timestamp) > new Date(b.timestamp) ? a : b,
                        botOperations[0]
                      );
                      setActiveRobot({
                        ...latestOp,
                        operation_history: botOperations,
                      });
                      setShowPopup(true);
                    }}
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
                            <Bot className="inline-block w-4 h-4 mr-1 mb-1" />
                            Device ID: {item?.device_id || "-"}
                          </p>
                          <p className="flex items-center mb-2">
                            <Calendar className="inline-block w-3 h-4 mr-2 mb-1" />
                            Last operation:{" "}
                            {item?.latestTimestamp
                              ? new Date(
                                  item.latestTimestamp
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                          <p className="flex items-center mb-2">
                            <FireExtinguisher className="inline-block w-4 h-4 mr-1 mb-1" />
                            Gas status:{" "}
                            {item.gas_status
                              ? item.gas_status
                                  .charAt(0)
                                  .toUpperCase() +
                                item.gas_status.slice(1).toLowerCase()
                              : "N/A"}
                          </p>
                          <p className="flex items-center mb-2">
                            <MapPin className="inline-block w-4 h-4 mr-1 mb-1" />
                            Ward: {item.area || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <hr className="my-4 mx-4 text-gray-400 " />
                    <div className="px-15 py-2">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-2xl ">
                            {item?.waste_collected_kg ?? "-"} Kgs
                          </p>
                          <p className="text-xs text-gray-500">
                            Waste Collected
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl ">
                            {item?.operationsCount ?? 0}
                          </p>
                          <p className="text-xs text-gray-500">Operations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-black-500 text-center text-xl mt-4">
              No data matches your filters.
            </p>
          )
        ) : (
          <div className="flex flex-col justify-center items-center mt-[50px]">
            <img className="h-[130px] w-[130px]" src="/images/Robot-filter.png"/>
          <p className="text-gray-400 text-center ">
            “No robots to display yet. Please select a Division and Section to get started.”
          </p>
          </div>
        )}

        {showPopup && activeRobot && (
          <RobotPopupComponent
            activeRecord={activeRobot}
            closePopup={() => setShowPopup(false)}
          />
        )}
      </section>
    </div>
  );
};
