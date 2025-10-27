import React, { useState } from 'react';
import { TriangleAlert,ChevronDown,ChevronUp } from 'lucide-react';
// --- Static Data (as requested) ---
// In the future, you'll fetch this array from your server
const staticAlertData = [
  {
    zoneName: 'Zone-1',
    alerts: [
      { id: 'MH-101', location: '17.4938,78.3858', status: 'Danger' },
      { id: 'MH-102', location: '17.4938,78.3858', status: 'Danger' },
      { id: 'MH-103', location: '17.4938,78.3858', status: 'Danger' },
      { id: 'MH-104', location: '17.4938,78.3858', status: 'Danger' },
      { id: 'MH-105', location: '17.4938,78.3858', status: 'Danger' },
    ],
  },
  {
    zoneName: 'Zone-2',
    alerts: [
      { id: 'MH-001', location: '17.4939,78.3859', status: 'Danger' },
      { id: 'MH-002', location: '17.4940,78.3860', status: 'Danger' },
    ],
  },
  {
    zoneName: 'Zone-3',
    alerts: [
      { id: 'MH-123', location: '17.4941,78.3861', status: 'Danger' },
    ],
  },
  {
    zoneName: 'Zone-4',
    alerts: [
      { id: 'MH-456', location: '17.4942,78.3862', status: 'Danger' },
    ],
  },
  {
    zoneName: 'Zone-5',
    alerts: [
      { id: 'MH-789', location: '17.4943,78.3863', status: 'Danger' },
    ],
  },
];

// --- Reusable Alert Item Component ---
// This component manages its own state (expanded/collapsed)
const ZoneAlertItem = ({ zoneName, alerts }) => {
  // 'useState' hook to manage if the item is expanded or not
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle function
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={styles.zoneWrapper}>
      {/* Header (Clickable) */}
      <div style={styles.zoneHeader} onClick={handleToggle}>
        <div style={styles.zoneTitle}>
          <span style={{ marginRight: '10px', color: '#E53E3E' }}> <TriangleAlert /></span> {/* Emoji for icon */}
          {zoneName}
        </div>
        {/* Arrow icon changes based on state, matching your image */}
        <span style={{ color: '#888' }}>{isExpanded ?   <ChevronUp /> :  <ChevronDown />}</span>
      </div>

      {/* Expanded Content (Conditionally rendered) */}
      {isExpanded && (
        <div style={styles.zoneContent}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td style={styles.td}>{alert.id}</td>
                  <td style={styles.tdLocation}>{alert.location}</td>
                  <td style={{ ...styles.td, ...styles.dangerText }}>
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
export default function Alerts() {
  return (
    <>
      <section style={styles.container}>
        <h3 style={styles.heading}>Zone alerts</h3>
        
        {/* Map over the static data to create the list of collapsible items */}
        {staticAlertData.map((zoneData) => (
          <ZoneAlertItem
            key={zoneData.zoneName}
            zoneName={zoneData.zoneName}
            alerts={zoneData.alerts}
          />
        ))}
      </section>
    </>
  );
}

// --- Basic CSS-in-JS for styling ---
// This object holds all the styles to make it look like the image.
const styles = {
  container: {
    padding: '16px',
    fontFamily: '"Inter", Arial, sans-serif', // Using a common system font
    color: '#333',
    maxWidth: '500px',
     // Light gray background for the section
  },
  heading: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    marginBottom: '16px',
    paddingLeft: '8px',
  },
  zoneWrapper: {
   backgroundColor: '#F7F7F7',
    borderRadius: '8px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #EAEAEA',
  },
  zoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  zoneTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
  },
  zoneContent: {
    padding: '0 16px 16px 16px',
   backgroundColor: '#F7F7F7', // White background for the expanded content
    borderTop: '1px solid #F0F0F0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 0 8px 0',
    color: '#888',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  td: {
    padding: '10px 0',
    fontSize: '14px',
    color: '#333',
  },
  tdLocation: {
    padding: '10px 0',
    fontSize: '14px',
    color: '#007BFF', // Blue color for location
    textDecoration: 'underline',
  },
  dangerText: {
    color: '#E53E3E', // Red color for 'Danger'
    fontWeight: '600',
  },
};