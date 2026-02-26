"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { useAuth } from "@/context/AuthContext";
import { saveHistory, getHistory } from "@/services/historyService";
import { exportMedicalPDF } from "@/utils/pdfExporter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReportPage() {
  const { user } = useAuth();

  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getHistory(user.uid, "reports").then(setHistory);
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const explanation = data.explanation || "No response generated.";

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

  return (
    <div className="max-w-5xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header (UI ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-blue-600/10 backdrop-blur-xl p-10 shadow-xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          📄 Medical Report Explainer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm max-w-2xl">
          Upload lab reports, scans, or medical documents to receive simplified,
          AI-powered explanations in clear, student-friendly language.
        </p>
      </div>

      {/* 🧠 Upload Card (Polished UI, Same Logic) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Upload Medical Report</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supports PDFs, scanned reports, and images with OCR extraction
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition hover:border-emerald-400">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            Drag & drop or upload your medical report file
          </p>

          {fileLoading && (
            <p className="text-sm text-emerald-600 font-medium mt-3 animate-pulse">
              🔍 Extracting medical text using OCR...
            </p>
          )}
        </div>
      </div>

      {/* ✍️ Text Input (Enhanced UX ONLY) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-xl">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
          Or Paste Medical Report Text
        </label>
        <textarea
          rows={8}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900 dark:text-gray-100 shadow-sm"
          placeholder="Paste your blood test, MRI report, lab results, or any medical report here..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        />
      </div>

      {/* 🚀 Analyze Button (Premium Style, Same Logic) */}
      <button
        onClick={explainReport}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition text-white px-8 py-4 rounded-2xl font-semibold shadow-xl disabled:opacity-50 text-lg"
        disabled={loading}
      >
        {loading ? "🧠 Analyzing Medical Report..." : "Explain Report"}
      </button>

      {/* 🧾 AI Result (Clinical Card UI ONLY) */}
      {result && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold">AI Report Explanation</h2>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                AI Generated
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              ⚠️ Educational explanation only. Not a medical diagnosis.
            </p>

            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>

          <button
            onClick={() =>
              exportMedicalPDF("Medical Report Explanation", reportText, result)
            }
            className="bg-purple-600 hover:bg-purple-700 transition text-white px-6 py-3 rounded-2xl font-semibold shadow-lg"
          >
            📄 Download Clinical PDF Report
          </button>
        </div>
      )}

      {/* 📚 History (Modern Timeline UI ONLY) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">
            📚 Previous Report Analyses
          </h2>

          <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all"
              >
                <p className="text-xs text-gray-400 mb-3">
                  {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                </p>

                <p className="text-sm font-semibold mb-1">🧾 Report Text:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {item.originalText}
                </p>

                <p className="text-sm font-semibold mb-1">🧠 AI Explanation:</p>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="line-clamp-3">{item.aiResponse}</div>

                  <button
                    onClick={() => {
                      setReportText(item.originalText);
                      setResult(item.aiResponse);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="mt-3 text-sm font-semibold text-emerald-600 hover:underline"
                  >
                    View Full Explanation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
