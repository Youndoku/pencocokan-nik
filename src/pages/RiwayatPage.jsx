import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Plus } from "lucide-react";
import { useRiwayat } from "../hooks/useRiwayat.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import NikSearchBox from "../components/riwayat/NikSearchBox.jsx";
import DaftarSesi from "../components/riwayat/DaftarSesi.jsx";
import KonfirmasiDialog from "../components/ui/KonfirmasiDialog.jsx";

const SUB_DAFTAR = "Setiap sesi menambah satu kolom program. Sesi terbaru berisi semua program.";

export default function RiwayatPage() {
  const { sesiList, jumlahSesi, loading, hapusBanyakSesi } = useRiwayat();
  const [hapusSemua, setHapusSemua] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-lilac-main" aria-label="Memuat" />
      </div>
    );
  }

  const ada = jumlahSesi > 0;

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="title-lg m-0">Riwayat dan pencarian</h1>
        <p className="body m-0 text-ink-muted">
          Cari NIK di data terbaru, buka kembali sesi lama, atau hapus sesi yang tidak dipakai.
        </p>
      </header>

      <div className="flex flex-wrap items-stretch gap-3">
        <NikSearchBox key={sesiList[0]?.id ?? "kosong"} sesi={sesiList[0] ?? null} className="flex-[999_1_560px]" />

        <Card title="Penyimpanan" subtitle="Riwayat hanya tersimpan di browser ini" className="flex-[1_1_320px]">
          <div>
            <div className="amount-lg tabular-nums">{jumlahSesi}</div>
            <p className="caption m-0 text-ink-muted">sesi tersimpan</p>
          </div>
          {ada ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Lock size={16} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                  <p className="body m-0">Data tidak dikirim ke server.</p>
                </div>
                <p className="body m-0 text-ink-muted">
                  Riwayat akan hilang kalau data browser dihapus atau aplikasi dibuka di komputer lain. Unduh Excel hasil yang perlu disimpan.
                </p>
              </div>
              <div>
                <Button variant="secondary" size="sm" onClick={() => setHapusSemua(true)}>
                  Hapus semua riwayat
                </Button>
              </div>
            </>
          ) : (
            <p className="body m-0 text-ink-muted">Data tidak dikirim ke server.</p>
          )}
        </Card>
      </div>

      <Card
        title={
          <span className="flex items-center gap-2">
            Daftar sesi
            {ada && (
              <span className="micro inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lilac-text px-[5px] text-on-lilac tabular-nums">
                {jumlahSesi}
              </span>
            )}
          </span>
        }
        subtitle={SUB_DAFTAR}
      >
        {ada ? (
          <DaftarSesi sesiList={sesiList} onHapus={hapusBanyakSesi} />
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[10px] bg-lilac-bg px-6 py-10">
            <div className="flex max-w-[520px] flex-col gap-1">
              <p className="body-strong m-0">Belum ada sesi</p>
              <p className="body m-0 text-ink-muted">
                Sesi muncul di sini setelah proses data pertama selesai. Dari sini Anda bisa membuka dashboard sesi lama, mengunduh hasilnya lagi, atau menghapusnya.
              </p>
            </div>
            <Button variant="secondary" icon={Plus} onClick={() => navigate("/pencocokan", { state: { mulai: Date.now() } })}>
              Proses data baru
            </Button>
          </div>
        )}
      </Card>

      <KonfirmasiDialog
        open={hapusSemua}
        judul="Hapus semua riwayat?"
        pesan={`Semua ${jumlahSesi} sesi akan dihapus dari browser ini dan tidak bisa dikembalikan. Unduh Excel hasil yang masih diperlukan dulu.`}
        labelHapus="Hapus semua"
        onBatal={() => setHapusSemua(false)}
        onHapus={async () => {
          await hapusBanyakSesi(sesiList.map((s) => s.id));
          setHapusSemua(false);
        }}
      />
    </>
  );
}
