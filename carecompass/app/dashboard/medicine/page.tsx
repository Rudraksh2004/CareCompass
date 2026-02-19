"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { exportMedicalPDF } from "@/utils/pdfExporter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MedicinePage() {
  const searchParams = useSearchParams();
  const autoMedicine = searchParams.get("name");

  const [medicineText, setMedicineText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  // 🔥 Auto-fill from Reminder redirect (Option 1)
  useEffect(() => {
    if (autoMedicine) {
      setMedicineText(autoMedicine);
      describeMedicine(autoMedicine);
    }
  }, [autoMedicine]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);

    try {
      if (file.type === "application/pdf") {
        const pdfResult = await extractTextFromPDF(file);

        if (pdfResult.text.trim().length < 20) {
          const { data } = await Tesseract.recognize(file, "eng");
          setMedicineText(data.text);
        } else {
          setMedicineText(pdfResult.text);
        }
      } else {
        const { data } = await Tesseract.recognize(file, "eng");
        setMedicineText(data.text);
      }
    } catch (error) {
      console.error(error);
    }

    setFileLoading(false);
  };

  const describeMedicine = async (text?: string) => {
    const finalText = text || medicineText;
    if (!finalText.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/medicine-describer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineText: finalText,
        }),
      });

      const data = await res.json();
      setResult(data.description || "No description generated.");
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze medicine.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-emerald-600/10 backdrop-blur-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Medicine Describer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm max-w-2xl">
          Understand medicine composition, uses, side-effects, and precautions
          with structured clinical explanations.
        </p>
      </div>

      {/* 💊 Input Card */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">
          Enter Medicine Name or Upload Prescription
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm"
          />
          {fileLoading && (
            <p className="text-sm text-gray-500 mt-2">
              Extracting medicine text from file...
            </p>
          )}
        </div>

        {/* Text Input */}
        <textarea
          rows={4}
          value={medicineText}
          onChange={(e) => setMedicineText(e.target.value)}
          placeholder="e.g., Paracetamol 500mg, Metformin, Amoxicillin..."
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />

        <button
          onClick={() => describeMedicine()}
          disabled={loading}
          className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition text-white px-8 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
        >
          {loading ? "Analyzing Medicine..." : "Describe Medicine"}
        </button>
      </div>

      {/* 🧠 Result Card */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">
              Clinical Medicine Description
            </h2>

            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>

          {/* 📄 PDF Export */}
          <button
            onClick={() =>
              exportMedicalPDF(
                "Medicine Clinical Report",
                medicineText,
                result
              )
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition"
          >
            Download Clinical PDF Report
          </button>
        </div>
      )}
    </div>
  );
}
