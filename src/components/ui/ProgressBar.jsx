/**
 * Progress bar Lilac. Lebar isian dibatasi 0–100%; max <= 0 dianggap kosong.
 * `start`/`end` = teks kiri/kanan di bawah bar (opsional).
 */
export default function ProgressBar({ value = 0, max = 100, start, end, label, size = "md", className = "" }) {
  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) * 100 : 0;
  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`overflow-hidden rounded-xs bg-surface-muted ${size === "lg" ? "h-7" : "h-2.5"}`}
      >
        <div className="hatch h-full rounded-xs bg-lilac-main" style={{ width: `${pct}%` }} />
      </div>
      {(start || end) && (
        <div className="caption flex justify-between tabular-nums">
          <span className="font-medium text-lilac-text">{start}</span>
          <span className="text-ink-muted">{end}</span>
        </div>
      )}
    </div>
  );
}
