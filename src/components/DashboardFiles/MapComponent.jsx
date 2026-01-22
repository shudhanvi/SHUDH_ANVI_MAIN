
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed, Map as MapIcon, MapPin } from 'lucide-react';

import { useServerData } from "../../context/ServerDataContext";
// import { fetchManholeData } from "../Api/DashboardMap"; // ❌ Removed: Handled in Context now

import MapboxCore from "./MapboxCore";
import ManholePopUp from "./ManholePopUp";
import WardDetailsPopUp from "./WardDetailsPopUp";
import { useMapContext } from "../../context/MapContext"; // ✅ Import Context

const mapStyles = [
  { url: "mapbox://styles/shubhamgv/cmiofroih003501sm90m2hn06", img: "/images/street.png", name: "Street" },
  { url: "mapbox://styles/shubhamgv/cmiof1gt5003c01s43hud0zmd", img: "/images/Satilight.png", name: "Satellite" },
  { url: "mapbox://styles/shubhamgv/cmiof9l0900o201sc3mdc6tsc", img: "/images/diameter.png", name: "Diameter" },
];

const emptyGeoJSON = { type: "FeatureCollection", features: [] };

// --- HELPERS ---
const getDisplayName = (rawName) => {
   if (typeof rawName !== 'string') return rawName;
   const match = rawName.match(/\(([^)]+)\)/);
   return match && match[1] ? match[1].trim() : rawName.trim();
};

const excelDateToJSDate = (serial) => {
   const utc_days = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;
   return new Date(utc_value * 1000);
};

const MapComponent = () => {
  const { data: serverData } = useServerData();
  const dropdownOptions = useMemo(() => serverData?.dropdowndata || [], [serverData]);

  // =================================================================
  // 1. 🌍 GLOBAL STATE (From Context)
  // =================================================================
  const { 
    manholeData, wardData, buildingData, 
    selectedDivision, setSelectedDivision,
    selectedAreaName, setSelectedAreaName,
    selectedZone, setSelectedZone,
    isLoading, error,
    fetchMapDataGlobal, 
    clearMapData 
  } = useMapContext();

  // =================================================================
  // 2. 🎨 LOCAL UI STATE (Visuals only)
  // =================================================================
  const [filter, setFilter] = useState("all");
  const [mapStyle, setMapStyle] = useState(mapStyles[0].url);
  const [flyToLocation, setFlyToLocation] = useState(null);
  const [selectedManholeLocation, setSelectedManholeLocation] = useState(null);
  const [activeWardGeoJSON, setActiveWardGeoJSON] = useState(null);
  const [currentWardBounds, setCurrentWardBounds] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  
  // ✅ RESTORED: Local state for the Area Dropdown list
  const [areaNameList, setAreaNameList] = useState(["All"]);

  const mapRef = useRef(null);
  const centerToRestoreRef = useRef(null);
  const zoomToRestoreRef = useRef(null);

  // --- LOGIC ---
  const getManholeStatus = useCallback((operationdates) => {
    if (!operationdates) return "safe";
    let lastCleaned;
    if (typeof operationdates === "string") {
      lastCleaned = new Date(operationdates.includes("T") ? operationdates : operationdates.replace(' ', 'T'));
    } else if (typeof operationdates === "number") {
      lastCleaned = excelDateToJSDate(operationdates);
    }
    if (!lastCleaned || isNaN(lastCleaned.getTime())) return "safe";

    const today = new Date();
    today.setHours(0,0,0,0);
    lastCleaned.setHours(0,0,0,0);
    const diffDays = Math.floor((today - lastCleaned) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 40) return "danger";
    if (diffDays >= 30) return "warning";
    return "safe";
  }, []);

  const formatExcelDate = useCallback((value) => {
    if (!value) return "N/A";
    let date_info;
    if (typeof value === "string") {
        if (value.includes("T")) date_info = new Date(value);
        else date_info = new Date(value.replace(' ', 'T').replace(/\.\d+/, '').replace(/\+.*$/, ''));
    } else if (typeof value === "number") {
        date_info = excelDateToJSDate(value);
    }
    if (date_info && !isNaN(date_info.getTime())) {
        return date_info.toLocaleDateString("en-GB");
    }
    return "Invalid Date";
  }, []);

  const getManholeDateById = useCallback((manholeId) => {
    if (!manholeData.length) return null;
    const found = manholeData.find(mh => String(mh.id || mh.sw_mh_id).trim() === String(manholeId).trim());
    return found ? (found.timestamp || found.last_operation_timestamp || found.start_time) : null;
  }, [manholeData]);

  // --- Handlers ---
  const handleGenerateReport = (id) => alert(`Report generated for ${id}`);
  const handleAssignBot = (id) => alert(`Bot assigned to ${id}`);

  // --- DROPDOWN LOGIC ---
  
  // 1. Division List
const divisionList = useMemo(() => {
    if (!dropdownOptions.length) return ["All"];
    const uniqueDivisions = new Set();

    dropdownOptions.forEach(item => {
        const divName = item.division || item.sw_mh_division_no;
        // Simple check: if a name exists, add it to the list
        if (divName) uniqueDivisions.add(divName);
    });

    return ["All", ...[...uniqueDivisions].sort()];
  }, [dropdownOptions]);

  // 2. Division Change Handler
  const handleDivisionChange = (divisionValue) => {
    setSelectedDivision(divisionValue);
    setSelectedAreaName("All");
    setSelectedZone("All");
    
    // Clear Global Data
    clearMapData();
    // Clear Local Visuals
    setActiveWardGeoJSON(null);

    // Update Local Area List
    if (divisionValue !== "All") {
      const relevantRows = dropdownOptions.filter(row => String(row.division || row.sw_mh_division_no) === String(divisionValue));
      const uniqueAreas = new Set(relevantRows.map(row => row.section || row.section_name));
      setAreaNameList(["All", ...[...uniqueAreas].filter(Boolean).sort()]);
    } else { 
      setAreaNameList(["All"]); 
    }
  };

  // ✅ RESTORED: Effect to sync Area List if Context loads with a division pre-selected
  useEffect(() => {
    if (selectedDivision !== "All" && dropdownOptions.length > 0) {
        const relevantRows = dropdownOptions.filter(row => String(row.division || row.sw_mh_division_no) === String(selectedDivision));
        const uniqueAreas = new Set(relevantRows.map(row => row.section || row.section_name));
        setAreaNameList(["All", ...[...uniqueAreas].filter(Boolean).sort()]);
    }
  }, [selectedDivision, dropdownOptions]);


  // 3. Area Change Handler (Triggers Global Fetch)
  const handleAreaNameChange = (areaValue) => {
    setSelectedAreaName(areaValue);
    setSelectedZone("All");

    if (areaValue !== "All") {
       // Call global fetch
       fetchMapDataGlobal(selectedDivision, areaValue, "All"); 
    } else {
       // Call global clear
       clearMapData();
    }
  };

  // 4. Zone Options Logic
  const zoneOptions = useMemo(() => {
    if (!dropdownOptions.length) return [];
    
    const relevantRows = dropdownOptions.filter(r => 
      (selectedDivision === "All" || String(r.division || r.sw_mh_division_no) === selectedDivision) &&
      (selectedAreaName === "All" || String(r.section || r.section_name) === selectedAreaName)
    );

    const uniqueZones = new Map(); 
    
    relevantRows.forEach(r => {
      const rawVal = String(r.zone_id || r.zone || r.sw_mh_docket_no || "");
      const parts = rawVal.split(/[,/| ]+/);

      parts.forEach(p => {
        const cleanId = p.trim();
        if (cleanId && cleanId !== "undefined" && cleanId !== "null" && cleanId.toLowerCase() !== "na") {
           const displayName = (parts.length === 1 && r.zone_name) ? r.zone_name : cleanId;
           uniqueZones.set(cleanId, displayName);
        }
      });
    });

    return Array.from(uniqueZones.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a,b) => {
         const numA = parseFloat(a.id);
         const numB = parseFloat(b.id);
         if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
         return a.name.localeCompare(b.name);
      });
  }, [dropdownOptions, selectedDivision, selectedAreaName]);

  const handleZoneChange = (zoneId) => {
    setSelectedZone(zoneId);
  };
  
  const handleClosePopup = useCallback(() => { setSelectedManholeLocation(null); setSearchId(""); }, []);

  const handleSearchManhole = () => {
    const targetId = searchId.trim().toLowerCase();
    if (!targetId || !manholeData.length) return;
    const found = manholeData.find(mh => String(mh.id).toLowerCase().includes(targetId));
    if (found) {
       setSelectedManholeLocation({...found, lastCleaned: found.timestamp, status: getManholeStatus(found.timestamp)});
       setFlyToLocation({center: [found.longitude, found.latitude], zoom: 18});
    } else alert("Manhole ID not found.");
  };

  const handleReset = () => {
    if (selectedAreaName !== "All" && currentWardBounds) {
        setFlyToLocation({ bounds: currentWardBounds, padding: 80, maxZoom: 16 });
    } else {
        setFlyToLocation({ center: [78.4794, 17.3940], zoom: 9.40, pitch: 0, bearing: 0 });
    }
  };
  
  const handleJumpToLocation = () => {
      const lat = parseFloat(latInput);
      const lon = parseFloat(lonInput);
      if (!isNaN(lat) && !isNaN(lon)) setFlyToLocation({ center: [lon, lat], zoom: 18 });
  };

  const handleAlertManholeClick = useCallback((manholeId) => {
    if (!manholeData.length) return;
    const mData = manholeData.find(mh => String(mh.id) === String(manholeId));
    if (mData) {
      setSelectedManholeLocation({ ...mData, lastCleaned: mData.timestamp, status: getManholeStatus(mData.timestamp) });
      if(!isNaN(mData.longitude)) setFlyToLocation({ center: [mData.longitude, mData.latitude], zoom: 18 });
    }
  }, [manholeData, getManholeStatus]);


  const handleManholeClick = useCallback((f) => {
    const properties = f.properties;
    
    // ✅ FIX: Grab the ID directly from the feature's uniqueId property we just set
    // Or generate it again if needed, but properties.uniqueId is safest.
    const cleanId = properties.uniqueId || generateManholeId(properties);

    const popupData = {
        ...properties,
        id: cleanId, // <--- Use the Clean ID
        division: (properties.division && properties.division !== "All") ? properties.division : selectedDivision, 
        section: (properties.section && properties.section !== "All") ? properties.section : selectedAreaName,   
        lastCleaned: properties.timestamp, 
        status: getManholeStatus(properties.timestamp)
    };
    setSelectedManholeLocation(popupData);
    setFlyToLocation({ center: f.geometry.coordinates, zoom: 18 });
  }, [getManholeStatus, selectedDivision, selectedAreaName]);
  const handleManholeDeselect = useCallback(() => { setSelectedManholeLocation(null); }, []);

  const handleStyleChange = (newStyleUrl) => {
    if (newStyleUrl !== mapStyle) {
      if (mapRef.current) {
        centerToRestoreRef.current = mapRef.current.getCenter();
        zoomToRestoreRef.current = mapRef.current.getZoom();
      }
      setMapStyle(newStyleUrl);
    }
  };

// A. Add this helper OUTSIDE your component (so it's reusable)
const generateManholeId = (row) => {
  // If a real ID exists, use it. If not, use location.
  if (row.id && row.id !== "undefined" && row.id !== "null") return String(row.id);
  // FALLBACK: Create a unique ID from coordinates
  return `loc-${Number(row.latitude).toFixed(5)}-${Number(row.longitude).toFixed(5)}`;
};

// B. Update your filteredManholeGeoJSON useMemo
const filteredManholeGeoJSON = useMemo(() => {
    if (!manholeData.length || selectedAreaName === "All") return emptyGeoJSON;
    let filtered = manholeData;

    if (selectedZone && selectedZone !== "All") {
      filtered = filtered.filter(row => String(row.zone_id) === String(selectedZone));
    }
    if (filter !== "all") {
       filtered = filtered.filter(row => getManholeStatus(row.timestamp) === filter);
    }

    const validFeatures = filtered
      .filter(row => !isNaN(row.longitude) && !isNaN(row.latitude) && row.longitude !== 0)
      .map((row) => {
        // ✅ USE THE HELPER
        const uniqueId = generateManholeId(row); 

        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
          properties: { 
            ...row, 
            uniqueId: uniqueId, // Store it in props too
            status: getManholeStatus(row.timestamp) 
          },
          id: uniqueId, // <--- CRITICAL: This sets the Feature ID
        };
      });

    return { type: "FeatureCollection", features: validFeatures };
  }, [manholeData, selectedZone, filter, getManholeStatus, selectedAreaName]);
 
// Ward Polygon Bounds & Zoom Logic
  useEffect(() => {
    // 1. If "All" is selected, clear everything and stop.
    if (selectedAreaName === "All") {
      setActiveWardGeoJSON(null); 
      setCurrentWardBounds(null); 
      return;
    }

    // 2. Prepare Ward Points
    const validWardPoints = wardData.filter(w => !isNaN(Number(w.longitude)) && !isNaN(Number(w.latitude)) && Number(w.longitude) !== 0);
    const wardCoords = validWardPoints
        .sort((a,b) => (a.vertex_index || 0) - (b.vertex_index || 0))
        .map(w => [Number(w.longitude), Number(w.latitude)]);

    // === CASE A: We have a valid Polygon (Draw it & Zoom to it) ===
    if (wardCoords.length >= 3) {
        // Ensure the polygon is closed (First point == Last point)
        const first = wardCoords[0];
        const last = wardCoords[wardCoords.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            wardCoords.push(first);
        }
        
        setActiveWardGeoJSON({ 
            type: "Feature", 
            geometry: { type: "Polygon", coordinates: [wardCoords] }, 
            properties: { name: selectedAreaName } 
        });

        const bounds = new mapboxgl.LngLatBounds();
        wardCoords.forEach(c => bounds.extend(c));
        setCurrentWardBounds(bounds);
        setFlyToLocation({ bounds: bounds, padding: 80, maxZoom: 16 });
    } 
    
    // === CASE B: No Polygon, but we have Manholes? (Zoom to Manholes) ===
    else if (manholeData.length > 0) {
        // console.log("⚠️ No Ward Polygon found. Zooming to Manholes bounds.");
        setActiveWardGeoJSON(null); // Don't draw a shape
        
        const bounds = new mapboxgl.LngLatBounds();
        let hasValidPoints = false;

        manholeData.forEach(m => { 
            const lon = Number(m.longitude);
            const lat = Number(m.latitude);
            // Only include valid coordinates in the bounds
            if (!isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0) {
                bounds.extend([lon, lat]);
                hasValidPoints = true;
            }
        });

        if (hasValidPoints) {
            setCurrentWardBounds(bounds);
            setFlyToLocation({ bounds: bounds, padding: 80, maxZoom: 17 });
        }
    }
    
    // === CASE C: No Data at all ===
    else {
        setActiveWardGeoJSON(null);
        setCurrentWardBounds(null);
    }

  }, [wardData, selectedAreaName, manholeData]);


const alertData = useMemo(() => {
    if (selectedAreaName === "All" || !manholeData.length) return [];
    
    // 1. Filter Danger Manholes
    const danger = manholeData.filter(mh => getManholeStatus(mh.timestamp) === 'danger');
    
    // 2. Group by Zone (Strictly Zone ID)
    const grouped = danger.reduce((acc, mh) => {
      
      // ✅ FIX: Force "Zone {ID}" format. Ignore zone_name.
      let displayKey = "Unzoned";
      
      if (mh.zone_id && String(mh.zone_id) !== "null" && String(mh.zone_id) !== "undefined") {
          displayKey = `Zone ${mh.zone_id}`;
      }

      if (!acc[displayKey]) acc[displayKey] = [];
      
      acc[displayKey].push({ 
        // Generate Safe ID
        id: (mh.id && mh.id !== "undefined") ? String(mh.id) : `LOC-${mh.latitude}-${mh.longitude}`, 
        location: `${Number(mh.latitude).toFixed(4)}, ${Number(mh.longitude).toFixed(4)}`, 
        status: 'Danger' 
      });
      return acc;
    }, {});

    // 3. Sort numerically (Zone 1, Zone 2, Zone 10...)
    return Object.entries(grouped)
      .map(([k,v]) => ({ zoneName: k, alerts: v }))
      .sort((a,b) => {
          // Extract numbers for proper sorting (so Zone 10 comes after Zone 2)
          const numA = parseInt(a.zoneName.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.zoneName.replace(/\D/g, '')) || 0;
          return numA - numB;
      }); 
  }, [selectedAreaName, manholeData, getManholeStatus]);

  const selectedWardForPopup = useMemo(() => selectedAreaName !== "All" ? { area_name: selectedAreaName } : null, [selectedAreaName]);

  // --- RENDER ---
  return (
    <div className="w-full flex flex-row max-w-[2400px] gap-1">
      <div className="shadow-md shadow-gray-300 p-6 mb-4 rounded-xl bg-white w-full max-w-[70%]">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <p className="font-semibold text-md">Interactive Hotspot Manhole Map</p>
          <div className="flex justify-center items-center gap-4 ml-auto">
            {["all", "safe", "warning", "danger"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ paddingBlock: "5px", borderRadius: "5px" }} className={`${filter === f ? "btn-blue" : "btn-blue-outline"} text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}>
                {f === "all" ? "All Locations" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-col justify-start gap-4 pb-3">
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger</span>
            {isLoading && <span className="text-blue-600 font-bold ml-4 animate-pulse">Loading Data...</span>}
            {error && <span className="text-red-600 font-bold ml-4">{error}</span>}
          </div>
          <div className="flex gap-3 justify-start items-center flex-wrap">
            <input type="number" placeholder="Lat.." value={latInput} onChange={(e) => setLatInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
            <input type="number" placeholder="Lon.." value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
            <button onClick={handleJumpToLocation} className="btn-blue btn-hover text-sm ml-3" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Go</button>
            <div className="flex items-center gap-2 pl-4 border-gray-300">
              <input type="text" placeholder="ID.." value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchManhole()} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[160px]" />
              <button onClick={handleSearchManhole} className="btn-blue btn-hover text-sm" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Search</button>
            </div>
            <select value={selectedDivision} onChange={(e) => handleDivisionChange(e.target.value)} className="hover:shadow-md border cursor-pointer border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Division</option>
              {divisionList.filter(d => d !== "All").map((d, i) => <option key={i} value={d}>{getDisplayName(d)}</option>)}
            </select>
            <select value={selectedAreaName} onChange={(e) => handleAreaNameChange(e.target.value)} disabled={selectedDivision === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Ward</option>
              {areaNameList.filter(a => a !== "All").map((a, i) => <option key={i} value={a}>{getDisplayName(a)}</option>)}
            </select>
            <select value={selectedZone} onChange={(e) => handleZoneChange(e.target.value)} disabled={selectedAreaName === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[160px]">
              <option value="All">Select Zone</option>
              {zoneOptions.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="map-box relative rounded-lg overflow-hidden border border-gray-300" style={{ height: "445.52px", opacity: 1 }}>
           <button onClick={handleReset} className="bg-[#eee] absolute right-4 top-2 z-[500] rounded-md px-1.5 py-1 text-xs h-8 hover:bg-[#fff] border border-gray-300 cursor-pointer"><LocateFixed className="font-extralight w-8.5 opacity-80" /></button>
           <div className="absolute right-2 top-10 z-[500] group mt-3">
             <button className="bg-[#eee] border border-gray-300 shadow-md rounded-md w-12 h-7 mr-2 flex items-center justify-center hover:bg-[#fff] transition duration-300 opacity-80"> <MapIcon /> </button>
             <div className="absolute top-full mt-1 left--4 grid grid-rows-3 gap-1 w-13.5 rounded-md overflow-hidden transform scale-y-0 opacity-0 origin-top transition-all duration-200 group-hover:scale-y-100 group-hover:opacity-100">               
              {mapStyles.map((style) => (
                 <button key={style.url} onClick={() => handleStyleChange(style.url)} className={`flex flex-col items-center w-12 border-2 bg-white rounded-md overflow-hidden transition-all duration-150 cursor-pointer ${mapStyle === style.url ? "border-blue-500" : "border-transparent hover:border-gray-400"}`}>
                   <img src={style.img} alt={style.name} className="w-16 h-10 object-cover" />
                   <span className="text-[10px] text-gray-700 mt-0">{style.name}</span>
                 </button>
               ))}
             </div>
           </div>
           
           <MapboxCore 
              mapRef={mapRef} 
              // ✅ FIX: Use 'filteredManholeGeoJSON' so Filter Buttons & Zone selection works
              manholeGeoJSON={filteredManholeGeoJSON} 
              wardGeoJSON={{ type: "FeatureCollection", features: wardData }}
              flyToLocation={flyToLocation}
              onManholeClick={handleManholeClick}
              onManholeDeselect={handleManholeDeselect}
              buildingGeoJSON={buildingData}
              styleUrl={mapStyle} 
              centerToRestore={centerToRestoreRef} 
              zoomToRestore={zoomToRestoreRef}     
              statusFilter={filter}                
              selectedManholeId={selectedManholeLocation ? String(selectedManholeLocation.id) : null}
              getManholeDateById={getManholeDateById} 
              formatExcelDate={formatExcelDate}       
           />
           {error && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 text-red-600 font-semibold"> {error}</div>}
           <div className="bg-[#ffffff] absolute left-2 bottom-2 z-500 rounded-xl p-4 py-5 text-[12px] text-black flex flex-col gap-1">
             <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe - Regular Maintenance</span>
             <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning - Require Attention</span>
             <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger - Immediate Action Needed</span>
           </div>
        </div>
      </div>
      <div className="db-popup-container ml-4 h-[633px] shadow-gray-300 shadow-md border border-gray-200 w-full max-w-[30%] overflow-y-auto overflow-x-hidden bg-white rounded-xl ">
        {selectedManholeLocation ? (
           <ManholePopUp 
             selectedLocation={selectedManholeLocation} 
             onClose={handleClosePopup} 
             onGenerateReport={handleGenerateReport} 
             onAssignBot={handleAssignBot} 
           />
        ) : selectedWardForPopup ? (
           <WardDetailsPopUp 
             wardData={selectedWardForPopup} 
             alertData={alertData} 
             onManholeSelect={handleAlertManholeClick} 
             // ✅ FIX: Call handleAreaNameChange("All") to trigger Global Cleanup
             onClose={()=> handleAreaNameChange("All")}
             setSelectedWard={setSelectedAreaName} 
           />
        ) : (
           <div className="w-full h-full flex items-center justify-center place-items-center text-gray-400 p-4 text-center">
             <p className="flex flex-col items-center justify-center">
               <MapPin className=" w-18 h-18 mb-2 text-gray-300 " />
               Select a Manhole or Building on the map to view details.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;