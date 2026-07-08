# Requirements

## Latar belakang

Diskominfo Kota Batu perlu mencocokkan data warga dari berbagai OPD (data
gabungan: NIK, No KK, Nama, Alamat) terhadap data pembanding dari sumber lain
(misal data pencari kerja dari Dinas Tenaga Kerja) untuk mendukung
pengambilan keputusan program bantuan sosial. Proses ini sebelumnya
dilakukan manual satu-satu, tidak efisien untuk data dalam jumlah besar.

Tool ini dibuat untuk **validasi**: hasil dari tool ini dibandingkan secara
manual dengan hasil yang sudah dikerjakan tim lain (proses paralel, bukan
saling menggantikan), sehingga akurasi harus jadi prioritas utama.

## Requirement fungsional

### 1. Upload data
- User mengupload 2 file `.xlsx`: **Data Gabungan** (data utama, kolom
  minimal NIK, No KK, Nama, Alamat) dan **Data Pembanding** (satu file,
  misal data pencari kerja).
- Sistem membaca file sepenuhnya di browser (tidak diunggah ke server).

### 2. Konfigurasi pemetaan kolom
- User memilih kolom mana di kedua file yang berperan sebagai NIK (wajib).
- User memilih kolom mana yang berperan sebagai Nama (opsional, untuk
  validasi silang).
- Sistem menebak default pemetaan berdasarkan nama header yang mengandung
  kata "nik" / "nama", tapi user tetap bisa mengubahnya manual.

### 3. Filter status (opsional)
- User bisa memilih kolom "status/keterangan" di data pembanding (misal ada
  kolom yang menandai "Aktif", "Mundur", "Tidak Memenuhi Syarat", dst).
- Jika dipilih, sistem menampilkan seluruh nilai unik yang ada di kolom
  tersebut sebagai checklist.
- User mencentang nilai mana yang dianggap valid/dihitung sebagai "cocok".
- **Alasan fitur ini ada:** NIK yang ditemukan di data pembanding tidak
  selalu berarti orang tersebut valid untuk dihitung — misal kalau orang
  tersebut sudah mengundurkan diri dari program. Sistem tidak boleh
  menganggap "NIK ketemu = otomatis cocok" secara membabi buta.

### 4. Proses pencocokan
- Kunci pencocokan: **NIK** (dinormalisasi: hanya digit, tanpa titik/spasi,
  buang notasi desimal seperti `1234.0` yang muncul akibat Excel membaca NIK
  sebagai angka).
- Untuk tiap baris di data gabungan:
  - Isi `1` jika NIK ditemukan di data pembanding **dan** (jika filter status
    aktif) statusnya termasuk yang dicentang valid.
  - Isi `2` jika tidak.
- Kolom baru diberi nama sesuai input user (default: nama file pembanding).
- Kolom "Keterangan" tambahan menjelaskan alasan status per baris (NIK tidak
  ditemukan / NIK ditemukan / NIK ditemukan tapi status X tidak dihitung).

### 5. Validasi nama
- Untuk baris yang NIK-nya cocok, sistem bandingkan Nama di kedua file
  (dinormalisasi: uppercase, spasi dirapikan).
- Jika beda, dicatat sebagai potensi anomali (kemungkinan NIK duplikat/typo)
  di sheet terpisah "Validasi Nama" pada file hasil — bukan untuk
  menentukan valid/tidaknya pencocokan, murni informasi untuk ditinjau
  manual oleh user.

### 6. Hasil & unduhan
- Ringkasan ditampilkan di layar: total baris, jumlah cocok, jumlah tidak
  cocok, jumlah yang dikecualikan karena status (jika filter status dipakai).
- Preview tabel mismatch nama (maksimal beberapa baris, sisanya ada di file).
- Tombol unduh menghasilkan 1 file `.xlsx` berisi:
  - Sheet "Hasil": data gabungan lengkap + kolom baru + kolom Keterangan.
  - Sheet "Validasi Nama" (jika ada mismatch): daftar NIK dengan nama beda.

## Requirement non-fungsional

- **Privasi data**: NIK adalah data pribadi. Semua pemrosesan wajib
  client-side, tidak ada data yang dikirim ke server/pihak ketiga.
- **Tidak ada database/state permanen** — setiap sesi berdiri sendiri, tidak
  ada histori yang disimpan (di luar scope saat ini).
- **Ukuran file wajar** — file hasil tidak boleh jauh lebih besar dari
  gabungan ukuran file input (lihat catatan teknis di `AGENTS.md` soal
  `blankrows` dan `compression`).
- **Fleksibel terhadap struktur data berbeda** — tidak ada nama kolom atau
  nilai status yang di-hardcode, karena sumber data pembanding bisa
  berganti-ganti dan strukturnya belum tentu konsisten.
- **Dipakai oleh non-programmer** — UI harus jelas dan self-explanatory,
  karena akan dipakai staf Diskominfo, bukan hanya tim pengembang.

## Di luar scope (saat ini)

- Backend/server, database, autentikasi/login.
- Proses banyak file pembanding sekaligus dalam satu kali proses (sengaja
  dibuat satu file per proses agar mudah divalidasi manual satu-satu).
- Dashboard/visualisasi analitik (mungkin dibutuhkan di fase project
  berikutnya sesuai judul PKL, tapi bukan bagian dari tool ini).
