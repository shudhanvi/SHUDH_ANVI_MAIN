
import React from "react";

const WardDetails = ({
  selectedWard,
  setSelectedWard,
  wardData
}) => {
  if (!selectedWard) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width: '400px',
      backgroundColor: '#f9fafb',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
      padding: '1rem',
      overflowY: 'auto',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "1rem", borderBottom: "1px solid #e5e7eb",
        paddingBottom: "0.5rem", position: 'sticky', top: 0, backgroundColor: '#f9fafb'
      }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e3a8a", fontSize: '1.2rem' }}>
            Ward: {selectedWard}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            {wardData.find(w => w.ward_name === selectedWard)?.zone || "Zone N/A"}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <button onClick={() => setSelectedWard(null)} style={{
            background: 'transparent', border: 'none', fontSize: '1.2rem',
            cursor: 'pointer', color: '#334155', marginBottom: '4px'
          }}>❌</button>

          <button
            onClick={() => {
              const wardInfo = wardData.find(w => w.ward_name === selectedWard);
              const existingReports = JSON.parse(localStorage.getItem("ward_reports") || "[]");
              existingReports.push({ timestamp: new Date().toISOString(), ward: selectedWard, data: wardInfo });
              localStorage.setItem("ward_reports", JSON.stringify(existingReports));
              alert("✅ Ward report saved!");
            }}
            style={{
              background: '#059669', color: '#fff', border: 'none',
              padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Content */}
      {wardData.filter(w => w.ward_name === selectedWard).map((data, idx) => {
        const grouped = Object.entries(data).reduce((acc, [key, value]) => {
          const section = key.includes('population') || key.includes('area') || key.includes('density') ? 'Demographics'
                      : key.includes('mla') || key.includes('mp') || key.includes('zone') ? '🏛️ Political Info'
                      : 'Details';
          acc[section] = acc[section] || [];
          acc[section].push([key, value]);
          return acc;
        }, {});

        const { "Other": otherData, ...remaining } = grouped;

        return (
          <React.Fragment key={`ward-data-${idx}`}>
            {/* Other Section First */}
            {otherData && (
              <div key={`other-${idx}`} style={{
                background: "#f1f5f9",
                border: '1px solid #e2e8f0', borderRadius: '6px',
                padding: '10px', marginBottom: '10px'
              }}>
                <h3 style={{
                  fontSize: '1rem', color: '#1d4ed8', marginBottom: '0.5rem'
                }}>Other</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {otherData.map(([key, value], i) => (
                    <li key={`other-${key}-${i}`} style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "6px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      <strong style={{ textTransform: "capitalize" }}>{key.replace(/_/g, " ")}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Remaining Sections */}
            {Object.entries(remaining).map(([section, entries]) => (
              <div key={`section-${section}-${idx}`} style={{
                background: "#f1f5f9",
                border: '1px solid #e2e8f0', borderRadius: '6px',
                padding: '10px', marginBottom: '10px'
              }}>
                <h3 style={{
                  fontSize: '1rem', color: '#1d4ed8', marginBottom: '0.5rem'
                }}>{section}</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {entries.map(([key, value], i) => (
                    <li key={`entry-${key}-${i}`} style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "6px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      <strong style={{ textTransform: "capitalize" }}>{key.replace(/_/g, " ")}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WardDetails;