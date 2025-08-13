import { Link } from "react-router-dom";

const Header = () => (
  <header className="w-full absolute top-10 max-w-[900px] bg-black m-auto flex justify-between align-middle font-[Sansation] text-white">
    <div className="w-full">
      <img
        src="/logos/anvi-robotics-logo.png"
        alt="anvi-robotics-logo"
        className="max-w-[120px] object-cover"
      />
    </div>
    <h1 className="font-[400] text-[24px]">Anvi Robotics</h1>
    <nav className="flex ">
      <Link to="/" className="font-bold text-[20px]">
        Dashboard
      </Link>
      <Link to="/robots" className="font-bold text-[20px]">
        Robots
      </Link>
      <Link to="/reports" className="font-bold text-[20px]">
        Reports
      </Link>
      <Link to="/highlights" className="font-bold text-[20px]">
        Highlights
      </Link>
    </nav>
  </header>
);

export default Header;
