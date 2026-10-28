import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, History, LifeBuoy, Plus, PanelLeftClose, PanelLeftOpen, Menu, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import NavItem from "../ui/NavItem.jsx";

const KUNCI_CIUT = "sidebar-ciut";

function bacaCiut() {
  try {
    return localStorage.getItem(KUNCI_CIUT) === "1";
  } catch {
    return false;
  }
}

/** Isi sidebar, dipakai bersama oleh tampilan desktop dan drawer HP. */
function IsiMenu({ jumlahSesi, collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  // `mulai` membuat PencocokanPage di-mount ulang, jadi wizard selalu dari awal.
  const prosesBaru = () => navigate("/pencocokan", { state: { mulai: Date.now() } });
  const dashboardAktif = location.pathname === "/" || location.pathname.startsWith("/dashboard");

  return (
    <>
      {collapsed ? (
        <Button icon={Plus} onClick={prosesBaru} aria-label="Proses data baru" title="Proses data baru" className="px-0! w-10 self-center" />
      ) : (
        <Button icon={Plus} block onClick={prosesBaru}>
          Proses data baru
        </Button>
      )}
      <nav aria-label="Menu utama" className="flex flex-col gap-0.5">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={dashboardAktif} collapsed={collapsed} />
        <NavItem to="/riwayat" icon={History} label="Riwayat dan pencarian" count={jumlahSesi || null} collapsed={collapsed} />
      </nav>
      <nav aria-label="Menu lain" className="flex flex-col gap-0.5 border-t border-line pt-4">
        <NavItem to="/bantuan" icon={LifeBuoy} label="Bantuan" collapsed={collapsed} />
      </nav>
    </>
  );
}

const Brand = () => <div className="px-3 text-sm leading-5 font-semibold tracking-[0.06em]">PENCOCOKAN NIK</div>;

export default function Sidebar({ jumlahSesi = 0 }) {
  const [collapsed, setCollapsed] = useState(bacaCiut);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ubahCiut = (nilai) => {
    setCollapsed(nilai);
    try {
      localStorage.setItem(KUNCI_CIUT, nilai ? "1" : "0");
    } catch {
      // localStorage tidak tersedia (mode privat): pilihan hanya berlaku sesi ini.
    }
  };

  return (
    <>
      {/* HP: bar atas + drawer */}
      <div className="sm:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface px-1">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          className="grid size-10 place-items-center rounded-md text-lilac-text hover:bg-surface-muted"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-lilac-text/30" onClick={() => setMobileOpen(false)} />
          <aside
            aria-label="Navigasi"
            onClick={(e) => e.target.closest("a, button") && setMobileOpen(false)}
            className="absolute inset-y-0 left-0 flex w-[232px] flex-col gap-4 bg-surface px-4 py-5 shadow-pop"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                aria-label="Tutup menu"
                className="grid size-8 place-items-center rounded-sm text-ink-muted hover:bg-surface-muted"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            <IsiMenu jumlahSesi={jumlahSesi} />
          </aside>
        </div>
      )}

      {/* Desktop */}
      <aside
        aria-label="Navigasi"
        className={`hidden sm:flex sticky top-0 h-screen shrink-0 flex-col gap-4 border-r border-line bg-surface py-5 ${collapsed ? "w-[72px] px-4" : "w-[232px] px-4"}`}
      >
        {!collapsed && <Brand />}
        <IsiMenu jumlahSesi={jumlahSesi} collapsed={collapsed} />
        <div className={`mt-auto ${collapsed ? "self-center" : "px-3"}`}>
          {collapsed ? (
            <Button variant="ghost" icon={PanelLeftOpen} onClick={() => ubahCiut(false)} aria-label="Tampilkan menu" title="Tampilkan menu" />
          ) : (
            <Button variant="ghost" icon={PanelLeftClose} onClick={() => ubahCiut(true)}>
              Sembunyikan menu
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
