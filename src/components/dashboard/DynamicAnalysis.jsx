import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

export default function DynamicAnalysis({
  dataHasil,
  kolomTersedia,
  kolomProgram,
  namaKolomBaru,
}) {
  const [selectedCol, setSelectedCol] = useState("");
  const [breakdownCol, setBreakdownCol] = useState("");

  // Exclude result columns and Keterangan from analysis options
  const analysisColumns = useMemo(() => {
    const exclude = new Set([
      ...(kolomProgram || []),
      namaKolomBaru,
      "Keterangan",
    ].filter(Boolean));
    return (kolomTersedia || []).filter((c) => !exclude.has(c));
  }, [kolomTersedia, kolomProgram, namaKolomBaru]);

  // Breakdown columns (result columns for cross-tab)
  const breakdownOptions = useMemo(() => {
    return [...(kolomProgram || []), namaKolomBaru].filter(Boolean);
  }, [kolomProgram, namaKolomBaru]);

  // Distribution data
  const chartData = useMemo(() => {
    if (!selectedCol || !dataHasil) return [];

    const counts = new Map();
    for (const row of dataHasil) {
      const val = String(row[selectedCol] ?? "").trim() || "(kosong)";
      counts.set(val, (counts.get(val) || 0) + 1);
    }

    const entries = Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return entries;
  }, [dataHasil, selectedCol]);

  // Cross-tab data
  const crossTabData = useMemo(() => {
    if (!selectedCol || !breakdownCol || !dataHasil) return null;

    const groups = new Map();
    for (const row of dataHasil) {
      const cat = String(row[selectedCol] ?? "").trim() || "(kosong)";
      const status = Number(row[breakdownCol]) === 1 ? "Cocok" : "Tidak Cocok";

      if (!groups.has(cat)) groups.set(cat, { Cocok: 0, "Tidak Cocok": 0 });
      groups.get(cat)[status]++;
    }

    return Array.from(groups.entries())
      .map(([label, counts]) => ({ label, ...counts }))
      .sort((a, b) => b.Cocok + b["Tidak Cocok"] - (a.Cocok + a["Tidak Cocok"]))
      .slice(0, 20);
  }, [dataHasil, selectedCol, breakdownCol]);

  const useBarChart = chartData.length > 10;
  const showCrossTab = breakdownCol && crossTabData && crossTabData.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        Analisis Kolom Dinamis
      </h3>

      <div className="flex gap-2 mb-4">
        <select
          value={selectedCol}
          onChange={(e) => {
            setSelectedCol(e.target.value);
            setBreakdownCol("");
          }}
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
        >
          <option value="">Pilih kolom untuk dianalisis...</option>
          {analysisColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>

        {selectedCol && breakdownOptions.length > 0 && (
          <select
            value={breakdownCol}
            onChange={(e) => setBreakdownCol(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
          >
            <option value="">Breakdown by...</option>
            {breakdownOptions.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedCol && (
        <p className="text-xs text-slate-400 text-center py-8">
          Pilih kolom di atas untuk melihat distribusi data
        </p>
      )}

      {selectedCol && !showCrossTab && chartData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {useBarChart ? (
              <BarChart
                data={chartData.slice(0, 20)}
                layout="vertical"
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => v.toLocaleString("id-ID")} />
                <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip formatter={(val) => val.toLocaleString("id-ID")} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {chartData.slice(0, 20).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="label"
                  label={({ label, percent }) =>
                    `${label} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => val.toLocaleString("id-ID")} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {showCrossTab && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crossTabData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#64748b" }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => v.toLocaleString("id-ID")} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
              <Bar dataKey="Cocok" fill="#10b981" stackId="stack" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Tidak Cocok" fill="#ef4444" stackId="stack" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length > 20 && (
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Menampilkan 20 kategori teratas dari {chartData.length} total
        </p>
      )}
    </div>
  );
}
