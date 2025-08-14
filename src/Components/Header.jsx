import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const pathInfo = useLocation();
  const path = pathInfo.pathname.slice(1);
  // console.log(path)

  const currentPageStyle = (pname) => {
    if (pname === path) {
      return "active-nav-link";
    }
    return "";
  } 

  return (
  <header className="w-[95%] md:w-[90%] fixed p-2 rounded-2xl top-[60px] max-w-[1200px] bg-black m-auto flex justify-around flex-wrap place-items-center align-middle font-[Sansation] text-white">
    <img
      src="/logos/anvi-robotics-logo.png"
      alt="anvi-robotics-logo"
      className="max-w-[120px] object-cover"
    />
    <h1 className="font-thin text-[24px]">PROJECT SHUDH</h1>
    <nav className="flex justify-between align-middle gap-5 underline-offset-5">
      <Link to="/" 
        className={`${currentPageStyle('')} font-normal text-[18px] hover:scale-105 transition-all duration-120 border-b-2 border-b-transparent`}>
        Dashboard
      </Link>
      <Link to="/robots"
        className={`${currentPageStyle('robots')} font-normal text-[18px] hover:scale-105 transition-all duration-120 border-b-2 border-b-transparent`}>
        Robots
      </Link>
      <Link to="/reports"
        className={`${currentPageStyle('reports')} font-normal text-[18px] hover:scale-105 transition-all duration-120 border-b-2 border-b-transparent`}>
        Reports
      </Link>
      <Link to="/highlights"
        className={`${currentPageStyle('highlights')} font-normal text-[18px] hover:scale-105 transition-all duration-120 border-b-2 border-b-transparent`}>
        Highlights
      </Link>
    </nav>
  </header>
);
}

export default Header;
