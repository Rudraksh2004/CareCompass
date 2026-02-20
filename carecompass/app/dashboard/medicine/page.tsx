"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  saveMedicineHistory,
  getMedicineHistory,
} from "@/services/medicineHistoryService";

export default function MedicinePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const autoMedicine = searchParams.get("name");

  const [medicineText, setMedicineText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [detectedMedicines, setDetectedMedicines] = useState<string[]>([]);
  const [detecting, setDetecting] = useState(false);

  // Load History
  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const data = await getMedicineHistory(user.uid);
    setHistory(data);
  };

  // Auto-fill from reminder redirect
  useEffect(() => {
    if (autoMedicine) {
      setMedicineText(autoMedicine);
      describeMedicine(autoMedicine);
    }
  }, [autoMedicine]);

  // 🔥 NEW: Detect medicines using AI
  const detectMedicines = async (text: string) => {
    if (!text || text.length < 10) return;

    setDetecting(true);
    try {
      const res = await fetch("/api/ai/extract-medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setDetectedMedicines(data.medicines || []);
    } catch (error) {
      console.error(error);
    }
    setDetecting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setDetectedMedicines([]);

    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        const pdfResult = await extractTextFromPDF(file);
        extractedText = pdfResult.text;
      } else {
        const { data } = await Tesseract.recognize(file, "eng");
        extractedText = data.text;
      }

      setMedicineText(extractedText);

      // 🔥 AUTO DETECT MEDICINES
      await detectMedicines(extractedText);
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
      const description = data.description || "No description generated.";

      setResult(description);

      if (user) {
        await saveMedicineHistory(user.uid, {
          medicineText: finalText,
          aiResponse: description,
        });
        loadHistory();
      }
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze medicine.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-emerald-600/10 p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Medicine Describer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          Upload prescription → Detect medicines → Get clinical explanations
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">
          Upload Prescription or Enter Medicine
        </h2>

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="mb-4"
        />

        {fileLoading && (
          <p className="text-sm text-gray-500">Extracting text from file...</p>
        )}

        {/* 🔥 Detected Medicines Chips */}
        {detecting && (
          <p className="text-sm text-blue-500 mt-3">
            Detecting medicines from prescription...
          </p>
        )}

        {detectedMedicines.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Detected Medicines:</p>
            <div className="flex flex-wrap gap-2">
              {detectedMedicines.map((med, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-full shadow-sm hover:shadow-md transition"
                >
                  <span className="text-sm font-medium">💊 {med}</span>

                  {/* Describe Button */}
                  <button
                    onClick={() => describeMedicine(med)}
                    className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
                  >
                    Describe
                  </button>

                  {/* Add to Reminder Button */}
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/reminders?medicine=${encodeURIComponent(med)}`,
                      )
                    }
                    className="text-xs px-3 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition font-semibold"
                  >
                    + Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          rows={4}
          value={medicineText}
          onChange={(e) => setMedicineText(e.target.value)}
          placeholder="e.g., Paracetamol 500mg, Metformin..."
          className="w-full mt-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={() => describeMedicine()}
          disabled={loading}
          className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
        >
          {loading ? "Analyzing..." : "Describe Medicine"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">
            Clinical Medicine Description
          </h2>

          <div className="prose dark:prose-invert max-w-none text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
