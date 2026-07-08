/**
 * Normalisasi nilai NIK agar bisa dicocokkan secara konsisten.
 * - Buang spasi di awal/akhir
 * - Buang notasi desimal ".0" yang muncul akibat Excel membaca NIK sebagai angka
 * - Hanya sisakan digit (buang titik, spasi, strip, dll)
 *
 * @param {*} v — nilai mentah dari cell Excel
 * @returns {string} NIK yang sudah dinormalisasi (hanya digit)
 */
export function normalisasiNIK(v) {
  let s = String(v ?? "").trim();
  s = s.replace(/\.0$/, "");
  s = s.replace(/[^0-9]/g, "");
  return s;
}

/**
 * Normalisasi nama untuk perbandingan (validasi silang).
 * - Uppercase
 * - Rapikan spasi ganda jadi satu
 *
 * @param {*} v — nilai mentah dari cell Excel
 * @returns {string} Nama yang sudah dinormalisasi
 */
export function normalisasiNama(v) {
  let s = String(v ?? "").trim().toUpperCase();
  s = s.replace(/\s+/g, " ");
  return s;
}
