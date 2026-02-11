"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function ReportPage() {
  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Handle Image Upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);

    const { data } = await Tesseract.recognize(
      file,
      "eng"
    );

    setReportText(data.text);
    setOcrLoading(false);
  };

  const explainReport = async () => {
    if (!reportText.trim()) return;

    setLoading(true);
    setResult("");

    const res = await fetch("/api/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportText }),
    });

    const data = await res.json();
    setResult(data.explanation || "No response");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Explain Medical Report
      </h1>

      {/* Upload Section */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Upload Report Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
        />
        {ocrLoading && (
          <p className="text-gray-500 mt-2">
            Extracting text from image...
          </p>
        )}
      </div>

      {/* Text Area */}
      <textarea
        rows={8}
        className="w-full border p-3 rounded mb-4"
        placeholder="Or paste medical report here..."
        value={reportText}
        onChange={(e) =>
          setReportText(e.target.value)
        }
      />

      <button
        onClick={explainReport}
        className="bg-green-600 text-white px-4 py-2 rounded"
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
