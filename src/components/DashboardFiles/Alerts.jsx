import React, { useState } from 'react';
import { TriangleAlert, ChevronDown, ChevronUp } from 'lucide-react';

// --- Reusable Alert Item Component ---
const ZoneAlertItem = ({ zoneName, alerts, onManholeSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    // zoneWrapper styles
    <div className="bg-gray-50 rounded-lg mb-3 shadow-sm border border-gray-200">
      {/* zoneHeader styles */}
      <div
        className="flex justify-between items-center p-3 cursor-pointer font-semibold"
        onClick={handleToggle}
      >
        {/* zoneTitle styles */}
        <div className="flex items-center text-base">
          {/* Icon styling */}
          <span className="mr-2 text-red-600">
            <TriangleAlert size={18} /> {/* Adjusted size */}
          </span>
          {zoneName} ({alerts.length})
        </div>
        {/* Chevron styling */}
        <span className="text-gray-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </div>

      {/* zoneContent styles */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-white border-t border-gray-200 rounded-b-lg">
          {/* table styles */}
          <table className="w-full border-collapse mt-2">
            <thead>
              <tr>
                {/* th styles */}
                <th className="text-left py-2 pr-2 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">ID</th>
                <th className="text-left py-2 px-2 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">Location (Lat, Lon)</th>
                <th className="text-left py-2 pl-2 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={alert.id}>
                  {/* td styles */}
                  <td className={`py-2.5 pr-2 text-sm text-gray-700 ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}>{alert.id}</td>
                  {/* tdLocation styles */}
                  <td
                    className={`py-2.5 px-2 text-sm text-blue-600 cursor-pointer hover:underline ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={() => onManholeSelect(alert.id)}
                  >
                    {alert.location}
                  </td>
                  {/* td + dangerText styles */}
                  <td className={`py-2.5 pl-2 text-sm text-red-600 font-semibold ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    {alert.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main Alerts Component ---
export default function Alerts({ alertData = [], onManholeSelect }) {

  if (!alertData || alertData.length === 0) {
    return (
      // container styles
      <section className="p-4 font-sans text-gray-700 max-w-md mx-auto">
        {/* heading styles */}
        <h3 className="text-sm text-gray-500 font-medium mb-4 pl-2">Zone alerts</h3>
        <p className="text-center text-gray-500 mt-5">
          No danger alerts found for this ward.
        </p>
        
      </section>
 
        
    );
  }

  return (
    <>
      {/* container styles */}
      <section className="p-4 font-sans text-gray-700 max-w-md mx-auto">
        {/* heading styles */}
        <h3 className="text-sm text-gray-500 font-medium mb-4 pl-2">Zone alerts</h3>

        {/* Map over the alertData prop */}
        {alertData.map((zoneData) => (
          <ZoneAlertItem
            key={zoneData.zoneName}
            zoneName={zoneData.zoneName}
            alerts={zoneData.alerts}
            onManholeSelect={onManholeSelect} // Pass handler to each item
          />
        ))}
       
        
      </section>
    </>
  );
}