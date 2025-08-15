import { useState } from "react";
import MapComponent from "../Components/MapComponent";
import MaintainenceComp from "../Components/MaintainenceComp";
import PredictComp from '../Components/PredictComp';
import PreventComp from '../Components/PreventComp';
import CureComp from '../Components/CureComp';
import { X } from "lucide-react";

const DashboardCardsContent = [
    {label: 'Prevent', bgColor: 'rgba(239, 242, 249, 1)'},
    {label: 'Predict', bgColor: 'rgba(244, 235, 244, 1)'},
    {label: 'Cure', bgColor: 'rgba(239, 248, 243, 1)'},
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

      <section className="p-2 w-full max-w-[1200px] m-auto place-items-center">
        <ul className="w-full max-w-[600px] m-0 p-0 grid grid-cols-3 gap-10">
          {/* {DashboardCardsContent.map((each) => (
            <DashBCards key={each.label} DashBCardInfo={each} />
          ))} */}
            {DashboardCardsContent.map(i => (
                <li key={i.label} 
                className="w-full place-content-center rounded-xl hover:scale-102 hover:shadow-md shadow-gray-300 transition-all duration-150" style={{backgroundColor: i.bgColor}}>
                    <button type="button" onClick={() => {updateActiveCard(i.label)}}
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

      {/* Predict Pre */}
      {activeCard !== '' && (
        <section className="bg-[#00000099] w-[101%] absolute top-0 z-1300"> 
          <div className="popup-container h-screen relative">
            <div className="h-screen p-4 overflow-y-auto">
              {renderPopups()}
              <button className="absolute btn-blue btn-hover right-[calc(50vw-350px)] top-[40px]" onClick={() => closeCardPopUp()}>
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
