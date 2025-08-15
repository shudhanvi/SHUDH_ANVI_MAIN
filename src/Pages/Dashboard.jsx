import { useState } from "react";
import MapComponent from "../Components/MapComponent";
import MaintainenceComp from "../Components/MaintainenceComp";
import PredictComp from '../Components/PredictComp';
import PreventComp from '../Components/PreventComp';
import CureComp from '../Components/CureComp';
import { ChartLine, CircleCheckBig, ShieldCheck, X } from "lucide-react";

const DashboardCardsContent = [ 
    {label: 'Prevent', bgColor: '#51B3FF', icon: <ChartLine size={35} color="white" />, desc: 'Forecasting Risk'},
    {label: 'Predict', bgColor: '#FF9231', icon: <ShieldCheck size={35} color="white" />, desc: 'Schedule Mantenance'},
    {label: 'Cure', bgColor: '#61CB7E', icon: <CircleCheckBig  size={35} color="white" />, desc: 'Resolve Issuess'},
]

const Dashboard = () => {
  const [isMapTab, setIsMapTab] = useState(true);
  const [activeCard, setActiveCard] = useState('');

  const updateActiveCard = cardName => {
    document.body.style.position ="fixed";
    setActiveCard(cardName);
  }

  const closeCardPopUp = () => {
    document.body.style.position = "static";
    setActiveCard('');
  }

  const renderPopups = () => {
    switch (activeCard) {
      case 'Prevent':
        return <PreventComp />;
      case 'Predict':
        return <PredictComp />;
      case 'Cure':
        return <CureComp />;
      default :
        return null;
    }
  }

  return (
    <>
      <section className="section1">
        <h1>Drainage System Dashboard</h1>
        <p>Monitor and manage your smart drainage infrastructure</p>
      </section>

      <section className="p-2 w-full max-w-[1200px] mt-5 mb-15 mx-auto place-items-center">
        <ul className="w-full max-w-[600px] m-0 p-0 flex justify-center align-middle gap-5">
          {/* {DashboardCardsContent.map((each) => (
            <DashBCards key={each.label} DashBCardInfo={each} />
          ))} */}
            {DashboardCardsContent.map(i => (
                <li key={i.label} 
                  className="w-full place-content-center rounded-xl hover:scale-102 hover:shadow-md shadow-gray-300 transition-all duration-150" style={{backgroundColor: i.bgColor}}>
                  <button type="button" onClick={() => {updateActiveCard(i.label)}}
                    className="w-full flex justify-center align-middle gap-2 cursor-pointer place-items-center bg-amber-200 rounded-xl text-lg text-[rgba(9, 10, 12, 1)] font-semibold p-5  w-full max-w-sm aspect-auto place-content-center" style={{backgroundColor: i.bgColor}}>
                    <span className="w-full flex flex-col text-left text-white">
                      <h5 className="text-md font-semibold">{i.label}</h5>
                      <p className="text-[12px] font-[400] w-max">{i.desc}</p>
                    </span>
                    <span className="max-w-[50px]">{i.icon}</span>
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

        <div className="w-full max-w[1200px] tabs-content my-3 rounded-xl">
            { isMapTab ? <MapComponent /> : <MaintainenceComp />}
        </div>
      </section>

      {/* Predict Pre */}
      {activeCard !== '' && (
        <section className="bg-[#00000099] w-[101%] absolute top-0 z-1300"> 
          <div className="popup-container h-screen relative">
            <div className="h-screen p-4 overflow-y-auto">
              {renderPopups()}
              <button className="absolute btn-blue btn-hover right-[calc(50vw-350px)] top-[20px]" onClick={() => closeCardPopUp()}>
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
