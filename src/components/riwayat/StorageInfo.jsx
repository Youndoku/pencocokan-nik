import { HardDrive } from "lucide-react";

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function StorageInfo({ totalUkuran, jumlahSesi }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-500">
      <HardDrive size={13} className="shrink-0" />
      <span>
        {formatBytes(totalUkuran)} digunakan · {jumlahSesi} sesi tersimpan
      </span>
    </div>
  );
}
