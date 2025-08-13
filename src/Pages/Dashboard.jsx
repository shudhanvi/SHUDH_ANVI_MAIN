import DashBCards from "../Components/DashBCards";

const DashboardCardsContent = [
    {label: 'Active Robots', icon: '/icons/robot-blue-icon.png', number: 12, rateValue: '+2', units: '', bgColor:"blue"},
    {label: 'Critical Issues', icon: '/icons/warning-red-icon.png', number: 3, rateValue: '-1', units: '', bgColor:"red"},
    {label: 'Health Manholes', icon: '/icons/completed-icon.png', number: 89, rateValue: '+5', units: '%', bgColor:"green"},
    {label: 'Coverage Area', icon: '/icons/map-marker-icon.png', number: 2.4, rateValue: '+0.2', units: <>km &#178;</>, bgColor:"blue"},
]

const Dashboard = () => {
    return(
    <>
        <section className="section1">
            <h1>Drainage System Dashboard</h1>
            <p>Monitor and manage your smart drainage infrastructure</p>
        </section>

        <section className="bg-gree-200 p-2">
            <ul className="m-0 p-0 grid grid-cols-2 max-md:grid-cols-2 min-md:grid-cols-4 gap-2">
                {DashboardCardsContent.map(each => (
                    <DashBCards key={each.label} DashBCardInfo={each} />
                ))}
            </ul>
        </section>
    </>
)}

export default Dashboard;