import { Search } from "lucide-react";

/**
 * Kolom pencarian 40px. Focus ring dipasang di wrapper (focus-within)
 * karena input-nya sendiri tanpa bingkai.
 */
export default function SearchInput({ value, onChange, className = "", ...rest }) {
  return (
    <label className={`flex h-10 min-w-0 items-center gap-2 rounded-md border border-line bg-surface px-3 text-ink-muted focus-within:shadow-focus ${className}`}>
      <Search size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
      <input
        type="search"
        {...rest}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-lilac-text outline-none placeholder:text-ink-muted"
        data-ring="wrapper"
      />
    </label>
  );
}
