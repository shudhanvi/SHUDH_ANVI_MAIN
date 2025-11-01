// // src/context/ServerDataContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";

// const ServerDataContext = createContext();

// export const ServerDataProvider = ({ children }) => {
//   const [serverData, setServerData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchServerData = async () => {
//       try {
//         setMessage("Fetching Bots data...");
//         setLoading(true);

//         const response = await fetch(
//           "https://sewage-bot.onrender.com/api/data"
//         );

//         if (!response.ok) throw new Error(`Server error: ${response.status}`);

//         const data = await response.json();
//         setServerData(data || []);
//         setMessage("Server data loaded");
//       } catch (error) {
//         console.error("⚠ Server fetch failed:", error.message);
//         setMessage("⚠ Failed to load server data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServerData();
//   }, []);
//   //   console.log("ServerDataContext:", serverData);

//   return (
//     <ServerDataContext.Provider value={{ serverData, loading, message }}>
//       {children}
//     </ServerDataContext.Provider>
//   );
// };

// export const useServerData = () => useContext(ServerDataContext);
// src/context/ServerDataContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";

// const ServerDataContext = createContext();
// const serversData={
//   ManholeData:[],
//   RobotsData:[],
//   MHData:[],
//   WardData:[],
//   OperationsData:[],

// };
// // console.log("✅ Initial serversData:", serversData);
// export const ServerDataProvider = ({ children }) => {
//   const [mainData, setMainData] = useState(serversData);
//   const [serverData, setServerData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");
//   useEffect(() => {
//   const fetchManholeData = async () => {
//     const response= await fetch("http://192.168.1.55:5000/api/manholes_data");
//     const data= await response.json();
//     setMainData(prev=>({ ...prev, ManholeData: data || prev.ManholeData }));
//     // console.log("✅ Manhole data fetched from API:", data);
//   }
//   fetchManholeData();
// },[]);
// useEffect(() => {
//   const fetchRobotsData= async () => {
//     const response= await fetch("http://192.168.1.55:5000/api/robo_operations");
//     const data= await response.json();
//     setMainData(prev=>({ ...prev, RobotsData: data || prev.RobotsData }));
//     // console.log("✅ Robots data fetched from API:", data);
//   }
//   fetchRobotsData();
// },[]);
// useEffect(() => {
//   const fetchMHData = async () => {
//     const response= await fetch("http://192.168.1.55:5000/api/manholes_data_mh");
//     const data= await response.json();
//     setMainData(prev=>({ ...prev, MHData: data || prev.MHData }));
//     // console.log("✅ MH data fetched from API:", data);
//   }
//   fetchMHData();
// },[]);
// useEffect(() => {
//   const fetchWardData = async () => {
//     const response= await fetch("http://192.168.1.55:5000/api/ward_coordinates");
//     const data= await response.json();
//     setMainData(prev=>({ ...prev, WardData: data || prev.WardData }));
//     // console.log("✅ Ward data fetched from API:", data);
//   }
//   fetchWardData();
// },[]);

//   useEffect(() => {
//     const fetchOperationsData = async () => {
//       try {
//         setMessage("Fetching Bots data...");
//         setLoading(true);

//         const response = await fetch(
//           "https://sewage-bot.onrender.com/api/data"
//         );

//         if (!response.ok) throw new Error(`Server error: ${response.status}`);

//         const data = await response.json();
//         setMainData(prev=>({ ...prev, OperationsData: data || prev.OperationsData }));
//         setMessage("Server data loaded");
//         // console.log("✅ Server data fetched:", data);
//       } catch (error) {
//         console.error("⚠ Server fetch failed:", error.message);
//         setMessage("⚠ Failed to load server data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOperationsData();
//   }, []);
//   //   console.log("ServerDataContext:", serverData);
// console.log("✅ Updated mainData:", mainData);
//   return (
//     <ServerDataContext.Provider value={{ serverData, loading, message }}>
//       {children}
//     </ServerDataContext.Provider>
//   );
// };

// export const useServerData = () => useContext(ServerDataContext);



// src/context/ServerDataContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";

// const ServerDataContext = createContext();

// export const ServerDataProvider = ({ children }) => {
//   const [data, setData] = useState({
//     ManholeData: [],
//     RobotsData: [],
//     MHData: [],
//     WardData: [],
//     OperationsData: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   const BASE_URL = "https://shudh-all-backend.onrender.com/database/table";

//   // 👇 Common function for cleaner code
//   const fetchData = async (endpoint, key) => {
//     try {
//       const res = await fetch(endpoint);
//       const json = await res.json();
//       setData(prev => ({ ...prev, [key]: json || prev[key] }));
//     } catch (err) {
//       console.error(`Error fetching ${key}:`, err);
//     }
//   };

//   useEffect(() => {
//     const loadAll = async () => {
//       setLoading(true);
//       setMessage("Fetching all data...");

//     "ManHoles_Data_MH",
//     "Robo_Operations",
//     "Ward_Coordinates",
//     "operations"
//       await Promise.all([
//         fetchData(`${BASE_URL}/ManHoles_Data`, "ManholeData"),
//         fetchData(`${BASE_URL}/Robo_Operations`, "RobotsData"),
//         fetchData(`${BASE_URL}/ManHoles_Data_MH`, "MHData"),
//         fetchData(`${BASE_URL}/Ward_Coordinates`, "WardData"),
//         fetchData(`${BASE_URL}/operations`, "OperationsData"),
//       ]);

//       setMessage("✅ All data loaded");
//       setLoading(false);
//     };

//     loadAll();
//   }, []);
// console.log("✅ Fetched data:", data);
//   return (
//     <ServerDataContext.Provider value={{ data, loading, message }}>
//       {children}
//     </ServerDataContext.Provider>
//   );
// };

// export const useServerData = () => useContext(ServerDataContext);



import { createContext, useContext, useEffect, useState } from "react";
import { backendApi } from "../utils/backendApi";
const ServerDataContext = createContext();

export const ServerDataProvider = ({ children }) => {
  const [data, setData] = useState({
    ManholeData: [],
    RobotsData: [],
    MHData: [],
    WardData: [],
    OperationsData: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  

  // 👇 Fetch only the table_data
  const fetchData = async (endpoint, key) => {
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      const tableData = json?.table_data || []; // ✅ only store table_data
      setData(prev => ({ ...prev, [key]: tableData }));
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setMessage("Loading data...");

      await Promise.all([
        fetchData(backendApi.manholeData, "ManholeData"),
        fetchData(backendApi.robotData, "RobotsData"),
        fetchData(backendApi.mhData, "MHData"),
        fetchData(backendApi.warddata, "WardData"),
        fetchData(backendApi.operationsdata, "OperationsData"),
      ]);

      setMessage(null);
      setLoading(false);
    };

    loadAll();
  }, []);

  console.log("✅ Fetched data:", data);

  return (
    <ServerDataContext.Provider value={{ data, loading, message }}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => useContext(ServerDataContext);
