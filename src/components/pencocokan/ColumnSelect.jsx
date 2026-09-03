/**
 * Dropdown pemilihan kolom (NIK, Nama, Status).
 * Jika `optional`, tampilkan opsi "Tidak digunakan".
 */
export default function ColumnSelect({ label, value, onChange, columns = [], optional }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500 font-medium">
        {label}{" "}
        {optional && <span className="text-slate-400 font-normal">(opsional)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-slate-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200"
      >
        {optional && <option value="">Tidak digunakan</option>}
        {columns.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
