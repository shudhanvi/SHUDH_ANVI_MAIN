import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { LocateFixed } from "lucide-react";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2h1YmhhbWd2IiwiYSI6ImNtZDV2cmJneDAydngyanFzaW1oNTM3M24ifQ.7Jb5OXpznWqjyMeAuiXhrQ";

const MiniMap = ({ locations = [], height = "300px", width = "50%" }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // Store initial center & zoom
  const initialCenterRef = useRef(null);
  const initialZoomRef = useRef(13);

  // ✅ Location Validator
  const isValidLocation = (lat, lon) => {
    return (
      lat !== null &&
      lon !== null &&
      lat !== undefined &&
      lon !== undefined &&
      !isNaN(lat) &&
      !isNaN(lon) &&
      !(lat === 0 && lon === 0) // ❗Block 0,0
    );
  };

  useEffect(() => {

    // ✅ Filter invalid locations
    const validLocations = locations.filter((loc) =>
      isValidLocation(loc.lat, loc.lon)
    );

    if (!validLocations.length) return;

    // Cleanup previous map
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch {}
      mapRef.current = null;
    }

    // Use first valid location
    const centerLat = validLocations[0].lat;
    const centerLon = validLocations[0].lon;

    // Save initial view
    initialCenterRef.current = [centerLon, centerLat];

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/shubhamgv/cmisnppz5000c01r9hurc66f2",
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
    });

    mapRef.current = map;

    map.on("load", () => {
      const bounds = new mapboxgl.LngLatBounds();

      // ✅ Add only valid markers
      validLocations.forEach((loc) => {
        new mapboxgl.Marker({ color: "#60a5fa" })
          .setLngLat([loc.lon, loc.lat])
          .addTo(map);

        bounds.extend([loc.lon, loc.lat]);
      });

      // Fit map
      if (validLocations.length > 1) {
        map.fitBounds(bounds, { padding: 40 });
      } else {
        map.setCenter(initialCenterRef.current);
        map.setZoom(initialZoomRef.current);

        setTimeout(() => {
          map.resize();
        }, 50);
      }
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };

  }, [locations]);

  // 🔵 Recenter Button
  const handleRecenter = () => {
    if (!mapRef.current || !initialCenterRef.current) return;

    mapRef.current.flyTo({
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      speed: 3,
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: "8px",
      }}
    >
      {/* Map container */}
      <div
        ref={mapContainer}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        style={{
          position: "absolute",
          bottom: "12px",
          right: "12px",
          padding: "6px 10px",
          fontSize: "12px",
          background: "white",
          borderRadius: "6px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <LocateFixed size={16} />
      </button>
    </div>
  );
};

export default MiniMap;
