import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed, Map, MapPin } from 'lucide-react';
import { useServerData } from "../../context/ServerDataContext";
import MapboxCore from "./MapboxCore";
import ManholePopUp from "./ManholePopUp";
import WardDetailsPopUp from "./WardDetailsPopUp";


const mapStyles = [
  { url: "mapbox://styles/shubhamgv/cmiofroih003501sm90m2hn06", img: "/images/street.png", name: "Street" },
  { url: "mapbox://styles/shubhamgv/cmiof1gt5003c01s43hud0zmd", img: "/images/Satilight.png", name: "Satellite" },
  { url: "mapbox://styles/shubhamgv/cmiof9l0900o201sc3mdc6tsc", img: "/images/diameter.png", name: "Diameter" },
];

const emptyGeoJSON = { type: "FeatureCollection", features: [] };

const MapComponent = () => {
  // --- State Management ---
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
  const { data, message: error } = useServerData();
  const [latestRobotCleanings, setLatestRobotCleanings] = useState({});
  const [buildingData, setBuildingData] = useState(null);
  const [searchId, setSearchId] = useState("");
  // const [dropdown, setdropdown] = useState({});
  // --- Refs ---
  const centerToRestoreRef = useRef(null);
  const zoomToRestoreRef = useRef(null);
  const mapRef = useRef(null);

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  };


  // ... inside MapComponent component ...

  // --- Add this new State ---


  // --- Add this Search Handler ---
  // 👇 ADD THIS FUNCTION 👇
  const handleSearchManhole = () => {
    if (!searchId.trim()) return;
    const targetId = searchId.trim().toLowerCase();

    // 1. Find the Manhole in the data
    const foundManhole = allManholeData.find((mh) => {
      const id1 = String(mh.id || "").toLowerCase();
      const id2 = String(mh.sw_mh_id || "").toLowerCase();
      const id3 = String(mh.manhole_id || "").toLowerCase();
      return id1.includes(targetId) || id2.includes(targetId) || id3.includes(targetId);
    });

    if (foundManhole) {
      const date = getManholeDateById(foundManhole.id);

      // 2. ISOLATE THE DOT (Crucial Step)
      // We generate a GeoJSON containing ONLY this specific manhole.
      // This hides all other dots on the map.
      const singleManholeFeature = generateManholeGeoJSON([foundManhole], latestRobotCleanings);
      setFilteredManholeGeoJSON(singleManholeFeature);

      // 3. OPEN SIDE DIALOG (Popup)
      // This ensures the details panel on the right opens immediately.
      setSelectedManholeLocation({
        ...foundManhole,
        lastCleaned: date,
        status: getManholeStatus(date)
      });

      // 4. ZOOM TO LOCATION
      const lat = parseFloat(foundManhole.latitude);
      const lon = parseFloat(foundManhole.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        setFlyToLocation({ center: [lon, lat], zoom: 18 });
      }

      // 5. Unset Filters to avoid interference
      // We visually reset the dropdowns so the user knows they are viewing a specific search result,
      // not a whole ward.
      setSelectedDivision("All");
      setSelectedAreaName("All");
      setSelectedZone("All");

    } else {
      alert("Manhole ID not found!");
    }
  };






  const getDisplayName = (rawName) => {
    if (typeof rawName !== 'string') return rawName;
    const match = rawName.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const textInside = match[1];
      if (/[a-zA-Z]/.test(textInside)) {
        return textInside.trim();
      } else {
        return rawName.split('(')[0].trim();
      }
    }
    return rawName.trim();
  };

  const getManholeStatus = useCallback((operationdates) => {
    if (!operationdates) return "safe"; // Default to Safe (Green) if no date

    let lastCleaned;
    if (typeof operationdates === "string") {
      if (operationdates.includes("T")) {
        lastCleaned = new Date(operationdates);
      } else {
        const cleanedDateString = operationdates.replace(' ', 'T');
        lastCleaned = new Date(cleanedDateString);
      }
    } else if (typeof operationdates === "number") {
      lastCleaned = excelDateToJSDate(operationdates);
    }

    if (!lastCleaned || isNaN(lastCleaned.getTime())) return "safe";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCleaned.setHours(0, 0, 0, 0);
    const diffTime = today - lastCleaned;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 40) return "danger";
    if (diffDays >= 40) return "warning";
    return "safe";
  }, []);

  const formatExcelDate = useCallback((value) => {
    if (!value) return "N/A";
    let date_info;

    // Handle "2025-10-28T15:32:17" (ISO String from your data)
    if (typeof value === "string") {
      if (value.includes("T")) {
        date_info = new Date(value);
      } else {
        // Fallback for Excel strings
        const cleanedDateString = value.replace(' ', 'T').replace(/\.\d+/, '').replace(/\+.*$/, '');
        date_info = new Date(cleanedDateString);
        if (isNaN(date_info.getTime())) {
          const datePart = value.split(' ')[0];
          const parts = datePart.split(/[-]/);
          if (parts.length === 3) {
            date_info = new Date(parts[2], parts[1] - 1, parts[0]);
          }
        }
      }
    } else if (typeof value === "number") {
      date_info = excelDateToJSDate(value);
    }

    if (date_info && !isNaN(date_info.getTime())) {
      return date_info.toLocaleDateString("en-GB");
    }
    return "Invalid Date";
  }, []);

  const extractValue = (row, ...keys) => {
    if (!row) return null;
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null) {
        return row[key];
      }
    }
    return null;
  };

  // --- DATA PROCESSING EFFECT ---
  useEffect(() => {
    if (data) {
      if (data.ManholeData && Array.isArray(data.ManholeData)) {
        const processedManholes = data.ManholeData.map(row => {
          const divisionRaw = extractValue(row, "division", "sw_mh_division_no");
          const sectionRaw = extractValue(row, "section", "section_name");
          const zoneRaw = extractValue(row, "zone", "sw_mh_docket_no", "sw_mh_hydralic_zone");
          const latRaw = extractValue(row, "latitude", "lat", "Latitude", "Lat", "y", "Y");
          const lonRaw = extractValue(row, "longitude", "lon", "Longitude", "Lon", "x", "X");
          const lastOpDateRaw = extractValue(row, "last_operation_date", "last_operation", "operation_date", "last_operation_date_string", "timestamp");
          const idRaw = extractValue(row, "id", "ID", "Id", "sw_mh_id", "manhole_id") ?? row.id;

          return {
            ...row,
            division: divisionRaw ? String(divisionRaw).trim() : null,
            section: sectionRaw ? String(sectionRaw).trim() : null,
            zone: zoneRaw ? String(zoneRaw).trim() : null,
            last_operation_date: lastOpDateRaw ?? null,

            id: String(idRaw).trim(),
            latitude: Number(latRaw),
            longitude: Number(lonRaw),
          };
        });

        setAllManholeData(processedManholes);
        let uniqueDivisions = [...new Set(processedManholes.map((row) => row.division))].filter(Boolean).sort();
        if (uniqueDivisions.length > 0) {
          const first = uniqueDivisions.shift();
          if (first) uniqueDivisions.push(first);
        }
        setDivisionList(["All", ...uniqueDivisions]);
      } else {
        setAllManholeData([]);
        setDivisionList(["All"]);
      }

      if (data.WardData && Array.isArray(data.WardData)) {
        const allRows = data.WardData;
        const groupedCoords = {};
        const detailsMap = {};
        const uniqueAreaNames = new Set();
        allRows.forEach(row => {
          const areaRaw = extractValue(row, "area_name", "section", "area", "area Name", "area_name", "section", "section_name");
          if (!areaRaw) return;
          const area = String(areaRaw).trim();
          const lonVal = extractValue(row, "longitude", "Longitude", "lon", "x", "X");
          const latVal = extractValue(row, "latitude", "Latitude", "lat", "y", "Y");
          const lonNum = Number(lonVal);
          const latNum = Number(latVal);
          if (!isNaN(lonNum) && !isNaN(latNum)) {
            const idx = (row.vertex_index ?? row.vertex ?? row.index ?? null);
            if (!groupedCoords[area]) groupedCoords[area] = [];
            groupedCoords[area].push({ lon: lonNum, lat: latNum, idx: (idx !== null && !isNaN(Number(idx))) ? Number(idx) : groupedCoords[area].length });
          }
          if (!uniqueAreaNames.has(area)) {
            detailsMap[area] = { area_name: area, ...row };
            delete detailsMap[area].longitude; delete detailsMap[area].latitude;
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
        setWardPolygons({}); setWardDetailsMap({});
      }
    }
  }, [data]);


  // --- ROBOT DATA PROCESSING (Direct Match: manhole_id === sw_mh_id) ---
  // --- ROBOT DATA PROCESSING (Final "Universal" Matcher) ---
  useEffect(() => {
    const rawRobotList = data?.table_data || data?.somajiguda_operations || data?.RobotsData || data?.RobotData;

    if (Array.isArray(rawRobotList) && allManholeData.length > 0) {


      // 1. Prepare Map Index (Store both IDs and Location)
      const mapManholeIndex = allManholeData.map(mh => ({
        // Try to get the string ID from any likely field
        id: String(mh.sw_mh_id || mh.manhole_id || mh.id || "").trim().toLowerCase(),
        lat: Number(mh.latitude),
        lon: Number(mh.longitude),
        rawId: String(mh.id) // The ID used by the map to color dots
      }));

      // 2. Helper: Find by Location (Radius ~55 meters)
      const findMapIdByCoordinates = (robotLat, robotLon) => {
        let nearestId = null;
        let minDistance = Infinity;

        mapManholeIndex.forEach(mh => {
          const distSq = Math.pow(mh.lat - robotLat, 2) + Math.pow(mh.lon - robotLon, 2);
          if (distSq < minDistance) {
            minDistance = distSq;
            nearestId = mh.rawId;
          }
        });
        // 0.0005 is approx 55 meters
        return minDistance < 0.0005 ? nearestId : null;
      };

      // 3. Process Robot Data
      const processedMap = rawRobotList.reduce((acc, row) => {
        const timeStamp = row.timestamp;
        if (!timeStamp) return acc;

        const rLat = Number(row.latitude);
        const rLon = Number(row.longitude);
        const rId = String(row.manhole_id || "").trim().toLowerCase();

        let targetMapId = null;

        // STRATEGY A: ID Match
        const idMatch = mapManholeIndex.find(m => m.id === rId);
        if (idMatch) {
          targetMapId = idMatch.rawId;
        }
        // STRATEGY B: Location Match (Fallback)
        else if (!isNaN(rLat) && !isNaN(rLon)) {
          targetMapId = findMapIdByCoordinates(rLat, rLon);
        }

        if (targetMapId) {
          const existing = acc[targetMapId];
          if (!existing || new Date(timeStamp) > new Date(existing.raw)) {
            acc[targetMapId] = { raw: timeStamp };
          }
        }
        return acc;
      }, {});


      setLatestRobotCleanings(processedMap);
    }
  }, [data, allManholeData]);
  // --- SAFE ID LOOKUP ---
  const getManholeDateById = useCallback((manholeId) => {
    if (!manholeId) return null;

    // Normalize inputs
    const cleanId = String(manholeId).trim();

    // 1. Check Robot Map
    const robotEntry = latestRobotCleanings[cleanId];
    if (robotEntry && robotEntry.raw) {
      return robotEntry.raw;
    }

    // 2. Fallback to Map Data
    const baseData = allManholeData.find(mh => mh.id === cleanId);
    return baseData ? (baseData.timestamp || baseData.start_time) : null;
  }, [latestRobotCleanings, allManholeData]);
  const generateManholeGeoJSON = useCallback((data, latestRobotCleaningsMap) => {
    return {
      type: "FeatureCollection",
      features: data.map((row) => {
        const stringId = String(row.id);
        let dateForStatus = row.timestamp || row.start_time || null;

        // Override with Robot Data
        const robotEntry = latestRobotCleaningsMap[stringId];
        if (robotEntry && robotEntry.raw) {
          dateForStatus = robotEntry.raw;
        }

        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
          properties: {
            ...row,
            id: stringId, // Ensure GeoJSON has string ID
            date_for_status: dateForStatus,
            status: getManholeStatus(dateForStatus)
          },
          id: stringId, // GeoJSON Feature ID
        };
      }),
    };
  }, [getManholeStatus]);

  // --- HANDLERS (Same as before) ---
  const clearManholeSelection = useCallback(() => { setSelectedManholeLocation(null); }, []);
  const handleClosePopup = useCallback(() => {
    // 1. Always close the popup
    setSelectedManholeLocation(null);

    // 2. Always clear the search text
    setSearchId("");

    // 3. CONDITIONAL MAP CLEAR:
    // Only clear the map points if the user has NOT selected a Division/Ward.
    // (This implies they were looking at a temporary Search Result).
    if (selectedDivision === "All" || selectedAreaName === "All") {
      setFilteredManholeGeoJSON(emptyGeoJSON);
    }

    // If Division/Ward ARE selected, we do nothing here. 
    // The map will continue to show the manholes for that Ward.
  }, [selectedDivision, selectedAreaName]); const handleGenerateReport = () => { console.log("Report generation triggered"); clearManholeSelection(); };
  const handleAssignBot = () => { console.log("Assign bot triggered"); clearManholeSelection(); };

  const handleDivisionChange = useCallback((divisionValue) => {
    clearManholeSelection();
    setSelectedDivision(divisionValue);
    setSelectedAreaName("All");
    setSelectedZone("All");
    let areas = [];
    if (divisionValue !== "All" && allManholeData.length > 0) {
      const divisionData = allManholeData.filter(row => row.division === divisionValue);
      if (divisionData.length > 0) {
        areas = [...new Set(divisionData.map(row => row.section))].filter(Boolean).sort();
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
      const areaData = allManholeData.filter(row => row.division === selectedDivision && row.section === areaValue);
      if (areaData.length > 0) {
        zones = [...new Set(areaData.map(row => row.zone))].filter(Boolean).sort();
      }
    }
    setZoneList(["All", ...zones]);
  }, [selectedDivision, allManholeData, clearManholeSelection]);

  const handleZoneChange = useCallback((zoneValue) => {
    clearManholeSelection();
    setSelectedZone(zoneValue);
  }, [clearManholeSelection]);

  const handleStyleChange = (newStyleUrl) => {
    if (newStyleUrl !== mapStyle) {
      if (mapRef.current) {
        centerToRestoreRef.current = mapRef.current.getCenter();
        zoomToRestoreRef.current = mapRef.current.getZoom();
      }
      setMapStyle(newStyleUrl);
    }
  };

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
          let valid = false;
          coords.forEach(c => { if (Array.isArray(c) && c.length === 2) { bounds.extend(c); valid = true; } });
          if (valid) { setFlyToLocation({ bounds: bounds, padding: 40 }); return; }
        }
      }
    }
    setFlyToLocation({ center: [78.4794, 17.3940], zoom: 9.40 });
  };

  // --- INTERACTION HANDLERS ---
  const handleManholeClick = useCallback((feature) => {
    const manholeId = String(feature.properties.id);
    let latestCleanedDate = getManholeDateById(manholeId);

    // Fallback: Use property embedded in GeoJSON if live lookup fails
    if (!latestCleanedDate) {
      latestCleanedDate = feature.properties.date_for_status;
    }

    const manholeStatus = getManholeStatus(latestCleanedDate);

    setSelectedManholeLocation({
      ...feature.properties,
      lastCleaned: latestCleanedDate,
      status: manholeStatus,
    });
    setFlyToLocation({ center: feature.geometry.coordinates, zoom: 18 });
  }, [getManholeStatus, getManholeDateById]);

  const handleManholeDeselect = useCallback(() => { clearManholeSelection(); }, [clearManholeSelection]);

  const handleAlertManholeClick = useCallback((manholeId) => {
    const stringId = String(manholeId);
    const manholeData = allManholeData.find(mh => String(mh.id) === stringId);
    if (manholeData) {
      // Logic: If it's in the alert list, we rely on the base data or re-calculate status
      const latestDate = getManholeDateById(stringId) || manholeData.timestamp;
      const manholeStatus = getManholeStatus(latestDate);

      setSelectedManholeLocation({
        ...manholeData,
        lastCleaned: latestDate,
        status: manholeStatus,
      });
      const lat = parseFloat(manholeData.latitude);
      const lon = parseFloat(manholeData.longitude);
      if (!isNaN(lon) && !isNaN(lat)) { setFlyToLocation({ center: [lon, lat], zoom: 18 }); }
    }
  }, [allManholeData, getManholeStatus, getManholeDateById]);

  // --- FILTERING EFFECT ---
  useEffect(() => {
    if (allManholeData.length === 0) { setFilteredManholeGeoJSON(emptyGeoJSON); return; }
    if (selectedDivision === "All" || selectedAreaName === "All") { setFilteredManholeGeoJSON(emptyGeoJSON); return; }
    let filtered = allManholeData.filter((row) => {
      const matchesHierarchy = (row.division === selectedDivision && row.section === selectedAreaName);
      if (!matchesHierarchy) return false;
      if (selectedZone !== "All" && row.zone !== selectedZone) { return false; }
      return true;
    });
    setFilteredManholeGeoJSON(generateManholeGeoJSON(filtered, latestRobotCleanings));
  }, [selectedDivision, selectedAreaName, selectedZone, allManholeData, generateManholeGeoJSON, latestRobotCleanings]);
  useEffect(() => {
    fetch("/datafiles/CSVs/buildings_updated_somajiguda.geojson")
      .then(res => res.json())
      .then(data => setBuildingData(data)) // Updates the state defined in Step 1
      .catch(err => console.error("Error loading buildings:", err));
  }, []);

  // --- WARD ZOOM EFFECT ---
  useEffect(() => {
    if (Object.keys(wardPolygons).length === 0 && (!filteredManholeGeoJSON || filteredManholeGeoJSON.features.length === 0)) return;
    if (!selectedAreaName || selectedAreaName === "All") { setActiveWardGeoJSON(null); return; }

    const normalized = String(selectedAreaName).trim().toLowerCase();
    const matchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);

    if (matchKey) {
      const coords = wardPolygons[matchKey];
      if (!Array.isArray(coords) || coords.length < 4) { setActiveWardGeoJSON(null); return; }
      const geojson = { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: { name: matchKey } };
      setActiveWardGeoJSON(geojson);
      try {
        const bounds = new mapboxgl.LngLatBounds();
        let valid = false;
        coords.forEach(c => { if (Array.isArray(c) && c.length === 2) { bounds.extend(c); valid = true; } });
        if (valid) setFlyToLocation({ bounds: bounds, padding: 40 });
      } catch (e) { setActiveWardGeoJSON(null); }
    } else {
      setActiveWardGeoJSON(null);
      if (filteredManholeGeoJSON && filteredManholeGeoJSON.features.length > 0) {
        try {
          const bounds = new mapboxgl.LngLatBounds();
          let valid = false;
          filteredManholeGeoJSON.features.forEach(f => {
            const c = f.geometry.coordinates;
            if (Array.isArray(c) && c.length === 2) { bounds.extend(c); valid = true; }
          });
          if (valid) {
            if (filteredManholeGeoJSON.features.length === 1) setFlyToLocation({ center: filteredManholeGeoJSON.features[0].geometry.coordinates, zoom: 18 });
            else setFlyToLocation({ bounds: bounds, padding: 40 });
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [selectedAreaName, wardPolygons, filteredManholeGeoJSON]);

  // --- DERIVED LISTS ---
  const alertData = useMemo(() => {
    if (!selectedAreaName || selectedAreaName === "All" || allManholeData.length === 0) return [];
    const wardManholes = allManholeData.filter((mh) => mh?.section === selectedAreaName && mh.division === selectedDivision);
    // Note: Alert logic re-checks the status based on current data
    const dangerManholes = wardManholes.filter((mh) => {
      const date = getManholeDateById(String(mh.id)) || mh.last_operation_date;
      return getManholeStatus(date) === 'danger';
    });

    const groupedByZone = dangerManholes.reduce((acc, mh) => {
      const zone = mh.zone || 'Unknown Zone';
      if (!acc[zone]) { acc[zone] = []; }
      acc[zone].push({ id: mh.id || 'N/A', location: `${mh.latitude}, ${mh.longitude}`, status: 'Danger' });
      return acc;
    }, {});
    return Object.entries(groupedByZone).map(([zoneName, alerts]) => ({ zoneName, alerts })).sort((a, b) => a.zoneName.localeCompare(b.zoneName));
  }, [selectedAreaName, selectedDivision, allManholeData, getManholeStatus, getManholeDateById]);

  const selectedWardForPopup = useMemo(() => {
    const normalized = selectedAreaName && selectedAreaName !== "All" ? String(selectedAreaName).trim().toLowerCase() : null;
    if (!normalized || Object.keys(wardPolygons).length === 0 || Object.keys(wardDetailsMap).length === 0) return null;
    const finalMatchKey = Object.keys(wardPolygons).find(k => k.trim().toLowerCase() === normalized);
    return finalMatchKey ? wardDetailsMap[finalMatchKey] : null;
  }, [selectedAreaName, wardPolygons, wardDetailsMap]);
 // --- RENDER ---
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
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ paddingBlock: "5px", borderRadius: "5px" }}
                className={`${
                  filter === f ? "btn-blue" : "btn-blue-outline"
                } text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}
              >
                {f === "all" ? "All Locations" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col justify-start gap-4 pb-3">
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>Safe
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>Danger
            </span>
            
          </div>
          <div className="flex gap-3 justify-start items-center flex-wrap">
             {/* Inputs and Selects */}
            <input type="number" placeholder="Lat.." value={latInput} onChange={(e) => setLatInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[100px]" />
            <input type="number" placeholder="Lon.." value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[100px]" />
            <button onClick={handleJumpToLocation} className="btn-blue btn-hover text-sm ml-1" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Go</button>
            
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300 ml-2">
              <input type="text" placeholder="MH0621324.." value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchManhole()} className="hover:shadow-md border border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[120px]" />
              <button onClick={handleSearchManhole} className="btn-blue btn-hover text-sm" style={{ paddingBlock: "6px", borderRadius: "8px" }}>Search</button>
            </div>

            <select value={selectedDivision} onChange={(e) => handleDivisionChange(e.target.value)} className="hover:shadow-md border cursor-pointer border-gray-300 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Division</option>
              {divisionList.filter((d) => d !== "All").map((d, i) => (<option key={i} value={d}>{getDisplayName(d)}</option>))}
            </select>
            <select value={selectedAreaName} onChange={(e) => handleAreaNameChange(e.target.value)} disabled={selectedDivision === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Ward</option>
              {areaNameList.filter((a) => a !== "All").map((a, i) => (<option key={i} value={a}>{getDisplayName(a)}</option>))}
            </select>
            <select value={selectedZone} onChange={(e) => handleZoneChange(e.target.value)} disabled={selectedAreaName === "All"} className="hover:shadow-md border border-gray-300 cursor-pointer rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]">
              <option value="All">Select Zone</option>
              {zoneList.filter((z) => z !== "All").map((zone, idx) => (<option key={idx} value={zone}>{getDisplayName(zone)}</option>))}
            </select>
          </div>
        </div>

        {/* --- Map Container --- */}
        {/* IMPORTANT: flex-1 ensures this fills the remaining height of the card */}
        <div className="map-box relative rounded-lg overflow-hidden border border-gray-300 w-full flex-1 min-h-0">
          <button onClick={handleReset} className="bg-[#eee] font-extralight border absolute right-4 top-2 z-[500] rounded-md px-1.5 py-1 text-xs h-8 hover:bg-[#fff] border-gray-300 cursor-pointer">
            <LocateFixed className="font-extralight w-8.5 opacity-80" />
          </button>
          
          <div className="absolute right-2 top-10 z-[500] group mt-3">
             <button className="bg-[#eee] font-extralight border cursor-pointer border-gray-300 shadow-md rounded-md w-12 h-7 mr-2 flex items-center justify-center hover:bg-[#fff] transition duration-300 opacity-80"> <Map /> </button>
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
            centerToRestore={centerToRestoreRef}
            zoomToRestore={zoomToRestoreRef}
            styleUrl={mapStyle}
            manholeGeoJSON={filteredManholeGeoJSON}
            wardGeoJSON={activeWardGeoJSON}
            statusFilter={filter}
            selectedManholeId={selectedManholeLocation ? (selectedManholeLocation.id || selectedManholeLocation.sw_mh_id) : null}
            flyToLocation={flyToLocation}
            formatExcelDate={formatExcelDate}
            getManholeDateById={getManholeDateById}
            onManholeClick={handleManholeClick}
            onManholeDeselect={handleManholeDeselect}
            buildingGeoJSON={buildingData}
          />
          
        {error && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 text-gray-700 font-bold">{error}</div>}
          
          <div className="bg-[#ffffff] absolute left-2 bottom-2 z-500 rounded-xl p-4 py-5 text-[12px] text-black flex flex-col gap-1 shadow-md">
            <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Safe - Regular Maintenance</span>
            <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Warning - Require Attention</span>
            <span className="flex items-center gap-3 space-x-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Danger - Immediate Action Needed</span>
          </div>
        </div>
      </div>

      {/* --- Right section (Popup) --- */}
      {/* IMPORTANT: h-full ensures it matches the Left Section's height exactly */}
      <div className="shadow-gray-300 shadow-md border border-gray-200 w-[30%] bg-white rounded-xl h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
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
                setSelectedWard={setSelectedAreaName}
              />
            </div>
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
