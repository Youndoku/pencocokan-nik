import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { usePencocokanNIK } from "../hooks/usePencocokanNIK.js";
import { useRiwayat } from "../hooks/useRiwayat.js";
import { generateId } from "../utils/db.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import Stepper from "../components/pencocokan/Stepper.jsx";
import UploadStep from "../components/pencocokan/UploadStep.jsx";
import ConfigureStep from "../components/pencocokan/ConfigureStep.jsx";
import AnomalyStep from "../components/pencocokan/AnomalyStep.jsx";
import ResultsStep from "../components/pencocokan/ResultsStep.jsx";

export default function PencocokanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dari = searchParams.get("dari");
  const { sesiList, loading: loadingRiwayat, simpanSesi } = useRiwayat();
  const [sesiId, setSesiId] = useState(null);
  const [sumber, setSumber] = useState(null); // "sesi" | "file", null = belum dipilih
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
    kolomKecamatan, setKolomKecamatan,
    kolomStatusPembanding, statusTerpilih, namaKolomBaru,
    daftarStatusUnik, validasi, anomalies,
    nameMismatchResolutions, invalidNikResolutions,
    setNameMismatchResolutions, setInvalidNikResolutions,
    hasil, dataHasil, keteranganDistribusi, mismatchLog, kolomTersedia,
    handleGabunganFile, handlePembandingFile,
    pakaiSesi, hapusGabungan,
    ubahBarisHeaderGabungan, ubahBarisHeaderPembanding,
    goToConfigure, ubahKolomStatus, toggleStatus,
    setKolomNikGabungan, setKolomNamaGabungan,
    setKolomNikPembanding, setKolomNamaPembanding,
    setNamaKolomBaru,
    scanAnomalies, finalizeMatching, handleDownload,
    excelBuffer,
  } = usePencocokanNIK();

  const kolomProgram = [...(gabungan?.kolomProgram || []), namaKolomBaru];

  // Sumber awal data gabungan: sesi dari ?dari=, atau sesi terbaru, atau unggah file.
  useEffect(() => {
    if (sumber !== null || loadingRiwayat) return;
    const awal = sesiList.find((s) => s.id === dari) ?? sesiList[0];
    if (awal) {
      setSumber("sesi");
      pakaiSesi(awal);
    } else {
      setSumber("file");
    }
  }, [sumber, loadingRiwayat, sesiList, dari, pakaiSesi]);

  const gantiSumber = (s) => {
    setSumber(s);
    if (s === "sesi" && sesiList[0]) pakaiSesi(sesiList[0]);
    else hapusGabungan();
  };

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
        kolomProgram,
        konfigurasi: {
          kolomNikGabungan,
          kolomNamaGabungan,
          kolomNikPembanding,
          kolomNamaPembanding,
          kolomKecamatan,
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
        invalidNiks: anomalies.invalidNiks || [],
        invalidNikResolutions: invalidNikResolutions || {},
        duplicateNiks: anomalies.duplicateNiks || [],
        excelBuffer: excelBuffer || null,
        kolomTersedia: kolomTersedia || [],
        keteranganDistribusi: keteranganDistribusi || {},
      });
    }
    // Simpan sekali saat hasil siap (dijaga savedRef); nilai lain dibaca apa adanya saat itu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, hasil, dataHasil]);

  const idxSesi = sesiList.findIndex((s) => s.id === sesiId);
  const nomorSesi = idxSesi >= 0 ? sesiList.length - idxSesi : sesiList.length + 1;

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
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="title-lg m-0">Proses data baru</h1>
          <p className="body m-0 text-ink-muted">Padankan data gabungan dengan data pembanding satu program.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          Batalkan proses
        </Button>
      </header>

      <Stepper step={step} />

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-[12px] bg-negative-soft p-4 text-negative">
          <AlertCircle size={16} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p className="body m-0">{error}</p>
        </div>
      )}

      {loadingMatching ? (
        <Card title="Memproses data" subtitle="Jangan tutup halaman ini sampai selesai.">
          <ProgressBar value={progress.percent} label={progressText} start={progressText} end={`${progress.percent}%`} />
        </Card>
      ) : (
        <>
          {step === 1 && (
            <UploadStep
              sesiList={sesiList}
              sumber={sumber}
              onSumber={gantiSumber}
              gabungan={gabungan}
              pembanding={pembanding}
              onPilihSesi={pakaiSesi}
              barisHeaderGabungan={barisHeaderGabungan}
              barisHeaderPembanding={barisHeaderPembanding}
              loadingGabungan={loadingGabungan}
              loadingPembanding={loadingPembanding}
              progressText={progressText}
              validasi={validasi}
              kolomNikGabungan={kolomNikGabungan}
              kolomNikPembanding={kolomNikPembanding}
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
              kolomKecamatan={kolomKecamatan}
              onKolomKecamatan={setKolomKecamatan}
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
            />
          )}

          {step === 3 && (
            <AnomalyStep
              anomalies={anomalies}
              nameMismatchResolutions={nameMismatchResolutions}
              invalidNikResolutions={invalidNikResolutions}
              onSetNameResolution={(id, r) => setNameMismatchResolutions((prev) => ({ ...prev, [id]: r }))}
              onSetNikResolution={(id, r) => setInvalidNikResolutions((prev) => ({ ...prev, [id]: r }))}
              onBulkNameResolution={handleBulkNameResolution}
              onBulkNikResolution={handleBulkNikResolution}
              onBack={() => setStep(2)}
              onNext={() => finalizeMatching(nameMismatchResolutions, invalidNikResolutions)}
            />
          )}

          {step === 4 && hasil && (
            <ResultsStep
              hasil={hasil}
              namaKolomBaru={namaKolomBaru}
              nomorSesi={nomorSesi}
              sesiId={sesiId}
              kolomProgram={kolomProgram}
              anomalies={anomalies}
              nameMismatchResolutions={nameMismatchResolutions}
              invalidNikResolutions={invalidNikResolutions}
              onDownload={handleDownload}
              onPadankanLain={() => navigate(`/pencocokan?dari=${sesiId}`, { state: { mulai: Date.now() } })}
            />
          )}
        </>
      )}
    </>
  );
}
