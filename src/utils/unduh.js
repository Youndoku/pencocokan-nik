/** Unduh file Excel hasil sebuah sesi. Tidak melakukan apa-apa kalau sesi tidak punya excelBuffer. */
export function unduhExcelSesi(sesi) {
  if (!sesi?.excelBuffer) return;
  const url = URL.createObjectURL(new Blob([sesi.excelBuffer], { type: "application/octet-stream" }));
  const el = document.createElement("a");
  el.href = url;
  el.download = `hasil_${sesi.namaKolomBaru || "pencocokan"}.xlsx`;
  el.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
