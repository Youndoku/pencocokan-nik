import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import SegmentedControl from "../ui/SegmentedControl.jsx";
import { samarkanNIK } from "../../utils/normalize.js";

const PER_HALAMAN = 10;
const OPSI_NAMA = [
  { value: "valid", label: "Validkan" },
  { value: "abaikan", label: "Abaikan" },
];
const OPSI_NIK = [
  { value: "valid", label: "Cocokkan" },
  { value: "abaikan", label: "Abaikan" },
];
const LABEL_FILE = { gabungan: "Data gabungan", pembanding: "Data pembanding" };

/**
 * Langkah 3: periksa anomali (perbedaan nama, format NIK, NIK duplikat).
 * NIK duplikat hanya informasi: pencocokan memakai baris pertama per NIK.
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

  const jenis = {
    nama: {
      label: "Perbedaan nama",
      sub: "NIK sama, nama di kedua file berbeda",
      items: nameMismatches,
      teks: (it) => [it.nik, it.nameGabungan, it.namePembanding],
      kolom: [
        ["NIK", (it) => samarkanNIK(it.nik)],
        ["Nama di data gabungan", (it) => it.nameGabungan],
        ["Nama di data pembanding", (it) => it.namePembanding],
      ],
      opsi: OPSI_NAMA,
      res: nameMismatchResolutions,
      onRes: onSetNameResolution,
      onBulk: onBulkNameResolution,
      bulk: ["Validkan semua", "Abaikan semua"],
      catatan: "Pilihan bawaan untuk perbedaan nama adalah Abaikan.",
      nama: (it) => it.nameGabungan,
    },
    format: {
      label: "Format NIK",
      judul: "Format NIK tidak standar",
      sub: "NIK kosong, berisi selain angka, atau bukan 16 digit",
      items: invalidNiks,
      teks: (it) => [it.nikRaw, it.name, it.reason],
      kolom: [
        ["NIK", (it) => it.nikRaw || "(kosong)"],
        ["Nama", (it) => it.name],
        ["Masalah", (it) => it.reason],
      ],
      opsi: OPSI_NIK,
      res: invalidNikResolutions,
      onRes: onSetNikResolution,
      onBulk: onBulkNikResolution,
      bulk: ["Cocokkan semua", "Abaikan semua"],
      catatan: "Pilihan bawaan untuk format NIK adalah Cocokkan: NIK dirapikan lalu tetap dicoba dicocokkan.",
      nama: (it) => it.name || it.nikRaw,
    },
    duplikat: {
      label: "NIK duplikat",
      sub: "NIK yang muncul lebih dari sekali dalam satu file",
      items: duplicateNiks,
      teks: (it) => [it.nik, ...it.baris.map((b) => b.name)],
      kolom: [
        ["NIK", (it) => samarkanNIK(it.nik)],
        ["File", (it) => LABEL_FILE[it.file]],
        ["Jumlah baris", (it) => it.jumlah.toLocaleString("id-ID")],
        ["Nama", (it) => [...new Set(it.baris.map((b) => b.name).filter(Boolean))].join(", ")],
      ],
      catatan: "Yang dipakai hanya baris pertama.",
    },
  };

  const tersedia = Object.keys(jenis).filter((k) => jenis[k].items.length > 0);
  const [tab, setTab] = useState(tersedia[0]);
  const [cari, setCari] = useState("");
  const [halaman, setHalaman] = useState(1);

  const j = jenis[tab];
  const q = cari.trim().toLowerCase();
  const tersaring = q
    ? j.items.filter((it) => j.teks(it).some((t) => String(t ?? "").toLowerCase().includes(q)))
    : j.items;
  const jumlahHalaman = Math.max(1, Math.ceil(tersaring.length / PER_HALAMAN));
  const hal = Math.min(halaman, jumlahHalaman);
  const tampil = tersaring.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);
  const totalPerlu = nameMismatches.length + invalidNiks.length + duplicateNiks.length;

  const gantiTab = (t) => {
    setTab(t);
    setCari("");
    setHalaman(1);
  };

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

      <Card
        title={j.judul || j.label}
        subtitle={j.sub}
        action={
          <SegmentedControl
            label="Jenis anomali"
            value={tab}
            onChange={gantiTab}
            options={tersedia.map((k) => ({
              value: k,
              label: `${jenis[k].label} (${jenis[k].items.length.toLocaleString("id-ID")})`,
            }))}
          />
        }
        className="[&>header]:flex-wrap"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SearchInput
            className="max-w-[360px] flex-[1_1_260px]"
            placeholder="Cari NIK atau nama"
            aria-label="Cari NIK atau nama"
            value={cari}
            onChange={(v) => {
              setCari(v);
              setHalaman(1);
            }}
          />
          {j.onBulk && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => j.onBulk("valid")}>
                {j.bulk[0]}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => j.onBulk("abaikan")}>
                {j.bulk[1]}
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table aria-label={j.judul || j.label} className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {j.kolom.map(([h]) => (
                  <th key={h} scope="col" className="caption px-3 py-2 font-normal text-ink-muted">
                    {h}
                  </th>
                ))}
                {j.opsi && (
                  <th scope="col" className="caption px-3 py-2 text-right font-normal text-ink-muted">
                    Keputusan
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {tampil.length === 0 ? (
                <tr>
                  <td colSpan={j.kolom.length + 1} className="body px-3 py-6 text-center text-ink-muted">
                    Tidak ada data yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                tampil.map((it) => (
                  <tr key={it.id} className="border-b border-line">
                    {j.kolom.map(([h, isi], i) => (
                      <td key={h} className={`body px-3 py-3.5 ${i === 0 ? "whitespace-nowrap tabular-nums" : ""}`}>
                        {isi(it)}
                      </td>
                    ))}
                    {j.opsi && (
                      <td className="px-3 py-3.5 text-right">
                        <SegmentedControl
                          label={`Keputusan untuk ${j.nama(it)}`}
                          options={j.opsi}
                          value={j.res[it.id] || (tab === "nama" ? "abaikan" : "valid")}
                          onChange={(v) => j.onRes(it.id, v)}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="caption m-0 text-ink-muted">{j.catatan}</p>
          {jumlahHalaman > 1 && (
            <div className="flex items-center gap-2">
              <span className="caption text-ink-muted tabular-nums">
                Menampilkan {(hal - 1) * PER_HALAMAN + 1}–{Math.min(hal * PER_HALAMAN, tersaring.length)} dari{" "}
                {tersaring.length.toLocaleString("id-ID")}
              </span>
              <Button variant="secondary" size="sm" icon={ChevronLeft} aria-label="Halaman sebelumnya" disabled={hal === 1} onClick={() => setHalaman(hal - 1)} />
              <Button variant="secondary" size="sm" icon={ChevronRight} aria-label="Halaman berikutnya" disabled={hal === jumlahHalaman} onClick={() => setHalaman(hal + 1)} />
            </div>
          )}
        </div>
      </Card>

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
