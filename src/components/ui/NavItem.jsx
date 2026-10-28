import { NavLink } from "react-router-dom";

/**
 * Item menu sidebar. `active` (opsional) menimpa deteksi aktif NavLink,
 * misalnya Dashboard yang juga aktif di /dashboard/:id.
 * Saat `collapsed`, hanya ikon yang tampil dan label jadi aria-label.
 */
export default function NavItem({ to, icon: Icon, label, count, end, active, collapsed = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={({ isActive }) => {
        const on = active ?? isActive;
        return `relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-lilac-text no-underline hover:bg-surface-muted ${collapsed ? "justify-center" : ""} ${on ? "bg-surface-muted font-medium before:absolute before:-left-4 before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-r-[3px] before:bg-lilac-main" : ""}`;
      }}
    >
      {Icon && <Icon size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />}
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && count != null && (
        <span className="micro inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lilac-text px-[5px] text-on-lilac tabular-nums">
          {count}
        </span>
      )}
    </NavLink>
  );
}
