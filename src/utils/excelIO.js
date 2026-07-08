import * as XLSX from "xlsx";

/**
 * Tebak kolom yang paling cocok dari daftar header berdasarkan kata kunci.
 * Dipakai untuk default dropdown pemetaan kolom (NIK, Nama).
 *
 * @param {string[]} columns — daftar nama kolom dari file Excel
 * @param {string[]} keywords — kata kunci yang dicari (lowercase)
 * @returns {string} nama kolom yang cocok, atau kolom pertama jika tidak ada
 */
export function guessColumn(columns, keywords) {
  const lower = columns.map((c) => c.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex((c) => c.includes(kw));
    if (idx !== -1) return columns[idx];
  }
  return columns[0] || "";
}

/**
 * Baca file .xlsx/.xls sebagai array 2D mentah (tanpa asumsi baris header).
 * Baris kosong di bagian akhir (akibat "used range" Excel yang bengkak)
 * otomatis dipotong.
 *
 * @param {File} file — objek File dari input[type=file]
 * @returns {Promise<{rawRows: Array<Array<string>>, fileName: string}>}
 */
export function readExcelFileRaw(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        // header: 1 → hasilnya array 2D, bukan array objek
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        // Potong baris kosong di akhir (used range bloat)
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

        resolve({ rawRows: trimmed, fileName: file.name });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Tebak baris mana yang berisi header kolom di data mentah.
 *
 * Heuristik: cari baris pertama (dari 20 baris awal) yang punya
 * ≥2 cell non-kosong DAN setidaknya satu cell berisi teks pendek
 * (bukan angka murni). Ini membedakan baris header dari baris judul
 * panjang atau baris data.
 *
 * @param {Array<Array<string>>} rawRows — data mentah 2D
 * @returns {number} indeks baris header (0-based)
 */
export function tebakanBarisHeader(rawRows) {
  const batasanCek = Math.min(rawRows.length, 20);
  for (let i = 0; i < batasanCek; i++) {
    const row = rawRows[i];
    if (!row) continue;
    const nonKosong = row.filter(
      (cell) => String(cell ?? "").trim() !== ""
    );
    if (nonKosong.length < 2) continue;

    // Cek apakah ada cell yang terlihat seperti nama kolom
    // (teks pendek, bukan angka murni)
    const adaTeksHeader = nonKosong.some((cell) => {
      const s = String(cell).trim();
      return s.length > 0 && s.length < 50 && isNaN(Number(s));
    });
    if (adaTeksHeader) return i;
  }
  return 0;
}

/**
 * Parse data mentah 2D menjadi array objek menggunakan baris tertentu
 * sebagai header. Baris sebelum header diabaikan. Baris kosong setelah
 * header dilewati (efek sama dengan blankrows: false).
 *
 * @param {Array<Array<string>>} rawRows — data mentah 2D
 * @param {number} barisHeader — indeks baris header (0-based)
 * @returns {{ rows: object[], columns: string[] }}
 */
export function parseWithBarisHeader(rawRows, barisHeader) {
  if (barisHeader >= rawRows.length) return { rows: [], columns: [] };

  // Bangun nama kolom dari baris header
  const headerRow = rawRows[barisHeader];
  const columns = headerRow.map((h, i) =>
    String(h ?? "").trim() || `Kolom ${i + 1}`
  );

  // Parse baris data (setelah header)
  const rows = [];
  for (let i = barisHeader + 1; i < rawRows.length; i++) {
    const raw = rawRows[i];
    // Lewati baris kosong
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
 * Hitung lebar kolom otomatis berdasarkan isi data.
 * Cek sampai 200 baris pertama untuk efisiensi.
 *
 * @param {object[]} rows
 * @returns {Array<{wch: number}>}
 */
function hitungLebarKolom(rows) {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.slice(0, 200).map((r) => String(r[key] ?? "").length)
    );
    // Minimal 8 karakter, maksimal 45 karakter
    return { wch: Math.min(Math.max(maxLen + 2, 8), 45) };
  });
}

/**
 * Amankan angka panjang (≥12 digit, seperti NIK/No KK) di worksheet
 * agar tidak ditampilkan sebagai notasi ilmiah di Excel.
 *
 * json_to_sheet otomatis mendeteksi string "3507012345670001" sebagai
 * angka, yang bisa rusak karena melebihi Number.MAX_SAFE_INTEGER.
 * Fungsi ini memaksa cell-cell tersebut jadi tipe teks.
 *
 * @param {object} ws — worksheet SheetJS
 */
function amankanAngkaPanjang(ws) {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    // skip header
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) continue;
      // Jika cell bertipe angka dan panjang digit ≥ 12, paksa jadi teks
      if (cell.t === "n") {
        const str = String(cell.v);
        if (str.replace(/[.\-e+]/gi, "").length >= 12) {
          cell.t = "s";
          cell.v = str;
          delete cell.w; // hapus cache formatted value
          delete cell.z; // hapus format number
        }
      }
    }
  }
}

/**
 * Generate file .xlsx hasil pencocokan dan trigger download di browser.
 * Sheet "Hasil" berisi data gabungan + kolom baru + keterangan.
 * Sheet "Validasi Nama" (opsional) berisi daftar NIK dengan nama beda.
 *
 * Perbaikan:
 * - Manual Blob download → nama file terjaga (bukan UUID)
 * - Auto lebar kolom → format rapi saat dibuka di Excel
 * - Amankan angka panjang → NIK tidak jadi notasi ilmiah
 * - compression: true → ukuran file wajar
 *
 * @param {{ hasilRows: object[], mismatchRows: object[], fileName: string }} param
 */
export function downloadResultXlsx({ hasilRows, mismatchRows, fileName }) {
  const wb = XLSX.utils.book_new();

  // Sheet "Hasil"
  const wsHasil = XLSX.utils.json_to_sheet(hasilRows);
  wsHasil["!cols"] = hitungLebarKolom(hasilRows);
  amankanAngkaPanjang(wsHasil);
  XLSX.utils.book_append_sheet(wb, wsHasil, "Hasil");

  // Sheet "Validasi Nama" (jika ada mismatch)
  if (mismatchRows.length > 0) {
    const wsLog = XLSX.utils.json_to_sheet(mismatchRows);
    wsLog["!cols"] = hitungLebarKolom(mismatchRows);
    amankanAngkaPanjang(wsLog);
    XLSX.utils.book_append_sheet(wb, wsLog, "Validasi Nama");
  }

  // Manual Blob download — paksa browser mengunduh dengan application/octet-stream
  // dan tunda pelepasan URL agar download tidak terputus.
  const data = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });
  const blob = new Blob([data], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Tunda penghapusan object URL agar browser sempat memulai proses download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

