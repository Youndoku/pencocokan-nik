import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "#0DA44F", // primary
  "#4454AA", // secondary
  "#D91F2B", // accent-red
  "#09ABE7", // accent-sky
  "#0B7A3B", // primary-dark
];

export default function DistributionChart({ chartKeterangan }) {
  if (!chartKeterangan || chartKeterangan.length === 0) return null;

  const data = chartKeterangan.map((item, i) => ({
    ...item,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <h2 className="text-base font-semibold text-slate-800 mb-4">
        Distribusi Keterangan
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(v) => v.toLocaleString("id-ID")}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={150}
              tick={{ fontSize: 10, fill: "#64748b" }}
            />
            <Tooltip
              formatter={(val) => [val.toLocaleString("id-ID"), "Jumlah"]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
