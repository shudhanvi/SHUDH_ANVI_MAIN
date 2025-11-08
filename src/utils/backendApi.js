
export const backendApi = {
    // baseUrl: "http://192.168.1.35:8080",
    // baseUrl: "http://10.102.189.129:8080",
    // baseUrl: "https://shudh-all-backend.onrender.com",
    // baseUrl: " https://sewage-fast-backend-295884782547.us-central1.run.app",
    baseUrl: "https://shudh-all-backend-docker-295884782547.asia-south1.run.app/"
};

backendApi.analyze = `${backendApi.baseUrl}/analytics/analyze`;
backendApi.manholesReportUrl = `${backendApi.baseUrl}/analytics/analyze/manholes`;
backendApi.robotsReportUrl =`${backendApi.baseUrl}/analytics/analyze/robots`;
backendApi.wardsReportUrl = `${backendApi.baseUrl}/analytics/analyze/ward`;
backendApi.manholeData = `${backendApi.baseUrl}/database/table/ManHoles_Data`;
backendApi.robotData = `${backendApi.baseUrl}/database/table/Robo_Operations`;
backendApi.mhData = `${backendApi.baseUrl}/database/table/ManHoles_Data_MH`;
backendApi.operationsdata = `${backendApi.baseUrl}/database/table/operations`;
backendApi.warddata = `${backendApi.baseUrl}/database/table/Ward_Coordinates`;


const Url = {
    waterlevel: "https://blynk.cloud/external/api/get?token=uIoyHjYevzfdrBa0gYu-VYfuFqFurr6q&dataStreamId=2",
    manholeData: "/datafiles/CSVs/MH.csv",
    wardCordinates: "/datafiles/CSVs/ward_coordinates.csv",
    wardsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/ward",
    manholereportscomp: "/datafiles/CSVs/ManHoles_Data.csv",
   // robotrepocomp: "/datafiles/CSVs/Robo_Operations_copy.csv",
    robotsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/robot",
    manholesReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/manholes",
    operations: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/operations",
    serverdatacontx: "https://sewage-bot.onrender.com/api/data",
    robooperationcsv: "/datafiles/CSVs/Robo_Operations.csv",

}