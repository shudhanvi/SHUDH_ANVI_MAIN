import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./src/pages/Dashboard";
import Highlights from "./src/pages/Highlights";
import Reports from "./src/pages/Reports";
import Roborts from "./src/pages/Roborts";
import Header from "./src/components/Header";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      {/* Navigation Menu */}
      

      {/* Routes */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/highlights" element={<Highlights />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/roborts" element={<Roborts />} />
      </Routes>
    </Router>
  );
}

export default App;
