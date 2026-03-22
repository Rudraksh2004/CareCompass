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

      // FIX 1: Remove markdown separators like ---
      .replace(/-{3,}/g, "")

      // FIX 2: Fix spaced OCR words (D a t a -> Data)
      .replace(/\b(?:[A-Za-z]\s){2,}[A-Za-z]\b/g, (match) =>
        match.replace(/\s+/g, "")
      )

      // FIX 3: Fix broken units like "k g" -> "kg"
      .replace(/\b(k\s?g)\b/gi, "kg")
      .replace(/\b(m\s?g\s?\/\s?d\s?L)\b/gi, "mg/dL")

      // FIX 4: Remove weird punctuation after numbers (68 kg! 62 !)
      .replace(/(\d)\s*[!'`]+/g, "$1")

      // FIX 5: Fix merged words like "AIHealthInsight"
      .replace(/([a-z])([A-Z])/g, "$1 $2")

      // FIX 6: Fix merged sentences ".Your" -> ". Your"
      .replace(/\.([A-Z])/g, ". $1")

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

// 🔥 CRITICAL FIX: Proper Data Points extraction + units (ONLY numbers, nothing else)
function formatDataPointsWithUnits(text: string, title: string) {
  if (!text) return text;

  const lowerTitle = title.toLowerCase();

  let unit = "";
  if (lowerTitle.includes("weight")) unit = " kg";
  else if (lowerTitle.includes("blood sugar")) unit = " mg/dL";

  return text.replace(/Data Points?:\s*([^\n]+)/i, (match, valuesPart) => {
    // Extract ONLY numeric values
    const numbers = valuesPart.match(/\d+(\.\d+)?/g);

    if (!numbers || numbers.length === 0) return match;

    const formatted = numbers.map((num: string) => `${num}${unit}`).join(", ");

    return `Data Points: ${formatted}`;
  });
}

function formatClinicalText(text: string) {
  if (!text) return text;

  return (
    text
      // Proper spacing before numbered sections
      .replace(/\s(\d+\.\s)/g, "\n\n$1")

      // Add spacing before key headings only (no layout change)
      .replace(
        /(Trend Analysis|Pattern Analysis|Lifestyle Insights|Gentle Suggestions|Disclaimer|Status:|Direction:)/gi,
        "\n\n$1"
      )

      // Prevent giant merged paragraphs
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export const exportMedicalPDF = async (
  title: string,
  originalText: string,
  aiResponse: string,
  chartImage?: string
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  let y = 20;

  // CLEAN + STRICT FIX (NO DESIGN CHANGE)
  let cleanedAI = cleanText(aiResponse);
  cleanedAI = formatDataPointsWithUnits(cleanedAI, title);
  cleanedAI = formatClinicalText(cleanedAI);

  const cleanedOriginal = cleanText(originalText);
  const risk = detectRiskLevel(cleanedAI);
  const sectionTitle = getSectionTitle(title);

  // Helper: Add new page automatically, including the top continuation padding
  const checkPageBreak = (requiredSpace = 20) => {
    if (y + requiredSpace > PAGE_HEIGHT) {
      doc.addPage();
      y = 20;
    }
  };

  // 🌟 BRAND HEADER BAR
  doc.setFillColor(30, 27, 75); // Deep Indigo/Slate
  doc.rect(0, 0, 210, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("CareCompass AI", margin, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(167, 139, 250); // Beautiful Purple-300
  doc.text("Premium Clinical Intelligence Report", margin, 30);
  
  y = 55;

  // REPORT TYPE & DATE
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99); // Gray 600
  doc.text("Report Title:", margin, y);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.text(title, margin + 28, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);
  doc.text("Generated:", margin + 110, y);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  const dateStr = new Date().toLocaleDateString();
  doc.text(dateStr, margin + 135, y);

  // RISK BADGE
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.text("AI Risk Assessment:", margin, y);

  // Pill Badge
  doc.setFillColor(risk.bg[0], risk.bg[1], risk.bg[2]);
  doc.roundedRect(margin + 42, y - 5.5, 55, 7.5, 3.5, 3.5, "F");

  doc.setTextColor(risk.color[0], risk.color[1], risk.color[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  // Centered text roughly inside pill
  doc.text(risk.label, margin + 46, y);
  
  doc.setTextColor(0, 0, 0);

  y += 10;
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.setLineWidth(0.5);
  doc.line(margin, y, 195, y);

  // CHART (UNCHANGED)
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

  // ORIGINAL TEXT SECTION
  checkPageBreak(30);
  y += 10;

  doc.setFillColor(243, 244, 246); // Gray 100
  doc.roundedRect(margin, y - 6, 180, 9, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55); // Gray 800
  doc.text(sectionTitle, margin + 4, y + 0.5);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(55, 65, 81); // Gray 700

  const originalLines = doc.splitTextToSize(
    cleanedOriginal || "No data available.",
    180
  );

  originalLines.forEach((line: string) => {
    checkPageBreak(LINE_HEIGHT);
    doc.text(line, margin, y);
    y += LINE_HEIGHT;
  });

  // AI EXPLANATION SECTION
  checkPageBreak(25);
  y += 12;

  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(margin, y - 6, 180, 9, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(67, 56, 202); // Indigo 700
  doc.text("🧠 AI Clinical Explanation & Insights", margin + 4, y + 0.5);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39); // Gray 900

  const aiLines = doc.splitTextToSize(
    cleanedAI || "No AI explanation generated.",
    180
  );

  aiLines.forEach((line: string) => {
    checkPageBreak(LINE_HEIGHT);
    doc.text(line, margin, y);
    y += LINE_HEIGHT;
  });

  // DISCLAIMER
  checkPageBreak(35);
  y += 15;

  doc.setDrawColor(254, 202, 202); // Red 200
  doc.setFillColor(254, 242, 242); // Red 50
  doc.roundedRect(margin, y, 180, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38); // Red 600
  doc.text("⚠️ Medical Disclaimer", margin + 5, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27); // Red 800
  doc.text(
    "This report is generated by CareCompass AI for educational purposes only. It is not a clinical diagnosis. Always consult a certified healthcare professional before making any medical decisions.",
    margin + 5,
    y + 13,
    { maxWidth: 170 }
  );

  // Footer
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, 285, 195, 285);
  
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // Gray 400
  doc.text(
    `CareCompass AI • Secure Clinical Report • ID: ${crypto.randomUUID().split("-")[0].toUpperCase()}`,
    margin,
    291
  );

  doc.save("CareCompass-AI-Premium-Report.pdf");
};
