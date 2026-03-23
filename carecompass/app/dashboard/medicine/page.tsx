"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  saveMedicineHistory,
  getMedicineHistory,
} from "@/services/medicineService";

interface MedicineHistory {
  id: string;
  medicineName: string;
  description: string;
}

export default function MedicinePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const autoMedicine = searchParams.get("name");

  const [medicineText, setMedicineText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<MedicineHistory[]>([]);

  // 🔒 NEW: Prevent double auto-generation (UNCHANGED)
  const hasAutoDescribed = useRef(false);
  const isGeneratingRef = useRef(false);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const data = await getMedicineHistory(user.uid);
      setHistory(data as MedicineHistory[]);
    } catch (err) {
      console.error("Failed to load medicine history:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // 🔥 FIXED: Safe auto-describe (UNCHANGED)
  useEffect(() => {
    if (autoMedicine && !hasAutoDescribed.current) {
      hasAutoDescribed.current = true;
      setMedicineText(autoMedicine);
      describeMedicine(autoMedicine);
    }
  }, [autoMedicine]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);

    try {
      if (file.type === "application/pdf") {
        const pdfResult = await extractTextFromPDF(file);

        if (pdfResult.text.trim().length < 20) {
          const { data } = await Tesseract.recognize(file, "eng");
          setMedicineText(data.text);
        } else {
          setMedicineText(pdfResult.text);
        }
      } else {
        const { data } = await Tesseract.recognize(file, "eng");
        setMedicineText(data.text);
      }
    } catch (error) {
      console.error(error);
    }

    setFileLoading(false);
  };

  const describeMedicine = async (text?: string) => {
    // 🔒 Prevent double execution (UNCHANGED)
    if (isGeneratingRef.current) return;

    const finalText = text || medicineText;
    if (!finalText.trim()) return;

    isGeneratingRef.current = true;
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
      const description =
        data.description || "No description generated.";

      setResult(description);

      // 🔥 Safe Firestore save (UNCHANGED)
      if (user) {
        await saveMedicineHistory(
          user.uid,
          finalText,
          description
        );
        await loadHistory();
      }
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze medicine.");
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Clinical Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-emerald-600/10 dark:from-purple-500/10 dark:via-blue-500/5 dark:to-emerald-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 dark:from-purple-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
            💊 Medicine Describer AI
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-bold mt-4 text-sm max-w-2xl leading-relaxed">
            Upload prescriptions or enter medicine names to get structured clinical insights including uses, composition, side-effects, and precautions powered by AI analysis.
          </p>
        </div>
      </div>

      {/* 🧠 Input Card */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
            Enter Medicine or Upload Prescription
          </h2>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Supports images, scanned prescriptions, and PDFs (OCR enabled)
          </p>
        </div>

        {/* 📄 Premium Upload Zone */}
        <div className="relative group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-white/40 dark:bg-black/20 backdrop-blur-md transition-all hover:border-purple-500/50 hover:bg-white/60 dark:hover:bg-black/30">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="space-y-3">
            <div className="text-4xl">📄</div>
            <p className="text-sm font-black text-gray-700 dark:text-gray-300">
              {fileLoading ? "Extracting text..." : "Click to upload prescription image or PDF"}
            </p>
            <p className="text-xs font-bold text-gray-500">
              Automatic medicine extraction using advanced OCR
            </p>
          </div>

          {fileLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-2xl z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-black text-purple-600 dark:text-purple-400">🔍 Analyzing Document...</p>
              </div>
            </div>
          )}
        </div>

        {/* ✍️ Enhanced Text Area */}
        <div className="space-y-3">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span>✍️ Medicine Name / Extracted Text</span>
          </label>
          <textarea
            rows={4}
            value={medicineText}
            onChange={(e) => setMedicineText(e.target.value)}
            placeholder="e.g., Paracetamol 500mg, Metformin, Amoxicillin, Crocin Advance..."
            className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
          />
        </div>

        {/* 🚀 Analyze Button */}
        <button
          onClick={() => describeMedicine()}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all text-white py-5 rounded-2xl font-black shadow-lg disabled:opacity-50 text-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              🧠 AI Analyzing...
            </span>
          ) : (
            "Describe Medicine AI →"
          )}
        </button>
      </div>

      {/* 🧾 Result Section */}
      {result && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
              <span>🩺 Clinical AI Insight</span>
            </h2>
            <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20 font-black text-xs uppercase tracking-wider">
              Verified Analysis
            </span>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-8">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              ⚠️ Educational clinical summary only. Always consult a healthcare professional.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none prose-p:font-bold prose-headings:font-black prose-li:font-bold prose-headings:text-purple-600 dark:prose-headings:text-purple-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 📚 History Section */}
      {history.length > 0 && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
              <span>📚 Analysis History</span>
            </h2>
            <span className="text-sm font-black text-gray-500 dark:text-gray-400">
              {history.length} Saved Records
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative border border-white/60 dark:border-white/[0.05] bg-white/40 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl transition-all hover:bg-white/60 dark:hover:bg-black/30 shadow-inner"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-xl text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    💊 {item.medicineName}
                  </h3>
                  <button
                    onClick={() => {
                      setMedicineText(item.medicineName);
                      setResult(item.description);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20 rounded-xl text-xs font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    View Details
                  </button>
                </div>

                <div className="prose dark:prose-invert max-w-none text-xs line-clamp-3 text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.description}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}