import { File } from "lucide-react";
import { ChartLine } from "lucide-react";
import { FileChartColumnIncreasing } from "lucide-react";
import { Bot } from "lucide-react";

import React, { useState } from "react";
import Header from "../Components/Header";

export default function Reports() {
  const divisions = [
    "Old Bowenpally",
    "SR Nagar",
    "Kukatpally",
    "Durgam Cheruvu",
    "Hafeezpet",
    "Manikonda"
  ];

  const divisionsByDivision = {
    "SR Nagar": [
      "Borabanda",
      "Somajiguda",
      "Yellareddyguda",
      "Jubille Hills",
      "Vengalroanagar",
      "Fathenagar"
    ],
    "Kukatpally": [
      "Bhagyanagar",
      "Kukatpally",
      "Vivekanandha Nagar",
      "Yellammabanda",
      "Moosapet",
      "Bharathnagar",
      "Motinagar",
      "Gayatrinagar",
      "Balnagar",
      "KPHB",
      "Balaginagar",
      "Hasmathpet"
    ],
    "Durgam Cheruvu": ["Nallagandla", "Madhapur", "Kondapur", "Gachibowli"],
    "Hafeezpet": ["Chandanagar", "Warangal West", "Hanamkonda"],
    "Manikonda": ["Jalpally", "Thukkuguda", "Kismathpur", "Manikonda", "Shamshabad"],
    "Old Bowenpally": ["Tadbund", "Mallikarjuna Nagar", "Hasmathpet", "Bapuji Nagar"]
  };

  const displayDivisionNames = {
    "SR Nagar": "Division 6 (SR Nagar)",
    "Kukatpally": "Division 9 (Kukatpally)",
    "Durgam Cheruvu": "Division 15 (Durgam Cheruvu)",
    "Hafeezpet": "Division 17 (Hafeezpet)",
    "Manikonda": "Division 18 (Manikonda)",
    "Old Bowenpally": "Division 4 (Old Bowenpally)"
  };

  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [popupReport, setPopupReport] = useState(null);
  const [displayReportsState, setDisplayReports] = useState([]);
  const [activeCard, setActiveCard] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);

  // Reports with icons assigned
  const manholeReports = [
    {
      id: "manhole1",
      title: "Zone A Manhole Analysis",
      division: "Old Bowenpally",
      section: "Hasmathpet",
      file: "Manhole_1.html",
      icon: <ChartLine className="text-blue-500 w-5 h-5" />
    },
    {
      id: "manhole2",
      title: "Zone B Manhole Analysis",
      division: "Old Bowenpally",
      section: "Hasmathpet",
      file: "manhole_report.html",
      icon: <ChartLine className="text-blue-500 w-5 h-5" />
    },
    {
      id: "manhole3",
      title: "Zone C Manhole Analysis",
      division: "Old Bowenpally",
      section: "Hasmathpet",
      file: "analytics_report.html",
      icon: <ChartLine className="text-blue-500 w-5 h-5" />
    }
  ];

  const wardReports = [
    {
      id: "ward1",
      title: "Ward A Incident Summary",
      division: "Old Bowenpally",
      section: "Hasmathpet",
      file: "Ward.html",
      icon: <FileChartColumnIncreasing className="text-green-500 w-5 h-5" />
    }
  ];

  const robotReports = [
    {
      id: "robot1",
      title: "Robot Fleet Performance RP001",
      division: "Old Bowenpally",
      section: "Hasmathpet",
      file: "Robot.html",
      icon: <Bot className="text-purple-500 w-5 h-5" />
    },
    {
      id: "robot2",
      title: "Robot Fleet Performance RP002",
      division: "Old Bowenpally",
      section: "Hasmathpet",
      file: "robo_reports_s.html",
      icon: <Bot className="text-purple-500 w-5 h-5" />
    }
  ];

  const allReports = [...manholeReports, ...wardReports, ...robotReports];
  const sections = selectedDivision
    ? divisionsByDivision[selectedDivision] || []
    : [];

  const getFilteredReports = (type) => {
    if (selectedDivision === "Old Bowenpally" && selectedSection === "Hasmathpet") {
      if (type === "all") return allReports;
      if (type === "manhole") return manholeReports;
      if (type === "ward") return wardReports;
      if (type === "robot") return robotReports;
    }
    return [];
  };

  const handleCardClick = (type) => {
    if (!searchClicked) return;
    setDisplayReports(getFilteredReports(type));
    setActiveCard(type);
  };

  const handleSearch = () => {
    setSearchClicked(true);
    setDisplayReports(getFilteredReports("all"));
    setActiveCard("all");
  };

  return (
    <div className="p-6 bg-gray-50 min-w-screen">
      <Header />

      {/* Title */}
      <div className="mb-6 flex flex-col items-center text-center w-full">
        <h2 className="text-2xl font-bold mb-1">Reports & Analytics</h2>
        <p className="text-gray-600">
          Generate and manage system reports and data exports
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-10 mt-5 p-4 rounded-xl w-full max-w-screen-xl mx-auto">
        <select
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setSelectedSection("");
            setDisplayReports([]);
            setSearchClicked(false);
          }}
          className="shadow-md rounded-xl px-4 py-2.5 flex-1 min-w-[200px]"
        >
          <option value="">Select Division</option>
          {divisions.map((div) => (
            <option key={div} value={div}>
              {displayDivisionNames[div] || div}
            </option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            setDisplayReports([]);
            setSearchClicked(false);
          }}
          className="shadow-md rounded-xl px-4 py-2 flex-1 min-w-[200px]"
        >
          <option value="">Select Section</option>
          {sections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-[#1A8BA8] text-white px-6 py-2 rounded-xl hover:bg-[#1A8BA8] flex items-center gap-2 shadow-xl"
        >
          <img src="/icons/search-icon.png" alt="Search" className="w-5 h-5" />
          Search Reports
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-screen-xl mx-auto">
        {[
          { type: "all", label: "All Reports", icon: <File color="#1A8BA8" /> },
          { type: "manhole", label: "Manhole Reports", icon: <ChartLine color="#1A8BA8" /> },
          { type: "ward", label: "Ward Reports", icon: <FileChartColumnIncreasing color="#1A8BA8" /> },
          { type: "robot", label: "Robot Reports", icon: <Bot style={{ color: "#1A8BA8" }} /> }
        ].map((card) => {
          const count = searchClicked ? getFilteredReports(card.type).length : 0;
          return (
            <div
              key={card.type}
              onClick={() => handleCardClick(card.type)}
              className={`p-4 rounded-xl shadow text-center cursor-pointer 
                ${activeCard === card.type ? "bg-blue-100 border border-blue-500" : "bg-white"} 
                hover:bg-gray-100`}
            >
              {React.cloneElement(card.icon, { className: "mx-auto mb-2 w-10 h-10" })}
              <p className="font-medium">{card.label}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="w-full max-w-screen-xl mx-auto">
        {displayReportsState.length > 0 ? (
          <div className="space-y-4">
            {displayReportsState.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  {r.icon}
                  <span>{r.title}</span>
                </div>
                <button
                  onClick={() => setPopupReport(r)}
                  className="bg-gray-100 px-6 py-4 rounded-lg hover:bg-[#1A8BA8] text-lg"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 font-semibold">No reports available</p>
        )}
      </div>

      {/* Popup Modal */}
      {popupReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1300">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 md:w-2/3 h-[100vh] relative">
            <button
              onClick={() => setPopupReport(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">{popupReport.title}</h3>
            <iframe
              src={`/reports/${popupReport.file}`}
              className="w-full h-full border rounded-lg"
              title={popupReport.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}