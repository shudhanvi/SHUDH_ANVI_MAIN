import React, { useState } from 'react';
import { WardReportPopup } from './WardReportPopup';
import { backendApi } from '../../utils/backendApi';
// import { WardReportPopup } from "./WardReportPopup"; 

export const WardReportsComponent = ({ city, division, section }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

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
            area: section,      // 'section' prop is now sent as 'area'
            command: "generate_ward_report",
        };

        console.log("Sending corrected payload to backend:", payload);

        try {
            const response = await fetch(backendApi.wardsReportUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json().catch(() => ({ message: "Server returned a 400 Bad Request." }));
                    throw new Error(`Server validation error: ${JSON.stringify(errorData)}`);
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Backend response:", data);
            setReportData(data);
            setShowPopup(true);
        } catch (error) {
            console.error("Error fetching ward report:", error);
            alert(`Failed to generate the report. ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const isButtonDisabled = isLoading || !section;

    return (
        <>
            {showPopup && reportData && (
            <WardReportPopup
                reportData={reportData}
                onClose={() => setShowPopup(false)}
            />
        )}

            <div className="mt-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-gray-800 font-semibold text-lg">
                            Ward Report
                        </span>
                    </div>

                    <button
                        onClick={handleOpenReport}
                        disabled={isButtonDisabled}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isButtonDisabled 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                            : 'bg-white text-[#1E9AB0] border border-[#1E9AB0] hover:bg-[#E5F7FA]'
                        }`}
                        title={!section ? "Please select a Section from the dropdown above" : "Generate Ward Report"}
                    >
                        {isLoading ? "Loading..." : "Open Report"}
                    </button>
                </div>
            </div>
        </>
    );
};