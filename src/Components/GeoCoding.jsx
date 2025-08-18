import { useCallback } from "react";

// --- Custom Hook for Geocoding (Nominatim API) ---
const useGeoCode = () => {
  const geocodeArea = useCallback(async (query) => {
    let fullQuery = query;

    // Append "Hyderabad, India" if not already present in the query
    if (
      !query.toLowerCase().includes("hyderabad") &&
      !query.toLowerCase().includes("india")
    ) {
      fullQuery += ", Hyderabad, India";
    }

    const baseUrl = "https://nominatim.openstreetmap.org/search?";
    const headers = {
      "User-Agent": "SewageBotWebApp/1.0 (anvirobot25@gmail.com)", // replace with your own email
    };
    const params = new URLSearchParams({
      q: fullQuery,
      format: "json",
      limit: 1,
      polygon_geojson: 1,
      addressdetails: 1,
      extratags: 1,
    }).toString();

    try {
      const response = await fetch(baseUrl + params, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // console.log('map data', data)
      if (data && data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        const geojson = firstResult.geojson;
        const displayName = firstResult.display_name;

        let boundingBox = null;
        if (firstResult.boundingbox) {
          boundingBox = [
            parseFloat(firstResult.boundingbox[0]),
            parseFloat(firstResult.boundingbox[1]),
            parseFloat(firstResult.boundingbox[2]),
            parseFloat(firstResult.boundingbox[3]),
          ];
        }

        return {
          lat,
          lon,
          geojson,
          displayName,
          boundingBox,
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error (Nominatim search):", error);
      return null;
    } finally {
      // Adhere to Nominatim Usage Policy - add a small delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }, []);

  return geocodeArea;
}


export default useGeoCode;