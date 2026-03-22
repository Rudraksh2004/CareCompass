const fs = require('fs');
let content = fs.readFileSync('utils/pdfExporter.ts', 'utf8');

const regex = /\/\/ 🌟 BRAND HEADER BAR[\s\S]*?\/\/ CHART/;
const newHeader = `// 🌟 ULTRA-PREMIUM MINIMALIST BRANDING
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(17, 24, 39);
  doc.text("CareCompass", margin - 1, 28);
  
  doc.setTextColor(79, 70, 229);
  doc.text(" AI", margin + 63, 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(107, 114, 128);
  doc.text("PREMIUM CLINICAL INTELLIGENCE REPORT", margin, 36);
  
  // Header Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin - 2, 43, 210 - margin + 2, 43);

  y = 53;

  // 📝 METADATA GRID LAYOUT
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(156, 163, 175);
  doc.text("REPORT CONTEXT", margin, y);
  
  doc.setTextColor(31, 41, 55);
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
  doc.setDrawColor(243, 244, 246);
  doc.line(margin - 2, y, 210 - margin + 2, y);

  // 🚨 RISK BADGE CALLOUT BLOCK
  y += 10;
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin - 2, y - 6, 174, 18, 3, 3, "FD");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.text("AI Risk Assessment:", margin + 4, y + 5);

  // Pill Badge
  doc.setFillColor(risk.bg[0], risk.bg[1], risk.bg[2]);
  doc.roundedRect(margin + 44, y - 1.5, 56, 8.5, 4.25, 4.25, "F");

  doc.setTextColor(risk.color[0], risk.color[1], risk.color[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(risk.label, margin + 48, y + 4.5);
  
  doc.setTextColor(0, 0, 0);

  y += 18;

  // CHART`;

content = content.replace(regex, newHeader);
fs.writeFileSync('utils/pdfExporter.ts', content);
console.log('Successfully updated pdf header.');
