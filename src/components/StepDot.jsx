import { CheckCircle2 } from "lucide-react";

/**
 * Indikator langkah (step dot) di navigasi wizard.
 * Menampilkan nomor langkah, status aktif/selesai, dan label.
 */
export default function StepDot({ active, done, index, label }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div
        className={
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-mono border shrink-0 transition-all duration-300 " +
          (done
            ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
            : active
            ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-sm ring-2 ring-indigo-100"
            : "bg-slate-50 text-slate-400 border-slate-200")
        }
      >
        {done ? <CheckCircle2 size={14} /> : index}
      </div>
      <span
        className={
          "text-sm transition-colors duration-300 " +
          (active || done ? "text-slate-900 font-medium" : "text-slate-400")
        }
      >
        {label}
      </span>
    </div>
  );
}
