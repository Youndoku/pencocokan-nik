import { TableProperties } from "lucide-react";

/**
 * Preview data mentah dari file Excel.
 * Menampilkan ~10 baris pertama sebagai tabel.
 * User bisa klik baris untuk memilihnya sebagai baris header.
 * Baris header yang terpilih di-highlight.
 */
export default function DataPreview({
  rawRows,
  barisHeader,
  onBarisHeader,
  label,
}) {
  if (!rawRows || rawRows.length === 0) return null;

  const previewRows = rawRows.slice(0, 10);
  const maxKolom = Math.max(...previewRows.map((r) => r?.length || 0));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-fade-in shadow-sm my-3">
      {/* Header panel */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-700 m-0 flex items-center gap-2">
          <TableProperties size={14} className="text-indigo-500" />
          <span className="font-semibold text-slate-800">Pratinjau {label}</span>
          <span className="text-slate-400 hidden sm:inline">
            — klik baris yang merupakan header kolom
          </span>
        </p>
        <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          Baris Header: {barisHeader + 1}
        </span>
      </div>

      {/* Tabel preview */}
      <div className="overflow-x-auto max-h-60">
        <table className="w-full text-xs border-collapse">
          <tbody>
            {previewRows.map((row, i) => {
              const isHeader = i === barisHeader;
              const isAboveHeader = i < barisHeader;
              return (
                <tr
                  key={i}
                  onClick={() => onBarisHeader(i)}
                  className={
                    "cursor-pointer border-b border-slate-100 last:border-0 transition-all duration-200 " +
                    (isHeader
                      ? "bg-indigo-50 text-indigo-900 font-semibold border-y border-indigo-200 hover:bg-indigo-100/50"
                      : isAboveHeader
                      ? "bg-slate-50/70 text-slate-400 hover:bg-slate-100/50"
                      : "hover:bg-slate-50/80 text-slate-700")
                  }
                  title={
                    isHeader
                      ? "Baris ini terpilih sebagai header"
                      : "Klik untuk memilih baris ini sebagai header"
                  }
                >
                  {/* Nomor baris */}
                  <td className="px-3 py-2 text-slate-400 font-mono border-r border-slate-100 text-center w-10 select-none bg-slate-50/50 font-bold">
                    {i + 1}
                  </td>
                  {/* Cell data */}
                  {Array.from({ length: maxKolom }, (_, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 truncate max-w-[160px] whitespace-nowrap"
                    >
                      {String(row?.[j] ?? "").trim() || ""}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      {rawRows.length > 10 && (
        <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 font-medium m-0">
            Menampilkan 10 dari {rawRows.length.toLocaleString("id-ID")} baris data.
          </p>
        </div>
      )}
    </div>
  );
}
