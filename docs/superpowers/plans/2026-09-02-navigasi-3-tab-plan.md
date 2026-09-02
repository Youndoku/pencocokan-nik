# Restrukturisasi Navigasi 3 Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hapus landing page dan susun ulang navigasi jadi 3 tab (Dashboard, Proses Data, Riwayat & Pencarian), dengan Dashboard beralias ke sesi terbaru dan pencarian NIK ditambahkan ke Riwayat.

**Architecture:** Ganti route `/` dari `LandingPage` statis menjadi komponen `DashboardHome` yang redirect ke `/dashboard/:id` sesi terbaru (atau tampilkan empty state kalau belum ada sesi). Navbar disederhanakan jadi 3 item dan selalu tampil (logic penyembunyian landing dihapus). `RiwayatPage` mendapat komponen baru `NikSearchBox` yang scan `dataHasil` sesi terbaru (sudah tersedia di memori lewat `useRiwayat`) tanpa query IndexedDB tambahan.

**Tech Stack:** React 19, react-router-dom 7, Tailwind v4, idb (IndexedDB wrapper), lucide-react. Tidak ada framework testing di repo ini — verifikasi lewat `npm run lint`, `npm run build`, dan pengecekan manual di dev server (`npm run dev`).

**Spec:** `docs/superpowers/specs/2026-09-02-navigasi-3-tab-design.md`

## Global Constraints

- Tidak ada test otomatis di repo ini — setiap task diverifikasi lewat `npm run lint`, `npm run build`, dan manual check di `npm run dev` (bukan unit test).
- Tidak membangun dashboard agregat baru — Dashboard home 100% reuse `DashboardPage` yang sudah ada lewat redirect ke sesi terbaru.
- Tidak menambahkan halaman/icon Pengaturan (gear) — di luar scope plan ini.
- Pencarian NIK hanya scan `dataHasil` sesi **terbaru** (`sesiList[0]`), bukan semua sesi historis.
- Semua label UI baru pakai Bahasa Indonesia, konsisten dengan copy yang sudah ada di repo.
- Commit langsung ke `master` (konvensi repo ini tidak pakai branch/PR terpisah).

---

## Task 1: Hapus Landing Page, tambah `DashboardHome` sebagai route `/`

**Files:**
- Create: `src/pages/DashboardHome.jsx`
- Modify: `src/App.jsx`
- Delete: `src/pages/LandingPage.jsx`
- Delete: `src/components/LandingContent.jsx`

**Interfaces:**
- Consumes: `useRiwayat()` dari `src/hooks/useRiwayat.js` → `{ sesiList, loading }`. `sesiList` array sudah terurut tanggal descending (terbaru di index 0), tiap item punya field `id`.
- Produces: `DashboardHome` (default export, komponen React tanpa props) dipasang di route `/` pada `App.jsx`.

- [ ] **Step 1: Buat `src/pages/DashboardHome.jsx`**

```jsx
import { Navigate, useNavigate } from "react-router-dom";
import { useRiwayat } from "../hooks/useRiwayat.js";
import { Inbox, PlusCircle, Loader2 } from "lucide-react";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { sesiList, loading } = useRiwayat();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (sesiList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
          <Inbox size={28} className="text-slate-300" />
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Belum ada data yang diproses
        </p>
        <button
          onClick={() => navigate("/pencocokan")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <PlusCircle size={14} />
          Mulai Proses Data
        </button>
      </div>
    );
  }

  return <Navigate to={`/dashboard/${sesiList[0].id}`} replace />;
}
```

- [ ] **Step 2: Ganti isi `src/App.jsx`**

Replace seluruh isi file dengan:

```jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import PencocokanPage from "./pages/PencocokanPage.jsx";
import RiwayatPage from "./pages/RiwayatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

import { useRiwayat } from "./hooks/useRiwayat.js";

export default function App() {
  const { jumlahSesi } = useRiwayat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Navbar jumlahSesi={jumlahSesi} />

      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/pencocokan" element={<PencocokanPage />} />
        <Route path="/riwayat" element={<RiwayatPage />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}
```

Catatan: `useLocation` dan logic `isLanding` dihapus — Navbar sekarang tampil di semua halaman.

- [ ] **Step 3: Hapus file landing page yang sudah tidak dipakai**

```bash
git rm src/pages/LandingPage.jsx src/components/LandingContent.jsx
```

- [ ] **Step 4: Verifikasi lint & build**

Run: `npm run lint && npm run build`
Expected: kedua perintah selesai tanpa error (tidak ada import yang menunjuk ke file yang sudah dihapus).

- [ ] **Step 5: Verifikasi manual — empty state**

Run: `npm run dev`, buka URL yang ditampilkan di browser baru (atau clear site data / IndexedDB dulu kalau browser sudah pernah dipakai untuk app ini sebelumnya, lewat DevTools → Application → IndexedDB → hapus `pencocokan-nik-db`).
Expected: halaman `/` menampilkan empty state "Belum ada data yang diproses" dengan tombol "Mulai Proses Data" yang mengarah ke `/pencocokan`. Tidak ada error di console.

- [ ] **Step 6: Commit**

```bash
git add src/pages/DashboardHome.jsx src/App.jsx
git commit -m "feat: replace landing page with dashboard-home redirect to latest session

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EcMbct4S6QHr17Dhes6Gwz"
```

---

## Task 2: Navbar jadi 3 tab (Dashboard, Proses Data, Riwayat & Pencarian)

**Files:**
- Modify: `src/components/layout/Navbar.jsx`

**Interfaces:**
- Consumes: prop `jumlahSesi` (number, sudah ada sebelumnya, dikirim dari `App.jsx`).
- Produces: tidak ada perubahan kontrak — tetap default export `Navbar({ jumlahSesi })`.

- [ ] **Step 1: Ganti seluruh isi `src/components/layout/Navbar.jsx`**

```jsx
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
```

- [ ] **Step 2: Verifikasi lint & build**

Run: `npm run lint && npm run build`
Expected: tidak ada error.

- [ ] **Step 3: Verifikasi manual — 3 tab & active state**

Run: `npm run dev`, buka app di browser.
Expected:
- Navbar desktop menampilkan 3 item: "Dashboard" (icon bar-chart), "Proses Data" (icon upload), "Riwayat & Pencarian" (icon history, dengan badge jumlah sesi kalau > 0).
- Di `/` atau `/dashboard/<id apa pun>`, tab "Dashboard" ter-highlight (background indigo).
- Di `/pencocokan`, tab "Proses Data" ter-highlight.
- Di `/riwayat`, tab "Riwayat & Pencarian" ter-highlight.
- Mobile (lebar browser < 640px atau resize devtools): hamburger menu menampilkan 3 item yang sama.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.jsx
git commit -m "feat: restructure navbar into 3 tabs (Dashboard, Proses Data, Riwayat & Pencarian)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EcMbct4S6QHr17Dhes6Gwz"
```

---

## Task 3: Komponen `NikSearchBox`

**Files:**
- Create: `src/components/riwayat/NikSearchBox.jsx`

**Interfaces:**
- Consumes: `detectProgramColumns(rows, excludeColumn)` dari `src/utils/autoDetectColumns.js` → `string[]` (nama kolom yang terdeteksi sebagai kolom program, nilai 1/2).
- Consumes prop `sesiTerbaru`: objek sesi seperti yang disimpan lewat `simpanSesi` di `src/hooks/useRiwayat.js` — field yang dipakai: `dataHasil` (`Array<Record<string, any>> | null`), `namaKolomBaru` (`string`), `konfigurasi.kolomNikGabungan` (`string`), `konfigurasi.kolomNamaGabungan` (`string`). Boleh `null` (belum ada sesi).
- Produces: `NikSearchBox` (default export, komponen React) untuk dipasang di `RiwayatPage`.

- [ ] **Step 1: Buat `src/components/riwayat/NikSearchBox.jsx`**

```jsx
import { useMemo, useState } from "react";
import { Search, UserCheck } from "lucide-react";
import { detectProgramColumns } from "../../utils/autoDetectColumns.js";

const MIN_QUERY_LENGTH = 3;

export default function NikSearchBox({ sesiTerbaru }) {
  const [query, setQuery] = useState("");

  const dataHasil = sesiTerbaru?.dataHasil ?? null;
  const kolomNik = sesiTerbaru?.konfigurasi?.kolomNikGabungan ?? "";
  const kolomNama = sesiTerbaru?.konfigurasi?.kolomNamaGabungan ?? "";
  const namaKolomBaru = sesiTerbaru?.namaKolomBaru ?? "";

  const programColumns = useMemo(() => {
    if (!dataHasil || dataHasil.length === 0) return [];
    return detectProgramColumns(dataHasil, namaKolomBaru);
  }, [dataHasil, namaKolomBaru]);

  const statusColumns = useMemo(
    () => [...programColumns, namaKolomBaru].filter(Boolean),
    [programColumns, namaKolomBaru]
  );

  const hasil = useMemo(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH || !dataHasil || !kolomNik) return null;
    return dataHasil
      .filter((row) => String(row[kolomNik] ?? "").includes(q))
      .slice(0, 5);
  }, [query, dataHasil, kolomNik]);

  if (!sesiTerbaru) return null;

  if (!dataHasil) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-xs text-slate-400">
          Data tidak tersedia untuk pencarian NIK.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <UserCheck size={14} className="text-indigo-500" />
        Cari NIK di data terbaru
      </p>
      <div className="relative mb-2">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Ketik NIK..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
        />
      </div>

      {hasil && hasil.length === 0 && (
        <p className="text-xs text-slate-400 px-1">
          NIK tidak ditemukan di data terbaru.
        </p>
      )}

      {hasil && hasil.length > 0 && (
        <div className="space-y-2">
          {hasil.map((row, i) => (
            <div
              key={i}
              className="border border-slate-100 rounded-xl p-3 bg-slate-50/60"
            >
              <p className="text-xs font-semibold text-slate-800">
                {String(row[kolomNama] ?? "-")}
              </p>
              <p className="text-[11px] text-slate-500 mb-2">
                {String(row[kolomNik] ?? "-")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statusColumns.map((col) => {
                  const cocok = Number(row[col]) === 1;
                  return (
                    <span
                      key={col}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cocok
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {col}: {cocok ? "Cocok" : "Tidak"}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi lint & build**

Run: `npm run lint && npm run build`
Expected: tidak ada error. (Komponen belum dipasang di halaman mana pun sampai Task 4, jadi belum bisa dicek visual — itu terjadi di Task 4.)

- [ ] **Step 3: Commit**

```bash
git add src/components/riwayat/NikSearchBox.jsx
git commit -m "feat: add NikSearchBox component for latest-session NIK lookup

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EcMbct4S6QHr17Dhes6Gwz"
```

---

## Task 4: Pasang `NikSearchBox` di `RiwayatPage`

**Files:**
- Modify: `src/pages/RiwayatPage.jsx`

**Interfaces:**
- Consumes: `NikSearchBox` dari Task 3 — prop `sesiTerbaru` diisi dengan `sesiList[0] ?? null` (variabel `sesiList` sudah ada di komponen ini lewat `useRiwayat()`).

- [ ] **Step 1: Tambah import di `src/pages/RiwayatPage.jsx`**

Cari baris:
```jsx
import StorageInfo from "../components/riwayat/StorageInfo.jsx";
```

Tambahkan tepat setelahnya:
```jsx
import NikSearchBox from "../components/riwayat/NikSearchBox.jsx";
```

- [ ] **Step 2: Render `NikSearchBox` di atas toolbar**

Cari blok:
```jsx
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
```

Ganti jadi:
```jsx
      ) : (
        <>
          <NikSearchBox sesiTerbaru={sesiList[0] ?? null} />

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
```

(Section ini hanya dirender saat `jumlahSesi > 0`, jadi search box otomatis tidak muncul kalau belum ada sesi sama sekali — sesuai spec.)

- [ ] **Step 3: Verifikasi lint & build**

Run: `npm run lint && npm run build`
Expected: tidak ada error.

- [ ] **Step 4: Verifikasi manual — end-to-end**

Run: `npm run dev`, buka app di browser (idealnya dengan IndexedDB kosong, lihat Task 1 Step 5 untuk cara clear).

1. Di `/`, pastikan tampil empty state (belum ada sesi) → klik "Mulai Proses Data".
2. Selesaikan satu proses pencocokan penuh di halaman Proses Data (upload dua file Excel yang punya kolom NIK & Nama, konfigurasi kolom, proses sampai halaman Hasil). File contoh apa saja boleh, yang penting kolom NIK-nya jelas.
3. Setelah hasil tersimpan, buka tab "Riwayat & Pencarian" dari Navbar.
4. Expected: kotak "Cari NIK di data terbaru" muncul di atas toolbar pencarian nama file yang lama.
5. Ketik salah satu NIK dari data yang barusan diproses (minimal 3 digit) → Expected: muncul kartu hasil dengan Nama, NIK, dan badge status ("Cocok"/"Tidak") untuk kolom hasil sesi itu.
6. Ketik NIK acak yang jelas tidak ada di data (misal semua angka 9) → Expected: pesan "NIK tidak ditemukan di data terbaru."
7. Buka tab "Dashboard" dari Navbar (atau navigasi ke `/`) → Expected: langsung redirect ke `/dashboard/<id sesi tadi>` menampilkan `DashboardPage` yang sudah ada, tab "Dashboard" di Navbar ter-highlight.
8. Cek console browser — tidak ada error di sepanjang alur ini.

- [ ] **Step 5: Commit**

```bash
git add src/pages/RiwayatPage.jsx
git commit -m "feat: wire NikSearchBox into Riwayat & Pencarian page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EcMbct4S6QHr17Dhes6Gwz"
```
