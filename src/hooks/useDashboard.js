import { useMemo } from "react";
import { kolomProgramSesi } from "../utils/autoDetectColumns.js";
import { analisisLintasProgram } from "../utils/crossProgramAnalysis.js";

/**
 * Turunan data dashboard satu sesi. Kolom program = `sesi.kolomProgram`
 * (B2), dengan fallback deteksi otomatis untuk sesi lama.
 */
export function useDashboard(sesi) {
  return useMemo(() => {
    if (!sesi) return null;
    const programs = kolomProgramSesi(sesi);
    const k = sesi.konfigurasi || {};
    return {
      programs,
      ...analisisLintasProgram(sesi.dataHasil || [], programs, {
        kolomNik: k.kolomNikGabungan,
        kolomNama: k.kolomNamaGabungan,
        kolomKecamatan: k.kolomKecamatan,
      }),
    };
  }, [sesi]);
}
