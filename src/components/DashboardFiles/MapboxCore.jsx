import React, { useEffect, useRef, memo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2h1YmhhbWd2IiwiYSI6ImNtZDV2cmJneDAydngyanFzaW1oNTM3M24ifQ.7Jb5OXpznWqjyMeAuiXhrQ";

const MapboxCore = ({
  mapRef,
  styleUrl,
  manholeGeoJSON,
  wardGeoJSON,
  buildingGeoJSON,
  statusFilter,
  selectedManholeId,
  flyToLocation,
  formatExcelDate,
  onManholeClick,
  onManholeDeselect,
  onBuildingClick, 
  getManholeDateById
}) => {
  const mapContainer = useRef(null);
  const popup = useRef(new mapboxgl.Popup({ offset: 15, closeOnClick: false, closeButton: false }));
  const isPopupPinned = useRef(false);
  const currentStyleRef = useRef(styleUrl);

  // Synchronized Constants
  const MH_SOURCE = "shudh-manhole-source";
  const MH_LAYER = "manhole-dots";
  const BLDG_SOURCE = "shudh-building-source";
  const BLDG_LAYER = "buildings-fill";
  const WARD_SOURCE = "ward-polygon-source";
  const WARD_LAYER = "ward-polygon-layer";

  // Data Refs to prevent closure staleness
  const manholeDataRef = useRef(manholeGeoJSON);
  const buildingDataRef = useRef(buildingGeoJSON);
  const wardDataRef = useRef(wardGeoJSON);

  useEffect(() => { manholeDataRef.current = manholeGeoJSON; }, [manholeGeoJSON]);
  useEffect(() => { buildingDataRef.current = buildingGeoJSON; }, [buildingGeoJSON]);
  useEffect(() => { wardDataRef.current = wardGeoJSON; }, [wardGeoJSON]);

  // --- SAFE QUERY HELPER (Fixes the "Layer does not exist" error) ---
  const queryFeaturesSafe = (e, layers) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getStyle()) return [];
    try {
      const style = map.getStyle();
      const existingLayers = style.layers.map(l => l.id);
      const validLayers = layers.filter(l => existingLayers.includes(l));
      if (validLayers.length === 0) return [];
      return map.queryRenderedFeatures(e.point, { layers: validLayers });
    } catch (err) { return []; }
  };

  // --- POPUP HTML HELPERS ---
  const createManholeHTML = (f) => {
    const p = f.properties;
    const pid = p.manhole_id || p.id || 'N/A';
    const dateVal = p.last_operation_timestamp || p.timestamp;
    let displayDate = (dateVal && typeof formatExcelDate === 'function') ? formatExcelDate(dateVal) : "No Record";
    if (displayDate === "Invalid Date") displayDate = "No Record";

    return `<div style="font-family:sans-serif;padding:5px;text-align:center;color:#333;">
              <strong>ID:</strong> ${pid}<br/>
              <strong>Last Cleaned:</strong> ${displayDate}
            </div>`;
  };

  const createBuildingHTML = (p) => {
    return `<div style="font-family:sans-serif;padding:5px;color:#333;">
              <strong style="display:block;border-bottom:1px solid #ccc;margin-bottom:4px;">Building Info</strong>
              <b>Use:</b> ${p.landuse || 'N/A'}<br/>
              <b>Address:</b> ${p.address || 'N/A'}
            </div>`;
  };

  // --- DRAWING LOGIC ---
  const drawLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getStyle()) return;

    try {
      // 1. MANHOLES
      const mhData = manholeDataRef.current || { type: 'FeatureCollection', features: [] };
      if (!map.getSource(MH_SOURCE)) map.addSource(MH_SOURCE, { type: "geojson", data: mhData, promoteId: "id" });
      else map.getSource(MH_SOURCE).setData(mhData);

      if (!map.getLayer(MH_LAYER)) {
        map.addLayer({
          id: MH_LAYER, type: "circle", source: MH_SOURCE,
          metadata: { "mapbox:group": "custom" },
          paint: {
            "circle-radius": 6, "circle-stroke-width": 1.5, "circle-stroke-color": "#fff",
            "circle-color": ["match", ["get", "status"], "safe", "#22c55e", "warning", "#fbbf24", "danger", "#ef4444", "#ccc"]
          }
        });
      }

      // 2. BUILDINGS
      const bldgData = buildingDataRef.current;
      if (bldgData?.features?.length > 0) {
        if (!map.getSource(BLDG_SOURCE)) map.addSource(BLDG_SOURCE, { type: "geojson", data: bldgData });
        else map.getSource(BLDG_SOURCE).setData(bldgData);
        if (!map.getLayer(BLDG_LAYER)) {
          map.addLayer({
            id: BLDG_LAYER, type: "fill", source: BLDG_SOURCE,
            paint: { "fill-color": "#3b82f6", "fill-opacity": 0.4, "fill-outline-color": "#fff" }
          });
        }
      }

      // 3. WARD
      const wardData = wardDataRef.current;
      if (wardData?.features?.length > 0) {
        if (!map.getSource(WARD_SOURCE)) map.addSource(WARD_SOURCE, { type: "geojson", data: wardData });
        else map.getSource(WARD_SOURCE).setData(wardData);
        if (!map.getLayer(WARD_LAYER)) {
          map.addLayer({ id: WARD_LAYER, type: "fill", source: WARD_SOURCE, paint: { "fill-color": "#1d4ed8", "fill-opacity": 0.05 } });
        }
      }

      if (map.getLayer(MH_LAYER)) map.moveLayer(MH_LAYER);
    } catch (e) { console.warn("Drawing Error:", e.message); }
  }, [mapRef]);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl || "mapbox://styles/mapbox/streets-v11",
      center: [78.4794, 17.3940],
      zoom: 9.4,
      doubleClickZoom: false
    });
    mapRef.current = map;

    const onReady = () => { drawLayers(); };
    map.on("load", onReady);
    map.on("style.load", onReady);
    map.on("idle", () => { if (!map.getSource(MH_SOURCE)) drawLayers(); });

    map.on("click", (e) => {
      const mhHits = queryFeaturesSafe(e, [MH_LAYER]);
      if (mhHits.length > 0) {
        onManholeClick?.(mhHits[0]);
        popup.current.setLngLat(mhHits[0].geometry.coordinates).setHTML(createManholeHTML(mhHits[0])).addTo(map);
        isPopupPinned.current = true;
        return;
      }
      const bldgHits = queryFeaturesSafe(e, [BLDG_LAYER]);
      if (bldgHits.length > 0) {
        onBuildingClick?.(bldgHits[0]);
        popup.current.setLngLat(e.lngLat).setHTML(createBuildingHTML(bldgHits[0].properties)).addTo(map);
        isPopupPinned.current = true;
        return;
      }
      popup.current.remove();
      isPopupPinned.current = false;
      onManholeDeselect?.();
    });

    map.on("mousemove", (e) => {
      const allHits = queryFeaturesSafe(e, [MH_LAYER, BLDG_LAYER]);
      if (map.getCanvas()) map.getCanvas().style.cursor = allHits.length > 0 ? "pointer" : "";
      
      const mhHover = queryFeaturesSafe(e, [MH_LAYER]);
      if (mhHover.length > 0 && !isPopupPinned.current) {
        popup.current.setLngLat(mhHover[0].geometry.coordinates).setHTML(createManholeHTML(mhHover[0])).addTo(map);
      } else if (!isPopupPinned.current) {
        popup.current.remove();
      }
    });

    return () => map.remove();
  }, []);

  // --- UPDATES ---
  useEffect(() => { if (mapRef.current?.isStyleLoaded()) drawLayers(); }, [manholeGeoJSON, buildingGeoJSON, drawLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && styleUrl && currentStyleRef.current !== styleUrl) {
      currentStyleRef.current = styleUrl;
      map.setStyle(styleUrl);
    }
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const performZoom = () => {
      if (flyToLocation?.center) {
        map.flyTo({ center: flyToLocation.center, zoom: flyToLocation.zoom || 17, essential: true, duration: 1500 });
        return;
      }
      const mhFeatures = manholeGeoJSON?.features || [];
      const bounds = new mapboxgl.LngLatBounds();
      let hasCoords = false;
      mhFeatures.forEach(f => {
        const [lng, lat] = f.geometry.coordinates;
        if (lng !== 0 && lat !== 0) { bounds.extend([lng, lat]); hasCoords = true; }
      });
      if (hasCoords && !bounds.isEmpty()) map.fitBounds(bounds, { padding: 80, duration: 1500, maxZoom: 16, essential: true });
    };
    if (map.isStyleLoaded()) performZoom();
    else map.once("idle", performZoom);
  }, [manholeGeoJSON, flyToLocation]);

  return <div ref={mapContainer} className="h-full w-full" />;
};

export default memo(MapboxCore);