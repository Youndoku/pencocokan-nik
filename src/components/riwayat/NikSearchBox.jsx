import { useMemo, useState } from "react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import { kolomProgramSesi } from "../../utils/autoDetectColumns.js";
import { normalisasiNIK, samarkanNIK } from "../../utils/normalize.js";

const MIN_DIGIT = 3;
const MAKS_HASIL = 5;

/** Kartu "Cari NIK" di data sesi terbaru. Tanpa sesi: kolom nonaktif. */
export default function NikSearchBox({ sesi, className = "" }) {
  const [query, setQuery] = useState("");

  const dataHasil = sesi?.dataHasil ?? null;
  const konf = sesi?.konfigurasi ?? {};
  const kolomNik = konf.kolomNikGabungan ?? "";
  const programs = useMemo(() => (sesi ? kolomProgramSesi(sesi) : []), [sesi]);

  const q = normalisasiNIK(query);
  const hasil = useMemo(() => {
    if (q.length < MIN_DIGIT || !dataHasil || !kolomNik) return null;
    return dataHasil.filter((row) => normalisasiNIK(row[kolomNik]).includes(q));
  }, [q, dataHasil, kolomNik]);

  if (!sesi) {
    return (
      <Card title="Cari NIK" subtitle="Pencarian tersedia setelah ada sesi" className={className}>
        <SearchInput placeholder="Ketik NIK" aria-label="Cari NIK" disabled className="pointer-events-none opacity-55" />
      </Card>
    );
  }

  return (
    <Card
      title="Cari NIK"
      subtitle={`Di sesi terbaru, ${sesi.namaGabungan} dibandingkan dengan ${sesi.namaPembanding}. Ketik minimal 3 angka.`}
      className={className}
    >
      {!dataHasil ? (
        <p className="body m-0 text-ink-muted">Data tidak tersedia untuk pencarian NIK.</p>
      ) : (
        <>
          <SearchInput placeholder="Ketik NIK" aria-label="Cari NIK di sesi terbaru" inputMode="numeric" value={query} onChange={setQuery} />
          {hasil && (
            <p className="caption-strong m-0 text-ink-muted tabular-nums" role="status">
              {hasil.length === 0 ? "NIK tidak ditemukan di data terbaru." : `${hasil.length.toLocaleString("id-ID")} hasil ditemukan`}
            </p>
          )}
          {hasil?.slice(0, MAKS_HASIL).map((row, i) => {
            const menerima = programs.filter((p) => Number(row[p]) === 1);
            const tidak = programs.filter((p) => Number(row[p]) !== 1);
            const kec = konf.kolomKecamatan ? String(row[konf.kolomKecamatan] ?? "").trim() : "";
            return (
              <div key={i} className="flex flex-col gap-3 rounded-[10px] bg-lilac-bg p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="body-strong m-0">{String(row[konf.kolomNamaGabungan] ?? "-")}</p>
                    <p className="caption m-0 text-ink-muted tabular-nums">
                      {samarkanNIK(normalisasiNIK(row[kolomNik]))}
                      {kec && `, Kecamatan ${kec}`}
                    </p>
                  </div>
                  <Badge tone="lilac">
                    Menerima {menerima.length} dari {programs.length} program
                  </Badge>
                </div>
                {menerima.length > 0 && <DaftarProgram judul="Menerima" items={menerima} tone="lilac" />}
                {tidak.length > 0 && <DaftarProgram judul="Tidak menerima" items={tidak} tone="neutral" />}
              </div>
            );
          })}
          {hasil && hasil.length > MAKS_HASIL && (
            <p className="caption m-0 text-ink-muted tabular-nums">
              Menampilkan {MAKS_HASIL} dari {hasil.length.toLocaleString("id-ID")} hasil. Ketik NIK lebih lengkap untuk mempersempit.
            </p>
          )}
        </>
      )}
    </Card>
  );
}

function DaftarProgram({ judul, items, tone }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="caption-strong">{judul}</span>
      <div className="flex flex-wrap gap-1">
        {items.map((p) => (
          <Badge key={p} tone={tone}>
            {p}
          </Badge>
        ))}
      </div>
    </div>
  );
}
