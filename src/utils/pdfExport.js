/**
 * Generate a PDF summary report for a matching session.
 *
 * @param {Object} sesi - Session data from IndexedDB
 * @param {Object} options
 * @param {Array} options.penerimaGanda - Duplicate recipients (optional)
 * @param {string[]} options.programColumns - Detected program columns (optional)
 */
export async function generatePdf(sesi, options = {}) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // === Header ===
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PENCOCOKAN DATA NIK", pageWidth / 2, y, {
    align: "center",
  });
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Diskominfo Kota Batu", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Separator line
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // === Info ===
  doc.setFontSize(9);
  doc.setTextColor(60);
  const tanggal = new Date(sesi.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const info = [
    ["Tanggal", tanggal],
    ["File Gabungan", sesi.namaGabungan],
    ["File Pembanding", sesi.namaPembanding],
    ["Kolom Hasil", sesi.namaKolomBaru],
  ];

  for (const [label, value] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", margin + 35, y);
    y += 5;
  }
  y += 5;

  // === Ringkasan Statistik ===
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("RINGKASAN STATISTIK", margin, y);
  y += 6;

  const r = sesi.ringkasan;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Metrik", "Jumlah"]],
    body: [
      ["Total Baris", r.total?.toLocaleString("id-ID") || "0"],
      ["Cocok", r.cocok?.toLocaleString("id-ID") || "0"],
      ["Tidak Cocok", r.tidak?.toLocaleString("id-ID") || "0"],
      [
        "Dikecualikan Status",
        r.dikecualikanStatus?.toLocaleString("id-ID") || "0",
      ],
      ["Persentase Kecocokan", `${r.persentase || 0}%`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  y = doc.lastAutoTable.finalY + 10;

  // === Distribusi Keterangan ===
  if (sesi.keteranganDistribusi) {
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text("DISTRIBUSI KETERANGAN", margin, y);
    y += 6;

    const ketEntries = Object.entries(sesi.keteranganDistribusi)
      .sort(([, a], [, b]) => b - a)
      .map(([label, jumlah]) => [label, jumlah.toLocaleString("id-ID")]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Keterangan", "Jumlah"]],
      body: ketEntries,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // === Penerima Ganda (if any) ===
  const { penerimaGanda, programColumns } = options;
  if (penerimaGanda && penerimaGanda.length > 0 && programColumns) {
    if (y > 200) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(
      `PENERIMA BANTUAN GANDA (${penerimaGanda.length} orang)`,
      margin,
      y
    );
    y += 6;

    const head = [["NIK", "Nama", ...programColumns, "Jml Program"]];
    const body = penerimaGanda.slice(0, 50).map((r) => [
      r.nik,
      r.nama,
      ...programColumns.map((p) => (r.programs[p] === 1 ? "✓" : "—")),
      r.count,
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head,
      body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [255, 251, 235] },
    });

    if (penerimaGanda.length > 50) {
      y = doc.lastAutoTable.finalY + 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150);
      doc.text(
        `... dan ${penerimaGanda.length - 50} orang lainnya (lihat file Excel)`,
        margin,
        y
      );
    }
  }

  // === Footer on all pages ===
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(160);
    doc.text(
      "Diproses secara offline menggunakan Tool Pencocokan Data NIK — Diskominfo Kota Batu",
      pageWidth / 2,
      pageH - 8,
      { align: "center" }
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - margin,
      pageH - 8,
      { align: "right" }
    );
  }

  // Download
  doc.save(`laporan_${sesi.namaKolomBaru || "pencocokan"}.pdf`);
}
