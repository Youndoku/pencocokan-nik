import { useState, useMemo } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import SegmentedControl from "../ui/SegmentedControl.jsx";
import { Paginasi } from "../pencocokan/AnomalyTable.jsx";
import { samarkanNIK } from "../../utils/normalize.js";

const PER_PAGE = 25;

/** Kategori baris untuk kolom program sesi ini (Keterangan membedakan status tidak dihitung). */
function kategori(row, kolom) {
  if (Number(row[kolom]) === 1) return "cocok";
  return String(row.Keterangan || "").includes("tidak dihitung") ? "status" : "tidak";
}
const LABEL = { cocok: "Cocok", status: "Status tidak dihitung", tidak: "Tidak cocok" };

/**
 * Kartu "Data hasil": semua baris sesi dengan pencarian, filter kategori,
 * urut per kolom, NIK disamarkan, dan unduh hasil filter.
 */
export default function DataTable({ dataHasil, namaKolomBaru, kolomTersedia, kolomNik, programs = [], pakaiStatus }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [nikLengkap, setNikLengkap] = useState(false);

  // Maksimal 6 kolom data + semua kolom program (urutan file) + Keterangan
  const displayColumns = useMemo(() => {
    if (!kolomTersedia) return [];
    const program = [...programs, namaKolomBaru];
    const data = kolomTersedia.filter((c) => !program.includes(c) && c !== "Keterangan").slice(0, 6);
    const akhir = kolomTersedia.filter((c) => program.includes(c) || c === "Keterangan");
    return [...data, ...akhir];
  }, [kolomTersedia, namaKolomBaru, programs]);

  const filtered = useMemo(() => {
    if (!dataHasil) return [];
    let data = filter === "semua" ? dataHasil : dataHasil.filter((r) => kategori(r, namaKolomBaru) === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((row) => Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q)));
    }

    if (sortCol) {
      data = [...data].sort((a, b) => {
        const cmp = String(a[sortCol] ?? "").localeCompare(String(b[sortCol] ?? ""), "id-ID", { numeric: true });
        return sortAsc ? cmp : -cmp;
      });
    }
    return data;
  }, [dataHasil, search, sortCol, sortAsc, filter, namaKolomBaru]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const hal = Math.min(page, totalPages);
  const paged = filtered.slice((hal - 1) * PER_PAGE, hal * PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
    setPage(1);
  };

  // Kolom Keterangan hanya untuk tampilan, tidak ikut file unduhan.
  const handleExportFiltered = async () => {
    if (filtered.length === 0) return;
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(filtered.map(({ Keterangan: _k, ...r }) => r));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Filter");
    XLSX.writeFile(wb, `data_filtered_${namaKolomBaru || "hasil"}.xlsx`);
  };

  const isi = (row, col) => {
    const val = row[col];
    if (col === namaKolomBaru) return LABEL[kategori(row, col)];
    if (programs.includes(col)) return Number(val) === 1 ? "Cocok" : Number(val) === 2 ? "Tidak cocok" : "";
    if (col === kolomNik && !nikLengkap) return samarkanNIK(val);
    return String(val ?? "");
  };

  const opsiFilter = [
    { value: "semua", label: "Semua" },
    { value: "cocok", label: "Cocok" },
    pakaiStatus && { value: "status", label: "Status tidak dihitung" },
    { value: "tidak", label: "Tidak cocok" },
  ].filter(Boolean);

  return (
    <Card
      title="Data hasil"
      subtitle={`${filtered.length.toLocaleString("id-ID")} baris ditampilkan`}
      action={
        <Button variant="secondary" size="sm" aria-pressed={nikLengkap} onClick={() => setNikLengkap(!nikLengkap)}>
          {nikLengkap ? "Samarkan NIK" : "Tampilkan NIK lengkap"}
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="max-w-[360px] flex-[1_1_260px]"
          placeholder="Cari NIK atau nama"
          aria-label="Cari NIK atau nama"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <SegmentedControl
          label="Filter hasil"
          options={opsiFilter}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        />
        <Button variant="secondary" size="sm" icon={Download} disabled={filtered.length === 0} onClick={handleExportFiltered} className="ml-auto">
          Unduh hasil filter
        </Button>
      </div>

      <div className="max-h-[480px] overflow-auto">
        <table className="w-full border-collapse text-left tabular-nums">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-line">
              {displayColumns.map((col) => (
                <th key={col} scope="col" aria-sort={sortCol === col ? (sortAsc ? "ascending" : "descending") : undefined} className="p-0">
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    className="caption inline-flex cursor-pointer items-center gap-1 whitespace-nowrap border-0 bg-transparent px-2 py-2 text-ink-muted hover:text-lilac-text"
                  >
                    {col}
                    {sortCol === col && <ArrowUpDown size={12} strokeWidth={1.5} aria-hidden="true" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b border-line">
                {displayColumns.map((col) => (
                  <td
                    key={col}
                    className={`body px-2 py-2 ${col === "Keterangan" ? "min-w-[220px]" : "max-w-[180px] truncate whitespace-nowrap"} ${col === namaKolomBaru ? "font-medium" : ""}`}
                  >
                    {isi(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && <p className="body m-0 py-6 text-center text-ink-muted">Tidak ada data yang cocok dengan pencarian.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end">
          <Paginasi hal={hal} jumlahHalaman={totalPages} total={filtered.length} perHalaman={PER_PAGE} onHal={setPage} satuan="baris" />
        </div>
      )}
    </Card>
  );
}
