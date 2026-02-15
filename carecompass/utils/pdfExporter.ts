import jsPDF from "jspdf";

const PAGE_HEIGHT = 280; // Safe printable height
const LINE_HEIGHT = 6;

function cleanText(text: string) {
  if (!text) return "";

  return (
    text
      // Remove markdown formatting safely
      .replace(/#+\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")

      // 🔥 FIX 1: Remove markdown separators like ---
      .replace(/-{3,}/g, "")

      // 🔥 FIX 2: Fix spaced OCR words (D a t a, c o n s i s t e n t)
      .replace(/\b(?:[A-Za-z]\s){2,}[A-Za-z]\b/g, (match) =>
        match.replace(/\s+/g, ""),
      )

      // 🔥 FIX 3: Fix broken units like "k g" -> "kg"
      .replace(/\b(k\s?g)\b/gi, "kg")
      .replace(/\b(m\s?g\s?\/\s?d\s?L)\b/gi, "mg/dL")

      // 🔥 FIX 4: Remove weird punctuation after numbers (68 kg! 62 !)
      .replace(/(\d)\s*[!'`]+/g, "$1")

      // Fix OCR artifact "& b Safety"
      .replace(/&\s*b\s+/gi, "& ")

      // Normalize spacing (SAFE)
      .replace(/\s{2,}/g, " ")
      .replace(/\s*:\s*/g, ": ")
      .replace(/\s*,\s*/g, ", ")

      .trim()
  );
}

function detectRiskLevel(text: string) {
  const lower = text.toLowerCase();

  if (
    lower.includes("critical") ||
    lower.includes("severe") ||
    lower.includes("abnormal") ||
    lower.includes("high risk") ||
    lower.includes("consult a doctor")
  ) {
    return {
      label: "HIGH RISK",
      color: [220, 38, 38],
      bg: [254, 226, 226],
    };
  }

  if (
    lower.includes("fluctuating") ||
    lower.includes("moderate") ||
    lower.includes("variance")
  ) {
    return {
      label: "MODERATE RISK",
      color: [217, 119, 6],
      bg: [255, 237, 213],
    };
  }

  return {
    label: "STABLE / NORMAL",
    color: [22, 163, 74],
    bg: [220, 252, 231],
  };
}

function getSectionTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes("health")) return "Health Log Summary";
  if (t.includes("prescription")) return "Extracted Prescription Text";
  return "Extracted Medical Text (OCR)";
}

// 🔧 FIX 3: Add units to Data Points automatically (WITHOUT changing layout)
function formatDataPointsWithUnits(text: string, title: string) {
  if (!text) return text;

  const lowerTitle = title.toLowerCase();

  let unit = "";
  if (lowerTitle.includes("weight")) unit = " kg";
  else if (lowerTitle.includes("blood sugar")) unit = " mg/dL";

  // 🔥 Extract clean numeric values even if corrupted (68 kg! 62 ! 64)
  return text.replace(/(Data Points?:\s*)([^\n]+)/i, (_, label, rawValues) => {
    const numbers = rawValues
      .match(/[\d.]+/g) // extract only numbers
      ?.map((n: string) => `${n}${unit}`)
      .join(", ");

    if (!numbers) return `${label}${rawValues}`;
    return `${label}${numbers}`;
  });
}

export const exportMedicalPDF = async (
  title: string,
  originalText: string,
  aiResponse: string,
  chartImage?: string,
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  let y = 20;

  // 🔧 CLEAN + FIX TEXT (NO DESIGN CHANGE)
  let cleanedAI = cleanText(aiResponse);
  cleanedAI = formatDataPointsWithUnits(cleanedAI, title);

  const cleanedOriginal = cleanText(originalText);
  const risk = detectRiskLevel(cleanedAI);
  const sectionTitle = getSectionTitle(title);

  // 🧠 Helper: Add new page automatically
  const checkPageBreak = (requiredSpace = 20) => {
    if (y + requiredSpace > PAGE_HEIGHT) {
      doc.addPage();
      y = 20;
    }
  };

  // 🏥 HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("CareCompass AI", margin, y);

  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Clinical AI Health Report", margin, y);

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 195, y);

  // 📄 REPORT TYPE
  y += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Report Type:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(title, margin + 35, y);

  // 🚨 RISK BADGE (UNCHANGED DESIGN)
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text("AI Risk Assessment:", margin, y);

  doc.setFillColor(risk.bg[0], risk.bg[1], risk.bg[2]);
  doc.roundedRect(margin + 55, y - 6, 65, 10, 3, 3, "F");

  doc.setTextColor(risk.color[0], risk.color[1], risk.color[2]);
  doc.setFontSize(11);
  doc.text(risk.label, margin + 60, y);
  doc.setTextColor(0, 0, 0);

  // 📊 CHART (Auto page break safe)
  if (chartImage) {
    checkPageBreak(100);

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AI Trend Chart Analysis", margin, y);

    y += 6;
    doc.addImage(chartImage, "PNG", margin, y, 180, 80);
    y += 90;
  }

  // 🧾 ORIGINAL TEXT SECTION (UNCHANGED)
  checkPageBreak(30);
  y += 5;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y - 6, 180, 8, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(sectionTitle, margin + 2, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const originalLines = doc.splitTextToSize(
    cleanedOriginal || "No data available.",
    180,
  );

  originalLines.forEach((line: string) => {
    checkPageBreak(LINE_HEIGHT);
    doc.text(line, margin, y);
    y += LINE_HEIGHT;
  });

  // 🤖 AI EXPLANATION SECTION (MULTI-PAGE SAFE — UNCHANGED)
  checkPageBreak(25);
  y += 10;

  doc.setFillColor(240, 249, 255);
  doc.roundedRect(margin, y - 6, 180, 8, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("AI Clinical Explanation & Insights", margin + 2, y);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const aiLines = doc.splitTextToSize(
    cleanedAI || "No AI explanation generated.",
    180,
  );

  aiLines.forEach((line: string) => {
    checkPageBreak(LINE_HEIGHT);
    doc.text(line, margin, y);
    y += LINE_HEIGHT;
  });

  // 🛡️ DISCLAIMER (UNCHANGED DESIGN — but artifact fixed via cleanText)
  checkPageBreak(35);
  y += 12;

  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, 180, 22, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Medical Disclaimer", margin + 3, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "This report is generated by CareCompass AI for informational purposes only and is not a medical diagnosis. Always consult a qualified healthcare professional.",
    margin + 3,
    y + 14,
    { maxWidth: 174 },
  );

  // Footer (UNCHANGED)
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generated by CareCompass AI • ${new Date().toLocaleString()}`,
    margin,
    290,
  );

  doc.save("CareCompass-AI-Clinical-Report.pdf");
};
