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
 * @returns {Array<{nik: string, nama: string, programs: Record<string, number>, count: number}>}
 */
export function findDuplicateRecipients(
  rows,
  programColumns,
  kolomNik,
  kolomNama
) {
  const results = [];

  for (const row of rows) {
    const programs = {};
    let count = 0;

    for (const col of programColumns) {
      const val = Number(row[col]);
      programs[col] = val;
      if (val === 1) count++;
    }

    if (count > 1) {
      results.push({
        nik: String(row[kolomNik] || ""),
        nama: String(row[kolomNama] || ""),
        programs,
        count,
      });
    }
  }

  // Sort by count descending
  results.sort((a, b) => b.count - a.count);
  return results;
}

/**
 * Get per-program summary: total matched, not matched, excluded.
 *
 * @param {Array<Record<string, any>>} rows
 * @param {string[]} programColumns
 * @returns {Array<{program: string, cocok: number, tidak: number}>}
 */
export function programSummary(rows, programColumns) {
  return programColumns.map((col) => {
    let cocok = 0;
    let tidak = 0;
    for (const row of rows) {
      const val = Number(row[col]);
      if (val === 1) cocok++;
      else if (val === 2) tidak++;
    }
    return { program: col, cocok, tidak };
  });
}
