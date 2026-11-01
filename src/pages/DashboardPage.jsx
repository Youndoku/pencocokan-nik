import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { useRiwayat } from "../hooks/useRiwayat.js";
import { useDashboard } from "../hooks/useDashboard.js";
import { kolomProgramSesi, ringkasDaftar } from "../utils/autoDetectColumns.js";
import { unduhExcelSesi } from "../utils/unduh.js";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Select from "../components/ui/Select.jsx";
import HasilPemadanan from "../components/dashboard/HasilPemadanan.jsx";
import TemuanAnomali from "../components/dashboard/TemuanAnomali.jsx";
import RingkasanProgram from "../components/dashboard/RingkasanProgram.jsx";
import DataTable from "../components/dashboard/DataTable.jsx";
import AnomalyTable from "../components/pencocokan/AnomalyTable.jsx";

/**
 * Bentuk ulang anomali sesi tersimpan ke format AnomalyTable. Keputusan perbedaan
 * nama hanya tersimpan di mismatchLog ("Keputusan User"); baris "Perlu Konfirmasi"
 * adalah nama berbeda yang tidak pernah ditanyakan di langkah 3 (status tidak dihitung,
 * atau format NIK tidak standar sehingga perbedaan nama tidak dipindai).
 */
function anomaliDariSesi(sesi) {
  const log = sesi.mismatchLog || [];
  const [kolomGab, kolomPem] = log.length ? Object.keys(log[0]).filter((key) => key.startsWith("Nama (")) : [];
  const nameRes = {};
  const nameMismatches = log.map((m, i) => {
    const id = `nm-${i}`;
    const k = String(m["Keputusan User"] || "");
    nameRes[id] = k.startsWith("Divalidkan") ? "valid" : k.startsWith("Abaikan") ? "abaikan" : "lewat";
    return { id, nik: String(m.NIK ?? ""), nameGabungan: m[kolomGab], namePembanding: m[kolomPem] };
  });
  return {
    anomalies: { nameMismatches, invalidNiks: sesi.invalidNiks || [], duplicateNiks: sesi.duplicateNiks || [] },
    nameRes,
    nikRes: sesi.invalidNikResolutions || {},
  };
}

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sesiList, ambilSesi } = useRiwayat();
  const [sesi, setSesi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailTerbuka, setDetailTerbuka] = useState(false);
  const detailRef = useRef(null);

  useEffect(() => {
    let batal = false;
    setLoading(true);
    setDetailTerbuka(false);
    ambilSesi(id).then((data) => {
      if (batal) return;
      setSesi(data);
      setLoading(false);
    });
    return () => {
      batal = true;
    };
  }, [id, ambilSesi]);

  useEffect(() => {
    if (detailTerbuka) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [detailTerbuka]);

  const a = useDashboard(sesi);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Memuat sesi">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-lilac-main" aria-hidden="true" />
      </div>
    );
  }

  if (!sesi) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="body m-0 text-ink-muted">Sesi tidak ditemukan.</p>
        <Button as={Link} to="/riwayat" variant="secondary">
          Buka riwayat
        </Button>
      </div>
    );
  }

  // Nomor sesi = urutan menurut tanggal naik (sesiList terbaru di atas).
  const nomor = (s) => sesiList.length - sesiList.findIndex((x) => x.id === s.id);
  const terbaru = sesiList[0];
  const programs = a.programs;
  const k = programs.length;
  const fokusParam = searchParams.get("fokus") || "";
  const fokus = k >= 2 && programs.includes(fokusParam) ? fokusParam : "";
  const setFokus = (p) => setSearchParams(p ? { fokus: p } : {}, { replace: true });

  let infoSesiLama = null;
  let terbaruUntukKosong = null;
  if (terbaru && terbaru.id !== sesi.id) {
    const programTerbaru = kolomProgramSesi(terbaru);
    const satuRantai = programs.every((p) => programTerbaru.includes(p));
    const m = nomor(terbaru);
    infoSesiLama = satuRantai
      ? `Filenya baru berisi ${ringkasDaftar(programs)}. Semua ${programTerbaru.length} program ada di Sesi ${m}, sesi terbaru.`
      : `Sesi terbaru adalah Sesi ${m}.`;
    if (satuRantai && programTerbaru.length > 1) terbaruUntukKosong = { nomor: m, jumlahProgram: programTerbaru.length };
  }

  const r = sesi.ringkasan || {};
  const konf = sesi.konfigurasi || {};
  const pakaiStatus = Boolean(konf.kolomStatusPembanding) && (konf.statusTerpilih?.length || 0) > 0;
  const anomali = anomaliDariSesi(sesi);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="title-lg m-0">Dashboard pencocokan</h1>
            <Badge>Berisi {k} program</Badge>
          </div>
          <p className="body m-0 text-ink-muted">
            {sesi.namaGabungan} dibandingkan dengan {sesi.namaPembanding}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            label="Ganti sesi"
            value={sesi.id}
            onChange={(sid) => navigate(`/dashboard/${sid}${fokusParam ? `?fokus=${encodeURIComponent(fokusParam)}` : ""}`)}
            options={sesiList.map((s) => ({ value: s.id, label: `Sesi ${nomor(s)}: ${s.namaKolomBaru}` }))}
          />
          <Button variant="secondary" size="sm" disabled={!sesi.excelBuffer} onClick={() => unduhExcelSesi(sesi)}>
            Unduh Excel
          </Button>
        </div>
      </header>

      {infoSesiLama && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md bg-surface-muted px-4 py-3">
          <p className="body m-0">
            <span className="body-strong">Ini sesi lama.</span> {infoSesiLama}
          </p>
          <Link to={`/dashboard/${terbaru.id}`} className="body-strong inline-flex items-center gap-1 whitespace-nowrap text-lilac-main no-underline hover:text-lilac-text">
            Buka Sesi {nomor(terbaru)}
            <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
      )}

      <h2 className="title-sm m-0 mt-2">Hasil sesi</h2>
      <div className="flex flex-wrap items-stretch gap-3">
        <HasilPemadanan
          className="flex-[999_1_560px]"
          total={r.total}
          cocok={r.cocok}
          tidak={r.tidak}
          dikecualikanStatus={r.dikecualikanStatus || 0}
          pakaiStatus={pakaiStatus}
          namaKolomBaru={sesi.namaKolomBaru}
        />
        <TemuanAnomali
          className="flex-[1_1_320px]"
          data={anomali}
          terbuka={detailTerbuka}
          onLihat={() => setDetailTerbuka(!detailTerbuka)}
        />
      </div>
      {detailTerbuka && (
        <div id="detail-anomali" ref={detailRef} className="scroll-mt-4">
          <AnomalyTable title="Detail anomali" anomalies={anomali.anomalies} nameRes={anomali.nameRes} nikRes={anomali.nikRes} />
        </div>
      )}

      {k > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="title-sm m-0">Ringkasan {k} program</h2>
          {k >= 2 && (
            <label className="flex items-center gap-2">
              <span className="caption-strong text-ink-muted">Fokus program</span>
              <Select
                value={fokus}
                onChange={setFokus}
                options={[{ value: "", label: "Semua program" }, ...programs.map((p) => ({ value: p, label: p }))]}
              />
            </label>
          )}
        </div>
      )}
      <RingkasanProgram a={a} total={r.total || sesi.dataHasil?.length || 0} fokus={fokus} onFokus={setFokus} terbaru={terbaruUntukKosong} />

      <DataTable
        key={sesi.id}
        dataHasil={sesi.dataHasil}
        namaKolomBaru={sesi.namaKolomBaru}
        kolomTersedia={sesi.kolomTersedia}
        kolomNik={konf.kolomNikGabungan}
        programs={programs}
        pakaiStatus={pakaiStatus}
      />
    </>
  );
}
