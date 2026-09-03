import { UploadCloud, FileSpreadsheet, ChevronRight, Loader2 } from "lucide-react";

/**
 * Slot upload satu file .xlsx.
 * Menampilkan status kosong (pilih file), loading, atau sudah terupload (nama file + jumlah baris).
 */
export default function UploadSlot({ title, subtitle, file, onFile, loading }) {
  const inputId = `upload-${title.replace(/\s+/g, "-")}`;
  return (
    <div
      className={
        "rounded-xl border p-5 bg-white transition-all duration-300 hover:shadow-md " +
        (loading
          ? "border-primary/30 bg-primary/10"
          : file
          ? "border-primary/30 bg-primary/10"
          : "border-slate-200 hover:border-primary-light")
      }
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 " +
            (loading
              ? "bg-primary/10 text-primary-dark"
              : file
              ? "bg-primary/10 text-primary-dark"
              : "bg-slate-100 text-slate-400")
          }
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : file ? (
            <FileSpreadsheet size={18} />
          ) : (
            <UploadCloud size={18} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium m-0">{title}</p>
          <p className="text-sm text-slate-500 m-0">{subtitle}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-primary-dark font-medium">
          <Loader2 size={14} className="animate-spin" />
          <span>Sedang membaca dan memproses Excel...</span>
        </div>
      ) : file ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-mono text-slate-600 truncate">
            {file.fileName}
          </span>
          <span className="text-sm text-slate-400 shrink-0">
            {file.totalRows.toLocaleString("id-ID")} baris
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
          <span className="inline-flex items-center gap-1 text-sm text-primary-dark font-medium transition-colors font-semibold">
            Pilih file .xlsx <ChevronRight size={14} />
          </span>
        </label>
      )}
    </div>
  );
}
