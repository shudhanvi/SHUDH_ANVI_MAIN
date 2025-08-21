import DashAccordian from "./DashAccordian";

const ManholePopUp = ({
  selectedLocation,
  // selectedOps,
  onClose,
  onGenerateReport,
}) => {
  if (!selectedLocation) return null;

  // console.log("selectedOps in manholDetails.jsx : ", selectedLocation);
  const getStatusIcon = (type) => {
    console.log(type);
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
    
    switch (type) {
      case "safe":
      case "good":
      case "fair":
        return safeIcon;
      case "poor":
      case "warning":
        return warningIcon;
      case "danger":
      case "critical":
        return dangerIcon;
      default:
        return nullIcon;
    }
  };

  const locationDetails = {
    area: "Hasmathpet",
    primaryLine: "PVC",
    junctionType: "Cross-Junction",
    blockageLevel:
      selectedLocation.type === "danger"
        ? 85
        : selectedLocation.type === "warning"
        ? 15
        : 5,
    waterFlow:
      selectedLocation.type === "danger"
        ? 15
        : selectedLocation.type === "warning"
        ? 85
        : 95,
  };

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
              {getStatusIcon(selectedLocation.type)}
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
          <p className="text-black text-lg">{locationDetails.blockageLevel}%</p>
          <p className="text-[10px] text-[#0000008A]">Blockage</p>
        </div>
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s shadow-gray-300">
          <p className="text-black text-lg">{locationDetails.waterFlow}%</p>
          <p className="text-[10px] text-[#0000008A]">Water Flow Depth</p>
        </div>
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s> shadow-gray-300">
          <p className="text-black text-lg">
            {locationDetails?.riskLevel || "50"}%
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
