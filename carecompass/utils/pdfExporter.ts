import jsPDF from "jspdf";

const PAGE_HEIGHT = 280; // Safe printable height
const LINE_HEIGHT = 6;

function cleanText(text: string) {
  if (!text) return "";

  return (
    text
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
  const margin = 20;
  let y = 30;
  let pageNumber = 1;
  const reportId = crypto.randomUUID().split("-")[0].toUpperCase();

  let preCleanedAI = cleanText(aiResponse);
  const risk = detectRiskLevel(preCleanedAI);
  const sectionTitle = getSectionTitle(title);

  // Helper: Renders sleek page borders and footers on EVERY page
  const renderPageBase = () => {
    // Ultra-Premium Top Header Bar (Deep Indigo)
    doc.setFillColor(30, 27, 75);
    doc.rect(0, 0, 210, 6, "F");

    // Elegant left-edge color accent (Clinical Blue)
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 6, 2.5, 291, "F");

    // Page Footer
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 282, 210 - margin, 282);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`CareCompass AI • Secure Clinical Report ID: ${reportId}`, margin, 288);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber}`, 210 - margin - 10, 288);
  };

  // Helper: Add new page automatically, including the top continuation padding
  const checkPageBreak = (requiredSpace = 25) => {
    if (y + requiredSpace > PAGE_HEIGHT) {
      doc.addPage();
      pageNumber++;
      renderPageBase();
      y = 25;
    }
  };

  // Helper: Advanced Markdown Renderer for PDF
  const renderMarkdownText = (text: string, startX: number, startY: number, maxWidth: number) => {
    let currentY = startY;
    const paragraphs = text.split("\n");

    for (let i = 0; i < paragraphs.length; i++) {
      let para = paragraphs[i].trim();

      if (!para) {
        currentY += 4; // Standard paragraph spacing
        continue;
      }

      // 1. Preserve asterisk bullets by converting them before stripping markdown markers
      para = para.replace(/^\*\s/, "- ");
      
      // 2. Clean bold/italic syntax FIRST so regex evaluations don't break
      para = para.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim();

      // Check Heading
      let isHeading = false;
      let headingLevel = 0;
      if (para.startsWith("# ")) { isHeading = true; headingLevel = 1; para = para.replace(/^# /, ""); }
      else if (para.startsWith("## ")) { isHeading = true; headingLevel = 2; para = para.replace(/^## /, ""); }
      else if (para.startsWith("### ")) { isHeading = true; headingLevel = 3; para = para.replace(/^### /, ""); }

      // Check Bullet
      let isBullet = false;
      let bulletNumber = "";

      if (para.startsWith("- ")) {
        isBullet = true;
        para = para.substring(2).trim();
      } else {
        const numMatch = para.match(/^(\d+\.)\s/);
        if (numMatch) {
          isBullet = true;
          bulletNumber = numMatch[1];
          para = para.replace(/^\d+\.\s/, "").trim(); // Remove number so text prints at indent
        }
      }

      // Apply Fonts
      if (isHeading) {
        doc.setFont("helvetica", "bold");
        if (headingLevel === 1) doc.setFontSize(14);
        else if (headingLevel === 2) doc.setFontSize(13);
        else doc.setFontSize(12);
        doc.setTextColor(30, 58, 138); // Deep Blue headers
        currentY += 4; // Extra space before heading
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(55, 65, 81); // Slate 700 text
      }

      // Layout coordinates
      const xPos = isBullet ? startX + 6 : startX;
      
      if (isBullet) {
        if (bulletNumber) {
          doc.setFont("helvetica", "bold");
          doc.text(bulletNumber, startX, currentY);
        } else {
          doc.setFillColor(55, 65, 81);
          doc.circle(startX + 2, currentY - 1.2, 0.8, "F");
        }
      }

      const lines = doc.splitTextToSize(para, isBullet ? maxWidth - 8 : maxWidth);
      for (let j = 0; j < lines.length; j++) {
        if (currentY + LINE_HEIGHT > PAGE_HEIGHT) {
          doc.addPage();
          pageNumber++;
          renderPageBase();
          currentY = 25;
        }
        
        // Slightly bolder the first few words if it looks like a label (e.g. "Medication Name:")
        if (!isHeading && j === 0 && lines[j].includes(":")) {
           const splitIdx = lines[j].indexOf(":");
           if (splitIdx < 35 && splitIdx > 2) { 
             const boldPart = lines[j].substring(0, splitIdx + 1);
             let normalPart = lines[j].substring(splitIdx + 1);
             
             // Ensure we don't double space
             if (normalPart.startsWith(" ")) {
                 normalPart = normalPart.substring(1);
             }

             doc.setFont("helvetica", "bold");
             doc.text(boldPart, xPos, currentY);
             
             doc.setFont("helvetica", "normal");
             const boldWidth = doc.getTextWidth(boldPart);
             // Add a small 1.5 padding space after the bolded label
             doc.text(" " + normalPart, xPos + boldWidth, currentY);
             
             currentY += LINE_HEIGHT; // CRITICAL FIX: Ensure Y increments
             continue; // Go to next loop iteration, skip generic text print
           }
        }

        doc.setFont("helvetica", isHeading ? "bold" : "normal");
        doc.text(lines[j], xPos, currentY);
        currentY += LINE_HEIGHT;
      }
      
      if (isHeading) currentY += 2; // Extra pad after heading
    }
    y = currentY; // update global Y
  };

  // INITIALIZE FIRST PAGE
  renderPageBase();

  // 🌟 ULTRA-PREMIUM MINIMALIST BRANDING
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.text("CareCompass", margin - 1, 30);
  
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(" AI", margin + 63, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(107, 114, 128); // Gray 500
  doc.text("PREMIUM CLINICAL INTELLIGENCE REPORT", margin, 38);
  
  // Header Divider
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.setLineWidth(0.5);
  doc.line(margin - 2, 45, 210 - margin + 2, 45);

  y = 55;

  // 📝 METADATA GRID LAYOUT
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(156, 163, 175); // Gray 400
  doc.text("REPORT CONTEXT", margin, y);
  
  doc.setTextColor(31, 41, 55); // Gray 800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), margin, y + 6.5);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(156, 163, 175);
  doc.text("GENERATED DATE", margin + 70, y);
  
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(new Date().toLocaleDateString(), margin + 70, y + 6.5);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(156, 163, 175);
  doc.text("DOCUMENT ID", margin + 125, y);
  
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(reportId, margin + 125, y + 6.5);

  y += 18;
  doc.setDrawColor(243, 244, 246); // Gray 100
  doc.line(margin - 2, y, 210 - margin + 2, y);

  // 🚨 RISK BADGE CALLOUT BLOCK
  y += 10;
  doc.setFillColor(249, 250, 251); // Gray 50
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.roundedRect(margin - 2, y - 6, 174, 18, 3, 3, "FD");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99); // Gray 600
  doc.text("AI Risk Assessment:", margin + 4, y + 5);

  // Pill Badge
  doc.setFillColor(risk.bg[0], risk.bg[1], risk.bg[2]);
  doc.roundedRect(margin + 44, y - 1.5, 56, 8.5, 4.25, 4.25, "F");

  doc.setTextColor(risk.color[0], risk.color[1], risk.color[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(risk.label, margin + 48, y + 4.5);
  
  doc.setTextColor(0, 0, 0);

  y += 24;

  // CHART
  if (chartImage) {
    checkPageBreak(100);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(31, 41, 55);
    doc.text("AI Trend Chart Analysis", margin, y);

    y += 8;
    // Add soft border behind chart
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin - 2, y - 2, 174, 84, 4, 4, "S");
    doc.addImage(chartImage, "PNG", margin, y, 170, 80);
    y += 94;
  }

  // ORIGINAL TEXT SECTION
  
  // CLEAN + STRICT FIX (Execute before sizing)
  let cleanedAI = cleanText(aiResponse);
  cleanedAI = formatDataPointsWithUnits(cleanedAI, title);
  cleanedAI = formatClinicalText(cleanedAI);
  const cleanedOriginal = cleanText(originalText);

  checkPageBreak(35);

  // Header Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin - 4, y - 8, 178, 12, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55); // Gray 800
  doc.text(sectionTitle.toUpperCase(), margin, y - 0.5);

  y += 12;

  // Add a soft left vertical border for the content block
  renderMarkdownText(cleanedOriginal || "No data available.", margin, y, 170);

  // AI EXPLANATION SECTION
  checkPageBreak(35);
  y += 14;

  // Header Box
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.roundedRect(margin - 4, y - 8, 178, 12, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(67, 56, 202); // Indigo 700
  doc.text("AI CLINICAL EXPLANATION & INSIGHTS", margin, y - 0.5);

  y += 14;
  renderMarkdownText(cleanedAI || "No AI explanation generated.", margin, y, 170);

  // DISCLAIMER
  checkPageBreak(40);
  y += 16;

  doc.setDrawColor(254, 202, 202); // Red 200
  doc.setFillColor(254, 242, 242); // Red 50
  doc.roundedRect(margin - 4, y, 178, 24, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38); // Red 600
  doc.text("Medical Disclaimer", margin + 2, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(153, 27, 27); // Red 800
  doc.text(
    "This report is generated by CareCompass AI for educational purposes only. It is not a clinical diagnosis. Always consult a certified healthcare professional before making any medical decisions.",
    margin + 2,
    y + 14,
    { maxWidth: 168 }
  );

  doc.save("CareCompass-AI-Premium-Report.pdf");
};
