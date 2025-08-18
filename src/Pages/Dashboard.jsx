import { useState } from "react";
import MapComponent from "../Components/MapComponent";
import MaintainenceComp from "../Components/MaintainenceComp";
import PredictComp from "../Components/PredictComp";
import PreventComp from "../Components/PreventComp";
import CureComp from "../Components/CureComp";
import { ChartLine, CircleCheckBig, ShieldCheck, X } from "lucide-react";
// import MapWardSearchComp from "../Components/MapWardSearchComp";

const DashboardCardsContent = [
  {
    label: "Predict",
    bgColor: "#EFF2F9",
    icon: <ChartLine size={25} color="#0380FC" />,
    iconBg: "#0380FC21",
    desc: "Forecasting Risk",
  },
  {
    label: "Prevent",
    bgColor: "#F4EBF4",
    icon: <ShieldCheck size={30} color="#FF8FFF" />,
    iconBg: "#FF8FFF1A",
    desc: "Schedule Mantenance",
  },
  {
    label: "Cure",
    bgColor: "#EFF8F3",
    icon: <CircleCheckBig size={25} color="#61CB7E" />,
    iconBg: "#61CB7E33",
    desc: "Resolve Issues",
  },
];

const Dashboard = () => {
  const [isMapTab, setIsMapTab] = useState(true);
  const [activeCard, setActiveCard] = useState("");

  const updateActiveCard = (cardName) => {
    document.body.style.position = "fixed";
    setActiveCard(cardName);
  };

  const closeCardPopUp = () => {
    document.body.style.position = "static";
    setActiveCard("");
  };

  const renderPopups = () => {
    switch (activeCard) {
      case "Predict":
        return <PredictComp />;
      case "Prevent":
        return <PreventComp />;
      case "Cure":
        return <CureComp />;
      default:
        return null;
    }
  };

  return (
    <>
      <section className="section1">
        <h1>Drainage System Dashboard</h1>
        <p>Monitor and manage your smart drainage infrastructure</p>
      </section>

      {/* <MapWardSearchComp /> */}

      <section className="p-2 w-full max-w-[1200px] mt-5 mb-15 mx-auto place-items-center">
        <ul className="w-full max-w-[600px] m-0 p-0 flex max-md:flex-wrap max-md:flex-col justify-center align-middle gap-8 place-content-center">
          {DashboardCardsContent.map((i) => (
            <li
              key={i.label}
              className="w-full max-md:w-max max-md:self-center text-gray-900 place-content-center rounded-xl hover:scale-103 shadow-sm shadow-gray-300 hover:shadow-md hover:shadow-gray-500 hover:-translate-y-1 transition-all duration-200"
              style={{ backgroundColor: i.bgColor }}
            >
              <button
                type="button"
                onClick={() => {
                  updateActiveCard(i.label);
                }}
                className="w-full aspect-[16/10] flex justify-center align-middle gap-3 mx-auto cursor-pointer place-items-center bg-amber-200 rounded-xl text-lg text-[rgba(9, 10, 12, 1)] font-semibold p-5 w-full max-w-sm aspect-auto place-content-center"
                style={{ backgroundColor: i.bgColor }}
              >
                <span className="w-full flex flex-col text-left">
                  <h5 className="text-lg font-[600] font-[Sansation]">
                    {i.label}
                  </h5>
                  <p className="text-sm font-[400] w-max">{i.desc}</p>
                </span>
                <span
                  className="max-w-[50px] p-2 rounded-md"
                  style={{ backgroundColor: i.iconBg }}
                >
                  {i.icon}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="p-2 w-full max-w-[1200px] my-5 place-items-left">
        <div className="w-full max-w-[1000px] flex justify-start gap-3 align-middle">
          <button
            type="button"
            className={`${
              isMapTab ? "btn-blue" : "btn-blue-outline"
            } btn-hover`}
            onClick={() => setIsMapTab(true)}
          >
            Interactive Hotspot Map
          </button>
          <button
            type="button"
            className={`${
              !isMapTab ? "btn-blue" : "btn-blue-outline"
            } btn-hover`}
            onClick={() => setIsMapTab(false)}
          >
            Maintainence Scheduler
          </button>
        </div>

        <div className="w-full max-w[1200px] tabs-content my-3 rounded-xl">
          {isMapTab ? <MapComponent /> : <MaintainenceComp />}
        </div>
      </section>

      {/* Predict Prevent Cure - Popups section */}
      {activeCard !== "" && (
        <section className="bg-[#00000099] w-[101%] absolute top-0 z-1300">
          <div className="popup-container h-screen relative">
            <div className="fixed bg-[#000] opacity-50 w-full h-screen -z-1"></div>
            <div className="h-screen p-4 overflow-y-auto">
              {renderPopups()}
              <button
                className="absolute btn-blue btn-hover right-[calc(50vw-350px)] top-[20px]"
                onClick={() => closeCardPopUp()}
              >
                <X size={20} color="white" />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Dashboard;
