import UploadSlot from "./UploadSlot.jsx";
import DataPreview from "./DataPreview.jsx";
import { ChevronRight } from "lucide-react";

/**
 * UI Langkah 1: Upload 2 file (data gabungan + data pembanding).
 */
export default function UploadStep({
  gabungan,
  pembanding,
  barisHeaderGabungan,
  barisHeaderPembanding,
  loadingGabungan,
  loadingPembanding,
  onGabunganFile,
  onPembandingFile,
  onBarisHeaderGabungan,
  onBarisHeaderPembanding,
  onNext,
}) {
  const bothUploaded = gabungan && pembanding;

  return (
    <div className="animate-fade-in">
      <div className="grid gap-4 mb-6">
        {/* Data gabungan */}
        <UploadSlot
          title="Data gabungan"
          subtitle="NIK, No KK, Nama, Alamat, dsb."
          file={gabungan}
          onFile={onGabunganFile}
          loading={loadingGabungan}
        />
        {gabungan && !loadingGabungan && (
          <DataPreview
            rawRows={gabungan.previewRows}
            barisHeader={barisHeaderGabungan}
            onBarisHeader={onBarisHeaderGabungan}
            label="data gabungan"
          />
        )}

        {/* Data pembanding */}
        <UploadSlot
          title="Data pembanding"
          subtitle="Misal: Data DTKS, Data Ketenagakerjaan, dsb."
          file={pembanding}
          onFile={onPembandingFile}
          loading={loadingPembanding}
        />
        {pembanding && !loadingPembanding && (
          <DataPreview
            rawRows={pembanding.previewRows}
            barisHeader={barisHeaderPembanding}
            onBarisHeader={onBarisHeaderPembanding}
            label="data pembanding"
          />
        )}
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
        Lanjut ke konfigurasi <ChevronRight size={16} />
      </button>
    </div>
  );
}
