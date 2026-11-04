import { Lock } from "lucide-react";

/** Footer privasi di bawah setiap halaman. */
export default function Footer({ jumlahSesi = 0 }) {
  const sesi = jumlahSesi > 0 ? `${jumlahSesi} sesi tersimpan di browser ini.` : "Belum ada sesi tersimpan di browser ini.";
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-center gap-2 border-t border-line pt-4 text-center text-ink-muted">
      <Lock size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-success" />
      <p className="caption m-0">
        Data diproses di perangkat ini dan tidak dikirim ke server. <span className="tabular-nums">{sesi}</span>
      </p>
    </footer>
  );
}
