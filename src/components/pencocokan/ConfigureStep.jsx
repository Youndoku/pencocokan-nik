import ColumnSelect from "./ColumnSelect.jsx";
import { Settings2, Loader2 } from "lucide-react";

/**
 * UI Langkah 2: Pemetaan kolom + filter status + nama kolom baru.
 * Menampilkan progress bar interaktif saat proses pencocokan berjalan di Web Worker.
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
  loadingMatching,
  progressText,
  progress,
}) {
  if (loadingMatching) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] animate-fade-in text-center">
        <Loader2 size={36} className="text-primary animate-spin mb-4" />
        <h3 className="text-base font-semibold text-slate-800 m-0 mb-2">
          Memproses Pencocokan Data
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed m-0 mb-6">
          {progressText}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full max-w-xs bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-600">
          {progress.percent}%
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
        <p className="text-sm font-semibold m-0 mb-4 flex items-center gap-1.5 text-slate-900">
          <Settings2 size={15} className="text-primary" /> Pemetaan kolom
        </p>

        {/* Kolom NIK & Nama untuk kedua file */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ColumnSelect
            label={`Kolom NIK — ${gabungan.fileName}`}
            value={kolomNikGabungan}
            onChange={onKolomNikGabungan}
            columns={gabungan.columns}
          />
          <ColumnSelect
            label={`Kolom NIK — ${pembanding.fileName}`}
            value={kolomNikPembanding}
            onChange={onKolomNikPembanding}
            columns={pembanding.columns}
          />
          <ColumnSelect
            label={`Kolom nama — ${gabungan.fileName}`}
            value={kolomNamaGabungan}
            onChange={onKolomNamaGabungan}
            columns={gabungan.columns}
            optional
          />
          <ColumnSelect
            label={`Kolom nama — ${pembanding.fileName}`}
            value={kolomNamaPembanding}
            onChange={onKolomNamaPembanding}
            columns={pembanding.columns}
            optional
          />
        </div>

        {/* Kolom status (opsional) */}
        <div className="border-t border-slate-100 pt-4 mb-4">
          <ColumnSelect
            label="Kolom status/keterangan pembanding"
            value={kolomStatusPembanding}
            onChange={onKolomStatus}
            columns={pembanding.columns}
            optional
          />
        </div>

        {/* Checklist nilai status */}
        {kolomStatusPembanding && (
          <div className="mb-4 bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 m-0 mb-2 font-medium">
              Centang status yang dihitung sebagai valid/cocok:
            </p>
            {daftarStatusUnik.length > 0 ? (
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {daftarStatusUnik.map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={statusTerpilih.has(val)}
                      onChange={() => onToggleStatus(val)}
                      className="rounded border-slate-300 text-primary focus:ring-primary-light"
                    />
                    {val}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 m-0 italic">Sedang memuat daftar status...</p>
            )}
          </div>
        )}

        {/* Nama kolom baru */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs text-slate-500 font-medium block mb-1">
            Nama kolom baru di hasil
          </label>
          <input
            type="text"
            value={namaKolomBaru}
            onChange={(e) => onNamaKolomBaru(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="h-11 px-5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer font-medium"
        >
          Kembali
        </button>
        <button
          onClick={onProses}
          className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark hover:shadow-lg hover:shadow-primary-light transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          Analisis & Cari Anomali
        </button>
      </div>
    </div>
  );
}
