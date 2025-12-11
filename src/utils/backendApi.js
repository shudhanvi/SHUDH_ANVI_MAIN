
export const backendApi = {
    // baseUrl: "http://192.168.1.35:8080",
    // baseUrl: "http://192.168.1.50:8080",


    // baseUrl: "https://shudh-all-backend.onrender.com",
    // baseUrl: "http://10.57.159.9:8080",
    // baseUrl: "http://10.57.159.230:8080",

    // baseUrl: "http://10.102.189.129:8080",
  baseUrl: "https://shudh-all-backend-docker-295884782547.asia-south1.run.app" ,
    baseUrl1: "https://shudh-weather-main.onrender.com",

};

backendApi.analyze = `${backendApi.baseUrl1}/analytics/analyze`;
backendApi.manholesReportUrl = `${backendApi.baseUrl}/analytics/analyze/manholes`;
backendApi.robotsReportUrl = `${backendApi.baseUrl}/analytics/analyze/robots`;
backendApi.wardsReportUrl = `${backendApi.baseUrl}/analytics/analyze/ward`;

// backendApi.manholeData = `${backendApi.baseUrl}/database/table/somajiguda_manholes`;
backendApi.manholeData = `${backendApi.baseUrl}/database/table/somajiguda_manholes_data?limit=3000`;

// backendApi.robotData = `${backendApi.baseUrl}/database/table/somajiguda_operations`;
backendApi.robotData = `${backendApi.baseUrl}/database/table/somajiguda_operations_data?limit=120000`;

//  backendApi.mhData = `${backendApi.baseUrl}/database/table/ManHoles_Data`;
backendApi.operationsdata = `${backendApi.baseUrl}/database/table/operations`;
backendApi.warddata = `${backendApi.baseUrl}/database/table/ward_coordinates`;

backendApi.weatherdata = `${backendApi.baseUrl1}/weather/area/somajiguda `;


const Url = {
    waterlevel: "https://blynk.cloud/external/api/get?token=uIoyHjYevzfdrBa0gYu-VYfuFqFurr6q&dataStreamId=2",
    wardsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/ward",
    robotsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/robot",
    manholesReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/manholes",
    operations: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/operations",
    serverdatacontx: "https://sewage-bot.onrender.com/api/data",



}
