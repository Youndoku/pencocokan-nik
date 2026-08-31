import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
} from "lucide-react";

const PER_PAGE = 25;

export default function DataTable({ dataHasil, namaKolomBaru, kolomTersedia }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // all | cocok | tidak

  // Columns to display (limit to manageable number)
  const displayColumns = useMemo(() => {
    if (!kolomTersedia) return [];
    // Show max 8 columns, prioritizing NIK, Nama, result column, Keterangan
    const priority = [namaKolomBaru, "Keterangan"];
    const prioritized = priority.filter((c) => kolomTersedia.includes(c));
    const rest = kolomTersedia.filter((c) => !priority.includes(c)).slice(0, 6);
    return [...rest, ...prioritized];
  }, [kolomTersedia, namaKolomBaru]);

  const filtered = useMemo(() => {
    if (!dataHasil) return [];
    let data = dataHasil;

    // Status filter
    if (statusFilter === "cocok" && namaKolomBaru) {
      data = data.filter((r) => Number(r[namaKolomBaru]) === 1);
    } else if (statusFilter === "tidak" && namaKolomBaru) {
      data = data.filter((r) => Number(r[namaKolomBaru]) !== 1);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    // Sort
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const valA = a[sortCol] ?? "";
        const valB = b[sortCol] ?? "";
        const cmp = String(valA).localeCompare(String(valB), "id-ID", {
          numeric: true,
        });
        return sortAsc ? cmp : -cmp;
      });
    }

    return data;
  }, [dataHasil, search, sortCol, sortAsc, statusFilter, namaKolomBaru]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
    setPage(1);
  };

  const handleExportFiltered = async () => {
    if (filtered.length === 0) return;
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Filter");
    XLSX.writeFile(wb, `data_filtered_${namaKolomBaru || "hasil"}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Tabel Data</h3>
        <span className="text-[10px] text-slate-400">
          {filtered.length.toLocaleString("id-ID")} baris
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        {/* Quick filters */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {[
            { val: "all", label: "Semua" },
            { val: "cocok", label: "Cocok" },
            { val: "tidak", label: "Tidak" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => {
                setStatusFilter(f.val);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                statusFilter === f.val
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportFiltered}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-slate-200">
              {displayColumns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-left py-2 px-2 text-slate-500 font-medium cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    {sortCol === col && (
                      <ArrowUpDown size={10} className="text-indigo-500" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-50 hover:bg-slate-50/50"
              >
                {displayColumns.map((col) => {
                  const val = row[col];
                  const isResult = col === namaKolomBaru;
                  return (
                    <td
                      key={col}
                      className={`py-1.5 px-2 max-w-[180px] truncate ${
                        isResult
                          ? Number(val) === 1
                            ? "text-emerald-600 font-bold"
                            : "text-red-500 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      {isResult
                        ? Number(val) === 1
                          ? "1 (Cocok)"
                          : "2 (Tidak)"
                        : String(val ?? "")}
                    </td>
                  );
                })}
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
