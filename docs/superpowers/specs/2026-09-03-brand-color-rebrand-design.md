# Rebrand ke Palet Resmi Kota Batu / Diskominfo

**Status:** Disetujui, siap masuk fase implementation plan
**Tanggal:** 2026-09-03
**Sumber:** `C:\Users\Sahrur\Downloads\Design.md` (palet resmi hasil ekstraksi warna dari logo Kota Batu dan logo Diskominfo Kota Batu)

## Latar belakang

Aplikasi ini saat ini pakai palet default Tailwind (`indigo-*` sebagai warna brand utama, `emerald-*` untuk status sukses, `amber-*` untuk peringatan, `red-*`/`blue-*`/`purple-*` di beberapa tempat) — bukan warna resmi organisasi. Diskominfo Kota Batu menyediakan `Design.md`: palet dua-lapis identitas — **hijau Kota Batu** (`primary`, sipil/kota) dan **biru-ungu Diskominfo** (`secondary`, digital/gov-tech) — lengkap dengan token untuk chart, status, dan diagram.

27 dari ~30 file komponen di `src/` memakai warna Tailwind default secara langsung di className, jadi ini perubahan identitas visual lintas-aplikasi.

## Tujuan & non-tujuan

**Tujuan:**
- Semua warna brand/semantic di aplikasi diganti ke token dari `Design.md`, satu putaran kerja (full-app, bukan bertahap).
- Urutan warna kategorikal untuk chart divalidasi dulu (skill dataviz) sebelum dipakai — bukan asal ambil urutan yang tertulis di `Design.md`.

**Non-tujuan (disepakati eksplisit di luar scope):**
- Skala abu-abu (`slate-*` Tailwind) **tidak diganti** — `Design.md` cuma kasih 4 token neutral (900/100/white/400), tidak cukup buat menggantikan 10 tingkat `slate` yang sudah dipakai konsisten untuk border/teks-muted/background. Cuma warna BRAND/SEMANTIC yang diganti.
- Tidak menambahkan dark mode — aplikasi ini memang cuma punya satu tema (terang), tidak ada toggle. Token yang didefinisikan cukup untuk mode terang saja.
- Tidak membangun heatmap/choropleth baru — ramp sequential/diverging dari `Design.md` didefinisikan sebagai token untuk dipakai nanti kalau ada kebutuhan, tapi tidak ada chart baru jenis itu di scope ini.

## Token warna (`src/index.css`, Tailwind v4 `@theme`)

Tailwind v4 di repo ini pakai `@theme` berbasis CSS (bukan `tailwind.config.js`). Token didefinisikan sebagai `--color-*`, otomatis jadi utility class (`bg-primary`, `text-primary-dark`, `border-secondary-light`, dst — termasuk varian opacity `bg-primary/10` gratis dari Tailwind):

```css
@theme {
  --color-primary: #0DA44F;
  --color-primary-dark: #0B7A3B;
  --color-primary-light: #C0D8CC;

  --color-secondary: #4454AA;
  --color-secondary-dark: #3A4164;
  --color-secondary-light: #DCE1F1;

  --color-accent-sky: #09ABE7;
  --color-accent-gold: #DBEC20;
  --color-accent-red: #D91F2B;

  --color-neutral-900: #191D1C;
  --color-neutral-100: #F4F4F4;
  --color-neutral-white: #FFFFFF;
  --color-neutral-400: #B0B0B0;
}
```

Ditambahkan ke `@theme` block yang sudah ada di `src/index.css` (yang sekarang cuma berisi `--font-sans`), tidak menggantikan apa pun yang ada.

## Pemetaan warna lama → token baru

| Class lama (contoh) | Token baru | Alasan |
|---|---|---|
| `indigo-600` / `indigo-700` (tombol utama, active nav state, link) | `primary` / `primary-dark` | Design.md: primary = "Main brand color, primary buttons, active states, links" |
| `indigo-50` / `indigo-100` (badge, tint lembut, bg nav aktif) | `primary-light` | Design.md: primary-light = "Soft backgrounds, badges, tinted surfaces" — dipakai langsung, bukan opacity trick, karena memang itu fungsinya |
| `emerald-*` (badge/teks "Cocok", tombol Unduh Excel) | `primary` / `primary-dark` / `primary-light` | Semantic mapping: Success = primary |
| `amber-*` (Dikecualikan, highlight NIK tidak standar) | `accent-gold` + **teks gelap (`neutral-900`) di atasnya, bukan putih** | Semantic: Warning = accent-gold; Design.md eksplisit: "use darker text on top, contrast is weak" |
| `red-*` (error, tombol hapus, "Tidak Cocok") | `accent-red` | Semantic: Error = accent-red |
| `blue-*` (alert info di `ValidationReport.jsx`) | `accent-sky` | Semantic: Info = accent-sky |
| `purple-500` (gradient tombol "Lihat Dashboard Lengkap") | `secondary` | Gradient `primary → secondary` = ekspresi literal "kontras brand inti" yang disebut catatan Design.md |
| `slate-*` (border, teks muted, background netral) | **tidak berubah** | Di luar scope — lihat Non-tujuan |

**Aturan tint/badge tanpa varian `-light`:** `accent-sky`, `accent-gold`, `accent-red` tidak punya token `-light` sendiri di Design.md. Untuk background pudar (mis. kotak alert `bg-red-50` sekarang), pakai token dasarnya dengan modifier opacity Tailwind: `bg-accent-red/10`, `bg-accent-sky/10`, `bg-accent-gold/15` (gold butuh sedikit lebih pekat karena lightness-nya sudah tinggi). Teks/ikon di atasnya tetap pakai warna solid token (`text-accent-red`, dst), kecuali gold yang teksnya harus `neutral-900`.

## Chart & diagram — temuan validasi

`Design.md` menuliskan urutan kategorikal 7-warna: `primary, secondary, accent-gold, accent-red, accent-sky, secondary-dark, primary-dark`. Divalidasi pakai `scripts/validate_palette.js` dari skill dataviz (mode light) — **gagal 2 pengecekan:**
- `accent-gold` di posisi mark chart: lightness terlalu tinggi & kontras vs surface cuma 1.28 (syarat minimal 3:1) — kebaca nyaris hilang di background terang.
- `secondary-dark`: chroma di bawah batas (0.06) — kebaca abu-abu, bukan warna yang bisa dibedakan.

**Urutan pengganti yang divalidasi (lolos semua check):** `primary, secondary, accent-red, accent-sky, primary-dark` (5 warna, urutan ini menjaga jarak CVD-safe antar warna bersebelahan). `accent-sky` masih dapat WARN kontras (2.56, di bawah 3:1) — tidak fatal karena tiap chart di aplikasi ini sudah punya tooltip hover (Recharts `<Tooltip>`) dan/atau tabel data pendamping (`DataTable.jsx`), yang menurut aturan skill dataviz sudah jadi "relief" yang disyaratkan untuk WARN kontras.

**Pemakaian:**
- **Chart dengan seri terbuka/berulang** (bar per-program di `ProgramComparisonChart.jsx`, bar per-kategori-keterangan di `DistributionChart.jsx`) → pakai urutan 5-warna tervalidasi ini secara berurutan (`BAR_COLORS` array), bukan urutan asli Design.md.
- **Warna berstatus tetap** (pie chart Cocok/Tidak Cocok/Dikecualikan di `ResultsDashboard.jsx`) → ikut semantic mapping Design.md apa adanya: Cocok=`primary`, Tidak Cocok=`accent-red`, Dikecualikan=`accent-gold`. Ini bukan rotasi kategorikal (satu warna selalu berarti satu hal yang sama), dan sudah dipasangkan dengan legend teks + swatch (bukan warna sendirian), jadi memenuhi aturan "status colors... ship with an icon + label, never color alone."

Ramp sequential (hijau, biru-ungu) dan diverging dari Design.md **dipakai apa adanya** sebagai token — sudah monoton lightness-nya dan diverging-nya sudah dua-hue+neutral-midpoint sesuai kaidah skill dataviz. Tidak ada chart heatmap/choropleth di aplikasi ini sekarang; token ini didefinisikan untuk kebutuhan nanti (lihat Non-tujuan).

## File yang terdampak (27 file)

Ditemukan lewat `grep -rl "indigo-\|slate-\|emerald-\|amber-"` (belum termasuk `blue-*`/`purple-*` yang cuma di 2 file tambahan):

```
src/App.jsx
src/pages/DashboardHome.jsx
src/pages/DashboardPage.jsx
src/pages/PencocokanPage.jsx
src/pages/RiwayatPage.jsx
src/components/layout/Sidebar.jsx
src/components/ui/MetricCard.jsx
src/components/dashboard/AnomalyReview.jsx
src/components/dashboard/CrossProgramMatrix.jsx
src/components/dashboard/DataTable.jsx
src/components/dashboard/DistributionChart.jsx
src/components/dashboard/DuplicateRecipients.jsx
src/components/dashboard/ExportPanel.jsx
src/components/dashboard/ProgramComparisonChart.jsx
src/components/dashboard/SummaryPanel.jsx
src/components/pencocokan/AnomalyStep.jsx
src/components/pencocokan/ColumnSelect.jsx
src/components/pencocokan/ConfigureStep.jsx
src/components/pencocokan/DataPreview.jsx
src/components/pencocokan/ResultsDashboard.jsx
src/components/pencocokan/StepDot.jsx
src/components/pencocokan/UploadSlot.jsx
src/components/pencocokan/UploadStep.jsx
src/components/pencocokan/ValidationReport.jsx
src/components/riwayat/SessionCard.jsx
src/components/riwayat/StorageInfo.jsx
src/components/riwayat/NikSearchBox.jsx
```

Catatan: `slate-*` di file-file ini TIDAK ikut diganti (lihat Non-tujuan) — hanya baris yang memakai `indigo-*`/`emerald-*`/`amber-*`/`red-*`/`blue-*`/`purple-*` yang tersentuh.

## Error handling & edge case

- `accent-gold` dipakai sebagai fill/background — **tidak pernah** sebagai warna teks langsung (Design.md: gagal WCAG AA sebagai warna teks). Setiap kali gold jadi background, teks di atasnya wajib `neutral-900`.
- Badge/gradient yang sebelumnya pakai dua warna Tailwind default berdekatan (mis. `from-indigo-500 to-purple-500`) diganti jadi `from-primary to-secondary` sebagai satu keputusan konsisten, bukan dievaluasi hex-per-hex.
- Kalau ada pemakaian warna yang tidak masuk kategori manapun di tabel pemetaan saat implementasi (kemungkinan kecil, hasil grep sudah menyisir semua file), default-nya: treat sebagai kasus baru, ikuti Semantic mapping Design.md berdasarkan MAKNA penggunaannya (bukan hex terdekat), catat sebagai keputusan di laporan task.

## Testing

Tidak ada test otomatis di proyek ini (konvensi repo). Verifikasi manual: `npm run lint` + `npm run build` bersih setelah tiap batch file, lalu cek visual lewat `run` skill (dev server + browser) — terutama kontras teks di atas `accent-gold` dan urutan warna chart kategorikal.
