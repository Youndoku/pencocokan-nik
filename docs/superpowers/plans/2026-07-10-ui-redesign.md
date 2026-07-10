# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melakukan redesain antarmuka pengguna (UI) aplikasi pencocokan data NIK Diskominfo Kota Batu dengan pendekatan "Centered Focus Card" yang premium dan profesional.

**Architecture:** Memodifikasi komponen-komponen React agar menggunakan Tailwind CSS v4 dengan tata letak yang bersih, terstruktur, kontras tinggi, dan memiliki state interaktif yang halus.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React, XLSX.

## Global Constraints

- **Tanpa Backend**: Seluruh proses tetap 100% lokal di browser client-side.
- **NIK sebagai Kunci**: Kunci pencocokan utama tetap NIK, bukan Nama.
- **Fleksibilitas Kolom & Status**: Konfigurasi nama kolom dan filter status tidak boleh di-hardcode.
- **Kebijakan Bahasa**: Seluruh teks antarmuka dan penjelas tetap menggunakan Bahasa Indonesia.

---

### Task 1: Shell Utama & Step Indicator

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/StepDot.jsx`

**Interfaces:**
- Mengatur tata letak halaman global (`bg-slate-50` dengan kilau indigo) dan mendesain ulang komponen `StepDot` agar memiliki garis penghubung linier yang menyambung secara visual.

- [ ] **Step 1: Modifikasi `src/components/StepDot.jsx`**
  Ubah styling indikator agar menggunakan garis alur yang bersih dan transisi warna yang mulus.
  ```jsx
  import { CheckCircle2 } from "lucide-react";

  export default function StepDot({ active, done, index, label }) {
    return (
      <div className="flex items-center gap-3 flex-1 relative">
        <div
          className={
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border shrink-0 transition-all duration-300 z-10 " +
            (done
              ? "bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm"
              : active
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-4 ring-indigo-50"
              : "bg-white text-slate-400 border-slate-200")
          }
        >
          {done ? <CheckCircle2 size={16} /> : index}
        </div>
        <span
          className={
            "text-sm transition-colors duration-300 " +
            (active || done ? "text-slate-900 font-semibold" : "text-slate-400 font-medium")
          }
        >
          {label}
        </span>
        {index < 3 && (
          <div
            className={
              "hidden sm:block absolute left-8 right-[-12px] top-4 h-[2px] -translate-y-1/2 z-0 " +
              (done ? "bg-emerald-200" : "bg-slate-100")
            }
          />
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Modifikasi Shell Utama di `src/App.jsx`**
  Sesuaikan bagian atas halaman, card wrapper utama, dan footer privasi.
  ```jsx
  // Bagian return di src/App.jsx diperbarui menjadi:
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-12 sm:py-16 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-indigo-100/40 to-transparent blur-3xl pointer-events-none z-0" />
      
      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold m-0 mb-2 text-slate-900 tracking-tight">
            Pencocokan Data NIK
          </h1>
          <p className="text-sm text-slate-500 m-0 max-w-sm mx-auto leading-relaxed">
            Periksa kecocokan data warga dinas dengan data pembanding secara cepat, aman, dan 100% lokal.
          </p>
        </div>

        {/* Indikator langkah */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm">
          <StepDot index={1} label="Unggah Data" active={step === 1} done={step > 1} />
          <StepDot index={2} label="Konfigurasi" active={step === 2} done={step > 2} />
          <StepDot index={3} label="Hasil Proses" active={step === 3} done={false} />
        </div>

        {/* Pesan error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in shadow-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Konten langkah wrapper */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          {step === 1 && (
            <UploadStep
              gabungan={gabungan}
              pembanding={pembanding}
              gabunganRaw={gabunganRaw}
              pembandingRaw={pembandingRaw}
              barisHeaderGabungan={barisHeaderGabungan}
              barisHeaderPembanding={barisHeaderPembanding}
              bothUploaded={bothUploaded}
              loadingGabungan={loadingGabungan}
              loadingPembanding={loadingPembanding}
              onGabunganFile={handleGabunganFile}
              onPembandingFile={handlePembandingFile}
              onBarisHeaderGabungan={ubahBarisHeaderGabungan}
              onBarisHeaderPembanding={ubahBarisHeaderPembanding}
              onNext={goToConfigure}
            />
          )}

          {step === 2 && bothUploaded && (
            <ConfigureStep
              gabungan={gabungan}
              pembanding={pembanding}
              kolomNikGabungan={kolomNikGabungan}
              kolomNamaGabungan={kolomNamaGabungan}
              kolomNikPembanding={kolomNikPembanding}
              kolomNamaPembanding={kolomNamaPembanding}
              kolomStatusPembanding={kolomStatusPembanding}
              statusTerpilih={statusTerpilih}
              namaKolomBaru={namaKolomBaru}
              daftarStatusUnik={daftarStatusUnik}
              onKolomNikGabungan={setKolomNikGabungan}
              onKolomNamaGabungan={setKolomNamaGabungan}
              onKolomNikPembanding={setKolomNikPembanding}
              onKolomNamaPembanding={setKolomNamaPembanding}
              onKolomStatus={ubahKolomStatus}
              onToggleStatus={toggleStatus}
              onNamaKolomBaru={setNamaKolomBaru}
              onBack={() => setStep(1)}
              onProses={prosesData}
            />
          )}

          {step === 3 && hasil && (
            <ResultsStep
              hasil={hasil}
              onReset={reset}
              onDownload={handleDownload}
            />
          )}
        </div>

        {/* Footer privasi */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400 font-medium">
            🔒 Semua data diproses 100% lokal di browser Anda — tidak ada data yang dikirim ke server.
          </p>
        </div>
      </div>
    </div>
  );
  ```

- [ ] **Step 3: Jalankan pemeriksaan kompilasi dan linter**
  Run: `npm run lint` & `npm run build`
  Expected: Tidak ada error.

- [ ] **Step 4: Commit**
  ```bash
  git add src/App.jsx src/components/StepDot.jsx
  git commit -m "feat(ui): update app shell layout and progress step dot indicators"
  ```

---

### Task 2: Upload Step & Components

**Files:**
- Modify: `src/components/UploadStep.jsx`
- Modify: `src/components/UploadSlot.jsx`
- Modify: `src/components/DataPreview.jsx`

**Interfaces:**
- Meningkatkan tampilan slot upload interaktif agar memiliki indikasi status visual yang dinamis.
- Mengatur data preview agar menyerupai data sheet editor profesional.

- [ ] **Step 1: Modifikasi `src/components/UploadSlot.jsx`**
  ```jsx
  import { UploadCloud, FileSpreadsheet, ChevronRight, Loader2 } from "lucide-react";

  export default function UploadSlot({ title, subtitle, file, onFile, loading }) {
    const inputId = `upload-${title.replace(/\s+/g, "-")}`;
    return (
      <div
        className={
          "rounded-xl border p-5 bg-white transition-all duration-300 shadow-sm " +
          (loading
            ? "border-indigo-300 bg-indigo-50/10 ring-4 ring-indigo-50"
            : file
            ? "border-emerald-300 bg-emerald-50/10 shadow-emerald-50/20"
            : "border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-slate-100")
        }
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 " +
              (loading
                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                : file
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-slate-50 text-slate-400 border-slate-100")
            }
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : file ? (
              <FileSpreadsheet size={20} />
            ) : (
              <UploadCloud size={20} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold m-0 text-slate-800">{title}</p>
            <p className="text-xs text-slate-500 m-0">{subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-2 rounded-lg">
            <Loader2 size={12} className="animate-spin shrink-0" />
            <span>Membaca berkas Excel...</span>
          </div>
        ) : file ? (
          <div className="flex items-center justify-between gap-3 bg-emerald-50/30 border border-emerald-100 rounded-lg p-2.5">
            <span className="text-xs font-mono text-emerald-800 truncate font-medium">
              {file.fileName}
            </span>
            <span className="text-xs text-emerald-600 font-semibold shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full">
              {file.rows.length.toLocaleString("id-ID")} baris
            </span>
          </div>
        ) : (
          <label htmlFor={inputId} className="block cursor-pointer">
            <input
              id={inputId}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
            <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 shadow-sm shadow-indigo-50 hover:shadow-md hover:bg-indigo-100/50">
              Pilih file .xlsx <ChevronRight size={12} />
            </span>
          </label>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Modifikasi `src/components/DataPreview.jsx`**
  ```jsx
  import { TableProperties } from "lucide-react";

  export default function DataPreview({
    rawRows,
    barisHeader,
    onBarisHeader,
    label,
  }) {
    if (!rawRows || rawRows.length === 0) return null;

    const previewRows = rawRows.slice(0, 10);
    const maxKolom = Math.max(...previewRows.map((r) => r?.length || 0));

    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-fade-in shadow-sm my-3">
        {/* Header panel */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-700 m-0 flex items-center gap-2">
            <TableProperties size={14} className="text-indigo-500" />
            <span className="font-semibold text-slate-800">Pratinjau {label}</span>
            <span className="text-slate-400 hidden sm:inline">
              — klik baris yang merupakan header kolom
            </span>
          </p>
          <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Baris Header: {barisHeader + 1}
          </span>
        </div>

        {/* Tabel preview */}
        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-xs border-collapse">
            <tbody>
              {previewRows.map((row, i) => {
                const isHeader = i === barisHeader;
                const isAboveHeader = i < barisHeader;
                return (
                  <tr
                    key={i}
                    onClick={() => onBarisHeader(i)}
                    className={
                      "cursor-pointer border-b border-slate-100 last:border-0 transition-all duration-200 " +
                      (isHeader
                        ? "bg-indigo-50 text-indigo-900 font-semibold border-y border-indigo-200 hover:bg-indigo-100/50"
                        : isAboveHeader
                        ? "bg-slate-50/70 text-slate-400 hover:bg-slate-100/50"
                        : "hover:bg-slate-50/80 text-slate-700")
                    }
                    title={
                      isHeader
                        ? "Baris ini terpilih sebagai header"
                        : "Klik untuk memilih baris ini sebagai header"
                    }
                  >
                    {/* Nomor baris */}
                    <td className="px-3 py-2 text-slate-400 font-mono border-r border-slate-100 text-center w-10 select-none bg-slate-50/50 font-bold">
                      {i + 1}
                    </td>
                    {/* Cell data */}
                    {Array.from({ length: maxKolom }, (_, j) => (
                      <td
                        key={j}
                        className="px-3 py-2 truncate max-w-[160px] whitespace-nowrap"
                      >
                        {String(row?.[j] ?? "").trim() || ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {rawRows.length > 10 && (
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium m-0">
              Menampilkan 10 dari {rawRows.length.toLocaleString("id-ID")} baris data.
            </p>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 3: Modifikasi `src/components/UploadStep.jsx`**
  ```jsx
  import UploadSlot from "./UploadSlot.jsx";
  import DataPreview from "./DataPreview.jsx";
  import { ChevronRight } from "lucide-react";

  export default function UploadStep({
    gabungan,
    pembanding,
    gabunganRaw,
    pembandingRaw,
    barisHeaderGabungan,
    barisHeaderPembanding,
    bothUploaded,
    loadingGabungan,
    loadingPembanding,
    onGabunganFile,
    onPembandingFile,
    onBarisHeaderGabungan,
    onBarisHeaderPembanding,
    onNext,
  }) {
    return (
      <div className="animate-fade-in">
        <div className="grid gap-4 mb-6">
          {/* Data gabungan */}
          <div>
            <UploadSlot
              title="Data Gabungan OPD"
              subtitle="Data warga (Wajib memiliki kolom NIK)"
              file={gabungan}
              onFile={onGabunganFile}
              loading={loadingGabungan}
            />
            {gabunganRaw && !loadingGabungan && (
              <DataPreview
                rawRows={gabunganRaw.rawRows}
                barisHeader={barisHeaderGabungan}
                onBarisHeader={onBarisHeaderGabungan}
                label="data gabungan"
              />
            )}
          </div>

          {/* Data pembanding */}
          <div>
            <UploadSlot
              title="Data Pembanding"
              subtitle="Berkas dinas luar (misal: data pencari kerja)"
              file={pembanding}
              onFile={onFile => onPembandingFile(onFile)}
              loading={loadingPembanding}
            />
            {pembandingRaw && !loadingPembanding && (
              <DataPreview
                rawRows={pembandingRaw.rawRows}
                barisHeader={barisHeaderPembanding}
                onBarisHeader={onBarisHeaderPembanding}
                label="data pembanding"
              />
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!bothUploaded}
          className={
            "w-full h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all duration-300 cursor-pointer " +
            (bothUploaded
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed")
          }
        >
          Lanjut ke Konfigurasi <ChevronRight size={16} />
        </button>
      </div>
    );
  }
  ```

- [ ] **Step 4: Jalankan pemeriksaan kompilasi dan linter**
  Run: `npm run lint` & `npm run build`
  Expected: Sukses.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/UploadStep.jsx src/components/UploadSlot.jsx src/components/DataPreview.jsx
  git commit -m "feat(ui): redesign upload slots and spreadsheet raw data preview tables"
  ```

---

### Task 3: Configure Step & Components

**Files:**
- Modify: `src/components/ConfigureStep.jsx`
- Modify: `src/components/ColumnSelect.jsx`

**Interfaces:**
- Mendesain ulang panel penyeleksi kolom (dropdown) dan status checkbox checklist menjadi lebih premium.

- [ ] **Step 1: Modifikasi `src/components/ColumnSelect.jsx`**
  ```jsx
  export default function ColumnSelect({ columns, label, onChange, value, optional = false }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span>{label}</span>
          {optional && <span className="text-[10px] text-slate-400 font-normal bg-slate-100 px-1.5 py-0.5 rounded">Opsional</span>}
        </label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-sm"
        >
          <option value="">-- Pilih Kolom --</option>
          {columns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    );
  }
  ```

- [ ] **Step 2: Modifikasi `src/components/ConfigureStep.jsx`**
  ```jsx
  import ColumnSelect from "./ColumnSelect.jsx";
  import { Settings2 } from "lucide-react";

  export default function ConfigureStep({
    gabungan,
    pembanding,
    kolomNikGabungan,
    kolomNamaGabungan,
    kolomNikPembanding,
    kolomNamaPembanding,
    kolomStatusPembanding,
    statusTerpilih,
    namaKolomBaru,
    daftarStatusUnik,
    onKolomNikGabungan,
    onKolomNamaGabungan,
    onKolomNikPembanding,
    onKolomNamaPembanding,
    onKolomStatus,
    onToggleStatus,
    onNamaKolomBaru,
    onBack,
    onProses,
  }) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <p className="text-sm font-semibold m-0 mb-4 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <Settings2 size={16} className="text-indigo-500" /> Pemetaan Kolom Excel
          </p>

          {/* Kolom NIK & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <ColumnSelect
              label={`NIK — ${gabungan.fileName}`}
              value={kolomNikGabungan}
              onChange={onKolomNikGabungan}
              columns={gabungan.columns}
            />
            <ColumnSelect
              label={`NIK — ${pembanding.fileName}`}
              value={kolomNikPembanding}
              onChange={onKolomNikPembanding}
              columns={pembanding.columns}
            />
            <ColumnSelect
              label={`Nama — ${gabungan.fileName}`}
              value={kolomNamaGabungan}
              onChange={onKolomNamaGabungan}
              columns={gabungan.columns}
              optional
            />
            <ColumnSelect
              label={`Nama — ${pembanding.fileName}`}
              value={kolomNamaPembanding}
              onChange={onKolomNamaPembanding}
              columns={pembanding.columns}
              optional
            />
          </div>

          {/* Kolom Status */}
          <div className="border-t border-slate-100 pt-4 mb-4">
            <ColumnSelect
              label="Kolom Status/Keterangan Pembanding"
              value={kolomStatusPembanding}
              onChange={onKolomStatus}
              columns={pembanding.columns}
              optional
            />
          </div>

          {/* Checklist Nilai Status */}
          {kolomStatusPembanding && (
            <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-4 animate-fade-in">
              <p className="text-xs text-slate-500 m-0 mb-3 font-semibold">
                Centang status yang dianggap VALID / DIHITUNG COCOK:
              </p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                {daftarStatusUnik.map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={statusTerpilih.has(val)}
                      onChange={() => onToggleStatus(val)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                    />
                    <span className="font-medium">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Nama Kolom Baru */}
          <div className="border-t border-slate-100 pt-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Nama Kolom Baru di Hasil Excel
            </label>
            <input
              type="text"
              value={namaKolomBaru}
              onChange={(e) => onNamaKolomBaru(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white text-slate-800 transition-all duration-200 shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Tombol aksi */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="h-11 px-5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer font-semibold shadow-sm"
          >
            Kembali
          </button>
          <button
            onClick={onProses}
            className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            Mulai Pencocokan Data
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Jalankan pemeriksaan kompilasi dan linter**
  Run: `npm run lint` & `npm run build`
  Expected: Sukses.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/ConfigureStep.jsx src/components/ColumnSelect.jsx
  git commit -m "feat(ui): redesign configuration mapping layout and status checklists"
  ```

---

### Task 4: Results Step & Component

**Files:**
- Modify: `src/components/ResultsStep.jsx`
- Modify: `src/components/MetricCard.jsx`

**Interfaces:**
- Mendesain kartu metrik statistik hasil agar lebih kontras dan indah.
- Menampilkan tabel mismatch nama dengan spasing tipis yang sangat konsisten.

- [ ] **Step 1: Modifikasi `src/components/MetricCard.jsx`**
  ```jsx
  export default function MetricCard({ label, value, tone = "neutral" }) {
    const toneClasses = {
      neutral: "bg-slate-50 text-slate-800 border-slate-200/80 shadow-slate-100/50",
      success: "bg-emerald-50/50 text-emerald-800 border-emerald-200/80 shadow-emerald-100/30",
      danger: "bg-red-50/50 text-red-800 border-red-200/80 shadow-red-100/30",
      warning: "bg-amber-50/50 text-amber-800 border-amber-200/80 shadow-amber-100/30",
    };
    return (
      <div
        className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md shadow-sm ${toneClasses[tone]}`}
      >
        <p className="text-[11px] font-semibold opacity-75 m-0 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold mt-2 font-mono m-0 tracking-tight">{value}</p>
      </div>
    );
  }
  ```

- [ ] **Step 2: Modifikasi `src/components/ResultsStep.jsx`**
  ```jsx
  import MetricCard from "./MetricCard.jsx";
  import { AlertTriangle, RotateCcw, Download, CheckCircle2 } from "lucide-react";

  export default function ResultsStep({ hasil, onReset, onDownload }) {
    return (
      <div className="animate-fade-in">
        {/* Banner Success */}
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-3.5 text-sm mb-6 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">Proses pencocokan selesai 100% lokal!</span>
        </div>

        {/* Kartu metrik */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          <MetricCard label="Total Baris" value={hasil.total.toLocaleString("id-ID")} tone="neutral" />
          <MetricCard label="Data Cocok" value={hasil.cocok.toLocaleString("id-ID")} tone="success" />
          <MetricCard label="Tidak Cocok" value={hasil.tidak.toLocaleString("id-ID")} tone="danger" />
          {hasil.useStatus && (
            <MetricCard
              label="Dikecualikan"
              value={hasil.dikecualikanStatus.toLocaleString("id-ID")}
              tone="warning"
            />
          )}
        </div>

        {/* Peringatan mismatch nama */}
        {hasil.mismatch.length > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl px-4 py-3 text-xs mb-4 shadow-sm">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <span className="font-medium">
              Terdapat <strong>{hasil.mismatch.length} NIK</strong> yang memiliki nama berbeda antar file. 
              Detail selengkapnya tercatat di sheet &ldquo;Validasi Nama&rdquo; pada file hasil unduhan.
            </span>
          </div>
        )}

        {/* Tabel preview mismatch */}
        {hasil.mismatch.length > 0 && (
          <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold">
                  {Object.keys(hasil.mismatch[0]).map((k) => (
                    <th
                      key={k}
                      className="text-left px-3 py-2.5 text-slate-500 font-semibold select-none"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hasil.mismatch.slice(0, 8).map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors text-slate-700"
                  >
                    {Object.values(row).map((v, j) => (
                      <td
                        key={j}
                        className={`px-3 py-2.5 ${j === 0 ? "font-mono font-medium text-slate-800" : ""}`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {hasil.mismatch.length > 8 && (
              <div className="text-xs text-slate-500 px-3 py-2.5 bg-slate-50/50 border-t border-slate-100 font-medium">
                +{ (hasil.mismatch.length - 8).toLocaleString("id-ID") } baris nama berbeda lainnya tersedia di berkas unduhan.
              </div>
            )}
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer font-semibold shadow-sm"
          >
            <RotateCcw size={14} /> Mulai Lagi
          </button>
          <button
            onClick={onDownload}
            className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <Download size={16} /> Unduh Hasil (.xlsx)
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Jalankan pemeriksaan kompilasi dan linter**
  Run: `npm run lint` & `npm run build`
  Expected: Sukses.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/ResultsStep.jsx src/components/MetricCard.jsx
  git commit -m "feat(ui): update results step stats layout and mismatch data tables"
  ```
