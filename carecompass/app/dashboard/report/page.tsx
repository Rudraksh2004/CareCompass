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

export default function ReportPage() {
  const { user } = useAuth();

  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null); // 🔥 NEW (history only)

  useEffect(() => {
    if (user) {
      getHistory(user.uid, "reports").then(setHistory);
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
          setReportText(data.text);
        } else {
          setReportText(pdfResult.text);
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
      const explanation =
        data.explanation || "No response generated.";

      setResult(explanation);

      if (user) {
        await saveHistory(user.uid, "reports", {
          originalText: reportText,
          aiResponse: explanation,
        });

        const updated = await getHistory(user.uid, "reports");
        setHistory(updated);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  // 🔥 NEW: Delete single report (HISTORY ONLY)
  const deleteReport = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "reports", id));
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Clinical Header (UNCHANGED) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            📄 Medical Report Explainer AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm max-w-2xl leading-relaxed">
            Upload lab reports, scans, or prescriptions and get simplified,
            structured clinical explanations powered by CareCompass AI.
          </p>
        </div>
      </div>

      {/* 📤 Upload Card (UNCHANGED) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Upload Medical Report
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supports images, scanned reports, and PDFs (OCR enabled)
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:border-emerald-400 transition">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload report image or PDF for automatic AI text extraction
          </p>

          {fileLoading && (
            <div className="mt-4 text-sm text-emerald-600 font-medium animate-pulse">
              🔍 Extracting report text using OCR & preprocessing...
            </div>
          )}
        </div>
      </div>

      {/* 📝 Paste Text Section (UNCHANGED — NOT TOUCHED) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Paste Report Text (Optional)
          </h2>
          <span className="text-xs text-gray-500">
            Lab reports • Prescriptions • Scans
          </span>
        </div>

        <textarea
          rows={8}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm leading-relaxed shadow-sm"
          placeholder="Paste your medical report here for AI clinical explanation..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        />

        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={explainReport}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:opacity-90 transition text-white px-8 py-3 rounded-2xl font-semibold shadow-xl disabled:opacity-50 text-lg"
          >
            {loading
              ? "🧠 Analyzing Report Clinically..."
              : "Explain Medical Report"}
          </button>

          {reportText && (
            <button
              onClick={() => setReportText("")}
              className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Clear Text
            </button>
          )}
        </div>
      </div>

      {/* 🧠 AI Result (UNCHANGED) */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-2xl">
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 📚 HISTORY (ONLY SECTION UPDATED AS REQUESTED) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">
            📚 Previous Report Analyses
          </h2>

          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm"
                >
                  <p className="text-xs text-gray-400 mb-3">
                    {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                  </p>

                  <p className="text-sm font-semibold mb-1">
                    📄 Report Text
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {item.originalText}
                  </p>

                  <p className="text-sm font-semibold mt-4 mb-1">
                    🧠 AI Explanation
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

                  {/* 🔥 ACTION BUTTONS (EXPAND + VIEWER + DELETE) */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : item.id)
                      }
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {isExpanded
                        ? "Collapse Explanation"
                        : "Expand Full Explanation"}
                    </button>

                    <button
                      onClick={() => {
                        setReportText(item.originalText);
                        setResult(item.aiResponse);
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      Expand in Viewer
                    </button>

                    <button
                      onClick={() => deleteReport(item.id)}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
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