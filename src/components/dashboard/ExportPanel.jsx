import { Download, FileText } from "lucide-react";

export default function ExportPanel({ onDownloadExcel, onDownloadPdf, namaKolomBaru }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-3">Unduh Hasil</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onDownloadExcel}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <Download size={15} />
          Excel (.xlsx)
        </button>
        <button
          onClick={onDownloadPdf}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <FileText size={15} />
          Laporan PDF
        </button>
      </div>
    </div>
  );
}
