const maintenanceTasks = [
  {
    id: 1,
    title: "Manhole Inspection",
    location: "Secunderabad – MH-0015",
    dateTime: "Tomorrow, 10:00 AM",
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
    location: "Kukatpally – MH-0023",
    dateTime: "Aug 8, 9:00 AM",
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
    location: "Miyapur – MH-0047",
    dateTime: "Aug 7, 8:00 AM",
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
    location: "Hitech City – MH-0099",
    dateTime: "Aug 6, 2:00 PM",
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
    location: "Mehdipatnam – MH-0033",
    dateTime: "Aug 10, 11:00 AM",
    priority: "Low",
    priorityColor: "green",
    status: "Scheduled",
    statusTagColor: "blue",
    imageUrl: "/images/Gas Retesting.png", // related to inspection/testing
    category: "upcoming",
  },
  {
    id: 6,
    title: "Emergency Leak Repair",
    location: "Begumpet – MH-0055",
    dateTime: "Today, 4:00 PM",
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
    location: "Gachibowli – MH-0077",
    dateTime: "Aug 9, 3:00 PM",
    priority: "Medium",
    priorityColor: "orange",
    status: "Pending",
    statusTagColor: "yellow",
    imageUrl: "/images/Gas Retesting.png", // related to pipeline inspection/testing
    category: "pending",
  },
 
];

export default maintenanceTasks;
