"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { useAuth } from "@/context/AuthContext";
import { saveHistory, getHistory } from "@/services/historyService";
import { exportMedicalPDF } from "@/utils/pdfExporter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PrescriptionPage() {
  const { user } = useAuth();

  const [prescriptionText, setPrescriptionText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getHistory(user.uid, "prescriptions").then(setHistory);
    }
  }, [user]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);

    try {
      if (file.type === "application/pdf") {
        const pdfResult = await extractTextFromPDF(file);

        if (pdfResult.text.trim().length < 30) {
          const { data } = await Tesseract.recognize(file, "eng");
          setPrescriptionText(data.text);
        } else {
          setPrescriptionText(pdfResult.text);
        }
      } else {
        const { data } = await Tesseract.recognize(file, "eng");
        setPrescriptionText(data.text);
      }
    } catch (error) {
      console.error(error);
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
      const simplified =
        data.simplified || "No response generated.";

      setResult(simplified);

      if (user) {
        await saveHistory(user.uid, "prescriptions", {
          originalText: prescriptionText,
          aiResponse: simplified,
        });

        const updated = await getHistory(
          user.uid,
          "prescriptions"
        );
        setHistory(updated);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "prescriptions", id)
      );

      const updated = await getHistory(
        user.uid,
        "prescriptions"
      );
      setHistory(updated);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Gradient Header (MATCHES OTHER PAGES) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_40%)]" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
            💊 Prescription Simplifier AI
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-2xl leading-relaxed">
            Upload handwritten, scanned, or digital prescriptions and get
            clear, easy-to-understand medication instructions powered by
            CareCompass AI.
          </p>
        </div>
      </div>

      {/* 📤 Upload Card (Polished Glass Style) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Upload Prescription
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supports images, scanned prescriptions, and PDFs (OCR enabled)
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:border-indigo-400 transition">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload prescription image or PDF for automatic AI text extraction
          </p>

          {fileLoading && (
            <div className="mt-4 text-sm text-indigo-600 font-medium animate-pulse">
              🔍 Extracting prescription text using OCR...
            </div>
          )}
        </div>
      </div>

      {/* 📝 Text Input Card (Polished) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Paste Prescription Text (Optional)
          </h2>
          <span className="text-xs text-gray-500">
            Handwritten • Digital • Scanned
          </span>
        </div>

        <textarea
          rows={8}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm leading-relaxed shadow-sm"
          placeholder="Paste prescription text here for AI simplification..."
          value={prescriptionText}
          onChange={(e) =>
            setPrescriptionText(e.target.value)
          }
        />

        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={simplifyPrescription}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition text-white px-8 py-3 rounded-2xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading
              ? "🧠 Simplifying Prescription..."
              : "Simplify Prescription"}
          </button>

          {prescriptionText && (
            <button
              onClick={() => setPrescriptionText("")}
              className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Clear Text
            </button>
          )}
        </div>
      </div>

      {/* 🧠 AI Result (Clinical Card Style) */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              Simplified Prescription Explanation
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold">
              AI Generated
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            ⚠️ Educational simplification only. Always follow your doctor’s instructions.
          </p>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() =>
                exportMedicalPDF(
                  "Simplified Prescription",
                  prescriptionText,
                  result
                )
              }
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              Download Clinical PDF
            </button>
          </div>
        </div>
      )}

      {/* 📚 History (UNCHANGED LOGIC — ONLY POLISHED UI) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              📚 Previous Prescription Analyses
            </h2>
            <span className="text-xs text-gray-500">
              {history.length} records
            </span>
          </div>

          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                    </p>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-semibold"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-sm font-semibold mb-1">
                    📄 Prescription Text
                  </p>
                  <p
                    className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {item.originalText}
                  </p>

                  <p className="text-sm font-semibold mt-4 mb-1">
                    🧠 AI Simplified
                  </p>
                  <div
                    className={`prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 ${
                      isExpanded ? "" : "line-clamp-4"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.aiResponse}
                    </ReactMarkdown>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() =>
                        setExpandedId(
                          isExpanded ? null : item.id
                        )
                      }
                      className="text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      {isExpanded ? "Collapse" : "Expand Full"}
                    </button>

                    <button
                      onClick={() => {
                        setPrescriptionText(item.originalText);
                        setResult(item.aiResponse);
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      Load to Viewer →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}