import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  BarChart3,
  Upload,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ jumlahSesi = 0 }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.matchPrefix && location.pathname.startsWith(item.matchPrefix)) {
      return true;
    }
    return location.pathname === item.to;
  };

  const navItems = [
    { to: "/", label: "Dashboard", icon: BarChart3, matchPrefix: "/dashboard" },
    { to: "/pencocokan", label: "Proses Data", icon: Upload },
    { to: "/riwayat", label: "Riwayat & Pencarian", icon: History, badge: jumlahSesi },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="sm:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-800 hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-sm">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Pencocokan NIK</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 text-slate-800"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-sm">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight">Pencocokan NIK</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item)
                      ? "bg-primary-light text-primary-dark"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden sm:flex sm:flex-col sticky top-0 h-screen shrink-0 bg-white/80 backdrop-blur-lg border-r border-slate-200/60 shadow-sm transition-all duration-200 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <div
          className={`flex items-center h-14 px-4 ${
            collapsed ? "flex-col justify-center gap-1.5 h-auto py-3" : "justify-between"
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-800 hover:text-primary transition-colors"
            title="Pencocokan NIK"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck size={16} className="text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-sm tracking-tight">Pencocokan NIK</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="flex-1 px-2 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive(item)
                  ? "bg-primary-light text-primary-dark"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="relative shrink-0">
                <item.icon size={16} />
                {collapsed && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </span>
              {!collapsed && (
                <>
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
