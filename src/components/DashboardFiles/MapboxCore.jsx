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
  statusFilter,
  selectedManholeId,
  flyToLocation,
  formatExcelDate,
  onManholeClick,
  onManholeDeselect,
  getManholeDateById 
}) => {
  const mapContainer = useRef(null);
  const popup = useRef(new mapboxgl.Popup({ offset: 15, closeOnClick: false, closeButton: false })); 
  const selectedManholeIdRef = useRef(null);
  const isPopupPinned = useRef(false);

  const manholeDataRef = useRef(manholeGeoJSON);
  const wardDataRef = useRef(wardGeoJSON);
  const statusFilterRef = useRef(statusFilter);

  useEffect(() => { manholeDataRef.current = manholeGeoJSON; }, [manholeGeoJSON]);
  useEffect(() => { wardDataRef.current = wardGeoJSON; }, [wardGeoJSON]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);

  const drawLayers = useCallback(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    const mapInstance = mapRef.current; 

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

      if (mapInstance.getLayer("manhole-dots")) {
        const filterExpr = statusFilterRef.current === "all" ? null : ["==", ["get", "status"], statusFilterRef.current];
        try { mapInstance.setFilter("manhole-dots", filterExpr); } catch (e) {}
      }
      try { mapInstance.removeFeatureState({ source: 'manholes' }); } catch (e) {}  
      if (selectedManholeIdRef.current !== null) {
        const features = mapInstance.querySourceFeatures('manholes', { filter: ['==', 'id', selectedManholeIdRef.current] });
        if (features.length > 0) {
          try { mapInstance.setFeatureState({ source: 'manholes', id: selectedManholeIdRef.current }, { selected: true }); } catch(e) {}
        }
      }
    } catch (e) { console.error("Error drawing manhole layer:", e.message); }

    try {
      const currentWardData = wardDataRef.current;
      const hasData = currentWardData && currentWardData.geometry && currentWardData.geometry.coordinates && currentWardData.geometry.coordinates[0]?.length >= 4;
      let wardSource = mapInstance.getSource("ward-polygon-source");
      try {
        if (mapInstance.getLayer("ward-polygon-layer")) mapInstance.removeLayer("ward-polygon-layer");
        if (mapInstance.getLayer("ward-outline-layer")) mapInstance.removeLayer("ward-outline-layer");
      } catch(e) {}

      if (wardSource && !hasData) {
        try { mapInstance.removeSource("ward-polygon-source"); } catch(e) {}
      } else if (hasData) {
        if (wardSource) wardSource.setData(currentWardData);
        else try { mapInstance.addSource("ward-polygon-source", { type: "geojson", data: currentWardData }); } catch(e) {}
        if(mapInstance.getSource("ward-polygon-source")){
            try {
                if (!mapInstance.getLayer("ward-polygon-layer")) mapInstance.addLayer({ id: "ward-polygon-layer", type: "fill", source: "ward-polygon-source", paint: { "fill-color": "#1d4ed8", "fill-opacity": 0.1 } });
                if (!mapInstance.getLayer("ward-outline-layer")) mapInstance.addLayer({ id: "ward-outline-layer", type: "line", source: "ward-polygon-source", paint: { "line-color": "#1d4ed8", "line-width": 2 } });
            } catch(e) {}
        }
      }
    } catch (e) {}
  }, [mapRef]); 

  useEffect(() => {
    if (mapRef.current) return;
    if (!styleUrl) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [78.4794, 17.3940],
      zoom: 9.40,
    });
    mapRef.current = mapInstance;
    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-left");

    const handleStyleLoad = () => {
      const centerVal = centerToRestore?.current;
      const zoomVal = zoomToRestore?.current;
      drawLayers(); 
      if (centerVal && zoomVal !== null) {
        mapInstance?.jumpTo({ center: centerVal, zoom: zoomVal });
        if(centerToRestore) centerToRestore.current = null;
        if(zoomToRestore) zoomToRestore.current = null;
      }
    };

    mapInstance.on("load", drawLayers);
    mapInstance.on("style.load", handleStyleLoad);

    const resolveDate = (feature) => {
        const popupId = String(feature.properties.id);
        // Try live lookup first
        let resolvedDate = getManholeDateById(popupId);
        // Fallback to GeoJSON properties (handles 'safe' defaults)
        if (!resolvedDate) {
            resolvedDate = feature.properties.date_for_status || feature.properties.timestamp || feature.properties.start_time;
        }
        return resolvedDate;
    };

    const createPopupHTML = (id, dateValue) => {
        let displayDate = "No Record";
        if (dateValue) {
            displayDate = formatExcelDate(dateValue);
        }
        return `
          <div id="mhpop" style="font-size: 12px; padding: 4px; text-align: center; background-color: white; border-radius: 3px; color: #333;">
            <strong>ID:</strong> ${id}<br/>
            <strong>Last Cleaned:</strong> ${displayDate}
          </div>`;
    };

    mapInstance.on("click", "manhole-dots", (e) => {
      const clickedFeature = e.features[0];
      if (!clickedFeature || !onManholeClick) return;
      popup.current.remove(); 
      onManholeClick(clickedFeature);

      const feature = clickedFeature;
      const popupId = String(feature.properties.id ?? 'N/A');
      const dateValue = resolveDate(feature);

      popup.current.setLngLat(feature.geometry.coordinates)
           .setHTML(createPopupHTML(popupId, dateValue))
           .addTo(mapInstance);
      isPopupPinned.current = true; 
    });

    mapInstance.on('click', (e) => { 
      if (!mapInstance) return;
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['manhole-dots'] });
      if (!features.length) { 
         popup.current.remove(); 
         isPopupPinned.current = false; 
         if (selectedManholeIdRef.current && onManholeDeselect) onManholeDeselect(); 
      }
    });

    mapInstance.on("mouseenter", "manhole-dots", (e) => {
      if (!mapInstance) return;
      mapInstance.getCanvas().style.cursor = "pointer";
      if (isPopupPinned.current) return; 

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const popupId = String(feature.properties.id ?? 'N/A');
        const dateValue = resolveDate(feature);
        popup.current.setLngLat(feature.geometry.coordinates)
             .setHTML(createPopupHTML(popupId, dateValue))
             .addTo(mapInstance);
      }
    });

    mapInstance.on("mouseleave", "manhole-dots", () => {
       if (!mapInstance) return;
      mapInstance.getCanvas().style.cursor = "";
      if (!isPopupPinned.current) popup.current.remove();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [styleUrl, mapRef, centerToRestore, zoomToRestore, onManholeClick, onManholeDeselect, formatExcelDate, drawLayers, getManholeDateById]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded() || !mapRef.current.loaded()) return;
    const currentStyle = mapRef.current.getStyle();
    if (!currentStyle || currentStyle.url === styleUrl) return;
    mapRef.current.setStyle(styleUrl);
  }, [styleUrl, mapRef]);

  useEffect(() => { if (mapRef.current && mapRef.current.isStyleLoaded()) drawLayers(); }, [manholeGeoJSON, wardGeoJSON, mapRef, drawLayers]);
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded() || !mapRef.current.getLayer("manhole-dots")) return;
    try {
      const filterExpr = statusFilter === "all" ? null : ["==", ["get", "status"], statusFilter];
      mapRef.current.setFilter("manhole-dots", filterExpr);
    } catch (e) {}
  }, [statusFilter, mapRef]);

  useEffect(() => {
    selectedManholeIdRef.current = selectedManholeId; 
    if (mapRef.current && mapRef.current.isStyleLoaded()) drawLayers(); 
     if(selectedManholeId === null) {
       isPopupPinned.current = false;
       popup.current.remove(); 
     }
  }, [selectedManholeId, mapRef, drawLayers]);

  useEffect(() => {
    if (!mapRef.current || !flyToLocation) return;
    try {
      if (flyToLocation.bounds) {
        isPopupPinned.current = false;
        popup.current.remove();
        mapRef.current.fitBounds(flyToLocation.bounds, { padding: flyToLocation.padding || 40, duration: 1000 });
      } else if (flyToLocation.center) {
        const currentCenter = mapRef.current.getCenter();
        const targetCenter = flyToLocation.center;
        const dist = Math.sqrt(Math.pow(currentCenter.lng - targetCenter[0], 2) + Math.pow(currentCenter.lat - targetCenter[1], 2));
        if (dist > 0.00001) mapRef.current.flyTo({ center: targetCenter, zoom: flyToLocation.zoom || 18, duration: 1000 });
        else if(mapRef.current.getZoom() !== (flyToLocation.zoom || 18)) mapRef.current.zoomTo(flyToLocation.zoom || 18, {duration: 500});
      }
    } catch (e) {}
  }, [flyToLocation, mapRef]);

  return <div ref={mapContainer} className="h-full w-full " />;
};

export default memo(MapboxCore);