import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import PencocokanPage from "./pages/PencocokanPage.jsx";
import RiwayatPage from "./pages/RiwayatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

import { useRiwayat } from "./hooks/useRiwayat.js";

export default function App() {
  const { jumlahSesi } = useRiwayat();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Sidebar jumlahSesi={jumlahSesi} />

      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/pencocokan" element={<PencocokanPage />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route path="/dashboard/:id" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
