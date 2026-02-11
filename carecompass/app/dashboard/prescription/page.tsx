"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function PrescriptionPage() {
  const [prescriptionText, setPrescriptionText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Handle image upload + OCR
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

    setPrescriptionText(data.text);
    setOcrLoading(false);
  };

  const simplifyPrescription = async () => {
    if (!prescriptionText.trim()) return;

    setLoading(true);
    setResult("");

    const res = await fetch(
      "/api/ai/simplify-prescription",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionText }),
      }
    );

    const data = await res.json();
    setResult(data.simplified || "No response");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Simplify Prescription
      </h1>

      {/* Upload Section */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Upload Image (Photo or Handwritten)
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
        placeholder="Or paste prescription here..."
        value={prescriptionText}
        onChange={(e) =>
          setPrescriptionText(e.target.value)
        }
      />

      <button
        onClick={simplifyPrescription}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Simplifying..." : "Simplify"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
