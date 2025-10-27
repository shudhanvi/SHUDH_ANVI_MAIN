import MaintainenceComp from "../components/DashboardFiles/MaintainenceComp";
import MapComponent from "../components/DashboardFiles/MapComponent";
 
 
export const Dashboard = () => {
  return (
 <>
 
      <section className="section1 border-b-[1.5px] border-[#E1E7EF] py-[10px] px-[30px] w-full bg-white ">
      <h1 className="text-[24px] font-bold">Dashboard</h1>
      <p className="text-[14px] text-[#65758B]">Smart Manhole Management System</p>
      </section> 
 

<section className="section2 tabs-container  p-4 w-full h-auto flex flex-col gap-5 ">
      <div className="w-full tabs-content my-3 rounded-xl">
        
 <MapComponent/>
       
      <div className="w-full tabs-content my-3 rounded-xl">
        <MaintainenceComp/>
      </div>
      </div>
</section>
 </>
  );
}
