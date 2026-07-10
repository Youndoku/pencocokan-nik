# AGENTS.md — Panduan untuk AI Coding Agent

Baca file ini terlebih dahulu sebelum melakukan perubahan apa pun di project ini.
Dokumen pendukung lain ada di folder `docs/`: `REQUIREMENTS.md`, `TECH_STACK.md`,
`ARCHITECTURE.md`. Baca juga file-file itu jika relevan dengan task yang diberikan.

## Tentang project ini

Ini adalah tool web internal untuk **Diskominfo Kota Batu** yang mencocokkan
data warga (data gabungan OPD) terhadap satu file data pembanding (misal data
pencari kerja) berdasarkan **NIK**, untuk mendukung program bantuan sosial.
Dibuat oleh mahasiswa PKL (bukan tim engineering profesional), jadi kode harus
tetap **sederhana dan mudah dipahami**, bukan over-engineered.

## Aturan non-negosiabel

1. **Tidak ada backend/server.** Semua proses (baca file, matching, generate
   hasil) harus terjadi 100% di browser (client-side). Ini keputusan sadar,
   bukan keterbatasan teknis — data NIK adalah data pribadi warga, dan tidak
   boleh dikirim ke server mana pun. Jangan usulkan atau tambahkan backend,
   API call ke server, atau database eksternal tanpa diminta eksplisit oleh
   pengguna.
2. **Kunci pencocokan adalah NIK, bukan Nama.** Nama hanya dipakai untuk
   validasi silang (mendeteksi NIK yang cocok tapi nama beda, sebagai sinyal
   kemungkinan data tidak valid) — bukan sebagai dasar pencocokan utama.
3. **Jangan hardcode nama kolom.** Nama kolom (NIK, Nama, status, dll) di
   file yang diupload user bisa berbeda-beda antar sumber data. Semua
   pemetaan kolom harus bisa dipilih/diubah pengguna lewat UI (dropdown),
   dengan tebakan otomatis sebagai default (lihat `guessColumn` di
   `utils/excelIO.js`).
4. **Filter status harus fleksibel, bukan hardcode.** Sebagian file
   pembanding punya kolom status (misal "Mundur", "Aktif", "Tidak Memenuhi
   Syarat") yang menentukan apakah suatu baris valid dihitung "cocok".
   Nilai-nilai ini berbeda-beda tiap sumber data, jadi sistem harus
   mendeteksi nilai unik dari kolom yang dipilih user dan membiarkan user
   memilih (checklist) mana yang dianggap valid — bukan menebak sendiri
   berdasarkan kata kunci seperti "mundur".
5. **Jaga ukuran file hasil.** Saat baca file (`sheet_to_json`), selalu pakai
   opsi `blankrows: false` untuk menghindari baris kosong ikut terbaca akibat
   "used range" Excel yang lebih besar dari data asli. Saat menulis file
   (`writeFile`), selalu pakai opsi `compression: true`. Ini pernah jadi bug
   nyata (file 13MB + 1MB input menghasilkan output 117MB tanpa opsi ini).
6. **Satu file pembanding per proses**, bukan loop banyak file dalam satu
   folder. Alur: upload data gabungan + satu file pembanding → konfigurasi →
   proses → download. (Kalau user minta ubah ke banyak file sekaligus,
   konfirmasi dulu — ini keputusan desain yang sudah dipilih user secara
   sadar dan berkebalikan dari versi awal yang loop banyak file.)

## Sebelum menambah fitur baru

- Cek apakah fitur tersebut butuh backend. Kalau ya, **tanya user dulu**
  sebelum implementasi — jangan asumsikan.
- Cek apakah fitur tersebut menambah asumsi/hardcode terhadap struktur data
  tertentu. Kalau ya, cari cara membuatnya tetap fleksibel/dikonfigurasi user.
- Pertahankan pemisahan `utils/` (logic murni, tanpa React) vs `hooks/`
  (state React) vs `components/` (tampilan saja). Lihat `ARCHITECTURE.md`.

## Bahasa

Semua teks UI, komentar kode, dan nama variabel dalam Bahasa Indonesia
(mengikuti konvensi yang sudah ada: `namaKolomBaru`, `kolomNikGabungan`,
dst). Jangan campur ke Bahasa Inggris kecuali untuk nama library atau term
teknis yang tidak ada padanannya.

## Konteks Desain (Impeccable)

- **Register**: `product` (Web tool internal Diskominfo Kota Batu).
- **Prinsip Desain**:
  1. **Kejelasan Alur Kerja**: Menyusun proses upload, konfigurasi, dan hasil dalam langkah-langkah linier (step-by-step) yang mudah dipahami.
  2. **Fokus Keterbacaan Data**: Menjamin kontras tinggi pada NIK dan preview data.
  3. **Keamanan Transparan**: Penegasan visual bahwa data diproses lokal 100% di browser.
- **Visual**: Mengacu pada [DESIGN.md](file:///D:/.Kuliah/Magang/pencocokan-nik/DESIGN.md) (Warna Indigo `#4f46e5`, Font Inter, Flat-by-Default).

