import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import SegmentedBar, { Legend } from "../ui/SegmentedBar.jsx";
import { BarList, Heatmap } from "./Grafik.jsx";
import { persen } from "../../utils/format.js";
import PenerimaGanda from "./PenerimaGanda.jsx";

const angka = (n) => (n ?? 0).toLocaleString("id-ID");
const WARNA = {
  muted: "var(--color-surface-muted)",
  second: "var(--color-lilac-second)",
  tengah: "var(--color-series-savings)",
  main: "var(--color-lilac-main)",
};

function Baris({ children }) {
  return <div className="flex flex-wrap items-stretch gap-3">{children}</div>;
}

function DistribusiCard({ title, subtitle, jumlah, keterangan, kategori, label }) {
  return (
    <Card className="flex-[1_1_320px]" title={title} subtitle={subtitle}>
      <div>
        <div className="amount-lg tabular-nums">{angka(jumlah)}</div>
        <p className="caption m-0 text-ink-muted">{keterangan}</p>
      </div>
      <SegmentedBar segments={kategori} label={label} />
      <Legend items={kategori.map((k) => ({ ...k, value: angka(k.value) }))} />
    </Card>
  );
}

function KecamatanBar({ a, program, title, subtitle, className = "" }) {
  const { kecamatan } = a;
  const items = kecamatan.daftar
    .map((k) => ({ label: k, value: kecamatan.jumlah[k][program] }))
    .sort((x, y) => y.value - x.value)
    .map((it) => ({ ...it, share: persen(it.value, a.penerima[program]) }));
  return (
    <Card className={className} title={title} subtitle={subtitle}>
      <BarList items={items} label={title} />
    </Card>
  );
}

/** Kartu kosong untuk sesi 1 program (DashboardV2.dc.html). */
function LintasProgramKosong({ program, terbaru }) {
  return (
    <section className="flex flex-wrap items-start gap-6 rounded-lg border border-dashed border-lilac-second bg-surface p-5">
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-3">
        <div>
          <h3 className="title-md m-0">Analisis lintas program belum tersedia</h3>
          <p className="body m-0 mt-1 text-ink-muted">
            File di sesi ini baru berisi 1 program. Analisis berikut muncul setelah file dipadankan dengan minimal satu
            program lain.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {["Jumlah program per NIK", "Irisan antar program", "Kombinasi terbanyak", "Penerima ganda"].map((n) => (
            <Badge key={n}>{n}</Badge>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-md bg-lilac-bg p-4">
        <p className="body-strong m-0">Cara menambah program</p>
        <ol className="body m-0 flex list-decimal flex-col gap-1.5 pl-5">
          <li>Pilih Proses data baru di menu.</li>
          <li>Di data gabungan, pilih Pakai hasil sesi sebelumnya. Sesi terbaru sudah terpilih otomatis.</li>
          <li>Unggah file pembanding program berikutnya.</li>
        </ol>
        <p className="caption m-0 text-ink-muted">
          Tidak perlu mengunduh dan mengunggah ulang file hasil.
          {terbaru &&
            ` ${program} sudah ada di Sesi ${terbaru.nomor} bersama ${terbaru.jumlahProgram - 1} program lain, jadi lanjutkan dari sesi terbaru supaya semua program ikut.`}
        </p>
      </div>
    </section>
  );
}

/**
 * Bagian "Ringkasan {k} program". `a` = hasil useDashboard, `total` = jumlah baris,
 * `fokus` = program yang difokuskan (atau ""), `terbaru` = info sesi terbaru untuk
 * kartu kosong 1 program (null kalau tidak relevan).
 */
export default function RingkasanProgram({ a, total, fokus, onFokus, terbaru }) {
  const { urutan, penerima, perNik, matrix, kombinasi, kecamatan, ganda } = a;
  const k = urutan.length;
  const adaKec = Boolean(kecamatan);

  if (k === 0) return null;

  if (k === 1) {
    const p = urutan[0];
    const tanpa = adaKec ? kecamatan.tanpaPer[p] : 0;
    return (
      <>
        <Baris>
          {adaKec && (
            <KecamatanBar
              a={a}
              program={p}
              className="flex-[999_1_560px]"
              title="Penerima per kecamatan"
              subtitle={`Jumlah penerima ${p}${tanpa > 0 ? `, tidak termasuk ${angka(tanpa)} penerima tanpa kecamatan` : ""}`}
            />
          )}
          <Card className="flex-[1_1_320px]" title="Penerima per program" subtitle="Jumlah penerima">
            <div>
              <div className="amount-lg tabular-nums">{angka(penerima[p])}</div>
              <p className="caption m-0 text-ink-muted">
                NIK menerima {p}, {persen(penerima[p], total)} dari {angka(total)} baris
              </p>
            </div>
            <ProgressBar value={penerima[p]} max={total} start={p} end={`${angka(total)} baris`} label={`${p}: ${angka(penerima[p])} dari ${angka(total)} baris`} />
          </Card>
        </Baris>
        <LintasProgramKosong program={p} terbaru={terbaru} />
      </>
    );
  }

  const fi = fokus ? urutan.indexOf(fokus) : -1;
  const lain = urutan.filter((p) => p !== fokus);

  // Kartu 2
  const distribusi = fokus
    ? (() => {
        const [hanya, satu, dua] = a.fokus[fokus];
        const kategori = [
          { label: `Hanya ${fokus}`, color: WARNA.second, value: hanya },
          { label: "Dengan 1 program lain", color: WARNA.tengah, value: satu },
          { label: "Dengan 2 program lain atau lebih", color: WARNA.main, value: dua },
        ];
        return (
          <DistribusiCard
            title={`Penerima ${fokus}`}
            subtitle="Berapa program lain yang juga mereka terima"
            jumlah={penerima[fokus]}
            keterangan={`NIK menerima ${fokus}, ${persen(penerima[fokus], total)} dari ${angka(total)} baris`}
            kategori={kategori}
            label={`${angka(penerima[fokus])} penerima ${fokus}: ${angka(hanya)} hanya ${fokus}, ${angka(satu)} dengan 1 program lain, ${angka(dua)} dengan 2 program lain atau lebih`}
          />
        );
      })()
    : (() => {
        const kategori = [
          { label: "Tanpa program", color: WARNA.muted, value: perNik[0] },
          { label: "1 program", color: WARNA.second, value: perNik[1] },
          { label: "2 program", color: WARNA.tengah, value: perNik[2] },
          { label: "3 program atau lebih", color: WARNA.main, value: perNik[3] },
        ];
        return (
          <DistribusiCard
            title="Jumlah program per NIK"
            subtitle="Berapa program yang diterima tiap NIK"
            jumlah={total - perNik[0]}
            keterangan="NIK menerima minimal satu program"
            kategori={kategori}
            label={`${angka(total)} NIK: ${angka(perNik[0])} tanpa program, ${angka(perNik[1])} satu program, ${angka(perNik[2])} dua program, ${angka(perNik[3])} tiga program atau lebih`}
          />
        );
      })();

  // Kartu 3
  let irisan;
  if (fokus) {
    const items = lain
      .map((p) => ({ label: p, value: matrix[fi][urutan.indexOf(p)] }))
      .sort((x, y) => y.value - x.value);
    irisan = (
      <Card className="flex-[999_1_560px]" title={`${fokus} dengan program lain`} subtitle={`Jumlah NIK yang menerima ${fokus} dan program tersebut`}>
        <BarList items={items} satuan="NIK" label={`${fokus} dengan program lain`} />
      </Card>
    );
  } else if (k === 2) {
    irisan = (
      <Card className="flex-[999_1_560px]" title="Irisan antar program" subtitle={`${urutan[0]} dan ${urutan[1]}`}>
        <p className="body m-0">
          <span className="body-strong tabular-nums">{angka(matrix[0][1])} NIK</span> menerima keduanya.
        </p>
      </Card>
    );
  } else {
    const cols = urutan.slice(0, -1);
    irisan = (
      <Card className="flex-[999_1_560px]" title="Irisan antar program" subtitle="Jumlah NIK yang menerima dua program sekaligus. Warna makin gelap berarti makin banyak.">
        <Heatmap
          label="Irisan antar program"
          cols={cols}
          rows={urutan.slice(1).map((p, i) => ({ label: p, cells: cols.map((_, j) => (j <= i ? matrix[i + 1][j] : null)) }))}
          minWidth={96 + cols.length * 60}
        />
      </Card>
    );
  }

  // Kartu 4 (tidak perlu untuk 2 program: kombinasinya hanya A + B)
  const daftarKombinasi = (fokus ? kombinasi.filter((c) => c.programs.includes(fokus)) : kombinasi).slice(0, 5);
  const kombinasiCard = k > 2 && (
    <Card
      className="flex-[1_1_320px]"
      title="Kombinasi terbanyak"
      subtitle={fokus ? `Kombinasi program persis yang mengandung ${fokus}` : "Kombinasi program persis yang diterima satu NIK"}
    >
      {daftarKombinasi.length === 0 ? (
        <p className="body m-0 text-ink-muted">Belum ada NIK yang menerima lebih dari satu program.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {daftarKombinasi.map((c) => {
            const chip = fokus ? [fokus, ...c.programs.filter((p) => p !== fokus)] : c.programs;
            return (
              <li key={c.programs.join("|")} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
                <span className="flex flex-wrap gap-1">
                  {chip.map((p) => (
                    <Badge key={p} tone={!fokus || p === fokus ? "lilac" : "neutral"}>
                      {p}
                    </Badge>
                  ))}
                </span>
                <span className="body-strong whitespace-nowrap tabular-nums">{angka(c.n)} NIK</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  // Kartu 5
  let kecCard = null;
  if (adaKec && fokus) {
    const tanpa = kecamatan.tanpaPer[fokus];
    kecCard = (
      <KecamatanBar
        a={a}
        program={fokus}
        title={`Penerima ${fokus} per kecamatan`}
        subtitle={tanpa > 0 ? `Tidak termasuk ${angka(tanpa)} penerima tanpa kecamatan` : "Jumlah penerima di tiap kecamatan"}
      />
    );
  } else if (adaKec) {
    kecCard = (
      <Card
        title="Penerima per kecamatan"
        subtitle={`Jumlah penerima per program di tiap kecamatan${kecamatan.tanpa > 0 ? `, tidak termasuk ${angka(kecamatan.tanpa)} baris tanpa kecamatan` : ""}`}
      >
        <Heatmap
          label="Penerima per kecamatan"
          corner="Kecamatan"
          rowHeaderClass="body-strong"
          cols={urutan}
          rows={kecamatan.daftar.map((kec) => ({ label: kec, cells: urutan.map((p) => kecamatan.jumlah[kec][p]) }))}
          minWidth={96 + urutan.length * 68}
        />
      </Card>
    );
  }

  return (
    <>
      <Baris>
        <Card
          className="flex-[999_1_560px]"
          title="Penerima per program"
          subtitle={fokus ? `${fokus} disorot, program lain ditampilkan sebagai pembanding` : "Jumlah penerima, diurutkan dari terbanyak"}
        >
          <BarList
            label="Penerima per program"
            items={urutan.map((p) => ({
              label: p,
              value: penerima[p],
              share: persen(penerima[p], total),
              sorot: fokus ? p === fokus : undefined,
              onPilih: () => onFokus(p),
            }))}
          />
        </Card>
        {distribusi}
      </Baris>
      <Baris>
        {irisan}
        {kombinasiCard}
      </Baris>
      {kecCard}
      <PenerimaGanda
        key={fokus}
        ganda={fokus ? ganda.filter((g) => g.programs[fokus] === 1) : ganda}
        urutan={urutan}
        fokus={fokus}
        pakaiKecamatan={adaKec}
      />
    </>
  );
}
