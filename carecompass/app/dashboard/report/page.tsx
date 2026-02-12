"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";

export default function ReportPage() {
  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);

    try {
      if (file.type === "application/pdf") {
        const result = await extractTextFromPDF(file);

        // If extracted text is too small → likely scanned PDF
        if (result.text.trim().length < 30) {
          console.log("Scanned PDF detected → running OCR");

          const { data } = await Tesseract.recognize(file, "eng");

          setReportText(data.text);
        } else {
          setReportText(result.text);
        }
      } else {
        const { data } = await Tesseract.recognize(file, "eng");

        setReportText(data.text);
      }
    } catch (error) {
      console.error(error);
    }

    setFileLoading(false);
  };

  const explainReport = async () => {
    if (!reportText.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText }),
      });

      const data = await res.json();
      setResult(data.explanation || "No response generated.");
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze report.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Explain Medical Report</h1>

      {/* Upload Section */}
      <div className="mb-4 bg-white p-4 rounded shadow-sm border">
        <label className="block mb-2 font-medium">Upload Image or PDF</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
        />

        {fileLoading && (
          <p className="text-gray-500 mt-2">Extracting text from file...</p>
        )}
      </div>

      {/* Text Area */}
      <textarea
        rows={8}
        className="w-full border p-3 rounded mb-4"
        placeholder="Or paste medical report here..."
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
      />

      <button
        onClick={explainReport}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? "Analyzing..." : "Explain Report"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
