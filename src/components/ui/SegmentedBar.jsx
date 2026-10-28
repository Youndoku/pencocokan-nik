const MUTED = "var(--color-surface-muted)";

/**
 * Bar bertumpuk horizontal. `segments`: {value, color, label}[].
 * `label` wajib karena bar dibacakan sebagai satu gambar (role="img").
 */
export default function SegmentedBar({ segments = [], label, className = "" }) {
  const total = segments.reduce((sum, s) => sum + (s.value > 0 ? s.value : 0), 0);
  return (
    <div role="img" aria-label={label} className={`flex h-7 w-full gap-[3px] ${className}`}>
      {total === 0 ? (
        <span className="flex-1 rounded-xs bg-surface-muted" />
      ) : (
        segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span
              key={s.label}
              className={`min-w-1.5 rounded-xs ${s.color === MUTED ? "" : "hatch"}`}
              style={{ flexGrow: s.value, flexBasis: 0, backgroundColor: s.color }}
            />
          ))
      )}
    </div>
  );
}

/** Legenda untuk SegmentedBar/grafik. `items`: {label, color, value}[]. */
export function Legend({ items = [], direction = "row", className = "" }) {
  return (
    <ul className={`caption m-0 flex list-none gap-x-4 gap-y-2 p-0 ${direction === "column" ? "flex-col" : "flex-wrap"} ${className}`}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: it.color }} aria-hidden="true" />
          <span className={direction === "column" ? "flex-1" : ""}>{it.label}</span>
          {it.value != null && <span className="font-medium tabular-nums">{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}
