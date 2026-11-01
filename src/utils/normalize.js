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

/**
 * Samarkan NIK untuk tampilan: 6 digit + •••••• + 4 digit. Berlaku untuk semua
 * nilai berisi angka (boleh diselingi spasi, titik, strip) sepanjang 12 digit atau lebih (termasuk NIK yang panjangnya
 * salah dan No KK). Nilai lain dikembalikan apa adanya.
 */
export function samarkanNIK(v) {
  const s = String(v ?? "").trim();
  // Angka boleh diselingi spasi, titik, strip, atau diawali petik (NIK teks dari Excel).
  if (!/^'?[\d\s.-]+$/.test(s)) return s;
  const d = normalisasiNIK(s);
  return d.length >= 12 ? `${d.slice(0, 6)}••••••${d.slice(-4)}` : s;
}

/** Kunci pembanding nama kecamatan: tanpa awalan "Kec."/"Kecamatan", huruf besar, tanpa spasi, "-", "_", ".". */
export function kunciKecamatan(nama) {
  return String(nama ?? "")
    .trim()
    .replace(/^kec(amatan)?\b\.?/i, "")
    .toUpperCase()
    .replace(/[\s\-_.]/g, "");
}

/** Kecamatan resmi Kota Batu (Kemendagri). */
export const KECAMATAN_RESMI = ["Batu", "Bumiaji", "Junrejo"];

function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Nama resmi untuk tulisan kecamatan yang mirip (salah ketik ringan: jarak ≤2 untuk nama ≥7 huruf,
 * ≤1 untuk yang lebih pendek). "" kalau tidak ada yang mirip.
 * ponytail: nama luar Kota Batu yang mirip (mis. "Batur") ikut tergabung, batasan yang diterima pemilik.
 */
export function labelKecamatan(nama) {
  const kunci = kunciKecamatan(nama);
  if (!kunci) return "";
  return (
    KECAMATAN_RESMI.find((r) => levenshtein(kunci, r.toUpperCase()) <= (r.length >= 7 ? 2 : 1)) || ""
  );
}

/**
 * Pemberi label kecamatan untuk satu analisis: nama resmi kalau mirip, kalau tidak ejaan pertama
 * yang ditemui untuk kuncinya. "" kalau kosong (termasuk sel yang hanya berisi "Kecamatan").
 */
export function buatLabelKecamatan() {
  const perKunci = {};
  return (nama) => {
    const kunci = kunciKecamatan(nama);
    if (!kunci) return "";
    return labelKecamatan(nama) || (perKunci[kunci] ??= String(nama).trim());
  };
}
