// import React, { useEffect, useMemo, useState } from "react";
// import IconsData from "../../data/iconsdata";
// import { ZoneWiseManholeReports } from "./zoneWiseManholeReports";
// import { backendApi } from "../../utils/backendApi";
// import axios from "axios";

// /* ======================================================
//    🔒 MODULE-LEVEL IN-MEMORY CACHE (SURVIVES UNMOUNT)
// ====================================================== */
// const zoneSummaryCache = new Map();

// export const ManholeReportsComponent = ({ city, division, section }) => {
//   const [zoneWiseReports, setZoneWiseReports] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedZoneData, setSelectedZoneData] = useState(null);

//   /* ---------------------------------------------
//      🔑 STABLE CACHE KEY
//   --------------------------------------------- */
//   const cacheKey = useMemo(() => {
//     if (!city || !division || !section) return null;
//     return `${city}|${division}|${section}`;
//   }, [city, division, section]);

//   /* ---------------------------------------------
//      RESET ZONE VIEW (NO FETCH)
//   --------------------------------------------- */
//   useEffect(() => {
//     setSelectedZoneData(null);
//   }, [city, division, section]);

//   /* ---------------------------------------------
//      FETCH ZONE SUMMARY (ONLY IF NOT CACHED)
//   --------------------------------------------- */
//   useEffect(() => {
//     if (!cacheKey) return;

//     // ⛔ USE CACHE IF AVAILABLE
//     if (zoneSummaryCache.has(cacheKey)) {
//       setZoneWiseReports(zoneSummaryCache.get(cacheKey));
//       return;
//     }

//     let cancelled = false; // React 18 StrictMode safe

//     const fetchZoneWiseReports = async () => {
//       setIsLoading(true);

//       try {
//         const payload = { city, division, section };

//         const response = await axios.post(
//           backendApi.zonesurl,
//           payload
//         );

//         if (cancelled) return;

//         const mappedZones = (response.data?.Doc_Manholes_Data || []).map(
//           (item) => ({
//             zone: String(item.zone),
//             count: item.manholes_count,
//           })
//         );

//         // 💾 SAVE TO CACHE
//         zoneSummaryCache.set(cacheKey, mappedZones);

//         setZoneWiseReports(mappedZones);
//       } catch (error) {
//         if (!cancelled) {
//           console.error("❌ Failed to fetch zone-wise reports", error);
//           setZoneWiseReports([]);
//         }
//       } finally {
//         if (!cancelled) setIsLoading(false);
//       }
//     };

//     fetchZoneWiseReports();

//     return () => {
//       cancelled = true;
//     };
//   }, [cacheKey, city, division, section]);

//   /* ---------------------------------------------
//      ZONE DETAILS VIEW
//   --------------------------------------------- */
//   if (selectedZoneData) {
//     return (
//       <ZoneWiseManholeReports
//         zone={selectedZoneData.zone}
//         userInputs={selectedZoneData.userInputs}
//         onBack={() => setSelectedZoneData(null)}
//       />
//     );
//   }

//   /* ---------------------------------------------
//      LOADING / EMPTY
//   --------------------------------------------- */
//   if (isLoading) {
//     return (
//       <p className="text-center text-gray-500 py-8">
//         Loading manhole reports...
//       </p>
//     );
//   }

//   if (!zoneWiseReports.length) {
//     return (
//       <p className="text-center text-gray-500 py-8">
//         No zone data available for the selected filters.
//       </p>
//     );
//   }

//   /* ---------------------------------------------
//      ZONE CARDS (UI UNCHANGED)
//   --------------------------------------------- */
//   return (
//     <div className="space-y-3 mt-6">
//       {zoneWiseReports.map((report) => (
//         <div
//           key={report.zone}
//           className="flex items-center justify-between p-[24px] bg-white border-[1.5px] border-[#E1E7EF] rounded-[16px]"
//         >
//           <div className="flex items-center gap-4">
//             <p className="text-white p-[10px] bg-[#2777f8b2] rounded-[8px]">
//               {IconsData.Reports}
//             </p>

//             <div>
//               <p className="font-semibold text-[16px] text-[#0F1729]">
//                 Docket / Zone – {report.zone} Manholes Report
//               </p>
//               <p className="text-sm text-gray-500">
//                 {report.count} Manholes
//               </p>
//             </div>
//           </div>

//           <button
//             className="px-5 py-2.5 text-sm font-semibold rounded-lg
//                        bg-white text-[#1E9AB0] border border-[#1E9AB0]
//                        hover:bg-[#E5F7FA] cursor-pointer"
//             onClick={() =>
//               setSelectedZoneData({
//                 zone: report.zone,
//                 userInputs: { city, division, section },
//               })
//             }
//           >
//             Open Report
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ManholeReportsComponent;


import React, { useEffect, useMemo, useState } from "react";
import IconsData from "../../data/iconsdata";
import { ZoneWiseManholeReports } from "./zoneWiseManholeReports";
import { backendApi } from "../../utils/backendApi";
import axios from "axios";

/* ======================================================
   🔒 MODULE-LEVEL IN-MEMORY CACHE (SURVIVES UNMOUNT)
====================================================== */
const zoneSummaryCache = new Map();

export const ManholeReportsComponent = ({ city, division, section }) => {
  const [zoneWiseReports, setZoneWiseReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZoneData, setSelectedZoneData] = useState(null);

  /* ---------------------------------------------
     🔑 STABLE CACHE KEY
  --------------------------------------------- */
  const cacheKey = useMemo(() => {
    if (!city || !division || !section) return null;
    return `${city}|${division}|${section}`;
  }, [city, division, section]);

  /* ---------------------------------------------
     RESET ZONE VIEW (NO FETCH)
  --------------------------------------------- */
  useEffect(() => {
    setSelectedZoneData(null);
  }, [city, division, section]);

  /* ---------------------------------------------
     FETCH ZONE SUMMARY (ONLY IF NOT CACHED)
  --------------------------------------------- */
  useEffect(() => {
    if (!cacheKey) return;

    // ⛔ USE CACHE IF AVAILABLE
    if (zoneSummaryCache.has(cacheKey)) {
      setZoneWiseReports(zoneSummaryCache.get(cacheKey));
      return;
    }

    let cancelled = false;

    const fetchZoneWiseReports = async () => {
      setIsLoading(true);

      try {
        const payload = { city, division, section };

        const response = await axios.post(
          backendApi.zonesurl,
          payload
        );

        if (cancelled) return;

        const mappedZones = (response.data?.Doc_Manholes_Data || []).map(
          (item) => ({
            zone: String(item.docket_no),
            count: item.manholes_count,
          })
        );

        zoneSummaryCache.set(cacheKey, mappedZones);
        setZoneWiseReports(mappedZones);
      } catch (error) {
        if (!cancelled) {
          console.error("❌ Failed to fetch zone-wise reports", error);
          setZoneWiseReports([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchZoneWiseReports();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, city, division, section]);

  /* ---------------------------------------------
     ZONE DETAILS VIEW
  --------------------------------------------- */
  if (selectedZoneData) {
    // console.log("Selected Zone Data:", selectedZoneData);
    return (
      <ZoneWiseManholeReports
        zone={selectedZoneData.zone}
        userInputs={selectedZoneData.userInputs}
        onBack={() => setSelectedZoneData(null)}
      />
    );
  }

  /* ---------------------------------------------
     🔄 SKELETON LOADING UI
  --------------------------------------------- */
  if (isLoading) {
    return (
      <div className="space-y-3 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-[24px]
                       bg-white border-[1.5px] border-[#E1E7EF]
                       rounded-[16px] animate-pulse"
          >
            <div className="flex items-center gap-4">
              {/* Icon Skeleton */}
              <div className="w-10 h-10 rounded-[8px] bg-gray-200" />

              <div className="space-y-2">
                {/* Title Skeleton */}
                <div className="h-4 w-64 bg-gray-200 rounded" />
                {/* Subtitle Skeleton */}
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="h-9 w-28 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  /* ---------------------------------------------
     EMPTY STATE
  --------------------------------------------- */
  if (!zoneWiseReports.length) {
    return (
      <p className="text-center text-gray-500 py-8">
        No zone data available for the selected filters.
      </p>
    );
  }

  /* ---------------------------------------------
     ZONE CARDS
  --------------------------------------------- */
  return (
    <div className="space-y-3 mt-6">
      {zoneWiseReports.map((report) => (
        <div
          key={report.zone}
          className="flex items-center justify-between p-[24px]
                     bg-white border-[1.5px] border-[#E1E7EF]
                     rounded-[16px]"
        >
          <div className="flex items-center gap-4">
            <p className="text-white p-[10px] bg-[#2777f8b2] rounded-[8px]">
              {IconsData.Reports}
            </p>

            <div>
              <p className="font-semibold text-[16px] text-[#0F1729]">
                Docket / Zone – {report.zone} Manholes Report
              </p>
              <p className="text-sm text-gray-500">
                {report.count} Manholes
              </p>
            </div>
          </div>

          <button
            className="px-5 py-2.5 text-sm font-semibold rounded-lg
                       bg-white text-[#1E9AB0] border border-[#1E9AB0]
                       hover:bg-[#E5F7FA] cursor-pointer"
            onClick={() =>
              setSelectedZoneData({
                zone: report.zone,
                userInputs: { city, division, section },
              })
            }
          >
            Open Report
          </button>
        </div>
      ))}
    </div>
  );
};

export default ManholeReportsComponent;
