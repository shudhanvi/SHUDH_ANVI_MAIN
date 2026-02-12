import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed, Map as MapIcon, MapPin } from 'lucide-react';

import { useServerData } from "../../context/ServerDataContext";
import MapboxCore from "./MapboxCore";
import ManholePopUp from "./ManholePopUp";
import WardDetailsPopUp from "./WardDetailsPopUp";
import { useMapContext } from "../../context/MapContext"; 

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
  // 2. 🎨 LOCAL UI STATE
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
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastCleaned) / (1000 * 60 * 60 * 24));

    if (diffDays >= 70) return "danger";
    if (diffDays >= 60) return "warning";
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
    // Corrected to look for manhole_id
    const found = manholeData.find(mh => String(mh.manhole_id || mh.id).trim() === String(manholeId).trim());
    return found ? (found.last_operation_timestamp || found.timestamp) : null;
  }, [manholeData]);

  const handleGenerateReport = (id) => alert(`Report generated for ${id}`);
  const handleAssignBot = (id) => alert(`Bot assigned to ${id}`);

  // --- DROPDOWN LOGIC ---
  const divisionList = useMemo(() => {
    if (!dropdownOptions.length) return ["All"];
    const uniqueDivisions = new Set();
    dropdownOptions.forEach(item => {
      const divName = item.division || item.sw_mh_division_no;
      if (divName) uniqueDivisions.add(divName);
    });
    return ["All", ...[...uniqueDivisions].sort()];
  }, [dropdownOptions]);

  const handleDivisionChange = (divisionValue) => {
    setSelectedDivision(divisionValue);
    setSelectedAreaName("All");
    setSelectedZone("All");
    clearMapData();
    setActiveWardGeoJSON(null);

    if (divisionValue !== "All") {
      const relevantRows = dropdownOptions.filter(row => String(row.division || row.sw_mh_division_no) === String(divisionValue));
      const uniqueAreas = new Set(relevantRows.map(row => row.section || row.section_name));
      setAreaNameList(["All", ...[...uniqueAreas].filter(Boolean).sort()]);
    } else {
      setAreaNameList(["All"]);
    }
  };

  useEffect(() => {
    if (selectedDivision !== "All" && dropdownOptions.length > 0) {
      const relevantRows = dropdownOptions.filter(row => String(row.division || row.sw_mh_division_no) === String(selectedDivision));
      const uniqueAreas = new Set(relevantRows.map(row => row.section || row.section_name));
      setAreaNameList(["All", ...[...uniqueAreas].filter(Boolean).sort()]);
    }
  }, [selectedDivision, dropdownOptions]);

  const handleAreaNameChange = async (areaValue) => {
    setSelectedAreaName(areaValue);
    setSelectedZone("All");
    if (areaValue !== "All") {
      await fetchMapDataGlobal(selectedDivision, areaValue, "All");
    } else {
      clearMapData();
    }
  };

// 🟢 FIXED: This extracts unique Zone IDs from your dropdown data
// Change 1: Dynamic Zone extraction
const zoneOptions = useMemo(() => {
  if (!manholeData || manholeData.length === 0) return [];
  
  const uniqueZoneIds = new Set();
  manholeData.forEach(mh => {
    // Check for zone_id in your specific data structure
    if (mh.zone_id !== undefined && mh.zone_id !== null) {
      uniqueZoneIds.add(String(mh.zone_id));
    }
  });

  return [...uniqueZoneIds]
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .map(id => ({ id, name: `Zone ${id}` }));
}, [manholeData]);
  const handleZoneChange = (zoneId) => {
    setSelectedZone(zoneId);
  };

  const handleClosePopup = useCallback(() => { setSelectedManholeLocation(null); setSearchId(""); }, []);

  const handleSearchManhole = () => {
    const targetId = searchId.trim().toLowerCase();
    if (!targetId || !manholeData.length) return;
    const found = manholeData.find(mh => String(mh.manhole_id || mh.id).toLowerCase().includes(targetId));
    if (found) {
      handleManholeClick({ 
        properties: { ...found, id: found.manhole_id }, 
        geometry: { coordinates: [found.mh_longitude, found.mh_latitude] } 
      });
    } else alert("Manhole ID not found.");
  };

  const handleReset = () => {
    if (selectedAreaName !== "All" && currentWardBounds) {
      setFlyToLocation({ bounds: currentWardBounds, padding: 80, maxZoom: 16 });
    } else {
      setFlyToLocation({ center: [78.4794, 17.3940], zoom: 9.40 });
    }
  };

  const handleJumpToLocation = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) setFlyToLocation({ center: [lon, lat], zoom: 18 });
  };

  const handleAlertManholeClick = useCallback((manholeId) => {
    if (!manholeData.length) return;
    const mData = manholeData.find(mh => String(mh.manhole_id || mh.id) === String(manholeId));
    if (mData) {
      handleManholeClick({ 
        properties: { ...mData, id: mData.manhole_id }, 
        geometry: { coordinates: [mData.mh_longitude, mData.mh_latitude] } 
      });
    }
  }, [manholeData]);

  const handleManholeClick = useCallback((f) => {
    const p = f.properties;
    const popupData = {
      ...p,
      id: p.manhole_id || p.id,
      lastCleaned: p.last_operation_timestamp || p.timestamp,
      status: getManholeStatus(p.last_operation_timestamp || p.timestamp)
    };
    setSelectedManholeLocation(popupData);
    setFlyToLocation({ center: f.geometry.coordinates, zoom: 18 });
  }, [getManholeStatus]);

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

// Change 2: Filtering logic inside filteredManholeGeoJSON
const filteredManholeGeoJSON = useMemo(() => {
  if (!manholeData.length || selectedAreaName === "All") return emptyGeoJSON;
  
  let filtered = manholeData;

  // Apply Zone Filter
  if (selectedZone && selectedZone !== "All") {
    filtered = filtered.filter(mh => String(mh.zone_id) === String(selectedZone));
  }

  // Apply Status Filter (Safe/Warning/Danger)
  if (filter !== "all") {
    filtered = filtered.filter(mh => getManholeStatus(mh.last_operation_timestamp || mh.timestamp) === filter);
  }

  const features = filtered
    .filter(mh => mh.mh_longitude && mh.mh_latitude && mh.mh_longitude !== 0)
    .map((mh) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [parseFloat(mh.mh_longitude), parseFloat(mh.mh_latitude)] },
      properties: {
        ...mh,
        id: mh.manhole_id,
        status: getManholeStatus(mh.last_operation_timestamp || mh.timestamp)
      },
      id: mh.manhole_id,
    }));

  return { type: "FeatureCollection", features };
}, [manholeData, selectedZone, filter, getManholeStatus, selectedAreaName]);

  // Ward Logic
  useEffect(() => {
    if (selectedAreaName === "All") {
      setActiveWardGeoJSON(null);
      setCurrentWardBounds(null);
      return;
    }
    // Corrected to use context wardData keys if needed, assuming same as before
    const validWardPoints = wardData.filter(w => !isNaN(Number(w.longitude)) && !isNaN(Number(w.latitude)) && Number(w.longitude) !== 0);
    const wardCoords = validWardPoints
      .sort((a, b) => (a.vertex_index || 0) - (b.vertex_index || 0))
      .map(w => [Number(w.longitude), Number(w.latitude)]);

    if (wardCoords.length >= 3) {
      const first = wardCoords[0];
      const last = wardCoords[wardCoords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) wardCoords.push(first);

      setActiveWardGeoJSON({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [wardCoords] },
        properties: { name: selectedAreaName }
      });

      const bounds = new mapboxgl.LngLatBounds();
      wardCoords.forEach(c => bounds.extend(c));
      setCurrentWardBounds(bounds);
      setFlyToLocation({ bounds, padding: 80, maxZoom: 16 });
    } // Change 3: Inside the useEffect for Ward Polygon / Bounds
else if (manholeData.length > 0) {
  setActiveWardGeoJSON(null);
  const bounds = new mapboxgl.LngLatBounds();
  let hasPoints = false;
  manholeData.forEach(m => {
    // 🟢 Use the correct keys from your JSON
    if (m.mh_longitude && m.mh_latitude) {
      bounds.extend([parseFloat(m.mh_longitude), parseFloat(m.mh_latitude)]);
      hasPoints = true;
    }
  });
  if (hasPoints) {
    setCurrentWardBounds(bounds);
    setFlyToLocation({ bounds, padding: 80, maxZoom: 17 });
  }
}
  }, [wardData, selectedAreaName, manholeData]);

  const alertData = useMemo(() => {
    if (selectedAreaName === "All" || !manholeData.length) return [];
    const danger = manholeData.filter(mh => getManholeStatus(mh.last_operation_timestamp || mh.timestamp) === 'danger');
    const grouped = danger.reduce((acc, mh) => {
      let key = mh.zone_id ? `Zone ${mh.zone_id}` : "Unzoned";
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        id: String(mh.manhole_id),
        location: `${Number(mh.mh_latitude).toFixed(4)}, ${Number(mh.mh_longitude).toFixed(4)}`,
        status: 'Danger'
      });
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([k, v]) => ({ zoneName: k, alerts: v }))
      .sort((a, b) => (parseInt(a.zoneName.replace(/\D/g, '')) || 0) - (parseInt(b.zoneName.replace(/\D/g, '')) || 0));
  }, [selectedAreaName, manholeData, getManholeStatus]);

  const selectedWardForPopup = 
  useMemo(() => selectedAreaName !== "All" ? { area_name: selectedAreaName , division : selectedDivision} : null,
   [selectedAreaName]);

  return (
    // 1. PARENT: Fixed height (e.g., h-[85vh]) ensures both sides are always equal height
    <div className="w-full flex flex-row max-w-[2400px] gap-4 h-[85vh] max-h-[1200px] p-2">
      
      {/* --- Left section (Map + Controls) --- */}
      <div className="shadow-md shadow-gray-300 p-4 rounded-xl bg-white w-[70%] flex flex-col h-full">
        
        {/* Top Controls */}
        <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
          <p className="font-semibold text-md">Interactive Hotspot Manhole Map</p>
          <div className="flex justify-center items-center gap-4 ml-auto">
            {["all", "safe", "warning", "danger"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ paddingBlock: "5px", borderRadius: "5px" }} 
                className={`${filter === f ? "btn-blue" : "btn-blue-outline"} text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}>
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
            {/* {isLoading && <span className="text-blue-600 font-bold ml-4 animate-pulse">Loading Data...</span>} */}
          </div>
          <div className="flex gap-3 justify-start items-center flex-wrap">
            <input type="number" placeholder="Lat.." value={latInput} onChange={(e) => setLatInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white px-2 py-1 w-auto max-w-[150px]" />
            <input type="number" placeholder="Lon.." value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white px-2 py-1 w-auto max-w-[150px]" />
            <button onClick={handleJumpToLocation} className="btn-blue btn-hover text-sm ml-3" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Go</button>
            <div className="flex items-center gap-2 pl-4 border-gray-300">
              <input type="text" placeholder="ID.." value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchManhole()} className="hover:shadow-md border border-gray-300 rounded-sm bg-white px-2 py-1 w-auto max-w-[160px]" />
              <button onClick={handleSearchManhole} className="btn-blue btn-hover text-sm" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Search</button>
            </div>
            <select value={selectedDivision} onChange={(e) => handleDivisionChange(e.target.value)} className="hover:shadow-md border cursor-pointer border-gray-300 rounded-sm bg-white px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Division</option>
              {divisionList.filter(d => d !== "All").map((d, i) => <option key={i} value={d}>{getDisplayName(d)}</option>)}
            </select>
            <select value={selectedAreaName} onChange={(e) => handleAreaNameChange(e.target.value)} disabled={selectedDivision === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Ward</option>
              {areaNameList.filter(a => a !== "All").map((a, i) => <option key={i} value={a}>{getDisplayName(a)}</option>)}
            </select>
            <select value={selectedZone} onChange={(e) => handleZoneChange(e.target.value)} disabled={selectedAreaName === "All"} 
            className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white px-2 py-1 w-auto max-w-[160px]">
              <option value="All">Select Zone</option>
              {zoneOptions.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
 
        </div>
        <div className="map-box relative rounded-lg overflow-hidden border border-gray-300" style={{ height: "445.52px" }}>
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
          {/* <div className="relative w-full h-full">  */}
       {isLoading && (
      <div className="absolute inset-0 z-[10] flex items-center justify-center bg-black/10 backdrop-blur-[5px] pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full ">
          <div className="w-10 h-10 border-5 border-white border-t-[#1e9ab0] rounded-full animate-spin"></div>
         </div>
      </div>
    )}
         <MapboxCore
            mapRef={mapRef}
            manholeGeoJSON={filteredManholeGeoJSON}
            wardGeoJSON={activeWardGeoJSON ? { type: "FeatureCollection", features: [activeWardGeoJSON] } : emptyGeoJSON}
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
 
          <div className="bg-[#ffffff] absolute left-2 bottom-2 z-500 rounded-xl p-4 py-5 text-[12px] text-black flex flex-col gap-1">
            <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe - Regular Maintenance</span>
            <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning - Require Attention</span>
            <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger - Immediate Action Needed</span>
          </div>
        </div>
      </div>
      <div className="shadow-gray-300 shadow-md border border-gray-200 bg-white rounded-xl overflow-hidden flex flex-col w-full min-[1000px]:w-[30%] h-[500px] min-[1000px]:h-[633px] ml-0 min-[1000px]:ml-4 mt-4 min-[1000px]:mt-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedManholeLocation ? (
            <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
              <ManholePopUp selectedLocation={selectedManholeLocation} onClose={handleClosePopup} onGenerateReport={handleGenerateReport} onAssignBot={handleAssignBot} />
            </div>
          ) : selectedWardForPopup ? (
            <WardDetailsPopUp wardData={selectedWardForPopup} 
            alertData={alertData}
             onManholeSelect={handleAlertManholeClick} 
             onClose={() => handleAreaNameChange("All")}
              setSelectedWard={setSelectedAreaName} />
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
    </div>
  );
};

export default MapComponent;