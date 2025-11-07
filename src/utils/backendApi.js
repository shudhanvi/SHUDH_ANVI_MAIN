// export const backendApi = {
//     // baseUrl: "http://192.168.1.38:8080",
//     // analyze: "http://192.168.1.38:8080/analytics/analyze",
//     // manholesReportUrl: "http://192.168.1.38:8080/analytics/analyze/manholes",
//     // robotsReportUrl: "http://192.168.1.38:8080/analytics/analyze/robot",
//     // wardsReportUrl: "http://192.168.1.38:8080/analytics/analyze/ward",

    
//     // baseUrl: "http://192.168.1.38:5001",
//     // analyze: "http://192.168.1.38:5001/api/analyze",
//     // manholesReportUrl: "http://192.168.1.38:5001/api/analyze/manhole",
//     // robotsReportUrl: "http://192.168.1.38:5001/api/analyze/robot",
//     // wardsReportUrl: "http://192.168.1.38:5001/api/analyze/ward",
//     // operations: "http://192.168.1.38:5001/api/analyze/operations",

//     // {render-old backend}

//     // baseUrl: "https://shudh-fastapi-backend-1.onrender.com",
//     // analyze: "https://shudh-fastapi-backend-1.onrender.com/api/analyze",
//     // manholesReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/manholes",
//     // robotsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/robot",
//     // wardsReportUrl: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/ward",
//     // operations: "https://shudh-fastapi-backend-1.onrender.com/api/analyze/operations",

//     // {Render-new backend}
//     // baseUrl: "https://shudh-all-backend.onrender.com",
//     // analyze: "https://shudh-all-backend.onrender.com/analytics/analyze",
//     // manholesReportUrl: "https://shudh-all-backend.onrender.com/analytics/analyze/manholes",
//     // robotsReportUrl: "https://shudh-all-backend.onrender.com/analytics/analyze/robots",
//     // wardsReportUrl: "https://shudh-all-backend.onrender.com/analytics/analyze/ward",
//     // manholeData:"https://shudh-all-backend.onrender.com/database/table/ManHoles_Data",
//     // robotData:"https://shudh-all-backend.onrender.com/database/table/Robo_Operations",
//     // mhData:"https://shudh-all-backend.onrender.com/database/table/ManHoles_Data_MH",
//     // operationsdata:"https://shudh-all-backend.onrender.com/database/table/operations",
//     // warddata:"https://shudh-all-backend.onrender.com/database/table/Ward_Coordinates",
     
// // https://sewage-fast-backend-295884782547.us-central1.run.app/

//     // operations: "https://shudh-all-backend.onrender.com/analytics/analyze/operations",
//     // https://shudh-all-backend.onrender.com


//     baseUrl: "http://192.168.1.38:8080/",
//     analyze: ${this.baseUrl}/analytics/analyze,
//     manholesReportUrl: "http://192.168.1.38:8080/analytics/analyze/manholes",
//     robotsReportUrl: "http://192.168.1.38:8080/analytics/analyze/robots",
//     wardsReportUrl: "http://192.168.1.38:8080/analytics/analyze/ward",
//     manholeData:"http://192.168.1.38:8080/database/table/ManHoles_Data",
//     robotData:"http://192.168.1.38:8080/database/table/Robo_Operations",
//     mhData:"http://192.168.1.38:8080/database/table/ManHoles_Data_MH",
//     operationsdata:"http://192.168.1.38:8080/database/table/operations",
//     warddata:"http://192.168.1.38:8080/database/table/Ward_Coordinates"






//     //   baseUrl: " https://sewage-fast-backend-295884782547.us-central1.run.app",
//     // analyze: " https://sewage-fast-backend-295884782547.us-central1.run.app/analytics/analyze",
//     // manholesReportUrl: " https://sewage-fast-backend-295884782547.us-central1.run.app/analytics/analyze/manholes",
//     // robotsReportUrl: " https://sewage-fast-backend-295884782547.us-central1.run.app/analytics/analyze/robots",
//     // wardsReportUrl: " https://sewage-fast-backend-295884782547.us-central1.run.app/analytics/analyze/ward",
//     // manholeData:" https://sewage-fast-backend-295884782547.us-central1.run.app/database/table/ManHoles_Data",
//     // robotData:" https://sewage-fast-backend-295884782547.us-central1.run.app/database/table/Robo_Operations",
//     // mhData:" https://sewage-fast-backend-295884782547.us-central1.run.app/database/table/ManHoles_Data_MH",
//     // operationsdata:" https://sewage-fast-backend-295884782547.us-central1.run.app/database/table/operations",
//     // warddata:" https://sewage-fast-backend-295884782547.us-central1.run.app/database/table/Ward_Coordinates",
//     // temp: ${this.operationsdata}jjhghj
     
// }

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