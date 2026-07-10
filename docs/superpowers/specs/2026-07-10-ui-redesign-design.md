# Design Spec: UI Redesign (Pencocokan NIK)
Tanggal: 2026-07-10

Spesifikasi desain formal ini menjelaskan refactoring antarmuka pengguna (UI) dari aplikasi pencocokan data NIK Diskominfo Kota Batu sesuai dengan prinsip "Impeccable" dan register "product".

## 1. Konteks Strategis & Tujuan
- **Tipe Register**: Product (desain mengutamakan efisiensi alur kerja dan visualisasi data).
- **Target Pengguna**: Staf Diskominfo Kota Batu dan OPD terkait.
- **Tujuan Redesain**: 
  - Meningkatkan estetika visual menjadi lebih premium dan profesional tanpa menambahkan overhead kompleksitas.
  - Membantu pemahaman alur kerja pengunggahan dan pemetaan kolom dengan indikasi visual yang jelas (step indicators, status borders).
  - Menjaga kepatuhan penuh terhadap aturan non-negosiabel: 100% client-side, tanpa database, aman, dan fleksibel.

## 2. Struktur Komponen & Tata Letak
Aplikasi akan ditata ulang menggunakan layout **Centered Focus Card** (Pendekatan 1).

### A. Shell & Navigasi Langkah (`App.jsx` & `StepDot.jsx`)
- Latar belakang halaman disesuaikan menggunakan `bg-slate-50` yang dipadukan dengan aksen gradasi tipis di bagian atas.
- Container utama berupa kartu terpusat (`max-w-xl`) dengan gaya modern: `bg-white`, border `border-slate-100`, shadow tipis `shadow-sm`, dan sudut membulat `rounded-2xl` (16px).
- `StepDot` diatur agar memiliki garis alur linier yang mulus yang menghubungkan langkah 1, 2, dan 3. Selesainya suatu langkah ditunjukkan dengan ikon centang berwarna hijau (`text-emerald-600` / `bg-emerald-50`).

### B. Langkah 1: Upload & Preview (`UploadStep.jsx`, `UploadSlot.jsx`, `DataPreview.jsx`)
- **Upload Slot**: Card interaktif dengan transition hover dan active states. Border dibuat putus-putus (`border-dashed`) jika belum diupload, dan berubah menjadi warna status (hijau jika sukses, indigo jika memuat).
- **Data Preview**: Grid tabel mini dengan gaya *sheet editor* bersih. Baris header yang dipilih pengguna diberi sorotan warna indigo semi-transparan (`bg-indigo-50` / `text-indigo-900`) dan font tebal.

### C. Langkah 2: Konfigurasi (`ConfigureStep.jsx`, `ColumnSelect.jsx`)
- Pemetaan kolom diletakkan dalam grid dua kolom yang terbagi bersih.
- Checklist status unik dikemas di dalam box bertema abu-abu muda (`bg-slate-50`), dibatasi border tipis, dengan checkbox Tailwind UI modern (`rounded text-indigo-600 focus:ring-indigo-500`).
- Input nama kolom baru menggunakan focus ring bernuansa indigo yang rapi.

### D. Langkah 3: Hasil & Download (`ResultsStep.jsx`, `MetricCard.jsx`)
- **Metric Card**: Kotak statistik dengan angka besar monospace (`font-mono text-2xl`). Menggunakan warna latar belakang aksen status yang tipis (Success: emerald, Danger: red, Warning: amber, Neutral: slate).
- **Tabel Mismatch**: Preview nama yang berbeda dibatasi maksimal 8 baris dengan gaya border dan spasing tipis yang sangat konsisten.

## 3. Spesifikasi Visual & Gaya (Design Tokens)
- **Warna Utama**: Indigo (`#4f46e5` / `text-indigo-600`, `bg-indigo-600`).
- **Warna Latar**: Slate Wash (`#f8fafc`).
- **Sudut Lengkung**: `rounded-2xl` (16px) untuk kartu utama, `rounded-xl` (12px) untuk slot upload dan tabel preview, `rounded-md` (6px) untuk kontrol input/dropdown.
- **Transisi**: Animasi transisi 200-300ms pada state hover, active, dan perubahan alur (menggunakan `@utility animate-fade-in` global).

## 4. Rencana Pengujian & Verifikasi
Setelah implementasi selesai, verifikasi akan dilakukan terhadap:
1. Keselarasan tata letak di berbagai ukuran viewport (responsive check).
2. Kepuasan kontras warna teks terhadap latar belakang (WCAG AA compliant).
3. Transisi state upload (kosong, membaca data, terunggah).
4. Verifikasi bahwa tidak ada logika fungsional yang rusak atau hilang dari hooks asli (`usePencocokanNIK.js`).
