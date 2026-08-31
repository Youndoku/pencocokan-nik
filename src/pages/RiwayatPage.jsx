import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRiwayat } from "../hooks/useRiwayat.js";
import SessionCard from "../components/riwayat/SessionCard.jsx";
import StorageInfo from "../components/riwayat/StorageInfo.jsx";
import {
  History,
  Search,
  Trash2,
  PlusCircle,
  ArrowUpDown,
  Loader2,
  Inbox,
} from "lucide-react";

export default function RiwayatPage() {
  const navigate = useNavigate();
  const { sesiList, jumlahSesi, loading, hapusSesi, hapusBanyakSesi, totalUkuran } =
    useRiwayat();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("tanggal"); // tanggal | persentase
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filtered = useMemo(() => {
    let list = sesiList;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.namaGabungan.toLowerCase().includes(q) ||
          s.namaPembanding.toLowerCase().includes(q) ||
          (s.namaKolomBaru || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "persentase") {
      list = [...list].sort(
        (a, b) => (b.ringkasan?.persentase || 0) - (a.ringkasan?.persentase || 0)
      );
    }
    // Default: already sorted by tanggal descending from hook

    return list;
  }, [sesiList, search, sortBy]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Hapus ${selectedIds.size} sesi yang dipilih? Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;
    await hapusBanyakSesi(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <History size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Riwayat Pencocokan
          </h1>
          <p className="text-xs text-slate-500">
            {jumlahSesi} sesi tersimpan di perangkat ini
          </p>
        </div>
      </div>

      {jumlahSesi === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <Inbox size={28} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Belum ada riwayat pencocokan
          </p>
          <button
            onClick={() => navigate("/pencocokan")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <PlusCircle size={14} />
            Mulai Pencocokan
          </button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari nama file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
            </div>

            <button
              onClick={() =>
                setSortBy(sortBy === "tanggal" ? "persentase" : "tanggal")
              }
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowUpDown size={13} />
              {sortBy === "tanggal" ? "Tanggal" : "% Cocok"}
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer animate-fade-in"
              >
                <Trash2 size={13} />
                Hapus ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Session list */}
          <div className="space-y-3">
            {filtered.map((sesi) => (
              <SessionCard
                key={sesi.id}
                sesi={sesi}
                selected={selectedIds.has(sesi.id)}
                onToggleSelect={() => toggleSelect(sesi.id)}
                onHapus={async (id) => {
                  if (window.confirm("Hapus sesi ini?")) {
                    await hapusSesi(id);
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      next.delete(id);
                      return next;
                    });
                  }
                }}
              />
            ))}
          </div>

          {/* Storage info */}
          <div className="mt-6">
            <StorageInfo totalUkuran={totalUkuran} jumlahSesi={jumlahSesi} />
          </div>
        </>
      )}
    </div>
  );
}
