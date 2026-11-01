import Card from "../ui/Card.jsx";
import SegmentedBar, { Legend } from "../ui/SegmentedBar.jsx";

const angka = (n) => (n ?? 0).toLocaleString("id-ID");

/**
 * Kartu "Hasil pemadanan" (langkah Hasil dan dashboard).
 * Tidak cocok = tidak − status tidak dihitung. Kategori status disembunyikan
 * kalau kolom status tidak dipakai.
 */
export default function HasilPemadanan({ total, cocok, tidak, dikecualikanStatus = 0, pakaiStatus, namaKolomBaru, className = "" }) {
  const kategori = [
    { label: "Cocok", color: "var(--color-lilac-main)", value: cocok },
    pakaiStatus && { label: "Status tidak dihitung", color: "var(--color-lilac-second)", value: dikecualikanStatus },
    { label: "Tidak cocok", color: "var(--color-surface-muted)", value: tidak - dikecualikanStatus },
  ].filter(Boolean);

  return (
    <Card
      className={className}
      title="Hasil pemadanan"
      subtitle={`Hasil pencocokan NIK dengan data pembanding ${namaKolomBaru}`}
    >
      <div className="flex flex-wrap items-end gap-6">
        <div className="min-w-0 flex-[1_1_240px]">
          <div className="amount-xl tabular-nums">{angka(cocok)}</div>
          <p className="body m-0 text-ink-muted">NIK cocok dari {angka(total)} baris data gabungan</p>
        </div>
        <Legend direction="column" className="min-w-0 flex-[1_1_300px]" items={kategori.map((k) => ({ ...k, value: angka(k.value) }))} />
      </div>
      <SegmentedBar
        segments={kategori}
        label={`${angka(total)} baris: ${kategori.map((k) => `${angka(k.value)} ${k.label.toLowerCase()}`).join(", ")}`}
      />
    </Card>
  );
}
