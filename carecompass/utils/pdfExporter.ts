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
    // Elegant left-edge color accent (Clinical Blue)
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 4, 297, "F");

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

      // Check Heading
      let isHeading = false;
      let headingLevel = 0;
      if (para.startsWith("# ")) { isHeading = true; headingLevel = 1; para = para.replace(/^# /, ""); }
      else if (para.startsWith("## ")) { isHeading = true; headingLevel = 2; para = para.replace(/^## /, ""); }
      else if (para.startsWith("### ")) { isHeading = true; headingLevel = 3; para = para.replace(/^### /, ""); }

      // Check Bullet
      let isBullet = false;
      if (para.startsWith("- ") || para.startsWith("* ")) {
        isBullet = true;
        para = para.substring(2);
      } else if (/^\d+\.\s/.test(para)) {
        isBullet = true; // Numbered list treat like bullet indentation
      }

      // Clean bold/italic syntax from string to just render normally but structured
      para = para.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "");

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
        // Draw physical bullet or number
        if (/^\d+\.\s/.test(paragraphs[i].trim())) {
          doc.setFont("helvetica", "bold");
          const numMatch = paragraphs[i].trim().match(/^(\d+\.)\s/);
          if (numMatch) doc.text(numMatch[1], startX, currentY);
          para = para.replace(/^\d+\.\s/, ""); // remove from content to print adjacent
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

  // 🌟 BRAND HEADER BAR
  doc.setFillColor(30, 27, 75); // Deep Indigo/Slate
  doc.roundedRect(margin - 4, 15, 178, 45, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("CareCompass AI", margin + 6, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(167, 139, 250); // Beautiful Purple-300
  doc.text("Premium Clinical Intelligence Report", margin + 7, 42);
  
  y = 75;

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
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.text("AI Risk Assessment:", margin, y);

  // Pill Badge
  doc.setFillColor(risk.bg[0], risk.bg[1], risk.bg[2]);
  doc.roundedRect(margin + 42, y - 5.5, 60, 8, 4, 4, "F");

  doc.setTextColor(risk.color[0], risk.color[1], risk.color[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(risk.label, margin + 46, y + 0.5);
  
  doc.setTextColor(0, 0, 0);

  y += 12;
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.setLineWidth(0.5);
  doc.line(margin, y, 210 - margin, y);

  // CHART
  if (chartImage) {
    checkPageBreak(100);

    y += 18;
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
  y += 12;

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
  const originalStartY = y - 4;
  
  renderMarkdownText(cleanedOriginal || "No data available.", margin, y, 170);

  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(1.5);
  // Do not cross page boundaries with single rect, just bound what's on this page loosely
  // Actually, left accent lines span nicely if we keep it simple, but let's skip the vertical line to prevent multi-page complexity
  // and purely rely on excellent text layouts.

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

  y += 12;
  renderMarkdownText(cleanedAI || "No AI explanation generated.", margin, y, 170);

  // DISCLAIMER
  checkPageBreak(40);
  y += 18;

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
