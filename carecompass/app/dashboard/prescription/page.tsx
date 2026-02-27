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
  const [expandedId, setExpandedId] = useState<string | null>(null); // 🔥 NEW (history expand only)

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

  // 🔥 NEW: Delete single prescription history (ONLY history logic)
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
    <div className="max-w-4xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">
        Simplify Prescription
      </h1>

      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <p className="font-medium mb-3">
          Upload Prescription (Image or PDF)
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

      {/* Text Area */}
      <textarea
        rows={8}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 transition-colors"
        placeholder="Or paste prescription text here..."
        value={prescriptionText}
        onChange={(e) =>
          setPrescriptionText(e.target.value)
        }
      />

      <button
        onClick={simplifyPrescription}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-xl font-medium shadow-sm disabled:opacity-50"
      >
        {loading ? "Simplifying..." : "Simplify Prescription"}
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
                "Simplified Prescription",
                prescriptionText,
                result
              )
            }
            className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-2 rounded-xl font-medium"
          >
            Download PDF
          </button>
        </div>
      )}

      {/* 🔥 UPDATED History (MATCHES REPORT PAGE BEHAVIOUR ONLY) */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Previous Prescriptions
          </h2>

          <div className="space-y-4">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                    </p>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-sm font-semibold mb-1">
                    Prescription:
                  </p>
                  <p
                    className={`text-sm text-gray-600 dark:text-gray-300 mb-3 ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {item.originalText}
                  </p>

                  <p className="text-sm font-semibold mb-1">
                    AI Simplified:
                  </p>

                  <div
                    className={`prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 ${
                      isExpanded ? "" : "line-clamp-4"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.aiResponse}
                    </ReactMarkdown>
                  </div>

                  <div className="flex gap-4 mt-4">
                    {/* Expand Full */}
                    <button
                      onClick={() =>
                        setExpandedId(
                          isExpanded ? null : item.id
                        )
                      }
                      className="text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      {isExpanded
                        ? "Collapse"
                        : "Expand Full"}
                    </button>

                    {/* Load to Viewer (like reports page) */}
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