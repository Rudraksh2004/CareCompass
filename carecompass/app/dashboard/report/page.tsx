"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { useAuth } from "@/context/AuthContext";
import { saveHistory, getHistory } from "@/services/historyService";
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
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Explain Medical Report</h1>

      {/* Upload */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
        />
        {fileLoading && (
          <p className="text-sm text-gray-500 mt-2">Extracting text...</p>
        )}
      </div>

      {/* Textarea */}
      <textarea
        rows={8}
        className="w-full border border-gray-300 p-3 rounded-xl"
        placeholder="Or paste report here..."
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
      />

      <button
        onClick={explainReport}
        className="bg-emerald-600 hover:bg-emerald-700 transition text-white px-5 py-2 rounded-xl"
      >
        {loading ? "Analyzing..." : "Explain Report"}
      </button>

      {/* AI Result */}
      {result && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="prose max-w-none text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Previous Reports</h2>

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border shadow-sm"
              >
                <p className="text-xs text-gray-400 mb-2">
                  {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                </p>

                <p className="text-sm font-medium mb-1">Report:</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {item.originalText}
                </p>

                <p className="text-sm font-medium mb-1">AI Response:</p>
                <p className="text-sm text-gray-600 line-clamp-3">
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
