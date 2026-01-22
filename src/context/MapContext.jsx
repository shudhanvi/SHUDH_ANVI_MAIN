import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { fetchManholeData } from "../components/Api/DashboardMap"; // Import your API function

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  // 1. Global State (Visible Data)
  const [manholeData, setManholeData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [buildingData, setBuildingData] = useState(null);
  
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedAreaName, setSelectedAreaName] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. 🧠 MEMORY CACHE (The new part)
  // Stores data like: { "S.R.Nagar-Somajiguda": { manholes: [...], wards: [...], buildings: ... } }
  const dataCache = useRef({}); 

  // 3. The Smart Fetch Function
  const fetchMapDataGlobal = useCallback(async (div, sec, zone) => {
    // A. Cleanup if "All" is selected
    if ((!div || div === "All") && (!sec || sec === "All")) {
      setManholeData([]); 
      setWardData([]); 
      setBuildingData(null); 
      return;
    }
    
    // B. Generate a unique key for this request
    const cacheKey = `${div}-${sec}`;

    // C. 🚀 CHECK CACHE FIRST (Instant Load)
    if (dataCache.current[cacheKey]) {
        console.log(`⚡ Cache Hit! Loading ${sec} from memory...`);
        const cached = dataCache.current[cacheKey];
        setManholeData(cached.manholes);
        setWardData(cached.wards);
        setBuildingData(cached.buildings);
        return; // <--- STOP HERE, DO NOT CALL API
    }

    // D. If not in cache, fetch from Network
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🌍 Global Fetch: ${div} -> ${sec}`);
      const zoneParam = (zone === "All") ? null : zone;
      
      const response = await fetchManholeData(div, sec, zoneParam);

  // Inside fetchMapDataGlobal...

      // A. Process Manholes
      const rawManholes = response?.manholes?.data || [];
      const safeManholes = rawManholes.map(mh => ({
          ...mh,
          id: String(mh.manhole_id || mh.id || "unknown"), 
          timestamp: mh.last_operation_timestamp || mh.timestamp,
          latitude: Number(mh.latitude || mh.lat || 0),
          longitude: Number(mh.longitude || mh.lon || 0),
          
          // ✅ FIX: Don't overwrite with "All". Use the API data if available.
          division: (div !== "All") ? div : (mh.division || mh.sw_mh_division_no || "N/A"),
          section: (sec !== "All") ? sec : (mh.section || mh.section_name || "N/A")
      }));
      // --- Process Wards ---
      const rawWards = response?.ward_coordinates?.data || [];
      const safeWards = rawWards.map(w => ({
          ...w,
          latitude: Number(w.latitude),
          longitude: Number(w.longitude),
      }));

      // --- Process Buildings ---
      let safeBuildings = null;
      if (response.buildings) {
          if (response.buildings.data) {
             safeBuildings = response.buildings.data;
          } else {
             safeBuildings = response.buildings;
          }
      }

      // E. 💾 SAVE TO CACHE
      dataCache.current[cacheKey] = {
          manholes: safeManholes,
          wards: safeWards,
          buildings: safeBuildings
      };

      // F. Update State
      setManholeData(safeManholes);
      setWardData(safeWards);
      setBuildingData(safeBuildings);

    } catch (err) {
      console.error("❌ Global Map Error:", err);
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMapData = () => {
      setManholeData([]);
      setWardData([]);
      setBuildingData(null);
  };

  // Optional: Function to force refresh (ignore cache)
  const refreshCache = () => {
      dataCache.current = {};
  };

  return (
    <MapContext.Provider value={{
      manholeData, wardData, buildingData,
      selectedDivision, setSelectedDivision,
      selectedAreaName, setSelectedAreaName,
      selectedZone, setSelectedZone,
      isLoading, error,
      fetchMapDataGlobal, 
      clearMapData,
      refreshCache
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);