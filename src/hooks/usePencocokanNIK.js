import { useState, useEffect, useRef, useCallback } from "react";
import ExcelWorker from "../utils/excelWorker.js?worker";
import { kolomProgramSesi, tebakKolomKecamatan } from "../utils/autoDetectColumns.js";

/** Nama kolom baru bentrok dengan kolom yang sudah ada (dipangkas, tidak peka huruf besar/kecil). */
export function namaKolomBentrok(columns = [], nama) {
  const n = String(nama ?? "").trim().toLowerCase();
  // "Keterangan" dipakai kolom tampilan dashboard, jadi ikut ditolak.
  return Boolean(n) && [...columns, "Keterangan"].some((c) => String(c).trim().toLowerCase() === n);
}

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
  const [kolomKecamatan, setKolomKecamatan] = useState(""); // dari data gabungan, opsional
  const [kolomNikPembanding, setKolomNikPembanding] = useState("");
  const [kolomNamaPembanding, setKolomNamaPembanding] = useState("");
  const [kolomStatusPembanding, setKolomStatusPembanding] = useState("");
  const [statusTerpilih, setStatusTerpilih] = useState(new Set());
  const [namaKolomBaru, setNamaKolomBaru] = useState("");

  const [daftarStatusUnik, setDaftarStatusUnik] = useState([]); // [{ nilai, jumlah }]
  const [validasi, setValidasi] = useState({}); // { gabungan, pembanding }: hasil VALIDATE_DATA

  // -- Status Loading & Progress --
  const [loadingGabungan, setLoadingGabungan] = useState(false);
  const [loadingPembanding, setLoadingPembanding] = useState(false);
  const [loadingMatching, setLoadingMatching] = useState(false);
  const [progress, setProgress] = useState({ step: "", percent: 0 });
  const [error, setError] = useState("");

  // -- Temuan Anomali & Resolusi dari User --
  const [anomalies, setAnomalies] = useState({
    nameMismatches: [],
    invalidNiks: [],
    duplicateNiks: [],
  });
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
  const kecamatanAsalRef = useRef(undefined); // kolomKecamatan sesi asal, kalau data gabungan dari sesi

  // Inisialisasi Web Worker
  useEffect(() => {
    workerRef.current = new ExcelWorker();

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;

      switch (type) {
        case "PROGRESS": {
          const { step: workerStep, percent } = payload;
          setProgress({ step: workerStep, percent });
          break;
        }

        case "PARSE_SUCCESS": {
          const { fileType, previewRows, totalRows, fileName, fileSize, guessedHeaderIdx } = payload;
          setError("");

          const file = { fileName, fileSize, totalRows, columns: previewRows[guessedHeaderIdx] || [], previewRows };
          if (fileType === "gabungan") {
            setLoadingGabungan(false);
            setBarisHeaderGabungan(guessedHeaderIdx);
            setGabungan(file);
          } else {
            setLoadingPembanding(false);
            setBarisHeaderPembanding(guessedHeaderIdx);
            setPembanding(file);
            setNamaKolomBaru(fileName.replace(/\.(xlsx|xls)$/i, ""));
          }

          // Minta worker untuk men-setup baris header default secara asinkron
          workerRef.current.postMessage({
            type: "SET_HEADER_ROW",
            payload: { fileType, headerIdx: guessedHeaderIdx },
          });
          break;
        }

        // Juga balasan LOAD_ROWS (data gabungan dari sesi sebelumnya).
        case "HEADER_SUCCESS": {
          const { fileType, columns, totalRows, kolomProgram } = payload;
          // Tebak ulang tiap baris judul berubah, supaya kolom terpilih selalu ada.
          const guessedNik = guessColumn(columns, ["nik"]);
          const guessedNama = guessColumn(columns, ["nama"]);
          if (fileType === "gabungan") {
            // Dari sesi: kolomProgram sesi asal yang dipakai, bukan tebakan worker.
            // prev null = sumber sudah diganti sebelum balasan ini datang.
            setGabungan((prev) =>
              prev && {
                ...prev,
                columns,
                totalRows,
                kolomProgram: prev.sesiId ? prev.kolomProgram : kolomProgram,
              }
            );
            setLoadingGabungan(false); // balasan LOAD_ROWS dari pakaiSesi
            setKolomNikGabungan(guessedNik);
            setKolomNamaGabungan(guessedNama);
            const asal = kecamatanAsalRef.current;
            setKolomKecamatan(
              asal !== undefined && (asal === "" || columns.includes(asal))
                ? asal
                : tebakKolomKecamatan(columns)
            );
          } else {
            setPembanding((prev) => prev && { ...prev, columns, totalRows });
            setKolomNikPembanding(guessedNik);
            setKolomNamaPembanding(guessedNama);
          }
          workerRef.current.postMessage({
            type: "VALIDATE_DATA",
            payload: { target: fileType, kolomNik: guessedNik },
          });
          break;
        }

        case "VALIDATION_RESULT": {
          const { target, result } = payload;
          setValidasi((prev) => ({ ...prev, [target]: result }));
          break;
        }

        case "UNIQUE_VALUES_SUCCESS": {
          const { values } = payload;
          setDaftarStatusUnik(values);
          break;
        }

        case "ANOMALIES_FOUND": {
          const { nameMismatches, invalidNiks, duplicateNiks, hasAnomalies } = payload;
          setLoadingMatching(false);
          setAnomalies({ nameMismatches, invalidNiks, duplicateNiks });

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
    // Worker dibuat sekali; finalizeMatching dipanggil dengan argumen eksplisit, jadi closure lama aman.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    kecamatanAsalRef.current = undefined;
    setLoadingGabungan(true);
    workerRef.current.postMessage({
      type: "PARSE_FILE",
      payload: { file, fileType: "gabungan" },
    });
  }, []);

  // Data gabungan = hasil sesi sebelumnya (tanpa kolom Keterangan, yang cuma untuk tampilan).
  const pakaiSesi = useCallback((sesi) => {
    setError("");
    const rows = (sesi.dataHasil || []).map(({ Keterangan: _k, ...r }) => r);
    const columns = (sesi.kolomTersedia || []).filter((c) => c !== "Keterangan");
    const fileName = `hasil_${sesi.namaKolomBaru || "pencocokan"}.xlsx`;
    setValidasi((prev) => ({ ...prev, gabungan: null }));
    // Sesi lama belum punya kolomKecamatan (undefined), jadi nanti ditebak dari nama kolom.
    kecamatanAsalRef.current = sesi.konfigurasi?.kolomKecamatan;
    // Lanjut nonaktif sampai worker membalas, supaya pilihan kolom di langkah 2 tidak ditimpa tebakan.
    setLoadingGabungan(true);
    setGabungan({
      fileName,
      totalRows: rows.length,
      columns,
      sesiId: sesi.id,
      kolomProgram: kolomProgramSesi(sesi),
    });
    workerRef.current.postMessage({
      type: "LOAD_ROWS",
      payload: { fileType: "gabungan", rows, columns, fileName },
    });
  }, []);

  const hapusGabungan = useCallback(() => {
    setGabungan(null);
    setValidasi((prev) => ({ ...prev, gabungan: null }));
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
    const namaBaru = namaKolomBaru.trim();
    if (!namaBaru) {
      setError("Nama kolom baru tidak boleh kosong.");
      return;
    }
    if (namaKolomBentrok(gabungan?.columns, namaBaru)) {
      setError("Nama ini sudah dipakai di data gabungan. Pakai nama lain supaya kolom lama tidak tertimpa.");
      return;
    }
    setNamaKolomBaru(namaBaru);

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
          namaKolomBaru: namaBaru,
        },
      },
    });
  }, [
    gabungan,
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
    setKolomKecamatan("");
    setKolomNikPembanding("");
    setKolomNamaPembanding("");
    setKolomStatusPembanding("");
    setStatusTerpilih(new Set());
    setNamaKolomBaru("");
    setDaftarStatusUnik([]);
    setValidasi({});
    setAnomalies({ nameMismatches: [], invalidNiks: [], duplicateNiks: [] });
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
    kolomKecamatan,
    kolomNikPembanding,
    kolomNamaPembanding,
    kolomStatusPembanding,
    statusTerpilih,
    namaKolomBaru,
    daftarStatusUnik,
    validasi,
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
    pakaiSesi,
    hapusGabungan,
    ubahBarisHeaderGabungan,
    ubahBarisHeaderPembanding,
    goToConfigure,
    ubahKolomStatus,
    toggleStatus,
    setKolomNikGabungan,
    setKolomNamaGabungan,
    setKolomKecamatan,
    setKolomNikPembanding,
    setKolomNamaPembanding,
    setNamaKolomBaru,
    scanAnomalies,
    finalizeMatching,
    handleDownload,
  };
}
