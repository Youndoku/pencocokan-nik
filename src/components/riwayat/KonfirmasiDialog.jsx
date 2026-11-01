import { useEffect, useRef } from "react";
import Button from "../ui/Button.jsx";

/** Dialog konfirmasi hapus (dialog bawaan browser). Esc atau "Batal" = batal. */
export default function KonfirmasiDialog({ open, judul, pesan, labelHapus, onBatal, onHapus }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="konfirmasi-judul"
      onCancel={(e) => {
        e.preventDefault();
        onBatal();
      }}
      className="m-auto w-[min(440px,calc(100%-32px))] rounded-lg border-0 bg-surface p-6 text-lilac-text shadow-card backdrop:bg-black/30"
    >
      <h2 id="konfirmasi-judul" className="title-sm m-0">{judul}</h2>
      <p className="body mt-2 mb-0 text-ink-muted">{pesan}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onBatal} autoFocus>
          Batal
        </Button>
        <Button variant="dark" onClick={onHapus}>
          {labelHapus}
        </Button>
      </div>
    </dialog>
  );
}
