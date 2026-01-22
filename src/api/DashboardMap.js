import axios from "axios";
import { backendApi } from "../utils/backendApi";

// 1. Fetch Manhole Data (With Building Injection)
export const fetchManholeData = async (division = "", section = "", zone = "") => {
  if (!section || section === "All") return [];
  
  const cleanZone = (zone && zone !== "All") ? zone : null;
  console.log("📡 API Sending:", { division, section, zone: cleanZone });

  try {
    // A. Standard Data
    const backendResponse = await axios.post(backendApi.mapboxData, {
      division,
      section,
      zone: cleanZone,
    });

    let finalData = backendResponse.data || {};

    // B. 🟢 Inject External Buildings for Somajiguda
    if (String(section).toLowerCase().includes("somajiguda")) {
        console.log("🏗️ Detected Somajiguda: Fetching external buildings...");
        
        try {
            const PROXY_URL = backendApi.building_data;
            
            // ✅ FIX: Axios usage
            const buildingRes = await axios.post(PROXY_URL, { section: section });
            
            // Axios returns data in .data, and status in .status
            if (buildingRes.status === 200 && buildingRes.data) {
                console.log(`✅ Successfully injected buildings`);
                finalData.buildings = buildingRes.data; // Assign direct JSON data
            }
        } catch (bErr) {
            console.error("❌ External Building Fetch Error:", bErr);
        }
    }

    return finalData;

  } catch (error) {
    console.error("❌ Manhole Fetch Error:", error);
    return [];
  }
};