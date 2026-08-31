import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRiwayat } from "../hooks/useRiwayat.js";
import { useDashboard } from "../hooks/useDashboard.js";
import { generatePdf } from "../utils/pdfExport.js";
import SummaryPanel from "../components/dashboard/SummaryPanel.jsx";
import DistributionChart from "../components/dashboard/DistributionChart.jsx";
import ExportPanel from "../components/dashboard/ExportPanel.jsx";
import CrossProgramMatrix from "../components/dashboard/CrossProgramMatrix.jsx";
import DuplicateRecipients from "../components/dashboard/DuplicateRecipients.jsx";
import DynamicAnalysis from "../components/dashboard/DynamicAnalysis.jsx";
import DataTable from "../components/dashboard/DataTable.jsx";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ambilSesi } = useRiwayat();
  const [sesi, setSesi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await ambilSesi(id);
      setSesi(data);
      setLoading(false);
    }
    if (id) load();
  }, [id, ambilSesi]);

  const {
    kolomProgram,
    hasCrossProgram,
    crossMatrix,
    penerimaGanda,
    ringkasanProgram,
    chartKeterangan,
  } = useDashboard({
    dataHasil: sesi?.dataHasil,
    namaKolomBaru: sesi?.namaKolomBaru,
    kolomNik: sesi?.konfigurasi?.kolomNikGabungan,
    kolomNama: sesi?.konfigurasi?.kolomNamaGabungan,
    keteranganDistribusi: sesi?.keteranganDistribusi,
  });

  const handleDownloadExcel = () => {
    if (!sesi?.excelBuffer) return;
    const blob = new Blob([sesi.excelBuffer], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil_${sesi.namaKolomBaru || "pencocokan"}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!sesi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm text-slate-500">Sesi tidak ditemukan</p>
        <button
          onClick={() => navigate("/riwayat")}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
        >
          ← Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const tanggalFormatted = new Date(sesi.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate("/riwayat")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Riwayat
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          Dashboard Pencocokan
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {tanggalFormatted}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileSpreadsheet size={12} />
            {sesi.namaGabungan} vs {sesi.namaPembanding}
          </span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column - Summary (spans 2) */}
        <div className="lg:col-span-2 space-y-5">
          <SummaryPanel
            ringkasan={sesi.ringkasan}
            namaKolomBaru={sesi.namaKolomBaru}
          />
          <DistributionChart chartKeterangan={chartKeterangan} />

          {hasCrossProgram && (
            <>
              <CrossProgramMatrix
                crossMatrix={crossMatrix}
                ringkasanProgram={ringkasanProgram}
              />
              <DuplicateRecipients
                penerimaGanda={penerimaGanda}
                programColumns={[...(kolomProgram || []), sesi.namaKolomBaru].filter(Boolean)}
              />
            </>
          )}

          <DynamicAnalysis
            dataHasil={sesi.dataHasil}
            kolomTersedia={sesi.kolomTersedia}
            kolomProgram={kolomProgram}
            namaKolomBaru={sesi.namaKolomBaru}
          />

          <DataTable
            dataHasil={sesi.dataHasil}
            namaKolomBaru={sesi.namaKolomBaru}
            kolomTersedia={sesi.kolomTersedia}
          />
        </div>

        {/* Right column - Export & info */}
        <div className="space-y-5">
          <ExportPanel
            onDownloadExcel={handleDownloadExcel}
            onDownloadPdf={() =>
              generatePdf(sesi, {
                penerimaGanda,
                programColumns: [...(kolomProgram || []), sesi.namaKolomBaru].filter(Boolean),
              })
            }
            namaKolomBaru={sesi.namaKolomBaru}
          />
        </div>
      </div>
    </div>
  );
}
