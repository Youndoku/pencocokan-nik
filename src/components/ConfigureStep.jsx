import ColumnSelect from "./ColumnSelect.jsx";
import { Settings2 } from "lucide-react";

/**
 * UI Langkah 2: Pemetaan kolom + filter status + nama kolom baru.
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
  return (
    <div className="animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-3 shadow-sm">
        <p className="text-sm font-semibold m-0 mb-4 flex items-center gap-1.5 text-slate-900">
          <Settings2 size={15} className="text-indigo-500" /> Pemetaan kolom
        </p>

        {/* Kolom NIK & Nama untuk kedua file */}
        <div className="grid grid-cols-2 gap-3 mb-3">
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
        <div className="border-t border-slate-200 pt-3 mb-3">
          <ColumnSelect
            label="Kolom status/keterangan (mis. aktif, mundur)"
            value={kolomStatusPembanding}
            onChange={onKolomStatus}
            columns={pembanding.columns}
            optional
          />
        </div>

        {/* Checklist nilai status */}
        {kolomStatusPembanding && (
          <div className="mb-3 bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 m-0 mb-2 font-medium">
              Centang status yang dihitung sebagai valid/cocok:
            </p>
            <div className="flex flex-col gap-1.5">
              {daftarStatusUnik.map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={statusTerpilih.has(val)}
                    onChange={() => onToggleStatus(val)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Nama kolom baru */}
        <div>
          <label className="text-xs text-slate-500 block mb-1">
            Nama kolom baru di hasil
          </label>
          <input
            type="text"
            value={namaKolomBaru}
            onChange={(e) => onNamaKolomBaru(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="h-11 px-5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
        >
          Kembali
        </button>
        <button
          onClick={onProses}
          className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          Proses pencocokan
        </button>
      </div>
    </div>
  );
}
