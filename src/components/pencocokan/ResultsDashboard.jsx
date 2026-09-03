import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  BarChart3,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Users,
} from "lucide-react";
import MetricCard from "../ui/MetricCard.jsx";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  cocok: "#0DA44F",       // primary — Semantic: Success
  tidak: "#D91F2B",       // accent-red — Semantic: Error
  dikecualikan: "#DBEC20", // accent-gold — Semantic: Warning
};

export default function ResultsDashboard({
  hasil,
  dataHasil,
  namaKolomBaru,
  namaGabungan,
  namaPembanding,
  sesiId,
  onReset,
  onDownload,
  hasSaved,
}) {
  const navigate = useNavigate();

  if (!hasil) return null;

  const { total, cocok, tidak, dikecualikanStatus, useStatus, totalMismatch } =
    hasil;
  const persentase = total > 0 ? ((cocok / total) * 100).toFixed(1) : 0;

  const pieData = [
    { name: "Cocok", value: cocok, color: COLORS.cocok },
    { name: "Tidak Cocok", value: tidak, color: COLORS.tidak },
    ...(useStatus && dikecualikanStatus > 0
      ? [
          {
            name: "Dikecualikan",
            value: dikecualikanStatus,
            color: COLORS.dikecualikan,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Success Banner */}
      <div className="text-center py-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary-dark text-xs font-semibold">
          <CheckCircle2 size={14} />
          Pencocokan selesai — Data tersimpan otomatis
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <div className="flex items-center justify-center">
          <div className="relative w-44 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => val.toLocaleString("id-ID")}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">
                {persentase}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Cocok
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-3">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-slate-600">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard
          label="Total Baris"
          value={total.toLocaleString("id-ID")}
          tone="neutral"
        />
        <MetricCard
          label="Cocok"
          value={cocok.toLocaleString("id-ID")}
          tone="success"
        />
        <MetricCard
          label="Tidak Cocok"
          value={tidak.toLocaleString("id-ID")}
          tone="danger"
        />
        {useStatus && (
          <MetricCard
            label="Dikecualikan"
            value={dikecualikanStatus.toLocaleString("id-ID")}
            tone="warning"
          />
        )}
      </div>

      {/* Mismatch summary */}
      {totalMismatch > 0 && (
        <div className="flex items-center gap-2 bg-accent-gold/15 border border-accent-gold/40 rounded-xl px-3 py-2.5 text-xs text-neutral-900 font-medium">
          <Users size={14} className="shrink-0" />
          {totalMismatch.toLocaleString("id-ID")} perbedaan nama terdeteksi
          (lihat detail di Dashboard Lengkap)
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-dark text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-primary-light cursor-pointer"
        >
          <Download size={14} />
          Unduh Excel
        </button>

        {sesiId && (
          <button
            onClick={() => navigate(`/dashboard/${sesiId}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all shadow-sm cursor-pointer"
          >
            <BarChart3 size={14} />
            Lihat Dashboard Lengkap
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          Pencocokan Baru
        </button>
      </div>
    </div>
  );
}
