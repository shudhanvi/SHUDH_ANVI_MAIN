import React, { useEffect, useRef, memo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2h1YmhhbWd2IiwiYSI6ImNtZDV2cmJneDAydngyanFzaW1oNTM3M24ifQ.7Jb5OXpznWqjyMeAuiXhrQ";

const MapboxCore = ({
  mapRef,
  centerToRestore,
  zoomToRestore,
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
  const selectedManholeIdRef = useRef(null);
  const isPopupPinned = useRef(false);
  
  // ✅ FIX 1: Track current style to prevent loops/reloads
  const currentStyleRef = useRef(styleUrl);

  // Refs for data stability
  const manholeDataRef = useRef(manholeGeoJSON);
  const wardDataRef = useRef(wardGeoJSON);
  const buildingDataRef = useRef(buildingGeoJSON);
  const statusFilterRef = useRef(statusFilter);

  // Sync Refs
  useEffect(() => { manholeDataRef.current = manholeGeoJSON; }, [manholeGeoJSON]);
  useEffect(() => { wardDataRef.current = wardGeoJSON; }, [wardGeoJSON]);
  useEffect(() => { buildingDataRef.current = buildingGeoJSON; }, [buildingGeoJSON]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);

const drawLayers = useCallback(() => {
    if (!mapRef.current || !mapRef.current.getStyle()) return;

    const mapInstance = mapRef.current;
    
    // Define Empty Data Helper
    const emptyGeo = { type: 'FeatureCollection', features: [] };

    // ----------------------------------------------------
    // 1. WARD POLYGONS
    // ----------------------------------------------------
    try {
      const currentWardData = wardDataRef.current;
      const hasData = currentWardData?.geometry?.coordinates?.[0]?.length >= 4;
      let wardSource = mapInstance.getSource("ward-polygon-source");

      if (hasData) {
        // Draw Data
        if (!wardSource) mapInstance.addSource("ward-polygon-source", { type: "geojson", data: currentWardData });
        else wardSource.setData(currentWardData);

        if (!mapInstance.getLayer("ward-polygon-layer")) {
           mapInstance.addLayer({
             id: "ward-polygon-layer", type: "fill", source: "ward-polygon-source",
             paint: { "fill-color": "#1d4ed8", "fill-opacity": 0.1 }
           });
        }
        if (!mapInstance.getLayer("ward-outline-layer")) {
           mapInstance.addLayer({
             id: "ward-outline-layer", type: "line", source: "ward-polygon-source",
             paint: { "line-color": "#1d4ed8", "line-width": 2 }
           });
        }
      } else if (wardSource) {
        // 🧹 CLEAR DATA (Fix: Reset to empty instead of removing source to prevent errors)
        wardSource.setData(emptyGeo); 
      }
    } catch (e) { console.error(e); }

    // ----------------------------------------------------
    // 2. BUILDINGS
    // ----------------------------------------------------
   // ----------------------------------------------------
    // 3. MANHOLES (Inside drawLayers in MapboxCore.jsx)
    // ----------------------------------------------------
    try {
      let manholeSource = mapInstance.getSource("manholes");
      
      // 1. Update Data
      if (manholeSource) {
        manholeSource.setData(manholeGeoJSON);
      } else if (manholeGeoJSON && manholeGeoJSON.features.length > 0) {
        mapInstance.addSource("manholes", { 
            type: "geojson", 
            data: manholeGeoJSON, 
            promoteId: "id" // <--- Important: Tells Mapbox to use the top-level 'id'
        });
      mapInstance.addLayer({
          id: "manhole-dots",
          type: "circle",
          source: "manholes",
          paint: {
            // Selected = Radius 8, Unselected = Radius 5
            "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 8, 5],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#fff",
            // Selected = Blue (#3b82f6), Unselected = Status Color
            "circle-color": [
              "case", 
              ["boolean", ["feature-state", "selected"], false], "#3b82f6", 
              ["match", ["get", "status"], "safe", "#22c55e", "warning", "#fbbf24", "danger", "#ef4444", "#ccc"]
            ],
          },
        });
      }
      
      // 2. Clear OLD Selection (Fixes the "Blue Glitch")
      // This wipes the 'selected' state from ALL manholes first
      if (mapInstance.getSource("manholes")) {
          mapInstance.removeFeatureState({ source: 'manholes' });
      }

 if (selectedManholeId && mapInstance.getSource("manholes")) {
         // console.log("🔵 Highlight ID:", selectedManholeId);
         try {
             mapInstance.setFeatureState(
                 { source: 'manholes', id: selectedManholeId },
                 { selected: true }
             );
         } catch (err) {
             console.error("Failed to select manhole:", err);
         }
      }
    } catch (e) { console.error(e); }
    // ----------------------------------------------------
    // 3. MANHOLES
    // ----------------------------------------------------
    try {
      let manholeSource = mapInstance.getSource("manholes");
      
      // Always update data, even if empty. This clears the dots.
      if (manholeSource) {
        manholeSource.setData(manholeDataRef.current || emptyGeo);
      } else if (manholeDataRef.current && manholeDataRef.current.features.length > 0) {
        // Only add source if we actually have data to show
        mapInstance.addSource("manholes", { type: "geojson", data: manholeDataRef.current, promoteId: "id" });
        mapInstance.addLayer({
          id: "manhole-dots", type: "circle", source: "manholes",
          paint: {
            "circle-radius": 5, "circle-stroke-width": 1.5, "circle-stroke-color": "#fff",
            "circle-color": [
              "case", ["boolean", ["feature-state", "selected"], false], "#3b82f6",
              ["match", ["get", "status"], "safe", "#22c55e", "warning", "#fbbf24", "danger", "#ef4444", "#ccc"],
            ],
          },
        });
      }
      
      // Update Filters
      if (mapInstance.getLayer("manhole-dots")) {
        const filterExpr = statusFilterRef.current === "all" ? null : ["==", ["get", "status"], statusFilterRef.current];
        mapInstance.setFilter("manhole-dots", filterExpr);
      }
      
      // Update Selection
 
      if (selectedManholeIdRef.current !== null) {
        // Only try to select if source exists
        if (mapInstance.getSource("manholes")) {
            mapInstance.setFeatureState({ source: 'manholes', id: selectedManholeIdRef.current }, { selected: true });
        }
      }
    } catch (e) { console.error(e); }

  }, [mapRef]);

  // --- MAP INITIALIZATION & EVENT LISTENERS ---
  useEffect(() => {
    if (mapRef.current) return;
    // Don't init without style, but we use styleUrl prop initially
    const initialStyle = styleUrl || "mapbox://styles/mapbox/streets-v11";

    // Create Map
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [78.4794, 17.3940],
      zoom: 9.40,
      doubleClickZoom: false,
  
    });
    mapRef.current = mapInstance;
    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-left");

    const handleStyleLoad = () => {
      drawLayers();
      if (centerToRestore?.current) {
        mapInstance?.jumpTo({ center: centerToRestore.current, zoom: zoomToRestore.current });
        centerToRestore.current = null;
      }
    };

    mapInstance.on("load", drawLayers);
    mapInstance.on("style.load", handleStyleLoad);

    // ✅ FIX 2: Correct Date Resolution Logic
    const resolveDate = (feature) => {
      const popupId = String(feature.properties.id);
      
      // 1. Try to get date from parent function (most reliable)
      let resolvedDate = (typeof getManholeDateById === 'function') 
          ? getManholeDateById(popupId) 
          : null;

      // 2. If parent function fails, fallback to feature property
      // IMPORTANT: Changed 'date_for_status' to 'timestamp' to match MapComponent data
      if (!resolvedDate) {
          resolvedDate = feature.properties.timestamp || feature.properties.last_operation_timestamp;
      }
      
      return resolvedDate;
    };

    const createPopupHTML = (id, dateValue) => {
      let displayDate = (dateValue && typeof formatExcelDate === 'function') 
          ? formatExcelDate(dateValue) 
          : "No Record";
      
      // Extra check: if formatExcelDate returned "Invalid Date", show "No Record" instead
      if (displayDate === "Invalid Date") displayDate = "No Record";

      return `<div id="mhpop" style="font-size:12px;padding:4px;text-align:center;background:white;color:#333;"><strong>ID:</strong> ${id}<br/><strong>Last Cleaned:</strong> ${displayDate}</div>`;
    };

    // --- HELPER: SAFE QUERY (Prevents Crash on Style Change) ---
    const queryFeaturesSafe = (e, layers) => {
        try {
            if(!mapInstance.isStyleLoaded()) return [];
            // Filter out layers that don't exist yet
            const validLayers = layers.filter(l => mapInstance.getLayer(l));
            if(validLayers.length === 0) return [];
            return mapInstance.queryRenderedFeatures(e.point, { layers: validLayers });
        } catch (err) { return []; }
    };

    // --- EVENT: CLICK MANHOLE ---
    mapInstance.on("click", (e) => {
      // 1. Check Manholes
      const manholeFeatures = queryFeaturesSafe(e, ['manhole-dots']);
      if (manholeFeatures.length > 0) {
          const feature = manholeFeatures[0];
          if (!onManholeClick) return;
          popup.current.remove();
          onManholeClick(feature);
          const popupId = String(feature.properties.id ?? 'N/A');
          popup.current.setLngLat(feature.geometry.coordinates).setHTML(createPopupHTML(popupId, resolveDate(feature))).addTo(mapInstance);
          isPopupPinned.current = true;
          return;
      }

      // 2. Check Buildings (if no manhole clicked)
      const buildingFeatures = queryFeaturesSafe(e, ['buildings-fill']);
      if (buildingFeatures.length > 0) {
          const feature = buildingFeatures[0];
          const p = feature.properties;
          const popupHtml = `
            <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
                <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px;">Building Information</h3>
                <div style="font-size: 12px; display: grid; grid-template-columns: 60px 1fr; gap: 4px;">
                    <span style="color: #666; font-weight: 600;">Use:</span>
                    <span style="text-transform: capitalize;">${p.landuse || 'N/A'}</span>
                    <span style="color: #666; font-weight: 600;">Address:</span>
                    <span>${p.address || 'N/A'}</span>
                </div>
            </div>`;
          popup.current.setLngLat(e.lngLat).setHTML(popupHtml).addTo(mapInstance);
          isPopupPinned.current = true;
          return;
      }

      // 3. Clicked Empty Space
      popup.current.remove();
      isPopupPinned.current = false;
      if (selectedManholeIdRef.current && onManholeDeselect) onManholeDeselect();
    });

    // --- CURSOR POINTERS ---
    mapInstance.on("mousemove", (e) => {
        const hits = queryFeaturesSafe(e, ['manhole-dots', 'buildings-fill']);
        mapInstance.getCanvas().style.cursor = hits.length > 0 ? "pointer" : "";

        // Show hover popup for Manholes ONLY (if not pinned)
        const manholeHits = queryFeaturesSafe(e, ['manhole-dots']);
        if (manholeHits.length > 0 && !isPopupPinned.current) {
            const f = manholeHits[0];
            const pid = String(f.properties.id ?? 'N/A');
            popup.current.setLngLat(f.geometry.coordinates).setHTML(createPopupHTML(pid, resolveDate(f))).addTo(mapInstance);
        } else if (!isPopupPinned.current) {
            popup.current.remove();
        }
    });

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []); // Run once on mount

  // --- UPDATES ---
  
  // 1. Data Update: Re-draw layers
  useEffect(() => { 
      if (mapRef.current && mapRef.current.isStyleLoaded()) drawLayers(); 
  }, [manholeGeoJSON, wardGeoJSON, buildingGeoJSON, mapRef, drawLayers]);

  // 2. Style Update (FIXED FOR DATA PERSISTENCE)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleUrl) return;
    
    // Prevent reloading if style hasn't changed
    if (currentStyleRef.current === styleUrl) return;
    currentStyleRef.current = styleUrl;

    // Apply Style
    map.setStyle(styleUrl);

    // Listen for 'styledata' - this fires when the new style is ready.
    // We then immediately re-draw your layers so they don't disappear.
    const onStyleData = () => {
       if (map.isStyleLoaded() && !map.getSource('manholes')) {
           drawLayers(); 
       }
    };

    map.on('styledata', onStyleData);
    return () => { map.off('styledata', onStyleData); };
  }, [styleUrl, drawLayers]);

  // 3. Filter Update
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded() || !mapRef.current.getLayer("manhole-dots")) return;
    try {
      const filterExpr = statusFilter === "all" ? null : ["==", ["get", "status"], statusFilter];
      mapRef.current.setFilter("manhole-dots", filterExpr);
    } catch (e) { }
  }, [statusFilter, mapRef]);

  // 4. Selection Update
  useEffect(() => {
    selectedManholeIdRef.current = selectedManholeId;
    if (mapRef.current && mapRef.current.isStyleLoaded()) drawLayers(); 
    if (selectedManholeId === null) {
      isPopupPinned.current = false;
      popup.current.remove();
    }
  }, [selectedManholeId, mapRef, drawLayers]);

  // 5. FlyTo Update
  useEffect(() => {
    if (!mapRef.current || !flyToLocation) return;
    const mapInstance = mapRef.current;
    try {
      if (flyToLocation.bounds) {
        isPopupPinned.current = false;
        popup.current.remove();
        mapInstance.fitBounds(flyToLocation.bounds, { padding: flyToLocation.padding || 40, duration: 1000 });
      } else if (flyToLocation.center) {
        const currentCenter = mapInstance.getCenter();
        const targetCenter = flyToLocation.center;
        const dist = Math.sqrt(Math.pow(currentCenter.lng - targetCenter[0], 2) + Math.pow(currentCenter.lat - targetCenter[1], 2));
        if (dist > 0.00001) mapInstance.flyTo({ center: targetCenter, zoom: flyToLocation.zoom || 18, duration: 1000 });
        else if (mapInstance.getZoom() !== (flyToLocation.zoom || 18)) mapInstance.zoomTo(flyToLocation.zoom || 18, { duration: 500 });
      }
    } catch (e) { }
  }, [flyToLocation, mapRef]);

  return <div ref={mapContainer} className="h-full w-full " />;
};

export default memo(MapboxCore);  