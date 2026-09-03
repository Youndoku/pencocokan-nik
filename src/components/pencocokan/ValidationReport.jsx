import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

function SeverityIcon({ type }) {
  if (type === "success")
    return <CheckCircle2 size={14} className="text-primary shrink-0" />;
  if (type === "warning")
    return <AlertTriangle size={14} className="text-accent-gold shrink-0" />;
  return <Info size={14} className="text-accent-sky shrink-0" />;
}

function ValidationItem({ type, label, value, detail, children }) {
  const [expanded, setExpanded] = useState(false);

  const bgMap = {
    success: "bg-primary-light border-primary-light",
    warning: "bg-accent-gold/15 border-accent-gold/40",
    info: "bg-accent-sky/10 border-accent-sky/30",
  };

  return (
    <div
      className={`border rounded-xl px-3 py-2.5 ${bgMap[type]} transition-all duration-200`}
    >
      <div className="flex items-center gap-2">
        <SeverityIcon type={type} />
        <span className="text-xs font-medium text-slate-700 flex-1">
          {label}
        </span>
        <span className="text-xs font-bold text-slate-800">{value}</span>
        {children && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded hover:bg-white/50 transition-colors"
          >
            {expanded ? (
              <ChevronUp size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
          </button>
        )}
      </div>
      {expanded && children && (
        <div className="mt-2 pt-2 border-t border-black/5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ValidationReport({ validasi, label }) {
  if (!validasi) return null;

  const {
    totalBaris,
    barisKosong,
    nikKosong,
    nikNonStandar,
    totalValid,
    duplikatNik,
    persenNonStandar,
  } = validasi;

  const hasIssues =
    barisKosong > 0 ||
    nikKosong > 0 ||
    nikNonStandar > 0 ||
    duplikatNik.length > 0;

  return (
    <div className="mt-3 animate-fade-in">
      <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
        {hasIssues ? (
          <AlertTriangle size={12} className="text-accent-gold" />
        ) : (
          <CheckCircle2 size={12} className="text-primary" />
        )}
        Validasi Data {label}
      </p>

      <div className="space-y-1.5">
        <ValidationItem
          type="success"
          label="Baris valid"
          value={`${totalValid.toLocaleString("id-ID")} / ${totalBaris.toLocaleString("id-ID")}`}
        />

        {barisKosong > 0 && (
          <ValidationItem
            type="info"
            label="Baris kosong (akan diabaikan)"
            value={barisKosong.toLocaleString("id-ID")}
          />
        )}

        {nikKosong > 0 && (
          <ValidationItem
            type="warning"
            label="NIK kosong"
            value={nikKosong.toLocaleString("id-ID")}
          />
        )}

        {nikNonStandar > 0 && (
          <ValidationItem
            type={parseFloat(persenNonStandar) > 10 ? "warning" : "info"}
            label={`NIK format non-standar (${persenNonStandar}%)`}
            value={nikNonStandar.toLocaleString("id-ID")}
          />
        )}

        {duplikatNik.length > 0 && (
          <ValidationItem
            type="warning"
            label="NIK duplikat ditemukan"
            value={`${duplikatNik.length} NIK`}
          >
            <div className="max-h-32 overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-1">NIK</th>
                    <th className="pb-1 text-right">Muncul</th>
                  </tr>
                </thead>
                <tbody>
                  {duplikatNik.slice(0, 20).map((d) => (
                    <tr key={d.nik} className="text-slate-700">
                      <td className="py-0.5 font-mono">{d.nik}</td>
                      <td className="py-0.5 text-right font-bold">
                        {d.jumlah}×
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {duplikatNik.length > 20 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  ... dan {duplikatNik.length - 20} NIK duplikat lainnya
                </p>
              )}
            </div>
          </ValidationItem>
        )}
      </div>

      {hasIssues && (
        <p className="text-[10px] text-slate-400 mt-2 italic">
          ⚠️ Masalah di atas tidak memblokir proses. Anda tetap dapat
          melanjutkan pencocokan.
        </p>
      )}
    </div>
  );
}
