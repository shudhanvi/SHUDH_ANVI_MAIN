const maintenanceTasks = [
  {
    id: 1,
    title: "Manhole Inspection",
    location: "SOMAJIGUDA – MH-0015",
    dateTime: "Feb 20, 10:00 AM",
    priority: "Medium",
    priorityColor: "orange",
    status: "Scheduled",
    statusTagColor: "blue",
    imageUrl: "/images/Manhole Inspection.png", // exact match available
    category: "upcoming",
  },
  {
    id: 2,
    title: "Routine Cleaning",
    location: "SOMAJIGUDA – MH-0023",
    dateTime: "Feb 22, 9:00 AM",
    priority: "Low",
    priorityColor: "green",
    status: "Scheduled",
    statusTagColor: "blue",
    imageUrl: "/images/Routine Cleaning.png", // exact match available
    category: "upcoming",
  },
  {
    id: 3,
    title: "Pump Maintenance",
    location: "KONDAPUR – MH-0047",
    dateTime: "Feb 12, 8:00 AM",
    priority: "High",
    priorityColor: "red",
    status: "Pending",
    statusTagColor: "yellow",
    imageUrl: "/images/gas testing.png", // closest related (testing/maintenance)
    category: "pending",
  },
  {
    id: 4,
    title: "Filter Replacement",
    location: "SOMAJIGUDA – MH-0099",
    dateTime: "Feb 14, 2:00 PM",
    priority: "Medium",
    priorityColor: "orange",
    status: "Immediate",
    statusTagColor: "red",
    imageUrl: "/images/gas testing.png", // assigned closest related
    category: "immediate",
  },
  {
    id: 5,
    title: "Valve Inspection",
    location: "KONDAPUR – MH-0033",
    dateTime: "Feb 20, 11:00 AM",
    priority: "Low",
    priorityColor: "green",
    status: "Scheduled",
    statusTagColor: "blue",
    imageUrl: "/images/Gas Retesting.png", // related to inspection/testing
    category: "upcoming",
  },
  {
    id: 6,
    title: "Emergency Leak ",
    location: "KONDAPUR – MH-0055",
    dateTime: "Feb 16, 4:00 PM",
    priority: "High",
    priorityColor: "red",
    status: "Immediate",
    statusTagColor: "red",
    imageUrl: "/images/Gas Retesting.png", // related to repair/testing
    category: "immediate",
  },
  {
    id: 7,
    title: "Pipe Replacement",
    location: "SOMAJIGUDA – MH-0077",
    dateTime: "Feb 10, 3:00 PM",
    priority: "Medium",
    priorityColor: "orange",
    status: "Pending",
    statusTagColor: "yellow",
    imageUrl: "/images/Gas Retesting.png", // related to pipeline inspection/testing
    category: "pending",
  },

];

export default maintenanceTasks;
