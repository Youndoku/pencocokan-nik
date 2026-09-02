import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, BarChart3, Upload, History, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ jumlahSesi = 0 }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-800 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Pencocokan NIK
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive(item)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon size={14} />
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3 pt-1 border-t border-slate-100 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon size={16} />
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
