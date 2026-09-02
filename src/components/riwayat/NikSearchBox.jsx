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
    return dataHasil
      .filter((row) => String(row[kolomNik] ?? "").includes(q))
      .slice(0, 5);
  }, [query, dataHasil, kolomNik]);

  if (!sesiTerbaru) return null;

  if (!dataHasil) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-xs text-slate-400">
          Data tidak tersedia untuk pencarian NIK.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <UserCheck size={14} className="text-indigo-500" />
        Cari NIK di data terbaru
      </p>
      <div className="relative mb-2">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Ketik NIK..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
        />
      </div>

      {hasil && hasil.length === 0 && (
        <p className="text-xs text-slate-400 px-1">
          NIK tidak ditemukan di data terbaru.
        </p>
      )}

      {hasil && hasil.length > 0 && (
        <div className="space-y-2">
          {hasil.map((row, i) => (
            <div
              key={i}
              className="border border-slate-100 rounded-xl p-3 bg-slate-50/60"
            >
              <p className="text-xs font-semibold text-slate-800">
                {String(row[kolomNama] ?? "-")}
              </p>
              <p className="text-[11px] text-slate-500 mb-2">
                {String(row[kolomNik] ?? "-")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statusColumns.map((col) => {
                  const cocok = Number(row[col]) === 1;
                  return (
                    <span
                      key={col}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cocok
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
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
    </div>
  );
}
