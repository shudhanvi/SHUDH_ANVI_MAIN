// ./MapComponent.js

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as XLSX from "xlsx";
import { LocateFixed, Map, MapPin } from 'lucide-react';

import MapboxCore from "./MapboxCore";
import ManholePopUp from "./ManholePopUp";
import WardDetailsPopUp from "./WardDetailsPopUp";

const mapStyles = [
  { url: "mapbox://styles/shubhamgv/cmggj327600ke01pd15kqh8v6", img: "/images/Satilight.png" },
  { url: "mapbox://styles/shubhamgv/cmdr5g1b2000c01sd8h0y6awy", img: "/images/street.png" },
  { url: "mapbox://styles/shubhamgv/cmh5vh70d001q01qvhqhwh5b9", img: "/images/diameter.png" },
];

const emptyGeoJSON = { type: "FeatureCollection", features: [] };

const MapComponent = () => {
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  const [allManholeData, setAllManholeData] = useState([]);
  const [wardDetailsMap, setWardDetailsMap] = useState({});
  const [wardPolygons, setWardPolygons] = useState({});
  const [divisionList, setDivisionList] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [areaNameList, setAreaNameList] = useState([]);
  const [selectedAreaName, setSelectedAreaName] = useState("All");
  const [zoneList, setZoneList] = useState([]);
  const [selectedZone, setSelectedZone] = useState("All");
  const [mapStyle, setMapStyle] = useState(mapStyles[0].url);
  const [flyToLocation, setFlyToLocation] = useState(null);
  const [filteredManholeGeoJSON, setFilteredManholeGeoJSON] = useState(emptyGeoJSON);
  const [activeWardGeoJSON, setActiveWardGeoJSON] = useState(null);
  const [selectedManholeLocation, setSelectedManholeLocation] = useState(null);

  // --- Refs ---
  const centerToRestoreRef = useRef(null);
  const zoomToRestoreRef = useRef(null);
  const mapRef = useRef(null); // Parent holds the ref for the map instance
  // --- End Refs ---

  // --- HELPER FUNCTIONS ---
  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  };

  const getManholeStatus = (operationdates) => {
    if (!operationdates) return "safe";
    let lastCleaned;
    if (typeof operationdates === "number") {
      lastCleaned = excelDateToJSDate(operationdates);
    } else if (typeof operationdates === "string") {
      const parts = operationdates.split(/[\/-]/);
      if (parts.length === 3) {
        // Assuming DD/MM/YYYY or DD-MM-YYYY
        const [day, month, year] = parts.map(Number); // Convert parts to numbers
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
           // Month is 0-indexed in JS Date constructor (0 = Jan, 1 = Feb, etc.)
           lastCleaned = new Date(year, month - 1, day);
        }
      }
    }
    // Validate the parsed date
    if (!lastCleaned || isNaN(lastCleaned.getTime())) {
  return "safe";
    }
    const today = new Date();
    // Clear time part for accurate day difference calculation
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);

    const diffTime = today - lastCleaned;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 20) return "danger";
    if (diffDays >= 10) return "warning";
    return "safe";
  };


  const formatExcelDate = useCallback((value) => {
    if (!value) return "N/A";
    if (typeof value === "string") {
        // Attempt to parse common string formats if needed, otherwise return as is
        const parts = value.split(/[\/-]/);
        if (parts.length === 3) {
             const [day, month, year] = parts;
             // Basic validation
             if (day?.length === 2 && month?.length === 2 && year?.length === 4) {
                 return `${day}/${month}/${year}`; // Return in consistent format
             }
        }
        return value; // Return original string if not parsable in expected format
    }
    if (typeof value === "number") {
      const utc_days = Math.floor(value - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
       // Check if date is valid after conversion
      if (!isNaN(date_info.getTime())) {
         return date_info.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
      }
    }
    return "Invalid Date";
  }, []);

  const generateManholeGeoJSON = useCallback((data) => ({
    type: "FeatureCollection",
    features: data.map((row) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
      properties: { ...row, status: getManholeStatus(row.last_operation_date) },
      id: row.id,
    })),
  }), []); // getManholeStatus is stable

  // --- DATA LOADING ---
  const initialLoadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const response = await fetch("/datafiles/CSVs/MH.xlsx");
       if (!response.ok) { throw new Error(`Failed to fetch MH.xlsx: ${response.statusText}`); }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const manholeRows = XLSX.utils.sheet_to_json(sheet);
      setAllManholeData(manholeRows);
      const uniqueDivisions = [...new Set(manholeRows.map((row) => row.Division))].filter(Boolean).sort();
      setDivisionList(["All", ...uniqueDivisions]);
      setIsLoading(false);
    } catch (e) {
      setError(e.message); setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetch("/datafiles/CSVs/ward_coordinates.xlsx")
      .then(res => {
         if (!res.ok) { throw new Error(`Failed to fetch ward_coordinates.xlsx: ${res.statusText}`); }
         return res.arrayBuffer();
      })
      .then(ab => {
        // --- Parsing logic (looks correct) ---
        const wb = XLSX.read(ab, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allRows = XLSX.utils.sheet_to_json(ws, { defval: null });
        const groupedCoords = {};
        const detailsMap = {};
        const uniqueAreaNames = new Set();
        allRows.forEach(row => {
          const areaRaw = row.Area_name ?? row.area ?? row["Area Name"] ?? row["area_name"];
          if (!areaRaw) return;
          const area = String(areaRaw).trim();
          const lonVal = row.longitude ?? row.Longitude ?? row.lon ?? row.x ?? row.X;
          const latVal = row.latitude ?? row.Latitude ?? row.lat ?? row.y ?? row.Y;
          // Ensure coordinates are numbers before pushing
          const lonNum = Number(lonVal);
          const latNum = Number(latVal);
          if (!isNaN(lonNum) && !isNaN(latNum)) {
            const idx = (row.vertex_index ?? row.vertex ?? row.index ?? null);
            if (!groupedCoords[area]) groupedCoords[area] = [];
            groupedCoords[area].push({ lon: lonNum, lat: latNum, idx: (idx !== null && !isNaN(Number(idx))) ? Number(idx) : groupedCoords[area].length });
          } else if (lonVal != null || latVal != null) { // Log if coords exist but aren't numbers
            
          }
          // Details map logic (looks correct)
          if (!uniqueAreaNames.has(area)) {
            detailsMap[area] = { Area_name: area, ...row };
            delete detailsMap[area].longitude; delete detailsMap[area].latitude; delete detailsMap[area].lon; delete detailsMap[area].lat;
            delete detailsMap[area].x; delete detailsMap[area].y; delete detailsMap[area].vertex_index; delete detailsMap[area].vertex; delete detailsMap[area].index;
            uniqueAreaNames.add(area);
          }
        });
         // Polygon closing logic (looks correct)
        Object.keys(groupedCoords).forEach(area => {
          const coords = groupedCoords[area].sort((a, b) => a.idx - b.idx).map(p => [p.lon, p.lat]);
          if (coords.length > 0) {
            const first = coords[0]; const last = coords[coords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) { coords.push([first[0], first[1]]); }
          }
          groupedCoords[area] = coords;
        });
        setWardPolygons(groupedCoords); setWardDetailsMap(detailsMap);
      })
      .catch(err => {
 
          setError(err.message); // Set error state
      });
  }, []);

  useEffect(() => { initialLoadData(); }, [initialLoadData]);
  useEffect(() => { const dailyTimer = setInterval(initialLoadData, 1000 * 60 * 60 * 24); return () => clearInterval(dailyTimer); }, [initialLoadData]);

  // --- HIERARCHY HANDLERS ---
  const clearManholeSelection = useCallback(() => { setSelectedManholeLocation(null); }, []);

  // --- Corrected handleDivisionChange ---
  const handleDivisionChange = useCallback((divisionValue) => {
 
    clearManholeSelection();
    setSelectedDivision(divisionValue);
    setSelectedAreaName("All"); // Reset ward
    setSelectedZone("All");     // Reset zone

    let areas = [];
    if (divisionValue !== "All" && allManholeData.length > 0) {
      const divisionData = allManholeData.filter(row => row.Division === divisionValue);
 
      if (divisionData.length > 0) {
        areas = [...new Set(divisionData.map(row => row.Area_name))]
                  .filter(Boolean) // Remove empty/null names
                  .sort();
      
      } else {
      
      }
    } else {
     
    }
    setAreaNameList(["All", ...areas]); // Update ward dropdown list
    setZoneList([]);                   // Clear zone dropdown list
  }, [allManholeData, clearManholeSelection]); // Dependencies

  // --- Corrected handleAreaNameChange ---
  const handleAreaNameChange = useCallback((areaValue) => {
 
    clearManholeSelection();
    setSelectedAreaName(areaValue);
    setSelectedZone("All"); // Reset zone

    let zones = [];
    if (selectedDivision !== "All" && areaValue !== "All" && allManholeData.length > 0) {
      const areaData = allManholeData.filter(row =>
        row.Division === selectedDivision && row.Area_name === areaValue
      );
       
      if (areaData.length > 0) {
        zones = [...new Set(areaData.map(row => row.Zone))]
                  .filter(Boolean) // Remove empty/null zones
                  .sort();
        
      } else {
        
      }
    } else {
      
    }
    setZoneList(["All", ...zones]); // Update zone dropdown list
  }, [selectedDivision, allManholeData, clearManholeSelection]); // Dependencies

  // --- Corrected handleZoneChange ---
  const handleZoneChange = useCallback((zoneValue) => {
 
    clearManholeSelection();
    setSelectedZone(zoneValue); // Correctly set the zone state
  }, [clearManholeSelection]); // Dependency

  // --- Modified handleStyleChange ---
  const handleStyleChange = (newStyleUrl) => {
    if (newStyleUrl !== mapStyle) {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        centerToRestoreRef.current = center;
        zoomToRestoreRef.current = zoom;
        
      } else {
       
        centerToRestoreRef.current = null; zoomToRestoreRef.current = null;
      }
      setMapStyle(newStyleUrl);
    }
  };

const handleJumpToLocation = () => {
    // Read values from state
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    // Check if both values are valid numbers
    if (!isNaN(lat) && !isNaN(lon)) {
       
      // Update the flyToLocation state to trigger the effect in MapboxCore
      setFlyToLocation({ center: [lon, lat], zoom: 18 }); // Zoom level 18 is common for specific points
    } else {
      
      alert("Please enter valid numeric latitude and longitude values."); // User feedback
    }
  };
const handleReset = () => {
    // Check if a specific ward is currently selected
    if (selectedAreaName && selectedAreaName !== "All" && Object.keys(wardPolygons).length > 0) {
      // Find the coordinates for the currently selected ward
      const normalized = String(selectedAreaName).trim().toLowerCase();
      const matchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);

      if (matchKey) {
        const coords = wardPolygons[matchKey];
        if (Array.isArray(coords) && coords.length > 0) {
          // Calculate bounds and fly there
          const bounds = new mapboxgl.LngLatBounds();
          let validCoordsFound = false; // Added from bounds calculation logic
          coords.forEach(c => {
             if (Array.isArray(c) && c.length === 2 && typeof c[0] === 'number' && !isNaN(c[0]) && typeof c[1] === 'number' && !isNaN(c[1])) {
                bounds.extend(c);
                validCoordsFound = true;
             }
          });

          if(validCoordsFound) { // Check if bounds could be extended
             setFlyToLocation({ bounds: bounds, padding: 40 });
           
             return; // Stop here, don't reset to default view
          } else {
         
          }
        }
      }
    }

    // If no specific ward is selected or bounds failed, reset to the default view
  
    setFlyToLocation({ center: [78.4794, 17.3940], zoom: 9.40 });
    
 
  };

  // --- Popup Handlers ---
  const handleClosePopup = () => clearManholeSelection();
  const handleGenerateReport = () => { console.log("Report generation triggered"); clearManholeSelection(); };
  const handleAssignBot = () => { console.log("Assign bot triggered"); clearManholeSelection(); };

  // --- MAP CALLBACK HANDLERS ---
  const handleManholeClick = useCallback((feature) => {
    const manholeStatus = getManholeStatus(feature.properties.last_operation_date);
    setSelectedManholeLocation({
      ...feature.properties,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      lastCleaned: feature.properties.last_operation_date,
      status: manholeStatus,
    });
    setFlyToLocation({ center: feature.geometry.coordinates, zoom: 18 });
  }, []);

  const handleManholeDeselect = useCallback(() => { clearManholeSelection(); }, [clearManholeSelection]);

  const handleAlertManholeClick = useCallback((manholeId) => {
    const manholeData = allManholeData.find(mh => mh.id === manholeId);
    if (manholeData) {
      const lat = parseFloat(manholeData.latitude);
      const lon = parseFloat(manholeData.longitude);
      const manholeStatus = getManholeStatus(manholeData.last_operation_date);
      setSelectedManholeLocation({
        ...manholeData, latitude: isNaN(lat) ? null : lat, longitude: isNaN(lon) ? null : lon,
        lastCleaned: manholeData.last_operation_date, status: manholeStatus,
      });
      if (!isNaN(lon) && !isNaN(lat)) { setFlyToLocation({ center: [lon, lat], zoom: 18 }); }
      else { console.warn("Invalid coords for flying:", manholeData.longitude, manholeData.latitude); }
    } else { console.warn("Manhole data not found for ID:", manholeId); }
  }, [allManholeData]);

  // --- EFFECT TO FILTER MANHOLES ---
  useEffect(() => {
    // console.log("--- Effect: Filter Manholes Running ---", { selectedDivision, selectedAreaName, selectedZone });
    if (allManholeData.length === 0) { setFilteredManholeGeoJSON(emptyGeoJSON); return; }
    if (selectedDivision === "All" || selectedAreaName === "All") { setFilteredManholeGeoJSON(emptyGeoJSON); return; }
    let filtered = allManholeData.filter((row) => {
      const matchesHierarchy = (row.Division === selectedDivision && row.Area_name === selectedAreaName);
      if (!matchesHierarchy) return false;
      if (selectedZone !== "All" && row.Zone !== selectedZone) { return false; }
      return true;
    });
    setFilteredManholeGeoJSON(generateManholeGeoJSON(filtered));
  }, [selectedDivision, selectedAreaName, selectedZone, allManholeData, generateManholeGeoJSON]);

 
 // --- EFFECT TO PREPARE WARD POLYGON & TRIGGER ZOOM ---
  useEffect(() => {
    // console.log("--- Effect: Draw Ward Polygon Running ---", { selectedAreaName }); // Keep if needed for debugging
    // Guard: Wait until polygon coordinates are loaded
    if (Object.keys(wardPolygons).length === 0) {
      // console.log("Ward polygons not loaded yet, skipping effect."); // Debug log
      return;
    }

    // Don't clear manhole selection here - let clicks/reset handle it
    // clearManholeSelection();

    // If "All" is selected, clear the polygon and potentially the zoom target
    if (!selectedAreaName || selectedAreaName === "All") {
      setActiveWardGeoJSON(null);
      // setFlyToLocation(null); // Optional: Reset zoom target only if desired when clearing ward
      return;
    }

    // Find the matching polygon data using case-insensitive comparison
    const normalized = String(selectedAreaName).trim().toLowerCase();
    const matchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);

    // Handle case where no matching polygon is found
    if (!matchKey) {
    
      setActiveWardGeoJSON(null);
      // setFlyToLocation(null); // Optional: Reset zoom target
      return;
    }

    // Get the coordinates
    const coords = wardPolygons[matchKey];

    // Validate coordinates array structure
    if (!Array.isArray(coords) || coords.length < 4) { // Need at least 4 points for a valid closed polygon (start/end repeat)
 
      setActiveWardGeoJSON(null);
      // setFlyToLocation(null); // Optional: Reset zoom target
      return;
    }

    // Create the GeoJSON object for the polygon layer
    const geojson = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] }, // GeoJSON Polygon coordinates are nested [[ [lon, lat], ... ]]
      properties: { name: matchKey }
    };
    setActiveWardGeoJSON(geojson); // Update state for MapboxCore to draw the border

    // --- Calculate Bounds for Zooming ---
    try {
      // Create a new bounds object
      const bounds = new mapboxgl.LngLatBounds();
      let validCoordsFound = false; // Flag to ensure at least one valid point was added

      // Iterate through coordinates and extend bounds
      coords.forEach((c, index) => {
        // Strict check for valid coordinate pair [number, number]
        if (Array.isArray(c) && c.length === 2 && typeof c[0] === 'number' && !isNaN(c[0]) && typeof c[1] === 'number' && !isNaN(c[1])) {
          bounds.extend(c); // Add valid coordinate to bounds calculation
          validCoordsFound = true;
        } else {
          
        }
      });

      // console.log("Calculated Bounds Object:", bounds); // Keep for debugging if needed

      // Check only if valid coordinates were found (isValid() was removed)
      if (validCoordsFound) {
 
         setFlyToLocation({ bounds: bounds, padding: 40 }); // Update state to trigger zoom in MapboxCore
      } else {
        
          // setFlyToLocation(null); // Optional: Clear previous zoom target if bounds are bad
      }
    } catch (error) {
 
       setActiveWardGeoJSON(null);  
        
    }
  
  }, [selectedAreaName, wardPolygons]); // Removed clearManholeSelection from dependencies
  // --- DERIVED STATE FOR POPUPS ---
const alertData = useMemo(() => {
    if (!selectedAreaName || selectedAreaName === "All" || allManholeData.length === 0) {
      return []; // Return empty if no specific ward selected or no data
    }
    // Filter manholes for the selected ward and division
    const wardManholes = allManholeData.filter(
      (mh) => mh.Area_name === selectedAreaName && mh.Division === selectedDivision
    );
    // Filter those for 'danger' status
    const dangerManholes = wardManholes.filter(
      (mh) => getManholeStatus(mh.last_operation_date) === 'danger'
    );
    // Group danger manholes by Zone
    const groupedByZone = dangerManholes.reduce((acc, mh) => {
      const zone = mh.Zone || 'Unknown Zone';
      if (!acc[zone]) { acc[zone] = []; }
      acc[zone].push({
        id: mh.id || 'N/A',
        location: `${mh.latitude || 'N/A'}, ${mh.longitude || 'N/A'}`,
        status: 'Danger',
      });
      return acc;
    }, {});
    // Format into the array structure needed by Alerts component
    const formattedAlertData = Object.entries(groupedByZone)
      .map(([zoneName, alerts]) => ({ zoneName, alerts }))
      .sort((a, b) => a.zoneName.localeCompare(b.zoneName)); // Sort zones
    return formattedAlertData;
  }, [selectedAreaName, selectedDivision, allManholeData]); // Dependencies

  // Find the details for the selected ward popup
  const normalized = selectedAreaName && selectedAreaName !== "All"
                     ? String(selectedAreaName).trim().toLowerCase()
                     : null; // Normalize selected ward name

  // Find the matching key in the polygon data (used to confirm ward exists)
  const finalMatchKey = normalized && Object.keys(wardPolygons).length > 0
                        ? Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized)
                        : null;

  // Get the ward details from wardDetailsMap using the matched key
  const selectedWardForPopup = finalMatchKey && Object.keys(wardDetailsMap).length > 0
                               ? wardDetailsMap[finalMatchKey] // Get details using the key found in polygons
                               : null; // Set to null if no match or details map is empty
 
  return (
    <div className=" w-full flex flex-row max-w-[2400px] gap-1">
      {/* --- Left section --- */}
      <div className="shadow-md shadow-gray-300 p-6 mb-4 rounded-xl bg-white w-full max-w-[70%]">
        {/* Top Controls */}
        <div className="flex justify-between items-center flex-wrap gap-2"> {/* Use items-center */}
          <p className="font-semibold text-md">Interactive Hotspot Manhole Map</p>
          <div className="flex justify-center items-center gap-4 ml-auto"> {/* Use items-center */}
             {["all", "safe", "warning", "danger"].map((f) => ( <button key={f} onClick={() => setFilter(f)} style={{ paddingBlock: "5px", borderRadius: "5px" }} className={`${filter === f ? "btn-blue" : "btn-blue-outline"} text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}> {f === "all" ? "All Locations" : f.charAt(0).toUpperCase() + f.slice(1)} </button> ))}
          </div>
        </div>
        {/* Bottom Controls */}
        <div className="mt-4 flex flex-col justify-start gap-4 pb-3"> {/* Removed align-middle */}
           <div className="flex items-center gap-5 text-sm"> <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe</span> <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning</span> <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger</span> </div>
           <div className="flex gap-3 justify-start items-center flex-wrap"> {/* Use items-center */}
             <input type="number" placeholder="Latitude.." value={latInput} onChange={(e) => setLatInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
             <input type="number" placeholder="Longitude.." value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
             <button onClick={handleJumpToLocation} className="btn-blue btn-hover text-sm ml-3" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Go</button>
             <select value={selectedDivision} onChange={(event) => handleDivisionChange(event.target.value)} className="hover:shadow-md border cursor-pointer border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"> <option value="All">Select Division</option> {divisionList.filter(d => d !== "All").map((division, idx) => ( <option key={idx} value={division}>{division}</option> ))} </select>
             <select value={selectedAreaName} onChange={(event) => handleAreaNameChange(event.target.value)} disabled={selectedDivision === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"> <option value="All">Select Ward</option> {areaNameList.filter(a => a !== "All").map((area, idx) => ( <option key={idx} value={area}>{area}</option> ))} </select>
             <select value={selectedZone}onChange={(event) => handleZoneChange(event.target.value)} disabled={selectedAreaName === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[160px]"> <option value="All">Select Zone</option> {zoneList.filter(z => z !== "All").map((zone, idx) => ( <option key={idx} value={zone}>{zone}</option> ))} </select>
           </div>
        </div>
        {/* --- Map Container --- */}
        <div className="map-box relative rounded-lg overflow-hidden border border-gray-300" style={{ height: "445.52px", opacity: 1 }}>
          <button onClick={handleReset} className=" bg-[#eee] absolute right-4.5 top-2 z-[500] rounded px-1.5 py-1 text-xs h-8 border-gray-400 cursor-pointer hover:bg-[#fff]"> <LocateFixed className="font-light w-8.5" /> </button>
          <div className="absolute right-2 top-10 z-[500] group mt-3">
             <button className=" bg-[#eee] border cursor-pointer border-gray-300 shadow-md rounded-md w-12 h-7 mr-2 flex items-center justify-center hover:bg-gray-100 transition duration-300"> <Map /> </button>
             <div className="absolute top-full mt-1 left--4 grid grid-rows-3 gap-1 w-13.5 rounded-md overflow-hidden transform scale-y-0 opacity-0 origin-top transition-all duration-200 group-hover:scale-y-100 group-hover:opacity-100 "> {/* Changed grid-row-2 to grid-rows-3 */}
               {mapStyles.map((style) => ( <button key={style.url} onClick={() => handleStyleChange(style.url)} className={` w-12 h-12 border-2 rounded-md overflow-hidden transition-all duration-150 cursor-pointer ${mapStyle === style.url ? "border-blue-500" : "border-transparent hover:border-gray-400"}`}> <img src={style.img} alt={style.url} className="w-full h-full object-cover"/> </button> ))}
             </div>
           </div>
          {/* --- CORE MAP COMPONENT --- */}
          <MapboxCore
            mapRef={mapRef} // Pass ref object
            centerToRestore={centerToRestoreRef} // Pass ref object
            zoomToRestore={zoomToRestoreRef} // Pass ref object
            styleUrl={mapStyle}
            manholeGeoJSON={filteredManholeGeoJSON}
            wardGeoJSON={activeWardGeoJSON}
            statusFilter={filter}
            selectedManholeId={selectedManholeLocation ? selectedManholeLocation.id : null}
            flyToLocation={flyToLocation}
            formatExcelDate={formatExcelDate}
            onManholeClick={handleManholeClick}
            onManholeDeselect={handleManholeDeselect}
          />
          {/* --- END CORE MAP COMPONENT --- */}
          {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">Loading map...</div>}
          {error && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 text-red-500">Error: {error}</div>}
 <div className="bg-[#ffffff] absolute left-2 bottom-2 z-[500] rounded-xl p-4 py-5 text-[12px] text-black flex flex-col gap-1">
            <span className="flex items-center gap-3 space-x-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>Safe - Regular Maintenance
            </span>
            <span className="flex items-center gap-3 space-x-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning - Require Attention
            </span>
            <span className="flex items-center gap-3 space-x-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>Danger - Immediate Action Needed
            </span>
          </div>        </div>
      </div>
      {/* --- Right section --- */}
     <div className="db-popup-container ml-4 h-[633px] shadow-gray-300 shadow-md border border-gray-300 w-full max-w-[30%] overflow-y-auto overflow-x-hidden bg-white rounded-xl ">
        {selectedManholeLocation ? (
          // Display ManholePopUp if a manhole is selected
          <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
            <ManholePopUp
              selectedLocation={selectedManholeLocation}
              onClose={handleClosePopup}
              onGenerateReport={handleGenerateReport}
              onAssignBot={handleAssignBot}
            />
          </div>
        ) : selectedWardForPopup ? (
          // Display WardDetailsPopUp if NO manhole is selected BUT a ward is selected
          <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
            <WardDetailsPopUp
              wardData={selectedWardForPopup}        
              alertData={alertData}                // Pass the calculated danger alerts
              onManholeSelect={handleAlertManholeClick} // Pass the click handler for alerts table
              onClose={() => setSelectedAreaName("All")} // Handler to close ward popup (by resetting selection)
              setSelectedWard={setSelectedAreaName}   // Prop for WardDetailsPopUp internal logic (might be redundant)
            />
          </div>
        ) : (
          // Display Empty State if NEITHER manhole NOR ward is selected
          <div className="w-full h-full flex items-center justify-center place-items-center text-gray-400 p-4 text-center">
            <p className="flex flex-col items-center justify-center">
              <MapPin className=" w-10 h-10 mb-2 text-gray-300 " />
              Select a Manhole on the map to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;