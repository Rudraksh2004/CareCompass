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
      {/* 🌟 Premium Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-emerald-600/10 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-emerald-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_40%)]" />

        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
            💊 Prescription Simplifier AI
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-bold mt-4 max-w-2xl leading-relaxed text-sm">
            Upload handwritten, scanned, or digital prescriptions and get
            clear, easy-to-understand medication instructions powered by
            CareCompass AI.
          </p>
        </div>
      </div>

      {/* 📤 Upload Card */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(99,102,241,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 to-transparent dark:from-indigo-400/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
              Upload Prescription
            </h2>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wide">
              Supports images, scanned prescriptions, and PDFs (OCR enabled)
            </p>
          </div>

          <div className="border-2 border-dashed border-indigo-500/30 dark:border-indigo-500/20 rounded-2xl p-8 text-center bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-inner transition hover:border-indigo-500/60 dark:hover:border-indigo-400 hover:bg-white/60 dark:hover:bg-white/[0.05]">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 file:transition-colors file:cursor-pointer"
            />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              Upload prescription image or PDF for automatic AI text extraction
            </p>

            {fileLoading && (
              <div className="mt-5 text-sm font-black text-indigo-600 dark:text-indigo-400 animate-pulse bg-indigo-50 dark:bg-indigo-500/10 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 inline-block shadow-sm">
                🔍 Extracting prescription text using OCR...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📝 Text Input Card */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
            Paste Prescription Text <span className="text-gray-500 text-lg font-bold">(Optional)</span>
          </h2>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden md:block">
            Handwritten • Digital • Scanned
          </span>
        </div>

        <textarea
          rows={8}
          className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner placeholder-gray-500 dark:placeholder-gray-500"
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
            className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-90 transition text-white px-8 py-3.5 rounded-2xl font-black shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:shadow-none text-lg"
          >
            {loading
              ? "🧠 Simplifying Prescription..."
              : "Simplify Prescription"}
          </button>

          {prescriptionText && (
            <button
              onClick={() => setPrescriptionText("")}
              className="px-6 py-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-gray-400/30 dark:border-white/[0.1] text-sm font-black text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/[0.08] shadow-sm hover:scale-[1.02] transition-all"
            >
              Clear Text
            </button>
          )}
        </div>
      </div>

      {/* 🧠 AI Result (Liquid Glass Card) */}
      {result && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-indigo-500/20 dark:border-t-indigo-400/30 dark:border-l-indigo-500/20 bg-[rgba(255,255,255,0.85)] dark:bg-[#030712]/60 backdrop-blur-[40px] backdrop-saturate-[2] p-10 rounded-3xl shadow-[0_8px_30px_rgba(99,102,241,0.1)] dark:shadow-[0_8px_40px_rgba(99,102,241,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none rounded-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-800/50 pb-6">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
                <span className="text-indigo-600 dark:text-indigo-400">🧠</span> Simplified Prescription
              </h2>
              <span className="text-xs px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/20 shadow-sm w-max">
                AI Generated
              </span>
            </div>

            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 mb-8 shadow-sm">
              ⚠️ Educational simplification only. Always follow your doctor’s instructions carefully.
            </p>

            <div className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:font-medium prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 max-w-none text-sm leading-relaxed marker:text-indigo-500">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>

            <div className="mt-10 flex justify-end border-t border-gray-200 dark:border-gray-800/50 pt-6">
              <button
                onClick={() =>
                  exportMedicalPDF(
                    "Simplified Prescription",
                    prescriptionText,
                    result
                  )
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition text-white px-6 py-3.5 rounded-xl font-bold shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.5)] hover:scale-[1.03]"
              >
                Download Clinical PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📚 History */}
      {history.length > 0 && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
              📚 Previous Analyses
            </h2>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-4 py-1.5 rounded-full border border-white/60 dark:border-white/[0.08] shadow-sm">
              {history.length} records
            </span>
          </div>

          <div className="space-y-5 max-h-[600px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative border border-white/60 dark:border-white/[0.08] rounded-2xl p-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl shadow-sm hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-indigo-400/50 dark:hover:border-indigo-500/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      {item.createdAt?.toDate?.().toLocaleString?.() || ""}
                    </p>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-white/50 dark:bg-transparent text-red-600 dark:text-red-400 text-[10px] font-black hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="text-sm font-black text-gray-900 dark:text-white mb-1">
                    📄 Prescription Extract
                  </p>
                  <p
                    className={`text-sm font-medium text-gray-600 dark:text-gray-400 mb-5 leading-relaxed italic ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    "{item.originalText}"
                  </p>

                  <div className="border-t border-gray-200 dark:border-gray-800/60 pt-4">
                    <p className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-2">
                      🧠 AI Conclusion
                    </p>
                    <div
                      className={`prose prose-sm dark:prose-invert prose-headings:font-bold prose-p:font-medium prose-strong:text-indigo-600 dark:prose-strong:text-indigo-300 max-w-none text-gray-700 dark:text-gray-300 ${
                        isExpanded ? "" : "line-clamp-3"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.aiResponse}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* 🔥 ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-2">
                    <button
                      onClick={() =>
                        setExpandedId(
                          isExpanded ? null : item.id
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-black hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shadow-sm"
                    >
                      {isExpanded ? "Collapse View" : "Quick Expand"}
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
                      className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-black hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
                    >
                      Load into Main Viewer
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