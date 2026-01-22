import { BrowserRouter as Router, Routes, Route , Navigate } from "react-router-dom";
import "./App.css";
import { Dashboard } from "./pages/Dashboard";
import { Robots } from "./pages/Robots";
import { Reports } from "./pages/Reports";
import { Highlights } from "./pages/Highlights";
import { Header } from "./components/Header";
 
function App() {
  return (
    <Router>
      <Header />
      {/* Routes */}
      <main className=" w-full max-w-[2400px] m-auto min-h-screen font-[inter]  place-items-center mb-2    ">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/robots" element={<Robots />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </main>
    </Router>
  );
}
 
export default App;
 