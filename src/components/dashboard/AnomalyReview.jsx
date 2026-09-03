import { useState } from "react";
import { ShieldAlert, Search, ChevronLeft, ChevronRight } from "lucide-react";

const LABEL_FILE = {
  gabungan: "Data Gabungan",
  pembanding: "Data Pembanding",
};

const LABEL_NIK_RESOLUSI = {
  valid: "Tetap Dicocokkan",
  abaikan: "Diabaikan",
};

const KETERANGAN_TAB = {
  name: "NIK yang sama ditemukan di kedua file, tapi nama di file gabungan dan file pembanding berbeda. Kolom Keputusan menunjukkan apakah baris ini dianggap cocok (divalidkan) atau tidak (diabaikan) saat proses berjalan.",
  nik: "NIK di file gabungan tidak sesuai format standar (16 digit angka), lihat kolom Masalah untuk alasannya. Kolom Keputusan menunjukkan apakah baris ini tetap dicoba dicocokkan atau diabaikan.",
  duplicate: "NIK ini muncul lebih dari sekali di file yang sama. Pencocokan hanya memakai kemunculan pertama per NIK — baris lain dengan NIK yang sama bisa jadi tercocokkan ke nama yang salah tanpa disadari.",
};

/**
 * Kartu review anomali di Dashboard per-sesi — read-only, murni untuk
 * cross-check manual setelah proses selesai. Menampilkan apa yang
 * ditemukan saat wizard (perbedaan nama, NIK tidak valid, NIK duplikat)
 * beserta keputusan yang diambil saat itu. Tidak ada aksi ubah keputusan
 * di sini — kalau perlu revisi, user proses ulang dari awal.
 */
export default function AnomalyReview({
  mismatchLog = [],
  invalidNiks = [],
  invalidNikResolutions = {},
  duplicateNiks = [],
}) {
  // Semua hook harus dipanggil sebelum early return apa pun (Rules of Hooks) —
  // props ini bisa berubah antar render (mis. saat sesi lain dimuat).
  const [activeTab, setActiveTab] = useState(
    mismatchLog.length > 0 ? "name" : invalidNiks.length > 0 ? "nik" : "duplicate"
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const hasAnomali =
    mismatchLog.length > 0 || invalidNiks.length > 0 || duplicateNiks.length > 0;
  if (!hasAnomali) return null;

  // Kolom nama di mismatchLog dinamis (nama file sebagai bagian header)
  const namaKeys =
    mismatchLog.length > 0
      ? Object.keys(mismatchLog[0]).filter((k) => k.startsWith("Nama ("))
      : [];

  const setTabAndReset = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setPage(1);
  };

  const filteredMismatch = mismatchLog.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q));
  });
  const filteredInvalid = invalidNiks.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (item.nikRaw || "").toLowerCase().includes(q) ||
      (item.name || "").toLowerCase().includes(q) ||
      (item.reason || "").toLowerCase().includes(q)
    );
  });
  const filteredDuplicate = duplicateNiks.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      item.nik.toLowerCase().includes(q) ||
      item.baris.some((b) => (b.name || "").toLowerCase().includes(q))
    );
  });

  const activeList =
    activeTab === "name" ? filteredMismatch : activeTab === "nik" ? filteredInvalid : filteredDuplicate;
  const pagesCount = Math.max(1, Math.ceil(activeList.length / itemsPerPage));
  const currentItems = activeList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-neutral-900" />
        <h2 className="text-base font-semibold text-slate-800">Review Anomali</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        {mismatchLog.length > 0 && (
          <button
            onClick={() => setTabAndReset("name")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "name"
                ? "border-primary text-primary-dark font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Perbedaan Nama
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
              {mismatchLog.length}
            </span>
          </button>
        )}
        {invalidNiks.length > 0 && (
          <button
            onClick={() => setTabAndReset("nik")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "nik"
                ? "border-primary text-primary-dark font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            NIK Tidak Valid
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
              {invalidNiks.length}
            </span>
          </button>
        )}
        {duplicateNiks.length > 0 && (
          <button
            onClick={() => setTabAndReset("duplicate")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "duplicate"
                ? "border-primary text-primary-dark font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            NIK Duplikat
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
              {duplicateNiks.length}
            </span>
          </button>
        )}
      </div>

      {/* Keterangan */}
      <p className="text-sm text-slate-500 leading-relaxed mb-3">
        {KETERANGAN_TAB[activeTab]}
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-lg mb-3">
        <table className="w-full text-sm border-collapse">
          {activeTab === "name" && (
            <>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">NIK</th>
                  {namaKeys.map((k) => (
                    <th key={k} className="text-left px-3 py-2 text-slate-500 font-semibold">
                      {k}
                    </th>
                  ))}
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-mono text-slate-600">{item.NIK}</td>
                      {namaKeys.map((k) => (
                        <td key={k} className="px-3 py-2.5 text-slate-800 font-medium">
                          {item[k]}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-slate-600">{item["Keputusan User"]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={namaKeys.length + 2} className="text-center py-6 text-slate-400 italic">
                      Tidak ada yang cocok dengan kata kunci
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}

          {activeTab === "nik" && (
            <>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold w-12">Baris</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">NIK di File</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Nama</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold text-neutral-900">Masalah</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-mono text-slate-400">{item.rowIdx + 2}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600 font-semibold">
                        {item.nikRaw || "(kosong)"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 font-medium">{item.name}</td>
                      <td className="px-3 py-2.5 text-neutral-900 font-medium">{item.reason}</td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {LABEL_NIK_RESOLUSI[invalidNikResolutions[item.id]] || "Tetap Dicocokkan"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                      Tidak ada yang cocok dengan kata kunci
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}

          {activeTab === "duplicate" && (
            <>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">NIK</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">File</th>
                  <th className="text-center px-3 py-2 text-slate-500 font-semibold w-20">Jumlah</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Baris & Nama</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-mono text-slate-600">{item.nik}</td>
                      <td className="px-3 py-2.5 text-slate-600">{LABEL_FILE[item.file] || item.file}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-neutral-900">{item.jumlah}</td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {item.baris
                          .map((b) => `Baris ${b.rowIdx + 2}${b.name ? ` (${b.name})` : ""}`)
                          .join(", ")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400 italic">
                      Tidak ada yang cocok dengan kata kunci
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}
        </table>
      </div>

      {/* Pagination */}
      {pagesCount > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, activeList.length)} dari {activeList.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold px-2">
              {page} / {pagesCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagesCount, p + 1))}
              disabled={page === pagesCount}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
