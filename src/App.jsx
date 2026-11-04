import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import Footer from "./components/layout/Footer.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import PencocokanPage from "./pages/PencocokanPage.jsx";
import RiwayatPage from "./pages/RiwayatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import BantuanPage from "./pages/BantuanPage.jsx";

import { useRiwayat } from "./hooks/useRiwayat.js";

export default function App() {
  const { jumlahSesi } = useRiwayat();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar jumlahSesi={jumlahSesi} />

      <main className="flex-1 min-w-0 flex flex-col gap-4 px-6 pt-5 pb-10">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          {/* key baru dari tombol "Proses data baru" = wizard mulai dari awal */}
          <Route path="/pencocokan" element={<PencocokanPage key={location.state?.mulai ?? "awal"} />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route path="/dashboard/:id" element={<DashboardPage />} />
          <Route path="/bantuan" element={<BantuanPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer jumlahSesi={jumlahSesi} />
      </main>
    </div>
  );
}
