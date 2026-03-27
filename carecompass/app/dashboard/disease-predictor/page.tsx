"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
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
import { User as UserIcon } from "lucide-react";

const SYMPTOM_CHIPS = [
  "Fever", "Cough", "Headache", "Fatigue", "Sore Throat", 
  "Body Pain", "Nausea", "Vomiting", "Diarrhea", 
  "Dizziness", "Chest Pain", "Shortness of Breath",
  "Rash", "Joint Pain", "Chills", "Nasal Congestion",
  "Loss of Taste", "Abdominal Pain", "Muscle Weakness"
];

const INDIAN_CITIES = [
  "Kolkata", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", 
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Bhopal", "Patna", 
  "Chandigarh", "Bhubaneswar", "Guwahati", "Kochi", "Indore", 
  "Nagpur", "Surat", "Visakhapatnam"
];

export default function DiseasePredictorPage() {
  const { user } = useAuth();
  const router = useRouter();
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
  const [intensity, setIntensity] = useState(0);

  // Biometric States
  const [temperature, setTemperature] = useState("98.6");
  const [heartRate, setHeartRate] = useState("72");
  const [systolicBP, setSystolicBP] = useState("120");
  const [diastolicBP, setDiastolicBP] = useState("80");
  const [spo2, setSpo2] = useState("98");
  const [sleepLevel, setSleepLevel] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [recentTravel, setRecentTravel] = useState("");

  useEffect(() => {
    let score = 0;
    if (selectedSymptoms.length > 0) score += 20;
    if (customSymptoms.length > 20) score += 20;
    if (location) score += 20;
    if (allergy || medications || chronicIllness) score += 20;
    if (temperature !== "98.6" || heartRate !== "72" || spo2 !== "98") score += 20;
    setIntensity(score);
  }, [selectedSymptoms, customSymptoms, location, allergy, medications, chronicIllness, temperature, heartRate, spo2]);

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
    setStep(5);

    try {
      const res = await fetch("/api/ai/disease-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          biometrics: {
            temperature,
            heartRate,
            bloodPressure: `${systolicBP}/${diastolicBP}`,
            spo2,
            sleepLevel,
            stressLevel
          },
          qa: {
            allergies: !!allergy,
            surgeries: !!pastSurgery,
            chronicConditions: chronicIllness ? [chronicIllness] : [],
            duration,
            isWorsening,
            medications,
            recentTravel
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
        qa: { 
          allergies: !!allergy, 
          surgeries: !!pastSurgery, 
          chronicConditions: chronicIllness ? [chronicIllness] : [], 
          recentTravel,
          biometrics: { temperature, heartRate, spo2, bloodPressure: `${systolicBP}/${diastolicBP}`, sleepLevel, stressLevel } 
        },
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

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Visual Helper for Risk Level
  const getRiskColor = (level: string) => {
    if (level === "High") return "from-red-600 to-rose-600 shadow-red-500/20";
    if (level === "Moderate") return "from-amber-600 to-orange-600 shadow-amber-500/20";
    return "from-emerald-600 to-teal-600 shadow-emerald-500/20";
  };

  const getRecommendedSpecialist = (text: string) => {
    const match = text.match(/Recommended Specialist\*\*:\s*([^*>\n]+)/i);
    if (!match) return "General Physician";
    const parts = match[1].split("(");
    if (parts.length > 1) {
      return parts[1].replace(")", "").trim();
    }
    return parts[0].trim();
  };

  const getTopDoctorName = (text: string) => {
    const match = text.match(/Recommended Specialist\*\*:\s*([^*>\n]+)/i);
    if (!match) return "";
    const name = match[1].split("(")[0].trim();
    return name.toLowerCase().includes("consult") ? "" : name;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Ultra-Premium Dashboard Header */}
      <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-6 md:p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-500/30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[100px] -ml-40 -mb-40" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
                <Microscope className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent leading-none">
                AI Predictor
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-400 font-bold max-w-xl text-sm md:text-lg leading-relaxed">
              Synthesizing multi-vector diagnostic data including biometrics, temporal progression, and regional epidemiology.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-6 py-4 md:px-8 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md flex flex-row md:flex-col items-center gap-3 md:gap-0">
                <div className="flex flex-col md:items-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-none md:mb-2 text-center">Diagnostic Integrity</p>
                   <div className="hidden md:block w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000" style={{ width: `${intensity}%` }} />
                   </div>
                   <span className="text-[10px] font-black text-indigo-500 mt-2 uppercase leading-none">{intensity}% SYNCED</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 🧩 Phase Navigation (Enhanced) */}
      {step <= 4 && (
        <div className="flex overflow-x-auto md:overflow-visible items-center justify-start md:justify-center gap-6 md:gap-16 relative no-scrollbar px-4">
          {[1, 2, 3, 4].map((s) => (
            <button key={s} onClick={() => s < step && setStep(s)} className={`relative flex flex-col items-center gap-4 group flex-shrink-0`}>
               <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s ? "bg-indigo-600 scale-110 shadow-xl shadow-indigo-600/30 text-white" : "bg-white/50 dark:bg-gray-900 text-gray-400 grayscale"}`}>
                  {s === 1 && <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />}
                  {s === 2 && <Activity className="w-5 h-5 md:w-6 md:h-6" />}
                  {s === 3 && <History className="w-5 h-5 md:w-6 md:h-6" />}
                  {s === 4 && <MapPin className="w-5 h-5 md:w-6 md:h-6" />}
               </div>
               <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors ${step === s ? "text-indigo-600" : "text-gray-600 dark:text-gray-400"}`}>
                PHASE 0{s}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 🚀 Main Diagnostic Interface */}
      {step <= 4 && (
        <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/60 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[60px] p-6 md:p-16 transition-all duration-700">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20" />
          
          <div className="relative z-10 min-h-[450px] flex flex-col">
            {step === 1 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Symptom Cluster</h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-400 font-bold ml-4 md:ml-5 text-sm md:text-base leading-relaxed">Identify the primary physiological manifestations using the indicators below.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {SYMPTOM_CHIPS.map((s, idx) => {
                    const active = selectedSymptoms.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSymptom(s)} style={{ animationDelay: `${idx * 50}ms` }} className={`p-4 md:p-5 rounded-xl md:rounded-2xl border text-[9px] md:text-[10px] font-black transition-all duration-500 flex flex-col items-center gap-2 md:gap-3 group animate-in fade-in zoom-in ${active ? "bg-indigo-600 border-indigo-500 text-white scale-105 shadow-2xl shadow-indigo-500/20" : "bg-white/40 dark:bg-white/[0.02] border-white/80 dark:border-white/[0.05] text-gray-800 dark:text-gray-400 hover:bg-white/60"}`}>
                         <Activity className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 ${active ? "scale-125 rotate-12" : "group-hover:scale-110"}`} />
                         {s}
                      </button>
                    );
                  })}
                </div>

                <div className="relative group/box">
                   <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[1.5rem] md:rounded-[2rem] blur opacity-0 group-hover/box:opacity-100 transition duration-500" />
                   <textarea rows={5} value={customSymptoms} onChange={e => setCustomSymptoms(e.target.value)} placeholder="Provide qualitative data regarding onset, intensity shifts, and aggravating patterns..." className="relative w-full border border-white/80 dark:border-white/[0.05] bg-white/40 dark:bg-black/60 backdrop-blur-xl px-6 md:px-10 py-6 md:py-8 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-lg font-bold text-gray-800 dark:text-gray-200 outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all no-scrollbar" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-blue-500 rounded-full" />
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Biometric Pulse</h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-400 font-bold ml-4 md:ml-5 text-sm md:text-base">Calibrate vital clinical vectors for high-fidelity synthesis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <BiometricInput label="Body Temperature" value={temperature} setValue={setTemperature} icon={<Clock size={16} />} unit="°F" />
                  <BiometricInput label="Heart Rate" value={heartRate} setValue={setHeartRate} icon={<Activity size={16} />} unit="BPM" />
                  <BiometricInput label="Oxygen Saturation" value={spo2} setValue={setSpo2} icon={<AlertTriangle size={16} />} unit="SpO2 %" />
                  
                  <div className="md:col-span-1 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 px-2">Blood Pressure (Systolic/Diastolic)</p>
                    <div className="flex gap-2">
                       <input value={systolicBP} onChange={e => setSystolicBP(e.target.value)} placeholder="120" className="w-full bg-white/40 dark:bg-white/[0.02] border border-white/80 p-5 rounded-2xl text-center font-black" />
                       <span className="flex items-center text-gray-400 font-black">/</span>
                       <input value={diastolicBP} onChange={e => setDiastolicBP(e.target.value)} placeholder="80" className="w-full bg-white/40 dark:bg-white/[0.02] border border-white/80 p-5 rounded-2xl text-center font-black" />
                    </div>
                  </div>

                  <div className="md:col-span-1 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 px-2 flex justify-between">
                      <span>Sleep Quality</span>
                      <span className="text-indigo-500">{sleepLevel}/10</span>
                    </p>
                    <input type="range" min="1" max="10" value={sleepLevel} onChange={e => setSleepLevel(parseInt(e.target.value))} className="w-full h-2 bg-indigo-600/10 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>

                  <div className="md:col-span-1 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 px-2 flex justify-between">
                      <span>Stress Level</span>
                      <span className="text-red-500">{stressLevel}/10</span>
                    </p>
                    <input type="range" min="1" max="10" value={stressLevel} onChange={e => setStressLevel(parseInt(e.target.value))} className="w-full h-2 bg-red-600/10 rounded-lg appearance-none cursor-pointer accent-red-600" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-amber-500 rounded-full" />
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Clinical Artifacts</h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-400 font-bold ml-4 md:ml-5 text-sm md:text-base">Synthesize pre-existing medical history and temporal progression.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-16">
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                        <Clock size={12} className="text-indigo-600" /> Symptom Duration
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["< 24h", "1-2 days", "3-7 days", "7+ days"].map(d => (
                           <button key={d} onClick={() => setDuration(d)} className={`py-4 rounded-xl text-[10px] font-black transition-all border ${duration === d ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20" : "bg-white/40 dark:bg-white/[0.02] border-white/80"}`}>{d}</button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Diagnostic Pathway</p>
                      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        {["No Change", "Slightly Waging", "Severely Worsening"].map(opt => (
                          <button key={opt} onClick={() => setIsWorsening(opt)} className={`flex-1 py-4 md:py-5 rounded-xl text-[10px] font-black transition-all border ${isWorsening === opt ? "bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/20" : "bg-white/40 dark:bg-white/[0.02] border-white/80"}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <textarea value={medications} onChange={e => setMedications(e.target.value)} placeholder="Pharmacological Ledger..." className="md:col-span-2 bg-white/40 dark:bg-white/[0.02] border border-white/80 p-5 md:p-6 rounded-2xl text-xs md:text-sm font-bold h-32 no-scrollbar" />
                    <input value={allergy} onChange={e => setAllergy(e.target.value)} placeholder="Allergy Profile" className="bg-white/40 dark:bg-white/[0.02] border border-white/80 p-5 rounded-xl md:rounded-2xl text-[10px] font-black" />
                    <input value={chronicIllness} onChange={e => setChronicIllness(e.target.value)} placeholder="Chronic Conditions" className="bg-white/40 dark:bg-white/[0.02] border border-white/80 p-5 rounded-xl md:rounded-2xl text-[10px] font-black" />
                    <input value={recentTravel} onChange={e => setRecentTravel(e.target.value)} placeholder="Recent Global Travel" className="md:col-span-2 bg-white/40 dark:bg-white/[0.02] border border-white/80 p-5 rounded-xl md:rounded-2xl text-[10px] font-black" />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-emerald-500 rounded-full" />
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Epidemiological Sync</h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-400 font-bold ml-4 md:ml-5 text-sm md:text-base">Determine geographic influence on localized viral vectors.</p>
                </div>

                <div className="max-w-xl mx-auto w-full p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-emerald-600/5 border border-emerald-600/10 space-y-6 md:space-y-8 text-center">
                  <div className="relative group">
                    <MapPin className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
                    {!useManualLocation ? (
                      <select value={location} onChange={e => e.target.value === "manual" ? setUseManualLocation(true) : setLocation(e.target.value)} className="w-full pl-12 md:pl-16 pr-8 md:pr-10 border border-white dark:border-white/10 bg-white/80 dark:bg-black py-4 md:py-6 rounded-2xl md:rounded-3xl text-sm md:text-lg font-black appearance-none outline-none">
                        <option value="">Select Indian Bio-Region...</option>
                        {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="manual">✎ Manual Co-ordinates</option>
                      </select>
                    ) : (
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or Coordinates..." className="w-full pl-12 md:pl-16 pr-6 border border-white dark:border-white/10 bg-white/80 dark:bg-black py-4 md:py-6 rounded-2xl md:rounded-3xl text-sm md:text-lg font-black outline-none" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 justify-center text-emerald-700 dark:text-emerald-600/60 pb-2">
                     <AlertTriangle size={14} className="md:w-4 md:h-4" />
                     <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Regional epidemiology engine online</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-4 md:gap-6">
            {step > 1 && (
              <button onClick={prevStep} className="w-full md:px-12 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black border border-indigo-600/20 text-indigo-600 hover:bg-indigo-600/5 transition-all text-xs md:text-base">
                PREVIOUS PHASE
              </button>
            )}
            {step < 4 ? (
              <button onClick={nextStep} className="flex-1 bg-gray-900 dark:bg-indigo-600 text-white py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black shadow-2xl transition-all hover:scale-[1.02] text-xs md:text-base">
                PROCEED TO PHASE 0{step + 1} →
              </button>
            ) : (
              <button onClick={handlePredict} className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 text-base md:text-xl tracking-tighter uppercase">
                Initialize Synthesis
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🚀 AI Core Analysis (Premium Staging) */}
      {step === 5 && loading && (
         <div className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.6] dark:bg-[#030712]/30 backdrop-blur-[60px] p-10 md:p-32 rounded-[2.5rem] md:rounded-[4rem] text-center space-y-8 md:space-y-12">
            <div className="relative w-32 h-32 md:w-56 md:h-56 mx-auto">
               <div className="absolute inset-0 grayscale blur-3xl opacity-20">
                  <Microscope className="w-full h-full" strokeWidth={0.5} />
               </div>
               <div className="absolute inset-0 border-[0.8rem] md:border-[1.5rem] border-indigo-600/10 rounded-full animate-ping" />
               <div className="absolute inset-1 md:inset-2 border-4 md:border-8 border-t-indigo-500 border-r-indigo-500/20 border-b-emerald-400/20 border-l-purple-500/20 rounded-full animate-spin duration-1000" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-12 h-12 md:w-20 md:h-20 text-indigo-600 animate-pulse" />
               </div>
            </div>
            <div className="space-y-4 md:space-y-6">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">Synthesizing markers</h2>
               <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150" />
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-300" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest md:ml-4">Mapping Regional Viral Vectors</span>
               </div>
            </div>
         </div>
      )}

      {/* 🏥 Final Clinical Report */}
      {step === 5 && !loading && result && (
        <div className="space-y-8 md:space-y-10 animate-in zoom-in-95 fade-in-0 duration-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-8">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-indigo-600 transition-colors group">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              New Analysis
            </button>
            <button onClick={downloadReport} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20">
              <Download size={18} />
              Export Clinical PDF
            </button>
          </div>

          <div ref={reportRef} className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.8] dark:bg-[#030712]/60 backdrop-blur-[60px] p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 pointer-events-none">
              <Stethoscope className="w-40 h-40 md:w-60 md:h-60" />
            </div>
            
            <div className="relative z-10 space-y-8 md:space-y-12">
              <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8 border-b border-gray-100 dark:border-white/5 pb-8 md:pb-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <CheckCircle2 size={typeof window !== 'undefined' && window.innerWidth < 768 ? 24 : 32} />
                    <h2 className="text-2xl md:text-4xl font-black">AI Assessment</h2>
                  </div>
                  <p className="text-[10px] md:text-sm font-bold text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className={`px-6 py-4 md:px-8 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] bg-gradient-to-br ${getRiskColor(severity)} text-white shadow-2xl flex-1`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 leading-none">Severity Calibration</p>
                    <span className="text-xl md:text-2xl font-black">{severity} Priority</span>
                  </div>
                  
                  <div className="px-6 py-4 md:px-8 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] bg-indigo-500/5 dark:bg-white/5 border border-indigo-500/10 dark:border-white/[0.05] backdrop-blur-md flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1 leading-none">Specialist Lead</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <UserIcon size={16} className="text-emerald-500" />
                        <span className="text-sm md:text-lg font-black text-gray-900 dark:text-white uppercase truncate max-w-[150px] md:max-w-none">
                          {getTopDoctorName(result) || getRecommendedSpecialist(result)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const docName = getTopDoctorName(result);
                        const specName = getRecommendedSpecialist(result);
                        router.push(`/dashboard/chat?context=briefing&specialist=${encodeURIComponent(specName)}&doctor=${encodeURIComponent(docName)}`);
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
                    >
                      Briefing
                    </button>
                  </div>
                </div>
              </div>

              {/* 📊 Clinical Context Snapshot */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-1 md:mb-2 leading-none">Location</p>
                  <p className="text-[10px] md:text-sm font-black text-gray-800 dark:text-gray-200 truncate">{location || "Kolkata, IN"}</p>
                </div>
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-1 md:mb-2 leading-none">Duration</p>
                  <p className="text-[10px] md:text-sm font-black text-gray-800 dark:text-gray-200">{duration}</p>
                </div>
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-1 md:mb-2 leading-none">Progression</p>
                  <p className="text-[10px] md:text-sm font-black text-gray-800 dark:text-gray-200">{isWorsening}</p>
                </div>
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-1 md:mb-2 leading-none">History</p>
                  <p className="text-[10px] md:text-sm font-black text-gray-800 dark:text-gray-200">{allergy || chronicIllness ? "Active Complex" : "Nominal"}</p>
                </div>
              </div>

              {/* ✍️ Detailed Result Body */}
              <div className="bg-white/40 dark:bg-black/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white dark:border-white/5 shadow-inner">
                <div className="prose dark:prose-invert max-w-none 
                  prose-h1:text-indigo-600 dark:prose-h1:text-indigo-400 prose-h1:font-black prose-h1:text-xl md:prose-h1:text-3xl
                  prose-h2:text-indigo-600 dark:prose-h2:text-indigo-400 prose-h2:font-black prose-h2:text-lg md:prose-h2:text-2xl
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:font-bold prose-p:leading-relaxed prose-p:text-xs md:prose-p:text-lg
                  prose-ul:list-disc prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:font-bold prose-li:mb-2 prose-li:text-xs md:prose-li:text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex items-center gap-3 p-5 md:p-6 rounded-xl md:rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                <AlertTriangle size={typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20} className="flex-shrink-0" />
                <p className="text-[9px] md:text-xs font-black uppercase tracking-wide leading-tight">Legal: This document contains AI-generated non-diagnostic guidance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📚 Re-Engineered Prediction History */}
      {history.length > 0 && (
        <div className="space-y-8 md:space-y-10">
          <div className="flex items-center gap-3 md:gap-4 px-2 md:px-4">
            <History className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">Diagnostic Ledger</h2>
            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {history.slice(0, 6).map((item) => (
              <div key={item.id} className="relative group border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-white/[0.02] backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] transition-all hover:bg-white hover:scale-[1.03] hover:shadow-xl dark:hover:bg-white/10">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl ${item.severity === "High" ? "bg-red-500/10 text-red-600" : item.severity === "Moderate" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                    <Activity size={18} />
                  </div>
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${item.severity === "High" ? "text-red-500" : item.severity === "Moderate" ? "text-amber-500" : "text-emerald-500"}`}>
                    {item.severity} Risk
                  </span>
                </div>

                <div className="space-y-1 md:space-y-2 mb-6 md:mb-8">
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white line-clamp-1">
                    {item.symptoms?.join(", ") || "Case Study"}
                  </h3>
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                    <MapPin size={10} />
                    {item.location || "Undisclosed Global"}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => { 
                    setResult(item.prediction); 
                    setSeverity(item.severity || ""); 
                    setStep(5); 
                    window.scrollTo({ top: 0, behavior: "smooth" }); 
                  }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg md:rounded-xl bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                    <Search size={12} className="md:w-3.5 md:h-3.5" />
                    Recall
                  </button>
                  <button onClick={async () => {
                    if (!user) return;
                    await deleteDiseaseHistory(user.uid, item.id);
                    setHistory(await getDiseaseHistory(user.uid));
                  }} className="p-3 rounded-lg md:rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs">
                    <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔮 Extended Analysis Overlay */}
      {expandedPrediction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 isolate">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl transition-all" onClick={() => setExpandedPrediction(null)} />
          <div className="relative bg-white/95 dark:bg-[#030712]/95 backdrop-blur-[60px] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 border border-white/20 no-scrollbar">
            <button onClick={() => setExpandedPrediction(null)} className="absolute top-6 md:top-10 right-6 md:right-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl md:rounded-2xl hover:bg-red-500 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <div className="space-y-8 md:space-y-12">
              <div className="flex items-center gap-4 md:gap-6">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                    <FileText className="w-8 h-8 md:w-10 md:h-10" />
                 </div>
                 <div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Archive Report</h2>
                    <p className="text-[10px] md:text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-widest">{expandedPrediction.id.slice(0, 8)}</p>
                 </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none text-sm md:text-lg font-bold leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{expandedPrediction.prediction}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function BiometricInput({ label, value, setValue, icon, unit }: any) {
  return (
    <div className="space-y-3 md:space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 px-2 flex items-center gap-2">
        {icon} {label}
      </p>
      <div className="relative group/input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-white/40 dark:bg-white/[0.02] border border-white/80 dark:border-white/[0.1] px-5 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl text-base md:text-lg font-black outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
        />
        <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-[9px] md:text-xs font-black text-gray-600 dark:text-gray-400 tracking-widest uppercase">
          {unit}
        </div>
      </div>
    </div>
  );
}
