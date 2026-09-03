export default function CrossProgramMatrix({ crossMatrix }) {
  if (!crossMatrix || crossMatrix.programs.length < 2) return null;

  const { matrix, programs } = crossMatrix;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5">
      <h3 className="text-sm font-bold text-slate-800">
        Analisis Cross-Program
      </h3>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-slate-500 font-medium"></th>
              {programs.map((p) => (
                <th
                  key={p}
                  className="text-center py-2 px-2 text-slate-600 font-semibold"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {programs.map((rowP, i) => (
              <tr key={rowP} className="border-t border-slate-100">
                <td className="py-2 px-2 font-semibold text-slate-700">
                  {rowP}
                </td>
                {programs.map((colP, j) => {
                  const val = matrix[i][j];
                  const isDiag = i === j;
                  const maxOff = Math.max(
                    ...matrix
                      .flat()
                      .filter((_, idx) => {
                        const r = Math.floor(idx / programs.length);
                        const c = idx % programs.length;
                        return r !== c;
                      })
                      .concat([1])
                  );
                  const intensity = isDiag ? 0 : Math.min(val / maxOff, 1);

                  return (
                    <td
                      key={colP}
                      className="text-center py-2 px-2 font-mono font-semibold"
                      style={{
                        backgroundColor: isDiag
                          ? "#f8fafc"
                          : `rgba(13, 164, 79, ${intensity * 0.3})`,
                        color: isDiag ? "#94a3b8" : "#1e293b",
                      }}
                    >
                      {isDiag ? "—" : val.toLocaleString("id-ID")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 italic">
        Angka menunjukkan jumlah orang yang cocok di kedua program
      </p>
    </div>
  );
}
