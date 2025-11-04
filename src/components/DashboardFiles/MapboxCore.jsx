// ./MapboxCore.js

import React, { useEffect, useRef, memo, useCallback } from "react"; // Added useCallback
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2h1YmhhbWd2IiwiYSI6ImNtZGZ1YmRhdzBqMmcya3I1cThjYWloZnkifQ.5ZIhoOuwzrGin8wzM5-0nQ";

const MapboxCore = ({
  // Passed Refs from parent
  mapRef,
  centerToRestore,
  zoomToRestore,
  // Other Props
  styleUrl,
  manholeGeoJSON,
  wardGeoJSON,
  statusFilter,
  selectedManholeId,
  flyToLocation,
  formatExcelDate,
  onManholeClick,
  onManholeDeselect,
}) => {
  // Ref for the DOM container element
  const mapContainer = useRef(null);
  // Ref for the hover/click popup instance
  const popup = useRef(new mapboxgl.Popup({ offset: 15, closeOnClick: false, closeButton: false })); // Keep popup open on map click
  // Ref for internal tracking of the visually selected manhole ID
  const selectedManholeIdRef = useRef(null);
  // Ref to track if the small map popup is "pinned" by a click
  const isPopupPinned = useRef(false);


  // Refs to store latest prop data for event listeners
  const manholeDataRef = useRef(manholeGeoJSON);
  const wardDataRef = useRef(wardGeoJSON);
  const statusFilterRef = useRef(statusFilter);

  // Update refs when corresponding props change
  useEffect(() => { manholeDataRef.current = manholeGeoJSON; }, [manholeGeoJSON]);
  useEffect(() => { wardDataRef.current = wardGeoJSON; }, [wardGeoJSON]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);


  // --- Combined Layer Drawing Function ---
  const drawLayers = useCallback(() => {
    // Guards: Ensure map instance exists and style is loaded
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      return;
    }
    const mapInstance = mapRef.current; // Use parent's ref

    // --- A. Manhole Layer ---
    try {
      let manholeSource = mapInstance.getSource("manholes");
      if (manholeSource) {
        manholeSource.setData(manholeDataRef.current);
      } else {
        mapInstance.addSource("manholes", {
          type: "geojson", data: manholeDataRef.current, promoteId: "id",
        });
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

      // Apply filter if layer exists
      if (mapInstance.getLayer("manhole-dots")) {
        const filterExpr = statusFilterRef.current === "all" ? null : ["==", ["get", "status"], statusFilterRef.current];
        // Use try-catch for setFilter during style transitions
        try { mapInstance.setFilter("manhole-dots", filterExpr); }
        catch (e) { console.warn("Could not set filter during transition:", e.message); }
      }

      // Apply selection state: Clear all first, then set current
      try {
        mapInstance.removeFeatureState({ source: 'manholes' }); // Clear all states for the source
      } catch (e) { /* Ignore errors during style transitions */ }

      if (selectedManholeIdRef.current !== null) {
        const features = mapInstance.querySourceFeatures('manholes', {
          filter: ['==', 'id', selectedManholeIdRef.current]
        });
        if (features.length > 0) {
          try {
             mapInstance.setFeatureState(
               { source: 'manholes', id: selectedManholeIdRef.current },
               { selected: true }
             );
          } catch(e) { /* Ignore errors during style transitions */ }
        }
      }
    } catch (e) { console.error("Error drawing manhole layer:", e.message); }

    // --- B. Ward Polygon Layer ---
    try {
      const currentWardData = wardDataRef.current;
      const hasData = currentWardData && currentWardData.geometry && currentWardData.geometry.coordinates && currentWardData.geometry.coordinates[0]?.length >= 4;
      let wardSource = mapInstance.getSource("ward-polygon-source");

      // Clean up previous layers first
      // Use try-catch as getLayer can fail during transitions
      try {
        if (mapInstance.getLayer("ward-polygon-layer")) mapInstance.removeLayer("ward-polygon-layer");
        if (mapInstance.getLayer("ward-outline-layer")) mapInstance.removeLayer("ward-outline-layer");
      } catch(e) { console.warn("Error removing old ward layers:", e.message); }

      // Remove source only if it exists AND there's no new valid data
      if (wardSource && !hasData) {
        try { mapInstance.removeSource("ward-polygon-source"); }
        catch(e) { console.warn("Error removing old ward source:", e.message); }
        wardSource = null;
      }

      // Add/Update source and layers if valid data exists
      if (hasData) {
        if (wardSource) {
          wardSource.setData(currentWardData);
        } else {
           try { mapInstance.addSource("ward-polygon-source", { type: "geojson", data: currentWardData }); }
           catch(e) { console.error("Error adding ward source:", e.message); return; } // Stop if source fails
        }
        // Check source exists before adding layers
        if(mapInstance.getSource("ward-polygon-source")){
            try {
                // Add layers only if they don't already exist (in case removal failed)
                if (!mapInstance.getLayer("ward-polygon-layer")) {
                    mapInstance.addLayer({
                      id: "ward-polygon-layer", type: "fill", source: "ward-polygon-source",
                      paint: { "fill-color": "#1d4ed8", "fill-opacity": 0.1 },
                    });
                }
                if (!mapInstance.getLayer("ward-outline-layer")) {
                    mapInstance.addLayer({
                      id: "ward-outline-layer", type: "line", source: "ward-polygon-source",
                      paint: { "line-color": "#1d4ed8", "line-width": 2 },
                    });
                }
            } catch(e) { console.error("Error adding ward layers:", e.message); }
        }
      }
    } catch (e) { console.error("Error drawing ward layer:", e.message); }
  }, [mapRef]); // Dependency: mapRef (function is stable due to useCallback)

  // --- 1. Initial Map Initialization ---
  useEffect(() => {
    // Guards
    if (mapRef.current) return;
    if (!styleUrl) return;

    // Create map instance and assign to parent's ref
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [78.4794, 17.3940],
      zoom: 9.40,
    });
    mapRef.current = mapInstance;

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-left");

    // --- EVENT LISTENERS ---

    // Named handler for style.load
    const handleStyleLoad = () => {
      const centerVal = centerToRestore?.current;
      const zoomVal = zoomToRestore?.current;
    

      drawLayers(); // Redraw layers first

      if (centerVal && zoomVal !== null) {
      
        mapInstance?.jumpTo({ center: centerVal, zoom: zoomVal });
        setTimeout(() => {
            if (mapRef.current) {
              
            }
        }, 0);
        if(centerToRestore) centerToRestore.current = null;
        if(zoomToRestore) zoomToRestore.current = null;
      } else {
 
      }
    };

    // Attach listeners
    mapInstance.on("load", drawLayers);
    mapInstance.on("style.load", handleStyleLoad);

    // --- Click Listeners ---
    mapInstance.on("click", "manhole-dots", (e) => {
      const clickedFeature = e.features[0];
      if (!clickedFeature || !onManholeClick) return;
      popup.current.remove(); // Close any popup first
      onManholeClick(clickedFeature); // Notify parent for side panel

      // Create and show persistent map popup
      const feature = clickedFeature;
      const popupId = feature.properties.id ?? 'N/A';
      const popupDate = feature.properties.last_operation_date ? formatExcelDate(feature.properties.last_operation_date) : 'N/A';
      const popupHtml = `
        <div id="mhpop" style="font-size: 12px; padding: 4px; text-align: center; background-color: white; border-radius: 3px;  rgba(0,0,0,0.2); color: #333;">
          <strong>ID:</strong> ${popupId}<br/>
          <strong>Last Cleaned:</strong> ${popupDate}
        </div>`;
      popup.current.setLngLat(feature.geometry.coordinates).setHTML(popupHtml).addTo(mapInstance);
      isPopupPinned.current = true; // Mark as pinned
    });

    mapInstance.on('click', (e) => { // Click off dot
      if (!mapInstance) return;
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['manhole-dots'] });
      if (!features.length) { // Click was NOT on a dot
         popup.current.remove(); // Close map popup
         isPopupPinned.current = false; // Unpin
         if (selectedManholeIdRef.current && onManholeDeselect) {
            onManholeDeselect(); // Notify parent
         }
      }
    });

    // --- Hover Popup Listeners ---
    mapInstance.on("mouseenter", "manhole-dots", (e) => {
      if (!mapInstance) return;
      mapInstance.getCanvas().style.cursor = "pointer";
      if (isPopupPinned.current) return; // Don't show hover if pinned

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const popupId = feature.properties.id ?? 'N/A';
        const popupDate = feature.properties.last_operation_date ? formatExcelDate(feature.properties.last_operation_date) : 'N/A';
        const popupHtml = `
          <div id="mhpop" style="font-size: 12px;  text-align: center; background-color: white; border-radius: 3px;   rgba(0,0,0,0.2); color: #333;">
            <strong>ID:</strong> ${popupId}<br/>
            <strong>Last Cleaned:</strong> ${popupDate}
          </div>`;
        popup.current.setLngLat(feature.geometry.coordinates).setHTML(popupHtml).addTo(mapInstance);
      }
    });
    mapInstance.on("mouseleave", "manhole-dots", () => {
       if (!mapInstance) return;
      mapInstance.getCanvas().style.cursor = "";
      if (!isPopupPinned.current) { // Only remove if not pinned
          popup.current.remove();
      }
    });

    // --- Cleanup ---
    return () => {
      if (mapRef.current) {
        mapRef.current.off("load", drawLayers);
        mapRef.current.off("style.load", handleStyleLoad);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // Dependencies for initialization
  }, [styleUrl, mapRef, centerToRestore, zoomToRestore, onManholeClick, onManholeDeselect, formatExcelDate, drawLayers]);


  // --- 2. Effect to Trigger Mapbox Style Change ---
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded() || !mapRef.current.loaded()) return;
    const currentStyle = mapRef.current.getStyle();
    if (!currentStyle || currentStyle.url === styleUrl) return;
    
    mapRef.current.setStyle(styleUrl);
  }, [styleUrl, mapRef]);


  // --- 3 & 4. Effect to REDRAW layers when data props change ---
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      drawLayers();
    }
  }, [manholeGeoJSON, wardGeoJSON, mapRef, drawLayers]);


  // --- 5. Effect to apply Status Filter ---
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded() || !mapRef.current.getLayer("manhole-dots")) return;
    try {
      const filterExpr = statusFilter === "all" ? null : ["==", ["get", "status"], statusFilter];
      mapRef.current.setFilter("manhole-dots", filterExpr);
    } catch (e) { console.warn("Could not set filter:", e.message); }
  }, [statusFilter, mapRef]);


  // --- 6. Effect to manage Manhole Selection State (Ref Update + Redraw trigger) ---
  useEffect(() => {
    selectedManholeIdRef.current = selectedManholeId; // Update internal ref
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      drawLayers(); // Trigger redraw to update visual state
    }
     // If selectedManholeId becomes null (deselected), ensure popup is unpinned
     if(selectedManholeId === null) {
        isPopupPinned.current = false;
        popup.current.remove(); // Close map popup on deselect
     }
  }, [selectedManholeId, mapRef, drawLayers]);


  // --- 7. Effect to fly to a location ---
  useEffect(() => {
    if (!mapRef.current || !flyToLocation) return;
    // Don't fly if a popup is pinned from a click (prevents overriding click zoom)
    // You might adjust this logic if flying should always take precedence
    // if (isPopupPinned.current && flyToLocation.center) return;

    try {
      if (flyToLocation.bounds) {
        // Unpin popup before fitting bounds to prevent weirdness
        isPopupPinned.current = false;
        popup.current.remove();
        mapRef.current.fitBounds(flyToLocation.bounds, { padding: flyToLocation.padding || 40, duration: 1000 });
      } else if (flyToLocation.center) {
         // Check if the target center is different enough from current center before flying
         // This prevents unnecessary flying when clicking already centered manhole
         const currentCenter = mapRef.current.getCenter();
         const targetCenter = flyToLocation.center;
         const dist = Math.sqrt(Math.pow(currentCenter.lng - targetCenter[0], 2) + Math.pow(currentCenter.lat - targetCenter[1], 2));
         // Only fly if distance is more than a small threshold
         if (dist > 0.00001) {
            mapRef.current.flyTo({ center: targetCenter, zoom: flyToLocation.zoom || 18, duration: 1000 });
         } else {
             // If already centered, just ensure correct zoom
             if(mapRef.current.getZoom() !== (flyToLocation.zoom || 18)){
                 mapRef.current.zoomTo(flyToLocation.zoom || 18, {duration: 500});
             }
         }
      }
    } catch (e) { console.error("Error flying to location:", e.message); }
  }, [flyToLocation, mapRef]);

  // Render the map container div
  return (
    <div ref={mapContainer} className="h-full w-full " />
  );
};

export default memo(MapboxCore);