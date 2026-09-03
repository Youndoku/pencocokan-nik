# Pencocokan NIK

Aplikasi web untuk mencocokkan data NIK antara dua file Excel (misalnya data gabungan OPD dengan data pembanding seperti DTKS atau data ketenagakerjaan), dipakai secara internal oleh **Diskominfo Kota Batu**.

Semua proses berjalan **sepenuhnya di browser komputer Anda** — tidak ada data yang dikirim atau diunggah ke server mana pun. Aman untuk data kependudukan yang sensitif.

## Fitur Utama

- Upload dan cocokkan dua file Excel (`.xlsx`) berdasarkan kolom NIK
- Deteksi otomatis anomali data: perbedaan nama, format NIK tidak standar, dan NIK duplikat
- Dashboard analisis (grafik distribusi, analisis cross-program, penerima ganda) untuk data yang bersifat kumulatif
- Riwayat proses tersimpan otomatis di perangkat (tidak hilang saat browser ditutup)
- Pencarian NIK cepat di data hasil terbaru
- Unduh hasil dalam format Excel

## Teknologi yang Dipakai

React 19, Vite, Tailwind CSS v4, IndexedDB (lewat `idb`) untuk penyimpanan lokal, `xlsx` untuk baca/tulis file Excel, dan `recharts` untuk grafik.

---

## Cara Menjalankan di Komputer Sendiri (Panduan untuk Pemula)

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

### Cara Membuka Terminal di Windows

1. Tekan tombol **Windows** di keyboard, lalu ketik `PowerShell`.
2. Klik **Windows PowerShell** yang muncul di hasil pencarian.
3. Akan muncul jendela biru/hitam dengan kursor berkedip — di situlah nanti perintah-perintah di bawah diketik satu per satu, lalu tekan Enter setelah tiap perintah.

### Langkah 1 — Unduh Kode dari GitHub

**Opsi A — pakai Git (kalau sudah install Git di atas):**

Di terminal, ketik (ganti `namaAkun` sesuai lokasi repository yang benar kalau berbeda):

```
git clone https://github.com/Youndoku/pencocokan-nik.git
```

Tekan Enter, tunggu sampai selesai mengunduh.

**Opsi B — tanpa Git (download manual):**

1. Buka halaman repository di GitHub lewat browser.
2. Klik tombol hijau **Code**, lalu pilih **Download ZIP**.
3. Setelah terunduh, klik kanan file ZIP tersebut → **Extract All...** (ekstrak) ke folder pilihan Anda, misalnya ke Desktop.

### Langkah 2 — Masuk ke Folder Proyek

Di terminal, pindah ke folder hasil unduhan tadi. Kalau pakai Git (Opsi A), biasanya:

```
cd pencocokan-nik
```

Kalau pakai ZIP (Opsi B) dan diekstrak ke Desktop, nama foldernya biasanya `pencocokan-nik-main`:

```
cd Desktop\pencocokan-nik-main
```

(Tips: ketik `cd ` lalu spasi, kemudian seret/drag folder-nya dari File Explorer ke jendela terminal — path folder akan otomatis terisi.)

### Langkah 3 — Install Semua "Bahan" yang Dibutuhkan Aplikasi

Aplikasi ini butuh beberapa pustaka (library) tambahan supaya bisa jalan. Cukup jalankan satu perintah ini di terminal, dari dalam folder proyek:

```
npm install
```

Tunggu prosesnya — biasanya 1-3 menit tergantung koneksi internet. Akan muncul banyak teks berjalan, itu normal. Kalau sudah selesai dan kembali ke baris kosong tanpa tulisan merah besar bertuliskan "error", berarti berhasil. (Peringatan berwarna kuning/"warning" itu wajar dan boleh diabaikan.)

### Langkah 4 — Jalankan Aplikasinya

Masih di folder yang sama, ketik:

```
npm run dev
```

Tunggu sebentar sampai muncul tulisan seperti ini:

```
  VITE ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

### Langkah 5 — Buka di Browser

Buka browser (Chrome, Edge, atau Brave), lalu ketik alamat berikut di address bar:

```
http://localhost:5173
```

Tekan Enter — aplikasi Pencocokan NIK akan terbuka.

**Catatan penting:** jendela terminal yang tadi menjalankan `npm run dev` harus **tetap terbuka** selama aplikasi dipakai. Kalau jendela terminal itu ditutup, aplikasinya juga berhenti — tinggal ulangi Langkah 4 untuk menjalankan lagi (Langkah 1-3 tidak perlu diulang).

### Menghentikan Aplikasi

Klik ke jendela terminal, lalu tekan `Ctrl + C` di keyboard.

---

## Kalau Ada Masalah (Troubleshooting)

**`node` atau `npm` : "is not recognized as an internal or external command"**
Node.js belum ter-install dengan benar, atau komputer belum di-restart setelah install. Ulangi bagian "Node.js (wajib)" di atas, lalu restart komputer.

**`npm install` gagal / berhenti di tengah jalan**
Biasanya karena koneksi internet putus-putus. Coba jalankan `npm install` sekali lagi.

**Muncul tulisan `Port 5173 is already in use`**
Artinya aplikasi ini (atau aplikasi lain) sudah jalan di jendela terminal lain. Cek jendela terminal lain yang mungkin masih terbuka, atau tutup semua jendela terminal lalu ulangi Langkah 4.

**Browser menampilkan halaman kosong / error**
Pastikan jendela terminal masih terbuka dan tidak menampilkan tulisan error merah. Coba refresh halaman browser (F5).

---

## Build untuk Produksi (untuk yang mau deploy/hosting)

```
npm run build
```

Hasilnya ada di folder `dist/`, siap di-upload ke web hosting statis mana pun. Untuk mencoba hasil build tersebut secara lokal dulu:

```
npm run preview
```
