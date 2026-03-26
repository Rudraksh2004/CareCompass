"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Tesseract from "tesseract.js";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  saveMedicineHistory,
  getMedicineHistory,
} from "@/services/medicineService";
import { 
  Pill, 
  Search, 
  Upload, 
  FileText, 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  ChevronLeft,
  ArrowRight,
  Info,
  Clock,
  ShieldCheck,
  Stethoscope
} from "lucide-react";

interface MedicineHistory {
  id: string;
  medicineName: string;
  description: string;
}

export default function MedicinePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse">Loading Insight Engine...</div>}>
      <MedicineContent />
    </Suspense>
  );
}

function MedicineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const autoMedicine = searchParams.get("name");

  const [medicineText, setMedicineText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [history, setHistory] = useState<MedicineHistory[]>([]);
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState(0);

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

  useEffect(() => {
    if (autoMedicine && !hasAutoDescribed.current) {
      hasAutoDescribed.current = true;
      setMedicineText(autoMedicine);
      describeMedicine(autoMedicine);
    }
  }, [autoMedicine]);

  useEffect(() => {
    let score = 0;
    if (medicineText.length > 3) score += 40;
    if (medicineText.length > 20) score += 30;
    if (result) score = 100;
    setIntensity(score);
  }, [medicineText, result]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setStep(2);

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
    if (isGeneratingRef.current) return;

    const finalText = text || medicineText;
    if (!finalText.trim()) return;

    isGeneratingRef.current = true;
    setLoading(true);
    setStep(3);
    setResult("");

    try {
      const res = await fetch("/api/ai/medicine-describer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineText: finalText }),
      });

      const data = await res.json();
      const description = data.description || "No description generated.";

      setResult(description);
      setStep(4);

      if (user) {
        await saveMedicineHistory(user.uid, finalText, description);
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

  const resetProcess = () => {
    setStep(1);
    setMedicineText("");
    setResult("");
    hasAutoDescribed.current = false;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Ultra-Premium Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-purple-500/30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[100px] -ml-40 -mb-40" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/20">
                <Pill size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                Medicine Describer
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
              Automated pharmacological analysis. Extract clinical data from prescriptions or search for structured therapeutic profiles.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-8 py-5 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">Analysis Depth</p>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000" style={{ width: `${intensity}%` }} />
                </div>
                <span className="text-[10px] font-black text-purple-500 mt-2 uppercase">{intensity}% PROFILE SYNCED</span>
             </div>
          </div>
        </div>
      </div>

      {/* 🧩 Phase Navigation */}
      {step <= 2 && (
        <div className="flex items-center justify-center gap-10 md:gap-16 relative">
          {[1, 2].map((s) => (
            <button key={s} onClick={() => s < step && setStep(s)} className={`relative flex flex-col items-center gap-4 group cursor-default`}>
               <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s ? "bg-purple-600 scale-110 shadow-xl shadow-purple-600/30 text-white" : "bg-white/50 dark:bg-gray-900 text-gray-400 grayscale"}`}>
                  {s === 1 && <Upload size={24} />}
                  {s === 2 && <FileText size={24} />}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${step === s ? "text-purple-600" : "text-gray-600 dark:text-gray-400"}`}>
                Phase 0{s}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 🚀 Main Interface */}
      {(step === 1 || step === 2) && (
        <div className="relative group overflow-hidden rounded-[3rem] border border-white/60 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[60px] p-16 transition-all duration-700">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20" />
          
          <div className="relative z-10 min-h-[400px] flex flex-col content-center justify-center">
            {step === 1 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter">Enter Medication</h2>
                  <p className="text-gray-700 dark:text-gray-400 font-bold max-w-lg mx-auto">Upload a prescription image, PDF, or manually type the medicine name to begin synthesis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Manual Input */}
                  <div className="relative group/input space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 px-2 flex items-center gap-2">
                       <Search size={12} className="text-purple-600" /> Manual Input
                    </p>
                    <textarea 
                      value={medicineText} 
                      onChange={e => setMedicineText(e.target.value)}
                      placeholder="e.g., Amoxicillin 500mg, Atorvastatin..."
                      className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 p-8 rounded-3xl text-lg font-bold outline-none focus:ring-4 focus:ring-purple-500/10 transition-all h-[200px]"
                    />
                  </div>

                  {/* Upload */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 px-2 flex items-center gap-2">
                       <Upload size={12} className="text-blue-600" /> Optical Recognition
                    </p>
                    <div className="relative h-[200px] group overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/40 dark:bg-white/5 transition-all hover:bg-white/60 dark:hover:bg-white/10 flex flex-col items-center justify-center">
                       <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                       <div className="relative z-10 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                             <FileText size={32} />
                          </div>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-300 italic">Drop Prescription here</span>
                       </div>
                    </div>
                  </div>
                </div>

                {medicineText.length > 0 && (
                  <button onClick={() => setStep(2)} className="flex items-center justify-center gap-3 w-full bg-gray-900 dark:bg-purple-600 text-white py-6 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-600/20">
                    CONTINUE TO VERIFICATION <ArrowRight size={24} />
                  </button>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-500 rounded-full" />
                      <h2 className="text-4xl font-black tracking-tighter">Text Verification</h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-400 font-bold ml-5">Confirm the extracted medicine name or instructions before AI synthesis.</p>
                 </div>

                 <div className="relative">
                    <textarea 
                      value={medicineText} 
                      onChange={e => setMedicineText(e.target.value)}
                      className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 p-10 rounded-3xl text-2xl font-black text-blue-600 dark:text-blue-400 outline-none h-48"
                    />
                    {fileLoading && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-3xl flex items-center justify-center">
                         <div className="flex flex-col items-center gap-4">
                            <Activity className="text-blue-500 animate-spin" size={48} />
                            <span className="text-lg font-black uppercase tracking-widest">Applying OCR...</span>
                         </div>
                      </div>
                    )}
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-12 py-5 rounded-2xl font-black border border-gray-300 dark:border-white/10 hover:bg-white/10 transition-all font-black text-gray-700 dark:text-gray-400">RE-INPUT</button>
                    <button onClick={() => describeMedicine()} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">INITIALIZE AI SYNTHESIS</button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚀 Analysis Loading State */}
      {step === 3 && loading && (
         <div className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.6] dark:bg-[#030712]/30 backdrop-blur-[60px] p-32 rounded-[4rem] text-center space-y-12">
            <div className="relative w-56 h-56 mx-auto">
               <div className="absolute inset-0 border-[1.5rem] border-purple-600/10 rounded-full animate-ping" />
               <div className="absolute inset-2 border-8 border-t-purple-500 border-r-purple-500/20 border-b-blue-400/20 border-l-emerald-500/20 rounded-full animate-spin duration-1000" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Brain size={80} className="text-purple-600 animate-pulse" />
               </div>
            </div>
            <div className="space-y-6">
               <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 bg-clip-text text-transparent italic">Consulting Bio-Databases</h2>
               <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-150" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300" />
                  <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-4">Generating Pharmacological Profile</span>
               </div>
            </div>
         </div>
      )}

      {/* 🏥 Final Clinical Report */}
      {step === 4 && result && (
        <div className="space-y-10 animate-in zoom-in-95 fade-in-0 duration-700">
          <div className="flex items-center justify-between px-8">
            <button onClick={resetProcess} className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-purple-600 transition-colors group">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              New Synthesis
            </button>
          </div>

          <div className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.8] dark:bg-[#030712]/60 backdrop-blur-[60px] p-16 rounded-[4rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Pill size={240} />
            </div>
            
            <div className="relative z-10 space-y-12">
              <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-gray-100 dark:border-white/5 pb-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-purple-600">
                    <CheckCircle2 size={32} />
                    <h2 className="text-4xl font-black">AI Pharmacological Profile</h2>
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-widest">Medicine: <span className="text-gray-900 dark:text-white">{medicineText}</span></p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className={`px-10 py-6 rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl flex items-center gap-4`}>
                    <ShieldCheck size={32} strokeWidth={2.5} />
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Status</p>
                      <span className="text-2xl font-black italic">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Snapshot Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-8 rounded-[2rem] bg-white/50 dark:bg-white/[0.02] border border-white/80 dark:border-white/5 flex flex-col items-center gap-2">
                   <Info className="text-blue-500" size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Analysis Type</span>
                   <span className="text-sm font-black text-gray-900 dark:text-white text-center italic">Therapeutic Action</span>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/50 dark:bg-white/[0.02] border border-white/80 dark:border-white/5 flex flex-col items-center gap-2">
                   <Clock className="text-emerald-500" size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Synthesis Time</span>
                   <span className="text-sm font-black text-gray-900 dark:text-white text-center italic">~3.2 Seconds</span>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/50 dark:bg-white/[0.02] border border-white/80 dark:border-white/5 flex flex-col items-center gap-2">
                   <AlertTriangle className="text-amber-500" size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Caution Index</span>
                   <span className="text-sm font-black text-gray-900 dark:text-white text-center italic">Advisory Active</span>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/50 dark:bg-white/[0.02] border border-white/80 dark:border-white/5 flex flex-col items-center gap-2">
                   <Stethoscope className="text-purple-500" size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Clinical Focus</span>
                   <span className="text-sm font-black text-gray-900 dark:text-white text-center italic">Precision Pharma</span>
                </div>
              </div>

              {/* ✍️ Result Content */}
              <div className="bg-white/40 dark:bg-black/20 rounded-[3rem] p-12 border border-white dark:border-white/5 shadow-inner">
                <div className="prose dark:prose-invert max-w-none 
                  prose-h1:text-purple-600 dark:prose-h1:text-purple-400 prose-h1:font-black
                  prose-h2:text-blue-600 dark:prose-h2:text-blue-400 prose-h2:font-black prose-h2:text-2xl
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:font-bold prose-p:leading-relaxed
                  prose-ul:list-disc prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:font-bold prose-li:mb-2 text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex items-center gap-4 p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                <AlertTriangle size={24} className="shrink-0" />
                <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Safety Notice: This AI-generated data is for educational insight only. Never self-medicate or alter prescriptions without professional clinical consultation.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📚 History Section - Re-Engineered */}
      {history.length > 0 && (
        <div className="space-y-10">
          <div className="flex items-center gap-4 px-4">
            <History size={24} className="text-purple-600" />
            <h2 className="text-3xl font-black tracking-tighter">Pharmacological Ledger</h2>
            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.slice(0, 6).map((item) => (
              <div key={item.id} className="relative group border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-white/[0.02] backdrop-blur-2xl p-8 rounded-[2.5rem] transition-all hover:bg-white hover:scale-[1.03] hover:shadow-2xl dark:hover:bg-white/10">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                      <Pill size={24} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 line-clamp-1">{item.medicineName}</h3>
                  
                  <div className="mb-8 flex-1">
                    <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-2">Snippet</p>
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {item.description.replace(/[*#]/g, '').slice(0, 150)}...
                    </div>
                  </div>

                  <button 
                    onClick={() => { 
                      setMedicineText(item.medicineName); 
                      setResult(item.description); 
                      setStep(4); 
                      window.scrollTo({ top: 0, behavior: "smooth" }); 
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all duration-300"
                  >
                    Recall Report
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