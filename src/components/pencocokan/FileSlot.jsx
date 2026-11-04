import { useRef } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import Button from "../ui/Button.jsx";
import Select from "../ui/Select.jsx";
import { samarkanNIK } from "../../utils/normalize.js";

/** Ikon dokumen bertanda XLSX hijau. */
export function XlsxIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-12 w-10 shrink-0 items-end justify-center rounded-[6px] border border-line bg-surface pb-1.5 before:absolute before:-top-px before:-right-px before:size-3 before:rounded-bl-[4px] before:border-b before:border-l before:border-line before:bg-lilac-bg before:content-['']"
    >
      <span className="rounded-[3px] bg-success px-1 text-[9px] font-bold leading-3 tracking-[.04em] text-white">XLSX</span>
    </span>
  );
}

const angka = (n) => (n ?? 0).toLocaleString("id-ID");

function ukuranFile(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Ringkasan VALIDATE_DATA sebagai satu keterangan di bawah pratinjau. */
function KeteranganValidasi({ validasi, kolomNik }) {
  if (!validasi) return null;
  const masalah = [
    validasi.nikKosong > 0 && `${angka(validasi.nikKosong)} NIK kosong`,
    validasi.nikNonStandar > 0 && `${angka(validasi.nikNonStandar)} NIK tidak standar`,
    validasi.duplikatNik.length > 0 && `${angka(validasi.duplikatNik.length)} NIK muncul lebih dari sekali`,
  ].filter(Boolean);
  if (masalah.length === 0) {
    return (
      <p className="caption m-0 flex items-center gap-1.5 text-success">
        <Check size={14} strokeWidth={2} aria-hidden="true" />
        Kolom {kolomNik}: semua NIK 16 digit dan tidak ada yang ganda.
      </p>
    );
  }
  return (
    <p className="caption m-0 text-ink-muted tabular-nums">
      Kolom {kolomNik}: {masalah.join(", ")}. Rinciannya bisa diperiksa di langkah Periksa anomali.
    </p>
  );
}

/**
 * Satu sumber file Excel: area unggah, lalu kartu file + pratinjau
 * dengan pilihan baris judul kolom.
 */
export default function FileSlot({
  label,
  file,
  loading,
  progressText,
  onFile,
  barisHeader,
  onBarisHeader,
  validasi,
  kolomNik,
}) {
  const inputRef = useRef(null);
  const pilih = () => inputRef.current?.click();

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept=".xlsx,.xls"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
        e.target.value = "";
      }}
    />
  );

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-line bg-lilac-bg px-4 py-3.5" role="status">
        <Loader2 size={18} strokeWidth={1.5} className="shrink-0 animate-spin text-lilac-main" aria-hidden="true" />
        <span className="body">{progressText}</span>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line bg-lilac-bg px-4 py-8 text-center">
        {input}
        <p className="body m-0 text-ink-muted">Pilih file Excel (.xlsx) {label}.</p>
        <Button variant="secondary" icon={Upload} onClick={pilih}>
          Pilih file
        </Button>
      </div>
    );
  }

  const rows = file.previewRows || [];
  const pratinjau = rows.slice(0, barisHeader + 5);
  const maxKolom = Math.max(0, ...pratinjau.map((r) => r?.length || 0));

  return (
    <>
      {input}
      <div className="flex flex-wrap items-center gap-3.5 rounded-md border border-line bg-lilac-bg px-4 py-3.5">
        <XlsxIcon />
        <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
          <span className="body-strong truncate">{file.fileName}</span>
          <span className="caption text-ink-muted tabular-nums">
            {angka(file.totalRows)} baris, {angka(file.columns?.length)} kolom, {ukuranFile(file.fileSize)}
          </span>
        </div>
        <span className="caption-strong inline-flex items-center gap-1.5 font-semibold text-success">
          <Check size={14} strokeWidth={2} aria-hidden="true" />
          Siap dipakai
        </span>
        <Button variant="secondary" size="sm" onClick={pilih}>
          Ganti file
        </Button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="body-strong m-0">Pratinjau</p>
          <p className="caption m-0 text-ink-muted">
            Baris yang disorot dipakai sebagai judul kolom. Ganti kalau tebakannya salah.
          </p>
        </div>
        <label className="flex w-[200px] flex-col gap-1.5">
          <span className="caption-strong font-semibold">Baris judul kolom</span>
          <Select
            size="md"
            value={String(barisHeader)}
            onChange={(v) => onBarisHeader(Number(v))}
            options={rows.slice(0, 20).map((_, i) => ({ value: String(i), label: `Baris ${i + 1}` }))}
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-md border border-line">
        <table aria-label={`Pratinjau ${label}`} className="w-full border-collapse tabular-nums">
          <tbody>
            {pratinjau.map((row, i) => {
              const judul = i === barisHeader;
              return (
                <tr key={i} className={`${i > 0 ? "border-t border-line" : ""} ${judul ? "bg-lilac-soft" : ""}`}>
                  <td className="caption w-11 px-3 py-2 text-ink-muted">{i + 1}</td>
                  {Array.from({ length: maxKolom }, (_, j) => (
                    <td
                      key={j}
                      className={`max-w-[220px] truncate whitespace-nowrap px-3 py-2 ${judul ? "caption-strong" : "body"} ${i < barisHeader ? "text-ink-muted" : ""}`}
                    >
                      {samarkanNIK(row?.[j])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <KeteranganValidasi validasi={validasi} kolomNik={kolomNik} />
    </>
  );
}
