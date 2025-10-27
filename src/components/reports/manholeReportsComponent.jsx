// import React, { useState, useEffect, useMemo } from "react";
// import IconsData from "../../data/iconsdata";
// // REMOVED: DatePicker imports are no longer needed
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";
// import { ZoneWiseManholeReports } from "./ZoneWiseManholeReports";

// export const ManholeReportsComponent = ({ city, division, section }) => {
//   const [reportData, setReportData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   // REMOVED: State for date range and applied date range
//   const [selectedZoneData, setSelectedZoneData] = useState(null);

//   useEffect(() => {
//     setIsLoading(true);

//     fetch("/datafiles/CSVs/ManHoles_Data.csv")
//       .then((response) =>
//         response.ok ? response.text() : Promise.reject("Network error")
//       )
//       .then((text) => {
//         const rows = text.trim().split("\n").filter(Boolean);
//         if (rows.length < 2) {
//           setReportData([]);
//           return;
//         }

//         const headers = rows[0].split(",").map((h) => h.trim());

//         const parsedData = rows.slice(1).map((row) => {
//           const values = row.split(",").map((v) => v.trim());
//           return headers.reduce((obj, header, i) => {
//             obj[header] = values[i] || "";
//             return obj;
//           }, {});
//         });

//         const filtered = parsedData.filter(
//           (item) =>
//             item.City?.trim().toLowerCase() === city?.trim().toLowerCase() &&
//             item.Division?.trim().toLowerCase() ===
//               division?.trim().toLowerCase() &&
//             item.Section?.trim().toLowerCase() === section?.trim().toLowerCase()
//         );

//         setReportData(filtered);
//       })
//       .catch((error) => console.error("Error parsing or fetching CSV:", error))
//       .finally(() => setIsLoading(false));
//   }, [city, division, section]);

//   // REMOVED: handleApplyFilter function

//   const zoneWiseReports = useMemo(() => {
//     // REMOVED: All date parsing and filtering logic
//     const grouped = reportData.reduce((acc, item) => {
//       const zone = item.Zone?.trim();
//       if (zone) {
//         if (!acc[zone]) acc[zone] = { name: zone, count: 0 };
//         acc[zone].count += 1;
//       }
//       return acc;
//     }, {});

//     return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
//   }, [reportData]); // UPDATED: Dependency array no longer includes appliedDateRange

//   if (selectedZoneData) {
//     return (
//       <ZoneWiseManholeReports
//         zone={selectedZoneData.zone}
//         manholes={selectedZoneData.manholes}
//         filteredData={selectedZoneData.filteredData}
//         userInputs={selectedZoneData.userInputs}
//         onBack={() => setSelectedZoneData(null)}
//       />
//     );
//   }

//   if (isLoading)
//     return (
//       <p className="text-center text-gray-500 py-8">Loading reports...</p>
//     );

//   return (
//     <div>
//       {/* REMOVED: The entire Date Filter UI block */}

//       {/* Zone Reports */}
//       <div className="space-y-3 mt-6">
//         {zoneWiseReports.length > 0 ? (
//           zoneWiseReports.map((report) => (
//             <div
//               key={report.name}
//               className="flex items-center justify-between p-[24px] bg-white border-[1.5px] border-[#E1E7EF] rounded-[16px]"
//             >
//               <div className="flex items-center gap-4">
//                 <p className="text-white p-[10px] bg-[#2777f8b2] rounded-[8px]">
//                   {IconsData.Reports}
//                 </p>
//                 <div>
//                   <p className="font-semibold text-[16px] text-[#0F1729]">
//                     {report.name} Manholes Report
//                   </p>
//                   <p className="text-sm text-gray-500">{`${report.count} Manholes`}</p>
//                 </div>
//               </div>
//               <button
//                 className="px-5 py-2 bg-[#F9FAFB] border-[#E1E7EF] border-[1.5px] rounded-[12px]"
//                 onClick={() =>
//                   setSelectedZoneData({
//                     zone: report.name,
//                     manholes: report.count,
//                     filteredData: reportData.filter(
//                       (item) => item.Zone === report.name.split(" ")[0]
//                     ),
//                     // UPDATED: Removed dateRange from userInputs
//                     userInputs: { city, division, section },
//                   })
//                 }
//               >
//                 Open Report
//               </button>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-gray-500 py-8">
//             No zone data available for the selected filters.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect, useMemo } from "react";
import IconsData from "../../data/iconsdata";
import { ZoneWiseManholeReports } from "./ZoneWiseManholeReports";

export const ManholeReportsComponent = ({ city, division, section }) => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZoneData, setSelectedZoneData] = useState(null);

  // 🔹 NEW LOGIC: Reset back to Zone List when filters change
  useEffect(() => {
    setSelectedZoneData(null);
  }, [city, division, section]);

  useEffect(() => {
    setIsLoading(true);

    fetch("/datafiles/CSVs/ManHoles_Data.csv")
      .then((response) =>
        response.ok ? response.text() : Promise.reject("Network error")
      )
      .then((text) => {
        const rows = text.trim().split("\n").filter(Boolean);
        if (rows.length < 2) {
          setReportData([]);
          return;
        }

        const headers = rows[0].split(",").map((h) => h.trim());
        const parsedData = rows.slice(1).map((row) => {
          const values = row.split(",").map((v) => v.trim());
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i] || "";
            return obj;
          }, {});
        });

        const filtered = parsedData.filter(
          (item) =>
            item.City?.trim().toLowerCase() === city?.trim().toLowerCase() &&
            item.Division?.trim().toLowerCase() === division?.trim().toLowerCase() &&
            item.Section?.trim().toLowerCase() === section?.trim().toLowerCase()
        );

        setReportData(filtered);
      })
      .catch((error) => console.error("Error parsing or fetching CSV:", error))
      .finally(() => setIsLoading(false));
  }, [city, division, section]);

  const zoneWiseReports = useMemo(() => {
    const grouped = reportData.reduce((acc, item) => {
      const zone = item.Zone?.trim();
      if (zone) {
        if (!acc[zone]) acc[zone] = { name: zone, count: 0 };
        acc[zone].count += 1;
      }
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [reportData]);

  if (selectedZoneData) {
    return (
      <ZoneWiseManholeReports
        zone={selectedZoneData.zone}
        manholes={selectedZoneData.manholes}
        filteredData={selectedZoneData.filteredData}
        userInputs={selectedZoneData.userInputs}
        onBack={() => setSelectedZoneData(null)}
      />
    );
  }

  if (isLoading)
    return <p className="text-center text-gray-500 py-8">Loading reports...</p>;

  return (
    <div>
      <div className="space-y-3 mt-6">
        {zoneWiseReports.length > 0 ? (
          zoneWiseReports.map((report) => (
            <div
              key={report.name}
              className="flex items-center justify-between p-[24px] bg-white border-[1.5px] border-[#E1E7EF] rounded-[16px]"
            >
              <div className="flex items-center gap-4">
                <p className="text-white p-[10px] bg-[#2777f8b2] rounded-[8px]">
                  {IconsData.Reports}
                </p>
                <div>
                  <p className="font-semibold text-[16px] text-[#0F1729]">
                    {report.name} Manholes Report
                  </p>
                  <p className="text-sm text-gray-500">{`${report.count} Manholes`}</p>
                </div>
              </div>
              <button
                className="px-5 py-2 bg-[#F9FAFB] border-[#E1E7EF] border-[1.5px] rounded-[12px]"
                onClick={() =>
                  setSelectedZoneData({
                    zone: report.name,
                    manholes: report.count,
                    filteredData: reportData.filter(
                      (item) => item.Zone === report.name
                    ),
                    userInputs: { city, division, section },
                  })
                }
              >
                Open Report
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            No zone data available for the selected filters.
          </p>
        )}
      </div>
    </div>
  );
};
