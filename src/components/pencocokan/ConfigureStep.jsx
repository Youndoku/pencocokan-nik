import { AlertCircle, Check, ChevronRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import { namaKolomBentrok } from "../../hooks/usePencocokanNIK.js";
import { ringkasDaftar } from "../../utils/autoDetectColumns.js";

const TIDAK_DIPAKAI = { value: "", label: "Tidak dipakai" };

/**
 * Langkah 2: kolom NIK/nama, status penerima (opsional), dan nama kolom program baru.
 */
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
  const kosong = !namaKolomBaru.trim();
  const bentrok = namaKolomBentrok(gabungan.columns, namaKolomBaru);
  const programAda = gabungan.kolomProgram || [];

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-3">
        <Card
          className="flex-[1_1_420px]"
          title="Kolom yang dicocokkan"
          subtitle="Kolom NIK wajib. Kolom nama dipakai untuk menemukan perbedaan nama."
        >
          <div className="grid grid-cols-[minmax(90px,120px)_1fr_1fr] items-center gap-x-3 gap-y-2">
            <span />
            <span className="caption text-ink-muted">Data gabungan</span>
            <span className="caption text-ink-muted">Data pembanding</span>
            <span className="caption-strong font-semibold">NIK</span>
            <Select size="md" label="Kolom NIK data gabungan" value={kolomNikGabungan} onChange={onKolomNikGabungan} options={gabungan.columns} />
            <Select size="md" label="Kolom NIK data pembanding" value={kolomNikPembanding} onChange={onKolomNikPembanding} options={pembanding.columns} />
            <span className="caption-strong font-semibold">
              Nama <span className="font-normal text-ink-muted">(opsional)</span>
            </span>
            <Select size="md" label="Kolom nama data gabungan" value={kolomNamaGabungan} onChange={onKolomNamaGabungan} options={[...gabungan.columns, TIDAK_DIPAKAI]} />
            <Select size="md" label="Kolom nama data pembanding" value={kolomNamaPembanding} onChange={onKolomNamaPembanding} options={[...pembanding.columns, TIDAK_DIPAKAI]} />
          </div>
          <div className="flex items-start gap-2 rounded-md bg-lilac-bg p-3">
            <Check size={14} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
            <p className="body m-0">Kolom terisi otomatis dari nama judul kolom. Periksa sebelum lanjut.</p>
          </div>
        </Card>

        <Card
          className="flex-[1_1_360px]"
          title={
            <>
              Status penerima <span className="font-normal text-ink-muted">(opsional)</span>
            </>
          }
          subtitle="Hanya status yang dicentang yang dihitung cocok"
        >
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="caption-strong font-semibold">Kolom status di data pembanding</span>
            <Select size="md" value={kolomStatusPembanding} onChange={onKolomStatus} options={[TIDAK_DIPAKAI, ...pembanding.columns]} />
          </label>
          {kolomStatusPembanding && (
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="caption-strong mb-2.5 p-0 font-semibold">Status yang dihitung</legend>
              {daftarStatusUnik.length === 0 ? (
                <p className="caption m-0 text-ink-muted">Memuat daftar status...</p>
              ) : (
                <div className="flex max-h-60 flex-col gap-2.5 overflow-y-auto">
                  {daftarStatusUnik.map(({ nilai, jumlah }) => (
                    <label key={nilai} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={statusTerpilih.has(nilai)}
                          onChange={() => onToggleStatus(nilai)}
                          className="m-0 size-4 accent-lilac-main"
                        />
                        {nilai}
                      </span>
                      <span className="caption text-ink-muted tabular-nums">{jumlah.toLocaleString("id-ID")} baris</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          )}
        </Card>
      </div>

      <Card title="Nama kolom program baru" subtitle="Ditambahkan ke file hasil. Isinya 1 untuk cocok dan 2 untuk tidak.">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="nama-baru" className="caption-strong font-semibold">
            Nama kolom
          </label>
          <input
            id="nama-baru"
            value={namaKolomBaru}
            onChange={(e) => onNamaKolomBaru(e.target.value)}
            aria-invalid={bentrok}
            aria-describedby="nama-baru-info"
            className={`h-10 min-w-0 rounded-md border bg-surface px-3 text-sm text-lilac-text outline-none ${bentrok ? "border-negative" : "border-line"}`}
          />
          {bentrok ? (
            <span id="nama-baru-info" className="caption flex items-center gap-1.5 text-negative">
              <AlertCircle size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
              Nama ini sudah dipakai di data gabungan. Pakai nama lain supaya kolom lama tidak tertimpa.
            </span>
          ) : (
            !kosong && (
              <span id="nama-baru-info" className="caption flex items-center gap-1.5 text-success">
                <Check size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                Nama belum dipakai di sesi ini
              </span>
            )
          )}
          {programAda.length > 0 && (
            <span className="caption text-ink-muted">
              Sudah dipakai: {ringkasDaftar(programAda)}. Nama yang sama akan ditolak supaya kolom lama tidak tertimpa.
            </span>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line bg-surface p-4">
        <Button variant="secondary" onClick={onBack}>
          Kembali
        </Button>
        <Button iconRight={ChevronRight} disabled={kosong || bentrok || !kolomNikGabungan || !kolomNikPembanding} onClick={onProses}>
          Analisis dan cari anomali
        </Button>
      </div>
    </>
  );
}
