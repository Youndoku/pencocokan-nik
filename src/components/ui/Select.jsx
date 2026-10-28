import { ChevronDown } from "lucide-react";

/**
 * Select native bergaya Lilac (32px). `label` dipakai sebagai aria-label.
 * `options` boleh string[] atau {value, label}[]. `onChange` menerima value.
 */
export default function Select({ label, options = [], value, onChange, className = "", ...rest }) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        aria-label={label}
        {...rest}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="caption-strong h-8 w-full cursor-pointer appearance-none rounded-sm border border-line bg-surface pl-3 pr-7 text-lilac-text shadow-xs disabled:cursor-not-allowed disabled:opacity-45"
      >
        {options.map((opt) => {
          const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 text-ink-muted"
      />
    </div>
  );
}
