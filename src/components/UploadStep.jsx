import UploadSlot from "./UploadSlot.jsx";
import DataPreview from "./DataPreview.jsx";
import { ChevronRight } from "lucide-react";

/**
 * UI Langkah 1: Upload 2 file (data gabungan + data pembanding).
 * Setelah file diupload, tampilkan preview data mentah agar user bisa
 * memilih baris header yang benar (terutama untuk file dengan format
 * tidak standar — judul di baris pertama, baris kosong, dsb).
 */
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
        <div className="min-w-0">
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
        <div className="min-w-0">
          <UploadSlot
            title="Data Pembanding"
            subtitle="Berkas dinas luar (misal: data pencari kerja)"
            file={pembanding}
            onFile={onPembandingFile}
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
