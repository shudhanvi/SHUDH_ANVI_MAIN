import { useState } from "react";
import MapComponent from "../Components/MapComponent";
import MaintainenceComp from "../Components/MaintainenceComp";
// import DashBCards from "../Components/DashBCards";

// const DashboardCardsContent = [
//   {
//     label: "Active Robots",
//     icon: "/icons/robot-blue-icon.png",
//     number: 12,
//     rateValue: "+2",
//     units: "",
//     bgColor: "blue",
//   },
//   {
//     label: "Critical Issues",
//     icon: "/icons/warning-red-icon.png",
//     number: 3,
//     rateValue: "-1",
//     units: "",
//     bgColor: "red",
//   },
//   {
//     label: "Health Manholes",
//     icon: "/icons/completed-icon.png",
//     number: 89,
//     rateValue: "+5",
//     units: "%",
//     bgColor: "green",
//   },
//   {
//     label: "Coverage Area",
//     icon: "/icons/map-marker-icon.png",
//     number: 2.4,
//     rateValue: "+0.2",
//     units: <>km &#178;</>,
//     bgColor: "blue",
//   },
// ];

const DashboardCardsContent = [
    {label: 'Prevent', bgColor: 'rgba(239, 242, 249, 1)'},
    {label: 'Predict', bgColor: 'rgba(244, 235, 244, 1)'},
    {label: 'Cure', bgColor: 'rgba(239, 248, 243, 1)'},
]

const Dashboard = () => {
  const [isMapTab, setIsMapTab] = useState(true);

  return (
    <>
      <section className="section1">
        <h1>Drainage System Dashboard</h1>
        <p>Monitor and manage your smart drainage infrastructure</p>
      </section>

      <section className="p-2 w-full max-w-[1200px] m-auto place-items-center">
        <ul className="w-full max-w-[600px] m-0 p-0 grid grid-cols-3 gap-10">
          {/* {DashboardCardsContent.map((each) => (
            <DashBCards key={each.label} DashBCardInfo={each} />
          ))} */}
            {DashboardCardsContent.map(i => (
                <li key={i.label} 
                className="w-full place-content-center rounded-xl hover:scale-102 hover:shadow-md shadow-gray-300 transition-all duration-150" style={{backgroundColor: i.bgColor}}>
                    <button type="button" onClick={() => {}}
                  className="w-full cursor-pointer bg-amber-200 rounded-xl text-lg text-[rgba(9, 10, 12, 1)] font-semibold p-5 w-full max-w-sm aspect-square place-content-center" style={{backgroundColor: i.bgColor}}>
                    
                    {i.label}
                    </button>
                </li>
            ))}
        </ul>
      </section>

      <section className="p-2 w-full max-w-[1200px] my-5 place-items-left">
        <div className="w-full max-w-[1000px] flex justify-start gap-3 align-middle">
          <button
            type="button"
            className={`${isMapTab ? "btn-blue" : "btn-blue-outline"} btn-hover`}
            onClick={() => setIsMapTab((prev) => !prev)}
          >
            Interactive Hotspot Map
          </button>
          <button
            type="button"
            className={`${!isMapTab ? "btn-blue" : "btn-blue-outline"} btn-hover`}
            onClick={() => setIsMapTab((prev) => !prev)}
          >
            Maintainence Scheduler
          </button>
        </div>

        <div className="w-full max-w[1200px] tabs-content my-3 rounded-xl shadow-md shadow-gray-200">
            { isMapTab ? <MapComponent /> : <MaintainenceComp />}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
