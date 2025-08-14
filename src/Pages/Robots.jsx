import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [csvData, setCsvData] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    fetch("/datafiles/robodata.csv") // Place your CSV in public/robodata.csv
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (result) => {
            setCsvData(result.data);
            const uniqueDivisions = [...new Set(result.data.map((row) => row.Division))];
            setDivisions(uniqueDivisions);
          },
        });
      });
  }, []);

  const handleDivisionChange = (division) => {
    setSelectedDivision(division);
    const filteredSections = csvData
      .filter((row) => row.Division === division)
      .map((row) => row.Section);
    setSections([...new Set(filteredSections)]);
    setSelectedSection("");
  };

  return (
    <> 
    <section className='section1 mt-10'>
        <h1>Robot Fleet Management</h1>
        <p>Monitor our autonomous drainage Robots</p>

    </section>


    <div className="flex  justify-center min-h-screen  ">
      <div className="flex flex-wrap gap-4 bg-white h-35 p-4 rounded-lg border border-gray-300 ">
        
        {/* Division */}
        <div className="m-auto text-start">
          <label className="block font-semibold mb-1">Division</label>
          <select
            value={selectedDivision}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-48"
          >
            <option value="">Select Division</option>
            {divisions.map((div, i) => (
              <option key={i} value={div}>{div}</option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div className="m-auto text-start">
          <label className="block font-semibold mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-48"
          >
            <option value="">Select Section</option>
            {sections.map((sec, i) => (
              <option key={i} value={sec}>{sec}</option>
            ))}
          </select>
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

        {/* Button */}
        <div className="flex m-auto">
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md flex items-center gap-2 h-10 "
            onClick={() => console.log({ selectedDivision, selectedSection, fromDate, toDate })}
          >
            🔍 View Bots
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
