
export const backendApi = {
    // baseUrl: "http://192.168.1.35:8080",
    // baseUrl: "http://192.168.1.22:8000",
    // baseUrl: "http://10.102.189.129:8080",
    // baseUrl: "https://shudh-all-backend.onrender.com",
  baseUrl: "https://shudh-all-backend-docker-295884782547.asia-south1.run.app"
};

backendApi.analyze = `${backendApi.baseUrl}/analytics/analyze`;
backendApi.manholesReportUrl = `${backendApi.baseUrl}/analytics/analyze/manholes`;
backendApi.robotsReportUrl =`${backendApi.baseUrl}/analytics/analyze/robots`;
backendApi.wardsReportUrl = `${backendApi.baseUrl}/analytics/analyze/ward`;
backendApi.manholeData = `${backendApi.baseUrl}/database/table/somajiguda_manholes`;
// backendApi.somajigudaData = `${backendApi.baseUrl}/database/table/somajiguda_manholes`;
backendApi.robotData = `${backendApi.baseUrl}/database/table/somajiguda_operations`;
backendApi.operationsdata = `${backendApi.baseUrl}/database/table/operations`;
backendApi.warddata = `${backendApi.baseUrl}/database/table/ward_coordinates`;
 

const Url = {
    waterlevel: "https://blynk.cloud/external/api/get?token=uIoyHjYevzfdrBa0gYu-VYfuFqFurr6q&dataStreamId=2",
    wardsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/ward",
    robotsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/robot",
    manholesReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/manholes",
    operations: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/operations",
    serverdatacontx: "https://sewage-bot.onrender.com/api/data",
    
     
 
}