/**
 * Detect columns that are likely program/matching result columns.
 * A column is detected as a "program column" if >80% of its non-empty values
 * are 1 or 2 (as number or string).
 *
 * @param {Array<Record<string, any>>} rows - Data rows
 * @param {string} excludeColumn - Column to exclude (current session's result column)
 * @returns {string[]} Array of detected program column names
 */
export function detectProgramColumns(rows, excludeColumn = "") {
  if (!rows || rows.length === 0) return [];

  const columns = Object.keys(rows[0]);
  const programColumns = [];

  for (const col of columns) {
    if (col === excludeColumn) continue;
    if (col === "Keterangan") continue;

    let nonEmpty = 0;
    let matchCount = 0;

    for (const row of rows) {
      const val = row[col];
      if (val === undefined || val === null || String(val).trim() === "") continue;

      nonEmpty++;
      const num = Number(val);
      if (num === 1 || num === 2) {
        matchCount++;
      }
    }

    // Must have at least 10 non-empty values and >80% are 1 or 2
    if (nonEmpty >= 10 && matchCount / nonEmpty > 0.8) {
      programColumns.push(col);
    }
  }

  return programColumns;
}

/**
 * Kolom program di file hasil satu sesi. Sesi baru menyimpan `kolomProgram`;
 * sesi lama belum, jadi ditebak dari isi data (perilaku lama).
 */
export function kolomProgramSesi(sesi) {
  if (Array.isArray(sesi?.kolomProgram)) return sesi.kolomProgram;
  const kolom = detectProgramColumns(sesi?.dataHasil || [], sesi?.namaKolomBaru);
  return sesi?.namaKolomBaru ? [...kolom, sesi.namaKolomBaru] : kolom;
}

/** "A, B dan C" untuk ≤3 nama, "A sampai G" kalau lebih. */
export function ringkasDaftar(nama = []) {
  if (nama.length <= 1) return nama.join("");
  if (nama.length > 3) return `${nama[0]} sampai ${nama[nama.length - 1]}`;
  return `${nama.slice(0, -1).join(", ")} dan ${nama[nama.length - 1]}`;
}
