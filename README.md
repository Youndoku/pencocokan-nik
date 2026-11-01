# Pencocokan NIK

Aplikasi web internal **Diskominfo Kota Batu** (Bidang Data dan Statistik) untuk memadankan NIK antara **data gabungan** (data induk) dan **data pembanding** dari satu program atau OPD, misalnya data ketenagakerjaan.

Semua proses berjalan **sepenuhnya di browser komputer Anda**. Tidak ada data yang dikirim ke server, tidak ada login, dan aplikasi tetap jalan tanpa internet. Aman untuk data kependudukan yang sensitif.

## Cara kerja singkat

1. **Unggah** data gabungan dan data pembanding (`.xlsx`). Data gabungan juga bisa diambil dari hasil sesi sebelumnya.
2. **Atur kolom**: pilih kolom NIK (wajib), kolom nama dan kolom status (opsional), lalu beri nama kolom program baru, misalnya `Dinkes`.
3. **Periksa temuan anomali**: perbedaan nama, format NIK tidak standar, dan NIK duplikat.
4. **Hasil** tersimpan otomatis sebagai sesi. Buka dashboard atau unduh Excel hasil.

Hasilnya adalah data gabungan ditambah **satu kolom program baru**. Program ditambahkan satu per satu secara berantai ("Padankan program lain" atau "Pakai hasil sesi sebelumnya"), jadi file hasil terakhir berisi semua program. Dashboard lalu menganalisis irisan antar program, misalnya penerima ganda.

### Arti angka di kolom program

| Nilai | Arti |
|---|---|
| `1` | **Cocok**: NIK ditemukan di data pembanding (dan statusnya termasuk yang dicentang, kalau kolom status dipakai). |
| `2` | **Tidak cocok**: NIK tidak ditemukan, statusnya tidak dihitung, atau diabaikan saat pemeriksaan anomali. |

Di tampilan aplikasi, angka ini ditampilkan sebagai istilah: Cocok, Status tidak dihitung, dan Tidak cocok.

## Fitur utama

- Pencocokan NIK dua file Excel, termasuk rantai beberapa program dalam satu file hasil
- Pemeriksaan anomali sebelum hasil disimpan, dengan keputusan satu per satu atau sekaligus
- Dashboard: hasil sesi, penerima per program, jumlah program per NIK, irisan antar program, kombinasi terbanyak, penerima per kecamatan, penerima ganda, dan data hasil, dengan pilihan **Fokus program**
- Riwayat sesi tersimpan di browser (IndexedDB), lengkap dengan pencarian NIK di sesi terbaru, unduh ulang Excel, dan hapus sesi
- Halaman Bantuan di dalam aplikasi
- NIK di tampilan disamarkan (`357902••••••9916`), file Excel tetap berisi NIK utuh

## Teknologi yang dipakai

React 19, Vite 8, Tailwind CSS 4, react-router-dom 7, recharts 3 (grafik), xlsx/SheetJS (baca dan tulis Excel, dijalankan di Web Worker), idb (IndexedDB), dan lucide-react (ikon). Font di-*self-host*, tanpa CDN.

---

## Cara menjalankan di komputer sendiri (panduan untuk pemula)

Panduan ini ditulis dengan anggapan Anda **belum pernah** mengunduh kode dari GitHub atau menjalankan aplikasi seperti ini sebelumnya. Ikuti dari atas ke bawah, jangan ada langkah yang dilewati.

Panduan ini untuk **Windows**. Semua contoh perintah dijalankan lewat aplikasi terminal (jendela hitam tempat mengetik perintah) — jangan panik, nanti dijelaskan cara bukanya.

### Yang perlu disiapkan dulu

Ada 2 program yang wajib di-install di komputer Anda sebelum mulai. Kalau sudah pernah install, boleh lompat ke bagian "Langkah 1".

#### 1. Node.js (wajib)

Node.js adalah program yang dibutuhkan untuk menjalankan aplikasi berbasis JavaScript seperti ini di komputer Anda (bukan cuma di browser).

1. Buka [https://nodejs.org](https://nodejs.org) di browser.
2. Unduh versi yang bertuliskan **LTS** (Long Term Support) — ini versi yang paling stabil, disarankan untuk kebanyakan orang. Jangan pilih versi "Current".
3. Buka file installer yang sudah diunduh, lalu klik **Next** terus sampai selesai (opsi default sudah cukup, tidak perlu diubah-ubah).
4. Setelah selesai install, **restart komputer** (atau minimal tutup-buka ulang aplikasi terminal) supaya perubahannya kepakai.

Cara mengecek apakah Node.js berhasil terinstall: buka terminal (lihat cara di bawah), lalu ketik:

```
node -v
```

lalu tekan Enter. Kalau berhasil, akan muncul tulisan seperti `v20.11.0` (angkanya boleh beda). Kalau muncul tulisan error "not recognized", berarti install-nya belum berhasil atau komputer belum di-restart.

#### 2. Git (opsional, tapi disarankan)

Git dipakai untuk mengunduh (dan nanti memperbarui) kode dari GitHub lewat perintah. Kalau Anda tidak mau install Git, boleh dilewati — nanti ada cara download tanpa Git di Langkah 1 (Opsi B).

1. Buka [https://git-scm.com/downloads](https://git-scm.com/downloads).
2. Unduh installer untuk Windows, jalankan, dan klik **Next** terus sampai selesai (opsi default sudah cukup).

### Cara membuka terminal di Windows

1. Tekan tombol **Windows** di keyboard, lalu ketik `PowerShell`.
2. Klik **Windows PowerShell** yang muncul di hasil pencarian.
3. Akan muncul jendela biru/hitam dengan kursor berkedip — di situlah nanti perintah-perintah di bawah diketik satu per satu, lalu tekan Enter setelah tiap perintah.

### Langkah 1: unduh kode dari GitHub

**Opsi A — pakai Git (kalau sudah install Git di atas):**

Di terminal, ketik:

```
git clone https://github.com/Youndoku/pencocokan-nik.git
```

Tekan Enter, tunggu sampai selesai mengunduh.

**Opsi B — tanpa Git (download manual):**

1. Buka halaman repository di GitHub lewat browser.
2. Klik tombol hijau **Code**, lalu pilih **Download ZIP**.
3. Setelah terunduh, klik kanan file ZIP tersebut → **Extract All...** (ekstrak) ke folder pilihan Anda, misalnya ke Desktop.

### Langkah 2: masuk ke folder proyek

Di terminal, pindah ke folder hasil unduhan tadi. Kalau pakai Git (Opsi A), biasanya:

```
cd pencocokan-nik
```

Kalau pakai ZIP (Opsi B) dan diekstrak ke Desktop, nama foldernya biasanya `pencocokan-nik-main`:

```
cd Desktop\pencocokan-nik-main
```

(Tips: ketik `cd ` lalu spasi, kemudian seret/drag folder-nya dari File Explorer ke jendela terminal — path folder akan otomatis terisi.)

### Langkah 3: install semua "bahan" yang dibutuhkan aplikasi

Aplikasi ini butuh beberapa pustaka (library) tambahan supaya bisa jalan. Cukup jalankan satu perintah ini di terminal, dari dalam folder proyek:

```
npm install
```

Tunggu prosesnya — biasanya 1-3 menit tergantung koneksi internet. Akan muncul banyak teks berjalan, itu normal. Kalau sudah selesai dan kembali ke baris kosong tanpa tulisan merah besar bertuliskan "error", berarti berhasil. (Peringatan berwarna kuning/"warning" itu wajar dan boleh diabaikan.)

### Langkah 4: jalankan aplikasinya

Masih di folder yang sama, ketik:

```
npm run dev
```

Tunggu sebentar sampai muncul tulisan seperti ini:

```
  VITE ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

### Langkah 5: buka di browser

Buka browser (Chrome, Edge, atau Brave), lalu ketik alamat berikut di address bar:

```
http://localhost:5173
```

Tekan Enter — aplikasi Pencocokan NIK akan terbuka.

**Catatan penting:** jendela terminal yang tadi menjalankan `npm run dev` harus **tetap terbuka** selama aplikasi dipakai. Kalau jendela terminal itu ditutup, aplikasinya juga berhenti — tinggal ulangi Langkah 4 untuk menjalankan lagi (Langkah 1-3 tidak perlu diulang).

### Menghentikan aplikasi

Klik ke jendela terminal, lalu tekan `Ctrl + C` di keyboard.

---

## Kalau ada masalah (troubleshooting)

**`node` atau `npm` : "is not recognized as an internal or external command"**
Node.js belum ter-install dengan benar, atau komputer belum di-restart setelah install. Ulangi bagian "Node.js (wajib)" di atas, lalu restart komputer.

**`npm install` gagal / berhenti di tengah jalan**
Biasanya karena koneksi internet putus-putus. Coba jalankan `npm install` sekali lagi.

**Muncul tulisan `Port 5173 is already in use`**
Artinya aplikasi ini (atau aplikasi lain) sudah jalan di jendela terminal lain. Cek jendela terminal lain yang mungkin masih terbuka, atau tutup semua jendela terminal lalu ulangi Langkah 4.

**Browser menampilkan halaman kosong / error**
Pastikan jendela terminal masih terbuka dan tidak menampilkan tulisan error merah. Coba refresh halaman browser (F5).

---

## Build untuk produksi (untuk yang mau deploy/hosting)

```
npm run build
```

Hasilnya ada di folder `dist/`, siap di-upload ke web hosting statis mana pun. Untuk mencoba hasil build tersebut secara lokal dulu:

```
npm run preview
```

---

## Untuk pengembang

### Perintah

| Perintah | Fungsi |
|---|---|
| `npm install` | Pasang dependensi |
| `npm run dev` | Jalankan di `http://localhost:5173` |
| `npm run build` | Build produksi (wajib lolos sebelum commit) |
| `npm run lint` | oxlint (wajib bersih sebelum commit) |

Belum ada test otomatis. Setelah mengubah logika pencocokan, cek manual dengan file dummy di `docs/test-data/` dan pastikan angka cocok/tidak cocok tidak berubah.

### Peta kode

| Lokasi | Isi |
|---|---|
| `src/main.jsx`, `src/App.jsx` | Data router (`createBrowserRouter`), layout sidebar, rute `/`, `/pencocokan`, `/riwayat`, `/dashboard/:id`, `/bantuan` |
| `src/pages/` | Satu file per halaman. `PencocokanPage.jsx` = wizard proses data + simpan sesi + konfirmasi sebelum ditinggalkan |
| `src/hooks/usePencocokanNIK.js` | State wizard dan komunikasi dengan worker. Default keputusan anomali ada di sini |
| `src/hooks/useDashboard.js`, `useRiwayat.js` | Turunan data dashboard, CRUD sesi |
| `src/utils/excelWorker.js` | Web Worker: baca file, validasi, scan anomali, pencocokan, tulis Excel |
| `src/utils/normalize.js` | Normalisasi NIK dan nama, penyamaran NIK, penyamaan nama kecamatan |
| `src/utils/autoDetectColumns.js` | Deteksi kolom program (≥10 nilai terisi dan >80% bernilai 1/2), tebakan kolom kecamatan |
| `src/utils/crossProgramAnalysis.js` | Analisis lintas program untuk dashboard |
| `src/utils/db.js` | IndexedDB `pencocokan-nik-db`, store `sesi` |
| `src/components/ui/` | Komponen dasar (Button, Card, Badge, Select, dialog konfirmasi, dll.) |
| `src/index.css` | Token tema (`@theme` Tailwind 4, tanpa `tailwind.config`) |

### Aturan logika (jangan diubah tanpa kesepakatan)

- Pencocokan = **exact match NIK setelah normalisasi** (buang `.0`, sisakan digit). Kalau NIK di data pembanding duplikat, yang dipakai kemunculan pertama.
- Anomali:
  - Perbedaan nama: bawaan **Abaikan** (dihitung 2). "Validkan" dihitung 1.
  - Format NIK tidak standar (kosong, ada non-digit, bukan 16 digit): bawaan **Cocokkan** (tetap dicoba dicocokkan).
  - NIK duplikat: informasi saja.
- Nama kolom program baru ditolak kalau sama dengan kolom yang sudah ada atau `Keterangan`, supaya kolom lama tidak tertimpa.
- Kolom `Keterangan` hanya untuk tampilan dashboard dan **tidak ikut** file Excel unduhan.
- Kolom kecamatan dideteksi otomatis dari data gabungan. Di dashboard, tulisan nama kecamatan disamakan ke Batu, Bumiaji, dan Junrejo (toleran salah ketik ringan). Ini hanya tampilan, file Excel tidak diubah.

### Aturan wajib

- **Privasi:** semua proses di browser. Tidak boleh ada server, API, login, analytics, CDN, atau Google Fonts. Aplikasi harus jalan offline.
- NIK di tampilan ringkas atau daftar disamarkan: 6 digit + `••••••` + 4 digit. File Excel tetap berisi NIK utuh.
- Jangan simpan file berisi data warga asli di repository. Folder `contohfile/` sudah di-*ignore* untuk itu.

### Aturan penulisan UI

- Semua teks berbahasa Indonesia dengan sentence case ("Proses data baru", bukan "Proses Data Baru").
- Tanpa tanda "·" sebagai pemisah.
- Desimal pakai koma ("19,4%"), angka pakai `tabular-nums`.
- Jangan menyebut "kode 1/kode 2" di UI. Pakai istilah Cocok, Status tidak dihitung, dan Tidak cocok. Arti angka 1/2 hanya dijelaskan di halaman Bantuan.
- Program dibedakan dengan label, bukan hanya warna. Kontras teks minimal 4,5:1.
