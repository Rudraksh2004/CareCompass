"use client";

import { useState, useEffect, Suspense } from "react";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { useAuth } from "@/context/AuthContext";
import { saveHistory, getHistory } from "@/services/historyService";
import { exportMedicalPDF } from "@/utils/pdfExporter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  FileSearch, 
  UploadCloud, 
  BrainCircuit, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Download,
  Stethoscope,
  Activity,
  ShieldCheck,
  History,
  X,
  FileText
} from "lucide-react";

export default function PrescriptionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-indigo-500 font-black">BOOTING CLINICAL OCR ENGINE...</div>}>
      <PrescriptionContent />
    </Suspense>
  );
}

function PrescriptionContent() {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const res = await fetch("/api/ai/simplify-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionText }),
      });
      const data = await res.json();
      const simplified = data.simplified || "No response generated.";
      setResult(simplified);
      if (user) {
        await saveHistory(user.uid, "prescriptions", { originalText: prescriptionText, aiResponse: simplified });
        const updated = await getHistory(user.uid, "prescriptions");
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
      await deleteDoc(doc(db, "users", user.uid, "prescriptions", id));
      const updated = await getHistory(user.uid, "prescriptions");
      setHistory(updated);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Clinical OCR Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/20 to-purple-500/10 blur-[130px] -mr-64 -mt-64 transition-all group-hover:scale-110" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
                <FileSearch size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-400 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                Prescription Decoder
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
              Clinical-grade OCR and pharmacological simplification. CareCompass AI interprets handwritten data into patient-centric instructions.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-8 py-5 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 backdrop-blur-md flex flex-col items-center">
                <BrainCircuit className="text-purple-500 mb-2" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Neural Sync</span>
                <span className="text-xl font-black mt-1">OCR ACTIVE</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* 📋 Digital Intake (Input Side) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative group overflow-hidden rounded-[3rem] border border-white/60 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[60px] p-8 shadow-xl transition-all">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <UploadCloud className="text-indigo-500" size={24} />
                <h2 className="text-2xl font-black tracking-tighter">Clinical Intake</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 ml-2">Document Scan</label>
                  <div className="relative group/upload border-2 border-dashed border-indigo-500/20 dark:border-white/10 rounded-[2rem] p-10 text-center hover:bg-indigo-500/5 dark:hover:bg-white/5 transition-all cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="relative z-10 space-y-3">
                       <UploadCloud className="mx-auto text-indigo-500 group-hover/upload:scale-110 transition-transform" size={40} />
                       <div className="font-black text-sm uppercase tracking-widest">DRAG & DROP SCAN</div>
                       <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 italic">Supports Scanned PDFs & JPEGs</p>
                    </div>
                  </div>
                  {fileLoading && (
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Extracting Tokens...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 ml-2">Raw Clinical Data</label>
                  <textarea
                    rows={8}
                    className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 p-6 rounded-[2rem] font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs leading-relaxed"
                    placeholder="Extracted technical text will appear here..."
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                  />
                </div>

                <button
                  onClick={simplifyPrescription}
                  disabled={loading || !prescriptionText}
                  className="w-full bg-gray-900 dark:bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "DECODING..." : "SIMPLIFY PROTOCOL"} <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🧠 Deciphered Matrix (Output Side) */}
        <div className="lg:col-span-2 space-y-10">
          {!result ? (
            <div className="relative group overflow-hidden rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-20 flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[500px]">
              <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300">
                 <Stethoscope size={64} strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter text-gray-600 dark:text-gray-400 italic">Awaiting Regimen Synthesis</h3>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-500 max-w-xs uppercase tracking-widest leading-loose">Upload a prescription to generate a simplified medical translation matrix.</p>
              </div>
            </div>
          ) : (
            <div className="relative animate-in slide-in-from-right-12 duration-700 bg-white/[0.7] dark:bg-[#030712]/50 backdrop-blur-[80px] border border-white/80 dark:border-indigo-500/20 rounded-[3.5rem] p-12 shadow-3xl overflow-hidden group/result">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover/result:opacity-10 transition-opacity">
                 <ShieldCheck size={180} />
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 dark:border-white/5 pb-10">
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg"><CheckCircle2 size={24} /></div>
                         <h2 className="text-3xl font-black tracking-tighter">Deciphered Matrix</h2>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                         <Activity size={12} /> CareCompass Synthesis Active
                      </p>
                   </div>
                   <button
                     onClick={() => exportMedicalPDF("Simplified Prescription", prescriptionText, result)}
                     className="px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-sm hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                   >
                     <Download size={18} /> EXPORT RECORD
                   </button>
                </div>

                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex gap-4 items-start">
                   <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                   <p className="text-xs font-bold text-gray-700 dark:text-gray-400 leading-relaxed italic">
                     <span className="text-amber-600 uppercase font-black mr-2">Clinical Disclaimer:</span>
                     This synthesis is for informational continuity only. Always prioritize verified physician commands over AI pharmacological translations.
                   </p>
                </div>

                <div className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:font-bold prose-p:text-gray-700 dark:prose-p:text-gray-400 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-li:marker:text-blue-500 max-w-none text-sm leading-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📚 Historical Synthesis Registry */}
      {history.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-6">
             <History className="text-gray-400" size={24} />
             <h2 className="text-3xl font-black tracking-tighter">Historical Registry</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className={`relative group border transition-all duration-500 rounded-[3rem] p-10 overflow-hidden ${isExpanded ? "md:col-span-2 lg:col-span-3 bg-white/80 dark:bg-white/5 border-indigo-500/30 shadow-2xl" : "bg-white/[0.4] dark:bg-[#030712]/30 border-white/80 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 shadow-xl"}`}>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 flex items-center gap-2">
                          <Clock size={12} /> {item.createdAt?.toDate?.().toLocaleDateString()}
                       </p>
                       <button onClick={() => handleDelete(item.id)} className="p-3 rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xl font-black tracking-tighter flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><FileText size={18} /></div>
                          Protocol Analysis
                       </h4>
                       <p className={`text-xs font-bold text-gray-700 dark:text-gray-400 italic leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>"{item.originalText}"</p>
                    </div>

                    {isExpanded && (
                       <div className="pt-8 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                             <BrainCircuit size={12} /> Decoded Transformation
                          </p>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-400 font-bold leading-7">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.aiResponse}</ReactMarkdown>
                          </div>
                       </div>
                    )}

                    <div className="flex gap-4 pt-4">
                       <button
                         onClick={() => setExpandedId(isExpanded ? null : item.id)}
                         className="flex-1 py-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                       >
                         {isExpanded ? <><Minimize2 size={14} /> Collapse</> : <><Maximize2 size={14} /> Details</>}
                       </button>
                       {!isExpanded && (
                          <button
                            onClick={() => {
                              setPrescriptionText(item.originalText);
                              setResult(item.aiResponse);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="p-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 transition-all shadow-lg"
                          >
                             <ChevronRight size={16} />
                          </button>
                       )}
                    </div>
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