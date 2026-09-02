# Restrukturisasi Navigasi: Hapus Landing Page, 3 Tab Utama

**Status:** Disetujui, siap masuk fase implementation plan
**Tanggal:** 2026-09-02

## Latar belakang

Aplikasi saat ini punya 4 halaman: `/` (LandingPage — hero marketing dengan tombol
"Mulai" dan "Riwayat"), `/pencocokan` (alur upload → konfigurasi → anomali → hasil),
`/riwayat` (daftar sesi tersimpan), `/dashboard/:id` (BI dashboard per sesi).

Alur kerja nyata pengguna bersifat **kumulatif**: hasil unduhan dari satu proses
pencocokan dipakai lagi sebagai file "gabungan" pada proses berikutnya, sehingga
kolom status program terus bertambah dari sesi ke sesi. Konsekuensinya, sesi
**terbaru selalu jadi representasi paling lengkap** dari seluruh data — tidak ada
kebutuhan agregasi lintas-sesi yang terpisah.

Tujuan perubahan ini: hilangkan landing page (satu langkah ekstra yang tidak perlu),
dan susun ulang navigasi jadi 3 tab yang match dengan mental model pengguna (ASN):
lihat kondisi → aksi → cek histori/cari.

## Tujuan & non-tujuan

**Tujuan:**
- Landing page dihapus; membuka aplikasi langsung berguna (Dashboard sesi terbaru,
  atau ajakan mulai proses kalau belum ada data).
- Navigasi disederhanakan jadi 3 tab: Dashboard, Proses Data, Riwayat & Pencarian.
- Riwayat digabung dengan kemampuan pencarian NIK cepat di data hasil terbaru.

**Non-tujuan (disepakati eksplisit di luar scope):**
- Tidak membangun dashboard agregat baru lintas-semua-sesi — cukup alias ke sesi
  terbaru, reuse `DashboardPage` yang sudah ada apa adanya.
- Tidak menambahkan halaman/icon Pengaturan (gear) — belum ada fitur (mis. fuzzy
  matching/threshold) yang perlu diatur di kode saat ini.
- Pencarian NIK hanya menyasar `dataHasil` sesi **terbaru**, bukan scan semua sesi
  historis (lebih cepat, dan karena kumulatif sesi terbaru sudah paling lengkap).

## Perubahan routing

| Path | Sebelum | Sesudah |
|---|---|---|
| `/` | `LandingPage` (hero) | **Dashboard** — komponen baru `DashboardHome` yang redirect ke `/dashboard/:id` sesi terbaru, atau tampilkan empty state kalau belum ada sesi sama sekali |
| `/pencocokan` | `PencocokanPage` | Tidak berubah secara teknis; label nav berubah jadi "Proses Data" |
| `/riwayat` | `RiwayatPage` | "Riwayat & Pencarian" — ditambah kotak pencarian NIK |
| `/dashboard/:id` | `DashboardPage` | Tidak berubah — tetap jadi target redirect Dashboard-home maupun drill-down manual dari Riwayat |

File yang dihapus (tidak lagi direferensikan): `src/pages/LandingPage.jsx`,
`src/components/LandingContent.jsx`.

## Komponen baru: `DashboardHome`

Lokasi: `src/pages/DashboardHome.jsx` (dipasang di route `/`).

Logika:
1. Pakai `useRiwayat()` untuk ambil `sesiList` (sudah terurut tanggal terbaru-dulu)
   dan `loading`.
2. Saat `loading` → tampilkan spinner (pola sama seperti halaman lain).
3. Saat `sesiList.length === 0` → tampilkan empty state (gaya sama dengan empty
   state `RiwayatPage` sekarang): ikon, teks "Belum ada data diproses", tombol CTA
   "Mulai Proses Data" → `navigate("/pencocokan")`.
4. Selain itu → `<Navigate to={`/dashboard/${sesiList[0].id}`} replace />`.

Tidak ada logika agregasi baru, tidak ada query IndexedDB tambahan — 100% reuse data
yang sudah dimuat `useRiwayat` dan komponen `DashboardPage` yang sudah ada.

## Navbar

`src/components/layout/Navbar.jsx`:
- Hapus logic `isLanding` di `App.jsx` yang menyembunyikan Navbar di `/` — Navbar
  tampil di semua halaman sekarang.
- `navItems` menjadi 3 entri:
  1. Dashboard → `/` (aktif juga saat path diawali `/dashboard`)
  2. Proses Data → `/pencocokan` (icon & label diganti dari "Pencocokan Baru")
  3. Riwayat & Pencarian → `/riwayat` (badge jumlah sesi tetap ada)
- Logo tetap link ke `/` (sekarang mengarah ke tab Dashboard, bukan landing).

## Riwayat & Pencarian — tambah search NIK

`src/pages/RiwayatPage.jsx` (nama file & route tidak berubah, cuma isi & label nav):

- Tambahan section baru di atas toolbar yang sudah ada: input pencarian NIK dengan
  placeholder "Cari NIK di data terbaru...".
- Saat user mengetik (min. beberapa digit, mis. 3+), scan `sesiList[0].dataHasil`
  (sesi terbaru — sudah tersedia di memori dari `useRiwayat`, tidak perlu fetch
  tambahan) mencocokkan kolom NIK (`sesiList[0].konfigurasi.kolomNikGabungan`).
- Kalau ketemu → tampilkan kartu hasil ringkas: Nama, NIK, dan status di
  masing-masing kolom program yang ada di `kolomTersedia`/kolom program sesi itu.
- Kalau tidak ketemu (dan sesi terbaru ada) → pesan "NIK tidak ditemukan di data
  terbaru".
- Kalau belum ada sesi sama sekali → search box disembunyikan/disabled (pakai empty
  state yang sudah ada).
- Toolbar & list sesi yang sudah ada (search nama file, sort tanggal/persentase,
  bulk delete, StorageInfo) **tidak berubah** — search NIK ini section terpisah,
  bukan pengganti.

## Error handling & edge cases

- Sesi terbaru tanpa `dataHasil` (seharusnya tidak terjadi — `dataHasil` selalu
  diisi saat sesi disimpan) → search NIK menampilkan "Data tidak tersedia" alih-alih
  crash.
- NIK yang diketik tidak persis 16 digit / bukan angka → tetap dicoba dicocokkan
  sebagai substring, tidak divalidasi format (konsisten dengan filosofi tool: user
  yang tahu data mereka).
- Route lama yang mungkin di-bookmark (`/` versi landing) otomatis teralihkan oleh
  routing baru — tidak perlu redirect khusus karena `/` tetap valid, cuma isinya
  beda.

## Testing

Tidak ada test otomatis di proyek ini (konvensi repo). Verifikasi manual dilakukan
lewat `run` skill setelah implementasi: buka `/` dengan 0 sesi (empty state), dengan
≥1 sesi (redirect ke dashboard terbaru), cek Navbar 3 tab, cek search NIK di
Riwayat & Pencarian dengan NIK yang ada dan yang tidak ada.
