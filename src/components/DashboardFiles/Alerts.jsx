
import React, { useState } from 'react';
import { TriangleAlert, ChevronDown, ChevronUp } from 'lucide-react';

 
const ZoneAlertItem = ({ zoneName, alerts, onManholeSelect }) => {
 
  const [isExpanded, setIsExpanded] = useState(false);
 
  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
 
    <div className="bg-gray-50 rounded-lg mb-3 shadow-sm border border-gray-200">
 
      <div
        className="flex justify-between items-center p-3 cursor-pointer font-semibold"
        onClick={handleToggle}
      >
 
        <div className="flex items-center text-base">
          <span className="mr-2 text-red-600">
            <TriangleAlert size={18} />  
          </span>
          {zoneName} ({alerts.length})  
        </div> 
        <span className="text-gray-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </div>

      {/* Conditionally rendered table with alert details */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-white border-t border-gray-200 rounded-b-lg">
          <table className="w-full border-collapse mt-2">
            <thead>
              <tr>
                {/* Table Headers */}
                <th className="text-left py-2 pr-2 w-10 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">S.No</th>
                <th className="text-left py-2 px-2 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">ID</th>
                <th className="text-left py-2 px-2 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">Location (Lat, Lon)</th>
                <th className="text-left py-2 pl-2 text-gray-500 text-xs font-medium uppercase border-b border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through the alerts for this zone */}
              {alerts.map((alert, index) => (
                <tr key={alert.id}>
                  {/* Serial Number */}
                  <td className={`py-2.5 pr-2 w-10 text-sm text-center text-gray-700 ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}>{index + 1}</td>
                  {/* Manhole ID */}
                  <td className={`py-2.5 px-2 text-sm text-gray-700 ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}>{alert.id}</td>
                  {/* Clickable Location */}
                  <td
                    className={`py-2.5 px-2 text-sm text-blue-600 cursor-pointer hover:underline ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={() => onManholeSelect(alert.id)} // Call the passed function on click
                  >
                    {alert.location}
                  </td>
                  {/* Status with Icon */}
                  <td className={`py-2.5 pl-2 text-sm text-red-600 font-semibold flex items-center ${index < alerts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <TriangleAlert size={14} className="mr-1 inline-block flex-shrink-0" /> {/* Status Icon */}
                    <span>{alert.status}</span> {/* Status Text */}
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
// Receives the filtered/grouped alertData and the onManholeSelect function
export default function Alerts({ alertData = [], onManholeSelect }) {

  // Display a message if there are no danger alerts for the selected ward
  if (!alertData || alertData.length === 0) {
    return (
      <section className="p-4 font-sans text-gray-700 max-w-md mx-auto">
        <h3 className="text-sm text-gray-500 font-medium mb-4 pl-2">Zone Alerts</h3>
        <p className="text-center text-gray-500 mt-5">
          No danger alerts found for this ward.
        </p>
      </section>
    );
  }

  // Render the list of collapsible zone alerts
  return (
    <>
      <section className="p-4 font-sans text-gray-700 max-w-md mx-auto">
        <h3 className="text-sm text-gray-500 font-medium mb-4 pl-2">Zone alerts</h3>
        {/* Map over the data grouped by zone */}
        {alertData.map((zoneData) => (
          // Render a ZoneAlertItem for each zone
          <ZoneAlertItem
            key={zoneData.zoneName}
            zoneName={zoneData.zoneName}
            alerts={zoneData.alerts}
            onManholeSelect={onManholeSelect} // Pass the click handler down
          />
        ))}
      </section>
    </>
  );
}