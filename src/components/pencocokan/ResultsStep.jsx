import { Link } from "react-router-dom";
import { Check, ChevronRight, Plus } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SegmentedBar, { Legend } from "../ui/SegmentedBar.jsx";
import { XlsxIcon } from "./FileSlot.jsx";

const angka = (n) => (n ?? 0).toLocaleString("id-ID");

function hitungKeputusan(items, res, bawaan) {
  const valid = items.filter((it) => (res[it.id] || bawaan) === "valid").length;
  return [valid, items.length - valid];
}

/**
 * Langkah 4: sesi sudah tersimpan. Ringkasan hasil, keputusan anomali,
 * unduh file, dan jalan pintas ke program berikutnya.
 */
export default function ResultsStep({
  hasil,
  namaKolomBaru,
  nomorSesi,
  sesiId,
  kolomProgram,
  anomalies,
  nameMismatchResolutions,
  invalidNikResolutions,
  onDownload,
  onPadankanLain,
}) {
  const statusTidakDihitung = hasil.dikecualikanStatus || 0;
  const tidakCocok = hasil.tidak - statusTidakDihitung;
  const kategori = [
    { label: "Cocok", color: "var(--color-lilac-main)", value: hasil.cocok },
    hasil.useStatus && { label: "Status tidak dihitung", color: "var(--color-lilac-second)", value: statusTidakDihitung },
    { label: "Tidak cocok", color: "var(--color-surface-muted)", value: tidakCocok },
  ].filter(Boolean);

  const { nameMismatches = [], invalidNiks = [], duplicateNiks = [] } = anomalies;
  const [namaValid, namaAbaikan] = hitungKeputusan(nameMismatches, nameMismatchResolutions, "abaikan");
  const [nikValid, nikAbaikan] = hitungKeputusan(invalidNiks, invalidNikResolutions, "valid");
  const keputusan = [
    nameMismatches.length > 0 && ["Perbedaan nama", `${angka(namaValid)} divalidkan, ${angka(namaAbaikan)} diabaikan`],
    invalidNiks.length > 0 && ["Format NIK tidak standar", `${angka(nikValid)} dicocokkan, ${angka(nikAbaikan)} diabaikan`],
    duplicateNiks.length > 0 && ["NIK duplikat", `${angka(duplicateNiks.length)} NIK, baris pertama dipakai`],
  ].filter(Boolean);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <Check size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <div role="status">
            <p className="body-strong m-0">
              Sesi {nomorSesi}: {namaKolomBaru} tersimpan
            </p>
            <p className="body m-0 text-ink-muted">File hasil sekarang berisi {kolomProgram.length} program.</p>
          </div>
        </div>
        <Button as={Link} to={sesiId ? `/dashboard/${sesiId}` : "/"} iconRight={ChevronRight}>
          Lihat dashboard
        </Button>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <Card
          className="flex-[999_1_560px]"
          title="Hasil pemadanan"
          subtitle={`Hasil pencocokan NIK dengan data pembanding ${namaKolomBaru}`}
        >
          <div className="flex flex-wrap items-end gap-6">
            <div className="min-w-0 flex-[1_1_240px]">
              <div className="amount-xl tabular-nums">{angka(hasil.cocok)}</div>
              <p className="body m-0 text-ink-muted">NIK cocok dari {angka(hasil.total)} baris data gabungan</p>
            </div>
            <Legend className="min-w-0 flex-[1_1_300px]" items={kategori.map((k) => ({ ...k, value: angka(k.value) }))} />
          </div>
          <SegmentedBar
            segments={kategori}
            label={`${angka(hasil.total)} baris: ${kategori.map((k) => `${angka(k.value)} ${k.label.toLowerCase()}`).join(", ")}`}
          />
        </Card>

        <Card className="flex-[1_1_320px]" title="Keputusan anomali" subtitle="Bisa dilihat lagi di dashboard sesi ini">
          {keputusan.length === 0 ? (
            <p className="body m-0 text-ink-muted">Tidak ada anomali di sesi ini.</p>
          ) : (
            <div className="flex flex-col">
              {keputusan.map(([jenis, isi]) => (
                <div key={jenis} className="flex justify-between gap-3 border-b border-line py-3">
                  <span className="body">{jenis}</span>
                  <span className="body text-right text-ink-muted tabular-nums">{isi}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <Card className="flex-[999_1_560px]" title="File hasil" subtitle={`Data gabungan dengan kolom ${namaKolomBaru} yang baru`}>
          <div className="flex flex-wrap items-center gap-3.5 rounded-md border border-line bg-lilac-bg px-4 py-3.5">
            <XlsxIcon />
            <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
              <span className="body-strong truncate">hasil_{namaKolomBaru}.xlsx</span>
              <span className="caption text-ink-muted tabular-nums">
                {angka(hasil.total)} baris, {kolomProgram.length} program ({namaKolomBaru} baru)
                {hasil.totalMismatch > 0 && ", termasuk lembar Validasi Nama"}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={onDownload}>
              Unduh Excel
            </Button>
          </div>
        </Card>

        <Card
          className="flex-[1_1_320px] bg-lilac-soft! shadow-none!"
          title="Program berikutnya"
          subtitle="Lanjutkan tanpa unduh dan unggah ulang"
        >
          <p className="body m-0">
            Sesi {nomorSesi} akan terpilih otomatis sebagai data gabungan. Tinggal unggah data pembanding program
            berikutnya.
          </p>
          <div className="mt-auto">
            <Button variant="secondary" icon={Plus} disabled={!sesiId} onClick={onPadankanLain}>
              Padankan program lain
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
