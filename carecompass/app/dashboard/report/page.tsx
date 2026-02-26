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

  // 🔥 NEW: UI-only state for expandable history (NO LOGIC CHANGE)
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          AI Medical Report Explainer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm max-w-2xl">
          Upload medical reports (PDF, image, or text) and receive simplified,
          structured clinical explanations powered by AI.
        </p>
      </div>

      {/* 📤 Upload Card */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl transition">
        <h2 className="text-xl font-semibold mb-4">
          Upload Medical Report
        </h2>

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="text-sm"
        />

        {fileLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            🔍 Extracting text from file using OCR...
          </p>
        )}
      </div>

      {/* 📝 Text Input */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">
          Paste Report Text (Optional)
        </h2>

        <textarea
          rows={8}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          placeholder="Paste your medical report here for AI explanation..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        />

        <button
          onClick={explainReport}
          className="mt-6 bg-gradient-to-r from-emerald-600 to-blue-600 hover:opacity-90 transition text-white px-8 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Analyzing Report..." : "Explain Report"}
        </button>
      </div>

      {/* 🧠 AI Result Card */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">
            Clinical AI Explanation
          </h2>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>

          <button
            onClick={() =>
              exportMedicalPDF(
                "Medical Report Explanation",
                reportText,
                result
              )
            }
            className="mt-6 bg-purple-600 hover:bg-purple-700 transition text-white px-6 py-2 rounded-xl font-medium shadow"
          >
            Download PDF Report
          </button>
        </div>
      )}

      {/* 📚 Premium History Section (WITH EXPAND/COLLAPSE) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">
            Previous Report Analyses
          </h2>

          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition"
                >
                  <p className="text-xs text-gray-400 mb-3">
                    {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                  </p>

                  {/* Report Preview */}
                  <p className="text-sm font-semibold mb-1">
                    📄 Report Text:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {item.originalText}
                  </p>

                  {/* AI Explanation */}
                  <p className="text-sm font-semibold mb-2">
                    🧠 AI Explanation:
                  </p>

                  <div
                    className={`prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 transition-all duration-300 ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.aiResponse}
                    </ReactMarkdown>
                  </div>

                  {/* 🔥 Expand / Collapse Toggle (NEW PREMIUM UX) */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : item.id)
                      }
                      className="text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      {isExpanded
                        ? "Collapse Explanation ▲"
                        : "Expand Explanation ▼"}
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
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      View in Full Report
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