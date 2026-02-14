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
    <div className="max-w-4xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">
        Explain Medical Report
      </h1>

      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <p className="font-medium mb-3">
          Upload Image or PDF Report
        </p>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="text-sm"
        />
        {fileLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Extracting text from file...
          </p>
        )}
      </div>

      {/* Text Input */}
      <textarea
        rows={8}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-colors"
        placeholder="Or paste your medical report here..."
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
      />

      <button
        onClick={explainReport}
        className="bg-emerald-600 hover:bg-emerald-700 transition text-white px-6 py-3 rounded-xl font-medium shadow-sm disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Analyzing Report..." : "Explain Report"}
      </button>

      {/* AI Result */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
            <div className="prose dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>

          <button
            onClick={() =>
              exportMedicalPDF(
                "Medical Report Explanation",
                reportText,
                result
              )
            }
            className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-2 rounded-xl font-medium"
          >
            Download PDF
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Previous Reports
          </h2>

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm transition-colors"
              >
                <p className="text-xs text-gray-400 mb-2">
                  {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                </p>

                <p className="text-sm font-semibold mb-1">
                  Report:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                  {item.originalText}
                </p>

                <p className="text-sm font-semibold mb-1">
                  AI Explanation:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {item.aiResponse}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
