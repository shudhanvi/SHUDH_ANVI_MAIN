
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

  // Fetch only the table_data
  const fetchData = async (endpoint, key) => {
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      const tableData = json?.table_data || [];
      setData(prev => ({ ...prev, [key]: tableData }));
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
    }
  };

  // Load all data (can be reused)
  const loadAllData = async () => {
    setLoading(true);
    setMessage("Loading ...");
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

  // Fetch once on mount
  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <ServerDataContext.Provider value={{ data, loading, message, refreshData: loadAllData }}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => useContext(ServerDataContext);
