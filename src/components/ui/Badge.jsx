/**
 * Badge Lilac. Tone: neutral, lilac, success, negative.
 * Variant "text" tanpa latar (untuk status di dalam teks).
 */
const SOLID = {
  neutral: "bg-surface-muted text-lilac-text",
  lilac: "bg-lilac-soft text-lilac-main",
  success: "bg-success-soft text-success",
  negative: "bg-negative-soft text-negative",
};

const TEXT = {
  neutral: "text-ink-muted",
  lilac: "text-lilac-main",
  success: "text-success",
  negative: "text-negative",
};

export default function Badge({ tone = "neutral", variant = "solid", className = "", children }) {
  const look = variant === "text" ? TEXT[tone] : `h-[22px] px-2 rounded-sm ${SOLID[tone]}`;
  return (
    <span className={`caption-strong inline-flex items-center gap-1 whitespace-nowrap ${look} ${className}`}>
      {children}
    </span>
  );
}
