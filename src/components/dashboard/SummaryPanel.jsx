import MetricCard from "../ui/MetricCard.jsx";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export default function SummaryPanel({ ringkasan, namaKolomBaru }) {
  if (!ringkasan) return null;

  const { total, cocok, tidak, dikecualikanStatus, persentase } = ringkasan;

  const pieData = [
    { name: "Cocok", value: cocok },
    { name: "Tidak Cocok", value: tidak },
    ...(dikecualikanStatus > 0
      ? [{ name: "Dikecualikan", value: dikecualikanStatus }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        Ringkasan Pencocokan
        {namaKolomBaru && (
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-semibold">
            {namaKolomBaru}
          </span>
        )}
      </h2>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={60}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => val.toLocaleString("id-ID")}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">
                {persentase}%
              </span>
              <span className="text-[10px] text-slate-400">Cocok</span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            <MetricCard label="Total" value={total.toLocaleString("id-ID")} tone="neutral" />
            <MetricCard label="Cocok" value={cocok.toLocaleString("id-ID")} tone="success" />
            <MetricCard label="Tidak" value={tidak.toLocaleString("id-ID")} tone="danger" />
            {dikecualikanStatus > 0 && (
              <MetricCard
                label="Dikecualikan"
                value={dikecualikanStatus.toLocaleString("id-ID")}
                tone="warning"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
