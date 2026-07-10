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
      <div className="mb-6">
        <p className="text-sm font-semibold m-0 mb-5 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          <Settings2 size={16} className="text-indigo-500" /> Pemetaan Kolom Excel
        </p>

        {/* DATA GABUNGAN OPD */}
        <div className="mb-5 bg-slate-50/50 rounded-xl p-4 border border-slate-100/80">
          <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Data Gabungan OPD
            </span>
            <span 
              className="text-xs text-slate-400 font-mono truncate max-w-[180px] sm:max-w-[280px]" 
              title={gabungan.fileName}
            >
              {gabungan.fileName}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColumnSelect
              label="Kolom NIK"
              value={kolomNikGabungan}
              onChange={onKolomNikGabungan}
              columns={gabungan.columns}
            />
            <ColumnSelect
              label="Kolom Nama"
              value={kolomNamaGabungan}
              onChange={onKolomNamaGabungan}
              columns={gabungan.columns}
              optional
            />
          </div>
        </div>

        {/* DATA PEMBANDING */}
        <div className="mb-5 bg-slate-50/50 rounded-xl p-4 border border-slate-100/80">
          <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Data Pembanding
            </span>
            <span 
              className="text-xs text-slate-400 font-mono truncate max-w-[180px] sm:max-w-[280px]" 
              title={pembanding.fileName}
            >
              {pembanding.fileName}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <ColumnSelect
              label="Kolom NIK"
              value={kolomNikPembanding}
              onChange={onKolomNikPembanding}
              columns={pembanding.columns}
            />
            <ColumnSelect
              label="Kolom Nama"
              value={kolomNamaPembanding}
              onChange={onKolomNamaPembanding}
              columns={pembanding.columns}
              optional
            />
          </div>

          <div className="border-t border-slate-200/60 pt-4">
            <ColumnSelect
              label="Kolom Status / Keterangan"
              value={kolomStatusPembanding}
              onChange={onKolomStatus}
              columns={pembanding.columns}
              optional
            />
          </div>

          {/* Checklist Nilai Status */}
          {kolomStatusPembanding && (
            <div className="mt-4 bg-white border border-slate-200/60 rounded-xl p-4 animate-fade-in">
              <p className="text-xs text-slate-500 m-0 mb-3 font-semibold">
                Centang status yang dianggap VALID / DIHITUNG COCOK:
              </p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                {daftarStatusUnik.map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors bg-slate-50/40 px-3 py-2 rounded-lg border border-slate-100 shadow-sm"
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
        </div>

        {/* Nama Kolom Baru */}
        <div className="border-t border-slate-100 pt-4 mb-6">
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
