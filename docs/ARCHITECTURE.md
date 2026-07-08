# Architecture

## Struktur folder

```
src/
├── App.jsx                    # Merangkai hook + komponen. TIDAK ada logic bisnis di sini.
├── utils/                     # Logic murni, tanpa React sama sekali, gampang ditest terpisah
│   ├── normalize.js            # normalisasiNIK(), normalisasiNama()
│   ├── excelIO.js               # readExcelFileRaw(), parseWithBarisHeader(), tebakanBarisHeader(),
│   │                            # downloadResultXlsx(), guessColumn()
│   └── matching.js              # cocokkanData(), nilaiStatusUnik() — jantung logic bisnis
├── hooks/
│   └── usePencocokanNIK.js       # Semua state React (upload, konfigurasi, hasil) di 1 tempat
└── components/                 # Murni tampilan, terima data lewat props
    ├── StepDot.jsx               # Indikator langkah 1/2/3
    ├── MetricCard.jsx            # Kartu angka ringkasan (total/cocok/tidak/dikecualikan)
    ├── UploadSlot.jsx            # Slot upload 1 file
    ├── ColumnSelect.jsx          # Dropdown pemilihan kolom
    ├── DataPreview.jsx           # Preview data mentah + pemilihan baris header
    ├── UploadStep.jsx            # UI langkah 1: upload 2 file + preview header
    ├── ConfigureStep.jsx         # UI langkah 2: pemetaan kolom + filter status
    └── ResultsStep.jsx           # UI langkah 3: ringkasan + tabel mismatch + download
```

## Prinsip pemisahan tanggung jawab

1. **`utils/` tidak boleh import React atau tahu apa-apa soal UI.** Semua
   fungsi di sini harus bisa dipanggil dan ditest sebagai fungsi JavaScript
   biasa, terlepas dari komponen apa pun. Kalau menambah logic bisnis baru
   (misal aturan pencocokan tambahan), taruh di sini, bukan di komponen atau
   hook.
2. **`hooks/usePencocokanNIK.js` adalah satu-satunya tempat state React
   didefinisikan.** Komponen di `components/` menerima state via props dan
   memanggil action (`onNext`, `onProses`, dst) — komponen tidak boleh punya
   `useState` sendiri untuk data yang sifatnya lintas-langkah (upload,
   konfigurasi, hasil).
3. **`components/` hanya tahu cara menampilkan data, tidak tahu ATURAN di
   baliknya.** Misal `ResultsStep.jsx` menampilkan angka `hasil.cocok`,
   tapi tidak tahu bagaimana angka itu dihitung — itu ada di
   `utils/matching.js`.

## Alur data (data flow)

```
User upload file
      │
      ▼
utils/excelIO.js → readExcelFile()      (parse .xlsx jadi { rows, columns, fileName })
      │
      ▼
hooks/usePencocokanNIK.js               (simpan ke state: gabungan / pembanding)
      │
      ▼
User atur pemetaan kolom & filter status (lewat ConfigureStep.jsx, ubah state di hook)
      │
      ▼
utils/matching.js → cocokkanData()       (pure function: input data + config → output hasil)
      │
      ▼
hooks/usePencocokanNIK.js               (simpan hasil ke state: hasil)
      │
      ▼
components/ResultsStep.jsx              (tampilkan ringkasan + tabel)
      │
      ▼
utils/excelIO.js → downloadResultXlsx()  (generate .xlsx, trigger download browser)
```

## Kalau menambah fitur baru

- **Aturan pencocokan baru** (misal tambah kondisi lain selain status) →
  ubah `utils/matching.js`, fungsi `cocokkanData()`. Jangan taruh logic
  perhitungan di komponen atau di hook.
- **Field/opsi konfigurasi baru** → tambah state di
  `hooks/usePencocokanNIK.js`, lalu expose ke `ConfigureStep.jsx` via props,
  sama seperti pola `kolomStatusPembanding` + `statusTerpilih` yang sudah ada.
- **Tampilan/komponen baru** → taruh di `components/`, terima data via
  props, jangan fetch/hitung data sendiri di dalam komponen.
