import { useMemo } from "react";
import { detectProgramColumns } from "../utils/autoDetectColumns.js";
import {
  buildCrossMatrix,
  findDuplicateRecipients,
  programSummary,
} from "../utils/crossProgramAnalysis.js";

/**
 * Process dashboard data from matching results.
 *
 * @param {Object} params
 * @param {Array<Record<string, any>>} params.dataHasil
 * @param {string} params.namaKolomBaru
 * @param {string} params.kolomNik
 * @param {string} params.kolomNama
 * @param {Object} params.keteranganDistribusi
 */
export function useDashboard({
  dataHasil,
  namaKolomBaru,
  kolomNik,
  kolomNama,
  keteranganDistribusi,
}) {
  const kolomProgram = useMemo(() => {
    if (!dataHasil || dataHasil.length === 0) return [];
    return detectProgramColumns(dataHasil, namaKolomBaru);
  }, [dataHasil, namaKolomBaru]);

  const hasCrossProgram = kolomProgram.length > 0;

  const crossMatrix = useMemo(() => {
    if (!hasCrossProgram || !dataHasil) return null;
    // Include current column in matrix analysis
    const allPrograms = [...kolomProgram, namaKolomBaru].filter(Boolean);
    return buildCrossMatrix(dataHasil, allPrograms);
  }, [dataHasil, kolomProgram, namaKolomBaru, hasCrossProgram]);

  const penerimaGanda = useMemo(() => {
    if (!hasCrossProgram || !dataHasil) return [];
    const allPrograms = [...kolomProgram, namaKolomBaru].filter(Boolean);
    return findDuplicateRecipients(dataHasil, allPrograms, kolomNik, kolomNama);
  }, [dataHasil, kolomProgram, namaKolomBaru, kolomNik, kolomNama, hasCrossProgram]);

  const ringkasanProgram = useMemo(() => {
    if (!hasCrossProgram || !dataHasil) return [];
    const allPrograms = [...kolomProgram, namaKolomBaru].filter(Boolean);
    return programSummary(dataHasil, allPrograms);
  }, [dataHasil, kolomProgram, namaKolomBaru, hasCrossProgram]);

  // Format keterangan distribusi for chart
  const chartKeterangan = useMemo(() => {
    if (!keteranganDistribusi) return [];
    return Object.entries(keteranganDistribusi)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [keteranganDistribusi]);

  return {
    kolomProgram,
    hasCrossProgram,
    crossMatrix,
    penerimaGanda,
    ringkasanProgram,
    chartKeterangan,
  };
}
