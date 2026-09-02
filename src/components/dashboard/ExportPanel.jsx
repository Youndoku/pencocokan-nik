import { Download } from "lucide-react";

export default function ExportPanel({ onDownloadExcel, namaKolomBaru }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-3">Unduh Hasil</h3>
      <button
        onClick={onDownloadExcel}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
      >
        <Download size={15} />
        Excel (.xlsx)
      </button>
    </div>
  );
}
