// ./MapboxCore.js

import React, { useEffect, useRef, memo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic2h1YmhhbWd2IiwiYSI6ImNtZGZ1YmRhdzBqMmcya3I1cThjYWloZnkifQ.5ZIhoOuwzrGin8wzM5-0nQ";

const MapboxCore = ({
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

  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(new mapboxgl.Popup({ offset: 15, closeButton: false }));
  const selectedManholeIdRef = useRef(null);

  // Use refs to store latest data for event listeners
  const manholeDataRef = useRef(manholeGeoJSON);
  const wardDataRef = useRef(wardGeoJSON);
  const statusFilterRef = useRef(statusFilter); // Also store filter

  useEffect(() => { manholeDataRef.current = manholeGeoJSON; }, [manholeGeoJSON]);
  useEffect(() => { wardDataRef.current = wardGeoJSON; }, [wardGeoJSON]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);


  // --- Combined Layer Drawing Function ---
  const drawLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    console.log("Attempting to draw layers...");

    const mapInstance = map.current; // Use local variable for safety in callbacks

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
      // Re-apply status filter after adding/updating layer
      if (mapInstance.getLayer("manhole-dots")) {
        const filterExpr = statusFilterRef.current === "all" ? null : ["==", ["get", "status"], statusFilterRef.current];
        mapInstance.setFilter("manhole-dots", filterExpr);
      }
      // Re-apply selection state
       if (selectedManholeIdRef.current !== null) {
          mapInstance.setFeatureState(
            { source: 'manholes', id: selectedManholeIdRef.current },
            { selected: true }
          );
       }


    } catch (e) { console.error("Error drawing manhole layer:", e.message); }

    // --- B. Ward Polygon Layer ---
    try {
      const currentWardData = wardDataRef.current;
      const hasData = currentWardData && currentWardData.geometry && currentWardData.geometry.coordinates;
      let wardSource = mapInstance.getSource("ward-polygon-source");

      // Clean up previous layers first if they exist
      if (mapInstance.getLayer("ward-polygon-layer")) mapInstance.removeLayer("ward-polygon-layer");
      if (mapInstance.getLayer("ward-outline-layer")) mapInstance.removeLayer("ward-outline-layer");
      if (wardSource && !hasData) { // Remove source only if no new data
         mapInstance.removeSource("ward-polygon-source");
         wardSource = null; // Update local variable
      }


      if (hasData) {
        if (wardSource) {
          wardSource.setData(currentWardData);
        } else {
          mapInstance.addSource("ward-polygon-source", { type: "geojson", data: currentWardData });
        }
        // Add layers (they were removed above, so always add)
        mapInstance.addLayer({
          id: "ward-polygon-layer", type: "fill", source: "ward-polygon-source",
          paint: { "fill-color": "#1d4ed8", "fill-opacity": 0.1 },
        });
        mapInstance.addLayer({
          id: "ward-outline-layer", type: "line", source: "ward-polygon-source",
          paint: { "line-color": "#1d4ed8", "line-width": 2 },
        });
        console.log("Ward border layer added/updated.");
      } else {
          console.log("No ward data, ensuring border layer is removed.");
      }
    } catch (e) { console.error("Error drawing ward layer:", e.message); }
  };


  // --- 1. Initial Map Initialization ---
  useEffect(() => {
    if (map.current) return;
    if (!styleUrl) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current, style: styleUrl,
      center: [78.4794, 17.3940], zoom: 9.40,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-left");

    // --- EVENT LISTENERS ---
    map.current.on("load", drawLayers);       // Draw on initial load
    map.current.on("style.load", drawLayers); // Redraw when style loads

    // Click handlers (unchanged)
    map.current.on("click", "manhole-dots", (e) => {
      const clickedFeature = e.features[0];
      if (!clickedFeature) return;
      popup.current.remove();
      onManholeClick(clickedFeature);
    });
    map.current.on('click', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['manhole-dots'] });
        if (!features.length && selectedManholeIdRef.current) { onManholeDeselect(); }
    });
    // ./MapboxCore.js -> inside the first useEffect, after the 'click' listeners

    map.current.on("mouseenter", "manhole-dots", (e) => {
      // --- ADD LOGS for debugging ---
      console.log("Mouse Enter Event Fired!");
      // --- END LOGS ---
      if (!map.current) return; // Safety check
      map.current.getCanvas().style.cursor = "pointer";

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        // --- ADD LOGS for debugging ---
        console.log("Hovered Feature Properties:", feature.properties);
        // --- END LOGS ---

        // Check if properties exist before trying to format
        const popupId = feature.properties.id ?? 'N/A'; // Use nullish coalescing
        const popupDate = feature.properties.last_operation_date
                          ? formatExcelDate(feature.properties.last_operation_date)
                          : 'N/A';

        popup.current
          .setLngLat(feature.geometry.coordinates)
          .setHTML(
            `<div id="mhpop" style="font-size: 10px;  text-align: center; border-r-10  3px;  rgba(0,0,0,0.2); color: #333;">
              <strong>ID:</strong> ${popupId}<br/>
              <strong>Last Cleaned:</strong> ${popupDate}
            </div>` // Slightly improved styling
          )
          .addTo(map.current);
          // --- ADD LOGS for debugging ---
          console.log("Popup Added to Map.");
          // --- END LOGS ---
      } else {
         console.log("Mouse Enter but no features found?");
      }
    });

    map.current.on("mouseleave", "manhole-dots", () => {
       // --- ADD LOGS for debugging ---
      console.log("Mouse Leave Event Fired!");
       // --- END LOGS ---
       if (!map.current) return; // Safety check
      map.current.getCanvas().style.cursor = "";
      popup.current.remove();
    });

// ... rest of the useEffect ...
    map.current.on("mouseenter", "manhole-dots", (e) => { /* ...popup logic... */ });
    map.current.on("mouseleave", "manhole-dots", () => { /* ...popup logic... */ });

    return () => { // Cleanup
        if (map.current) {
            map.current.off("load", drawLayers);
            map.current.off("style.load", drawLayers);
            map.current.remove();
            map.current = null;
        }
    };
  }, [styleUrl, onManholeClick, onManholeDeselect, formatExcelDate]); // Style URL triggers re-init


  // --- 2. Effect to change style ---
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const currentStyle = map.current.getStyle();
    if (!currentStyle || currentStyle.url === styleUrl) return;
    map.current.setStyle(styleUrl);
  }, [styleUrl]);
  

  // --- 3 & 4. Effects to REDRAW layers when data props change ---
  // We call drawLayers directly here as well.
  useEffect(() => {
    drawLayers();
  }, [manholeGeoJSON, wardGeoJSON]); // Redraw if either dataset changes


  // --- 5. Effect to apply Status Filter ---
  // This needs to be separate because it applies filter, doesn't redraw layers
   useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getLayer("manhole-dots")) return;
     try {
       const filterExpr = statusFilter === "all" ? null : ["==", ["get", "status"], statusFilter];
       map.current.setFilter("manhole-dots", filterExpr);
     } catch (e) {
         console.warn("Could not set filter (safe during style change):", e.message);
     }
  }, [statusFilter]);

// ./MapboxCore.js

// ... inside the MapboxCore component ...

  // --- 6. Effect to manage Manhole Selection State ---
  useEffect(() => {
    // Guards: Make sure the map and source are ready
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getSource('manholes')) {
      return;
    }

    const mapInstance = map.current; // Use local var for safety

    // Get the ID of the previously selected manhole (stored in the ref)
    const previousSelectedId = selectedManholeIdRef.current;

    // A. Deselect the PREVIOUSLY selected manhole (if one exists)
    if (previousSelectedId !== null) {
      // Check if the feature actually exists before trying to set state
      // (This prevents errors if data reloads between clicks)
      const features = mapInstance.querySourceFeatures('manholes', {
        filter: ['==', 'id', previousSelectedId]
      });
      if (features.length > 0) {
         try {
            mapInstance.setFeatureState(
              { source: 'manholes', id: previousSelectedId },
              { selected: false }
            );
         } catch(e) { console.warn("Could not deselect previous feature:", e.message); }
      }
    }

    // B. Select the NEW manhole (if a new one is selected)
    if (selectedManholeId !== null) {
       // Check if the feature actually exists before trying to set state
       const features = mapInstance.querySourceFeatures('manholes', {
          filter: ['==', 'id', selectedManholeId]
       });
       if (features.length > 0) {
          try {
              mapInstance.setFeatureState(
                { source: 'manholes', id: selectedManholeId },
                { selected: true }
              );
          } catch (e) { console.warn("Could not select new feature:", e.message); }
       } else {
           console.warn(`Manhole ID ${selectedManholeId} not found in source.`);
       }
    }

    // C. Update the ref to store the CURRENTLY selected ID for the next time
    selectedManholeIdRef.current = selectedManholeId;

    // No need to call drawLayers here anymore

  }, [selectedManholeId]); // Re-run only when the selected ID prop changes

  // --- 7. Effect to fly to a location (Unchanged) ---
  useEffect(() => {
    if (!map.current || !flyToLocation) return;
    try {
        if (flyToLocation.bounds) {
            map.current.fitBounds(flyToLocation.bounds, { padding: flyToLocation.padding || 40, duration: 1000 });
        } else if (flyToLocation.center) {
            map.current.flyTo({ center: flyToLocation.center, zoom: flyToLocation.zoom || 18, duration: 1000 });
        }
    } catch (e) {
        console.error("Error flying to location:", e.message);
    }
  }, [flyToLocation]);

  return (
    <div ref={mapContainer} className="h-full w-full " />
  );
};

export default memo(MapboxCore);