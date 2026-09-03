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
          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold font-mono border shrink-0 transition-all duration-300 " +
          (done
            ? "bg-primary/10 text-primary-dark border-primary/30 shadow-sm"
            : active
            ? "bg-primary/10 text-primary-dark border-primary/30 shadow-sm ring-2 ring-primary"
            : "bg-slate-50 text-slate-400 border-slate-200")
        }
      >
        {done ? <CheckCircle2 size={14} className="stroke-[2.5px]" /> : index}
      </div>
      <span
        className={
          "text-sm sm:text-sm transition-colors duration-300 " +
          (active || done ? "text-slate-900 font-semibold" : "text-slate-400 font-medium")
        }
      >
        {label}
      </span>
    </div>
  );
}
