/**
 * Build a cross-program overlap matrix.
 * matrix[i][j] = number of rows where both program i and program j have value 1.
 *
 * @param {Array<Record<string, any>>} rows
 * @param {string[]} programColumns - Column names of detected programs
 * @returns {{ matrix: number[][], programs: string[] }}
 */
export function buildCrossMatrix(rows, programColumns) {
  const n = programColumns.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (const row of rows) {
    for (let i = 0; i < n; i++) {
      const valI = Number(row[programColumns[i]]);
      if (valI !== 1) continue;

      for (let j = i; j < n; j++) {
        const valJ = Number(row[programColumns[j]]);
        if (valJ === 1) {
          matrix[i][j]++;
          if (i !== j) matrix[j][i]++;
        }
      }
    }
  }

  return { matrix, programs: programColumns };
}

/**
 * Find rows that are matched (value=1) in more than one program.
 *
 * @param {Array<Record<string, any>>} rows
 * @param {string[]} programColumns
 * @param {string} kolomNik - NIK column name
 * @param {string} kolomNama - Nama column name
 * @param {string} [kolomKecamatan] - Kecamatan column name (opsional)
 * @returns {Array<{nik: string, nama: string, kecamatan: string, programs: Record<string, number>, diterima: string[], count: number}>}
 */
export function findDuplicateRecipients(
  rows,
  programColumns,
  kolomNik,
  kolomNama,
  kolomKecamatan = ""
) {
  const results = [];

  for (const row of rows) {
    const programs = {};
    const diterima = [];

    for (const col of programColumns) {
      const val = Number(row[col]);
      programs[col] = val;
      if (val === 1) diterima.push(col);
    }

    if (diterima.length > 1) {
      results.push({
        nik: String(row[kolomNik] || ""),
        nama: String(row[kolomNama] || ""),
        kecamatan: kolomKecamatan ? String(row[kolomKecamatan] ?? "").trim() : "",
        programs,
        diterima,
        count: diterima.length,
      });
    }
  }

  // Sort by count descending
  results.sort((a, b) => b.count - a.count);
  return results;
}

/**
 * Semua angka dashboard lintas program dalam satu kali jalan.
 * `urutan` = program diurutkan dari penerima terbanyak; daftar lain mengikuti urutan ini.
 *
 * @returns {{
 *   urutan: string[], penerima: Record<string, number>,
 *   perNik: number[],                    // [0, 1, 2, 3+ program]
 *   fokus: Record<string, number[]>,     // per program: [hanya itu, +1 lain, +2 lain atau lebih]
 *   matrix: number[][],
 *   kombinasi: Array<{programs: string[], n: number}>,  // ≥2 program, terbanyak dulu
 *   kecamatan: null | { daftar: string[], jumlah: Record<string, Record<string, number>>, tanpa: number, tanpaPer: Record<string, number> },
 *   ganda: ReturnType<typeof findDuplicateRecipients>,
 * }}
 */
export function analisisLintasProgram(rows = [], programs = [], { kolomNik, kolomNama, kolomKecamatan } = {}) {
  const penerima = Object.fromEntries(programs.map((p) => [p, 0]));
  for (const row of rows) for (const p of programs) if (Number(row[p]) === 1) penerima[p]++;
  const urutan = [...programs].sort((a, b) => penerima[b] - penerima[a]);

  const perNik = [0, 0, 0, 0];
  const fokus = Object.fromEntries(urutan.map((p) => [p, [0, 0, 0]]));
  const kombinasiMap = new Map();
  const kec = kolomKecamatan ? { jumlah: {}, tanpa: 0, tanpaPer: Object.fromEntries(urutan.map((p) => [p, 0])) } : null;

  for (const row of rows) {
    const diterima = urutan.filter((p) => Number(row[p]) === 1);
    const k = diterima.length;
    perNik[Math.min(k, 3)]++;
    if (k === 0) continue;
    for (const p of diterima) fokus[p][Math.min(k - 1, 2)]++;
    if (k >= 2) {
      const key = diterima.join("\u0000");
      kombinasiMap.set(key, (kombinasiMap.get(key) || 0) + 1);
    }
    if (kec) {
      const nama = String(row[kolomKecamatan] ?? "").trim();
      if (!nama) {
        kec.tanpa++;
        for (const p of diterima) kec.tanpaPer[p]++;
        continue;
      }
      const baris = (kec.jumlah[nama] ??= Object.fromEntries(urutan.map((p) => [p, 0])));
      for (const p of diterima) baris[p]++;
    }
  }

  if (kec) kec.daftar = Object.keys(kec.jumlah).sort((a, b) => a.localeCompare(b, "id-ID"));

  const kombinasi = [...kombinasiMap]
    .map(([key, n]) => ({ programs: key.split("\u0000"), n }))
    .sort((a, b) => b.n - a.n);

  return {
    urutan,
    penerima,
    perNik,
    fokus,
    matrix: buildCrossMatrix(rows, urutan).matrix,
    kombinasi,
    kecamatan: kec,
    ganda: findDuplicateRecipients(rows, urutan, kolomNik, kolomNama, kolomKecamatan),
  };
}
