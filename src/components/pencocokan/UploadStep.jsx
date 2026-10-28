import { ChevronRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import FileSlot from "./FileSlot.jsx";
import { kolomProgramSesi, ringkasDaftar } from "../../utils/autoDetectColumns.js";

function PilihanSumber({ checked, disabled, onChange, judul, keterangan }) {
  return (
    <label
      className={`flex flex-[1_1_260px] items-start gap-3 rounded-md border p-4 ${checked ? "border-lilac-main bg-lilac-soft" : "border-line bg-surface"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="radio"
        name="sumber-gabungan"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-[3px] size-4 shrink-0 accent-lilac-main"
      />
      <span className="flex flex-col gap-0.5">
        <span className="body-strong">{judul}</span>
        <span className="body text-ink-muted">{keterangan}</span>
      </span>
    </label>
  );
}

/**
 * Langkah 1: sumber data gabungan (sesi sebelumnya atau file) + file pembanding.
 */
export default function UploadStep({
  sesiList,
  sumber,
  onSumber,
  gabungan,
  pembanding,
  onPilihSesi,
  barisHeaderGabungan,
  barisHeaderPembanding,
  loadingGabungan,
  loadingPembanding,
  progressText,
  validasi,
  kolomNikGabungan,
  kolomNikPembanding,
  onGabunganFile,
  onPembandingFile,
  onBarisHeaderGabungan,
  onBarisHeaderPembanding,
  onNext,
}) {
  const adaSesi = sesiList.length > 0;
  const sesiTerpilih = sesiList.find((s) => s.id === gabungan?.sesiId);
  const programTerpilih = gabungan?.kolomProgram || [];
  const programTertinggal =
    sesiTerpilih && sesiTerpilih !== sesiList[0]
      ? kolomProgramSesi(sesiList[0]).filter((p) => !programTerpilih.includes(p))
      : [];
  const siap =
    gabungan?.columns?.length > 0 && pembanding?.columns?.length > 0 && !loadingGabungan && !loadingPembanding;

  return (
    <>
      <Card title="Data gabungan" subtitle="Data induk yang akan diberi kolom program baru">
        <div role="radiogroup" aria-label="Sumber data gabungan" className="flex flex-wrap gap-3">
          <PilihanSumber
            checked={sumber === "sesi"}
            disabled={!adaSesi}
            onChange={() => onSumber("sesi")}
            judul="Pakai hasil sesi sebelumnya"
            keterangan={
              adaSesi
                ? "Lanjutkan dari sesi yang sudah ada. Tidak perlu unduh dan unggah ulang."
                : "Belum ada sesi tersimpan"
            }
          />
          <PilihanSumber
            checked={sumber === "file"}
            onChange={() => onSumber("file")}
            judul="Unggah file Excel"
            keterangan="Mulai dari data gabungan baru dalam format .xlsx."
          />
        </div>

        {sumber === "sesi" && adaSesi && (
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="caption-strong font-semibold">Sesi</span>
            <Select
              size="md"
              value={gabungan?.sesiId ?? ""}
              onChange={(id) => onPilihSesi(sesiList.find((s) => s.id === id))}
              options={sesiList.map((s, i) => ({
                value: s.id,
                label: `Sesi ${sesiList.length - i}: ${s.namaKolomBaru}${i === 0 ? " (terbaru)" : ""}`,
              }))}
              aria-describedby="sesi-info"
            />
            {gabungan?.sesiId && (
              <span id="sesi-info" className="caption text-ink-muted tabular-nums">
                {gabungan.totalRows.toLocaleString("id-ID")} baris, berisi {programTerpilih.length} program:{" "}
                {programTerpilih.join(", ")}.
              </span>
            )}
            {programTertinggal.length > 0 && (
              <span className="caption text-negative">
                Sesi ini berisi {programTerpilih.length} program. {ringkasDaftar(programTertinggal)} dari sesi
                terbaru tidak ikut.
              </span>
            )}
          </label>
        )}

        {sumber === "file" && (
          <FileSlot
            label="data gabungan"
            file={gabungan?.sesiId ? null : gabungan}
            loading={loadingGabungan}
            progressText={progressText}
            onFile={onGabunganFile}
            barisHeader={barisHeaderGabungan}
            onBarisHeader={onBarisHeaderGabungan}
            validasi={validasi.gabungan}
            kolomNik={kolomNikGabungan}
          />
        )}
      </Card>

      <Card title="Data pembanding" subtitle="Daftar penerima satu program dari OPD">
        <FileSlot
          label="data pembanding"
          file={pembanding}
          loading={loadingPembanding}
          progressText={progressText}
          onFile={onPembandingFile}
          barisHeader={barisHeaderPembanding}
          onBarisHeader={onBarisHeaderPembanding}
          validasi={validasi.pembanding}
          kolomNik={kolomNikPembanding}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3 rounded-[12px] border border-line bg-surface p-4">
        <Button iconRight={ChevronRight} disabled={!siap} onClick={onNext}>
          Lanjut ke atur kolom
        </Button>
      </div>
    </>
  );
}
