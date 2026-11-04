/**
 * Kartu Lilac: judul title-md, subjudul caption ink-muted, `action` di kanan atas.
 */
export default function Card({
  as: Tag = "section",
  title,
  subtitle,
  action,
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      {...rest}
      className={`flex min-w-0 flex-col gap-4 rounded-lg bg-surface shadow-card ${size === "sm" ? "p-4" : "p-5"} ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="title-md m-0">{title}</h3>}
            {subtitle && <p className="caption m-0 text-ink-muted">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
