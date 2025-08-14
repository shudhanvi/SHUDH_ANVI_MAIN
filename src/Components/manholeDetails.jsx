import DashAccordian from "./DashAccordian";

const ManholeDetails = ({ selectedLocation, selectedOps, onClose, onGenerateReport }) => {
  if (!selectedLocation) return null;

  const getStatusColor = (type) => {
    switch (type) {
      case 'safe': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'safe': return '🟢';
      case 'warning': return '🟡';
      case 'danger': return '🔴';
      default: return '⚪';
    }
  };

  const locationDetails = {
    area: "Hasmathpet",
    primaryLine: "PVC",
    junctionType: "Cross-Junction",
    blockageLevel: selectedLocation.type === 'danger' ? 85 : selectedLocation.type === 'warning' ? 15 : 5,
    waterFlow: selectedLocation.type === 'danger' ? 15 : selectedLocation.type === 'warning' ? 85 : 95
  };

  return (
    <div className="manhole-popup-box bg-grey-50 rounded-xl border-1 border-gray-300 shadow-md shadow-gray-500 w-96 max-w-[90vw] max-h-[90vh] overflow-hidden overflow-y-auto">
      {/* Header */}
      <div className="w-full flex justify-between align-middle place-items-center gap-2 p-4 border-b-1 border-b-gray-300">
        <h4 className="font-[600]">Manhole Details</h4>
        <button onClick={onClose} className="cursor-pointer text-black hover:text-gray-700 hover:rotate-180 transition-all duration-110">
          <span className="text-2xl font-bold">&#x2715;</span>
        </button>
      </div>

      <div className="w-[95%] m-auto rounded-xl flex justify-center align-middle p-3 my-4 gap-2 bg-[#FEF9E6]">
        <div className="flex flex-col justify-center gap-1.5 text-left w-max">
          <h4 className="text-sm font-[400] grid grid-cols-2">Manhole : <span className="font-[600] text-left">{selectedLocation.manhole_id}</span> </h4>
          <h4 className="text-sm font-[400] grid grid-cols-2">Ward : <span className="font-[400] text-left">{locationDetails.area}</span> </h4>
          <h4 className="text-sm font-[400] grid grid-cols-2">Location : <span className="text-[12px] text-left">{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}</span> </h4>
        </div>
        <button
            onClick={() => onGenerateReport('maintenance')}
            className="text-[12px] whitespace-nowrap w-auto self-center bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium cursor-pointer btn-hover transition-all"
          >
            Generate Report
          </button>
      </div>

      <div className="p-2 w-full grid grid-cols-3 place-items-center">
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s> shadow-gray-300">
          <p className="text-black text-lg">{locationDetails.blockageLevel}%</p>
          <p className="text-[10px] text-[#0000008A]">Blockage</p>
        </div>
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s shadow-gray-300">
          <p className="text-black text-lg">{locationDetails.waterFlow}%</p>
          <p className="text-[10px] text-[#0000008A]">Water Flow</p>
        </div>
        <div className="w-full p-2 text-center place-content-center aspect-square max-w-[100px] bg-[#F3F4F6] rounded-xl shadow-s> shadow-gray-300">
          <p className="text-black text-lg">{locationDetails?.riskLevel || '50' }%</p>
          <p className="text-[10px] text-[#0000008A]">Risk Level</p>
        </div>
      </div>

      {/* Accordian */}
      <div>
        {/* #FEF9E6  */}
        <DashAccordian />
      </div>

      {/* Book Bot Button */}
      <button className="my-3 bg-[#1E9AB0] rounded-xl border-0 outline-0 text-white text-md font-[500] p-10 py-3 btn-hover transition-all cursor-pointer">
        Book a Bot
      </button>
      
    </div>
  );
};

export default ManholeDetails;
