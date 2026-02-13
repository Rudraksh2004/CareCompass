import jsPDF from "jspdf";

export const exportMedicalPDF = (
  title: string,
  originalText: string,
  aiResponse: string
) => {
  const doc = new jsPDF();

  const marginLeft = 14;
  let y = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CareCompass", marginLeft, y);

  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    marginLeft,
    y
  );

  y += 15;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, marginLeft, y);

  y += 10;

  // Original Text Section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Original Input:", marginLeft, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const originalLines = doc.splitTextToSize(
    originalText || "N/A",
    180
  );
  doc.text(originalLines, marginLeft, y);

  y += originalLines.length * 6 + 10;

  // AI Response Section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("AI Explanation:", marginLeft, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const aiLines = doc.splitTextToSize(
    aiResponse || "No response generated.",
    180
  );
  doc.text(aiLines, marginLeft, y);

  // Disclaimer (important for health app)
  y += aiLines.length * 6 + 12;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Disclaimer: This AI output is for informational purposes only and is not a medical diagnosis.",
    marginLeft,
    y,
    { maxWidth: 180 }
  );

  // Save file
  const fileName =
    title.replace(/\s+/g, "_").toLowerCase() + ".pdf";

  doc.save(fileName);
};
