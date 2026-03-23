"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/context/AuthContext";
import { 
  Activity, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Microscope, 
  Download, 
  ArrowRight, 
  Stethoscope, 
  ChevronLeft,
  Search,
  History,
  Trash2,
  FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import {
  saveDiseaseHistory,
  getDiseaseHistory,
  deleteDiseaseHistory,
  DiseaseHistory,
} from "@/services/diseaseService";

const SYMPTOM_CHIPS = [
  "Fever", "Cough", "Headache", "Fatigue", "Sore Throat", 
  "Body Pain", "Nausea", "Vomiting", "Diarrhea", 
  "Dizziness", "Chest Pain", "Shortness of Breath"
];

const INDIAN_CITIES = [
  "Kolkata", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", 
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Bhopal", "Patna", 
  "Chandigarh", "Bhubaneswar", "Guwahati", "Kochi", "Indore", 
  "Nagpur", "Surat", "Visakhapatnam"
];

export default function DiseasePredictorPage() {
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  
  // States
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState("");
  const [location, setLocation] = useState("");
  const [allergy, setAllergy] = useState("");
  const [pastSurgery, setPastSurgery] = useState("");
  const [chronicIllness, setChronicIllness] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Moderate" | "High" | "">("");
  const [history, setHistory] = useState<DiseaseHistory[]>([]);
  const [expandedPrediction, setExpandedPrediction] = useState<DiseaseHistory | null>(null);
  const [step, setStep] = useState(1);
  const [isWorsening, setIsWorsening] = useState("No Change");
  const [duration, setDuration] = useState("1-2 days");
  const [medications, setMedications] = useState("");
  const [useManualLocation, setUseManualLocation] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      const data = await getDiseaseHistory(user.uid);
      setHistory(data);
    };
    loadHistory();
  }, [user]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]);
  };

  const handlePredict = async () => {
    if (!user) return;
    setLoading(true);
    setResult("");
    setSeverity("");
    setStep(4);

    try {
      const res = await fetch("/api/ai/disease-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          qa: {
            allergies: !!allergy,
            surgeries: !!pastSurgery,
            chronicConditions: chronicIllness ? [chronicIllness] : [],
            duration,
            isWorsening,
            medications,
          },
        }),
      });

      const data = await res.json();
      const predictionText = data?.prediction || "Internal Error.";
      const severityLevel = data?.severity || "Low";

      setResult(predictionText);
      setSeverity(severityLevel);

      await saveDiseaseHistory(user.uid, {
        symptoms: selectedSymptoms,
        customText: customSymptoms,
        location,
        qa: { allergies: !!allergy, surgeries: !!pastSurgery, chronicConditions: chronicIllness ? [chronicIllness] : [] },
        severity: severityLevel,
        prediction: predictionText,
      });

      const updatedHistory = await getDiseaseHistory(user.uid);
      setHistory(updatedHistory);
    } catch (error) {
      console.error(error);
      setResult("Engine Error. Please try later.");
    }
    setLoading(false);
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, quality: 1 });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (reportRef.current.offsetHeight * imgWidth) / reportRef.current.offsetWidth;
      pdf.addImage(dataUrl, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`CareCompass_Health_Analysis_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("PDF Fail", err);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Visual Helper for Risk Level
  const getRiskColor = (level: string) => {
    if (level === "High") return "from-red-600 to-rose-600 shadow-red-500/20";
    if (level === "Moderate") return "from-amber-600 to-orange-600 shadow-amber-500/20";
    return "from-emerald-600 to-teal-600 shadow-emerald-500/20";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Ultra-Premium Dashboard Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-500/20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[100px] -ml-40 -mb-40" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                <Microscope size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                AI Disease Predictor
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
              CareCompass premium clinical intelligence. Multi-vector diagnostic synthesis based on symptomatology, history, and environmental triggers.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="px-6 py-4 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">AI Core Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 Multi-Step Navigation Flow */}
      {step < 4 && (
        <div className="flex items-center justify-between px-16 relative">
          <div className="absolute inset-x-24 top-1/2 -translate-y-1/2 h-[2px] bg-gray-200 dark:bg-gray-800 pointer-events-none" />
          {[1, 2, 3].map((s) => (
            <button key={s} onClick={() => s < step && setStep(s)} className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/40" : "bg-white dark:bg-gray-900 text-gray-400"}`}>
              <span className="text-xl font-black">{s}</span>
              <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-colors ${step === s ? "text-indigo-600" : "text-gray-500"}`}>
                {s === 1 ? "Symptoms" : s === 2 ? "Context" : "Review"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 🚀 Wizard Interface */}
      {step < 4 && (
        <div className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.5] dark:bg-[#030712]/40 backdrop-blur-[60px] p-12 rounded-[2.5rem] shadow-2xl transition-all duration-700 h-full min-h-[500px] flex flex-col">
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Diagnostics Phase 01</span>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                    Clinical Symptoms
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {SYMPTOM_CHIPS.map(s => {
                    const active = selectedSymptoms.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSymptom(s)} className={`group relative p-4 rounded-2xl border text-sm font-black transition-all duration-300 flex items-center justify-center gap-3 ${active ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-white/40 dark:bg-white/[0.03] border-white/80 dark:border-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-white/60 hover:-translate-y-1"}`}>
                         {active ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-400/30 group-hover:border-indigo-500/50" />}
                         {s}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-300">
                    <History size={18} className="text-indigo-600" />
                    <span>Deep Description (Temporal/Spatial Context)</span>
                  </div>
                  <textarea rows={5} value={customSymptoms} onChange={e => setCustomSymptoms(e.target.value)} placeholder="Elaborate on the onset, sensation, and any aggravating factors..." className="w-full border border-white/80 dark:border-white/[0.05] bg-white/40 dark:bg-black/40 backdrop-blur-md px-8 py-6 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition text-base font-bold text-gray-800 dark:text-gray-200" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Diagnostics Phase 02</span>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white">Health History</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm font-black text-gray-700 dark:text-gray-300">
                        <Clock size={16} className="text-indigo-500" />
                        <span>Symptom Duration</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {["< 24h", "1-2 days", "3-7 days", "7+ days"].map(d => (
                           <button key={d} onClick={() => setDuration(d)} className={`py-4 rounded-2xl text-xs font-black transition-all border ${duration === d ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/40 dark:bg-white/[0.03] border-white/80 dark:border-white/[0.05]"}`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm font-black text-gray-700 dark:text-gray-300">
                        <Activity size={16} className="text-red-500" />
                        <span>Progression Intensity</span>
                      </div>
                      <div className="flex gap-4">
                        {["No Change", "Slightly Waging", "Severely Worsening"].map(opt => (
                          <button key={opt} onClick={() => setIsWorsening(opt)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black transition-all border ${isWorsening === opt ? "bg-red-600 border-red-500 text-white" : "bg-white/40 dark:bg-white/[0.03] border-white/80 dark:border-white/[0.05]"}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm font-black text-gray-700 dark:text-gray-300">Current Pharmacological Regimen</p>
                      <textarea rows={4} value={medications} onChange={e => setMedications(e.target.value)} placeholder="List any drugs, vitamins, or supplements currently being consumed..." className="w-full border border-white/80 dark:border-white/[0.05] bg-white/40 dark:bg-black/40 px-6 py-4 rounded-2xl text-sm font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input value={allergy} onChange={e => setAllergy(e.target.value)} placeholder="Known Allergies" className="bg-white/30 dark:bg-white/[0.02] border p-4 rounded-2xl text-sm font-black" />
                      <input value={chronicIllness} onChange={e => setChronicIllness(e.target.value)} placeholder="Chronic Conditions" className="bg-white/30 dark:bg-white/[0.02] border p-4 rounded-2xl text-sm font-black" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Diagnostics Phase 03</span>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white">Review & Synthesis</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-600/10 space-y-6">
                    <h3 className="text-lg font-black text-indigo-600">Contextual Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-indigo-600/10 pb-2">
                        <span className="text-xs font-bold text-gray-500">Core Symptoms</span>
                        <span className="text-xs font-black">{selectedSymptoms.length} Selected</span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-600/10 pb-2">
                        <span className="text-xs font-bold text-gray-500">Duration</span>
                        <span className="text-xs font-black">{duration}</span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-600/10 pb-2">
                        <span className="text-xs font-bold text-gray-500">Worsening</span>
                        <span className="text-xs font-black">{isWorsening}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-emerald-600/5 border border-emerald-600/10 space-y-6">
                    <h3 className="text-lg font-black text-emerald-600">Location Calibration</h3>
                    <div className="relative group">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600" size={24} />
                      
                      {!useManualLocation ? (
                        <div className="space-y-4">
                          <select 
                            value={location} 
                            onChange={(e) => {
                              if (e.target.value === "manual") {
                                setUseManualLocation(true);
                                setLocation("");
                              } else {
                                setLocation(e.target.value);
                              }
                            }}
                            className="w-full pl-16 pr-10 border border-white dark:border-white/5 bg-white/60 dark:bg-black/40 py-5 rounded-3xl text-base font-black outline-none focus:ring-4 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                          >
                            <option value="">Select current city...</option>
                            {INDIAN_CITIES.map(city => (
                              <option key={city} value={`${city}, India`}>{city}</option>
                            ))}
                            <option value="manual">✎ Other (Type Manually)</option>
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 opacity-40">▼</div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            placeholder="Enter your location manually..." 
                            className="w-full pl-16 pr-6 border border-white dark:border-white/5 bg-white/60 dark:bg-black/40 py-5 rounded-3xl text-base font-black outline-none focus:ring-4 focus:ring-emerald-500/20" 
                          />
                          <button 
                            onClick={() => setUseManualLocation(false)}
                            className="absolute -bottom-8 right-2 text-[10px] font-black text-emerald-600 uppercase hover:underline"
                          >
                             ↩ Back to List
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600/60 text-center uppercase tracking-widest leading-loose">
                      AI factors in regional viral outbreaks and environmental indices.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex gap-6">
            {step > 1 && (
              <button onClick={prevStep} className="px-10 py-5 rounded-3xl font-black border border-indigo-600/20 text-indigo-600 transition-all hover:bg-indigo-600/5 flex items-center gap-3 group">
                <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                Return
              </button>
            )}
            {step < 3 ? (
              <button onClick={nextStep} className="flex-1 bg-gray-900 dark:bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group">
                Next Diagnostic Stage
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button onClick={handlePredict} className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 text-white py-5 rounded-3xl font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-xl">
                Run Multi-Vector Analysis
                <Activity size={24} className="animate-pulse" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🧬 AI Analysis Engine State */}
      {step === 4 && loading && (
        <div className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[60px] p-24 rounded-[3rem] text-center space-y-12">
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 rounded-full border-8 border-indigo-600/10" />
            <div className="absolute inset-0 rounded-full border-8 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-8 rounded-full border-[10px] border-emerald-500/10 blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity size={64} className="text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-5xl font-black bg-gradient-to-b from-gray-900 to-gray-400 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">Synthesizing Data</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Bio-Log</span>
              <span className="px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-pulse delay-100">Regional Syncing</span>
              <span className="px-5 py-2 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-widest animate-pulse delay-200">Probability Mapping</span>
            </div>
          </div>
        </div>
      )}

      {/* 🏥 Final Clinical Report */}
      {step === 4 && !loading && result && (
        <div className="space-y-10 animate-in zoom-in-95 fade-in-0 duration-700">
          <div className="flex items-center justify-between px-8">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-indigo-600 transition-colors group">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              New Analysis
            </button>
            <button onClick={downloadReport} className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20">
              <Download size={18} />
              Export Clinical PDF
            </button>
          </div>

          <div ref={reportRef} className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.8] dark:bg-[#030712]/60 backdrop-blur-[60px] p-16 rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Stethoscope size={240} />
            </div>
            
            <div className="relative z-10 space-y-12">
              <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-gray-100 dark:border-white/5 pb-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <CheckCircle2 size={32} />
                    <h2 className="text-4xl font-black">AI Assessment</h2>
                  </div>
                  <p className="text-sm font-bold text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                </div>

                <div className="flex gap-4">
                  <div className={`px-8 py-4 rounded-[1.5rem] bg-gradient-to-br ${getRiskColor(severity)} text-white shadow-2xl`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Severity Calibration</p>
                    <span className="text-2xl font-black">{severity} Priority</span>
                  </div>
                </div>
              </div>

              {/* 📊 Clinical Context Snapshot */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Location</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200">{location || "Not Provided"}</p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Duration</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200">{duration}</p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Progression</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200">{isWorsening}</p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">History</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200">{allergy || chronicIllness ? "Active Complex" : "Nominal"}</p>
                </div>
              </div>

              {/* ✍️ Detailed Result Body */}
              <div className="bg-white/40 dark:bg-black/20 rounded-[2rem] p-10 border border-white dark:border-white/5 shadow-inner">
                <div className="prose dark:prose-invert max-w-none 
                  prose-h1:text-indigo-600 dark:prose-h1:text-indigo-400 prose-h1:font-black
                  prose-h2:text-indigo-600 dark:prose-h2:text-indigo-400 prose-h2:font-black prose-h2:text-2xl
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:font-bold prose-p:leading-relaxed
                  prose-ul:list-disc prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:font-bold prose-li:mb-2 text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                <AlertTriangle size={20} />
                <p className="text-xs font-black uppercase tracking-wide">Legal: This document contains AI-generated non-diagnostic guidance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📚 Re-Engineered Prediction History */}
      {history.length > 0 && (
        <div className="space-y-10">
          <div className="flex items-center gap-4 px-4">
            <History size={24} className="text-indigo-600" />
            <h2 className="text-3xl font-black">Diagnostic Ledger</h2>
            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.slice(0, 6).map((item) => (
              <div key={item.id} className="relative group border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-white/[0.02] backdrop-blur-2xl p-8 rounded-[2rem] transition-all hover:bg-white hover:scale-[1.03] hover:shadow-xl dark:hover:bg-white/10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${item.severity === "High" ? "bg-red-500/10 text-red-600" : item.severity === "Moderate" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                    <Activity size={20} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.severity === "High" ? "text-red-500" : item.severity === "Moderate" ? "text-amber-500" : "text-emerald-500"}`}>
                    {item.severity} Risk
                  </span>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1">
                    {item.symptoms?.join(", ") || "Case Study"}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    <MapPin size={10} />
                    {item.location || "Undisclosed Global"}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={() => { 
                    setResult(item.prediction); 
                    setSeverity(item.severity || ""); 
                    setStep(4); 
                    window.scrollTo({ top: 0, behavior: "smooth" }); 
                  }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                    <Search size={14} />
                    Recall
                  </button>
                  <button onClick={async () => {
                    if (!user) return;
                    await deleteDiseaseHistory(user.uid, item.id);
                    setHistory(await getDiseaseHistory(user.uid));
                  }} className="p-3 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔮 Extended Analysis Overlay */}
      {expandedPrediction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 isolate">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl transition-all" onClick={() => setExpandedPrediction(null)} />
          <div className="relative bg-white/95 dark:bg-[#030712]/95 backdrop-blur-[60px] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-16 shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 border border-white/20">
            <button onClick={() => setExpandedPrediction(null)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
              <ChevronLeft size={24} />
            </button>
            
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                    <FileText size={40} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black">Archive Report</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{expandedPrediction.id.slice(0, 8)}</p>
                 </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none text-lg font-bold leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{expandedPrediction.prediction}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
