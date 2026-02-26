"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  saveMedicineHistory,
  getMedicineHistory,
} from "@/services/medicineService";

interface MedicineHistory {
  id: string;
  medicineName: string;
  description: string;
}

export default function MedicinePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const autoMedicine = searchParams.get("name");

  const [medicineText, setMedicineText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<MedicineHistory[]>([]);

  // 🔒 NEW: Prevent double auto-generation (UNCHANGED)
  const hasAutoDescribed = useRef(false);
  const isGeneratingRef = useRef(false);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const data = await getMedicineHistory(user.uid);
      setHistory(data as MedicineHistory[]);
    } catch (err) {
      console.error("Failed to load medicine history:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // 🔥 FIXED: Safe auto-describe (UNCHANGED)
  useEffect(() => {
    if (autoMedicine && !hasAutoDescribed.current) {
      hasAutoDescribed.current = true;
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
    // 🔒 Prevent double execution (UNCHANGED)
    if (isGeneratingRef.current) return;

    const finalText = text || medicineText;
    if (!finalText.trim()) return;

    isGeneratingRef.current = true;
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
      const description =
        data.description || "No description generated.";

      setResult(description);

      // 🔥 Safe Firestore save (UNCHANGED)
      if (user) {
        await saveMedicineHistory(
          user.uid,
          finalText,
          description
        );
        await loadHistory();
      }
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze medicine.");
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Clinical Header (UI POLISHED ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-emerald-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
            💊 Medicine Describer AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm max-w-2xl leading-relaxed">
            Upload prescriptions or enter medicine names to get structured
            clinical insights including uses, composition, side-effects, and
            precautions powered by AI analysis.
          </p>
        </div>
      </div>

      {/* 🧠 Input Card (UX ENHANCED — LOGIC UNCHANGED) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Enter Medicine or Upload Prescription
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supports images, scanned prescriptions, and PDFs (OCR enabled)
          </p>
        </div>

        {/* 📄 Premium Upload Zone (UI ONLY) */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition hover:border-purple-400">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload prescription image or PDF for automatic text extraction
          </p>

          {fileLoading && (
            <div className="mt-3 text-sm text-purple-600 font-medium animate-pulse">
              🔍 Extracting medicine text using OCR...
            </div>
          )}
        </div>

        {/* ✍️ Enhanced Text Area (UI ONLY) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Medicine Name / Extracted Text
          </label>
          <textarea
            rows={5}
            value={medicineText}
            onChange={(e) => setMedicineText(e.target.value)}
            placeholder="e.g., Paracetamol 500mg, Metformin, Amoxicillin, Crocin Advance..."
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
          />
        </div>

        {/* 🚀 Analyze Button (UI POLISH ONLY) */}
        <button
          onClick={() => describeMedicine()}
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 hover:opacity-90 transition text-white py-4 rounded-2xl font-semibold shadow-xl disabled:opacity-50 text-lg"
        >
          {loading ? "🧠 Analyzing Medicine Clinically..." : "Describe Medicine"}
        </button>
      </div>

      {/* 🧾 Result Section (CLINICAL UX UPGRADE — NO LOGIC CHANGE) */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Clinical Medicine Analysis
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
              AI Generated
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            ⚠️ Educational clinical summary. Not a substitute for professional medical advice.
          </p>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 📚 History Section (UI TIMELINE STYLE — LOGIC SAME) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              📚 Previous Medicine Analyses
            </h2>
            <span className="text-xs text-gray-500">
              {history.length} records
            </span>
          </div>

          <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  💊 {item.medicineName}
                </h3>

                <div className="prose dark:prose-invert max-w-none text-sm line-clamp-4 text-gray-700 dark:text-gray-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.description}
                  </ReactMarkdown>
                </div>

                <button
                  onClick={() => {
                    setMedicineText(item.medicineName);
                    setResult(item.description);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  View Full Clinical Analysis →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}