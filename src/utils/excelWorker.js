import * as XLSX from "xlsx";
import { normalisasiNIK, normalisasiNama } from "./normalize.js";

// State global worker untuk menyimpan data agar tidak perlu dikirim bolak-balik
let state = {
  gabunganRaw: null,
  pembandingRaw: null,
  gabunganFileName: "",
  pembandingFileName: "",

  parsedGabungan: null, // { rows, columns }
  parsedPembanding: null, // { rows, columns }

  // Untuk menyimpan temuan anomali sementara sebelum difinalisasi
  anomalies: {
    nameMismatches: [],
    invalidNiks: [],
  },

  // Konfigurasi kolom yang dikirim user
  config: null,
};

/**
 * Tebak baris mana yang berisi header kolom di data mentah.
 */
function tebakanBarisHeader(rawRows) {
  const batasanCek = Math.min(rawRows.length, 20);
  for (let i = 0; i < batasanCek; i++) {
    const row = rawRows[i];
    if (!row) continue;
    const nonKosong = row.filter((cell) => String(cell ?? "").trim() !== "");
    if (nonKosong.length < 2) continue;

    const adaTeksHeader = nonKosong.some((cell) => {
      const s = String(cell).trim();
      return s.length > 0 && s.length < 50 && isNaN(Number(s));
    });
    if (adaTeksHeader) return i;
  }
  return 0;
}

/**
 * Parse data mentah 2D menjadi array objek berdasarkan headerIdx.
 */
function parseWithBarisHeader(rawRows, barisHeader) {
  if (barisHeader >= rawRows.length) return { rows: [], columns: [] };

  const headerRow = rawRows[barisHeader];
  const columns = headerRow.map((h, i) => String(h ?? "").trim() || `Kolom ${i + 1}`);

  const rows = [];
  for (let i = barisHeader + 1; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const kosong =
      !raw ||
      raw.length === 0 ||
      raw.every((cell) => String(cell ?? "").trim() === "");
    if (kosong) continue;

    const obj = {};
    columns.forEach((col, j) => {
      const val = raw[j];
      if (val !== undefined && val !== null) {
        const valStr = String(val).trim();
        if (valStr !== "") {
          obj[col] = valStr;
        }
      }
    });
    rows.push(obj);
  }

  return { rows, columns };
}

/**
 * Deteksi NIK tidak standar:
 * - Kosong
 * - Panjang tidak sama dengan 16 digit
 * - Mengandung karakter selain angka (misal huruf)
 */
function deteksiNikTidakStandar(v) {
  const s = String(v ?? "").trim();
  if (s === "") return "NIK Kosong";
  if (/[^0-9]/.test(s.replace(/\.0$/, ""))) {
    return "Mengandung karakter non-numerik";
  }
  const clean = s.replace(/\.0$/, "").replace(/[^0-9]/g, "");
  if (clean.length !== 16) {
    return `Panjang NIK tidak standar (${clean.length} digit, seharusnya 16)`;
  }
  return null;
}

/**
 * Deteksi NIK yang muncul lebih dari sekali dalam satu file.
 * Berguna untuk transparansi: matching hanya memakai kemunculan pertama
 * per NIK (lihat pembandingByNik di SCAN_ANOMALIES/FINALIZE_MATCHING),
 * jadi baris duplikat lain bisa "tersasar" cocok dengan nama yang salah
 * tanpa disadari user kalau tidak ditampilkan di sini.
 */
function deteksiNikDuplikat(rows, kolomNik, kolomNama) {
  const grouped = new Map(); // nik -> [{ rowIdx, name }]
  rows.forEach((row, idx) => {
    const nik = normalisasiNIK(row[kolomNik]);
    if (!nik) return;
    if (!grouped.has(nik)) grouped.set(nik, []);
    grouped.get(nik).push({
      rowIdx: idx,
      name: kolomNama ? row[kolomNama] || "" : "",
    });
  });

  const duplikat = [];
  grouped.forEach((baris, nik) => {
    if (baris.length > 1) {
      duplikat.push({ nik, jumlah: baris.length, baris });
    }
  });
  return duplikat;
}

/**
 * Hitung lebar kolom otomatis untuk Excel.
 */
function hitungLebarKolom(rows) {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.slice(0, 200).map((r) => String(r[key] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 8), 45) };
  });
}

/**
 * Amankan angka panjang (NIK/No KK) agar tidak menjadi notasi ilmiah.
 */
function amankanAngkaPanjang(ws) {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) continue;
      if (cell.t === "n") {
        const str = String(cell.v);
        if (str.replace(/[.\-e+]/gi, "").length >= 12) {
          cell.t = "s";
          cell.v = str;
          delete cell.w;
          delete cell.z;
        }
      }
    }
  }
}

// Event handler untuk menerima pesan dari main thread
self.onmessage = async function (e) {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case "PARSE_FILE": {
        const { file, fileType } = payload;
        self.postMessage({ type: "PROGRESS", payload: { fileType, step: "reading", percent: 10 } });

        const arrayBuffer = await file.arrayBuffer();
        self.postMessage({ type: "PROGRESS", payload: { fileType, step: "parsing", percent: 40 } });

        const wb = XLSX.read(arrayBuffer, { type: "array" });
        self.postMessage({ type: "PROGRESS", payload: { fileType, step: "processing", percent: 70 } });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        // Potong baris kosong di akhir
        let akhir = rawRows.length - 1;
        while (akhir >= 0) {
          const row = rawRows[akhir];
          const kosong =
            !row ||
            row.length === 0 ||
            row.every((cell) => String(cell ?? "").trim() === "");
          if (!kosong) break;
          akhir--;
        }
        const trimmed = rawRows.slice(0, akhir + 1);

        if (trimmed.length === 0) {
          throw new Error("File tidak berisi data.");
        }

        if (fileType === "gabungan") {
          state.gabunganRaw = trimmed;
          state.gabunganFileName = file.name;
        } else {
          state.pembandingRaw = trimmed;
          state.pembandingFileName = file.name;
        }

        const guessedHeaderIdx = tebakanBarisHeader(trimmed);

        self.postMessage({
          type: "PARSE_SUCCESS",
          payload: {
            fileType,
            previewRows: trimmed.slice(0, 100), // Kirim 100 baris pertama untuk preview
            totalRows: trimmed.length,
            fileName: file.name,
            guessedHeaderIdx,
          },
        });
        break;
      }

      case "SET_HEADER_ROW": {
        const { fileType, headerIdx } = payload;
        const rawRows = fileType === "gabungan" ? state.gabunganRaw : state.pembandingRaw;
        const fileName = fileType === "gabungan" ? state.gabunganFileName : state.pembandingFileName;

        if (!rawRows) {
          throw new Error(`Data ${fileType} belum diunggah.`);
        }

        const { rows, columns } = parseWithBarisHeader(rawRows, headerIdx);

        if (fileType === "gabungan") {
          state.parsedGabungan = { rows, columns, fileName };
        } else {
          state.parsedPembanding = { rows, columns, fileName };
        }

        self.postMessage({
          type: "HEADER_SUCCESS",
          payload: {
            fileType,
            columns,
            totalRows: rows.length,
          },
        });
        break;
      }

      case "VALIDATE_DATA": {
        const { target, kolomNik } = payload || e.data || {};
        const parsed = target === "gabungan" ? state.parsedGabungan : state.parsedPembanding;
        const rows = parsed?.rows || (Array.isArray(parsed) ? parsed : null);

        if (!rows || !kolomNik) {
          self.postMessage({
            type: "VALIDATION_RESULT",
            target,
            result: null,
            payload: { target, result: null },
          });
          break;
        }

        const nikCount = new Map();
        let barisKosong = 0;
        let nikKosong = 0;
        let nikNonStandar = 0;
        let totalValid = 0;

        for (const row of rows) {
          const values = Object.values(row);
          const allEmpty = values.every(
            (v) => v === undefined || v === null || String(v).trim() === ""
          );
          if (allEmpty) {
            barisKosong++;
            continue;
          }

          const rawNik = row[kolomNik];
          if (rawNik === undefined || rawNik === null || String(rawNik).trim() === "") {
            nikKosong++;
            continue;
          }

          const nik = normalisasiNIK(rawNik);
          if (nik.length !== 16 || /[^0-9]/.test(nik)) {
            nikNonStandar++;
          } else {
            totalValid++;
          }
          nikCount.set(nik, (nikCount.get(nik) || 0) + 1);
        }

        const duplikatNik = [];
        for (const [nik, count] of nikCount) {
          if (count > 1 && nik.length > 0) {
            duplikatNik.push({ nik, jumlah: count });
          }
        }
        duplikatNik.sort((a, b) => b.jumlah - a.jumlah);

        const result = {
          totalBaris: rows.length,
          barisKosong,
          nikKosong,
          nikNonStandar,
          totalValid,
          duplikatNik: duplikatNik.slice(0, 100),
          persenNonStandar:
            rows.length > 0
              ? ((nikNonStandar / (rows.length - barisKosong)) * 100).toFixed(1)
              : "0",
        };

        self.postMessage({
          type: "VALIDATION_RESULT",
          target,
          result,
          payload: {
            target,
            result,
          },
        });
        break;
      }

      case "GET_UNIQUE_VALUES": {
        const { columnName } = payload;
        if (!state.parsedPembanding || !state.parsedPembanding.rows) {
          throw new Error("Data pembanding belum di-parse.");
        }
        const set = new Set();
        state.parsedPembanding.rows.forEach((r) => {
          set.add(String(r[columnName] ?? "").trim() || "(kosong)");
        });
        const values = Array.from(set).sort();
        self.postMessage({
          type: "UNIQUE_VALUES_SUCCESS",
          payload: {
            columnName,
            values,
          },
        });
        break;
      }


      case "SCAN_ANOMALIES": {
        const { config } = payload;
        state.config = config;

        const {
          kolomNikGabungan,
          kolomNikPembanding,
          kolomNamaGabungan,
          kolomNamaPembanding,
          kolomStatusPembanding,
          statusTerpilih,
        } = config;

        const statusSet = new Set(statusTerpilih);
        const useStatus = Boolean(kolomStatusPembanding) && statusSet.size > 0;

        self.postMessage({ type: "PROGRESS", payload: { step: "indexing", percent: 10 } });

        // Index pembanding
        const pembandingByNik = new Map();
        state.parsedPembanding.rows.forEach((row, idx) => {
          const nik = normalisasiNIK(row[kolomNikPembanding]);
          if (!nik) return;
          if (!pembandingByNik.has(nik)) {
            pembandingByNik.set(nik, { row, idx });
          }
        });

        self.postMessage({ type: "PROGRESS", payload: { step: "scanning", percent: 40 } });

        const nameMismatches = [];
        const invalidNiks = [];

        // Scan gabungan
        const totalRows = state.parsedGabungan.rows.length;
        const checkInterval = Math.max(1, Math.floor(totalRows / 10));

        state.parsedGabungan.rows.forEach((row, idx) => {
          if (idx % checkInterval === 0) {
            const percent = 40 + Math.floor((idx / totalRows) * 40);
            self.postMessage({ type: "PROGRESS", payload: { step: "scanning", percent } });
          }

          const rawNik = row[kolomNikGabungan] || "";
          const nik = normalisasiNIK(rawNik);

          // 1. Deteksi NIK tidak standar
          const nikError = deteksiNikTidakStandar(rawNik);
          if (nikError) {
            invalidNiks.push({
              id: `inv-${idx}`,
              nikRaw: rawNik,
              nikNormalized: nik,
              name: kolomNamaGabungan ? row[kolomNamaGabungan] || "" : "(kolom nama tidak dipilih)",
              rowIdx: idx,
              reason: nikError,
            });
          }

          // 2. Deteksi perbedaan nama (jika NIK valid & ditemukan)
          if (nik && !nikError) {
            const matchData = pembandingByNik.get(nik);
            if (matchData) {
              const matchRow = matchData.row;
              
              // Cek status filter dulu, jika status valid baru kita cek nama
              let statusValid = true;
              if (useStatus) {
                const rawStatus = String(matchRow[kolomStatusPembanding] ?? "").trim() || "(kosong)";
                statusValid = statusSet.has(rawStatus);
              }

              if (statusValid && kolomNamaGabungan && kolomNamaPembanding) {
                const namaA = normalisasiNama(row[kolomNamaGabungan]);
                const namaB = normalisasiNama(matchRow[kolomNamaPembanding]);
                if (namaA && namaB && namaA !== namaB) {
                  nameMismatches.push({
                    id: `nm-${idx}`,
                    nik: nik,
                    nameGabungan: row[kolomNamaGabungan],
                    namePembanding: matchRow[kolomNamaPembanding],
                    rowIdxGabungan: idx,
                  });
                }
              }
            }
          }
        });

        // 3. Deteksi NIK duplikat (di gabungan maupun pembanding)
        const duplicateNiks = [
          ...deteksiNikDuplikat(
            state.parsedGabungan.rows,
            kolomNikGabungan,
            kolomNamaGabungan
          ).map((d) => ({ ...d, id: `dupg-${d.nik}`, file: "gabungan" })),
          ...deteksiNikDuplikat(
            state.parsedPembanding.rows,
            kolomNikPembanding,
            kolomNamaPembanding
          ).map((d) => ({ ...d, id: `dupp-${d.nik}`, file: "pembanding" })),
        ];

        state.anomalies = { nameMismatches, invalidNiks, duplicateNiks };

        self.postMessage({
          type: "ANOMALIES_FOUND",
          payload: {
            nameMismatches,
            invalidNiks,
            duplicateNiks,
            hasAnomalies:
              nameMismatches.length > 0 ||
              invalidNiks.length > 0 ||
              duplicateNiks.length > 0,
          },
        });
        break;
      }

      case "FINALIZE_MATCHING": {
        const { resolutions } = payload;
        const config = state.config;

        const {
          kolomNikGabungan,
          kolomNikPembanding,
          kolomNamaGabungan,
          kolomNamaPembanding,
          kolomStatusPembanding,
          statusTerpilih,
          namaKolomBaru,
        } = config;

        const statusSet = new Set(statusTerpilih);
        const useStatus = Boolean(kolomStatusPembanding) && statusSet.size > 0;

        self.postMessage({ type: "PROGRESS", payload: { step: "finalizing", percent: 10 } });

        // Index pembanding
        const pembandingByNik = new Map();
        state.parsedPembanding.rows.forEach((row) => {
          const nik = normalisasiNIK(row[kolomNikPembanding]);
          if (!nik) return;
          if (!pembandingByNik.has(nik)) {
            pembandingByNik.set(nik, row);
          }
        });

        // Map resolutions untuk O(1) check
        const resNameMismatch = resolutions?.nameMismatches || {};
        const resInvalidNik = resolutions?.invalidNiks || {};

        const mismatch = [];
        let cocok = 0;
        let tidak = 0;
        let dikecualikanStatus = 0;

        const totalRows = state.parsedGabungan.rows.length;
        const checkInterval = Math.max(1, Math.floor(totalRows / 10));

        const finalRows = state.parsedGabungan.rows.map((row, idx) => {
          if (idx % checkInterval === 0) {
            const percent = 10 + Math.floor((idx / totalRows) * 50);
            self.postMessage({ type: "PROGRESS", payload: { step: "finalizing", percent } });
          }

          const rawNik = row[kolomNikGabungan];
          const nik = normalisasiNIK(rawNik);

          // Cek apakah NIK ini dideklarasikan sebagai invalid oleh scanning sebelumnya
          const invalidNikId = `inv-${idx}`;
          const isInvalidDeclared = resInvalidNik.hasOwnProperty(invalidNikId);
          const invalidResolution = isInvalidDeclared ? resInvalidNik[invalidNikId] : null;

          // 1. Check if user chose to ignore this invalid NIK
          if (isInvalidDeclared && invalidResolution === "abaikan") {
            tidak += 1;
            return {
              ...row,
              [namaKolomBaru]: 2,
              Keterangan: "Format NIK tidak valid - Diabaikan",
            };
          }

          // Cari kecocokan
          const match = nik ? pembandingByNik.get(nik) : undefined;

          // Check status valid
          let statusValid = true;
          let statusLabel = "";
          if (match && useStatus) {
            const rawStatus = String(match[kolomStatusPembanding] ?? "").trim() || "(kosong)";
            statusLabel = rawStatus;
            statusValid = statusSet.has(rawStatus);
          }

          // Cek apakah ada resolusi perbedaan nama untuk baris ini
          const nameMismatchId = `nm-${idx}`;
          const hasNameMismatchRes = resNameMismatch.hasOwnProperty(nameMismatchId);
          const nameMismatchResolution = hasNameMismatchRes ? resNameMismatch[nameMismatchId] : null;

          let isCocok = false;
          let keterangan = "";

          if (!match) {
            keterangan = "NIK tidak ditemukan";
          } else if (useStatus && !statusValid) {
            keterangan = `NIK ditemukan, status "${statusLabel}" tidak dihitung`;
            dikecualikanStatus += 1;
          } else {
            // NIK cocok dan status valid, sekarang check perbedaan nama
            if (hasNameMismatchRes) {
              if (nameMismatchResolution === "valid") {
                isCocok = true;
                keterangan = "NIK ditemukan (Nama disetujui)";
              } else {
                isCocok = false;
                keterangan = "NIK ditemukan (Nama berbeda ditolak)";
              }
            } else {
              isCocok = true;
              keterangan = "NIK ditemukan";
            }
          }

          if (isCocok) cocok += 1;
          else tidak += 1;

          // Tambahkan ke log mismatch nama di sheet excel jika nama berbeda
          if (match && kolomNamaGabungan && kolomNamaPembanding) {
            const namaA = normalisasiNama(row[kolomNamaGabungan]);
            const namaB = normalisasiNama(match[kolomNamaPembanding]);
            if (namaA && namaB && namaA !== namaB) {
              // Status persetujuan
              let statusPersetujuan = "Perlu Konfirmasi";
              if (hasNameMismatchRes) {
                statusPersetujuan = nameMismatchResolution === "valid" ? "Divalidkan (Disetujui)" : "Abaikan (Ditolak)";
              }

              mismatch.push({
                NIK: row[kolomNikGabungan],
                [`Nama (${state.gabunganFileName})`]: row[kolomNamaGabungan],
                [`Nama (${state.pembandingFileName})`]: match[kolomNamaPembanding],
                "Keputusan User": statusPersetujuan,
              });
            }
          }

          return {
            ...row,
            [namaKolomBaru]: isCocok ? 1 : 2,
            Keterangan: keterangan,
          };
        });

        // Collect keterangan distribution & dataHasil
        const keteranganDistribusi = {};
        const dataHasil = [];
        for (const row of finalRows) {
          dataHasil.push({ ...row });
          const ket = row["Keterangan"] || "Lainnya";
          keteranganDistribusi[ket] = (keteranganDistribusi[ket] || 0) + 1;
        }

        // Collect mismatch log
        const mismatchLog = [];
        if (mismatch && mismatch.length > 0) {
          for (const m of mismatch) {
            mismatchLog.push({ ...m });
          }
        }

        const kolomTersedia =
          finalRows.length > 0 ? Object.keys(finalRows[0]) : [];

        // 3. Generate XLSX
        self.postMessage({ type: "PROGRESS", payload: { step: "writing_excel", percent: 70 } });

        const wb = XLSX.utils.book_new();

        // Sheet "Hasil"
        const wsHasil = XLSX.utils.json_to_sheet(finalRows);
        wsHasil["!cols"] = hitungLebarKolom(finalRows);
        amankanAngkaPanjang(wsHasil);
        XLSX.utils.book_append_sheet(wb, wsHasil, "Hasil");

        // Sheet "Validasi Nama" (jika ada mismatch)
        if (mismatch.length > 0) {
          const wsLog = XLSX.utils.json_to_sheet(mismatch);
          wsLog["!cols"] = hitungLebarKolom(mismatch);
          amankanAngkaPanjang(wsLog);
          XLSX.utils.book_append_sheet(wb, wsLog, "Validasi Nama");
        }

        self.postMessage({ type: "PROGRESS", payload: { step: "compressing", percent: 85 } });

        const excelBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
          compression: true,
        });

        self.postMessage({ type: "PROGRESS", payload: { step: "done", percent: 100 } });

        // Kirim hasil kembali ke main thread
        self.postMessage(
          {
            type: "MATCHING_SUCCESS",
            payload: {
              summary: {
                total: finalRows.length,
                cocok,
                tidak,
                dikecualikanStatus,
                useStatus,
                mismatch: mismatch.slice(0, 8), // Kirim 8 baris pertama untuk preview
                totalMismatch: mismatch.length,
              },
              excelBuffer,
              dataHasil,
              keteranganDistribusi,
              mismatchLog,
              kolomTersedia,
            },
            total: finalRows.length,
            cocok,
            tidak,
            dikecualikanStatus,
            useStatus,
            mismatch: mismatch.slice(0, 8),
            totalMismatch: mismatch.length,
            excelBuffer,
            dataHasil,
            keteranganDistribusi,
            mismatchLog,
            kolomTersedia,
          },
          [excelBuffer] // Transferable ArrayBuffer
        );
        break;
      }

      default:
        throw new Error(`Tipe event tidak dikenali: ${type}`);
    }
  } catch (err) {
    self.postMessage({
      type: "ERROR",
      payload: { message: err.message || "Terjadi kesalahan internal pada Web Worker" },
    });
  }
};
