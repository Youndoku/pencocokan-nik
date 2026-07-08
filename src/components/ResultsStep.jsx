import MetricCard from "./MetricCard.jsx";
import { AlertTriangle, RotateCcw, Download } from "lucide-react";

/**
 * UI Langkah 3: Ringkasan hasil, tabel mismatch nama, dan tombol download.
 */
export default function ResultsStep({ hasil, onReset, onDownload }) {
  return (
    <div className="animate-fade-in">
      {/* Kartu metrik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total baris" value={hasil.total.toLocaleString("id-ID")} tone="neutral" />
        <MetricCard label="Cocok" value={hasil.cocok.toLocaleString("id-ID")} tone="success" />
        <MetricCard label="Tidak cocok" value={hasil.tidak.toLocaleString("id-ID")} tone="danger" />
        {hasil.useStatus && (
          <MetricCard
            label="Dikecualikan (status)"
            value={hasil.dikecualikanStatus.toLocaleString("id-ID")}
            tone="warning"
          />
        )}
      </div>

      {/* Peringatan mismatch nama */}
      {hasil.mismatch.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-4 py-3 text-sm mb-5">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            {hasil.mismatch.length} NIK cocok tapi nama berbeda antar file
            — tercatat di sheet &ldquo;Validasi Nama&rdquo; pada file hasil.
          </span>
        </div>
      )}

      {/* Tabel preview mismatch (maks 8 baris) */}
      {hasil.mismatch.length > 0 && (
        <div className="mb-5 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {Object.keys(hasil.mismatch[0]).map((k) => (
                  <th
                    key={k}
                    className="text-left px-3 py-2.5 text-slate-500 font-semibold"
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
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {Object.values(row).map((v, j) => (
                    <td
                      key={j}
                      className={`px-3 py-2.5 ${j === 0 ? "font-mono" : ""}`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {hasil.mismatch.length > 8 && (
            <p className="text-xs text-slate-400 px-3 py-2 m-0 bg-slate-50/50">
              +{(hasil.mismatch.length - 8).toLocaleString("id-ID")} baris
              lainnya di file hasil.
            </p>
          )}
        </div>
      )}

      {/* Tombol aksi */}
      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="h-11 px-5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
        >
          <RotateCcw size={14} /> Mulai lagi
        </button>
        <button
          onClick={onDownload}
          className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          <Download size={16} /> Unduh hasil (.xlsx)
        </button>
      </div>
    </div>
  );
}
