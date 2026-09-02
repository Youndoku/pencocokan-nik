import { Navigate, useNavigate } from "react-router-dom";
import { useRiwayat } from "../hooks/useRiwayat.js";
import { Inbox, PlusCircle, Loader2 } from "lucide-react";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { sesiList, loading } = useRiwayat();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (sesiList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
          <Inbox size={28} className="text-slate-300" />
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Belum ada data yang diproses
        </p>
        <button
          onClick={() => navigate("/pencocokan")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <PlusCircle size={14} />
          Mulai Proses Data
        </button>
      </div>
    );
  }

  return <Navigate to={`/dashboard/${sesiList[0].id}`} replace />;
}
