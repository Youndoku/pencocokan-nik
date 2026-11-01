import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import Select from "../ui/Select.jsx";
import KonfirmasiDialog from "./KonfirmasiDialog.jsx";
import { kolomProgramSesi } from "../../utils/autoDetectColumns.js";
import { persen } from "../../utils/format.js";
import { unduhExcelSesi } from "../../utils/unduh.js";

const URUTAN = ["Terbaru", "Terlama", "Persentase cocok tertinggi"];
const GRID = "grid grid-cols-[32px_minmax(280px,2fr)_150px_minmax(220px,1.2fr)_210px] gap-4";
const angka = (n) => (n ?? 0).toLocaleString("id-ID");

/** Tabel sesi: cari, urutkan, pilih lalu hapus. `sesiList` terbaru di atas. */
export default function DaftarSesi({ sesiList, onHapus }) {
  const [cari, setCari] = useState("");
  const [urutan, setUrutan] = useState(URUTAN[0]);
  const [dipilih, setDipilih] = useState(() => new Set());
  const [konfirmasi, setKonfirmasi] = useState(false);

  // Nomor sesi sama dengan dashboard: urutan menurut tanggal naik.
  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    let list = sesiList.map((s, i) => ({ s, nomor: sesiList.length - i, terbaru: i === 0 }));
    if (q) {
      list = list.filter(({ s }) =>
        [s.namaGabungan, s.namaPembanding, s.namaKolomBaru].some((v) => (v || "").toLowerCase().includes(q))
      );
    }
    if (urutan === "Terlama") list.reverse();
    if (urutan === "Persentase cocok tertinggi") {
      const rasio = ({ s }) => (s.ringkasan?.total ? s.ringkasan.cocok / s.ringkasan.total : 0);
      list.sort((a, b) => rasio(b) - rasio(a));
    }
    return list;
  }, [sesiList, cari, urutan]);

  // Pilihan yang sesinya sudah terhapus tidak dihitung.
  const idPilihan = sesiList.filter((s) => dipilih.has(s.id)).map((s) => s.id);
  const n = idPilihan.length;

  const toggle = (id) =>
    setDipilih((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const hapus = async () => {
    await onHapus(idPilihan);
    setDipilih(new Set());
    setKonfirmasi(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-[1_1_420px] flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Cari nama file atau program"
            aria-label="Cari nama file atau program"
            value={cari}
            onChange={setCari}
            className="max-w-[360px] flex-[1_1_260px]"
          />
          <Select label="Urutkan" value={urutan} onChange={setUrutan} options={URUTAN} />
        </div>
        {n > 0 && (
          <div className="flex items-center gap-3 rounded-[10px] bg-lilac-soft py-1.5 pr-1.5 pl-3">
            <span className="body-strong text-lilac-main tabular-nums">{n} sesi dipilih</span>
            <Button variant="secondary" size="sm" onClick={() => setDipilih(new Set())}>
              Batal
            </Button>
            <Button variant="dark" size="sm" onClick={() => setKonfirmasi(true)}>
              Hapus {n} sesi
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div role="table" aria-label="Daftar sesi" className="flex min-w-[920px] flex-col">
          <div role="row" className={`${GRID} border-b border-line px-3 py-2`}>
            <div role="columnheader">
              <span className="sr-only">Pilih</span>
            </div>
            <div role="columnheader" className="caption text-ink-muted">Sesi</div>
            <div role="columnheader" className="caption text-ink-muted">Tanggal</div>
            <div role="columnheader" className="caption text-ink-muted">Hasil</div>
            <div role="columnheader" className="caption text-right text-ink-muted">Aksi</div>
          </div>
          {daftar.length === 0 && (
            <p className="body m-0 px-3 py-6 text-ink-muted">Tidak ada sesi yang cocok dengan pencarian.</p>
          )}
          {daftar.map(({ s, nomor, terbaru }) => {
            const id = `sesi-${s.id}`;
            const on = dipilih.has(s.id);
            const tgl = new Date(s.tanggal);
            const r = s.ringkasan || {};
            return (
              <div
                role="row"
                key={s.id}
                className={`${GRID} items-center rounded-md border-b border-line px-3 py-3.5 ${on ? "bg-lilac-soft" : ""}`}
              >
                <div role="cell">
                  <input
                    type="checkbox"
                    id={id}
                    checked={on}
                    onChange={() => toggle(s.id)}
                    aria-label={`Pilih Sesi ${nomor}`}
                    className="m-0 size-4 accent-lilac-main"
                  />
                </div>
                <div role="cell" className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor={id} className="body-strong">
                      Sesi {nomor}: {s.namaKolomBaru}
                    </label>
                    {terbaru && <Badge tone="lilac">Terbaru</Badge>}
                    <span className="caption text-ink-muted">Berisi {kolomProgramSesi(s).length} program</span>
                  </div>
                  <span className="caption truncate text-ink-muted">
                    {s.namaGabungan} dibandingkan dengan {s.namaPembanding}
                  </span>
                </div>
                <div role="cell" className="flex flex-col tabular-nums">
                  <span className="body">{tgl.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="caption text-ink-muted">
                    {tgl.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
                  </span>
                </div>
                <div role="cell" className="flex flex-col gap-1.5">
                  <div className="flex justify-between gap-2 tabular-nums">
                    <span className="body-strong">{angka(r.cocok)} cocok</span>
                    <span className="caption text-ink-muted">
                      dari {angka(r.total)} ({persen(r.cocok, r.total)})
                    </span>
                  </div>
                  <ProgressBar value={r.cocok || 0} max={r.total || 0} label={`Sesi ${nomor}: ${persen(r.cocok, r.total)} cocok`} />
                </div>
                <div role="cell" className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" disabled={!s.excelBuffer} onClick={() => unduhExcelSesi(s)}>
                    Unduh
                  </Button>
                  <Button as={Link} to={`/dashboard/${s.id}`} variant="secondary" size="sm" iconRight={ChevronRight}>
                    Buka dashboard
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <KonfirmasiDialog
        open={konfirmasi}
        judul={`Hapus ${n} sesi?`}
        pesan="Sesi yang dihapus tidak bisa dikembalikan. Unduh Excel hasilnya dulu kalau masih diperlukan."
        labelHapus={`Hapus ${n} sesi`}
        onBatal={() => setKonfirmasi(false)}
        onHapus={hapus}
      />
    </>
  );
}
