import { normalisasiNIK, normalisasiNama } from "./normalize.js";

/**
 * Ambil daftar nilai unik dari kolom status di data pembanding.
 * Dipakai untuk menampilkan checklist filter status di UI.
 *
 * @param {object[]} rows — baris data pembanding
 * @param {string} kolomStatus — nama kolom status yang dipilih user
 * @returns {string[]} nilai unik yang sudah di-sort
 */
export function nilaiStatusUnik(rows, kolomStatus) {
  if (!kolomStatus) return [];
  const set = new Set();
  rows.forEach((r) =>
    set.add(String(r[kolomStatus] ?? "").trim() || "(kosong)")
  );
  return Array.from(set).sort();
}

/**
 * Fungsi inti pencocokan data gabungan vs data pembanding berdasarkan NIK.
 *
 * Pure function: input data + konfigurasi → output hasil.
 * Tidak ada state React di sini, bisa ditest terpisah.
 *
 * @param {object} param
 * @param {object} param.gabungan — { rows, columns, fileName }
 * @param {object} param.pembanding — { rows, columns, fileName }
 * @param {string} param.kolomNikGabungan
 * @param {string} param.kolomNikPembanding
 * @param {string} param.kolomNamaGabungan — kosong = tidak pakai validasi nama
 * @param {string} param.kolomNamaPembanding — kosong = tidak pakai validasi nama
 * @param {string} param.kolomStatusPembanding — kosong = tidak pakai filter status
 * @param {Set<string>} param.statusTerpilih — nilai status yang dianggap valid
 * @param {string} param.namaKolomBaru — nama kolom baru di sheet hasil
 * @returns {{ rows: object[], mismatch: object[], total: number, cocok: number, tidak: number, dikecualikanStatus: number, useStatus: boolean }}
 */
export function cocokkanData({
  gabungan,
  pembanding,
  kolomNikGabungan,
  kolomNikPembanding,
  kolomNamaGabungan,
  kolomNamaPembanding,
  kolomStatusPembanding,
  statusTerpilih,
  namaKolomBaru,
}) {
  const useStatus =
    Boolean(kolomStatusPembanding) && statusTerpilih.size > 0;

  // Bangun index NIK → baris pembanding (ambil kemunculan pertama)
  const pembandingByNik = new Map();
  pembanding.rows.forEach((row) => {
    const nik = normalisasiNIK(row[kolomNikPembanding]);
    if (!nik) return;
    if (!pembandingByNik.has(nik)) {
      pembandingByNik.set(nik, row);
    }
  });

  const mismatch = [];
  let cocok = 0;
  let tidak = 0;
  let dikecualikanStatus = 0;

  const hasilRows = gabungan.rows.map((row) => {
    const nik = normalisasiNIK(row[kolomNikGabungan]);
    const match = nik ? pembandingByNik.get(nik) : undefined;

    // Cek status valid (jika filter status aktif)
    let statusValid = true;
    let statusLabel = "";
    if (match && useStatus) {
      const rawStatus =
        String(match[kolomStatusPembanding] ?? "").trim() || "(kosong)";
      statusLabel = rawStatus;
      statusValid = statusTerpilih.has(rawStatus);
    }

    const isCocok = Boolean(match) && statusValid;
    if (isCocok) cocok += 1;
    else tidak += 1;
    if (match && useStatus && !statusValid) dikecualikanStatus += 1;

    // Bangun keterangan
    let keterangan = "";
    if (!match) {
      keterangan = "NIK tidak ditemukan";
    } else if (useStatus && !statusValid) {
      keterangan = `NIK ditemukan, status "${statusLabel}" tidak dihitung`;
    } else if (match) {
      keterangan = "NIK ditemukan";
    }

    // Validasi silang nama (jika kolom nama dipilih)
    if (match && kolomNamaGabungan && kolomNamaPembanding) {
      const namaA = normalisasiNama(row[kolomNamaGabungan]);
      const namaB = normalisasiNama(match[kolomNamaPembanding]);
      if (namaA && namaB && namaA !== namaB) {
        mismatch.push({
          NIK: row[kolomNikGabungan],
          [`Nama (${gabungan.fileName})`]: row[kolomNamaGabungan],
          [`Nama (${pembanding.fileName})`]: match[kolomNamaPembanding],
        });
      }
    }

    return {
      ...row,
      [namaKolomBaru]: isCocok ? 1 : 2,
      Keterangan: keterangan,
    };
  });

  return {
    rows: hasilRows,
    mismatch,
    total: hasilRows.length,
    cocok,
    tidak,
    dikecualikanStatus,
    useStatus,
  };
}
