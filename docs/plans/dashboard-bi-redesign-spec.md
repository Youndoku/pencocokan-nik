# Design Spec: Dashboard BI & Redesign Full SPA — Pencocokan Data NIK

**Tanggal**: 2026-08-31  
**Status**: Draft → Menunggu Review  
**Stack**: React 19 + Vite 8 + TailwindCSS v4 + Recharts + SheetJS + IndexedDB (idb) + React Router v7

---

## 1. Konteks & Tujuan

### Latar Belakang
Aplikasi Pencocokan Data NIK adalah alat bantu sementara bagi daerah akibat tidak efektifnya proses pemadanan data antara pusat dan daerah. Tool ini harus:
- **Ringan** — cepat diakses dan diproses
- **100% Offline** — tidak ada data yang keluar dari perangkat
- **Lokal** — data tetap aman di browser pengguna

### Tujuan Pengembangan
1. **Transformasi ke Full SPA** — routing, navigasi, dan struktur yang lebih terorganisir
2. **Dashboard BI** — visualisasi hasil pencocokan yang informatif
3. **Analisis Cross-Program** — auto-deteksi kolom hasil pencocokan sebelumnya untuk identifikasi penerima bantuan ganda
4. **Riwayat Tersimpan** — sesi pencocokan tersimpan di browser (IndexedDB)
5. **Download Excel + PDF** — laporan ringkasan dapat diunduh
6. **Validasi Data Ditingkatkan** — deteksi masalah data sebelum proses

---

## 2. Arsitektur Sistem

### 2.1 Struktur Halaman & Routing

```
/                    → Landing Page
/pencocokan          → Wizard Pencocokan (4-step)
/riwayat             → Daftar Riwayat Pencocokan
/dashboard/:id       → Dashboard BI Detail (per sesi)
```

### 2.2 Tech Stack

| Komponen | Teknologi | Alasan |
|---|---|---|
| Framework | React 19 + Vite 8 | Sudah ada, performant |
| Routing | React Router v7 | SPA routing standar |
| Styling | TailwindCSS v4 | Sudah ada, konsisten |
| Charts | Recharts | React-native, SVG, customizable |
| Excel I/O | SheetJS (xlsx) | Sudah ada, reliable |
| Storage | IndexedDB via `idb` | Data besar, offline, binary |
| PDF | jsPDF + jsPDF-AutoTable | Ringan, client-side PDF generation |
| Icons | Lucide React | Sudah ada |
| Processing | Web Worker | Sudah ada, non-blocking |

### 2.3 Struktur Folder Baru

```
src/
├── main.jsx                    # Entry point + router setup
├── index.css                   # Global styles + Tailwind
├── App.jsx                     # Layout wrapper + navigation
│
├── pages/                      # Route-level components
│   ├── LandingPage.jsx         # / (refactored from components/)
│   ├── PencocokanPage.jsx      # /pencocokan (wizard orchestrator)
│   ├── RiwayatPage.jsx         # /riwayat
│   └── DashboardPage.jsx       # /dashboard/:id
│
├── components/                 # Reusable UI components
│   ├── layout/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   └── PageTransition.jsx  # Animated page transitions
│   │
│   ├── pencocokan/             # Wizard step components
│   │   ├── UploadStep.jsx
│   │   ├── UploadSlot.jsx
│   │   ├── DataPreview.jsx
│   │   ├── ValidationReport.jsx  # NEW: validasi data ditingkatkan
│   │   ├── ConfigureStep.jsx
│   │   ├── ColumnSelect.jsx
│   │   ├── AnomalyStep.jsx
│   │   └── ResultsDashboard.jsx  # NEW: dashboard ringkas inline
│   │
│   ├── dashboard/              # Dashboard BI components
│   │   ├── MetricCards.jsx       # Summary metric cards
│   │   ├── MatchGauge.jsx        # Donut/gauge persentase
│   │   ├── DistributionChart.jsx # Bar chart distribusi keterangan
│   │   ├── CrossProgramMatrix.jsx # NEW: analisis cross-program
│   │   ├── DuplicateRecipients.jsx # NEW: tabel penerima ganda
│   │   ├── DynamicAnalysis.jsx   # NEW: analisis kolom dinamis
│   │   ├── DataTable.jsx         # NEW: tabel data interaktif
│   │   └── ExportPanel.jsx       # NEW: download xlsx + pdf
│   │
│   ├── riwayat/                # History components
│   │   ├── SessionCard.jsx       # Kartu sesi
│   │   └── StorageInfo.jsx       # Info penyimpanan
│   │
│   └── ui/                     # Generic UI primitives
│       ├── StepDot.jsx
│       ├── MetricCard.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       └── Modal.jsx
│
├── hooks/
│   ├── usePencocokanNIK.js     # Refactored matching logic
│   ├── useRiwayat.js           # NEW: IndexedDB CRUD
│   ├── useDashboard.js         # NEW: dashboard data processing
│   └── usePdfExport.js         # NEW: PDF generation
│
├── utils/
│   ├── excelWorker.js          # Enhanced Web Worker
│   ├── normalize.js            # Existing normalization
│   ├── db.js                   # NEW: IndexedDB setup & helpers
│   ├── autoDetectColumns.js    # NEW: auto-detect kolom hasil 1/2
│   ├── crossProgramAnalysis.js # NEW: analisis cross-program
│   ├── dataValidation.js       # NEW: validasi data ditingkatkan
│   └── pdfTemplate.js          # NEW: template PDF laporan
│
└── assets/
    └── logo.svg                # Logo Diskominfo (jika ada)
```

---

## 3. Fitur Detail

### 3.1 Landing Page (Refactored)
- Tetap mempertahankan desain existing yang sudah bagus
- Tombol CTA mengarah ke `/pencocokan`
- Tambah tombol "Lihat Riwayat" jika ada sesi tersimpan
- Badge counter menunjukkan jumlah sesi tersimpan

### 3.2 Wizard Pencocokan (`/pencocokan`)

#### Step 1: Upload (existing + enhanced)
- Fitur upload tetap sama
- **Baru**: Setelah kedua file berhasil di-parse, tampilkan **Validation Report**:
  - Deteksi duplikasi NIK dalam file gabungan
  - Deteksi baris kosong / incomplete
  - Warning jika banyak NIK format non-standar (>10%)
  - Ringkasan kualitas data (jumlah baris valid, baris bermasalah)
  - User bisa lanjut meskipun ada warning (bukan blocker)

#### Step 2: Konfigurasi (existing)
- Tetap sama: pemetaan kolom, filter status, nama kolom baru

#### Step 3: Anomali (existing)
- Tetap sama: review perbedaan nama & NIK tidak standar

#### Step 4: Hasil → Dashboard Ringkas (enhanced)
- **Menggantikan ResultsStep sederhana** dengan dashboard ringkas:
  - Gauge/Donut chart besar: persentase kecocokan
  - 4 Metric cards: Total, Cocok, Tidak Cocok, Dikecualikan
  - Bar chart kecil: distribusi keterangan
  - Tombol aksi:
    - "Unduh Excel (.xlsx)" 
    - "Unduh Laporan PDF"
    - "Lihat Dashboard Lengkap" → navigasi ke `/dashboard/:id`
    - "Pencocokan Baru" → kembali ke step 1
  - Data otomatis tersimpan ke IndexedDB saat step ini tercapai

### 3.3 Halaman Riwayat (`/riwayat`)
- **Daftar kartu sesi** tersimpan, masing-masing menampilkan:
  - Tanggal & waktu pencocokan
  - Nama file gabungan & pembanding
  - Ringkasan cepat: total / cocok / tidak (dengan mini progress bar)
  - Tombol: Lihat Dashboard | Unduh Ulang | Hapus
- **Filter & Sort**: berdasarkan tanggal, nama file, persentase kecocokan
- **Info Penyimpanan**: total ukuran data tersimpan di browser
- **Bulk Actions**: Pilih beberapa sesi → Hapus sekaligus

### 3.4 Dashboard BI Lengkap (`/dashboard/:id`)

#### Panel 1: Ringkasan Utama
- **Header**: Nama file gabungan vs pembanding, tanggal, nama kolom hasil
- **Gauge/Donut besar**: Persentase kecocokan (animasi smooth)
- **4 Metric Cards**: 
  - Total Baris (slate)
  - Cocok (emerald) 
  - Tidak Cocok (red)
  - Dikecualikan Status (amber)

#### Panel 2: Distribusi Keterangan
- **Bar Chart horizontal**: Breakdown per jenis keterangan
  - NIK ditemukan
  - NIK tidak ditemukan
  - Nama disetujui
  - Nama berbeda ditolak
  - Status tidak dihitung
  - NIK tidak valid diabaikan

#### Panel 3: Analisis Cross-Program (auto-detect)

> [!IMPORTANT]
> Muncul HANYA jika file gabungan memiliki kolom-kolom lain yang terdeteksi sebagai kolom hasil pencocokan (mayoritas isi 1/2)

- **Deteksi otomatis**: Scan semua kolom, identifikasi yang isinya >80% bernilai 1 atau 2
- **Matrix/Heatmap**: Tabel silang antar program
  ```
              DTKS    PKH    BPNT    Disnaker
  DTKS         -      1,234   892      456
  PKH        1,234     -      678      321
  ...
  ```
  (angka = jumlah orang yang cocok di KEDUA program)
- **Tabel Penerima Ganda**: NIK yang bernilai `1` di >1 kolom program
  - Kolom: NIK, Nama, [Program A], [Program B], ..., Jumlah Program
  - Sortable & searchable
- **Bar Chart Perbandingan**: Jumlah cocok per program

#### Panel 4: Analisis Kolom Dinamis
- **Dropdown pilih kolom**: User memilih kolom data biasa (bukan kolom hasil)
- **Chart otomatis**:
  - Jika kategori ≤ 10 → Pie chart
  - Jika kategori > 10 → Bar chart horizontal  
  - Jika data numerik → Histogram
- **Cross-tab sederhana**: Pilih kolom X + breakdown by status cocok/tidak
  - Contoh: Distribusi "Desil" breakdown by "Cocok/Tidak di DTKS"

#### Panel 5: Tabel Data Interaktif
- **Full data table** dengan semua kolom hasil
- **Fitur**: Search global, filter per kolom, sort, pagination
- **Quick filters**: Tombol "Cocok saja" | "Tidak Cocok saja" | "Semua"
- **Export**: Download data yang sudah di-filter sebagai Excel

#### Panel 6: Export
- **Download Excel (.xlsx)**: File hasil lengkap (sudah ada)
- **Download PDF**: Laporan ringkasan berisi:
  - Header: Judul, tanggal, nama file
  - Ringkasan statistik
  - Chart utama (gauge + bar chart sebagai gambar)
  - Tabel distribusi keterangan
  - Tabel penerima ganda (jika ada)
  - Footer: "Diproses secara offline menggunakan Tool Pencocokan NIK"

---

## 4. Data Storage (IndexedDB)

### Database: `pencocokan-nik-db`, version 1

### Object Store: `sesi`
```typescript
interface Sesi {
  id: string;                    // UUID auto-generated
  tanggal: Date;                 // timestamp pencocokan
  namaGabungan: string;          // nama file gabungan
  namaPembanding: string;        // nama file pembanding
  namaKolomBaru: string;         // nama kolom hasil yang ditambahkan
  
  konfigurasi: {
    kolomNikGabungan: string;
    kolomNamaGabungan: string;
    kolomNikPembanding: string;
    kolomNamaPembanding: string;
    kolomStatusPembanding: string;
    statusTerpilih: string[];
  };
  
  ringkasan: {
    total: number;
    cocok: number;
    tidak: number;
    dikecualikanStatus: number;
    totalMismatch: number;
    totalInvalidNik: number;
    persentase: number;          // cocok/total * 100
  };
  
  // Data lengkap untuk dashboard
  dataHasil: Array<Record<string, any>>;  // semua baris + kolom hasil
  mismatchLog: Array<{
    nik: string;
    namaGabungan: string;
    namaPembanding: string;
    keputusan: string;
  }>;
  
  // Binary buffer untuk re-download
  excelBuffer: ArrayBuffer;
  
  // Metadata untuk dashboard
  kolomTersedia: string[];       // semua nama kolom
  kolomProgram: string[];        // kolom auto-detected sebagai hasil (1/2)
}
```

### Index
- `by-tanggal`: index pada field `tanggal` untuk sorting
- `by-namaGabungan`: index pada field `namaGabungan` untuk filtering

---

## 5. Auto-Detect Kolom Hasil Pencocokan

### Algoritma
```
Untuk setiap kolom di dataHasil:
  1. Ambil semua nilai non-kosong
  2. Hitung berapa banyak yang bernilai 1 atau 2 (sebagai number atau string)
  3. Jika rasio (jumlah_1_atau_2 / total_non_kosong) > 0.8:
     → Tandai sebagai "kolom program"
  4. Kecualikan kolom yang sedang diproses (namaKolomBaru sesi ini)
     dari deteksi, karena sudah ditampilkan di Panel 1
```

### Penamaan
- Nama kolom langsung digunakan sebagai nama program (misal: `"DTKS"`, `"PKH"`, `"BPNT"`)

---

## 6. Validasi Data Ditingkatkan

### Jenis Validasi (di Step 1, setelah upload)

| Validasi | Tipe | Deskripsi |
|---|---|---|
| Duplikasi NIK | Warning | NIK yang muncul >1 kali di file gabungan |
| Baris Kosong | Info | Baris yang semua kolomnya kosong |
| Data Incomplete | Warning | Baris yang kolom NIK-nya kosong |
| NIK Non-standar | Warning | NIK bukan 16 digit (ringkasan %) |
| Kolom Kosong Total | Info | Kolom yang 100% kosong |

### Tampilan
- Kartu validasi dengan severity icons (✅ Info, ⚠️ Warning)
- Expandable detail: klik untuk lihat baris-baris bermasalah
- Tidak memblokir proses — user tetap bisa lanjut

---

## 7. PDF Report Template

### Struktur Halaman PDF (A4 Portrait)

```
┌─────────────────────────────────┐
│ [Logo]  LAPORAN PENCOCOKAN DATA │
│         NIK — [Instansi]        │
│                                 │
│ Tanggal: ...                    │
│ File Gabungan: ...              │
│ File Pembanding: ...            │
│ Kolom Hasil: ...                │
├─────────────────────────────────┤
│ RINGKASAN STATISTIK             │
│ ┌─────┐┌─────┐┌─────┐┌─────┐  │
│ │Total││Cocok││Tidak││Excl. │  │
│ └─────┘└─────┘└─────┘└─────┘  │
│                                 │
│ [Donut Chart: % Kecocokan]      │
├─────────────────────────────────┤
│ DISTRIBUSI KETERANGAN           │
│ ┌───────────────────────────┐   │
│ │ Tabel keterangan + jumlah │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ ANALISIS CROSS-PROGRAM          │
│ (jika ada kolom program)        │
│ ┌───────────────────────────┐   │
│ │ Tabel penerima ganda      │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ Footer: Diproses offline...     │
│ Halaman 1 dari N                │
└─────────────────────────────────┘
```

---

## 8. Navigasi & Layout

### Navbar (muncul di semua halaman kecuali Landing Page)
```
┌──────────────────────────────────────────────────┐
│ 🛡️ Pencocokan NIK    [Pencocokan Baru] [Riwayat] │
│                              badge: N sesi        │
└──────────────────────────────────────────────────┘
```

- Logo + judul di kiri
- Menu items di kanan
- Badge counter di tombol Riwayat
- Responsive: collapse ke hamburger menu di mobile

---

## 9. Dependensi Baru

```json
{
  "dependencies": {
    "react-router-dom": "^7.x",
    "recharts": "^2.x",
    "idb": "^8.x",
    "jspdf": "^2.x",
    "jspdf-autotable": "^3.x"
  }
}
```

Total tambahan bundle size estimasi: ~200KB gzipped (Recharts ~120KB + jsPDF ~60KB + idb ~3KB + React Router ~15KB)

---

## 10. Prinsip Desain

1. **Offline-first**: Tidak ada network request, semua lokal
2. **Data Privacy**: Data tidak pernah meninggalkan perangkat
3. **Progressive Enhancement**: Dashboard menyesuaikan fitur berdasarkan data yang tersedia (ada kolom program → tampilkan cross-program analysis)
4. **Ringan**: Bundle size minimal, lazy loading untuk halaman berat
5. **Aksesibel**: Label yang jelas, kontras warna cukup
6. **Mobile-friendly**: Responsive layout

---

## 11. Hal yang Tidak Termasuk (Out of Scope)

- Backend/server — tetap 100% client-side
- Autentikasi/login — tidak diperlukan
- Multi-user collaboration — tool personal
- Real-time data sync — offline tool
- Export format selain xlsx dan pdf
