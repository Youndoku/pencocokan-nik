/**
 * Kartu metrik ringkasan (total baris, cocok, tidak cocok, dikecualikan).
 * Tone menentukan warna: neutral, success, danger, warning.
 */
export default function MetricCard({ label, value, tone = "neutral", className = "" }) {
  const toneClasses = {
    neutral: "bg-slate-50 text-slate-800 border-slate-200/80 shadow-slate-100/50",
    success: "bg-emerald-50/50 text-emerald-800 border-emerald-200/80 shadow-emerald-100/30",
    danger: "bg-red-50/50 text-red-800 border-red-200/80 shadow-red-100/30",
    warning: "bg-amber-50/50 text-amber-800 border-amber-200/80 shadow-amber-100/30",
  };
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md shadow-sm ${toneClasses[tone]} ${className}`}
    >
      <p className="text-[11px] font-semibold opacity-75 m-0 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-2 font-mono m-0 tracking-tight">{value}</p>
    </div>
  );
}

