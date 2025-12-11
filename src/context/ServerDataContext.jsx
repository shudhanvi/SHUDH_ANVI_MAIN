

// import { createContext, useContext, useEffect, useState } from "react";
// import { backendApi } from "../utils/backendApi";

// const ServerDataContext = createContext();

// export const ServerDataProvider = ({ children }) => {
//   const [data, setData] = useState({
//     ManholeData: [],
//     RobotsData: [],
//     WardData: [],
//     OperationsData: [],
//     WeatherData: [],

//   });

//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");


//   const fetchData = async (endpoint, key) => {
//   try {
//     const res = await fetch(endpoint);
//     const json = await res.json();

//     if (key === "WeatherData") {
//       setData(prev => ({ ...prev, WeatherData: json }));
//       return;
//     }

//     let tableData = json?.table_data || [];



//     setData(prev => ({ ...prev, [key]: tableData }));

//   } catch (err) {
//     console.error(`Error fetching ${key}:`, err);
//   }
// };



//   const loadAllData = async () => {
//     setLoading(true);
//     setMessage("Loading ...");

//     await Promise.all([
//       fetchData(backendApi.manholeData, "ManholeData"),
//       fetchData(backendApi.robotData, "RobotsData"),
//       fetchData(backendApi.warddata, "WardData"),
//       fetchData(backendApi.operationsdata, "OperationsData"),
//       fetchData(backendApi.weatherdata,"WeatherData"),


//     ]);

//     setMessage(null);
//     setLoading(false);
//   };

//   // Load on mount
//   useEffect(() => {
//     loadAllData();
//   }, []);

//   console.log("Server Data Context:", data);

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
    ManholeData: [],
    RobotsData: [],
    WardData: [],
    OperationsData: [],
    WeatherData: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async (endpoint, key) => {
    try {
      const res = await axios.get(endpoint);
      const resp_data = res.data;

      // SPECIAL CASE → Weather API structure is different
      if (key === "WeatherData") {
        setData(prev => ({ ...prev, WeatherData: resp_data }));
        return;
      }

      // DEFAULT CASE → APIs returning table_data
      let tableData = resp_data?.table_data || [];
      // Unique filter ONLY for manhole data
      if (key === "ManholeData") {
        const seen = new Set();
        const uniqueRows = [];

        for (const row of tableData) {
          const id = row?.sw_mh_id != null ? String(row.sw_mh_id).trim() : null;
          if (!id) continue;

          if (!seen.has(id)) {
            seen.add(id);
            uniqueRows.push(row);
          }
        }

        tableData = uniqueRows;
      }


      setData(prev => ({ ...prev, [key]: tableData }));
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setMessage("Loading ...");

    await Promise.all([
      fetchData(backendApi.manholeData, "ManholeData"),
      fetchData(backendApi.robotData, "RobotsData"),
      fetchData(backendApi.warddata, "WardData"),
      fetchData(backendApi.operationsdata, "OperationsData"),
      fetchData(backendApi.weatherdata, "WeatherData"),
    ]);

    setMessage(null);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // console.log("Server Data Context:", data);

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
