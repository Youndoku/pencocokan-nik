import { useMemo, useState } from "react";
import { Search, UserCheck } from "lucide-react";
import { detectProgramColumns } from "../../utils/autoDetectColumns.js";

const MIN_QUERY_LENGTH = 3;

export default function NikSearchBox({ sesiTerbaru }) {
  const [query, setQuery] = useState("");

  const dataHasil = sesiTerbaru?.dataHasil ?? null;
  const kolomNik = sesiTerbaru?.konfigurasi?.kolomNikGabungan ?? "";
  const kolomNama = sesiTerbaru?.konfigurasi?.kolomNamaGabungan ?? "";
  const namaKolomBaru = sesiTerbaru?.namaKolomBaru ?? "";

  const programColumns = useMemo(() => {
    if (!dataHasil || dataHasil.length === 0) return [];
    return detectProgramColumns(dataHasil, namaKolomBaru);
  }, [dataHasil, namaKolomBaru]);

  const statusColumns = useMemo(
    () => [...programColumns, namaKolomBaru].filter(Boolean),
    [programColumns, namaKolomBaru]
  );

  const hasil = useMemo(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH || !dataHasil || !kolomNik) return null;
    return dataHasil.filter((row) => String(row[kolomNik] ?? "").includes(q));
  }, [query, dataHasil, kolomNik]);

  const hasilDitampilkan = hasil ? hasil.slice(0, 5) : null;

  if (!sesiTerbaru) return null;

  if (!dataHasil) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-sm text-slate-400">
          Data tidak tersedia untuk pencarian NIK.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <UserCheck size={14} className="text-primary" />
        Cari NIK di data terbaru
      </p>
      <div className="relative mb-2">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          aria-label="Cari NIK di data terbaru"
          placeholder="Ketik NIK..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all"
        />
      </div>

      {hasil && hasil.length === 0 && (
        <p className="text-sm text-slate-400 px-1">
          NIK tidak ditemukan di data terbaru.
        </p>
      )}

      {hasil && hasil.length > 0 && (
        <div className="space-y-2">
          {hasilDitampilkan.map((row, i) => (
            <div
              key={i}
              className="border border-slate-100 rounded-xl p-3 bg-slate-50/60"
            >
              <p className="text-sm font-semibold text-slate-800">
                {String(row[kolomNama] ?? "-")}
              </p>
              <p className="text-xs text-slate-500 mb-2">
                {String(row[kolomNik] ?? "-")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statusColumns.map((col) => {
                  const cocok = Number(row[col]) === 1;
                  return (
                    <span
                      key={col}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        cocok
                          ? "bg-primary/10 text-primary-dark"
                          : "bg-accent-red/10 text-accent-red"
                      }`}
                    >
                      {col}: {cocok ? "Cocok" : "Tidak"}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasil && hasil.length > 5 && (
        <p className="text-xs text-slate-400 px-1 mt-2">
          Menampilkan 5 dari {hasil.length} hasil. Ketik NIK lebih lengkap untuk mempersempit.
        </p>
      )}
    </div>
  );
}
