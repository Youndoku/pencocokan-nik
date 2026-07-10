import { CheckCircle2 } from "lucide-react";

/**
 * Indikator langkah (step dot) di navigasi wizard.
 * Menampilkan nomor langkah, status aktif/selesai, dan label.
 */
export default function StepDot({ active, done, index, label }) {
  return (
    <div className="flex items-center gap-3 flex-1 relative">
      <div
        className={
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border shrink-0 transition-all duration-300 z-10 " +
          (done
            ? "bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm"
            : active
            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-4 ring-indigo-50"
            : "bg-white text-slate-400 border-slate-200")
        }
      >
        {done ? <CheckCircle2 size={16} /> : index}
      </div>
      <span
        className={
          "text-sm transition-colors duration-300 " +
          (active || done ? "text-slate-900 font-semibold" : "text-slate-400 font-medium")
        }
      >
        {label}
      </span>
      {index < 3 && (
        <div
          className={
            "hidden sm:block absolute left-8 right-[-12px] top-4 h-[2px] -translate-y-1/2 z-0 " +
            (done ? "bg-emerald-200" : "bg-slate-100")
          }
        />
      )}
    </div>
  );
}
