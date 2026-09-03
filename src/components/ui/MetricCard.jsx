/**
 * Kartu metrik ringkasan (total baris, cocok, tidak cocok, dikecualikan).
 * Tone menentukan warna: neutral, success, danger, warning.
 */
export default function MetricCard({ label, value, tone = "neutral" }) {
  const toneClasses = {
    neutral: "bg-slate-50 text-slate-900 border-slate-200",
    success: "bg-primary/10 text-primary-dark border-primary/30",
    danger: "bg-accent-red/10 text-accent-red border-accent-red/30",
    warning: "bg-accent-gold/15 text-neutral-900 border-accent-gold/40",
  };
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${toneClasses[tone]}`}
    >
      <p className="text-sm font-semibold opacity-80 m-0">{label}</p>
      <p className="text-[32px] font-bold mt-1 leading-none">{value}</p>
    </div>
  );
}
