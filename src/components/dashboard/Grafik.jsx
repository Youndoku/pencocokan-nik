// Skala heatmap dari DesignSystem.dc.html. Dua tingkat tergelap memakai teks putih (kontras ≥ 4,5:1).
const SKALA = ["#f5f2ff", "#e4dcff", "#d2c6ff", "#c1afff", "#af99ff", "#9e82ff", "#7a54ff", "#724aff"];

/**
 * Daftar bar horizontal (label, bar ber-hatch, angka + persen).
 * `sorot`: true = disorot, false = diredupkan, undefined = biasa.
 * Dengan `onPilih`, tiap baris jadi tombol (dipakai untuk Fokus program).
 */
export function BarList({ items, satuan = "", label }) {
  const max = Math.max(1, ...items.map((it) => it.value));
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((it) => {
        const redup = it.sorot === false;
        const isi = (
          <>
            <span className={`body-strong truncate ${redup ? "text-ink-muted" : ""}`}>{it.label}</span>
            <span className="h-5 overflow-hidden rounded-xs bg-surface-muted">
              <span
                className={`block h-full rounded-xs ${redup ? "bg-lilac-second" : "hatch bg-lilac-main"}`}
                style={{ width: `${(it.value / max) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums">
              <span className={`body-strong ${redup ? "text-ink-muted" : ""}`}>
                {it.value.toLocaleString("id-ID")}
                {satuan && ` ${satuan}`}
              </span>
              {it.share && <span className="caption text-ink-muted"> ({it.share})</span>}
            </span>
          </>
        );
        const grid = "grid w-full grid-cols-[112px_minmax(0,1fr)_96px] items-center gap-3";
        return (
          <li key={it.label}>
            {it.onPilih ? (
              <button
                type="button"
                onClick={it.onPilih}
                aria-pressed={it.sorot === true}
                title={`Fokus ke ${it.label}`}
                className={`${grid} cursor-pointer rounded-xs border-0 bg-transparent p-0 text-left text-lilac-text`}
              >
                {isi}
              </button>
            ) : (
              <div className={grid}>{isi}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Heatmap angka. `rows`: {label, cells: (number|null)[]}; null = sel kosong
 * (misalnya setengah matriks). Intensitas = nilai dibanding nilai terbesar.
 */
export function Heatmap({ cols, rows, label, corner = "", rowHeaderClass = "caption-strong", minWidth = 560 }) {
  const max = Math.max(1, ...rows.flatMap((r) => r.cells.filter((c) => c != null)));
  return (
    <div className="overflow-x-auto">
      <table aria-label={label} className="w-full table-fixed border-separate border-spacing-1 tabular-nums" style={{ minWidth }}>
        <thead>
          <tr>
            <th scope="col" className="caption w-24 py-1 text-left font-normal text-ink-muted">
              {corner}
            </th>
            {cols.map((c) => (
              <th key={c} scope="col" className="caption-strong truncate py-1 text-center">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className={`${rowHeaderClass} truncate text-left`}>
                {r.label}
              </th>
              {r.cells.map((v, i) => {
                if (v == null) return <td key={i} />;
                const t = Math.min(SKALA.length - 1, Math.round((v / max) * (SKALA.length - 1)));
                return (
                  <td
                    key={i}
                    className="h-10 rounded-xs text-center text-sm font-medium"
                    style={{ background: SKALA[t], color: t >= SKALA.length - 2 ? "#ffffff" : "var(--color-lilac-text)" }}
                  >
                    {v.toLocaleString("id-ID")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
