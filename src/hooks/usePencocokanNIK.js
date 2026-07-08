import { useState, useMemo, useCallback } from "react";
import {
  readExcelFileRaw,
  tebakanBarisHeader,
  parseWithBarisHeader,
  downloadResultXlsx,
  guessColumn,
} from "../utils/excelIO.js";
import { cocokkanData, nilaiStatusUnik } from "../utils/matching.js";

/**
 * Custom hook yang mengelola seluruh state dan action untuk alur
 * pencocokan NIK. Satu-satunya tempat state React didefinisikan —
 * komponen cukup terima via props.
 */
export function usePencocokanNIK() {
  // -- navigasi langkah --
  const [step, setStep] = useState(1); // 1 upload, 2 konfigurasi, 3 hasil

  // -- data file mentah (2D array) untuk preview & pemilihan baris header --
  const [gabunganRaw, setGabunganRaw] = useState(null);
  const [pembandingRaw, setPembandingRaw] = useState(null);

  // -- indeks baris header yang dipilih user (0-based) --
  const [barisHeaderGabungan, setBarisHeaderGabungan] = useState(0);
  const [barisHeaderPembanding, setBarisHeaderPembanding] = useState(0);

  // -- data file yang sudah di-parse (array objek) --
  const [gabungan, setGabungan] = useState(null);
  const [pembanding, setPembanding] = useState(null);
  const [error, setError] = useState("");

  // -- konfigurasi pemetaan kolom --
  const [kolomNikGabungan, setKolomNikGabungan] = useState("");
  const [kolomNamaGabungan, setKolomNamaGabungan] = useState("");
  const [kolomNikPembanding, setKolomNikPembanding] = useState("");
  const [kolomNamaPembanding, setKolomNamaPembanding] = useState("");
  const [kolomStatusPembanding, setKolomStatusPembanding] = useState("");
  const [statusTerpilih, setStatusTerpilih] = useState(new Set());
  const [namaKolomBaru, setNamaKolomBaru] = useState("");

  // -- status loading saat baca file --
  const [loadingGabungan, setLoadingGabungan] = useState(false);
  const [loadingPembanding, setLoadingPembanding] = useState(false);

  // -- hasil pencocokan --
  const [hasil, setHasil] = useState(null);

  // -- derived: daftar nilai unik dari kolom status --
  const daftarStatusUnik = useMemo(
    () =>
      pembanding
        ? nilaiStatusUnik(pembanding.rows, kolomStatusPembanding)
        : [],
    [pembanding, kolomStatusPembanding]
  );

  const bothUploaded = gabungan && pembanding;

  // -- helper: parse raw + set state gabungan + guess kolom --
  const _parseGabungan = useCallback(
    (rawRows, fileName, headerIdx) => {
      const { rows, columns } = parseWithBarisHeader(rawRows, headerIdx);
      if (rows.length === 0) {
        setError(
          `Tidak ada baris data setelah baris header (baris ${headerIdx + 1}). Coba pilih baris header yang lain.`
        );
        return;
      }
      setError("");
      setGabungan({ rows, columns, fileName });
      setKolomNikGabungan(guessColumn(columns, ["nik"]));
      setKolomNamaGabungan(guessColumn(columns, ["nama"]));
    },
    []
  );

  // -- helper: parse raw + set state pembanding + guess kolom --
  const _parsePembanding = useCallback(
    (rawRows, fileName, headerIdx) => {
      const { rows, columns } = parseWithBarisHeader(rawRows, headerIdx);
      if (rows.length === 0) {
        setError(
          `Tidak ada baris data setelah baris header (baris ${headerIdx + 1}). Coba pilih baris header yang lain.`
        );
        return;
      }
      setError("");
      setPembanding({ rows, columns, fileName });
      setKolomNikPembanding(guessColumn(columns, ["nik"]));
      setKolomNamaPembanding(guessColumn(columns, ["nama"]));
      setKolomStatusPembanding("");
      setStatusTerpilih(new Set());
    },
    []
  );

  // -- handler upload data gabungan --
  const handleGabunganFile = useCallback(
    async (file) => {
      setError("");
      setLoadingGabungan(true);
      
      // Delay 50ms agar React sempat merender state loading ke layar browser
      setTimeout(async () => {
        try {
          const { rawRows, fileName } = await readExcelFileRaw(file);
          setGabunganRaw({ rawRows, fileName });

          const headerIdx = tebakanBarisHeader(rawRows);
          setBarisHeaderGabungan(headerIdx);

          _parseGabungan(rawRows, fileName, headerIdx);
        } catch (e) {
          setError(e.message || "Gagal membaca file data gabungan.");
        } finally {
          setLoadingGabungan(false);
        }
      }, 50);
    },
    [_parseGabungan]
  );

  // -- handler upload data pembanding --
  const handlePembandingFile = useCallback(
    async (file) => {
      setError("");
      setLoadingPembanding(true);

      // Delay 50ms agar React sempat merender state loading ke layar browser
      setTimeout(async () => {
        try {
          const { rawRows, fileName } = await readExcelFileRaw(file);
          setPembandingRaw({ rawRows, fileName });

          const headerIdx = tebakanBarisHeader(rawRows);
          setBarisHeaderPembanding(headerIdx);

          _parsePembanding(rawRows, fileName, headerIdx);

          const stem = file.name.replace(/\.(xlsx|xls)$/i, "");
          setNamaKolomBaru(stem);
        } catch (e) {
          setError(e.message || "Gagal membaca file pembanding.");
        } finally {
          setLoadingPembanding(false);
        }
      }, 50);
    },
    [_parsePembanding]
  );

  // -- user ubah baris header gabungan --
  const ubahBarisHeaderGabungan = useCallback(
    (index) => {
      setBarisHeaderGabungan(index);
      if (!gabunganRaw) return;
      _parseGabungan(gabunganRaw.rawRows, gabunganRaw.fileName, index);
    },
    [gabunganRaw, _parseGabungan]
  );

  // -- user ubah baris header pembanding --
  const ubahBarisHeaderPembanding = useCallback(
    (index) => {
      setBarisHeaderPembanding(index);
      if (!pembandingRaw) return;
      _parsePembanding(
        pembandingRaw.rawRows,
        pembandingRaw.fileName,
        index
      );
    },
    [pembandingRaw, _parsePembanding]
  );

  // -- navigasi ke langkah konfigurasi --
  const goToConfigure = useCallback(() => {
    setError("");
    if (!gabungan || !pembanding) {
      setError("Unggah kedua file terlebih dahulu.");
      return;
    }
    setStep(2);
  }, [gabungan, pembanding]);

  // -- toggle satu nilai status di checklist --
  const toggleStatus = useCallback((val) => {
    setStatusTerpilih((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  }, []);

  // -- ubah kolom status (reset checklist) --
  const ubahKolomStatus = useCallback((v) => {
    setKolomStatusPembanding(v);
    setStatusTerpilih(new Set());
  }, []);

  // -- jalankan proses pencocokan --
  const prosesData = useCallback(() => {
    setError("");
    if (!kolomNikGabungan || !kolomNikPembanding) {
      setError("Kolom NIK di kedua file wajib dipilih.");
      return;
    }
    if (!namaKolomBaru.trim()) {
      setError("Nama kolom baru tidak boleh kosong.");
      return;
    }

    const hasilPencocokan = cocokkanData({
      gabungan,
      pembanding,
      kolomNikGabungan,
      kolomNikPembanding,
      kolomNamaGabungan,
      kolomNamaPembanding,
      kolomStatusPembanding,
      statusTerpilih,
      namaKolomBaru,
    });

    setHasil(hasilPencocokan);
    setStep(3);
  }, [
    gabungan,
    pembanding,
    kolomNikGabungan,
    kolomNikPembanding,
    kolomNamaGabungan,
    kolomNamaPembanding,
    kolomStatusPembanding,
    statusTerpilih,
    namaKolomBaru,
  ]);

  // -- reset semua state ke awal --
  const reset = useCallback(() => {
    setStep(1);
    setGabunganRaw(null);
    setPembandingRaw(null);
    setBarisHeaderGabungan(0);
    setBarisHeaderPembanding(0);
    setGabungan(null);
    setPembanding(null);
    setError("");
    setKolomNikGabungan("");
    setKolomNamaGabungan("");
    setKolomNikPembanding("");
    setKolomNamaPembanding("");
    setKolomStatusPembanding("");
    setStatusTerpilih(new Set());
    setNamaKolomBaru("");
    setHasil(null);
  }, []);

  // -- download file hasil --
  const handleDownload = useCallback(() => {
    if (!hasil) return;
    downloadResultXlsx({
      hasilRows: hasil.rows,
      mismatchRows: hasil.mismatch,
      fileName: `hasil_${namaKolomBaru || "pencocokan"}.xlsx`,
    });
  }, [hasil, namaKolomBaru]);

  return {
    // state
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

    // action
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
  };
}
