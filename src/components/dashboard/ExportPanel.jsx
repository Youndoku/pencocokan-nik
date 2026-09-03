import { Download } from "lucide-react";

export default function ExportPanel({
  onDownloadExcel,
  namaKolomBaru,
  ringkasan,
  excelBuffer,
  dataHasil,
}) {
  const cocok = ringkasan?.cocok || 0;
  const tidak = ringkasan?.tidak || 0;
  
  const fileName = `hasil_${namaKolomBaru || "pencocokan"}.xlsx`;
  const fileSize = excelBuffer?.byteLength 
    ? `~${Math.round(excelBuffer.byteLength / 1024).toLocaleString("id-ID")} KB`
    : null;
    
  const rows = dataHasil?.length || 0;
  const cols = dataHasil?.[0] ? Object.keys(dataHasil[0]).length : 0;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Spacer to align with SummaryPanel's title */}
      <div className="min-h-[24px]"></div>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900">Unduh Hasil</h3>
        
        <p className="text-xs text-slate-700 mt-1 mb-4">
          <span className="text-[#0DA44F]">{cocok.toLocaleString("id-ID")} cocok</span>
          {" "}&middot;{" "}
          <span className="text-[#D91F2B]">{tidak.toLocaleString("id-ID")} tidak cocok</span>
        </p>

        <div className="pt-3.5 border-t border-slate-200/60 mb-auto text-xs text-slate-500 grid grid-cols-[65px_minmax(0,1fr)] gap-y-1.5 gap-x-2">
          <span>Nama file:</span>
          <span className="truncate" title={fileName}>
            {fileName}
          </span>
          
          {fileSize && (
            <>
              <span>Ukuran:</span>
              <span>{fileSize}</span>
            </>
          )}
          
          <span>Isi:</span>
          <span>
            {rows.toLocaleString("id-ID")} baris &middot; {cols} kolom
          </span>
        </div>

        <button
          onClick={onDownloadExcel}
          className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary-dark border border-primary/30 rounded-xl text-sm font-semibold hover:bg-primary/15 transition-colors cursor-pointer shrink-0"
        >
          <Download size={15} />
          Excel (.xlsx)
        </button>
      </div>
    </div>
  );
}
