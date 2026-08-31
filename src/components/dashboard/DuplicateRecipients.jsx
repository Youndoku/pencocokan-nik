import { useState, useMemo } from "react";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 15;

export default function DuplicateRecipients({ penerimaGanda, programColumns }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return penerimaGanda;
    const q = search.toLowerCase();
    return penerimaGanda.filter(
      (r) =>
        r.nik.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q)
    );
  }, [penerimaGanda, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (!penerimaGanda || penerimaGanda.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Users size={15} className="text-amber-500" />
          Penerima Bantuan Ganda
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-semibold">
            {penerimaGanda.length.toLocaleString("id-ID")} orang
          </span>
        </h3>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Cari NIK atau nama..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 text-slate-500 font-medium">
                NIK
              </th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">
                Nama
              </th>
              {programColumns.map((col) => (
                <th
                  key={col}
                  className="text-center py-2 px-1 text-slate-500 font-medium"
                >
                  {col}
                </th>
              ))}
              <th className="text-center py-2 px-2 text-slate-500 font-medium">
                Jml
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => (
              <tr
                key={i}
                className="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td className="py-2 px-2 font-mono text-slate-700">
                  {r.nik}
                </td>
                <td className="py-2 px-2 text-slate-700 max-w-[150px] truncate">
                  {r.nama}
                </td>
                {programColumns.map((col) => (
                  <td key={col} className="text-center py-2 px-1">
                    {r.programs[col] === 1 ? (
                      <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold leading-5">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
                <td className="text-center py-2 px-2">
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                    {r.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-[10px] text-slate-400">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={14} className="text-slate-500" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
