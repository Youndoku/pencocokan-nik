import { useState } from "react";
import { AlertCircle, CheckCircle, HelpCircle, ShieldAlert, ChevronLeft, ChevronRight, Search, Check, Ban, Copy } from "lucide-react";

const LABEL_FILE = {
  gabungan: "Data Gabungan",
  pembanding: "Data Pembanding",
};

/**
 * UI Langkah 3: Konfirmasi Anomali.
 * Memungkinkan user meninjau data anomali (Perbedaan Nama, Format NIK Tidak
 * Standar, dan NIK Duplikat), memvalidkan atau mengabaikan satu per satu
 * atau secara massal, sebelum menyelesaikan pencocokan. NIK Duplikat murni
 * informasional (matching tetap memakai kemunculan pertama per NIK) — di
 * sini cuma supaya user sadar ada NIK yang muncul lebih dari sekali.
 */
export default function AnomalyStep({
  anomalies,
  nameMismatchResolutions,
  invalidNikResolutions,
  onSetNameResolution,
  onSetNikResolution,
  onBulkNameResolution,
  onBulkNikResolution,
  onBack,
  onNext,
  loadingMatching,
}) {
  const { nameMismatches = [], invalidNiks = [], duplicateNiks = [] } = anomalies;
  const [activeTab, setActiveTab] = useState(
    nameMismatches.length > 0 ? "name" : invalidNiks.length > 0 ? "nik" : "duplicate"
  );

  // Search & Pagination States
  const [nameSearch, setNameSearch] = useState("");
  const [nikSearch, setNikSearch] = useState("");
  const [duplicateSearch, setDuplicateSearch] = useState("");
  const [namePage, setNamePage] = useState(1);
  const [nikPage, setNikPage] = useState(1);
  const [duplicatePage, setDuplicatePage] = useState(1);
  const itemsPerPage = 10;

  // Filtered lists
  const filteredNameMismatches = nameMismatches.filter((item) => {
    const q = nameSearch.toLowerCase();
    return (
      item.nik.toLowerCase().includes(q) ||
      item.nameGabungan.toLowerCase().includes(q) ||
      item.namePembanding.toLowerCase().includes(q)
    );
  });

  const filteredInvalidNiks = invalidNiks.filter((item) => {
    const q = nikSearch.toLowerCase();
    return (
      item.nikRaw.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    );
  });

  const filteredDuplicateNiks = duplicateNiks.filter((item) => {
    const q = duplicateSearch.toLowerCase();
    if (!q) return true;
    return (
      item.nik.toLowerCase().includes(q) ||
      item.baris.some((b) => b.name.toLowerCase().includes(q))
    );
  });

  // Pages counts
  const namePagesCount = Math.max(1, Math.ceil(filteredNameMismatches.length / itemsPerPage));
  const nikPagesCount = Math.max(1, Math.ceil(filteredInvalidNiks.length / itemsPerPage));
  const duplicatePagesCount = Math.max(1, Math.ceil(filteredDuplicateNiks.length / itemsPerPage));

  // Current page items
  const currentNameItems = filteredNameMismatches.slice(
    (namePage - 1) * itemsPerPage,
    namePage * itemsPerPage
  );
  const currentNikItems = filteredInvalidNiks.slice(
    (nikPage - 1) * itemsPerPage,
    nikPage * itemsPerPage
  );
  const currentDuplicateItems = filteredDuplicateNiks.slice(
    (duplicatePage - 1) * itemsPerPage,
    duplicatePage * itemsPerPage
  );

  return (
    <div className="animate-fade-in">
      {/* Intro Alert */}
      <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200 rounded-xl p-4 mb-4 shadow-xs">
        <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-sm font-semibold text-amber-900 m-0 mb-1">
            Konfirmasi Temuan Anomali Data
          </h4>
          <p className="text-xs text-amber-800 m-0 leading-relaxed">
            Ditemukan data yang tidak sinkron. Mohon pilih apakah ingin
            <strong> memvalidkan </strong> data tersebut (dianggap cocok) atau
            <strong> mengabaikan </strong> (dianggap tidak cocok) sebelum menyimpan hasil.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 mb-4 bg-white rounded-t-xl px-1 pt-1">
        {nameMismatches.length > 0 && (
          <button
            onClick={() => setActiveTab("name")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "name"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Perbedaan Nama
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "name" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {nameMismatches.length}
            </span>
          </button>
        )}

        {invalidNiks.length > 0 && (
          <button
            onClick={() => setActiveTab("nik")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "nik"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Format NIK Tidak Standar
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "nik" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {invalidNiks.length}
            </span>
          </button>
        )}

        {duplicateNiks.length > 0 && (
          <button
            onClick={() => setActiveTab("duplicate")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "duplicate"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            NIK Duplikat
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "duplicate" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {duplicateNiks.length}
            </span>
          </button>
        )}
      </div>

      {/* Tab 1: Perbedaan Nama */}
      {activeTab === "name" && nameMismatches.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-4 shadow-sm mb-5">
          {/* Saring & Massal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari NIK atau Nama..."
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value);
                  setNamePage(1);
                }}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onBulkNameResolution("valid")}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Check size={13} /> Validkan Semua
              </button>
              <button
                onClick={() => onBulkNameResolution("abaikan")}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Ban size={13} /> Abaikan Semua
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">NIK</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Nama (Gabungan)</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Nama (Pembanding)</th>
                  <th className="text-center px-3 py-2 text-slate-500 font-semibold w-36">Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {currentNameItems.length > 0 ? (
                  currentNameItems.map((item) => {
                    const res = nameMismatchResolutions[item.id] || "abaikan";
                    return (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-mono text-slate-600">{item.nik}</td>
                        <td className="px-3 py-2.5 text-slate-800 font-medium">{item.nameGabungan}</td>
                        <td className="px-3 py-2.5 text-slate-800 font-medium">{item.namePembanding}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                            <button
                              onClick={() => onSetNameResolution(item.id, "valid")}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                res === "valid"
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-800"
                              }`}
                            >
                              Validkan
                            </button>
                            <button
                              onClick={() => onSetNameResolution(item.id, "abaikan")}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                res === "abaikan"
                                  ? "bg-slate-300 text-slate-700 shadow-xs"
                                  : "text-slate-600 hover:text-slate-800"
                              }`}
                            >
                              Abaikan
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400 italic">
                      Tidak ada perbedaan nama yang cocok dengan kata kunci
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {namePagesCount > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Menampilkan {((namePage - 1) * itemsPerPage) + 1} - {Math.min(namePage * itemsPerPage, filteredNameMismatches.length)} dari {filteredNameMismatches.length} baris
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNamePage(prev => Math.max(1, prev - 1))}
                  disabled={namePage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-semibold px-2">
                  {namePage} / {namePagesCount}
                </span>
                <button
                  onClick={() => setNamePage(prev => Math.min(namePagesCount, prev + 1))}
                  disabled={namePage === namePagesCount}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Format NIK Tidak Standar */}
      {activeTab === "nik" && invalidNiks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-4 shadow-sm mb-5">
          {/* Saring & Massal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari NIK, Nama, atau Masalah..."
                value={nikSearch}
                onChange={(e) => {
                  setNikSearch(e.target.value);
                  setNikPage(1);
                }}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onBulkNikResolution("valid")}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Check size={13} /> Tetap Cocokkan
              </button>
              <button
                onClick={() => onBulkNikResolution("abaikan")}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Ban size={13} /> Abaikan Semua
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold w-12">Baris</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">NIK di File</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Nama</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold text-amber-700">Masalah</th>
                  <th className="text-center px-3 py-2 text-slate-500 font-semibold w-40">Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {currentNikItems.length > 0 ? (
                  currentNikItems.map((item) => {
                    const res = invalidNikResolutions[item.id] || "valid";
                    return (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-mono text-slate-400">{item.rowIdx + 2}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 font-semibold">{item.nikRaw || "(kosong)"}</td>
                        <td className="px-3 py-2.5 text-slate-800 font-medium">{item.name}</td>
                        <td className="px-3 py-2.5 text-amber-700 font-medium">{item.reason}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                            <button
                              onClick={() => onSetNikResolution(item.id, "valid")}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                res === "valid"
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-800"
                              }`}
                            >
                              Cocokkan
                            </button>
                            <button
                              onClick={() => onSetNikResolution(item.id, "abaikan")}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                res === "abaikan"
                                  ? "bg-slate-300 text-slate-700 shadow-xs"
                                  : "text-slate-600 hover:text-slate-800"
                              }`}
                            >
                              Abaikan
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                      Tidak ada NIK tidak standar yang cocok dengan kata kunci
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {nikPagesCount > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Menampilkan {((nikPage - 1) * itemsPerPage) + 1} - {Math.min(nikPage * itemsPerPage, filteredInvalidNiks.length)} dari {filteredInvalidNiks.length} baris
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNikPage(prev => Math.max(1, prev - 1))}
                  disabled={nikPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-semibold px-2">
                  {nikPage} / {nikPagesCount}
                </span>
                <button
                  onClick={() => setNikPage(prev => Math.min(nikPagesCount, prev + 1))}
                  disabled={nikPage === nikPagesCount}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: NIK Duplikat */}
      {activeTab === "duplicate" && duplicateNiks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-4 shadow-sm mb-5">
          {/* Info */}
          <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 mb-4">
            <Copy className="text-slate-400 shrink-0 mt-0.5" size={14} />
            <p className="text-xs text-slate-600 leading-relaxed m-0">
              NIK di bawah ini muncul lebih dari sekali di file yang sama.
              Pencocokan hanya memakai <strong>kemunculan pertama</strong> per
              NIK — baris lain dengan NIK yang sama bisa jadi tercocokkan ke
              nama yang salah. Ini murni informasi, tidak perlu diputuskan;
              cek datanya kalau perlu.
            </p>
          </div>

          {/* Saring */}
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari NIK atau Nama..."
              value={duplicateSearch}
              onChange={(e) => {
                setDuplicateSearch(e.target.value);
                setDuplicatePage(1);
              }}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">NIK</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">File</th>
                  <th className="text-center px-3 py-2 text-slate-500 font-semibold w-20">Jumlah</th>
                  <th className="text-left px-3 py-2 text-slate-500 font-semibold">Baris & Nama</th>
                </tr>
              </thead>
              <tbody>
                {currentDuplicateItems.length > 0 ? (
                  currentDuplicateItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-mono text-slate-600">{item.nik}</td>
                      <td className="px-3 py-2.5 text-slate-600">{LABEL_FILE[item.file] || item.file}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-amber-700">{item.jumlah}</td>
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
                      Tidak ada NIK duplikat yang cocok dengan kata kunci
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {duplicatePagesCount > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Menampilkan {((duplicatePage - 1) * itemsPerPage) + 1} - {Math.min(duplicatePage * itemsPerPage, filteredDuplicateNiks.length)} dari {filteredDuplicateNiks.length} NIK
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDuplicatePage(prev => Math.max(1, prev - 1))}
                  disabled={duplicatePage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-semibold px-2">
                  {duplicatePage} / {duplicatePagesCount}
                </span>
                <button
                  onClick={() => setDuplicatePage(prev => Math.min(duplicatePagesCount, prev + 1))}
                  disabled={duplicatePage === duplicatePagesCount}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="h-11 px-5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer font-medium"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          Terapkan & Selesaikan
        </button>
      </div>
    </div>
  );
}
