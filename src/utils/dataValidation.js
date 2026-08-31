import { normalisasiNIK } from "./normalize.js";

/**
 * Validate data quality for a parsed dataset.
 * @param {Array<Object>} rows - Parsed row objects
 * @param {string} kolomNik - NIK column name
 * @returns {Object} Validation report
 */
export function validateData(rows, kolomNik) {
  const nikCount = new Map();
  let barisKosong = 0;
  let nikKosong = 0;
  let nikNonStandar = 0;
  let totalValid = 0;

  for (const row of rows) {
    // Check empty rows (all values empty)
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

    // Check non-standard NIK
    if (nik.length !== 16 || /[^0-9]/.test(nik)) {
      nikNonStandar++;
    } else {
      totalValid++;
    }

    // Count duplicates
    nikCount.set(nik, (nikCount.get(nik) || 0) + 1);
  }

  // Collect duplicate NIKs
  const duplikatNik = [];
  for (const [nik, count] of nikCount) {
    if (count > 1 && nik.length > 0) {
      duplikatNik.push({ nik, jumlah: count });
    }
  }
  duplikatNik.sort((a, b) => b.jumlah - a.jumlah);

  return {
    totalBaris: rows.length,
    barisKosong,
    nikKosong,
    nikNonStandar,
    totalValid,
    duplikatNik,
    persenNonStandar:
      rows.length > 0
        ? ((nikNonStandar / (rows.length - barisKosong)) * 100).toFixed(1)
        : "0",
  };
}
