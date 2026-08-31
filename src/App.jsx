import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import PencocokanPage from "./pages/PencocokanPage.jsx";
import RiwayatPage from "./pages/RiwayatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

import { useRiwayat } from "./hooks/useRiwayat.js";

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { jumlahSesi } = useRiwayat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {!isLanding && <Navbar jumlahSesi={jumlahSesi} />}

      <Routes>
        <Route path="/" element={<LandingPage jumlahSesi={jumlahSesi} />} />
        <Route path="/pencocokan" element={<PencocokanPage />} />
        <Route path="/riwayat" element={<RiwayatPage />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}
