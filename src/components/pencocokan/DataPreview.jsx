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

  // Tampilkan max 10 baris pertama untuk preview
  const previewRows = rawRows.slice(0, 10);
  // Cari jumlah kolom maksimum di antara baris preview
  const maxKolom = Math.max(...previewRows.map((r) => r?.length || 0));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-fade-in">
      {/* Header panel */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <p className="text-sm text-slate-600 m-0 flex items-center gap-1.5 font-medium">
          <TableProperties size={13} className="text-primary" />
          <span>Preview {label}</span>
          <span className="text-slate-400 font-normal">
            — klik baris header kolom
          </span>
        </p>
        <span className="text-sm text-primary-dark font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
          Header: baris {barisHeader + 1}
        </span>
      </div>

      {/* Tabel preview */}
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-sm border-collapse">
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
                      ? "bg-primary/10 text-primary-dark font-semibold hover:bg-primary/15"
                      : isAboveHeader
                      ? "bg-slate-50/50 text-slate-400 hover:bg-slate-100/50"
                      : "hover:bg-slate-50 text-slate-700")
                  }
                  title={
                    isHeader
                      ? "Baris ini dipilih sebagai header"
                      : "Klik untuk jadikan baris ini sebagai header"
                  }
                >
                  {/* Nomor baris */}
                  <td className="px-2.5 py-2 text-slate-400 font-mono border-r border-slate-200 text-center w-10 select-none">
                    {i + 1}
                  </td>
                  {/* Cell data */}
                  {Array.from({ length: maxKolom }, (_, j) => (
                    <td
                      key={j}
                      className="px-2.5 py-2 truncate max-w-[180px] whitespace-nowrap"
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
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-200">
        <p className="text-sm text-slate-400 m-0">
          Menampilkan baris awal untuk pencocokan struktur kolom.
        </p>
      </div>
    </div>
  );
}
