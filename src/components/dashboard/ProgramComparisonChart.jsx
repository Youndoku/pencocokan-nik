import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const BAR_COLORS = ["#0DA44F", "#4454AA", "#D91F2B", "#09ABE7", "#0B7A3B"]; // primary, secondary, accent-red, accent-sky, primary-dark — dataviz-validated order

/**
 * Bar chart "Perbandingan Jumlah Cocok per Program" — dulu bagian dari
 * CrossProgramMatrix, dipisah jadi kartu sendiri karena matrix bisa jadi
 * sangat tinggi (tumbuh sesuai jumlah program) dan bikin kartu gabungan
 * lama-lama nggak rapi kalau dipasangkan sejajar dengan chart lain di grid.
 */
export default function ProgramComparisonChart({ ringkasanProgram }) {
  if (!ringkasanProgram || ringkasanProgram.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        Perbandingan Jumlah Cocok per Program
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ringkasanProgram}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="program"
              tick={{ fontSize: 10, fill: "#64748b" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(v) => v.toLocaleString("id-ID")}
            />
            <Tooltip
              formatter={(val) => val.toLocaleString("id-ID")}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="cocok" name="Cocok" radius={[4, 4, 0, 0]} barSize={30}>
              {ringkasanProgram.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
