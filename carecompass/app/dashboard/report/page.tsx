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
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.15),_transparent_40%)]" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            AI Medical Report Explainer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
            Upload medical reports (PDF or images) or paste your report text.
            CareCompass AI will convert complex clinical data into simple,
            structured explanations for better understanding.
          </p>
        </div>
      </div>

      {/* 📤 Upload Section (Premium Glass Card) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl transition">
        <h2 className="text-2xl font-semibold mb-4">
          Upload Medical Report
        </h2>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-emerald-500 transition">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Drag & drop or upload Image / PDF report
          </p>

          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="text-sm"
          />

          {fileLoading && (
            <p className="text-sm text-emerald-500 mt-4 font-medium">
              🔍 Extracting text using OCR & AI preprocessing...
            </p>
          )}
        </div>
      </div>

      {/* 📝 Text Input Card */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Paste Report Text (Optional)
          </h2>
          <span className="text-xs text-gray-500">
            Supports lab reports, prescriptions, scans
          </span>
        </div>

        <textarea
          rows={8}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm leading-relaxed"
          placeholder="Paste your medical report here for AI explanation..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
        />

        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={explainReport}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:scale-[1.02] transition text-white px-8 py-3 rounded-2xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Analyzing Report with AI..." : "Explain Report"}
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

      {/* 🧠 AI Result Section (Clinical Style) */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              AI Clinical Explanation
            </h2>

            <span className="px-4 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              AI Generated
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            ⚠️ This explanation is AI-generated for educational purposes and
            does not replace professional medical advice.
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
                  "Medical Report Explanation",
                  reportText,
                  result
                )
              }
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              Download Clinical PDF Report
            </button>
          </div>
        </div>
      )}

      {/* 📚 History Section (Premium Timeline Style) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">
            Previous Report Analyses
          </h2>

          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="relative border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition"
              >
                <p className="text-xs text-gray-400 mb-3">
                  {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                </p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    📄 Report Text
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {item.originalText}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    🧠 AI Explanation
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {item.aiResponse}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setReportText(item.originalText);
                    setResult(item.aiResponse);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="mt-4 text-sm font-semibold text-emerald-600 hover:underline"
                >
                  View Full Explanation →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}