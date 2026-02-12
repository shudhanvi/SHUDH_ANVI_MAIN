import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bot, Calendar, MapPin, Search, FireExtinguisher } from "lucide-react";
import { useServerData } from "../context/ServerDataContext";
import { fetchRobotSummary } from "../api/robots";
import { RobotPopupComponent } from "../components/robots/robotPopupComponent";

const userInputsObj = { division: "", section: "", fromDate: "", toDate: "" };
const userInputsErrorObj = { division: false, section: false, fromDate: false, toDate: false };

export const Robots = () => {
  const [robotSummary, setRobotSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const serverData = useServerData();
  const { data } = serverData;

  // console.log("ServerDataContext:", serverData);

  const [inputError, setInputError] = useState(userInputsErrorObj);
  const [userInputs, setUserInputs] = useState(userInputsObj);
  // const [MainData, setMainData] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeRobot, setActiveRobot] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(userInputsObj);

  const dropdownRows = data?.dropdowndata ?? [];

  const divisions = useMemo(() => {
    return Array.from(
      new Set(dropdownRows.map(row => row.division))
    );
  }, [dropdownRows]);

  const sections = useMemo(() => {
    if (!userInputs.division) return [];

    return dropdownRows
      .filter(row => row.division === userInputs.division)
      .map(row => row.section);
  }, [dropdownRows, userInputs.division]);


  useEffect(() => {
    if (!showFiltered) return;

    const loadRobotSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);

        // ✅ PAYLOAD IS BUILT HERE
        const payload = {
          division: appliedFilters.division,
          section: appliedFilters.section || "",
          from_date: appliedFilters.fromDate
            ? appliedFilters.fromDate.toISOString()
            : "",
          to_date: appliedFilters.toDate
            ? appliedFilters.toDate.toISOString()
            : "",
        };

        const res = await fetchRobotSummary(payload);

        setRobotSummary(res.robots_data || []);
      } catch (err) {
        setSummaryError("Failed to load robot summary");
        setRobotSummary([]);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadRobotSummary();
  }, [showFiltered, appliedFilters]);

  // console.log(robotSummary)

  const handleInput = (key, value) => {
    setUserInputs(prev => {
      const updated = { ...prev, [key]: value };
      if (key === "division") updated.section = "";
      return updated;
    });
  };


  const getDisplayName = (rawName) => {
    if (typeof rawName !== 'string') return rawName;

    const match = rawName.match(/\(([^)]+)\)/); // Find text in ( )

    if (match && match[1]) {
      const textInside = match[1];

      // Check if the text inside parentheses contains letters
      if (/[a-zA-Z]/.test(textInside)) {
        // Use text inside: "Division 15(durgam cheruvu )" -> "durgam cheruvu"
        return textInside.trim();
      } else {
        // Use text outside: "SR nagar (6)" -> "SR nagar"
        return rawName.split('(')[0].trim();
      }
    }

    // No parentheses, just return the name trimmed
    return rawName.trim();
  };




  // Handle filter button
  const handleViewBots = () => {
    const errors = { ...userInputsErrorObj };
    if (!userInputs.division) errors.division = true;
    setInputError(errors);

    if (errors.division) return;

    setAppliedFilters(userInputs);
    setShowFiltered(true);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };


  // console.log("MainData:", MainData);
  return (
    <div className="w-full ">
      <section className="section1 border-b-[1.5px] border-[#E1E7EF] py-[10px] px-[30px] bg-white ">
        <h1 className="text-[24px] font-bold">Robots</h1>
        <p className="text-[14px] text-[#65758B]">Monitor and manage robot fleet</p>
      </section>

      {/* Filters */}
      <section className="flex justify-center h-auto w-full mt-6 ">
        <div className="flex  gap-[10px] justify-evenly p-[22px] pb-[26px] mx-[30px] rounded-xl border-[1.5px] border-[#E1E7EF]  items-center max-w-[2400px] w-[100%] bg-white ">
          <div className="flex justify-evenly w-[85%] gap-[15px]">

            <div className=" text-start relative w-[-webkit-fill-available] " >
              <label className="block font-semibold mb-1">Division</label>
              <div className="flex flex-col">
                <select
                  value={userInputs.division}
                  onChange={(e) => handleInput("division", e.target.value)}
                  className="border  border-gray-300 rounded-md p-2 w-full min-w-[150px] text-sm relative "
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {getDisplayName(div)}
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

            <div className=" text-start w-[-webkit-fill-available]" >
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


            <div className=" text-start relative w-[-webkit-fill-available]">
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

            <div className=" text-start relative w-[-webkit-fill-available]">
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
          </div>

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

      <section className="w-full px-5">
        {summaryLoading ? (
          <p className="text-gray-800 text-center text-xl mt-4 animate-pulse">
            Loading robot summary...
          </p>
        ) : summaryError ? (
          <p className="text-red-500 text-center mt-4">
            {summaryError}
          </p>
        ) : showFiltered ? (
          robotSummary.length > 0 ? (
            <>
              <div className="h-20 flex justify-between text-2xl  mx-20 mt-10">
                <h1>
                  Showing Bots from {userInputs.section || userInputs.division}
                </h1>
                <span>No. of Bots - {robotSummary.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-0">
                {robotSummary.map((item) => (
                  <div
                    key={item.device_id}
                    className="cursor-pointer bg-white border border-gray-200 rounded-xl px-2 h-80
                         hover:shadow-lg hover:shadow-[#1A8BA850] hover:scale-[1.01]
                         transition-all duration-150"
                    onClick={() => {
                      
                      const activerobotdata= {
                        device_id: item.device_id,
                        division: userInputs.division,
                        section: item.section,
                        count:item.operations_count,
                        from_date:userInputs.fromDate,
                        to_date:userInputs.toDate
                      }
                      setActiveRobot(activerobotdata);
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
                        <div className="flex flex-col gap-y-3">
                          <p className="flex items-center mb-2">
                            <Bot className="inline-block w-4 h-4 mr-1 mb-1" />
                            Device ID: {item.device_id}
                          </p>
                          <p className="flex items-center mb-2 flex-wrap">
                            <Calendar className="inline-block w-3 h-4 mr-2 mb-1" />
                            Last operation:{" "}
                            {item.last_operation_timestamp ? (
                              <span>
                                {new Date(
                                  item.last_operation_timestamp
                                ).toLocaleDateString()}
                              </span>
                            ) : (
                              "-"
                            )}
                          </p>

                          <p className="flex items-center mb-2">
                            <MapPin className="inline-block w-4 h-4 mr-1 mb-1" />
                            Ward: {item.section }
                          </p>
                        </div>
                      </div>
                    </div>

                    <hr className="my-4 mx-4 text-gray-400" />

                    <div className="px-15 py-2">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-2xl">-</p>
                          <p className="text-xs text-gray-500">
                            Waste Collected
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl">
                            {item.operations_count}
                          </p>
                          <p className="text-xs text-gray-500">
                            Operations
                          </p>
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
            <img
              className="h-[130px] w-[130px]"
              src="/images/Robot-filter.png"
            />
            <p className="text-gray-400 text-center italic">
              “No robots to display yet. Please select a Division and Section to get started.”
            </p>
          </div>
        )}
      </section>

{/* {console.log("9876543",activeRobot)} */}
{showPopup && activeRobot && (
  <RobotPopupComponent
    activeRobot = {activeRobot}
    closePopup={() => {
      setShowPopup(false);
      setActiveRobot(null);
    }}
    
  />
)}


    </div>
  );
};
