

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed, Map, MapPin } from 'lucide-react';
import { useServerData } from "../../context/ServerDataContext";
import MapboxCore from "./MapboxCore";
import ManholePopUp from "./ManholePopUp";
import WardDetailsPopUp from "./WardDetailsPopUp";

const mapStyles = [

  { url: "mapbox://styles/shubhamgv/cmdr5g1b2000c01sd8h0y6awy", img: "/images/street.png" },
  { url: "mapbox://styles/shubhamgv/cmggj327600ke01pd15kqh8v6", img: "/images/Satilight.png" },
  { url: "mapbox://styles/shubhamgv/cmh5vh70d001q01qvhqhwh5b9", img: "/images/diameter.png" },
];


const emptyGeoJSON = { type: "FeatureCollection", features: [] };

const MapComponent = () => {
  // --- State Management ---
  //const [isLoading, setIsLoading] = useState(true);
  //const [error, setError] = useState(null);
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
  const { data, loading, message: error } = useServerData();

  // --- Refs ---
  const centerToRestoreRef = useRef(null);
  const zoomToRestoreRef = useRef(null);
  const mapRef = useRef(null);
  // --- End Refs ---
  // const { data: manholeData, loading: manholeLoading, message: manholeError } = useServerData();
 
  /**
   * Helper utility to convert Excel serial date numbers to JS Date objects.
   * This should be defined OUTSIDE your React component.
   */
  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  };

  // --- Inside your React component ---

  /**
   * Calculates the manhole status based on the last operation date.
   */
  const getManholeStatus = useCallback((operationdates) => {
    if (!operationdates) return "safe";

    let lastCleaned;
    if (typeof operationdates === "number") {
      lastCleaned = excelDateToJSDate(operationdates);
    } else if (typeof operationdates === "string") {

      // ✅ **THE FIX IS HERE**
      // Robustly get the date part, ignoring time
      const datePart = operationdates.split(' ')[0];
      const parts = datePart.split(/[\/-]/);

      if (parts.length === 3) {
        // Parse as DD/MM/YYYY
        const [day, month, year] = parts.map(Number);

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          // month - 1 because JS months are 0-indexed
          lastCleaned = new Date(year, month - 1, day);
        }
      }
    }

    if (!lastCleaned || isNaN(lastCleaned.getTime())) {
      console.error("Invalid date:", operationdates);
      return "safe";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);

    const diffTime = today - lastCleaned;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Logic is now correct
    if (diffDays >= 10) return "danger";
    if (diffDays >= 7) return "warning";
    return "safe";
  }, []); // No dependencies needed

  /**
   * Formats a date value (string or Excel number) into DD/MM/YYYY.
   */
  const formatExcelDate = useCallback((value) => {
    if (!value) return "N/A";

    // Handle string dates
    if (typeof value === "string") {
      // Just return the date part, as it's already a string
      return value.split(' ')[0];
    }

    // Handle numeric Excel dates
    if (typeof value === "number") {
      const date_info = excelDateToJSDate(value);
      if (!isNaN(date_info.getTime())) {
        return date_info.toLocaleDateString("en-GB"); // DD/MM/YYYY
      }
    }

    return "Invalid Date";
  }, []); // No dependencies needed

  /**
   * Generates the GeoJSON FeatureCollection from raw data.
   */
  const generateManholeGeoJSON = useCallback((data) => {
    return {
      type: "FeatureCollection",
      features: data.map((row) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
        properties: {
          ...row,
          status: getManholeStatus(row.last_operation_date)
        },
        id: row.id,
      })),
    };
  }, [getManholeStatus]);

  useEffect(() => {
    // Only process data if loading is done, there's no error, and data exists
    if (!loading && data) {
      // 1. Process Manhole Data
      if (data.ManholeData && Array.isArray(data.ManholeData)) {
 
        setAllManholeData(data.ManholeData);
        // Use lowercase 'division' (matching sample data)
        const uniqueDivisions = [...new Set(data.ManholeData.map((row) => row.division))].filter(Boolean).sort();
        setDivisionList(["All", ...uniqueDivisions]);
      } else {
        console.warn("Context: 'ManholeData' is missing or not an array.");
        setAllManholeData([]);
        setDivisionList(["All"]);
      }

      // 2. Process Ward Coordinates Data
      if (data.WardData && Array.isArray(data.WardData)) {
 
        const allRows = data.WardData;

        // --- Parsing logic (same as before) ---
        const groupedCoords = {};
        const detailsMap = {};
        const uniqueAreaNames = new Set();
        allRows.forEach(row => {
          // Use lowercase 'area_name' to match sample
          const areaRaw = row.area_name ?? row.section ?? row.area ?? row["area Name"] ?? row["area_name"] ?? row["section"];
          if (!areaRaw) return;
          const area = String(areaRaw).trim();
 
          const lonVal = row.longitude ?? row.Longitude ?? row.lon ?? row.x ?? row.X;
          const latVal = row.latitude ?? row.Latitude ?? row.lat ?? row.y ?? row.Y;
          const lonNum = Number(lonVal);
          const latNum = Number(latVal);
          if (!isNaN(lonNum) && !isNaN(latNum)) {
            const idx = (row.vertex_index ?? row.vertex ?? row.index ?? null);
            if (!groupedCoords[area]) groupedCoords[area] = [];
            groupedCoords[area].push({ lon: lonNum, lat: latNum, idx: (idx !== null && !isNaN(Number(idx))) ? Number(idx) : groupedCoords[area].length });
          } else if (lonVal != null || latVal != null) {
            console.warn(`Invalid coordinates for Area "${area}": lon=${lonVal}, lat=${latVal}`);
          }
          if (!uniqueAreaNames.has(area)) {
            detailsMap[area] = { area_name: area, ...row };
            // (delete other coord keys)
            delete detailsMap[area].longitude; delete detailsMap[area].latitude; delete detailsMap[area].lon; delete detailsMap[area].lat;
            delete detailsMap[area].x; delete detailsMap[area].y; delete detailsMap[area].vertex_index; delete detailsMap[area].vertex; delete detailsMap[area].index;
            uniqueAreaNames.add(area);
          }
        });
        Object.keys(groupedCoords).forEach(area => {
          const coords = groupedCoords[area].sort((a, b) => a.idx - b.idx).map(p => [p.lon, p.lat]);
          if (coords.length > 0) {
            const first = coords[0]; const last = coords[coords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) { coords.push([first[0], first[1]]); }
          }
          groupedCoords[area] = coords;
        });
        setWardPolygons(groupedCoords); setWardDetailsMap(detailsMap);
      } else {
        console.warn("Context: 'WardData' is missing or not an array.");
        setWardPolygons({});
        setWardDetailsMap({});
      }
    }
  }, [data, loading]);
  const clearManholeSelection = useCallback(() => { setSelectedManholeLocation(null); }, []);


  const handleDivisionChange = useCallback((divisionValue) => {
    clearManholeSelection();
    setSelectedDivision(divisionValue);
    setSelectedAreaName("All");
    setSelectedZone("All");
    let areas = [];
    if (divisionValue !== "All" && allManholeData.length > 0) {
      const divisionData = allManholeData.filter(row => row.division === divisionValue); // lowercase
      if (divisionData.length > 0) {
        areas = [...new Set(divisionData.map(row => row.section))].filter(Boolean).sort(); // lowercase
      }
    }
    setAreaNameList(["All", ...areas]);
    setZoneList([]);
  }, [allManholeData, clearManholeSelection]);


  const handleAreaNameChange = useCallback((areaValue) => {
    clearManholeSelection();
    setSelectedAreaName(areaValue);
    setSelectedZone("All");
    let zones = [];
    if (selectedDivision !== "All" && areaValue !== "All" && allManholeData.length > 0) {
      const areaData = allManholeData.filter(row =>
        row.division === selectedDivision && row.section === areaValue // lowercase
      );
      if (areaData.length > 0) {
        zones = [...new Set(areaData.map(row => row.zone))].filter(Boolean).sort(); // lowercase
      }
    }
    setZoneList(["All", ...zones]);
  }, [selectedDivision, allManholeData, clearManholeSelection]);

  const handleZoneChange = useCallback((zoneValue) => {
    clearManholeSelection();
    setSelectedZone(zoneValue);
  }, [clearManholeSelection]);
  // --- Modified handleStyleChange ---
  const handleStyleChange = (newStyleUrl) => {
    if (newStyleUrl !== mapStyle) {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        centerToRestoreRef.current = center;
        zoomToRestoreRef.current = zoom;
        // console.log(">>> PARENT: Storing view before style change:", { center, zoom });
      } else {
        console.warn(">>> PARENT: Map ref not set, cannot store view state.");
        centerToRestoreRef.current = null; zoomToRestoreRef.current = null;
      }
      setMapStyle(newStyleUrl);
    }
  };
  // --- Other UI Handlers ---
  const handleJumpToLocation = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) {
      setFlyToLocation({ center: [lon, lat], zoom: 18 });
    } else {
      alert("Please enter valid numeric latitude and longitude values.");
    }
  };

  const handleReset = () => {
    if (selectedAreaName && selectedAreaName !== "All" && Object.keys(wardPolygons).length > 0) {
      const normalized = String(selectedAreaName).trim().toLowerCase();
      const matchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);
      if (matchKey) {
        const coords = wardPolygons[matchKey];
        if (Array.isArray(coords) && coords.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          let validCoordsFound = false;
          coords.forEach(c => {
            if (Array.isArray(c) && c.length === 2 && typeof c[0] === 'number' && !isNaN(c[0]) && typeof c[1] === 'number' && !isNaN(c[1])) {
              bounds.extend(c);
              validCoordsFound = true;
            }
          });
          if (validCoordsFound) {
            setFlyToLocation({ bounds: bounds, padding: 40 });
            return;
          }
        }
      }
    }
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
    if (allManholeData.length === 0) { setFilteredManholeGeoJSON(emptyGeoJSON); return; }
    if (selectedDivision === "All" || selectedAreaName === "All") { setFilteredManholeGeoJSON(emptyGeoJSON); return; }
    let filtered = allManholeData.filter((row) => {
      const matchesHierarchy = (row.division === selectedDivision && row.section === selectedAreaName); // lowercase
      if (!matchesHierarchy) return false;
      if (selectedZone !== "All" && row.zone !== selectedZone) { return false; } // lowercase
      return true;
    });
    setFilteredManholeGeoJSON(generateManholeGeoJSON(filtered));
  }, [selectedDivision, selectedAreaName, selectedZone, allManholeData, generateManholeGeoJSON]);

  // --- EFFECT TO PREPARE WARD POLYGON & TRIGGER ZOOM ---
  useEffect(() => {
    if (Object.keys(wardPolygons).length === 0) { return; }
    if (!selectedAreaName || selectedAreaName === "All") {
      setActiveWardGeoJSON(null);
      return;
    }
    const normalized = String(selectedAreaName).trim().toLowerCase();
    const matchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);
    if (!matchKey) { console.warn("No polygon found for area:", selectedAreaName); setActiveWardGeoJSON(null); return; }
    const coords = wardPolygons[matchKey];
    if (!Array.isArray(coords) || coords.length < 4) { console.warn("Insufficient coords for polygon:", matchKey, coords); setActiveWardGeoJSON(null); return; }
    const geojson = { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: { name: matchKey } };
    setActiveWardGeoJSON(geojson);
    try {
      const bounds = new mapboxgl.LngLatBounds();
      let validCoordsFound = false;
      coords.forEach((c, index) => {
        if (Array.isArray(c) && c.length === 2 && typeof c[0] === 'number' && !isNaN(c[0]) && typeof c[1] === 'number' && !isNaN(c[1])) {
          bounds.extend(c);
          validCoordsFound = true;
        } else {
          console.warn(`Invalid coordinate pair at index ${index} for ward "${selectedAreaName}":`, c);
        }
      });
      if (validCoordsFound) {
        setFlyToLocation({ bounds: bounds, padding: 40 });
      } else {
        console.warn("❌ No valid coordinates found for ward:", selectedAreaName, " Skipping zoom.");
      }
    } catch (error) {
      console.error("Error creating or extending bounds:", error);
      setActiveWardGeoJSON(null);
    }
  }, [selectedAreaName, wardPolygons]);

  // --- DERIVED STATE FOR POPUPS ---
  const alertData = useMemo(() => {
    if (!selectedAreaName || selectedAreaName === "All" || allManholeData.length === 0) { return []; }
    const wardManholes = allManholeData.filter((mh) => mh?.area_name || mh.section === selectedAreaName && mh.division === selectedDivision); // lowercase
    const dangerManholes = wardManholes.filter((mh) => getManholeStatus(mh.last_operation_date) === 'danger');
    const groupedByZone = dangerManholes.reduce((acc, mh) => {
      const zone = mh.zone || 'Unknown Zone'; // lowercase
      if (!acc[zone]) { acc[zone] = []; }
      acc[zone].push({ id: mh.id || 'N/A', location: `${mh.latitude || 'N/A'}, ${mh.longitude || 'N/A'}`, status: 'Danger' });
      return acc;
    }, {});
    const formattedAlertData = Object.entries(groupedByZone)
      .map(([zoneName, alerts]) => ({ zoneName, alerts }))
      .sort((a, b) => a.zoneName.localeCompare(b.zoneName));
    return formattedAlertData;
  }, [selectedAreaName, selectedDivision, allManholeData]);

  const selectedWardForPopup = useMemo(() => {
    const normalized = selectedAreaName && selectedAreaName !== "All" ? String(selectedAreaName).trim().toLowerCase() : null;
    if (!normalized || Object.keys(wardPolygons).length === 0 || Object.keys(wardDetailsMap).length === 0) {
      return null;
    }
    const finalMatchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);
    return finalMatchKey ? wardDetailsMap[finalMatchKey] : null;
  }, [selectedAreaName, wardPolygons, wardDetailsMap]);

  // --- RENDER ---
  return (
    <div className=" w-full flex flex-row max-w-[2400px] gap-1">
      {/* --- Left section --- */}
      <div className="shadow-md shadow-gray-300 p-6 mb-4 rounded-xl bg-white w-full max-w-[70%]">
        {/* Top Controls */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <p className="font-semibold text-md">Interactive Hotspot Manhole Map</p>
          <div className="flex justify-center items-center gap-4 ml-auto">
            {["all", "safe", "warning", "danger"].map((f) => (<button key={f} onClick={() => setFilter(f)} style={{ paddingBlock: "5px", borderRadius: "5px" }} className={`${filter === f ? "btn-blue" : "btn-blue-outline"} text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}> {f === "all" ? "All Locations" : f.charAt(0).toUpperCase() + f.slice(1)} </button>))}
          </div>
        </div>
        {/* Bottom Controls */}
        <div className="mt-4 flex flex-col justify-start gap-4 pb-3">
          <div className="flex items-center gap-5 text-sm"> <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe</span> <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning</span> <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger</span> </div>
          <div className="flex gap-3 justify-start items-center flex-wrap">
            <input type="number" placeholder="Latitude.." value={latInput} onChange={(e) => setLatInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
            <input type="number" placeholder="Longitude.." value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
            <button onClick={handleJumpToLocation} className="btn-blue btn-hover text-sm ml-3" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Go</button>
            <select value={selectedDivision} onChange={(event) => handleDivisionChange(event.target.value)} className="hover:shadow-md border cursor-pointer border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"> <option value="All">Select Division</option> {divisionList.filter(d => d !== "All").map((division, idx) => (<option key={idx} value={division}>{division}</option>))} </select>
            <select value={selectedAreaName} onChange={(event) => handleAreaNameChange(event.target.value)} disabled={selectedDivision === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"> <option value="All">Select Ward</option> {areaNameList.filter(a => a !== "All").map((area, idx) => (<option key={idx} value={area}>{area}</option>))} </select>
            <select value={selectedZone} onChange={(event) => handleZoneChange(event.target.value)} disabled={selectedAreaName === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[160px]"> <option value="All">Select Zone</option> {zoneList.filter(z => z !== "All").map((zone, idx) => (<option key={idx} value={zone}>{zone}</option>))} </select>
          </div>
        </div>
        {/* --- Map Container --- */}
        <div className="map-box relative rounded-lg overflow-hidden border border-gray-300" style={{ height: "445.52px", opacity: 1 }}>
          <button onClick={handleReset} className=" bg-[#eee] font-extralight  border  absolute right-4 top-2 z-[500] rounded-md px-1.5 py-1 text-xs h-8 hover:bg-[#fff] border-gray-300 cursor-pointer  "> <LocateFixed className="font-extralight w-8.5 opacity-80" /> </button>
          <div className="absolute right-2 top-10 z-[500] group mt-3">
            <button className=" bg-[#eee] font-extralight  border cursor-pointer border-gray-300 shadow-md rounded-md w-12 h-7 mr-2 flex items-center justify-center hover:bg-[#fff] transition duration-300 opacity-80"> <Map /> </button>
            <div className="absolute top-full mt-1 left--4 grid grid-rows-3 gap-1 w-13.5 rounded-md overflow-hidden transform scale-y-0 opacity-0 origin-top transition-all duration-200 group-hover:scale-y-100 group-hover:opacity-100">
              {mapStyles.map((style) => (<button key={style.url} onClick={() => handleStyleChange(style.url)} className={` w-12 h-12 border-2 rounded-md overflow-hidden transition-all duration-150 cursor-pointer ${mapStyle === style.url ? "border-blue-500" : "border-transparent hover:border-gray-400"}`}> <img src={style.img} alt={style.url} className="w-full h-full object-cover" /> </button>))}
            </div>
          </div>
          {/* --- CORE MAP COMPONENT --- */}
          <MapboxCore
            mapRef={mapRef}
            centerToRestore={centerToRestoreRef}
            zoomToRestore={zoomToRestoreRef}
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
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">Loading map...</div>}
          {error && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 "> {error}</div>}
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
      <div className="db-popup-container ml-4 h-[633px] shadow-gray-300 shadow-md border border-gray-200 w-full max-w-[30%] overflow-y-auto overflow-x-hidden bg-white rounded-xl ">
        {selectedManholeLocation ? (
          <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
            <ManholePopUp selectedLocation={selectedManholeLocation} onClose={handleClosePopup} onGenerateReport={handleGenerateReport} onAssignBot={handleAssignBot} />
          </div>
        ) : selectedWardForPopup ? (
          <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
            <WardDetailsPopUp wardData={selectedWardForPopup} alertData={alertData} onManholeSelect={handleAlertManholeClick} onClose={() => setSelectedAreaName("All")} setSelectedWard={setSelectedAreaName} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center place-items-center text-gray-400 p-4 text-center"> <p className="flex flex-col items-center justify-center"> <MapPin className=" w-18 h-18 mb-2 text-gray-300 " /> Select a Manhole on the map to view details. </p> </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;