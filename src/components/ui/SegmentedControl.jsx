import { useRef } from "react";

/**
 * Pilihan berbentuk segmen (radiogroup). `label` dipakai sebagai aria-label.
 * Panah kiri/kanan memindah pilihan, seperti radio native.
 */
export default function SegmentedControl({ label, options = [], value, onChange, className = "" }) {
  const refs = useRef([]);

  const onKeyDown = (e, i) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + options.length) % options.length;
    onChange?.(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex gap-0.5 rounded-sm bg-surface-muted p-[3px] ${className}`}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on || (value == null && i === 0) ? 0 : -1}
            onClick={() => onChange?.(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`inline-flex h-[26px] min-w-[30px] cursor-pointer items-center justify-center gap-1 rounded-[6px] px-2 text-xs font-medium ${on ? "bg-surface text-lilac-text shadow-xs" : "bg-transparent text-ink-muted"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
