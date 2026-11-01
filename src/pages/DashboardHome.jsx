import { Link, Navigate, useNavigate } from "react-router-dom";
import { ChartColumnBig, Loader2, Plus, Table } from "lucide-react";
import { useRiwayat } from "../hooks/useRiwayat.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

/** Isi kartu grafik/tabel yang belum ada datanya. */
function BelumAdaData({ jenis = "grafik" }) {
  const Ikon = jenis === "tabel" ? Table : ChartColumnBig;
  return (
    <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center">
      <Ikon size={28} strokeWidth={1.5} aria-hidden="true" className="text-ink-muted" />
      <p className="body-strong m-0">{jenis === "tabel" ? "Tabel ini belum ada datanya" : "Grafik ini belum ada datanya"}</p>
      <p className="caption m-0 text-ink-muted">Data muncul di sini setelah proses data pertama selesai.</p>
    </div>
  );
}

/** Angka 0 untuk kartu ringkasan yang belum ada datanya. */
function Nol({ keterangan, besar = false }) {
  return (
    <div>
      <div className={`${besar ? "amount-xl" : "amount-lg"} tabular-nums text-ink-muted`}>0</div>
      <p className={`${besar ? "body" : "caption"} m-0 text-ink-muted`}>{keterangan}</p>
    </div>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { sesiList, loading } = useRiwayat();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Memuat">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-lilac-main" aria-hidden="true" />
      </div>
    );
  }

  if (sesiList.length > 0) return <Navigate to={`/dashboard/${sesiList[0].id}`} replace />;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="title-lg m-0">Dashboard pencocokan</h1>
          <p className="body m-0 text-ink-muted">Hasil dan analisis lintas program muncul di sini setelah data pertama diproses.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/pencocokan", { state: { mulai: Date.now() } })}>
          Proses data baru
        </Button>
      </header>

      <div role="status" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md bg-surface-muted px-4 py-3">
        <p className="body m-0">
          <span className="body-strong">Belum ada data yang diproses.</span> Siapkan dua file .xlsx: data gabungan dan data pembanding satu program.
        </p>
        <Link to="/bantuan#memulai" className="body-strong whitespace-nowrap text-lilac-main no-underline hover:text-lilac-text">
          Cara memulai
        </Link>
      </div>

      <h2 className="title-sm m-0 mt-2">Hasil sesi</h2>
      <div className="flex flex-wrap items-stretch gap-3">
        <Card className="flex-[999_1_560px]" title="Hasil pemadanan" subtitle="Hasil pencocokan NIK dengan data pembanding">
          <Nol besar keterangan="NIK cocok dari 0 baris data gabungan" />
        </Card>
        <Card className="flex-[1_1_320px]" title="Temuan anomali" subtitle="Sudah diputuskan saat proses">
          <Nol keterangan="data perlu diperiksa" />
        </Card>
      </div>

      <h2 className="title-sm m-0 mt-4">Ringkasan program</h2>
      <div className="flex flex-wrap items-stretch gap-3">
        <Card className="flex-[999_1_560px]" title="Penerima per program" subtitle="Jumlah penerima, diurutkan dari terbanyak">
          <BelumAdaData />
        </Card>
        <Card className="flex-[1_1_320px]" title="Jumlah program per NIK" subtitle="Berapa program yang diterima tiap NIK">
          <BelumAdaData />
        </Card>
      </div>
      <div className="flex flex-wrap items-stretch gap-3">
        <Card
          className="flex-[999_1_560px]"
          title="Irisan antar program"
          subtitle="Jumlah NIK yang menerima dua program sekaligus. Warna makin gelap berarti makin banyak."
        >
          <BelumAdaData />
        </Card>
        <Card className="flex-[1_1_320px]" title="Kombinasi terbanyak" subtitle="Kombinasi program persis yang diterima satu NIK">
          <BelumAdaData jenis="tabel" />
        </Card>
      </div>
      <Card title="Penerima ganda" subtitle="NIK yang cocok di dua program atau lebih">
        <BelumAdaData jenis="tabel" />
      </Card>
    </>
  );
}
