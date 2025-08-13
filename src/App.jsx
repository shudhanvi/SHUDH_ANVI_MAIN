import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Robots from "./Pages/Robots";
import Reports from "./Pages/Reports";
import Highlights from "./Pages/Highlights";

import Header from "./Components/Header";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      {/* Header */}
      <Header />

      {/* Routes */}
      <main className="bg-[#ccc] max-w-[1400px] m-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/robots" element={<Robots />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/reports" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
