import React, { useState } from 'react';
import IconsData from '../../data/iconsdata';
import { ManholeReportPopup } from './ManholeReportPopup';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from './Pagination';
import DatePicker from 'react-datepicker';
import { backendApi } from '../../utils/backendApi';
import axios from "axios";

// Helper to format date range
// const formatDateRange = (dateRange) => {
//   if (!dateRange || (!dateRange.from && !dateRange.to)) return 'N/A';
//   const from = dateRange.from ? new Date(dateRange.from).toLocaleDateString('en-GB') : '...';
//   const to = dateRange.to ? new Date(dateRange.to).toLocaleDateString('en-GB') : '...';
//   return `${from} - ${to}`;
// };

export const ZoneWiseManholeReports = ({ zone, filteredData, userInputs, onBack }) => {
  const [selectedManholes, setSelectedManholes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  // console.log("Filtered Data:", zone);

  // Date pickers
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // 🔥 SORTED DATA (MAIN UPDATE)
  const sortedData = [...filteredData].sort((a, b) =>
    a.sw_mh_id.localeCompare(b.sw_mh_id, undefined, { numeric: true })
  );

  // Pagination using sorted data
  const {
    currentPage,
    totalPages,
    currentItems: currentManholes,
    indexOfFirstItem,
    indexOfLastItem,
    handleNextPage,
    handlePrevPage,
  } = usePagination(sortedData, 50);

  // ---------------------------------------------------------
  // ✔ FIXED SELECTION LOGIC
  // ---------------------------------------------------------

  // Select / Unselect individual manhole
  const handleCheckboxChange = (sw_mh_id) => {
    setSelectedManholes((prev) => {
      const updated = prev.includes(sw_mh_id)
        ? prev.filter((id) => id !== sw_mh_id)
        : [...prev, sw_mh_id];

      setSelectAll(updated.length === sortedData.length);
      return updated;
    });
  };

  // Select / Unselect ALL
  const handleSelectAll = () => {
    if (!selectAll) {
      const allIds = sortedData.map((m) => m.sw_mh_id);
      setSelectedManholes(allIds);
    } else {
      setSelectedManholes([]);
    }
    setSelectAll(!selectAll);
  };

  // ---------------------------------------------------------
  // API Call (unchanged)
  // ---------------------------------------------------------
  const handleViewReport = async () => {
    if (selectedManholes.length === 0) {
      alert("Please select at least one manhole.");
      return;
    }
    setIsLoading(true);

    const updatedUserInputs = {
      ...userInputs,
      dateRange: { from: fromDate, to: toDate },
    };

    const payload = {
      selectedManholes,
      userInputs: updatedUserInputs,
      zone,
      command: "generate_manhole_report",
    };
    // console.log("sending Payload:", payload);
    // try {
    //   const response = await fetch(backendApi.manholesReportUrl, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });

    //   if (!response.ok) throw new Error(`Server error: ${response.status}`);

    //   const data = await response.json();
    //   setReportData(data);
    //   console.log("Backend response:", data);
    //   setShowPopup(true);
    // } catch (error) {
    //   console.error("Error:", error);
    //   alert(error.message);
    // } finally {
    //   setIsLoading(false);
    // }
    try {
      const response = await axios.post(
        backendApi.manholesReportUrl,
        payload, // axios handles JSON.stringify internally
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      const data = response.data; // axios auto-parses JSON
      setReportData(data);
      // console.log("Backend response:", data);
      setShowPopup(true);

    } catch (error) {
      console.error("Error:", error);

      // axios error handling is different:
      if (error.response) {
        // Server responded with 4xx or 5xx
        alert(`Server error: ${error.response.status}`);
      } else if (error.request) {
        // No response
        alert("No response from server");
      } else {
        // Something else
        alert(error.message);
      }

    } finally {
      setIsLoading(false);
    }

  };

  const selectedManholeLocations = sortedData
    .filter(m => selectedManholes.includes(m.sw_mh_id))
    .map(m => ({
      id: m.sw_mh_id,
      lat: parseFloat(m.latitude || m.lat || m.Latitude),
      lon: parseFloat(m.longitude || m.lon || m.Longitude),
    }));
  // console.log("Selected Manhole Locations:", selectedManholeLocations);


  return (
    <>
      {showPopup && reportData && (
        <ManholeReportPopup reportData={reportData} manholeloc={selectedManholeLocations} onClose={() => setShowPopup(false)} />
      )}

      {/* Date pickers */}
      <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px] rounded-lg border-[1.5px] border-[#E1E7EF] bg-white">

        {/* From Date */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <DatePicker
            selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setFromDate(date ? formatDate(date) : null)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select from date"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
          />
          {fromDate && (
            <button
              type="button"
              onClick={() => setFromDate(null)}
              className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
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
            onChange={(date) => setToDate(date ? formatDate(date) : null)}
            dateFormat="dd/MM/yyyy"
            minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            placeholderText="Select to date"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
          />
          {toDate && (
            <button
              type="button"
              onClick={() => setToDate(null)}
              className="absolute right-2 top-8 border text-black rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-lg p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] flex flex-col relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4">
          <div className='flex gap-[20px] items-center'>
            <button onClick={onBack} className="flex items-center justify-center border h-[30px] w-[30px] border-[#1E9AB0] rounded-full">
              {IconsData.BackArrowIcon}
            </button>

            <div className='flex flex-col gap-[4px]'>
              <h3 className="text-[20px] font-semibold text-gray-800">
                {zone} - Select Manholes
              </h3>

              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 accent-[#1E9AB0]"
                />
                Select All
              </label>
            </div>
          </div>

          <div className='flex items-center gap-x-[20px]'>
            <p className="text-sm text-gray-700 font-medium">
              {selectedManholes.length} of {sortedData.length} selected
            </p>

            <button
              onClick={handleViewReport}
              className={`px-8 py-3 text-white font-semibold rounded-lg bg-[#1E9AB0] ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Loading...' : 'View Report'}
            </button>
          </div>
        </div>

        {/* Manhole list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto h-[350px] custom-scrollbar">
          {currentManholes.map((manhole) => (
            <label key={manhole.sw_mh_id} className="flex items-center gap-2 px-[15px] py-[15px] rounded-[7px] cursor-pointer bg-[#F9FAFB]">
              <input
                type="checkbox"
                checked={selectedManholes.includes(manhole.sw_mh_id)}
                onChange={() => handleCheckboxChange(manhole.sw_mh_id)}
                className="w-4 accent-[#1E9AB0]"
              />
              <span className="text-sm font-medium text-gray-800">{manhole.sw_mh_id}</span>
            </label>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          firstItemIndex={indexOfFirstItem}
          lastItemIndex={indexOfLastItem}
          totalItems={sortedData.length}
        />
      </div>
    </>
  );
};
