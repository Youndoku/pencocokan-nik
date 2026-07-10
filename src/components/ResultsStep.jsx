import MetricCard from "./MetricCard.jsx";
import { AlertTriangle, RotateCcw, Download, CheckCircle2 } from "lucide-react";

export default function ResultsStep({ hasil, onReset, onDownload }) {
  return (
    <div className="animate-fade-in">
      {/* Banner Success */}
      <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-3.5 text-sm mb-6 shadow-sm">
        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        <span className="font-semibold">Proses pencocokan selesai 100% lokal!</span>
      </div>

      {/* Kartu metrik */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <MetricCard label="Total Baris" value={hasil.total.toLocaleString("id-ID")} tone="neutral" />
        <MetricCard label="Data Cocok" value={hasil.cocok.toLocaleString("id-ID")} tone="success" />
        <MetricCard label="Tidak Cocok" value={hasil.tidak.toLocaleString("id-ID")} tone="danger" />
        {hasil.useStatus && (
          <MetricCard
            label="Dikecualikan"
            value={hasil.dikecualikanStatus.toLocaleString("id-ID")}
            tone="warning"
          />
        )}
      </div>

      {/* Peringatan mismatch nama */}
      {hasil.mismatch.length > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl px-4 py-3 text-xs mb-4 shadow-sm">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
          <span className="font-medium">
            Terdapat <strong>{hasil.mismatch.length} NIK</strong> yang memiliki nama berbeda antar file. 
            Detail selengkapnya tercatat di sheet &ldquo;Validasi Nama&rdquo; pada file hasil unduhan.
          </span>
        </div>
      )}

      {/* Tabel preview mismatch */}
      {hasil.mismatch.length > 0 && (
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold">
                {Object.keys(hasil.mismatch[0]).map((k) => (
                  <th
                     key={k}
                     className="text-left px-3 py-2.5 text-slate-500 font-semibold select-none"
                  >
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hasil.mismatch.slice(0, 8).map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors text-slate-700"
                >
                  {Object.values(row).map((v, j) => (
                    <td
                      key={j}
                      className={`px-3 py-2.5 ${j === 0 ? "font-mono font-medium text-slate-800" : ""}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {hasil.mismatch.length > 8 && (
            <div className="text-xs text-slate-500 px-3 py-2.5 bg-slate-50/50 border-t border-slate-100 font-medium">
              +{(hasil.mismatch.length - 8).toLocaleString("id-ID")} baris nama berbeda lainnya tersedia di berkas unduhan.
            </div>
          )}
        </div>
      )}

      {/* Tombol aksi */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer font-semibold shadow-sm"
        >
          <RotateCcw size={14} /> Mulai Lagi
        </button>
        <button
          onClick={onDownload}
          className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          <Download size={16} /> Unduh Hasil (.xlsx)
        </button>
      </div>
    </div>
  );
}

