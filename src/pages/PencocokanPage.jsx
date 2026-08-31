import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePencocokanNIK } from "../hooks/usePencocokanNIK.js";
import { useRiwayat } from "../hooks/useRiwayat.js";
import { generateId } from "../utils/db.js";
import { generatePdf } from "../utils/pdfExport.js";
import StepDot from "../components/pencocokan/StepDot.jsx";
import UploadStep from "../components/pencocokan/UploadStep.jsx";
import ConfigureStep from "../components/pencocokan/ConfigureStep.jsx";
import AnomalyStep from "../components/pencocokan/AnomalyStep.jsx";
import ResultsDashboard from "../components/pencocokan/ResultsDashboard.jsx";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function PencocokanPage() {
  const navigate = useNavigate();
  const { simpanSesi, ambilSesi } = useRiwayat();
  const [sesiId, setSesiId] = useState(null);
  const savedRef = useRef(false);

  const {
    step, setStep,
    gabungan, pembanding,
    barisHeaderGabungan, barisHeaderPembanding,
    error,
    loadingGabungan, loadingPembanding, loadingMatching,
    progress, progressText,
    kolomNikGabungan, kolomNamaGabungan,
    kolomNikPembanding, kolomNamaPembanding,
    kolomStatusPembanding, statusTerpilih, namaKolomBaru,
    daftarStatusUnik, anomalies,
    nameMismatchResolutions, invalidNikResolutions,
    setNameMismatchResolutions, setInvalidNikResolutions,
    hasil, dataHasil, keteranganDistribusi, mismatchLog, kolomTersedia,
    reset,
    handleGabunganFile, handlePembandingFile,
    ubahBarisHeaderGabungan, ubahBarisHeaderPembanding,
    goToConfigure, ubahKolomStatus, toggleStatus,
    setKolomNikGabungan, setKolomNamaGabungan,
    setKolomNikPembanding, setKolomNamaPembanding,
    setNamaKolomBaru,
    scanAnomalies, finalizeMatching, handleDownload,
    excelBuffer,
  } = usePencocokanNIK();

  const hasAnomalies =
    anomalies.nameMismatches.length > 0 || anomalies.invalidNiks.length > 0;

  // Auto-save to IndexedDB when results are ready
  useEffect(() => {
    if (step === 4 && hasil && dataHasil && !savedRef.current) {
      savedRef.current = true;
      const id = generateId();
      setSesiId(id);

      simpanSesi({
        id,
        tanggal: new Date().toISOString(),
        namaGabungan: gabungan?.fileName || "",
        namaPembanding: pembanding?.fileName || "",
        namaKolomBaru,
        konfigurasi: {
          kolomNikGabungan,
          kolomNamaGabungan,
          kolomNikPembanding,
          kolomNamaPembanding,
          kolomStatusPembanding,
          statusTerpilih: Array.from(statusTerpilih || []),
        },
        ringkasan: {
          total: hasil.total,
          cocok: hasil.cocok,
          tidak: hasil.tidak,
          dikecualikanStatus: hasil.dikecualikanStatus,
          totalMismatch: hasil.totalMismatch || 0,
          totalInvalidNik: anomalies.invalidNiks.length,
          persentase:
            hasil.total > 0
              ? parseFloat(((hasil.cocok / hasil.total) * 100).toFixed(1))
              : 0,
        },
        dataHasil,
        mismatchLog: mismatchLog || [],
        excelBuffer: excelBuffer || null,
        kolomTersedia: kolomTersedia || [],
        keteranganDistribusi: keteranganDistribusi || {},
      });
    }
  }, [step, hasil, dataHasil]);

  const handleReset = () => {
    savedRef.current = false;
    setSesiId(null);
    reset();
  };

  const handleSetNameResolution = (id, resolution) => {
    setNameMismatchResolutions((prev) => ({ ...prev, [id]: resolution }));
  };

  const handleSetNikResolution = (id, resolution) => {
    setInvalidNikResolutions((prev) => ({ ...prev, [id]: resolution }));
  };

  const handleBulkNameResolution = (resolution) => {
    const nextRes = { ...nameMismatchResolutions };
    anomalies.nameMismatches.forEach((item) => {
      nextRes[item.id] = resolution;
    });
    setNameMismatchResolutions(nextRes);
  };

  const handleBulkNikResolution = (resolution) => {
    const nextRes = { ...invalidNikResolutions };
    anomalies.invalidNiks.forEach((item) => {
      nextRes[item.id] = resolution;
    });
    setInvalidNikResolutions(nextRes);
  };

  return (
    <div className="flex items-start justify-center px-4 py-8 sm:py-12 animate-fade-in">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold m-0 mb-1.5 text-slate-900 tracking-tight">
            Pencocokan Data NIK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 m-0 max-w-sm mx-auto leading-relaxed">
            Cocokkan data gabungan OPD dengan data pembanding, lalu unduh hasil
            dalam format Excel. 100% offline &amp; aman.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-7">
          <StepDot index={1} label="Unggah" active={step === 1} done={step > 1} />
          <StepDot index={2} label="Konfigurasi" active={step === 2} done={step > 2} />
          {hasAnomalies && (
            <StepDot index={3} label="Anomali" active={step === 3} done={step > 3} />
          )}
          <StepDot
            index={hasAnomalies ? 4 : 3}
            label="Hasil"
            active={step === 4}
            done={false}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in font-medium">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Steps */}
        {step === 1 && (
          <UploadStep
            gabungan={gabungan}
            pembanding={pembanding}
            barisHeaderGabungan={barisHeaderGabungan}
            barisHeaderPembanding={barisHeaderPembanding}
            loadingGabungan={loadingGabungan}
            loadingPembanding={loadingPembanding}
            onGabunganFile={handleGabunganFile}
            onPembandingFile={handlePembandingFile}
            onBarisHeaderGabungan={ubahBarisHeaderGabungan}
            onBarisHeaderPembanding={ubahBarisHeaderPembanding}
            onNext={goToConfigure}
          />
        )}

        {step === 2 && gabungan && pembanding && (
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
            onProses={scanAnomalies}
            loadingMatching={loadingMatching}
            progressText={progressText}
            progress={progress}
          />
        )}

        {step === 3 && hasAnomalies && (
          <AnomalyStep
            anomalies={anomalies}
            nameMismatchResolutions={nameMismatchResolutions}
            invalidNikResolutions={invalidNikResolutions}
            onSetNameResolution={handleSetNameResolution}
            onSetNikResolution={handleSetNikResolution}
            onBulkNameResolution={handleBulkNameResolution}
            onBulkNikResolution={handleBulkNikResolution}
            onBack={() => setStep(2)}
            onNext={() =>
              finalizeMatching(nameMismatchResolutions, invalidNikResolutions)
            }
            loadingMatching={loadingMatching}
          />
        )}

        {step === 4 && hasil && (
          <ResultsDashboard
            hasil={hasil}
            dataHasil={dataHasil}
            namaKolomBaru={namaKolomBaru}
            namaGabungan={gabungan?.fileName}
            namaPembanding={pembanding?.fileName}
            sesiId={sesiId}
            onReset={handleReset}
            onDownload={handleDownload}
            onSavePdf={() => {
              if (sesiId) {
                ambilSesi(sesiId).then((s) => {
                  if (s) generatePdf(s);
                });
              }
            }}
            hasSaved={savedRef.current}
          />
        )}

        {/* Privacy footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Proses dilakukan sepenuhnya di web browser komputer Anda tanpa
          mengirim data keluar.
        </p>
      </div>
    </div>
  );
}
