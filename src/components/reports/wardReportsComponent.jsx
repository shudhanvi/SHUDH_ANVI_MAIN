import React, { useState } from 'react';
import { WardReportPopup } from './WardReportPopup';
import { backendApi } from '../../utils/backendApi';
import DatePicker from 'react-datepicker';
import axios from 'axios';
// import { WardReportPopup } from "./WardReportPopup"; 

export const WardReportsComponent = ({ city, division, section }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Date formatting helper
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };


  const handleOpenReport = async () => {
    if (!city || !division || !section) {
      alert("Please select a City, Division, and Section to generate a report.");
      return;
    }

    setIsLoading(true);

    // ✅ **FIX: Mapped the prop names to the keys required by the backend.**
    const payload = {
      district: city,     // 'city' prop is now sent as 'district'
      division: division, // This name was correct
      area: section,
      dateRange: { from: fromDate, to: toDate },   // 'section' prop is now sent as 'area'
      command: "generate_ward_report",
    };

    // console.log("Sending corrected payload to backend:", payload);

    // try {
    //     const response = await fetch(backendApi.wardsReportUrl, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload),
    //     });

    //     if (!response.ok) {
    //         if (response.status === 400) {
    //             const errorData = await response.json().catch(() => ({ message: "Server returned a 400 Bad Request." }));
    //             throw new Error(`Server validation error: ${JSON.stringify(errorData)}`);
    //         }
    //         throw new Error(`Server error: ${response.status}`);
    //     }

    //     const data = await response.json();
    //     // console.log("Backend response:", data);
    //     setReportData(data);
    //     // console.log("Backend response:", data);
    //     setShowPopup(true);
    // } catch (error) {
    //     console.error("Error fetching ward report:", error);
    //     alert(`Failed to generate the report. ${error.message}`);
    // } finally {
    //     setIsLoading(false);
    // }

    try {
      const response = await axios.post(
        backendApi.wardsReportUrl,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: () => true   // allow us to manually handle 400
        }
      );

      // Handle 400 Bad Request (server validation error)
      if (response.status === 400) {
        const errorData = response.data || { message: "Server returned 400 Bad Request" };
        throw new Error(`Server validation error: ${JSON.stringify(errorData)}`);
      }

      // Handle any other non-2xx status
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = response.data;
      console.log("Backend response :", data)
      setReportData(data);
      setShowPopup(true);

    } catch (error) {
      console.error("Error fetching ward report:", error);
      alert(`Failed to generate the report. ${error.message}`);

    } finally {
      setIsLoading(false);
    }


  };

  // const isButtonDisabled = isLoading || !section;

  return (
    <>
      {showPopup && reportData && (
        <WardReportPopup
          reportData={reportData}
          onClose={() => setShowPopup(false)}
        />
      )}
      {/* 🔹 Date filters */}
      <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px] rounded-lg border-[1.5px] border-[#E1E7EF] bg-white">
        {/* From Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <DatePicker
            selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setFromDate(date ? formatDate(date) : null)} // ✅ handle null
            dateFormat="dd/MM/yyyy"
            placeholderText="Select from date"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
          />
          {fromDate && (
            <button
              type="button"
              onClick={() => setFromDate(null)} // ✅ clears date
              className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs  transition cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* To Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <DatePicker
            selected={toDate ? new Date(toDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setToDate(date ? formatDate(date) : null)} // ✅ handle null
            dateFormat="dd/MM/yyyy"
            placeholderText="Select to date"
            minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
          />
          {toDate && (
            <button
              type="button"
              onClick={() => setToDate(null)} // ✅ clears date
              className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs  transition cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-gray-800 font-semibold text-lg">
              {section} Ward Report
            </span>
          </div>

          <button
            onClick={handleOpenReport}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 
                          bg-white text-[#1E9AB0] border border-[#1E9AB0] hover:bg-[#E5F7FA]
                           cursor-pointer `}
            title={!section ? "Please select a Section from the dropdown above" : "Generate Ward Report"}
          >
            {isLoading ? "Loading..." : "Open Report"}
          </button>
        </div>
      </div>
    </>
  );
};