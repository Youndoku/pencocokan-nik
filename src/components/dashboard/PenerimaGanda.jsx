import { useState } from "react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Select from "../ui/Select.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import { Paginasi } from "../pencocokan/AnomalyTable.jsx";
import { samarkanNIK } from "../../utils/normalize.js";

const PER_HALAMAN = 10;
const URUTAN = {
  jumlah: { label: "Jumlah program terbanyak", teks: "jumlah program terbanyak" },
  nama: { label: "Nama A–Z", teks: "nama" },
  kec: { label: "Kecamatan", teks: "kecamatan" },
};
const banding = (a, b) => a.localeCompare(b, "id-ID");

/**
 * Tabel NIK yang cocok di dua program atau lebih (sudah disaring Fokus program oleh pemanggil).
 */
export default function PenerimaGanda({ ganda, urutan, fokus, pakaiKecamatan }) {
  const [nikLengkap, setNikLengkap] = useState(false);
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("");
  const [urut, setUrut] = useState("jumlah");
  const [halaman, setHalaman] = useState(1);

  const q = cari.trim().toLowerCase();
  let data = ganda.filter(
    (g) =>
      (!filter || g.programs[filter] === 1) &&
      (!q || g.nik.toLowerCase().includes(q) || g.nama.toLowerCase().includes(q))
  );
  if (urut === "nama") data = [...data].sort((a, b) => banding(a.nama, b.nama));
  if (urut === "kec") data = [...data].sort((a, b) => banding(a.kecamatan, b.kecamatan) || b.count - a.count);

  const jumlahHalaman = Math.max(1, Math.ceil(data.length / PER_HALAMAN));
  const hal = Math.min(halaman, jumlahHalaman);
  const tampil = data.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);
  const ubah = (fn) => (v) => {
    fn(v);
    setHalaman(1);
  };

  const opsiUrut = Object.entries(URUTAN)
    .filter(([k]) => k !== "kec" || pakaiKecamatan)
    .map(([value, o]) => ({ value, label: o.label }));
  const kolom = pakaiKecamatan
    ? "grid-cols-[150px_minmax(140px,1fr)_100px_minmax(260px,2fr)_72px]"
    : "grid-cols-[150px_minmax(140px,1fr)_minmax(260px,2fr)_72px]";

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {fokus ? `Penerima ganda dengan ${fokus}` : "Penerima ganda"}
          <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lilac-text px-[5px] text-[11px] font-semibold leading-[14px] text-on-lilac tabular-nums">
            {ganda.length.toLocaleString("id-ID")}
          </span>
        </span>
      }
      subtitle={fokus ? `NIK yang menerima ${fokus} dan minimal satu program lain` : "NIK yang cocok di dua program atau lebih"}
      action={
        <Button variant="secondary" size="sm" aria-pressed={nikLengkap} onClick={() => setNikLengkap(!nikLengkap)}>
          {nikLengkap ? "Samarkan NIK" : "Tampilkan NIK lengkap"}
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="max-w-[360px] flex-[1_1_260px]"
          placeholder="Cari NIK atau nama"
          aria-label="Cari NIK atau nama"
          value={cari}
          onChange={ubah(setCari)}
        />
        {!fokus && (
          <Select
            label="Filter program"
            value={filter}
            onChange={ubah(setFilter)}
            options={[{ value: "", label: "Semua program" }, ...urutan.map((p) => ({ value: p, label: p }))]}
          />
        )}
        <Select label="Urutkan" value={urut} onChange={ubah(setUrut)} options={opsiUrut} />
      </div>

      <div className="overflow-x-auto">
        <div role="table" aria-label={fokus ? `Daftar penerima ganda dengan ${fokus}` : "Daftar penerima ganda"} className="flex min-w-[820px] flex-col">
          <div role="row" className={`grid ${kolom} gap-3 border-b border-line py-2`}>
            <div role="columnheader" className="caption text-ink-muted">NIK</div>
            <div role="columnheader" className="caption text-ink-muted">Nama</div>
            {pakaiKecamatan && <div role="columnheader" className="caption text-ink-muted">Kecamatan</div>}
            <div role="columnheader" className="caption text-ink-muted">Program diterima</div>
            <div role="columnheader" className="caption text-right text-ink-muted">Jumlah</div>
          </div>
          {tampil.length === 0 ? (
            <p className="body m-0 py-6 text-center text-ink-muted">
              {ganda.length === 0 ? "Belum ada NIK yang menerima lebih dari satu program." : "Tidak ada data yang cocok dengan pencarian."}
            </p>
          ) : (
            tampil.map((g, i) => {
              const chip = fokus ? [fokus, ...g.diterima.filter((p) => p !== fokus)] : g.diterima;
              return (
                <div key={`${g.nik}-${i}`} role="row" className={`grid ${kolom} items-center gap-3 border-b border-line py-3`}>
                  <div role="cell" className="body text-ink-muted tabular-nums">{nikLengkap ? g.nik : samarkanNIK(g.nik)}</div>
                  <div role="cell" className="body-strong">{g.nama}</div>
                  {pakaiKecamatan && <div role="cell" className="body">{g.kecamatan}</div>}
                  <div role="cell" className="flex flex-wrap gap-1">
                    {chip.map((p) => (
                      <Badge key={p} tone={!fokus || p === fokus ? "lilac" : "neutral"}>
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <div role="cell" className="body-strong text-right tabular-nums">{g.count}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="caption m-0 text-ink-muted">Diurutkan menurut {URUTAN[urut].teks}.</p>
        {jumlahHalaman > 1 && (
          <Paginasi hal={hal} jumlahHalaman={jumlahHalaman} total={data.length} perHalaman={PER_HALAMAN} onHal={setHalaman} satuan="NIK" />
        )}
      </div>
    </Card>
  );
}
