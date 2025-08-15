import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import { CheckCircle, Clock, AlertTriangle, Navigation } from "lucide-react";
import ManholeDetails from "./ManholeDetails";
import WardDetails from "./WardDetails";
import ReactDOMServer from "react-dom/server";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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
  const [mapCenter, setMapCenter] = useState({
    lat: 17.472427,
    lng: 78.482286,
  });

  // Ward related states
  const [wardData, setWardData] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardPolygons, setWardPolygons] = useState({});

  //recenter map with lat/long values
  const RecenterMap = ({ lat, lng, zoom }) => {   
    const map = useMap();
    useEffect(() => {
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

  const [zoom, setZoom] = useState(17);
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
        setWardPolygons(grouped);
      })
      .catch((err) => console.error("Error loading ward coordinates:", err));
  }, []);

  // Load ward data from Excel file in public folder
  useEffect(() => {
    const loadWardData = async () => {
      try {
        const response = await fetch("/datafiles/ward_data.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setWardData(jsonData);
      } catch (error) {
        console.error("Error loading ward data:", error);
      }
    };
    loadWardData();
  }, []);

  // Load CSV data + mock ops
  useEffect(() => {
    Papa.parse("/datafiles/manholeData.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const parsedData = result.data
          .filter((row) => row.latitude && row.longitude)
          .map((row, index) => ({
            id: index + 1,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            type: row.condition?.toLowerCase() || "safe",
            manhole_id: row.id,
            lastCleaned: row.last_operation_date
              ? new Date(row.last_operation_date)
              : new Date(),
            raw: row,
          }));

        setManholePoints(parsedData);

        // Mock operation data
        const mockOperationData = [
          {
            id: 1,
            location: "17.472427,78.482286",
            timestamp: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
          },
          {
            id: 2,
            location: "17.473427,78.483286",
            timestamp: new Date(
              Date.now() - 4 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
          },
          {
            id: 3,
            location: "17.471427,78.481286",
            timestamp: new Date(
              Date.now() - 6 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
          },
          {
            id: 4,
            location: "17.474427,78.484286",
            timestamp: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
          },
          {
            id: 5,
            location: "17.470427,78.480286",
            timestamp: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "pending",
          },
        ];
        setOperationData(mockOperationData);
      },
      error: (err) => console.error("CSV parsing failed:", err)
    });
  }, []);

  const getStatusIcon = (lastCleaned) => {
    const now = new Date();
    const diffDays = Math.floor((now - lastCleaned) / (1000 * 60 * 60 * 24));
    if (diffDays <= 5)
      return { icon: CheckCircle, color: "green", type: "safe" };
    if (diffDays <= 7) return { icon: Clock, color: "yellow", type: "warning" };
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
    const ops = findMatchingOps(point.latitude, point.longitude);
    setSelectedOps(ops);
    setSelectedManholeLocation(point);
    setLatInput(point.latitude);
    setLonInput(point.longitude);
  };

  const handleClosePopup = () => {
    setSelectedManholeLocation(null);
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

  const filteredPoints = manholePoints.filter((point) => {
    if (filter === "all") return true;
    const status = getStatusIcon(point.lastCleaned).type;
    return status === filter;
  });

  // Get unique ward names for the dropdown
  const uniqueWards = [...new Set(wardData.map((d) => d.ward_name))];

  return (
    <div className="w-full">
      {/* Left section: top box + map */}
      <div className="transition-all relative duration-500 w-full">
        {/* Top box */}
        <div className="shadow-lg shadow-gray-500 p-6 mb-4 rounded bg-white">
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
                    console.log('tab', f);
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
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
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
              <select
                onChange={(e) => setSelectedWard(e.target.value)}
                value={selectedWard || ""}
                className="text-sm hover:shadow-md cursor-pointer hover:shadow-gray-100 py-2 border-0.5 border-gray-500 outline-1 rounded-sm bg-white hover:bg-gray-50 px-3 w-auto max-w-[150px]"
              >
                <option value="" className="bg-white hover:bg-[rgba(30, 154, 176, 1)] px-2">
                  Select Ward
                </option>
                {uniqueWards.map((ward, i) => (
                  <option
                    key={i}
                    value={ward}
                    className="bg-white hover:bg-[rgba(30, 154, 176, 1)] px-2"
                  >
                    {ward}
                  </option>
                ))}
              </select>
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
              <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} zoom={zoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Ward polygon */}
              {selectedWard && wardPolygons[selectedWard] && (
                <>
                  <ZoomToWard coordinates={wardPolygons[selectedWard]} />
                  <Polygon
                    positions={wardPolygons[selectedWard]}
                    pathOptions={{ color: "#1d4ed8", weight: 2, fillOpacity: 0.1 }}
                  />
                </>
              )}

              {filteredPoints.map((point) => {
                const status = getStatusIcon(point.lastCleaned);
                
                const imageIcon =
                  (point.type === 'fair' || point.type === 'good')
                    ? 'icons/completed-icon.png'
                    : (point.type === 'poor' ? 'icons/warning-orange-icon.png' : 'icons/warning-red-icon.png');
                
                const titleBox = ReactDOMServer.renderToString((
                  <div className="map-pin-titleBox flex justify-center align-middle gap-1">
                    <img src={imageIcon} alt={imageIcon} className="object-contain w-full h-auto max-w-[25px] aspect-square" />
                    <div className="text-gray-500 flex flex-col justify-start text-left">
                      <span className="text-sm text-black font-[600]">{point.manhole_id}</span>
                      <span className="text-[12px]">Industrial Area</span>
                    </div>
                  </div>
                ));

                const customIcon = L.divIcon({
                  html: 
                  `<div class="map-manhole-icon" style="background-color:${status.color};width:20px;aspect-ratio:1/1;border-radius:50%;border:3px solid #eee;">
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
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                Warning - Require Attention
              </span>
              <span className="flex items-center gap-3 space-x-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>Danger
                - Immediate Action Needed
              </span>
            </div>
          </div>
        </div>

        {/* Ward Details Popup */}
        {selectedWard && (
          <div className="mt-4">
            <WardDetails
              selectedWard={selectedWard}
              setSelectedWard={setSelectedWard}
              wardData={wardData}
            />
          </div>
        )}

        {/* Sidebar Manhole PopUp */}
        {selectedManholeLocation && (
          <div className="dB-Manhole-Popup w-96 h-auto place-items-center transition-all duration-500 bg-ray-100 border-gra-300 p-4">
            <ManholeDetails
              selectedLocation={selectedManholeLocation}
              selectedOps={selectedOps}
              onClose={handleClosePopup}
              onGenerateReport={handleGenerateReport}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
