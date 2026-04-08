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
      {/* 🔮 LUMINA PRESCRIPTION HEADER */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-ghost-border bg-surface-container-low/40 backdrop-blur-[60px] p-8 md:p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] -mr-64 -mt-64 transition-all group-hover:bg-accent-primary/10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-emerald/5 blur-[100px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 md:p-4 rounded-2xl bg-accent-primary/10 text-accent-primary shadow-inner">
                <FileSearch className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary italic">
                   Prescription <span className="bg-gradient-to-r from-accent-primary to-accent-indigo bg-clip-text text-transparent">Decoder</span>
                 </h1>
                 <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-vital-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Clinical OCR Processing Active</span>
                 </div>
              </div>
            </div>
            <p className="text-text-secondary font-bold max-w-xl text-base md:text-xl leading-relaxed italic">
              Clinical-grade OCR and pharmacological simplification. CareCompass AI interprets handwritten data into patient-centric instructions.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
             <div className="px-8 py-5 rounded-[2rem] bg-surface-container-high/40 border border-ghost-border backdrop-blur-xl group/id flex items-center gap-5">
                <BrainCircuit className="text-accent-indigo transition-transform group-hover/id:rotate-12" size={32} />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-indigo leading-none mb-2 italic">Neural Sync</span>
                   <span className="text-lg md:text-2xl font-black italic tracking-tighter">OCR ACTIVE</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* 📋 Digital Intake (Input Side) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card-biometric p-8 md:p-10">
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary">
                    <UploadCloud size={24} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter italic">Clinical Intake</h2>
                </div>
                <div className="chip-vital">
                   <div className="w-2 h-2 rounded-full bg-accent-primary animate-vital-pulse" />
                   Secure Sync
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 italic">Ingest Document</label>
                  <div className="relative group/upload border-2 border-dashed border-accent-primary/20 hover:border-accent-primary/40 rounded-[2.5rem] p-8 md:p-12 text-center bg-accent-primary/[0.02] hover:bg-accent-primary/[0.05] transition-all cursor-pointer overflow-hidden shadow-inner">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="relative z-10 space-y-4">
                       <div className="w-16 h-16 mx-auto rounded-3xl bg-white/50 dark:bg-white/5 border border-ghost-border flex items-center justify-center text-accent-primary transition-transform group-hover/upload:scale-110 shadow-lg">
                          <UploadCloud size={32} />
                       </div>
                       <div className="font-black text-sm uppercase tracking-[0.3em] italic">Ingest Scan</div>
                       <p className="text-[9px] font-bold text-text-muted italic uppercase tracking-widest opacity-60">PDF | JPEG | HEIC</p>
                    </div>
                  </div>
                  {fileLoading && (
                    <div className="mt-6 p-5 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center gap-4 animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-accent-primary animate-vital-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-primary italic">Deciphering Tokens...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 italic">Raw Clinical Data</label>
                  <textarea
                    rows={typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 10}
                    className="input-void min-h-[150px] italic leading-relaxed text-sm"
                    placeholder="Extracted technical text will appear here..."
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                  />
                </div>

                <button
                  onClick={simplifyPrescription}
                  disabled={loading || !prescriptionText}
                  className="btn-gem w-full py-6 text-xl shadow-2xl shadow-accent-primary/20 disabled:opacity-50"
                  style={{
                     padding: '1.5rem',
                     fontSize: '1.25rem'
                  }}
                >
                  <span className="flex items-center justify-center gap-3 italic">
                    {loading ? "DECODING CORE..." : "SIMPLIFY PROTOCOL"} <ChevronRight size={20} strokeWidth={3} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🧠 Deciphered Matrix (Output Side) */}
        <div className="lg:col-span-2 space-y-10">
          {!result ? (
            <div className="relative group overflow-hidden rounded-[3rem] border border-ghost-border bg-surface-container-low/30 backdrop-blur-[80px] p-12 md:p-24 flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[500px] transition-all hover:bg-surface-container-low/40">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.02] via-transparent to-accent-emerald/[0.02] pointer-events-none" />
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-surface-container-high/50 border border-ghost-border flex items-center justify-center text-text-muted/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
                 <Stethoscope className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1} />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-text-muted/60 italic">Awaiting Regimen Synthesis</h3>
                <p className="text-[10px] md:text-xs font-bold text-text-muted/50 max-w-sm uppercase tracking-[0.4em] leading-loose italic">
                  Upload a prescription to generate a simplified medical translation matrix.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative animate-in slide-in-from-right-12 duration-700 bg-surface-container-low/60 backdrop-blur-[100px] border border-accent-primary/20 rounded-[3rem] p-8 md:p-14 shadow-3xl overflow-hidden group/result">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover/result:opacity-[0.07] transition-opacity duration-1000 rotate-12">
                 <ShieldCheck size={typeof window !== 'undefined' && window.innerWidth < 768 ? 150 : 250} />
              </div>
              
              <div className="relative z-10 space-y-10 md:space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10 border-b border-ghost-border pb-10">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent-emerald/10 text-accent-emerald flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]"><CheckCircle2 className="w-6 h-6" /></div>
                         <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic">Deciphered Matrix</h2>
                      </div>
                      <div className="chip-vital bg-accent-emerald/5 text-accent-emerald border-accent-emerald/20">
                         <Activity size={12} /> CareCompass Synthesis Active
                      </div>
                   </div>
                   <button
                     onClick={() => exportMedicalPDF("Simplified Prescription", prescriptionText, result)}
                     className="btn-gem px-8 py-5 text-text-primary bg-surface-container-high hover:bg-surface-container-high/80 transition-all shadow-xl flex items-center justify-center gap-3 border border-ghost-border grayscale-[0.5] hover:grayscale-0"
                   >
                     <Download size={20} /> <span className="text-xs uppercase tracking-[0.2em] italic">Export Record</span>
                   </button>
                </div>

                <div className="p-8 rounded-[2rem] bg-accent-amber/5 border border-accent-amber/10 flex gap-5 items-start shadow-inner">
                   <AlertCircle className="text-accent-amber flex-shrink-0 mt-1" size={24} />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-accent-amber uppercase tracking-[0.4em] mb-2 italic">Clinical Security Protocol</p>
                      <p className="text-sm font-bold text-text-secondary leading-relaxed italic">
                        This synthesis is for informational continuity only. Always prioritize verified physician commands over AI pharmacological translations.
                      </p>
                   </div>
                </div>

                <div className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:text-text-primary prose-p:font-bold prose-p:text-text-secondary prose-strong:text-accent-primary prose-li:marker:text-accent-indigo max-w-none text-base leading-relaxed italic">
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
        <div className="space-y-12">
          <div className="flex items-center gap-6 px-4">
             <div className="p-3 rounded-2xl bg-surface-container-low border border-ghost-border text-text-muted">
                <History className="w-6 h-6" />
             </div>
             <div className="flex items-center gap-4 w-full">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic shrink-0">Historical Registry</h2>
                <div className="h-[2px] w-full bg-gradient-to-r from-ghost-border via-ghost-border to-transparent" />
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className={`card-biometric group transition-all duration-700 p-8 md:p-10 ${isExpanded ? "md:col-span-2 lg:col-span-3 border-accent-primary/20" : "hover:border-accent-primary/10"}`}>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                       <div className="chip-vital">
                          <Clock size={12} /> {item.createdAt?.toDate?.().toLocaleDateString()}
                       </div>
                       <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl bg-accent-rose/5 text-accent-rose border border-accent-rose/10 hover:bg-accent-rose hover:text-white transition-all flex items-center justify-center">
                          <Trash2 size={18} />
                       </button>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xl font-black tracking-tighter flex items-center gap-4 italic">
                          <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary"><FileText size={20} /></div>
                          Protocol Analysis
                       </h4>
                       <p className={`text-sm font-bold text-text-muted italic leading-relaxed bg-surface-base/50 p-4 rounded-xl border border-ghost-border truncate ${isExpanded ? "" : "truncate"}`}>
                         "{item.originalText}"
                       </p>
                    </div>

                    {isExpanded && (
                       <div className="pt-10 border-t border-ghost-border animate-in fade-in slide-in-from-top-6">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-2 h-2 rounded-full bg-accent-indigo animate-vital-pulse" />
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-indigo italic">Decoded Transformation Matrix</p>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary font-bold leading-relaxed italic">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.aiResponse}</ReactMarkdown>
                          </div>
                       </div>
                    )}

                    <div className="flex gap-4 pt-4">
                       <button
                         onClick={() => setExpandedId(isExpanded ? null : item.id)}
                         className="flex-1 py-4 rounded-2xl bg-surface-container-high border border-ghost-border text-text-primary font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-surface-container-high/80 transition-all italic"
                       >
                         {isExpanded ? <><Minimize2 size={14} /> Collapse</> : <><Maximize2 size={14} /> Expand Detail</>}
                       </button>
                       {!isExpanded && (
                          <button
                            onClick={() => {
                              setPrescriptionText(item.originalText);
                              setResult(item.aiResponse);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-14 h-14 rounded-2xl bg-accent-primary text-white hover:scale-110 transition-all shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.3)] flex items-center justify-center"
                          >
                             <ChevronRight size={24} strokeWidth={3} />
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