---
name: Pencocokan NIK
description: Panduan visual sistem pencocokan data NIK Diskominfo Kota Batu
colors:
  primary: "#4f46e5"
  neutral-bg: "#f8fafc"
  neutral-border: "#e2e8f0"
  neutral-text: "#0f172a"
  neutral-muted: "#64748b"
  success: "#059669"
  success-bg: "#ecfdf5"
  danger: "#dc2626"
  danger-bg: "#fef2f2"
  warning: "#d97706"
  warning-bg: "#fffbeb"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#4338ca"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: Pencocokan NIK

## 1. Overview

**Creative North Star: "The Secure Bureau"**

Sistem visual ini dirancang untuk menghadirkan rasa aman, resmi, dan efisien untuk staf dinas Diskominfo Kota Batu. Tampilan mengadopsi palet warna institusional yang kokoh dengan layout terstruktur yang memandu pengguna melalui 3 langkah berurutan secara linier. Seluruh pemrosesan dilakukan lokal di browser, sehingga desain harus memperkuat transparansi keamanan ini tanpa elemen dekoratif yang berlebihan.

**Key Characteristics:**
- **Kejelasan Alur**: Indikator langkah (step-by-step progress indicator) yang menonjol dan memandu fokus staf.
- **Kepadatan Data yang Seimbang**: Data preview ditampilkan bersih dengan kontras tinggi sehingga mudah dibaca.
- **Respons Umpan Balik Instan**: Setiap status (kosong, memuat, berhasil, error) diwakili oleh perubahan warna batas (border) dan latar belakang yang halus.

## 2. Colors

Sistem warna menggunakan kombinasi biru/indigo formal dengan warna-warna status pendukung yang tegas untuk mempermudah identifikasi data.

### Primary
- **Indigo Dinas** (`#4f46e5` / `oklch(0.55 0.25 264)`): Digunakan untuk tombol utama, ikon pemandu, dan penanda langkah aktif. Mewakili otoritas, kepercayaan, dan keandalan sistem pemerintahan.

### Neutral
- **Ink Dark** (`#0f172a`): Digunakan untuk teks utama demi memastikan kontras maksimal.
- **Slate Muted** (`#64748b`): Digunakan untuk teks sekunder dan label pembantu.
- **Border Light** (`#e2e8f0`): Batas default untuk kartu dan pemisah bagian.
- **Background Wash** (`#f8fafc` / `#ffffff`): Latar belakang halaman yang bersih dengan gradasi halus agar mata tidak lelah.

### Success & Warning
- **Success Emerald** (`#059669` / `#ecfdf5`): Warna hijau lembut untuk menandakan file berhasil diunggah dan jumlah baris data yang cocok.
- **Alert Amber/Red** (`#d97706` / `#dc2626`): Warna merah/kuning untuk kesalahan upload, ketidakcocokan data NIK, atau peringatan status anomali.

### Named Rules
**Aturan Skema Biru-Institusional.** Warna utama Indigo hanya digunakan untuk elemen interaktif (tombol, link aktif) dan indikator status proses utama. Bagian non-interaktif didominasi oleh warna netral (Slate dan Slate Wash).

## 3. Typography

**Display Font:** Inter (Sans-serif)
**Body Font:** Inter (Sans-serif)

Sistem menggunakan font tunggal **Inter** yang berfokus pada keterbacaan data numerik (seperti NIK dan angka statistik).

### Hierarchy
- **Display** (Bold, 1.25rem / 20px, 1.25): Digunakan untuk judul aplikasi utama di header halaman.
- **Headline** (Semi-bold, 1.125rem / 18px, 1.3): Digunakan untuk judul langkah / bagian di dalam kartu utama.
- **Title** (Medium, 0.875rem / 14px, 1.4): Digunakan untuk label form dan judul slot upload.
- **Body** (Regular, 0.875rem / 14px, 1.5): Teks penjelasan alur dengan panjang baris maksimal 65ch.
- **Label/Mono** (Medium, 0.75rem / 12px, tracking-normal): Untuk data numerik NIK, nama kolom Excel, dan statistik dalam tabel.

## 4. Elevation

Sistem visual ini mengadopsi prinsip desain semi-flat di mana bayangan (shadow) hanya digunakan secara sekunder untuk memberikan respons kedalaman visual ketika pengguna berinteraksi dengan elemen utama.

### Shadow Vocabulary
- **Interactive Hover** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Digunakan pada kartu upload atau tombol utama saat di-hover.

### Named Rules
**Aturan Ketinggian Datar (Flat-by-Default).** Kartu dan panel bersifat datar (flat) pada kondisi diam (rest). Bayangan halus hanya muncul saat elemen tersebut mendapatkan fokus atau di-hover oleh kursor pengguna.

## 5. Components

### Buttons
- **Shape:** Sudut tumpul dengan radius sedang (`rounded-md` / 8px).
- **Primary:** Warna latar Indigo (`#4f46e5`), teks putih, dengan padding vertikal 8px dan horizontal 16px.
- **Hover:** Transisi warna latar menjadi lebih gelap (`#4338ca`) dengan transisi halus (`transition-colors duration-200`).

### Cards / Containers
- **Corner Style:** Sudut melengkung halus (`rounded-lg` / 12px) untuk melunakkan tampilan form yang kaku.
- **Border:** Garis batas tipis 1px (`border-slate-200`).
- **Internal Padding:** Spasing dalam longgar (`p-5` / 20px) untuk memisahkan konten dengan bersih.

### Upload Slots
- **Style:** Latar belakang putih dengan transisi warna border saat file terpilih. Batas menjadi hijau (`border-emerald-300`) jika sukses, indigo (`border-indigo-300`) saat loading, atau slate (`border-slate-200`) saat kosong.

### Inputs / Dropdowns
- **Style:** Border tipis (`border-slate-300`), sudut tumpul (`rounded-md` / 6px), teks berukuran 14px.
- **Focus:** Highlight menggunakan ring berwarna biru (`ring-indigo-500` / `border-indigo-500`).

## 6. Do's and Don'ts

### Do:
- **Do** Tampilkan preview data Excel dalam format tabel mini agar staf dinas bisa memverifikasi kolom sebelum melakukan pemrosesan.
- **Do** Pastikan visualisasi indikator progress langkah (1, 2, 3) selalu terlihat jelas di bagian atas aplikasi.
- **Do** Gunakan ikon status bersamaan dengan warna untuk membedakan status pencocokan agar ramah buta warna.

### Don't:
- **Don't** Menggunakan shadow mengambang yang terlalu tebal atau berlebihan yang membuat antarmuka terasa tidak profesional.
- **Don't** Menggunakan teks gradasi atau efek glassmorphic hiasan yang mengganggu konsentrasi membaca NIK.
- **Don't** Menyembunyikan opsi konfigurasi kolom; buat selalu terlihat agar pengguna dapat mengubah nama kolom secara eksplisit sesuai struktur file Excel masing-masing.
