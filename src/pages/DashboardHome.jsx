import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { useRiwayat } from "../hooks/useRiwayat.js";
import Button from "../components/ui/Button.jsx";

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
      <header className="flex flex-col gap-2">
        <h1 className="title-lg m-0">Dashboard pencocokan</h1>
        <p className="body m-0 text-ink-muted">Hasil dan analisis lintas program muncul di sini setelah data pertama diproses.</p>
      </header>

      <section aria-labelledby="h-kosong" className="mx-auto mt-16 flex w-full max-w-[640px] flex-col gap-6 rounded-lg bg-surface p-8 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 id="h-kosong" className="title-lg m-0">
            Belum ada data yang diproses
          </h2>
          <p className="body m-0 text-ink-muted">
            Padankan data gabungan dengan data pembanding satu program. Setiap proses tersimpan otomatis sebagai sesi.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 border-t border-line pt-5">
          <p className="caption-strong m-0 text-ink-muted">Siapkan dua file .xlsx</p>
          <dl className="m-0 grid grid-cols-[140px_1fr] gap-x-4 gap-y-2">
            <dt className="body-strong">Data gabungan</dt>
            <dd className="body m-0 text-ink-muted">Data induk yang akan diberi kolom program</dd>
            <dt className="body-strong">Data pembanding</dt>
            <dd className="body m-0 text-ink-muted">Daftar penerima satu program dari OPD</dd>
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button icon={Plus} onClick={() => navigate("/pencocokan", { state: { mulai: Date.now() } })}>
            Proses data baru
          </Button>
          <Link to="/bantuan#memulai" className="body-strong text-lilac-main no-underline hover:text-lilac-text">
            Cara memulai
          </Link>
        </div>
      </section>
    </>
  );
}
