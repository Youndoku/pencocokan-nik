import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Copy, Hash, UserX } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import SearchInput from "../components/ui/SearchInput.jsx";

// Teks disalin dari Bantuan.dc.html, definisi angka 2 mengikuti K3 di spec.
const KODE = [
  { angka: "1", judul: "Cocok", isi: "NIK ditemukan di data pembanding. Kalau kolom status dipilih, statusnya juga termasuk yang dicentang." },
  {
    angka: "2",
    judul: "Tidak cocok",
    isi: "NIK tidak ditemukan di data pembanding, statusnya tidak dicentang saat konfigurasi, atau diabaikan saat pemeriksaan anomali.",
  },
];
const CONTOH = [
  { nik: "357902••••••9916", nama: "Wahyuni Nugroho", kec: "Junrejo", a: "1", b: "1" },
  { nik: "357901••••••4402", nama: "Sri Handayani", kec: "Batu", a: "2", b: "1" },
  { nik: "357903••••••1187", nama: "Agus Santoso", kec: "Bumiaji", a: "1", b: "2" },
];
const LANGKAH_MULAI = [
  { judul: "Unggah dua file", isi: "Pilih data gabungan dan data pembanding. Periksa pratinjau, lalu sesuaikan baris judul kolom kalau tebakan otomatis salah." },
  { judul: "Atur kolom", isi: "Pilih kolom NIK di kedua file. Kolom nama dan status boleh dipilih untuk pemeriksaan tambahan. Isi nama kolom program baru, misalnya Dinkes." },
  { judul: "Periksa temuan anomali", isi: "Putuskan data yang meragukan satu per satu atau sekaligus." },
  { judul: "Lihat hasil", isi: "Hasil tersimpan otomatis sebagai sesi baru. Buka dashboard atau unduh file Excel hasil." },
];
const LANGKAH_TAMBAH = [
  "Pilih Proses data baru di menu.",
  "Di data gabungan, pilih Pakai hasil sesi sebelumnya. Sesi terbaru sudah terpilih otomatis.",
  "Unggah file pembanding program berikutnya, lalu lanjutkan seperti biasa.",
];
const PERHATIAN = [
  "Nama kolom program harus berbeda dari kolom yang sudah ada. Nama yang sama akan ditolak supaya kolom lama tidak tertimpa.",
  "Lanjutkan dari sesi terbaru supaya semua program ikut.",
];
// Ikon disimpan terpisah dari data, karena data ikut dijadikan teks pencarian.
const ANOMALI = [
  {
    judul: "Perbedaan nama",
    isi: "NIK sama, tetapi nama di kedua file berbeda.",
    contoh: "SITI AMINAH dan SITI A.",
    pilihan: [
      { nama: "Validkan", hasil: "Cocok" },
      { nama: "Abaikan", hasil: "Tidak cocok", bawaan: true },
    ],
  },
  {
    judul: "Format NIK tidak standar",
    isi: "NIK kosong, berisi selain angka, atau bukan 16 digit.",
    contoh: "Sel kosong, ada huruf, atau 15 digit.",
    pilihan: [
      { nama: "Cocokkan", hasil: "Tetap dicocokkan", bawaan: true },
      { nama: "Abaikan", hasil: "Tidak cocok" },
    ],
  },
  {
    judul: "NIK duplikat",
    isi: "NIK yang sama muncul lebih dari sekali di satu file.",
    contoh: "NIK sama di baris 12 dan 87.",
    pilihan: [{ nama: "Tidak ada pilihan", hasil: "Baris pertama yang dipakai" }],
  },
];
const IKON_ANOMALI = [UserX, Hash, Copy];
const CATATAN_ANOMALI = "Pilihan bawaan langsung dipakai kalau tidak diubah. Keputusan bisa diambil satu per satu atau sekaligus.";

// Teks dari Bantuan.dc.html, definisi angka 2 mengikuti K3.
const BACA_DASHBOARD = [
  { judul: "Hasil sesi", isi: "Hasil program yang diproses di sesi itu: jumlah cocok, status tidak dihitung, dan tidak cocok." },
  { judul: "Penerima per program", isi: "Jumlah penerima tiap program di file, diurutkan dari terbanyak." },
  { judul: "Jumlah program per NIK", isi: "Berapa NIK yang menerima 0, 1, 2, atau 3 program lebih." },
  { judul: "Irisan antar program", isi: "Jumlah NIK yang menerima dua program sekaligus. Warna makin gelap berarti makin banyak." },
  { judul: "Penerima ganda", isi: "Daftar NIK yang menerima lebih dari satu program, untuk diperiksa lebih lanjut." },
  { judul: "Fokus program", isi: "Filter di judul Ringkasan untuk melihat satu program dan irisannya dengan program lain." },
];

const IkonKotak = ({ ikon: Ikon }) => (
  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-lilac-soft text-lilac-main">
    <Ikon size={16} strokeWidth={1.5} />
  </span>
);
const PRIVASI = [
  "File diproses langsung di browser, tidak diunggah ke server.",
  "Riwayat sesi tersimpan di browser ini saja dan hilang kalau data browser dihapus.",
  "Unduh file Excel hasil untuk sesi yang perlu disimpan atau dibagikan.",
];
const FAQ = [
  {
    tanya: "Kenapa sebagian NIK tidak ditemukan padahal datanya ada?",
    jawab: "Pencocokan memakai NIK yang sama persis setelah dirapikan. NIK yang salah ketik satu digit tidak akan cocok. Periksa juga tab Format NIK tidak standar saat proses.",
  },
  { tanya: "Apakah file asli saya berubah?", jawab: "Tidak. Aplikasi membuat file hasil baru, file asli tetap seperti semula." },
  {
    tanya: "Saya membuka sesi lama, kenapa program lain tidak muncul?",
    jawab: "Sesi lama hanya berisi program sampai sesi itu. Buka sesi terbaru untuk melihat semua program.",
  },
  {
    tanya: "Bisakah dibuka di komputer lain?",
    jawab: "Riwayat tidak ikut pindah. Bawa file Excel hasil terakhir, lalu unggah sebagai data gabungan di komputer lain.",
  },
  {
    tanya: "Kenapa nama kecamatan di dashboard berbeda dari file saya?",
    jawab: 'Dashboard menyamakan tulisan nama kecamatan ke nama resmi Kemendagri: Batu, Bumiaji, dan Junrejo. Huruf besar/kecil, spasi, tanda hubung, awalan "Kec.", dan salah ketik ringan diabaikan, jadi "Bumi Aji", "BUMIAJI", dan "bmiaji" dihitung sebagai Bumiaji. Nama yang terlalu berbeda tetap ditampilkan sesuai tulisan aslinya. File Excel hasil tidak diubah.',
  },
];

// Kata yang pasti punya hasil, ditawarkan saat pencarian kosong.
const SARAN = ["NIK", "anomali", "kecamatan", "Excel", "sesi"];

/** Semua teks di dalam data (string, array, objek) digabung jadi satu untuk pencarian. */
const teksDari = (v) =>
  typeof v === "string" ? v : v && typeof v === "object" ? Object.values(v).map(teksDari).join(" ") : "";

const Langkah = ({ no }) => (
  <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-lilac-soft text-xs font-semibold text-lilac-main">
    {no}
  </span>
);

const TOPIK = [
  {
    id: "kode",
    label: "Arti angka 1 dan 2",
    judul: "Arti angka 1 dan 2 di file Excel hasil",
    sub: "Setiap pencocokan menambah satu kolom program di file hasil. Isinya selalu 1 atau 2.",
    data: [KODE, CONTOH],
    isi: (
      <>
        <div className="flex flex-wrap gap-3">
          {KODE.map((k, i) => (
            <div key={k.angka} className="flex flex-[1_1_280px] gap-3 rounded-[10px] bg-lilac-bg p-4">
              <div
                className={`grid size-10 shrink-0 place-items-center rounded-[10px] text-lg font-semibold tabular-nums ${i === 0 ? "bg-lilac-main text-on-lilac" : "bg-surface-muted text-lilac-text"}`}
              >
                {k.angka}
              </div>
              <div className="flex flex-col gap-1">
                <p className="body-strong m-0">{k.judul}</p>
                <p className="body m-0 text-ink-muted">{k.isi}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="caption-strong m-0">Contoh isi file hasil</p>
          <div className="overflow-x-auto rounded-[10px] border border-line">
            <div role="table" aria-label="Contoh isi file hasil" className="flex min-w-[620px] flex-col tabular-nums">
              {[{ nik: "NIK", nama: "Nama", kec: "Kecamatan", a: "Program A", b: "Program B" }, ...CONTOH].map((r, i) => {
                const sel = i === 0 ? "caption-strong" : "body";
                const role = i === 0 ? "columnheader" : "cell";
                return (
                  <div
                    role="row"
                    key={r.nik}
                    className={`grid grid-cols-[180px_minmax(150px,1fr)_120px_100px_100px] gap-3 px-3 ${i === 0 ? "bg-surface-muted py-2" : "border-t border-line py-2.5"}`}
                  >
                    <div role={role} className={sel}>{r.nik}</div>
                    <div role={role} className={sel}>{r.nama}</div>
                    <div role={role} className={sel}>{r.kec}</div>
                    <div role={role} className={`${i === 0 ? sel : "body-strong"} text-center`}>{r.a}</div>
                    <div role={role} className={`${i === 0 ? sel : "body-strong"} text-center`}>{r.b}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="caption m-0 text-ink-muted">
            Di aplikasi, angka ini ditampilkan sebagai istilah: Cocok, Status tidak dihitung, dan Tidak cocok.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "memulai",
    label: "Memulai pencocokan",
    judul: "Memulai pencocokan",
    sub: "Siapkan dua file .xlsx: data gabungan dan data pembanding satu program.",
    data: LANGKAH_MULAI,
    isi: (
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {LANGKAH_MULAI.map((l, i) => (
          <li key={l.judul} className="flex items-start gap-3">
            <Langkah no={i + 1} />
            <div className="flex flex-col gap-0.5">
              <span className="body-strong">{l.judul}</span>
              <span className="body text-ink-muted">{l.isi}</span>
            </div>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: "tambah",
    label: "Menambah program lain",
    judul: "Menambah program lain",
    sub: "Program dipadankan satu per satu. Setiap sesi melanjutkan hasil sesi sebelumnya.",
    data: [LANGKAH_TAMBAH, PERHATIAN],
    isi: (
      <div className="flex flex-wrap items-stretch gap-3">
        <ol className="m-0 flex flex-[1_1_340px] list-none flex-col gap-3 p-0">
          {LANGKAH_TAMBAH.map((l, i) => (
            <li key={l} className="flex items-start gap-3">
              <Langkah no={i + 1} />
              <span className="body">{l}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-[1_1_280px] flex-col gap-2 rounded-[10px] bg-lilac-soft p-4">
          <p className="body-strong m-0 flex items-center gap-2 text-lilac-main">
            <AlertCircle size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
            Perlu diperhatikan
          </p>
          <ul className="body m-0 flex flex-col gap-1.5 pl-[18px]">
            {PERHATIAN.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "anomali",
    label: "Temuan anomali",
    judul: "Temuan anomali",
    sub: "Muncul sebelum hasil disimpan, hanya kalau ada data yang perlu diperiksa.",
    data: [ANOMALI, CATATAN_ANOMALI],
    isi: (
      <>
        <div className="flex flex-wrap items-stretch gap-3">
          {ANOMALI.map((a, i) => (
            <div key={a.judul} className="flex min-w-0 flex-[1_1_260px] flex-col gap-3 rounded-[10px] border border-line p-4">
              <div className="flex items-center gap-3">
                <IkonKotak ikon={IKON_ANOMALI[i]} />
                <h3 className="body-strong m-0">{a.judul}</h3>
              </div>
              <p className="body m-0 text-ink-muted">{a.isi}</p>
              <p className="caption m-0 rounded-md bg-lilac-bg px-3 py-2">
                <span className="caption-strong">Contoh: </span>
                {a.contoh}
              </p>
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr>
                    <th scope="col" className="caption w-1/2 pb-1.5 font-normal text-ink-muted">Pilihan</th>
                    <th scope="col" className="caption pb-1.5 font-normal text-ink-muted">Hasilnya</th>
                  </tr>
                </thead>
                <tbody>
                  {a.pilihan.map((p) => (
                    <tr key={p.nama} className="border-t border-line align-top">
                      <th scope="row" className="py-2 pr-3 text-left font-normal">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="body-strong">{p.nama}</span>
                          {p.bawaan && <Badge tone="lilac">Bawaan</Badge>}
                        </span>
                      </th>
                      <td className="body py-2">{p.hasil}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <p className="caption m-0 text-ink-muted">{CATATAN_ANOMALI}</p>
      </>
    ),
  },
  {
    id: "dashboard",
    label: "Membaca dashboard",
    judul: "Membaca dashboard",
    sub: "Dashboard selalu menampilkan satu sesi. Sesi terbaru berisi semua program.",
    data: BACA_DASHBOARD,
    isi: (
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 p-0">
        {BACA_DASHBOARD.map((d) => (
          <li key={d.judul} className="flex flex-col gap-1 rounded-[10px] bg-lilac-bg p-4">
            <h3 className="body-strong m-0">{d.judul}</h3>
            <p className="body m-0 text-ink-muted">{d.isi}</p>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "privasi",
    label: "Privasi dan penyimpanan",
    judul: "Privasi dan penyimpanan",
    sub: "Data NIK tidak pernah keluar dari komputer ini.",
    data: PRIVASI,
    isi: (
      <div className="flex flex-col gap-2.5">
        {PRIVASI.map((p) => (
          <div key={p} className="flex items-start gap-2">
            <Check size={16} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
            <p className="body m-0">{p}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "faq",
    label: "Pertanyaan umum",
    judul: "Pertanyaan umum",
    data: FAQ,
    isi: (
      <div>
        {FAQ.map((f, i) => (
          <details key={f.tanya} open={i === 0} className="group border-b border-line last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
              {f.tanya}
              <span aria-hidden="true" className="text-lg leading-none text-ink-muted">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="body mt-0 mb-3.5 text-ink-muted">{f.jawab}</p>
          </details>
        ))}
      </div>
    ),
  },
].map((t) => ({ ...t, teks: teksDari([t.label, t.judul, t.sub, t.data]).toLowerCase() }));

export default function BantuanPage() {
  const [cari, setCari] = useState("");
  const [aktif, setAktif] = useState(TOPIK[0].id);

  const q = cari.trim().toLowerCase();
  const tampil = useMemo(() => (q ? TOPIK.filter((t) => t.teks.includes(q)) : TOPIK), [q]);

  // Buka dengan hash (mis. /bantuan#memulai dari dashboard kosong). Hash tidak dikenal diabaikan.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (TOPIK.some((t) => t.id === id)) document.getElementById(id)?.scrollIntoView();
  }, []);

  // Topik aktif = kartu teratas yang sedang terlihat.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const terlihat = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (terlihat[0]) setAktif(terlihat[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px" }
    );
    tampil.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [tampil]);

  const buka = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(history.state, "", `#${id}`);
    setAktif(id);
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="title-lg m-0">Bantuan</h1>
          <p className="body m-0 text-ink-muted">
            Panduan singkat memakai Pencocokan NIK, dari mengunggah file sampai membaca dashboard.
          </p>
        </div>
        <SearchInput
          placeholder="Cari topik bantuan"
          aria-label="Cari topik bantuan"
          value={cari}
          onChange={setCari}
          className="min-w-[240px] flex-[0_1_360px]"
        />
      </header>

      {q && tampil.length > 0 && (
        <p className="caption m-0 text-ink-muted tabular-nums" role="status">
          {tampil.length} topik cocok dengan “{cari.trim()}”
        </p>
      )}

      {tampil.length === 0 ? (
        <Card role="status">
          <div className="flex flex-col items-start gap-4 rounded-[10px] bg-lilac-bg px-6 py-10">
            <div className="flex max-w-[520px] flex-col gap-1">
              <p className="body-strong m-0 break-words">Tidak ada topik untuk “{cari.trim()}”</p>
              <p className="body m-0 text-ink-muted">
                Coba kata yang lebih umum atau periksa ejaannya. Bisa juga mulai dari salah satu kata ini:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SARAN.map((s) => (
                <Button key={s} variant="secondary" size="sm" onClick={() => setCari(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      ) : (
      <div className="flex flex-wrap items-start gap-4">
        <nav
          aria-label="Topik bantuan"
          className="flex w-full flex-col gap-0.5 rounded-lg bg-surface p-3 shadow-card md:sticky md:top-5 md:w-auto md:max-w-[280px] md:flex-[1_1_220px]"
        >
          <p className="caption m-0 mb-1.5 px-3 text-ink-muted">Topik</p>
          {tampil.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              onClick={(e) => buka(e, t.id)}
              aria-current={aktif === t.id ? "location" : undefined}
              className={`flex min-h-9 items-center rounded-md px-3 text-sm no-underline ${aktif === t.id ? "bg-lilac-soft font-medium text-lilac-main" : "text-lilac-text hover:bg-surface-muted"}`}
            >
              {t.label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3">
          {tampil.map((t) => (
            <Card key={t.id} id={t.id} title={t.judul} subtitle={t.sub} className="scroll-mt-5">
              {t.isi}
            </Card>
          ))}
        </div>
      </div>
      )}
    </>
  );
}
