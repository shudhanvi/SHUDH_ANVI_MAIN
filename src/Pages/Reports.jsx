

import React, { useState } from "react";
import Header from "../Components/Header";

export default function Reports() {
  const divisions = ["Old Bowenpally", "SR Nagar", "Kukatpally", "Durgam Cheruvu", "Hafeezpet", "Manikonda"];

  const divisionsByDivision = {
    "SR Nagar": ['Borabanda', 'Somajiguda', 'Yellareddyguda', 'Jubille Hills', 'Vengalroanagar', 'Fathenagar'],
    "Kukatpally": ['Bhagyanagar', 'Kukatpally', 'Vivekanandha Nagar', 'Yellammabanda', 'Moosapet', 'Bharathnagar', 'Motinagar', 'Gayatrinagar', 'Balnagar', 'KPHB', 'Balaginagar', 'Hasmathpet'],
    "Durgam Cheruvu": ['Nallagandla', 'Madhapur', 'Kondapur', 'Gachibowli'],
    "Hafeezpet": ['Chandanagar', 'Warangal West', 'Hanamkonda'],
    "Manikonda": ['Jalpally', 'Thukkuguda', 'Kismathpur', 'Manikonda', 'Shamshabad'],
    "Old Bowenpally": ['Tadbund', 'Mallikarjuna Nagar', 'Hasmathpet', 'Bapuji Nagar']
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
  const [activeCard, setActiveCard] = useState(""); // active summary card

  // Reports data
  const manholeReports = [
    { id: "manhole1", title: "Manhole 1", division: "Old Bowenpally", section: "Hasmathpet", file: "Manhole_1.html" },
    { id: "manhole2", title: "Manhole 2", division: "Old Bowenpally", section: "Hasmathpet", file: "manhole_report.html" },
    { id: "manhole3", title: "Manhole 3", division: "Old Bowenpally", section: "Hasmathpet", file: "analytics_report.html" },
  ];

  const wardReports = [
    { id: "ward1", title: "Ward 1", division: "Old Bowenpally", section: "Hasmathpet", file: "Ward.html" },

  ];

  const robotReports = [
    { id: "robot1", title: "Robot 1", division: "Old Bowenpally", section: "Hasmathpet", file: "Robot.html" },
    { id: "robot2", title: "Robot 2", division: "Old Bowenpally", section: "Hasmathpet", file: "robo_reports_s.html" },
  ];




  const allReports = [...manholeReports, ...wardReports, ...robotReports];

  // Sections based on selected division
  const sections = selectedDivision ? divisionsByDivision[selectedDivision] || [] : [];

  // Filter reports based on division & section
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
    setDisplayReports(getFilteredReports(type));
    setActiveCard(type);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Header />

      {/* Title */}
      <div className="mb-6 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold mb-1">Reports & Analytics</h2>
        <p className="text-gray-600">Generate and manage system reports and data exports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-10 mt-5 bg-white p-4 rounded-xl shadow">
        <select
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setSelectedSection("");
            setDisplayReports([]);
          }}
          className="border rounded-lg px-4 py-2 flex-1"
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
          }}
          className="border rounded-lg px-4 py-2 flex-1"
        >
          <option value="">Select Section</option>
          {sections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        <button
          onClick={() => setDisplayReports(getFilteredReports(activeCard))}
          className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500 flex items-center gap-2"
        >
          <img src="/icons/search-icon.png" alt="Search" className="w-5 h-5" />
          Search Reports
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { type: "all", label: "All Reports", icon: "/icons/doc-icon.png" },
          { type: "manhole", label: "Manhole Reports", icon: "/icons/uprising-icon.png" },
          { type: "ward", label: "Ward Reports", icon: "/icons/analyse-icon.png" },
          { type: "robot", label: "Robot Reports", icon: "/icons/robot-blue-icon.png" },
        ].map((card) => {
          const count = getFilteredReports(card.type).length;
          return (
            <div
              key={card.type}
              onClick={() => handleCardClick(card.type)}
              className={`p-4 rounded-xl shadow text-center cursor-pointer 
                          ${activeCard === card.type ? "bg-blue-100 border border-blue-500" : "bg-white"} 
                          hover:bg-gray-100`}
            >
              <img src={card.icon} alt={card.label} className="mx-auto mb-2 w-10 h-10" />
              <p className="font-medium">{card.label}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Reports List */}
      {displayReportsState.length > 0 ? (
        <div className="space-y-4">
          {displayReportsState.map((r) => (
            <div
              key={r.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-blue-400">{r.title}</h4>
              </div>
              <button
                onClick={() => setPopupReport(r)}
                className="bg-gray-200 px-6 py-4 rounded-lg hover:bg-gray-300 text-lg"
              >
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 font-semibold">No reports available</p>
      )}

      {/* Popup Modal */}
      {popupReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
