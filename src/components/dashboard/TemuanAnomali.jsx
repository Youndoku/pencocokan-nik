import { ChevronRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";

const angka = (n) => (n ?? 0).toLocaleString("id-ID");

const hitung = (items, res, bawaan, nilai) => items.filter((it) => (res[it.id] || bawaan) === nilai).length;

/** Kartu "Temuan anomali" di bagian Hasil sesi. */
export default function TemuanAnomali({ data, terbuka, onLihat, className = "" }) {
  const { anomalies, nameRes, nikRes } = data;
  const { nameMismatches, invalidNiks, duplicateNiks } = anomalies;
  const statusNama = hitung(nameMismatches, nameRes, "abaikan", "status");

  const baris = [
    {
      nama: "Perbedaan nama",
      n: nameMismatches.length,
      rincian:
        `${angka(hitung(nameMismatches, nameRes, "abaikan", "valid"))} divalidkan, ${angka(hitung(nameMismatches, nameRes, "abaikan", "abaikan"))} diabaikan` +
        (statusNama > 0 ? `, ${angka(statusNama)} status tidak dihitung` : ""),
      status: "Selesai",
    },
    {
      nama: "NIK tidak standar",
      n: invalidNiks.length,
      rincian: `${angka(hitung(invalidNiks, nikRes, "valid", "valid"))} dicocokkan, ${angka(hitung(invalidNiks, nikRes, "valid", "abaikan"))} diabaikan`,
      status: "Selesai",
    },
    { nama: "NIK duplikat", n: duplicateNiks.length, rincian: "Dipakai kemunculan pertama", status: "Informasi" },
  ];
  const ada = baris.some((b) => b.n > 0);

  return (
    <Card className={className} title="Temuan anomali" subtitle="Sudah diputuskan saat proses">
      <div className="flex flex-col">
        {baris.map((b, i) => (
          <div key={b.nama} className={`flex items-center gap-3 py-2.5 ${i < baris.length - 1 ? "border-b border-line" : ""}`}>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{b.nama}</div>
              <div className="caption text-ink-muted">{b.n > 0 ? b.rincian : "Tidak ada temuan"}</div>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="text-sm font-medium tabular-nums">{angka(b.n)}</div>
              {b.n > 0 && (
                <Badge variant="text" tone={b.status === "Selesai" ? "success" : "neutral"}>
                  {b.status}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
      {ada && (
        <div>
          <Button variant="ghost" iconRight={ChevronRight} aria-expanded={terbuka} aria-controls="detail-anomali" onClick={onLihat}>
            {terbuka ? "Sembunyikan detail anomali" : "Lihat detail anomali"}
          </Button>
        </div>
      )}
    </Card>
  );
}
