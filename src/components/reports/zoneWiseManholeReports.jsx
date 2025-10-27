import React, { useState } from 'react';
import IconsData from '../../data/iconsdata';
import { ManholeReportPopup } from './ManholeReportPopup';
import { usePagination } from '../../hooks/usePagination'; // Import the custom hook
import { Pagination } from './Pagination'; // Import the UI component
import DatePicker from 'react-datepicker';
import { backendApi } from '../../utils/backendApi';

// Helper to format date range (Unchanged)
const formatDateRange = (dateRange) => {
  if (!dateRange || (!dateRange.from && !dateRange.to)) return 'N/A';
  const from = dateRange.from ? new Date(dateRange.from).toLocaleDateString('en-GB') : '...';
  const to = dateRange.to ? new Date(dateRange.to).toLocaleDateString('en-GB') : '...';
  return `${from} - ${to}`;
};

export const ZoneWiseManholeReports = ({ zone, filteredData, userInputs, onBack }) => {
  const [selectedManholes, setSelectedManholes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // --- State for the new date pickers ---
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

   const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };



  // --- Use the Pagination Hook ---
  const {
    currentPage,
    totalPages,
    currentItems: currentManholes, // Renaming for clarity
    indexOfFirstItem,
    indexOfLastItem,
    handleNextPage,
    handlePrevPage,
  } = usePagination(filteredData, 50); // Using 50 items per page

  // --- Selection Logic ---
  const handleCheckboxChange = (id) => {
    setSelectedManholes((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  // Logic is updated to only select/deselect all visible on the current page
  const handleSelectAll = () => {
    const allIdsOnPage = currentManholes.map((m) => m.id);
    if (!selectAll) {
      const newSelected = new Set([...selectedManholes, ...allIdsOnPage]);
      setSelectedManholes(Array.from(newSelected));
    } else {
      setSelectedManholes(selectedManholes.filter((id) => !allIdsOnPage.includes(id)));
    }
    setSelectAll(!selectAll);
  };

  // --- API Call Logic (Updated to include date range) ---
  const handleViewReport = async () => {
    if (selectedManholes.length === 0) {
      alert("Please select at least one manhole.");
      return;
    }
    setIsLoading(true);

    // Combine original user inputs with the new date range for the payload
    const updatedUserInputs = {
        ...userInputs,
        dateRange: {
            from: fromDate,
            to: toDate,
        },
    };

    const payload = {
        selectedManholes,
        userInputs: updatedUserInputs, // Send the updated object
        zone,
        command: "generate_manhole_report"
    };
 console.log("sending Paylod:",payload)
    try {
      const response = await fetch(backendApi.manholesReportUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
       
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setReportData(data);
      
      console.log("Backend response:",data)
      setShowPopup(true);
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Failed to fetch report data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showPopup && reportData && (
        <ManholeReportPopup reportData={reportData} onClose={() => setShowPopup(false)} />
      )}

             {/* 🔹 Date Pickers */}
      <div className="flex items-end gap-x-4 px-[30px] py-[10px] mb-[10px]  rounded-lg border-[1.5px] border-[#E1E7EF] bg-white ">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <DatePicker
            selected={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setFromDate(formatDate(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select from date"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md  focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <DatePicker
            selected={toDate ? new Date(toDate.split("-").reverse().join("-")) : null}
            onChange={(date) => setToDate(formatDate(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select to date"
            minDate={fromDate ? new Date(fromDate.split("-").reverse().join("-")) : null}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md  focus:outline-none focus:ring-[#1E9AB0] focus:border-[#1E9AB0] sm:text-sm"
          />
        </div>
      </div>


      {/* Main UI Container */}
      <div className="bg-white rounded-lg  p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] flex flex-col relative">
        {/* --- Header Section (Updated with Date Pickers) --- */}
        <div className="flex items-center justify-between mb-4 pb-4">
          <div className='flex gap-[20px] items-center'>
            <button onClick={onBack} className="flex items-center justify-center border-[1.5px] h-[30px] w-[30px] border-[#1E9AB0] rounded-full hover:bg-[#E5F7FA]">
              {IconsData.BackArrowIcon}
            </button>
            <div className='flex flex-col gap-[4px]'>
              <h3 className="text-[20px] font-semibold text-gray-800">{zone} - Select Manholes</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[15px] rounded border-gray-300 focus:ring-[#1E9AB0] accent-[#1E9AB0]"
                />
                Select All on Page
              </label>
            </div>
          </div>
          
          
         
          
          <div className='flex items-center gap-x-[20px]'>
            <p className="text-sm text-gray-700 font-medium">
              {selectedManholes.length} of {filteredData.length} selected
            </p>
            <button
              onClick={handleViewReport}
              className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] cursor-pointer ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'View Selected Report'}
            </button>
          </div>
        </div>

        {/* --- Manhole Grid (Now Paginated and Scrollable) --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto h-[350px] auto-rows-max ">
          {currentManholes.map((manhole) => (
            <label key={manhole.id} className="flex items-center gap-2 px-[15px] py-[15px] rounded-[7px] cursor-pointer h-[58px] bg-[#F9FAFB]">
              <input
                type="checkbox"
                checked={selectedManholes.includes(manhole.id)}
                onChange={() => handleCheckboxChange(manhole.id)}
                className="h-[58px] w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]"
              />
              <span className="text-sm font-medium text-gray-800">{manhole.id}</span>
            </label>
          ))}
        </div>
        
        {/* --- Render the Pagination Component at the bottom --- */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          firstItemIndex={indexOfFirstItem}
          lastItemIndex={indexOfLastItem}
          totalItems={filteredData.length}
          className="absolute bottom-2"
        />
      </div>
    </>
  );
};
