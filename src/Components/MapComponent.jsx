import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { CheckCircle, Clock, AlertTriangle, Ear } from "lucide-react";
import ManholePopUp from "./ManholePopUp";
import ReactDOMServer from "react-dom/server";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import WardDetailsPopUp from "./WardDetailsPopUp";
import { DummyWardData } from "../../public/datafiles/DummyWardData";
import useGeoCode from "./GeoCoding";
import FilterableWardSelect from "./FilterableWardSelect";
import { useServerData } from "../context/ServerDataContext";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapComponent = () => {
  const [selectedManholeLocation, setSelectedManholeLocation] = useState(null);
  const [selectedOps, setSelectedOps] = useState([]);
  const [operationData, setOperationData] = useState([]);
  const [manholePoints, setManholePoints] = useState([]);
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  const { serverData, loading, message } = useServerData();
  const [mapCenter, setMapCenter] = useState({
    lat: 17.472427,
    lng: 78.482286,
  });

  // Ward related states
  const [wardData, setWardData] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardPolygons, setWardPolygons] = useState({});

  // using geocode for mapping by area names
  const setGeocode = useGeoCode();

  //recenter map with lat/long values
  const RecenterMap = ({ lat, lng, zoom }) => {
    // console.log('RecenterMap', lat, lng, zoom, selectedWard)
    const map = useMap();
    useEffect(() => {
      // console.log('mapping');
      map.setView([lat, lng], zoom);
    }, [lat, lng, zoom, map]);
    return null;
  };

  // Component to zoom to selected ward
  const ZoomToWard = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
      if (coordinates?.length) {
        map.fitBounds(coordinates);
      }
    }, [coordinates, map]);
    return null;
  };

  const [zoom, setZoom] = useState(15);
  const [filter, setFilter] = useState("all");

  // Load ward coordinates from Excel file in public folder
  useEffect(() => {
    fetch("/datafiles/ward_coordinates.xlsx")
      .then((res) => res.arrayBuffer())
      .then((ab) => {
        const wb = XLSX.read(ab, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const grouped = {};
        data.forEach((row) => {
          const name = row.Ward;
          const coord = [row.y, row.x]; // [lat, lng]
          if (!grouped[name]) grouped[name] = [];
          grouped[name].push(coord);
        });
        // console.log("grouped : ", grouped);
        setWardPolygons(grouped);
      })
      .catch((err) => console.error("Error loading ward coordinates:", err));
  }, []);

  // Load WardData from Excel file and Adding Other in public folder
  useEffect(() => {
    const loadWardData = async () => {
      try {
        // const response = await fetch("/datafiles/ward_data.xlsx");
        // const arrayBuffer = await response.arrayBuffer();
        // const workbook = XLSX.read(arrayBuffer, { type: "array" });
        // const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Ward Options for User
        // Hasmathpet, Tadbund, Mallikarjuna Nagar, Balaji Nagar
        // filtering dummyWardsData
        const allWardsL = DummyWardData;
        // ? DummyWardData.length > 0
        // : DummyWardData?.filter(
        //     (each) => each.ward_name.toLowerCase() !== "hasmathpet"
        //   );
        // allWardsL.push(...jsonData);
        allWardsL.sort();
        // console.log("wardjsonData : ", allWardsL);

        setWardData(allWardsL);
      } catch (error) {
        console.error("Error loading ward data:", error);
      }
    };
    loadWardData();
  }, []);
  const parseDDMMYYYY = (str) => {
  if (!str || typeof str !== "string") return new Date();
  const [dd, mm, yyyy] = str.split("-");
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return isNaN(date.getTime()) ? new Date() : date;
};

  // 1. Parse CSV once
  useEffect(() => {
    Papa.parse("/datafiles/devices.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const csvPoints = result.data
          .filter((row) => row.latitude && row.longitude)
          .map((row, index) => ({
            id: `csv-${index + 1}`,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            type: row.condition?.toLowerCase() || "safe",
            manhole_id: row.id || `csv-${index + 1}`,
            lastCleaned: parseDDMMYYYY(row.last_operation_date),
            raw: row,
            source: "csv",
          }));
        setManholePoints(csvPoints);
      },
      error: (err) => console.error("CSV parsing failed:", err),
    });
  }, []);

  // Merge CSV + serverData points
  const combinedPoints = [
    ...manholePoints.map((point) => ({
      ...point,
      id: `${point.source || "csv"}-${point.manhole_id || point.id}-${point.latitude}-${point.longitude}`,
      source: "csv",
    })),
    ...(serverData || [])
    .filter((row) => row.location && row.location.includes(","))
    .map((row, index) => {
      const [lat, lon] = row.location.split(",");
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      const safeLat = isNaN(latitude) ? `nan${index}` : latitude;
      const safeLon = isNaN(longitude) ? `nan${index}` : longitude;

      return {
        id: `api-${row.device_id || row.id || "UNKNOWN"}-${safeLat}-${safeLon}-${index}`, // index added
        latitude: isNaN(latitude) ? 0 : latitude,
        longitude: isNaN(longitude) ? 0 : longitude,
        type: "api",
        manhole_id: row.device_id || row.id || `API-${index}`,
        lastCleaned: row.operation_end_time
          ? new Date(row.operation_end_time)
          : new Date(),
        raw: row,
        source: "api",
      };
    }),
  ];

  // SetWard Mapping Runs on Ward Input Changes
  useEffect(() => {
    if (selectedWard !== "Hasmathpet" && selectedWard) {
      const SetWardMapping = async () => {
        const wardGeoData = await setGeocode(selectedWard);

        if (wardGeoData) {
          const newLat = wardGeoData.lat;
          const newLon = wardGeoData.lon;
          // console.log("mapping warded", { lat: newLat, lon: newLon });
          setMapCenter({ lat: newLat, lng: newLon, zoom: 15 });
        }
        // ✅ Normalize polygon
        //   let polygons = [];
        //   if (wardGeoData.geojson?.type === "Polygon") {
        //     polygons = [
        //       wardGeoData.geojson.coordinates[0].map(([lng, lat]) => [
        //         lat,
        //         lng,
        //       ]),
        //     ];
        //   } else if (wardGeoData.geojson?.type === "MultiPolygon") {
        //     polygons = wardGeoData.geojson.coordinates.map((poly) =>
        //       poly[0].map(([lng, lat]) => [lat, lng])
        //     );
        //   }

        //   // ✅ Save polygon(s) to state for rendering
        //   const updatedWardPolygons = {...wardPolygons, [selectedWard] : polygons};
        //   console.log('polygons :', updatedWardPolygons);
        //   setWardPolygons(updatedWardPolygons)
        // }

        // console.log("mapping warded", wardGeoData);
      };

      SetWardMapping();
    }
  }, [selectedWard]);

  const getStatusIcon = (lastCleaned) => {
    const now = new Date();
    const diffDays = Math.floor((now - lastCleaned) / (1000 * 60 * 60 * 24));
    if (diffDays <= 5)
      return { icon: CheckCircle, color: "green", type: "safe" };
    if (diffDays <= 7) return { icon: Clock, color: "#ff7f00", type: "warning" };
    return { icon: AlertTriangle, color: "red", type: "danger" };
  };

  const findMatchingOps = (lat, lon) => {
    const tolerance = 0.0005;
    return operationData.filter((op) => {
      if (!op.location) return false;
      const [olat, olon] = op.location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      return (
        Math.abs(olat - lat) < tolerance && Math.abs(olon - lon) < tolerance
      );
    });
  };

  const handleJumpToLocation = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) {
      setMapCenter({ lat, lng: lon });
      setZoom(18);
    }
  };

  const handleMarkerClick = (point) => {
    console.log("point : ", point);
    const ops = findMatchingOps(point.latitude, point.longitude);
    setSelectedOps(ops);
    setSelectedManholeLocation(point);
    setLatInput(point.latitude);
    setLonInput(point.longitude);
    // RecenterMap(point.latitude, point.longitude, 10)
    setMapCenter({ lat: point.latitude, lng: point.longitude, zoom: 20 });
  };

  const handleClosePopup = () => {
    // console.log('closing')
    setSelectedManholeLocation(null);
    setSelectedWard(null);
  };

  const handleGenerateReport = (type) => {
    const report = {
      type,
      timestamp: new Date().toISOString(),
      data: {
        location: selectedManholeLocation,
        operations: selectedOps,
        current: selectedOps[0],
      },
    };

    // Save to localStorage (since we can't use it in artifacts, this is for reference)
    // In a real implementation, you'd save this to your backend or state management
    console.log("Report generated:", report);
    alert("✅ Report generated and saved!");
    handleClosePopup();
  };

  const filteredPoints = combinedPoints.filter((point) => {
    if (filter === "all") return true;
    const status = getStatusIcon(point.lastCleaned).type;
    return status === filter;
  });

  // Get unique ward names for the dropdown
  // const uniqueWards = [...new Set(wardData.map((d) => d.ward_name))];

  return (
    <div className="map-container w-full flex gap-1">
      {/* Left section: top box + map */}
      <div
        className="transition-all relative duration-500 w-full"
        style={{
          width: selectedManholeLocation || selectedWard ? "65%" : "100%",
        }}
      >
        {/* Top box */}
        <div className="border-1 border-[#333] p-6 rounded-xl bg-white">
          <div className="flex justify-between align-middle flex-wrap gap-2">
            <p className="font-semibold text-md">
              Interactive Hotspot Manhole Map
            </p>
            <div className="flex justify-center align-middle gap-4 ml-auto">
              {["all", "safe", "warning", "danger"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    console.log("tab", f);
                  }}
                  style={{ paddingBlock: "5px", borderRadius: "5px" }}
                  className={`${
                    filter === f ? "btn-blue" : "btn-blue-outline"
                  } text-sm rounded-md hover:scale-105 hover:shadow-md hover:shadow-gray-300 duration-150`}
                >
                  {f === "all"
                    ? "All Locations"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend + Lat/Lon */}
          <div className="mt-4 flex flex-col justify-start align-middle gap-4 pb-3">
            <div className="flex items-center gap-5 text-sm">
              <span className="flex items-center gap-1 space-x-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>Safe
              </span>
              <span className="flex items-center gap-1 space-x-1">
                <span className="w-3 h-3 rounded-full bg-[#ff7f00]"></span>
                Warning
              </span>
              <span className="flex items-center gap-1 space-x-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>Danger
              </span>
            </div>

            <div className="flex gap-3 justify-start align-middle flex-wrap">
              <input
                type="number"
                placeholder="Latitude.."
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="hover:shadow-md hover:shadow-gray-100 border-1 border-gray-500 outline-1 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"
              />
              <input
                type="number"
                placeholder="Longitude.."
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className="hover:shadow-md hover:shadow-gray-100 border-1 border-gray-500 outline-1 rounded-sm bg-white hover:bg-gray-50 px-2 py-1 w-auto max-w-[150px]"
              />
              <button
                onClick={handleJumpToLocation}
                className="btn-blue btn-hover text-sm ml-3"
                style={{ paddingBlock: "6px", borderRadius: "8px" }}
              >
                Go
              </button>
              <FilterableWardSelect
                wardData={wardData}
                selectedWard={selectedWard}
                setSelectedWard={setSelectedWard}
                setSelectedManholeLocation={setSelectedManholeLocation}
              />
            </div>
          </div>

          {/* Map Box */}
          <div
            className="map-box relative rounded-lg overflow-hidden border border-gray-300"
            style={{
              height: "445.52px",
              opacity: 1,
            }}
          >
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={zoom}
              style={{ height: "100%", width: "100%" }}
            >
              <RecenterMap
                lat={mapCenter.lat}
                lng={mapCenter.lng}
                zoom={zoom}
              />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Ward polygon */}
              {selectedWard && wardPolygons[selectedWard] && (
                <>
                  <ZoomToWard coordinates={wardPolygons[selectedWard]} />
                  {/* {console.log("poly ", wardPolygons)} */}
                  <Polygon
                    positions={wardPolygons[selectedWard]}
                    pathOptions={{
                      color: "#1d4ed8",
                      weight: 2,
                      fillOpacity: 0.1,
                    }}
                  />
                </>
              )}

              {filteredPoints.map((point) => {
                const status = getStatusIcon(point.lastCleaned);

                const imageIcon =
                  point.type === "fair" || point.type === "good"
                    ? "icons/completed-icon.png"
                    : point.type === "poor"
                    ? "icons/warning-orange-icon.png"
                    : "icons/warning-red-icon.png";

                const titleBox = ReactDOMServer.renderToString(
                  <div className="map-pin-titleBox flex justify-center align-middle gap-1">
                    {/* <img
                      src={imageIcon}
                      alt={imageIcon}
                      className="object-contain w-full h-auto max-w-[25px] aspect-square"
                    /> */}
                    <div className="text-gray-500 flex flex-col justify-start text-left">
                      <span className="text-sm text-black font-[600]">
                        {point.manhole_id}
                      </span>
                      <span className="text-[12px]">Last Cleaned: {point.lastCleaned?point.lastCleaned.toLocaleDateString("en-GB"):"N/A"}</span>
                    </div>
                  </div>
                );

                const customIcon = L.divIcon({
                  html: `<div class="map-manhole-icon" style="background-color:${status.color};width:20px;aspect-ratio:1/1;border-radius:50%;border:3px solid #eee;">
                    ${titleBox}
                  </div>`,
                  className: "",
                });

                return (
                  <Marker
                    key={point.id}
                    position={[point.latitude, point.longitude]}
                    icon={customIcon}
                    eventHandlers={{ click: () => handleMarkerClick(point) }}
                  />
                );
              })}
            </MapContainer>

            {/* Map Pin Status Overlay Box */}
            <div className="bg-[#ffffff] absolute left-2 bottom-2 z-[900] rounded-xl p-4 py-5 text-[12px] text-black flex flex-col gap-1">
              <span className="flex items-center gap-3 space-x-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>Safe
                - Regular Maintenance
              </span>
              <span className="flex items-center gap-3 space-x-1">
                <span className="w-3 h-3 rounded-full bg-[#ff7f00]"></span>
                Warning - Require Attention
              </span>
              <span className="flex items-center gap-3 space-x-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>Danger
                - Immediate Action Needed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right section: POP UPS */}
      <div
        className="db-popup-container overflow-x-hidden h-[665px] overflow-y-auto"
        style={{
          width: selectedManholeLocation || selectedWard ? "35%" : "0%",
        }}
      >
        {/* Ward Details Popup */}
        {selectedManholeLocation === "" && selectedWard && (
          <div className="dB-Popup w-full flex justify-start h-full place-items-start transition-all duration-500">
            <WardDetailsPopUp
              selectedWard={selectedWard}
              setSelectedWard={setSelectedWard}
              wardData={wardData}
            />
          </div>
        )}

        {/* Sidebar Manhole PopUp */}
        {selectedManholeLocation && (
          <div className="dB-Popup w-full flex justify-start place-items-start h-full  transition-all duration-500">
            <ManholePopUp
              selectedLocation={selectedManholeLocation}
              selectedOps={selectedOps}
              onClose={handleClosePopup}
              onGenerateReport={handleGenerateReport}
              lastCleaned={selectedManholeLocation.lastCleaned}
            />
          </div>
        )}
      </div>
      {/* POPup ended */}
    </div>
  );
};

export default MapComponent;
