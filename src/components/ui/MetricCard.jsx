/**
 * Kartu metrik ringkasan (total baris, cocok, tidak cocok, dikecualikan).
 * Tone menentukan warna: neutral, success, danger, warning.
 */
export default function MetricCard({ label, value, tone = "neutral" }) {
  const toneClasses = {
    neutral: "bg-slate-50 text-slate-900 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${toneClasses[tone]}`}
    >
      <p className="text-xs opacity-80 m-0">{label}</p>
      <p className="text-2xl font-semibold mt-1 font-mono">{value}</p>
    </div>
  );
}
