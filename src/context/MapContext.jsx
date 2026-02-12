import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { fetchManholeData } from "../components/Api/DashboardMap"; 

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  // 1. Global State
  const [manholeData, setManholeData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [buildingData, setBuildingData] = useState(null);
  
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedAreaName, setSelectedAreaName] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. 🧠 MEMORY CACHE
  const dataCache = useRef({}); 

  // 3. The Fetch Function
  const fetchMapDataGlobal = useCallback(async (div, sec, zone) => {
    // A. Cleanup if "All"
    if ((!div || div === "All") && (!sec || sec === "All")) {
    //   console.log("🧹 Clearing Global Map Data");
      setManholeData([]); 
      setWardData([]); 
      setBuildingData(null); 
      return;
    }
    
    // B. Generate Cache Key
    const cacheKey = `${div}-${sec}`;

    // C. 🚀 CHECK CACHE (Instant Load)
    if (dataCache.current[cacheKey]) {
        const cached = dataCache.current[cacheKey];
        // console.log(`⚡ Cache Hit for ${sec}! Manholes: ${cached.manholes.length}, Buildings: ${cached.buildings ? 'Yes' : 'No'}`);
        
        setManholeData(cached.manholes);
        setWardData(cached.wards);
        setBuildingData(cached.buildings);
        return cached; 
    }

    // D. Fetch from Network
    setIsLoading(true);
    setError(null);

    try {
    //   console.log(`🌍 Global Fetching: ${div} -> ${sec}`);
      const zoneParam = (zone === "All") ? null : zone;
      
      const response = await fetchManholeData(div, sec, zoneParam);

      // --- 1. Process Manholes ---
      const rawManholes = response?.manholes?.data || [];
// Inside fetchMapDataGlobal try block
const safeManholes = rawManholes.map(mh => ({
    ...mh,
    id: String(mh.manhole_id || "unknown"), 
    timestamp: mh.last_operation_timestamp,
    // 🟢 MATCH YOUR API KEYS HERE:
    latitude: Number(mh.mh_latitude || 0),
    longitude: Number(mh.mh_longitude || 0),
    division: div,
    section: sec
}));

      // --- 2. Process Wards ---
      const rawWards = response?.ward_coordinates?.data || [];
      const safeWards = rawWards.map(w => ({
          ...w,
          latitude: Number(w.latitude),
          longitude: Number(w.longitude),
      }));

      // --- 3. Process Buildings (CRITICAL FIX) ---
      let safeBuildings = null;
      if (response.buildings) {
          // Check for .data wrapper and unwrap it
          if (response.buildings.data && Array.isArray(response.buildings.data.features)) {
            //  console.log("🏢 Buildings Found (Unwrapped .data)");
             safeBuildings = response.buildings.data;
          } 
          // Check if it's already GeoJSON
          else if (response.buildings.features && Array.isArray(response.buildings.features)) {
            //  console.log("🏢 Buildings Found (Direct GeoJSON)");
             safeBuildings = response.buildings;
          }
          else {
            //  console.log("⚠️ Buildings object exists but format is unknown:", response.buildings);
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
      return { manholes: safeManholes, wards: safeWards, buildings: safeBuildings };

    } catch (err) {
      console.error("❌ Global Map Error:", err);
      setError("Failed to load data.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMapData = () => {
      setManholeData([]);
      setWardData([]);
      setBuildingData(null);
  };

  const refreshCache = () => { dataCache.current = {}; };

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