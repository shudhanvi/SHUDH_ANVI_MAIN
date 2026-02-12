

// // import { createContext, useContext, useEffect, useState } from "react";
// // import { backendApi } from "../utils/backendApi";

// // const ServerDataContext = createContext();

// // export const ServerDataProvider = ({ children }) => {
// //   const [data, setData] = useState({
// //     ManholeData: [],
// //     RobotsData: [],
// //     WardData: [],
// //     OperationsData: [],
// //     WeatherData: [],

// //   });

// //   const [loading, setLoading] = useState(true);
// //   const [message, setMessage] = useState("");


// //   const fetchData = async (endpoint, key) => {
// //   try {
// //     const res = await fetch(endpoint);
// //     const json = await res.json();

// //     if (key === "WeatherData") {
// //       setData(prev => ({ ...prev, WeatherData: json }));
// //       return;
// //     }

// //     let tableData = json?.table_data || [];



// //     setData(prev => ({ ...prev, [key]: tableData }));

// //   } catch (err) {
// //     console.error(`Error fetching ${key}:`, err);
// //   }
// // };



// //   const loadAllData = async () => {
// //     setLoading(true);
// //     setMessage("Loading ...");

// //     await Promise.all([
// //       fetchData(backendApi.manholeData, "ManholeData"),
// //       fetchData(backendApi.robotData, "RobotsData"),
// //       fetchData(backendApi.warddata, "WardData"),
// //       fetchData(backendApi.operationsdata, "OperationsData"),
// //       fetchData(backendApi.weatherdata,"WeatherData"),


// //     ]);

// //     setMessage(null);
// //     setLoading(false);
// //   };

// //   // Load on mount
// //   useEffect(() => {
// //     loadAllData();
// //   }, []);

// //   console.log("Server Data Context:", data);

// //   return (
// //     <ServerDataContext.Provider
// //       value={{
// //         data,
// //         loading,
// //         message,
// //         refreshData: loadAllData,
// //       }}
// //     >
// //       {children}
// //     </ServerDataContext.Provider>
// //   );
// // };

// // export const useServerData = () => useContext(ServerDataContext);


// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { backendApi } from "../utils/backendApi";

// const ServerDataContext = createContext();

// export const ServerDataProvider = ({ children }) => {
//   const [data, setData] = useState({
//     dropdowndata :[],
//         ManholeData: [],
//     RobotsData: [],
//     WardData: [],
//     OperationsData: [],
//     Dropdowndata: []
//   });

//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   const fetchData = async (endpoint, key) => {
//     try {
//       const res = await axios.get(endpoint);
//       const resp_data = res.data;

//       // DEFAULT CASE → APIs returning table_data
//       let tableData = resp_data?.table_data || [];
//       // Unique filter ONLY for manhole data
//       if (key === "ManholeData") {
//         const seen = new Set();
//         const uniqueRows = [];

//         for (const row of tableData) {
//           const id = row?.sw_mh_id != null ? String(row.sw_mh_id).trim() : null;
//           if (!id) continue;

//           if (!seen.has(id)) {
//             seen.add(id);
//             uniqueRows.push(row);
//           }
//         }

//         tableData = uniqueRows;
//       }


//       setData(prev => ({ ...prev, [key]: tableData }));
//     } catch (err) {
//       console.error(`Error fetching ${key}:`, err);
//     }
//   };


//   const loadAllData = async () => {
//     setLoading(true);
//     // setMessage("Loading ..."); 

//     await Promise.all([
//       // fetchData(backendApi.manholeData, "ManholeData"),
//       // fetchData(backendApi.robotData, "RobotsData"),
//       // fetchData(backendApi.warddata, "WardData"),
//       // fetchData(backendApi.operationsdata, "OperationsData"),
//       fetchData(backendApi.dropdowndata, "Dropdowndata")
//     ]);

//     setMessage(null);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadAllData();
//   }, []);

//   // console.log("Server Data Context:", data);

//   return (
//     <ServerDataContext.Provider
//       value={{
//         data,
//         loading,
//         message,
//         refreshData: loadAllData,
//       }}
//     >
//       {children}
//     </ServerDataContext.Provider>
//   );
// };

// export const useServerData = () => useContext(ServerDataContext);




import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { backendApi } from "../utils/backendApi";
 
const ServerDataContext = createContext();
 
export const ServerDataProvider = ({ children }) => {
  const [data, setData] = useState({
    dropdowndata: [],
    // ManholeData: [],
    // RobotsData: [],
    // WardData: [],
    // OperationsData: []
  });
 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
 
  // Helper function to fetch and update state for a specific key
  const fetchData = async (endpoint, key) => {
    try {
      const res = await axios.get(endpoint);
      const resp_data = res.data;
 
      // 🔍 FIX: Handle Raw Arrays AND Wrapped Data
      let tableData = [];
 
      if (Array.isArray(resp_data)) {
        // Case A: The file is just a list [ ... ]
        tableData = resp_data;
      } else if (resp_data?.table_data) {
        // Case B: The file is wrapped { table_data: [ ... ] }
        tableData = resp_data.table_data;
      } else if (resp_data?.data) {
        // Case C: The file is wrapped { data: [ ... ] }
        tableData = resp_data.data;
      } else {
        // Case D: It's just an object, maybe wrap it in array?
        // console.warn("Unknown data structure", resp_data);
        tableData = [];
      }
 
      // --- Filter Unique IDs (Only for ManholeData) ---
      if (key === "ManholeData" && tableData.length > 0) {
        const seen = new Set();
        const uniqueRows = [];
        for (const row of tableData) {
          // Try multiple ID fields
          const rawId = row?.sw_mh_id || row?.id || row?.manhole_id;
          const id = rawId != null ? String(rawId).trim() : null;
 
          if (!id) continue;
 
          if (!seen.has(id)) {
            seen.add(id);
            uniqueRows.push(row);
          }
        }
        tableData = uniqueRows;
      }
 
      // Update State
      setData(prev => ({ ...prev, [key]: tableData }));
 
      // 👇 THIS LOG IS CRITICAL. Check your Console!
      // console.log(`✅ Fetched ${key}: Found ${tableData.length} items`);
 
    } catch (err) {
      console.error(`❌ Error fetching ${key}:`, err);
    }
  };
  const loadAllData = async () => {
    setLoading(true);
 
 
    await fetchData(backendApi.dropdowndata, "dropdowndata");
 
 
    setLoading(false);
 
    await Promise.all([
      // fetchData(backendApi.manholeData, "ManholeData"),
      // fetchData(backendApi.robotData, "RobotsData"),
      // fetchData(backendApi.warddata, "WardData"),
      // fetchData(backendApi.operationsdata, "OperationsData"),
    ]);
 
    setMessage(null);
  };
 
  useEffect(() => {
    loadAllData();
  }, []);
 
  return (
    <ServerDataContext.Provider
      value={{
        data,
        loading,
        message,
        refreshData: loadAllData,
      }}
    >
      {children}
    </ServerDataContext.Provider>
  );
};
 
export const useServerData = () => useContext(ServerDataContext);
