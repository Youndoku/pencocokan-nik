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
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-12 sm:py-16 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-indigo-100/40 to-transparent blur-3xl pointer-events-none z-0" />
      
      <div className="w-full max-w-xl relative z-10 min-w-0">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold m-0 mb-2 text-slate-900 tracking-tight">
            Pencocokan Data NIK
          </h1>
          <p className="text-sm text-slate-500 m-0 max-w-sm mx-auto leading-relaxed">
            Periksa kecocokan data warga dinas dengan data pembanding secara cepat, aman, dan 100% lokal.
          </p>
        </div>

        {/* Indikator langkah */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm">
          <StepDot index={1} label="Unggah Data" active={step === 1} done={step > 1} />
          <StepDot index={2} label="Konfigurasi" active={step === 2} done={step > 2} />
          <StepDot index={3} label="Hasil Proses" active={step === 3} done={false} />
        </div>

        {/* Pesan error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in shadow-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Konten langkah wrapper */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full min-w-0">
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
        </div>

        {/* Footer privasi */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400 font-medium">
            🔒 Semua data diproses 100% lokal di browser Anda — tidak ada data yang dikirim ke server.
          </p>
        </div>
      </div>
    </div>
  );
}