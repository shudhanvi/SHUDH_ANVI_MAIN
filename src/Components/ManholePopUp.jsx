import DashAccordian from "./DashAccordian";


const ManholePopUp = ({
  selectedLocation,
  // selectedOps,
  onClose,
  onGenerateReport,
}) => {
  if (!selectedLocation) return null;

  
  const getStatusIcon = (lastCleaned) => {
    // console.log(lastCleaned);
    const safeIcon = (
      <div className="bg-[#16A249] rounded-full w-[15px] h-[15px] aspect-square border-2 border-white shadow-md shadow-[0px 3.36px 5.04px -3.36px #0000001A;]"></div>
    );
    const warningIcon = (
      <div className="bg-[#E7B008] rounded-full w-[15px] h-[15px] aspect-square border-2 border-white shadow-md shadow-[0px 3.36px 5.04px -3.36px #0000001A;]"></div>
    );
    const dangerIcon = (
      <div className="bg-[#EF4343] rounded-full w-[15px] h-[15px] aspect-square border-2 border-white shadow-md shadow-[0px 3.36px 5.04px -3.36px #0000001A;]"></div>
    );
    const nullIcon = (
      <div className="bg-black rounded-full w-[15px] h-[15px] aspect-square border-2 border-white shadow-md shadow-[0px 3.36px 5.04px -3.36px #0000001A;]"></div>
    );
    
    
   if (!lastCleaned) return nullIcon; // fallback if no date

  const today = new Date();
  const diffTime = today - new Date(lastCleaned); // difference in ms
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert to days

  switch (true) {
    case days <= 5:
      return safeIcon;
    case days <= 7:
      return warningIcon;
    default:
      return dangerIcon;
  }
};
  
  const locationDetails = {
    area: "Hasmathpet",
    primaryLine: "PVC",
    junctionType: "Cross-Junction",
    // blockageLevel:
    //   selectedLocation.type === "danger"
    //     ? 85
    //     : selectedLocation.type === "warning"
    //     ? 15
    //     : 5,
    // waterFlow:
    //   selectedLocation.type === "danger"
    //     ? 15
    //     : selectedLocation.type === "warning"
    //     ? 85
    //     : 95,

  };




const depth = selectedLocation.raw.depth_manhole_m; // default depth if not provided
const waterLevel = selectedLocation.raw.water_level_m;
console.log("depth:", depth, "waterLevel:", waterLevel);

// Calculate risk level based on depth and water level
  function riskLevel(depth, waterLevel) {
    if (depth <= 0) return 0; // avoid division by zero
    let risk = (waterLevel / depth) * 100;

  // clamp between 0–100
  if (risk > 100) risk = 100;
  if (risk < 0) risk = 0;

  return parseFloat(risk.toFixed(1)); 
};
const risk = riskLevel(depth, waterLevel);
console.log("risk level:", risk);


  console.log("selectedLocation.type:", selectedLocation.raw.condition);

  return (
    <div className="manhole-popup-box bg-grey-50 rounded-xl border-1 border-t-0 border-[#333] w-full">
      {/* Header */}
      <div className="w-full flex justify-between rounded-xl align-middle place-items-center gap-2 p-4 border-y-1 border-b-gray-300 sticky top-0 bg-white">
        <h4 className="font-[600]">Manhole Details</h4>
        <button
          onClick={() => onClose()}
          className="cursor-pointer text-black hover:text-gray-700 hover:rotate-180 transition-all duration-110"
        >
          <span className="text-2xl font-bold">&#x2715;</span>
        </button>
      </div>

      <div className="w-[95%] m-auto rounded-xl flex justify-center align-middle p-3 my-4 gap-2 bg-[#FEF9E6]">
        <div className="manholePopupBox1 w-full flex flex-col justify-center gap-2 text-[12px] text-left text-[#717182]">
          <h4 className="font-[400] grid grid-cols-2">
            Manhole :{" "}
            <span className="font-[500] text-right text-[#0A0A0A] flex justify-end align-middle items-center gap-1">
              {getStatusIcon(selectedLocation.lastCleaned)}
              {selectedLocation.manhole_id}
            </span>{" "}
          </h4>
          <h4 className="font-[400] grid grid-cols-2">
            Ward :{" "}
            <span className="font-[400] text-right text-[#0A0A0A]">
              {locationDetails.area}
            </span>{" "}
          </h4>
          <h4 className="font-[400] grid grid-cols-2">
            Location :{" "}
            <span className="text-[12px] text-right text-[#0A0A0A]">
              {selectedLocation.latitude.toFixed(6)},{" "}
              {selectedLocation.longitude.toFixed(6)}
            </span>{" "}
          </h4>
        </div>
      </div>

      <div className="p-2 w-full grid grid-cols-3 gap-2 place-items-center">
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s> shadow-gray-300">
          <p className="text-black text-lg">{depth||"-"}{" m"}</p>
          <p className="text-[10px] text-[#0000008A]">Depth of Manhole</p>
        </div>
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s shadow-gray-300">
          <p className="text-black text-lg">{waterLevel || "-"}{" m"}</p>
          <p className="text-[10px] text-[#0000008A]">Water Level</p>
        </div>
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s> shadow-gray-300">
          <p className="text-black text-lg">
            {risk || "50"}%
          </p>
          <p className="text-[10px] text-[#0000008A]">Risk Level</p>
        </div>
      </div>

      {/* Accordian */}
      <div>
        {/* #FEF9E6  */}
        <DashAccordian />
      </div>

      {/* Generate Report, Book Bot Button */}
      <div className="w-full flex justify-around overflow-hidden align-middle gap-2 my-4 px-2 pb-5">
        <button
          onClick={() => onGenerateReport("maintenance")}
          className="manhole-popup-btn w-1/2 text-[10px] whitespace-nowrap self-center border-1 border-[#16A249] text-[#16A249] hover:text-white hover:bg-[#16A249] px-6 py-2 rounded-lg font-medium cursor-pointer btn-hover transition-all"
        >
          Generate Report
        </button>
        <button
          onClick={() => {
            onClose();
            confirm("Successfully booked a bot.");
          }}
          className="manhole-popup-btn w-1/2 text-[10px] whitespace-nowrap self-center bg-[#1E9AB0] text-white px-6 py-2 rounded-lg font-medium cursor-pointer btn-hover transition-all duration-120"
        >
          Assign a Bot
        </button>
      </div>
    </div>
  );
};

export default ManholePopUp;
