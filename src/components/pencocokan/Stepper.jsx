import { Check } from "lucide-react";

const LANGKAH = ["Unggah file", "Atur kolom", "Periksa anomali", "Hasil"];

/**
 * Stepper 4 langkah wizard. Langkah sebelum `step` dianggap selesai,
 * jadi langkah 3 otomatis bercentang kalau tidak ada anomali (2 langsung ke 4).
 */
export default function Stepper({ step }) {
  return (
    <ol aria-label="Langkah proses" className="m-0 flex list-none flex-wrap gap-2 p-0">
      {LANGKAH.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={`flex flex-[1_1_180px] items-center gap-2.5 rounded-md border bg-surface px-3.5 py-3 ${current ? "border-lilac-main shadow-[inset_0_0_0_1px_var(--color-lilac-main)]" : "border-line"}`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${current ? "bg-lilac-main text-on-lilac" : done ? "bg-lilac-soft text-lilac-main" : "bg-surface-muted text-ink-muted"}`}
            >
              {done ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : n}
            </span>
            <span className="flex flex-col">
              <span className="caption text-ink-muted">
                Langkah {n}
                <span className="sr-only">{current ? ", Langkah saat ini" : done ? ", Selesai" : ", Belum"}</span>
              </span>
              <span className={`body-strong ${!current && !done ? "text-ink-muted" : ""}`}>{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
