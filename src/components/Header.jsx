import { Link, useLocation } from "react-router-dom";
import IconsData from "../data/iconsdata";
export const Header = () => {
  const pathInfo = useLocation();
  const path = pathInfo.pathname.slice(1); // e.g., "robots" or ""

  const currentPageStyle = (pname) => (pname === path ? "active" : "");

  return (
    <header className="max-h-[200px] max-w-full flex flex-col mx-auto bg-white border-b-2 border-[#1D97AA] shadow-md shadow-[#1F252E1A]  sticky top-0 z-900">
      <div className="h-[100px] max-w-full px-[60px] flex justify-between items-center py-[20px]">
        <div className="flex items-center">
          <img
            src="/anvi-robotics-logo.png"
            alt="anvi-robotics-logo"
            className="max-w-[150px] h-[80px] object-cover"
          />
        </div>

        <div className="flex flex-row m-auto">
          <h1 className="font-[Merriweather] text-[26px]">PROJECT  SHUDH</h1>
        </div>

        <div className="flex items-center">
          <div className="flex flex-col justify-end">
            <h3 className="text-[12px] font-bold text-[#65758B]">THE BOT FACTORY</h3>
            <h1 className="text-[20px] font-bold">All India Robotics Association</h1>
            <p className="text-[14px] text-[#65758B]">
              Smart Manhole Management System
            </p>
          </div>
          <img className="h-[80px] w-[80px]" src="/AIRA-logo.png" alt="AIRA-logo" />
        </div>
      </div>

      <hr className="mx-[50px] text-[#65758B33] "/>

      <div className="h-[60px] w-full px-[18px] mt-[10px]">
        <nav className="flex justify-start items-center gap-1 underline-offset-5">
          <Link
            to="/"
            className={`font-bold p-[14px] flex justify-center items-center w-[166px] text-[14px]  transition-all duration-150 border-b-2 ${
              currentPageStyle("") === "active"
                ? "bg-[#DCF5F9] border-b-[#1D97AA] text-[#1E9AB0]"
                : "border-b-transparent text-[#65758B] "

            }`}
          >
            <span className="mr-[8px]">{IconsData.Dashboard}</span>
            DASHBOARD
          </Link>

          <Link
            to="/robots"
            className={`font-bold p-[14px] flex justify-center items-center w-[166px]  text-[14px] transition-all duration-150 border-b-2 ${
              currentPageStyle("robots") === "active"
                ?"bg-[#DCF5F9] border-b-[#1D97AA] text-[#1E9AB0]"
                : "border-b-transparent text-[#65758B] "

            }`}
          >
             <span className="mr-[8px]">{IconsData.Robots}</span>
            ROBOTS
          </Link>

          <Link
            to="/reports"
            className={`font-bold p-[14px] flex justify-center items-center w-[166px] text-[14px]  transition-all duration-150 border-b-2 ${
              currentPageStyle("reports") === "active"
                ? "bg-[#DCF5F9] border-b-[#1D97AA] text-[#1E9AB0]"
                : "border-b-transparent text-[#65758B] "
            }`}
          >
             <span className="mr-[8px]">{IconsData.Reports}</span>
            REPORTS
          </Link>

          <Link
            to="/highlights"
            className={`font-bold p-[14px] flex justify-center items-center w-[166px] text-[14px]  transition-all duration-150 border-b-2 ${
              currentPageStyle("highlights") === "active"
                ? "bg-[#DCF5F9] border-b-[#1D97AA] text-[#1E9AB0]"
                : "border-b-transparent text-[#65758B] "

            }`}
          >
             <span className="mr-[8px]">{IconsData.Highlights}</span>
           HIGHLIGHTS
          </Link>
        </nav>
      </div>
    </header>
  );
};
