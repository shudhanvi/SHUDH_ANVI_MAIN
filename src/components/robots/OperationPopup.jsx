import React from "react";
import { Download } from "lucide-react";

export const OperationPopup = ({ record, closePopup }) => {
    if (!record) return null;

    return (
        <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-black bg-opacity-50 z-[920]">
            <div className="mx-auto bg-white w-full max-w-[600px] rounded-lg px-6 py-6 shadow-2xl relative">
                <button
                    onClick={closePopup}
                    className="absolute right-6 top-3 text-3xl text-gray-500 hover:text-black cursor-pointer"
                >
                    ×
                </button>

                <h1 className="text-xl font-bold mb-4">Operation Report</h1>

                <div className="text-sm text-gray-700 space-y-2">
                    <p>
                        <strong>Device ID:</strong> {record.device_id}
                    </p>
                    <p>
                        <strong>Division:</strong> {record.division}
                    </p>
                    <p>
                        <strong>Section/Area:</strong> {record.area}
                    </p>
                    <p>
                        <strong>Date:</strong> {new Date(record.timestamp).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Start Time:</strong> {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                    <p>
                        <strong>End Time:</strong> {new Date(record.endtime).toLocaleTimeString()}
                    </p>
                    <p>
                        <strong>Task Duration:</strong> {record.operation_time_minutes} seconds
                    </p>
                </div>

                <div className="flex justify-center mt-6">
                    <button className="flex items-center justify-center bg-[#1A8BA8] text-white px-4 py-2 rounded-md">
                        <Download className="w-5 h-5 mr-2" />
                        Download Report
                    </button>
                </div>
            </div>
        </div>
    );
};
