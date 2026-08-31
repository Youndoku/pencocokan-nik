import { useState, useEffect, useRef, useCallback } from "react";
import ExcelWorker from "../utils/excelWorker.js?worker";

/**
 * Custom hook untuk mengelola flow pencocokan NIK.
 * Menggunakan Web Worker di latar belakang untuk mencegah UI freezing
 * saat mengolah data berskala besar (50k+ baris).
 */
export function usePencocokanNIK() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Configure, 3: Anomalies, 4: Results
  
  // -- Metadata file (tidak menyimpan seluruh baris mentah di main thread!) --
  const [gabungan, setGabungan] = useState(null); // { fileName, totalRows, columns, previewRows }
  const [pembanding, setPembanding] = useState(null); // { fileName, totalRows, columns, previewRows }

  const [barisHeaderGabungan, setBarisHeaderGabungan] = useState(0);
  const [barisHeaderPembanding, setBarisHeaderPembanding] = useState(0);

  // -- Konfigurasi Kolom --
  const [kolomNikGabungan, setKolomNikGabungan] = useState("");
  const [kolomNamaGabungan, setKolomNamaGabungan] = useState("");
  const [kolomNikPembanding, setKolomNikPembanding] = useState("");
  const [kolomNamaPembanding, setKolomNamaPembanding] = useState("");
  const [kolomStatusPembanding, setKolomStatusPembanding] = useState("");
  const [statusTerpilih, setStatusTerpilih] = useState(new Set());
  const [namaKolomBaru, setNamaKolomBaru] = useState("");

  const [daftarStatusUnik, setDaftarStatusUnik] = useState([]);

  // -- Status Loading & Progress --
  const [loadingGabungan, setLoadingGabungan] = useState(false);
  const [loadingPembanding, setLoadingPembanding] = useState(false);
  const [loadingMatching, setLoadingMatching] = useState(false);
  const [progress, setProgress] = useState({ step: "", percent: 0 });
  const [error, setError] = useState("");

  // -- Temuan Anomali & Resolusi dari User --
  const [anomalies, setAnomalies] = useState({ nameMismatches: [], invalidNiks: [] });
  const [nameMismatchResolutions, setNameMismatchResolutions] = useState({}); // { [anomalyId]: 'valid' | 'abaikan' }
  const [invalidNikResolutions, setInvalidNikResolutions] = useState({}); // { [anomalyId]: 'valid' | 'abaikan' }

  // -- Hasil & Excel buffer untuk download --
  const [hasil, setHasil] = useState(null); // Summary metrics + preview mismatch
  const [excelBuffer, setExcelBuffer] = useState(null); // ArrayBuffer untuk di-download
  const [dataHasil, setDataHasil] = useState(null);
  const [keteranganDistribusi, setKeteranganDistribusi] = useState(null);
  const [mismatchLog, setMismatchLog] = useState([]);
  const [kolomTersedia, setKolomTersedia] = useState([]);

  const workerRef = useRef(null);

  // Inisialisasi Web Worker
  useEffect(() => {
    workerRef.current = new ExcelWorker();

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;

      switch (type) {
        case "PROGRESS": {
          const { fileType, step: workerStep, percent } = payload;
          setProgress({ step: workerStep, percent });
          break;
        }

        case "PARSE_SUCCESS": {
          const { fileType, previewRows, totalRows, fileName, guessedHeaderIdx } = payload;
          setError("");

          const defaultColumns = previewRows[guessedHeaderIdx] || [];
          const guessedNik = guessColumn(defaultColumns, ["nik"]);
          const guessedNama = guessColumn(defaultColumns, ["nama"]);

          if (fileType === "gabungan") {
            setLoadingGabungan(false);
            setBarisHeaderGabungan(guessedHeaderIdx);
            setGabungan({ fileName, totalRows, columns: defaultColumns, previewRows });
            setKolomNikGabungan(guessedNik);
            setKolomNamaGabungan(guessedNama);

            // Minta worker untuk men-setup baris header default secara asinkron
            workerRef.current.postMessage({
              type: "SET_HEADER_ROW",
              payload: { fileType: "gabungan", headerIdx: guessedHeaderIdx },
            });
          } else {
            setLoadingPembanding(false);
            setBarisHeaderPembanding(guessedHeaderIdx);
            setPembanding({ fileName, totalRows, columns: defaultColumns, previewRows });
            setKolomNikPembanding(guessedNik);
            setKolomNamaPembanding(guessedNama);

            const stem = fileName.replace(/\.(xlsx|xls)$/i, "");
            setNamaKolomBaru(stem);

            workerRef.current.postMessage({
              type: "SET_HEADER_ROW",
              payload: { fileType: "pembanding", headerIdx: guessedHeaderIdx },
            });
          }
          break;
        }

        case "HEADER_SUCCESS": {
          const { fileType, columns, totalRows } = payload;
          if (fileType === "gabungan") {
            setGabungan((prev) => ({ ...prev, columns, totalRows }));
          } else {
            setPembanding((prev) => ({ ...prev, columns, totalRows }));
          }
          break;
        }

        case "UNIQUE_VALUES_SUCCESS": {
          const { values } = payload;
          setDaftarStatusUnik(values);
          break;
        }

        case "ANOMALIES_FOUND": {
          const { nameMismatches, invalidNiks, hasAnomalies } = payload;
          setLoadingMatching(false);
          setAnomalies({ nameMismatches, invalidNiks });

          // Inisialisasi resolusi default
          // Default: namaMismatch divalidkan/diajukan konfirmasi (user bisa ubah)
          // Default: invalidNik divalidkan agar tetap dicoba dicocokkan
          const initialNameRes = {};
          nameMismatches.forEach((a) => {
            initialNameRes[a.id] = "abaikan"; // Default abaikan (tidak cocok) agar user sadar & memvalidkan secara sadar
          });
          const initialNikRes = {};
          invalidNiks.forEach((a) => {
            initialNikRes[a.id] = "valid"; // Tetap sertakan untuk dicocokkan
          });

          setNameMismatchResolutions(initialNameRes);
          setInvalidNikResolutions(initialNikRes);

          if (hasAnomalies) {
            setStep(3); // Masuk ke langkah konfirmasi anomali
          } else {
            // Jika tidak ada anomali, langsung finalisasi matching
            finalizeMatching(initialNameRes, initialNikRes);
          }
          break;
        }

        case "MATCHING_SUCCESS": {
          const {
            summary,
            excelBuffer: buffer,
            dataHasil: dHasil,
            keteranganDistribusi: kDistribusi,
            mismatchLog: mLog,
            kolomTersedia: kTersedia,
          } = payload || e.data;
          setLoadingMatching(false);
          setHasil(
            summary || {
              total: payload?.total ?? e.data?.total,
              cocok: payload?.cocok ?? e.data?.cocok,
              tidak: payload?.tidak ?? e.data?.tidak,
              dikecualikanStatus:
                payload?.dikecualikanStatus ?? e.data?.dikecualikanStatus,
              useStatus: payload?.useStatus ?? e.data?.useStatus,
              mismatch: payload?.mismatch ?? e.data?.mismatch ?? [],
              totalMismatch:
                payload?.totalMismatch ?? e.data?.totalMismatch ?? 0,
            }
          );
          setExcelBuffer(buffer || payload?.excelBuffer || e.data?.excelBuffer);
          setDataHasil(
            dHasil || payload?.dataHasil || e.data?.dataHasil || null
          );
          setKeteranganDistribusi(
            kDistribusi ||
              payload?.keteranganDistribusi ||
              e.data?.keteranganDistribusi ||
              null
          );
          setMismatchLog(
            mLog || payload?.mismatchLog || e.data?.mismatchLog || []
          );
          setKolomTersedia(
            kTersedia || payload?.kolomTersedia || e.data?.kolomTersedia || []
          );
          setStep(4);
          break;
        }

        case "ERROR": {
          const { message } = payload;
          setError(message);
          setLoadingGabungan(false);
          setLoadingPembanding(false);
          setLoadingMatching(false);
          break;
        }
      }
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  // Helper untuk menebak kolom
  const guessColumn = (columns, keywords) => {
    const lower = columns.map((c) => String(c).toLowerCase());
    for (const kw of keywords) {
      const idx = lower.findIndex((c) => c.includes(kw));
      if (idx !== -1) return columns[idx];
    }
    return columns[0] || "";
  };

  // Handler Upload
  const handleGabunganFile = useCallback((file) => {
    setError("");
    setLoadingGabungan(true);
    workerRef.current.postMessage({
      type: "PARSE_FILE",
      payload: { file, fileType: "gabungan" },
    });
  }, []);

  const handlePembandingFile = useCallback((file) => {
    setError("");
    setLoadingPembanding(true);
    workerRef.current.postMessage({
      type: "PARSE_FILE",
      payload: { file, fileType: "pembanding" },
    });
  }, []);

  // Ubah Baris Header
  const ubahBarisHeaderGabungan = useCallback((index) => {
    setBarisHeaderGabungan(index);
    workerRef.current.postMessage({
      type: "SET_HEADER_ROW",
      payload: { fileType: "gabungan", headerIdx: index },
    });
  }, []);

  const ubahBarisHeaderPembanding = useCallback((index) => {
    setBarisHeaderPembanding(index);
    workerRef.current.postMessage({
      type: "SET_HEADER_ROW",
      payload: { fileType: "pembanding", headerIdx: index },
    });
  }, []);

  // Ubah Kolom Status
  const ubahKolomStatus = useCallback((columnName) => {
    setKolomStatusPembanding(columnName);
    setStatusTerpilih(new Set());
    if (columnName) {
      workerRef.current.postMessage({
        type: "GET_UNIQUE_VALUES",
        payload: { columnName },
      });
    } else {
      setDaftarStatusUnik([]);
    }
  }, []);

  const toggleStatus = useCallback((val) => {
    setStatusTerpilih((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }, []);

  const goToConfigure = useCallback(() => {
    setError("");
    if (!gabungan || !pembanding) {
      setError("Unggah kedua file terlebih dahulu.");
      return;
    }
    setStep(2);
  }, [gabungan, pembanding]);

  // Langkah Scan Anomali
  const scanAnomalies = useCallback(() => {
    setError("");
    if (!kolomNikGabungan || !kolomNikPembanding) {
      setError("Kolom NIK di kedua file wajib dipilih.");
      return;
    }
    if (!namaKolomBaru.trim()) {
      setError("Nama kolom baru tidak boleh kosong.");
      return;
    }

    setLoadingMatching(true);
    setProgress({ step: "indexing", percent: 0 });

    workerRef.current.postMessage({
      type: "SCAN_ANOMALIES",
      payload: {
        config: {
          kolomNikGabungan,
          kolomNikPembanding,
          kolomNamaGabungan,
          kolomNamaPembanding,
          kolomStatusPembanding,
          statusTerpilih: Array.from(statusTerpilih),
          namaKolomBaru,
        },
      },
    });
  }, [
    kolomNikGabungan,
    kolomNikPembanding,
    kolomNamaGabungan,
    kolomNamaPembanding,
    kolomStatusPembanding,
    statusTerpilih,
    namaKolomBaru,
  ]);

  // Langkah Finalisasi Matching dengan resolusi anomali
  const finalizeMatching = useCallback((nameRes = nameMismatchResolutions, nikRes = invalidNikResolutions) => {
    setLoadingMatching(true);
    setProgress({ step: "finalizing", percent: 0 });

    workerRef.current.postMessage({
      type: "FINALIZE_MATCHING",
      payload: {
        resolutions: {
          nameMismatches: nameRes,
          invalidNiks: nikRes,
        },
      },
    });
  }, [nameMismatchResolutions, invalidNikResolutions]);

  // Unduh Berkas Hasil
  const handleDownload = useCallback(() => {
    if (!excelBuffer) return;
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil_${namaKolomBaru || "pencocokan"}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [excelBuffer, namaKolomBaru]);

  // Reset State ke Awal
  const reset = useCallback(() => {
    setStep(1);
    setGabungan(null);
    setPembanding(null);
    setBarisHeaderGabungan(0);
    setBarisHeaderPembanding(0);
    setError("");
    setKolomNikGabungan("");
    setKolomNamaGabungan("");
    setKolomNikPembanding("");
    setKolomNamaPembanding("");
    setKolomStatusPembanding("");
    setStatusTerpilih(new Set());
    setNamaKolomBaru("");
    setDaftarStatusUnik([]);
    setAnomalies({ nameMismatches: [], invalidNiks: [] });
    setNameMismatchResolutions({});
    setInvalidNikResolutions({});
    setHasil(null);
    setExcelBuffer(null);
    setDataHasil(null);
    setKeteranganDistribusi(null);
    setMismatchLog([]);
    setKolomTersedia([]);
  }, []);

  // Helper untuk teks progress dalam Bahasa Indonesia
  const getProgressMessage = () => {
    switch (progress.step) {
      case "reading":
        return `Membaca file Excel (${progress.percent}%)`;
      case "parsing":
        return `Membedah struktur file (${progress.percent}%)`;
      case "processing":
        return `Memproses baris data (${progress.percent}%)`;
      case "indexing":
        return `Membuat indeks pencarian NIK...`;
      case "scanning":
        return `Memindai anomali data (${progress.percent}%)`;
      case "finalizing":
        return `Menerapkan keputusan & mencocokkan (${progress.percent}%)`;
      case "writing_excel":
        return `Menyusun file Excel hasil (${progress.percent}%)`;
      case "compressing":
        return `Mengompres file hasil...`;
      case "done":
        return `Selesai!`;
      default:
        return `Memproses data...`;
    }
  };

  return {
    step,
    setStep,
    gabungan,
    pembanding,
    barisHeaderGabungan,
    barisHeaderPembanding,
    error,
    loadingGabungan,
    loadingPembanding,
    loadingMatching,
    progress,
    progressText: getProgressMessage(),
    kolomNikGabungan,
    kolomNamaGabungan,
    kolomNikPembanding,
    kolomNamaPembanding,
    kolomStatusPembanding,
    statusTerpilih,
    namaKolomBaru,
    daftarStatusUnik,
    anomalies,
    nameMismatchResolutions,
    invalidNikResolutions,
    setNameMismatchResolutions,
    setInvalidNikResolutions,
    hasil,
    dataHasil,
    keteranganDistribusi,
    mismatchLog,
    kolomTersedia,
    excelBuffer,
    reset,
    handleGabunganFile,
    handlePembandingFile,
    ubahBarisHeaderGabungan,
    ubahBarisHeaderPembanding,
    goToConfigure,
    ubahKolomStatus,
    toggleStatus,
    setKolomNikGabungan,
    setKolomNamaGabungan,
    setKolomNikPembanding,
    setKolomNamaPembanding,
    setNamaKolomBaru,
    scanAnomalies,
    finalizeMatching,
    handleDownload,
  };
}
