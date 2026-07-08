import { usePencocokanNIK } from "./hooks/usePencocokanNIK.js";
import StepDot from "./components/StepDot.jsx";
import UploadStep from "./components/UploadStep.jsx";
import ConfigureStep from "./components/ConfigureStep.jsx";
import ResultsStep from "./components/ResultsStep.jsx";
import { AlertTriangle, ShieldCheck } from "lucide-react";

/**
 * Komponen utama — shell tipis yang merangkai hook + komponen.
 * TIDAK ada logic bisnis di sini.
 */
export default function PencocokanNIK() {
  const {
    step,
    gabungan,
    pembanding,
    gabunganRaw,
    pembandingRaw,
    barisHeaderGabungan,
    barisHeaderPembanding,
    error,
    bothUploaded,
    loadingGabungan,
    loadingPembanding,
    kolomNikGabungan,
    kolomNamaGabungan,
    kolomNikPembanding,
    kolomNamaPembanding,
    kolomStatusPembanding,
    statusTerpilih,
    namaKolomBaru,
    daftarStatusUnik,
    hasil,
    setStep,
    setKolomNikGabungan,
    setKolomNamaGabungan,
    setKolomNikPembanding,
    setKolomNamaPembanding,
    setNamaKolomBaru,
    handleGabunganFile,
    handlePembandingFile,
    ubahBarisHeaderGabungan,
    ubahBarisHeaderPembanding,
    goToConfigure,
    toggleStatus,
    ubahKolomStatus,
    prosesData,
    reset,
    handleDownload,
  } = usePencocokanNIK();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-start justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold m-0 mb-1.5 text-slate-900 tracking-tight">
            Pencocokan Data NIK
          </h1>
          <p className="text-sm text-slate-500 m-0 max-w-sm mx-auto leading-relaxed">
            Cocokkan data gabungan OPD dengan data pembanding, lalu unduh hasil
            dalam format Excel.
          </p>
        </div>

        {/* Indikator langkah */}
        <div className="flex gap-2 mb-7">
          <StepDot index={1} label="Unggah" active={step === 1} done={step > 1} />
          <StepDot index={2} label="Konfigurasi" active={step === 2} done={step > 2} />
          <StepDot index={3} label="Hasil" active={step === 3} done={false} />
        </div>

        {/* Pesan error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Konten langkah */}
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

        {/* Footer privasi */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Semua data diproses 100% di browser Anda — tidak ada yang dikirim
          ke server.
        </p>
      </div>
    </div>
  );
}