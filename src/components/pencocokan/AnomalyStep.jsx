import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Button from "../ui/Button.jsx";
import AnomalyTable from "./AnomalyTable.jsx";

/**
 * Langkah 3: periksa anomali sebelum hasil disimpan.
 */
export default function AnomalyStep({
  anomalies,
  nameMismatchResolutions,
  invalidNikResolutions,
  onSetNameResolution,
  onSetNikResolution,
  onBulkNameResolution,
  onBulkNikResolution,
  onBack,
  onNext,
}) {
  const { nameMismatches = [], invalidNiks = [], duplicateNiks = [] } = anomalies;
  const totalPerlu = nameMismatches.length + invalidNiks.length + duplicateNiks.length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-lilac-soft p-4">
        <div>
          <p className="body-strong m-0 tabular-nums">
            {totalPerlu.toLocaleString("id-ID")} data perlu diperiksa sebelum hasil disimpan
          </p>
          <p className="body m-0 text-ink-muted">Validkan berarti dihitung cocok, abaikan berarti dihitung tidak cocok.</p>
        </div>
        <Link to="/bantuan#anomali" className="body-strong text-lilac-main hover:text-lilac-text">
          Pelajari jenis anomali
        </Link>
      </div>

      <AnomalyTable
        anomalies={anomalies}
        nameRes={nameMismatchResolutions}
        nikRes={invalidNikResolutions}
        onSetName={onSetNameResolution}
        onSetNik={onSetNikResolution}
        onBulkName={onBulkNameResolution}
        onBulkNik={onBulkNikResolution}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line bg-surface p-4">
        <Button variant="secondary" onClick={onBack}>
          Kembali
        </Button>
        <Button iconRight={ChevronRight} onClick={onNext}>
          Simpan hasil
        </Button>
      </div>
    </>
  );
}
