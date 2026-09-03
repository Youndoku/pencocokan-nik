import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Download,
  Trash2,
  Calendar,
  FileSpreadsheet,
  ArrowRightLeft,
} from "lucide-react";

export default function SessionCard({ sesi, onHapus, selected, onToggleSelect }) {
  const navigate = useNavigate();
  const { id, tanggal, namaGabungan, namaPembanding, namaKolomBaru, ringkasan } =
    sesi;

  const persen = ringkasan?.persentase ?? 0;
  const tanggalFormatted = new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!sesi.excelBuffer) return;
    const blob = new Blob([sesi.excelBuffer], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil_${namaKolomBaru || "pencocokan"}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`group bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-primary/30 bg-primary/10 ring-2 ring-primary"
          : "border-slate-200/60"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">
              {tanggalFormatted}
            </span>
          </div>

          {/* File names */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet size={12} className="text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 truncate">
                {namaGabungan}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowRightLeft size={12} className="text-primary shrink-0" />
              <span className="text-sm text-slate-500 truncate">
                vs {namaPembanding}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${persen}%`,
                  backgroundColor:
                    persen >= 70
                      ? "#0DA44F"
                      : persen >= 40
                        ? "#DBEC20"
                        : "#D91F2B",
                }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700 w-12 text-right">
              {persen}%
            </span>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-2 text-xs text-slate-500">
            <span>
              <span className="font-bold text-slate-700">
                {(ringkasan?.total || 0).toLocaleString("id-ID")}
              </span>{" "}
              total
            </span>
            <span>
              <span className="font-bold text-primary-dark">
                {(ringkasan?.cocok || 0).toLocaleString("id-ID")}
              </span>{" "}
              cocok
            </span>
            <span>
              <span className="font-bold text-accent-red">
                {(ringkasan?.tidak || 0).toLocaleString("id-ID")}
              </span>{" "}
              tidak
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={() => navigate(`/dashboard/${id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary-dark rounded-xl text-xs font-semibold hover:bg-primary/15 transition-colors cursor-pointer"
        >
          <BarChart3 size={13} />
          Dashboard
        </button>
        <button
          onClick={handleDownload}
          disabled={!sesi.excelBuffer}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Download size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHapus(id);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-accent-red hover:bg-accent-red/15 hover:text-accent-red rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
