/**
 * Dropdown pemilihan kolom (NIK, Nama, Status).
 * Jika `optional`, tampilkan opsi "Tidak digunakan".
 */
export default function ColumnSelect({ columns, label, onChange, value, optional = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
        <span>{label}</span>
        {optional && <span className="text-[10px] text-slate-400 font-normal bg-slate-100 px-1.5 py-0.5 rounded">Opsional</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
      >
        <option value="">-- Pilih Kolom --</option>
        {columns.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

