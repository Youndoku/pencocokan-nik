import { UploadCloud, FileSpreadsheet, ChevronRight, Loader2 } from "lucide-react";

export default function UploadSlot({ title, subtitle, file, onFile, loading }) {
  const inputId = `upload-${title.replace(/\s+/g, "-")}`;
  return (
    <div
      className={
        "rounded-xl border p-5 bg-white transition-all duration-300 shadow-sm " +
        (loading
          ? "border-indigo-300 bg-indigo-50/10 ring-4 ring-indigo-50"
          : file
          ? "border-emerald-300 bg-emerald-50/10 shadow-emerald-50/20"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-slate-100")
      }
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 " +
            (loading
              ? "bg-indigo-50 text-indigo-600 border-indigo-100"
              : file
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-slate-50 text-slate-400 border-slate-100")
          }
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : file ? (
            <FileSpreadsheet size={20} />
          ) : (
            <UploadCloud size={20} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold m-0 text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 m-0">{subtitle}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-2 rounded-lg">
          <Loader2 size={12} className="animate-spin shrink-0" />
          <span>Membaca berkas Excel...</span>
        </div>
      ) : file ? (
        <div className="flex items-center justify-between gap-3 bg-emerald-50/30 border border-emerald-100 rounded-lg p-2.5">
          <span className="text-xs font-mono text-emerald-800 truncate font-medium">
            {file.fileName}
          </span>
          <span className="text-xs text-emerald-600 font-semibold shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full">
            {file.rows.length.toLocaleString("id-ID")} baris
          </span>
        </div>
      ) : (
        <label htmlFor={inputId} className="block cursor-pointer">
          <input
            id={inputId}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 shadow-sm shadow-indigo-50 hover:shadow-md hover:bg-indigo-100/50">
            Pilih file .xlsx <ChevronRight size={12} />
          </span>
        </label>
      )}
    </div>
  );
}
