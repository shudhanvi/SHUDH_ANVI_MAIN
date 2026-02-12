// Main BaseUrl
export const backendApi = {
    // baseUrl: "http://127.0.0.1:8080",
    //  baseUrl: "http://192.168.1.36:8080",
    // baseUrl: "https://project-shudh-backend-v2.onrender.com",
    // baseUrl: "http://192.168.1.25:8080",
    // baseUrl: "https://project-shudh-backend-v2.onrender.com",
    // baseUrl: "https://shudh-all-backend-p0pj.onrender.com",
    // baseUrl: "https://shudh-all-backend-docker-295884782547.asia-south1.run.app",
    baseUrl: "https://shudh-backend-513543483458.asia-south1.run.app",
};

// ===================== Dashboard page ====================
backendApi.dropdowndata =  `${backendApi.baseUrl}/data/dropdown_data`;
backendApi.mapboxData =  `${backendApi.baseUrl}/data/dashboard/mapdata`;
backendApi.building_data = `${backendApi.baseUrl}/gis/section-geojson`;
// Maintainence Data from Auto Analytics from All Operations Data
backendApi.maintainenceData = `${backendApi.baseUrl}/data/maintainance`;



// ===================== Robots page ====================
backendApi.robots = `${backendApi.baseUrl}/data/robots`
backendApi.robotoperations = `${backendApi.baseUrl}/data/robot/operations`



// ===================== Reports page ====================
backendApi.zonesurl = `${backendApi.baseUrl}/data/reports/dockets`
backendApi.manholesurl = `${backendApi.baseUrl}/data/reports/dockets/manholes`
backendApi.robotsListUrl = `${backendApi.baseUrl}/data/reports/robots_Ids`
// Analytics Generating Route Urls 
backendApi.manholesReportUrl = `${backendApi.baseUrl}/analytics/manholes`;
backendApi.robotsReportUrl = `${backendApi.baseUrl}/analytics/robots`;
backendApi.wardsReportUrl = `${backendApi.baseUrl}/analytics/ward`;




// OLD URLS
// backendApi.dropdowndata =  `${backendApi.baseUrl}/database/table/dropdown_data`;
// // ===================== Data Route Urls ==========================================================
// backendApi.dropdowndata =  `${backendApi.baseUrl}/database/table/dropdown_data`;
// // Manholes - Somajiguda
// backendApi.manholeData = `${backendApi.baseUrl}/database/table/somajiguda_manholes_data?limit=3000`;
// // Robot Operations - Somajiguda
// backendApi.robotData = `${backendApi.baseUrl}/database/table/somajiguda_operations_data?limit=120000`;
// // Ward Co-ordiantes with lat,long's
// backendApi.warddata = `${backendApi.baseUrl}/database/table/ward_coordinates`;
// // Weather of Area wize from area centroid lat,long of all manholes
// backendApi.weatherdata = `${backendApi.baseUrl}/weather/area/somajiguda`;
// // All Robot Operations - All Areas
// backendApi.operationsdata = `${backendApi.baseUrl}/database/table/data_operations`;
 
 
 



