import { CheckCircle2 } from "lucide-react";

/**
 * Indikator langkah (step dot) di navigasi wizard.
 * Menampilkan nomor langkah, status aktif/selesai, dan label.
 */
export default function StepDot({ active, done, index, label }) {
  return (
    <div
      className={
        "flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 transition-all duration-300 " +
        (done
          ? "bg-emerald-50/40 text-emerald-850 border-emerald-100/80"
          : active
          ? "bg-indigo-50/50 text-indigo-900 border-indigo-200 shadow-sm shadow-indigo-50 ring-4 ring-indigo-50/20"
          : "bg-slate-50/50 text-slate-400 border-slate-100")
      }
    >
      <div
        className={
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border shrink-0 transition-all duration-300 relative " +
          (done
            ? "bg-emerald-500 text-white border-emerald-500"
            : active
            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
            : "bg-white text-slate-400 border-slate-200")
        }
      >
        {done ? <CheckCircle2 size={12} className="stroke-[3px]" /> : index}
      </div>
      <span className="text-xs font-bold tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

