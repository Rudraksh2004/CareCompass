import jsPDF from "jspdf";

const PAGE_HEIGHT = 297; // Standard A4 height
const PAGE_WIDTH = 210;  // Standard A4 width
const MARGIN = 18;       // Elegant 18mm margin
const LINE_HEIGHT = 5.8; // Optimized tighter line height for premium density

function cleanText(text: string) {
  if (!text) return "";
  return text
    .replace(/-{3,}/g, "")
    .replace(/\b(?:[A-Za-z]\s){2,}[A-Za-z]\b/g, (match) => match.replace(/\s+/g, ""))
    .replace(/\b(k\s?g)\b/gi, "kg")
    .replace(/\b(m\s?g\s?\/\s?d\s?L)\b/gi, "mg/dL")
    .replace(/(\d)\s*[!'`]+/g, "$1")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\.([A-Z])/g, ". $1")
    .replace(/&\s*b\s+/gi, "& ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function detectRiskLevel(text: string) {
  const lower = text.toLowerCase();
  // Clinical High Risk
  if (lower.includes("critical") || lower.includes("severe") || lower.includes("abnormal") || lower.includes("high risk") || lower.includes("consult a doctor") || lower.includes("immediate")) {
    return { label: "HIGH RISK / CRITICAL", color: [220, 38, 38], bg: [254, 226, 226] }; // Red
  }
  // Clinical Moderate
  if (lower.includes("fluctuating") || lower.includes("moderate") || lower.includes("variance") || lower.includes("caution")) {
    return { label: "MODERATE / CAUTION", color: [217, 119, 6], bg: [255, 237, 213] }; // Amber
  }
  // Clinical Stable
  return { label: "STABLE / NORMAL", color: [22, 163, 74], bg: [220, 252, 231] }; // Emerald
}

function getSectionTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes("health")) return "Health Log Summary";
  if (t.includes("prescription")) return "Extracted Prescription Text";
  return "Extracted Medical Text";
}

function formatDataPointsWithUnits(text: string, title: string) {
  if (!text) return text;
  const lowerTitle = title.toLowerCase();
  let unit = "";
  if (lowerTitle.includes("weight")) unit = " kg";
  else if (lowerTitle.includes("blood sugar")) unit = " mg/dL";

  return text.replace(/Data Points?:\s*([^\n]+)/i, (match, valuesPart) => {
    const numbers = valuesPart.match(/\d+(\.\d+)?/g);
    if (!numbers || numbers.length === 0) return match;
    const formatted = numbers.map((num: string) => `${num}${unit}`).join(", ");
    return `Data Points: ${formatted}`;
  });
}

function formatClinicalText(text: string) {
  if (!text) return text;
  return text
    .replace(/\s(\d+\.\s)/g, "\n\n$1")
    .replace(/(Trend Analysis|Pattern Analysis|Lifestyle Insights|Gentle Suggestions|Disclaimer|Status:|Direction:)/gi, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const exportMedicalPDF = async (
  title: string,
  originalText: string,
  aiResponse: string,
  chartImage?: string
) => {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 30;
  let pageNumber = 1;
  const reportId = crypto.randomUUID().split("-")[0].toUpperCase();

  let preCleanedAI = cleanText(aiResponse);
  const risk = detectRiskLevel(preCleanedAI);
  const sectionTitle = getSectionTitle(title);

  // FOOTER LOGIC - sleek and minimalist
  const renderFooter = (pNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, PAGE_HEIGHT - 16, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(99, 102, 241); // Indigo 500
    doc.text("CareCompass AI", MARGIN, PAGE_HEIGHT - 10);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`• SECURE CLINICAL REPORT ID: ${reportId}`, MARGIN + 26, PAGE_HEIGHT - 10);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text(`PAGE ${pNum}`, PAGE_WIDTH - MARGIN - 12, PAGE_HEIGHT - 10);
  };

  // CHECK PAGE BREAK
  const checkPageBreak = (requiredSpace = 25) => {
    if (y + requiredSpace > PAGE_HEIGHT - 20) {
      renderFooter(pageNumber); // apply footer to current page
      doc.addPage();
      pageNumber++;
      y = 20; // reset Y for new page
    }
  };

  // 1. FIRST PAGE: MASSIVE BRAND HEADER (Premium Dashboard Look)
  doc.setFillColor(15, 23, 42); // Very dark slate/blue
  doc.rect(0, 0, PAGE_WIDTH, 50, "F");
  
  // Watermark AI logo in header background
  doc.setTextColor(30, 41, 59); // slightly lighter slate
  doc.setFontSize(100);
  doc.setFont("helvetica", "bold");
  doc.text("AI", PAGE_WIDTH - 60, 40);

  // Main Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("CareCompass", MARGIN, 24);
  doc.setTextColor(129, 140, 248); // Indigo 400
  doc.text(" AI", MARGIN + 68, 24);

  // Subtitle
  doc.setFontSize(9.5);
  doc.setTextColor(156, 163, 175); // Gray 400
  doc.text("PREMIUM CLINICAL INTELLIGENCE REPORT", MARGIN, 32);
  
  // Report context
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), MARGIN, 40);

  y = 60;

  // 2. METADATA PROFILE BLOCK (Sleek grey bounded box)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN, y, PAGE_WIDTH - (MARGIN*2), 22, 2, 2, "FD");

  // Grid Headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("DOCUMENT ID", MARGIN + 6, y + 8);
  doc.text("DATE GENERATED", MARGIN + 60, y + 8);
  doc.text("AI RISK ASSESSMENT", MARGIN + 115, y + 8);

  // Grid Values
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(reportId, MARGIN + 6, y + 15);
  doc.text(new Date().toLocaleDateString(), MARGIN + 60, y + 15);

  // Risk Pill Custom Rendering
  const rBg = risk.bg;
  const rCol = risk.color;
  doc.setFillColor(rBg[0], rBg[1], rBg[2]);
  doc.roundedRect(MARGIN + 115, y + 10, 52, 7.5, 3.75, 3.75, "F");
  doc.setTextColor(rCol[0], rCol[1], rCol[2]);
  doc.setFontSize(8.5);
  doc.text(risk.label, MARGIN + 118, y + 15.2);

  y += 35; // Move down below metadata block

  // ADVANCED MARKDOWN RENDERER
  const renderMarkdownText = (text: string, startX: number, startY: number, maxWidth: number) => {
    let currentY = startY;
    const paragraphs = text.split("\n");

    for (let i = 0; i < paragraphs.length; i++) {
      let para = paragraphs[i].trim();
      if (!para) {
        currentY += 2; // Tighter paragraph spacing
        continue;
      }

      para = para.replace(/^\*\s/, "- ");
      para = para.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").trim();

      let isHeading = false;
      let headingLevel = 0;
      const headingMatch = para.match(/^(#{1,6})\s*(.*)/);
      if (headingMatch) {
         isHeading = true;
         headingLevel = headingMatch[1].length;
         para = headingMatch[2]; // Captures cleanly without the hashes
      }

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
          para = para.replace(/^\d+\.\s/, "").trim(); 
        }
      }

      // Pre-eval line break for Bullet
      if (currentY + LINE_HEIGHT > PAGE_HEIGHT - 20) {
        renderFooter(pageNumber); doc.addPage(); pageNumber++; currentY = 20;
      }

      if (isHeading) {
        // Aesthetic Section Heading Logic
        currentY += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(headingLevel === 1 ? 14 : 12.5);
        doc.setTextColor(15, 23, 42); // very dark slate
        doc.text(para.toUpperCase(), startX, currentY);
        
        // Draw soft divider line under headings
        doc.setDrawColor(241, 245, 249); // slate 100
        doc.setLineWidth(0.5);
        doc.line(startX, currentY + 2.5, startX + maxWidth, currentY + 2.5);
        
        currentY += 6.5; // Refined padding directly after heading
        continue; // skip the normal drawing below
      } 

      let textIndent = 6;
      if (isBullet && bulletNumber) {
         textIndent = bulletNumber.length > 2 ? 9 : 6;
      }
      const xPos = isBullet ? startX + textIndent : startX;
      
      if (isBullet) {
        if (bulletNumber) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(51, 65, 85);
          doc.text(bulletNumber, startX, currentY);
        } else {
          doc.setFillColor(100, 116, 139);
          doc.circle(startX + 2, currentY - 1.2, 0.8, "F");
        }
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85); // Slate 700 - Professional dark grey

      const lines = doc.splitTextToSize(para, isBullet ? maxWidth - textIndent : maxWidth);

      for (let j = 0; j < lines.length; j++) {
        if (currentY + LINE_HEIGHT > PAGE_HEIGHT - 20) {
          renderFooter(pageNumber); doc.addPage(); pageNumber++; currentY = 20;
        }
        
        if (!isHeading && j === 0 && lines[j].includes(":")) {
           const splitIdx = lines[j].indexOf(":");
           if (splitIdx < 35 && splitIdx > 2) { 
             const boldPart = lines[j].substring(0, splitIdx + 1);
             let normalPart = lines[j].substring(splitIdx + 1);
             if (normalPart.startsWith(" ")) normalPart = normalPart.substring(1);

             // Premium Key-Value Pair bolding
             doc.setFont("helvetica", "bold");
             doc.setTextColor(15, 23, 42); // slate 900
             doc.text(boldPart, xPos, currentY);
             
             doc.setFont("helvetica", "normal");
             doc.setTextColor(51, 65, 85); // slate 700
             const boldWidth = doc.getTextWidth(boldPart);
             doc.text(" " + normalPart, xPos + boldWidth, currentY);
             
             currentY += LINE_HEIGHT;
             continue;
           }
        }

        doc.setFont("helvetica", "normal");
        doc.text(lines[j], xPos, currentY);
        currentY += LINE_HEIGHT;
      }
    }
    y = currentY; // update global Y state
  };

  // --- CONTENT RENDERING ---

  // 1. Trend Chart (If available)
  if (chartImage) {
    checkPageBreak(110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text("CURRENT TREND ANALYSIS CHART", MARGIN, y);
    
    y += 8;
    // Beautiful subtle frame perfectly wrapping chart
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.roundedRect(MARGIN - 2, y - 2, 174, 84, 3, 3, "S");
    doc.addImage(chartImage, "PNG", MARGIN, y, 170, 80);
    y += 95;
  }

  // CLEAN + STRICT FIX
  let cleanedAI = cleanText(aiResponse);
  cleanedAI = formatDataPointsWithUnits(cleanedAI, title);
  cleanedAI = formatClinicalText(cleanedAI);
  const cleanedOriginal = cleanText(originalText);

  // 2. ORIGINAL TEXT SECTION
  checkPageBreak(30);
  
  // Premium Sub-section badge header
  doc.setFillColor(241, 245, 249); // slate 100
  doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN*2), 8, "F");
  
  // Left active ribbon (Subtle Slate)
  doc.setFillColor(148, 163, 184); // slate 400
  doc.rect(MARGIN, y, 2, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(sectionTitle.toUpperCase(), MARGIN + 6, y + 5.5);

  y += 14;
  renderMarkdownText(cleanedOriginal || "No historical text data available.", MARGIN + 4, y, PAGE_WIDTH - (MARGIN*2) - 4);
  
  y += 12; // Gap between sections

  // 3. AI EXPLANATION SECTION
  checkPageBreak(35);
  
  // Premium Sub-section badge header (Indigo Accent)
  doc.setFillColor(238, 242, 255); // indigo 50
  doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN*2), 8, "F");
  
  // Left active ribbon (Deep Indigo)
  doc.setFillColor(79, 70, 229); // indigo 600
  doc.rect(MARGIN, y, 2, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(67, 56, 202); // indigo 700
  doc.text("AI CLINICAL EXPLANATION & INSIGHTS", MARGIN + 6, y + 5.5);

  y += 14;
  renderMarkdownText(cleanedAI || "No AI explanation automatically generated.", MARGIN + 4, y, PAGE_WIDTH - (MARGIN*2) - 4);

  // 4. MEDICAL DISCLAIMER (Strict Footer)
  checkPageBreak(35);
  y += 10;
  
  doc.setDrawColor(254, 202, 202); // Red 200
  doc.setFillColor(254, 242, 242); // Red 50
  doc.roundedRect(MARGIN, y, PAGE_WIDTH - (MARGIN*2), 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38); // Red 600
  doc.text("MEDICAL DISCLAIMER", MARGIN + 4, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27); // Red 800
  doc.text(
    "This document is dynamically generated by CareCompass AI strictly for technical structure or educational purposes. It is not an official clinical diagnosis. Absolutely consult a certified healthcare professional.",
    MARGIN + 4,
    y + 12,
    { maxWidth: PAGE_WIDTH - (MARGIN*2) - 8 }
  );

  // Render footer on the absolute last page!
  renderFooter(pageNumber);

  doc.save("CareCompass-AI-Premium-Report.pdf");
};
