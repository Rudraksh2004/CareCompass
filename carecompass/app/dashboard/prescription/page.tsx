"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";

export default function PrescriptionPage() {
  const [prescriptionText, setPrescriptionText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);

    try {
      if (file.type === "application/pdf") {
        const text = await extractTextFromPDF(file);
        setPrescriptionText(text);
      } else {
        const { data } = await Tesseract.recognize(file, "eng");
        setPrescriptionText(data.text);
      }
    } catch (error) {
      console.error("File processing failed:", error);
    }

    setFileLoading(false);
  };

  const simplifyPrescription = async () => {
    if (!prescriptionText.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch(
        "/api/ai/simplify-prescription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prescriptionText }),
        }
      );

      const data = await res.json();
      setResult(data.simplified || "No response generated.");
    } catch (error) {
      console.error(error);
      setResult("Failed to simplify prescription.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Simplify Prescription
      </h1>

      {/* Upload Section */}
      <div className="mb-4 bg-white p-4 rounded shadow-sm border">
        <label className="block mb-2 font-medium">
          Upload Image or PDF
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
        />

        {fileLoading && (
          <p className="text-gray-500 mt-2">
            Extracting text from file...
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
