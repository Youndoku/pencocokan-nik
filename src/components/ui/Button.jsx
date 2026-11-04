/**
 * Tombol Lilac. `as` bisa diganti `Link` dari react-router untuk tombol navigasi.
 * Variant: primary, secondary, dark, ghost. Size: md (40px), sm (32px).
 */
const VARIANTS = {
  // Warna border per variant (bukan di kelas dasar): kalau keduanya ada, urutan CSS Tailwind yang menang.
  primary: "border-transparent bg-lilac-main text-on-lilac hover:bg-[linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.12))]",
  secondary: "border-line bg-surface text-lilac-text shadow-xs hover:bg-surface-muted",
  dark: "border-transparent bg-lilac-text text-on-lilac hover:bg-[linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.1))]",
  ghost: "border-transparent bg-transparent text-lilac-text px-0! hover:text-lilac-main",
};

const SIZES = {
  md: "h-10 px-4 text-sm leading-5 gap-2",
  sm: "h-8 px-3 text-xs leading-4 gap-1",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  block = false,
  icon: Icon,
  iconRight: IconRight,
  className = "",
  children,
  ...rest
}) {
  const iconSize = size === "sm" ? 14 : 16;
  const typeProp = Tag === "button" ? { type: rest.type ?? "button" } : {};
  return (
    <Tag
      {...rest}
      {...typeProp}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm border font-medium transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${SIZES[size]} ${VARIANTS[variant]} ${block ? "w-full" : ""} ${className}`}
    >
      {Icon && <Icon size={iconSize} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />}
      {children}
      {IconRight && <IconRight size={iconSize} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />}
    </Tag>
  );
}
