// ./MapComponent.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  // const [isMapLoaded, setIsMapLoaded] = useState(false); // <-- REMOVED

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

  // --- HELPER FUNCTIONS (Unchanged) ---
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
        const [day, month, year] = parts;
        lastCleaned = new Date(`${year}-${month}-${day}`);
      }
    }
    if (!lastCleaned || isNaN(lastCleaned.getTime())) {
      console.error("Invalid date:", operationdates);
      return "safe";
    }
    const today = new Date();
    const diffTime = today - lastCleaned;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 20) return "danger";
    if (diffDays >= 10) return "warning";
    return "safe";
  };

  const formatExcelDate = useCallback((value) => {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    if (typeof value === "number") {
      const utc_days = Math.floor(value - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toLocaleDateString("en-GB");
    }
    return "Invalid Date";
  }, []);

  const generateManholeGeoJSON = useCallback((data) => ({
    type: "FeatureCollection",
    features: data.map((row) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [row.longitude, row.latitude],
      },
      properties: {
        ...row,
        status: getManholeStatus(row.last_operation_date),
      },
      id: row.id,
    })),
  }), []); // `getManholeStatus` is stable

  // --- DATA LOADING (Unchanged) ---
  const initialLoadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/datafiles/CSVs/MH.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const manholeRows = XLSX.utils.sheet_to_json(sheet);

      setAllManholeData(manholeRows);
      const uniqueDivisions = [...new Set(manholeRows.map((row) => row.Division))].filter(Boolean).sort();
      setDivisionList(["All", ...uniqueDivisions]);
      setIsLoading(false);
    } catch (e) {
      setError(e.message);
      setIsLoading(false);
      console.error("Error loading manhole data:", e);
    }
  }, []);

  useEffect(() => {
    fetch("/datafiles/CSVs/ward_coordinates.xlsx")
      .then(res => res.arrayBuffer())
      .then(ab => {
        // ... (Same parsing logic as before) ...
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
          if (lonVal != null && latVal != null) {
            const idx = (row.vertex_index ?? row.vertex ?? row.index ?? null);
            if (!groupedCoords[area]) groupedCoords[area] = [];
            groupedCoords[area].push({
              lon: Number(lonVal),
              lat: Number(latVal),
              idx: (idx !== null && !isNaN(Number(idx))) ? Number(idx) : groupedCoords[area].length
            });
          }
          if (!uniqueAreaNames.has(area)) {
            detailsMap[area] = { Area_name: area, ...row };
            delete detailsMap[area].longitude;
            delete detailsMap[area].latitude;
            delete detailsMap[area].lon;
            delete detailsMap[area].lat;
            delete detailsMap[area].x;
            delete detailsMap[area].y;
            delete detailsMap[area].vertex_index;
            delete detailsMap[area].vertex;
            delete detailsMap[area].index;
            uniqueAreaNames.add(area);
          }
        });
        Object.keys(groupedCoords).forEach(area => {
          const coords = groupedCoords[area]
            .sort((a, b) => a.idx - b.idx)
            .map(p => [p.lon, p.lat]);
          if (coords.length > 0) {
            const first = coords[0];
            const last = coords[coords.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
              coords.push([first[0], first[1]]);
            }
          }
          groupedCoords[area] = coords;
        });

        setWardPolygons(groupedCoords);
        setWardDetailsMap(detailsMap);
      })
      .catch(err => console.error("Error loading combined ward data:", err));
  }, []);

  useEffect(() => {
    initialLoadData();
  }, [initialLoadData]);

  useEffect(() => {
    const dailyTimer = setInterval(initialLoadData, 1000 * 60 * 60 * 24);
    return () => clearInterval(dailyTimer);
  }, [initialLoadData]);

  // --- HIERARCHY HANDLERS ---
  const clearManholeSelection = useCallback(() => {
    setSelectedManholeLocation(null);
  }, []);

  const handleDivisionChange = (divisionValue) => {
    clearManholeSelection();
    setSelectedDivision(divisionValue);
    setSelectedAreaName("All");
    setSelectedZone("All");
    let areas = [];
    if (divisionValue !== "All") {
      const divisionData = allManholeData.filter(row => row.Division === divisionValue);
      areas = [...new Set(divisionData.map(row => row.Area_name))].filter(Boolean).sort();
    }
    setAreaNameList(["All", ...areas]);
    setZoneList([]);
  };

  const handleAreaNameChange = (areaValue) => {

    clearManholeSelection();
    setSelectedAreaName(areaValue);
    setSelectedZone("All");
    let zones = [];
    if (selectedDivision !== "All" && areaValue !== "All") {
      const areaData = allManholeData.filter(row =>
        row.Division === selectedDivision &&
        row.Area_name === areaValue
      );
      zones = [...new Set(areaData.map(row => row.Zone))].filter(Boolean).sort();
      setZoneList(["All", ...zones]);
    } else {
      setZoneList([]);
    }
  };

  const handleZoneChange = (zoneValue) => {
    clearManholeSelection();
    setSelectedZone(zoneValue);
  };

  const handleStyleChange = (newStyleUrl) => {
    if (newStyleUrl !== mapStyle) {
      setMapStyle(newStyleUrl);
    }
  };

  const handleJumpToLocation = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) {
      setFlyToLocation({ center: [lon, lat], zoom: 18 });
    }
  };

  const alertData = useMemo(() => {
    // Only calculate if a specific ward is selected and data is loaded
    if (!selectedAreaName || selectedAreaName === "All" || allManholeData.length === 0) {
      return []; // Return empty array if no ward selected or no data
    }

    // 1. Filter manholes for the selected ward
    const wardManholes = allManholeData.filter(
      (mh) => mh.Area_name === selectedAreaName && mh.Division === selectedDivision // Ensure division matches too
    );

    // 2. Filter for 'danger' status
    const dangerManholes = wardManholes.filter(
      (mh) => getManholeStatus(mh.last_operation_date) === 'danger'
    );

    // 3. Group by Zone
    const groupedByZone = dangerManholes.reduce((acc, mh) => {
      const zone = mh.Zone || 'Unknown Zone'; // Handle cases where Zone might be missing
      if (!acc[zone]) {
        acc[zone] = [];
      }
      acc[zone].push({
        id: mh.id || 'N/A',
        // Format location as "latitude, longitude"
        location: `${mh.latitude || 'N/A'}, ${mh.longitude || 'N/A'}`,
        status: 'Danger', // We already filtered for danger
      });
      return acc;
    }, {}); // Start with an empty object

    // 4. Transform into the desired array format [{ zoneName: '...', alerts: [...] }, ...]
    const formattedAlertData = Object.entries(groupedByZone)
      .map(([zoneName, alerts]) => ({
        zoneName,
        alerts,
      }))
      .sort((a, b) => a.zoneName.localeCompare(b.zoneName)); // Optional: Sort zones alphabetically

    return formattedAlertData;

  }, [selectedAreaName, selectedDivision, allManholeData]);


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
          coords.forEach(c => bounds.extend(c));
          setFlyToLocation({ bounds: bounds, padding: 40 });

          return; // Stop here, don't reset to default view
        }
      }
    }

    setFlyToLocation({ center: [78.4794, 17.3940], zoom: 9.40 });


  };
  const handleClosePopup = () => clearManholeSelection();
  const handleGenerateReport = () => { clearManholeSelection(); };
  const handleAssignBot = () => { clearManholeSelection(); };

  // --- MAP CALLBACK HANDLERS ---
  const handleManholeClick = useCallback((feature) => {
    setSelectedManholeLocation({
      ...feature.properties,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      lastCleaned: feature.properties.last_operation_date,
    });
    setFlyToLocation({ center: feature.geometry.coordinates, zoom: 18 });
  }, []);

  const handleManholeDeselect = useCallback(() => {
    clearManholeSelection();
  }, [clearManholeSelection]);
  // ./MapComponent.js

  // ./MapComponent.js

  const handleAlertManholeClick = useCallback((manholeId) => {
    // Find the raw manhole data
    const manholeData = allManholeData.find(mh => mh.id === manholeId);

    if (manholeData) {
      console.log("Clicked alert for manhole (raw):", manholeData);

      // Convert coordinates to numbers
      const lat = parseFloat(manholeData.latitude);
      const lon = parseFloat(manholeData.longitude);

      // --- >>> CALCULATE STATUS HERE <<< ---
      const manholeStatus = getManholeStatus(manholeData.last_operation_date);
      // --- >>> END CALCULATION <<< ---

      // Set the state for the popup
      setSelectedManholeLocation({
        ...manholeData, // Include all original data
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lon) ? null : lon,
        lastCleaned: manholeData.last_operation_date,
        // --- >>> ADD STATUS TO THE OBJECT <<< ---
        status: manholeStatus, // Ensure this line exists and uses the calculated status
        // --- >>> END ADD STATUS <<< ---
      });

      // Fly the map
      if (!isNaN(lon) && !isNaN(lat)) {
        setFlyToLocation({ center: [lon, lat], zoom: 18 });
      } else {
        console.warn("Invalid coordinates for flying:", manholeData.longitude, manholeData.latitude);
      }

    } else {
      console.warn("Manhole data not found for ID:", manholeId);
    }
    // Dependency array is correct assuming getManholeStatus is stable
  }, [allManholeData]);
  // --- EFFECT TO FILTER MANHOLES ---
  useEffect(() => {
    // Guard: Wait for data
    if (allManholeData.length === 0) {
      setFilteredManholeGeoJSON(emptyGeoJSON);
      return;
    }

    if (selectedDivision === "All" || selectedAreaName === "All") {
      setFilteredManholeGeoJSON(emptyGeoJSON);
      return;
    }

    let filtered = allManholeData.filter((row) => {
      const matchesHierarchy = (
        row.Division === selectedDivision &&
        row.Area_name === selectedAreaName
      );
      if (!matchesHierarchy) return false;
      if (selectedZone !== "All" && row.Zone !== selectedZone) {
        return false;
      }
      return true;
    });

    setFilteredManholeGeoJSON(generateManholeGeoJSON(filtered));

  }, [selectedDivision, selectedAreaName, selectedZone, allManholeData, generateManholeGeoJSON]); // `isMapLoaded` removed


  // --- EFFECT TO DRAW WARD POLYGON & ZOOM ---
  useEffect(() => {
    // Guard: Wait for polygon data
    if (Object.keys(wardPolygons).length === 0) {
      return;
    }

    clearManholeSelection();

    if (!selectedAreaName || selectedAreaName === "All") {
      setActiveWardGeoJSON(null);
      return;
    }

    const normalized = String(selectedAreaName).trim().toLowerCase();
    const matchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);

    if (!matchKey) {
      console.warn("No polygon found for area:", selectedAreaName);
      setActiveWardGeoJSON(null);
      return;
    }

    const coords = wardPolygons[matchKey];


    if (!Array.isArray(coords) || coords.length < 4) {
      console.warn("Insufficient coords for polygon:", matchKey, coords);
      setActiveWardGeoJSON(null);
      return;
    }

    const geojson = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] },
      properties: { name: matchKey }
    };
    setActiveWardGeoJSON(geojson);

    const bounds = new mapboxgl.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    setFlyToLocation({ bounds: bounds, padding: 40 });

  }, [selectedAreaName, wardPolygons, clearManholeSelection]); // `isMapLoaded` removed


  // --- DERIVED STATE (Unchanged) ---
  const normalized = selectedAreaName && selectedAreaName !== "All" ? String(selectedAreaName).trim().toLowerCase() : null;
  const finalMatchKey = normalized ? Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized) : null;
  const selectedWardForPopup = finalMatchKey ? wardDetailsMap[finalMatchKey] : null;

  // --- RENDER (Unchanged, but <MapboxCore> props are simplified) ---
  return (
    <div className=" w-full flex flex-row max-w-[2400px] gap-1">

      {/* --- Left section --- */}
      <div className="shadow-md shadow-gray-300 p-6 mb-4 rounded-xl bg-white w-full max-w-[70%]">

        {/* Top Controls */}
        <div className="flex justify-between align-middle flex-wrap gap-2">
          <p className="font-semibold text-md">Interactive Hotspot Manhole Map</p>
          <div className="flex justify-center align-middle gap-4 ml-auto">
            {["all", "safe", "warning", "danger"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ paddingBlock: "5px", borderRadius: "5px" }}
                className={`${filter === f ? "btn-blue" : "btn-blue-outline"} text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}
              >
                {f === "all" ? "All Locations" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="mt-4 flex flex-col justify-start align-middle gap-4 pb-3">
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe</span>
            <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning</span>
            <span className="flex items-center gap-1 space-x-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger</span>
          </div>
          <div className="flex gap-3 justify-start align-middle flex-wrap">
            <input type="number" placeholder="Latitude.." value={latInput} onChange={(e) => setLatInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
            <input type="number" placeholder="Longitude.." value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]" />
            <button onClick={handleJumpToLocation} className="btn-blue btn-hover text-sm ml-3" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Go</button>

            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"
            >
              <option value="All">Select Division</option>
              {divisionList.filter(d => d !== "All").map((division, idx) => (
                <option key={idx} value={division}>{division}</option>
              ))}
            </select>

            <select
              value={selectedAreaName}
              onChange={(e) => handleAreaNameChange(e.target.value)}
              disabled={selectedDivision === "All"}
              className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"
            >
              <option value="All">Select Ward</option>
              {areaNameList.filter(a => a !== "All").map((area, idx) => (
                <option key={idx} value={area}>{area}</option>
              ))}
            </select>

            <select
              value={selectedZone}
              onChange={(e) => handleZoneChange(e.target.value)}
              disabled={selectedAreaName === "All"}
              className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[160px]"
            >
              <option value="All">Select Zone</option>
              {zoneList.filter(z => z !== "All").map((zone, idx) => (
                <option key={idx} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Map Container --- */}
        <div
          className="map-box relative rounded-lg overflow-hidden border border-gray-300"
          style={{ height: "445.52px", opacity: 1 }}
        >
          <button onClick={handleReset} className=" bg-[#eee] absolute right-4.5 top-2 z-[500] rounded px-1.5 py-1 text-xs h-8 border-gray-400 cursor-pointer hover:bg-[#fff]">
            <LocateFixed className="font-light w-8.5" />
          </button>

          <div className="absolute right-2 top-10 z-[500] group mt-3">
            <button className=" bg-[#eee] border cursor-pointer border-gray-300 shadow-md rounded-md w-12  h-7   mr-2 flex items-center justify-center hover:bg-gray-100 transition duration-300">
              <Map />
            </button>
            <div className="absolute top-full mt-1 left--4 grid grid-row-2 gap-1 w-13.5  rounded-md overflow-hidden transform scale-y-0 opacity-0 origin-top transition-all duration-200 group-hover:scale-y-100 group-hover:opacity-100 ">
              {mapStyles.map((style) => (
                <button
                  key={style.url}
                  onClick={() => handleStyleChange(style.url)}
                  className={` w-12 h-12 border-2 rounded-md overflow-hidden transition-all duration-150 cursor-pointer ${mapStyle === style.url
                    ? "border-blue-500"
                    : "border-transparent hover:border-gray-400"
                    }`}
                >
                  <img
                    src={style.img}
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* --- CORE MAP COMPONENT (PROPS CHANGED) --- */}
          <MapboxCore
            styleUrl={mapStyle}
            manholeGeoJSON={filteredManholeGeoJSON}
            wardGeoJSON={activeWardGeoJSON}
            statusFilter={filter}
            selectedManholeId={selectedManholeLocation ? selectedManholeLocation.id : null}
            flyToLocation={flyToLocation}
            formatExcelDate={formatExcelDate}
            onManholeClick={handleManholeClick}
            onManholeDeselect={handleManholeDeselect}
          // onMapLoad and onStyleLoad props are now REMOVED
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
          </div>
        </div>
      </div>

      {/* --- Right section (Unchanged) --- */}
      <div
        className="db-popup-container ml-4   h-[633px]  shadow-gray-300 shadow-md  border-gray-300   w-full max-w-[30%]  overflow-y-auto overflow-x-hidden bg-white rounded-xl "

      >
        {selectedManholeLocation ? (
          <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
            <ManholePopUp
              selectedLocation={selectedManholeLocation}
              onClose={handleClosePopup}
              onGenerateReport={handleGenerateReport}
              onAssignBot={handleAssignBot}
            />
          </div>
        ) : selectedWardForPopup ? (
          <div className="dB-Popup max-w-full flex justify-start h-full place-items-start transition-all duration-300">
            <WardDetailsPopUp
              wardData={selectedWardForPopup}
              alertData={alertData}
              onManholeSelect={handleAlertManholeClick}
              onClose={() => setSelectedAreaName("All")}
              selectedWard={selectedWardForPopup}
              setSelectedWard={setSelectedAreaName}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center place-items-center text-gray-400 p-4 text-center">

            <p className="place-items-center">
              <MapPin className=" w-15 h-15 mb-4 " />
              Select a  Manhole on the map to view details.

            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;