"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/context/AuthContext";
import {
  saveDiseaseHistory,
  getDiseaseHistory,
  deleteDiseaseHistory,
  DiseaseHistory,
} from "@/services/diseaseService";

const SYMPTOM_CHIPS = [
  "Fever",
  "Cough",
  "Headache",
  "Fatigue",
  "Sore Throat",
  "Body Pain",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Dizziness",
  "Chest Pain",
  "Shortness of Breath",
];

// 🇮🇳 Major Indian Cities
const INDIAN_CITIES = [
  "Kolkata",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Bhopal",
  "Patna",
  "Chandigarh",
  "Bhubaneswar",
  "Guwahati",
  "Kochi",
  "Indore",
  "Nagpur",
  "Surat",
  "Visakhapatnam",
];

export default function DiseasePredictorPage() {
  const { user } = useAuth();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState("");
  const [location, setLocation] = useState("");
  const [useManualLocation, setUseManualLocation] = useState(false);

  const [allergy, setAllergy] = useState("");
  const [pastSurgery, setPastSurgery] = useState("");
  const [chronicIllness, setChronicIllness] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [severity, setSeverity] = useState<
    "Low" | "Moderate" | "High" | ""
  >("");

  // 🆕 History State (UNCHANGED)
  const [history, setHistory] = useState<DiseaseHistory[]>([]);
  const [expandedPrediction, setExpandedPrediction] = useState<DiseaseHistory | null>(null);
  // 🆕 NEW: Premium Wizard States
  const [step, setStep] = useState(1);
  const [isWorsening, setIsWorsening] = useState("No");
  const [duration, setDuration] = useState("1-2 days");
  const [medications, setMedications] = useState("");

  // 📥 Load Prediction History (UNCHANGED)
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      const data = await getDiseaseHistory(user.uid);
      setHistory(data);
    };
    loadHistory();
  }, [user]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handlePredict = async () => {
    if (!user) return;
    if (selectedSymptoms.length === 0 && !customSymptoms.trim()) return;

    setLoading(true);
    setResult("");
    setSeverity("");
    setStep(4); // Move to Analysis Step

    try {
      const res = await fetch("/api/ai/disease-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          qa: {
            allergies: allergy ? true : false,
            surgeries: pastSurgery ? true : false,
            chronicConditions: chronicIllness ? [chronicIllness] : [],
            duration: duration,
            isWorsening: isWorsening,
            medications: medications,
          },
        }),
      });

      const data = await res.json();
      const predictionText = data?.prediction || "No analysis generated.";
      const severityLevel = data?.severity || "Low";

      setResult(predictionText);
      setSeverity(severityLevel);

      await saveDiseaseHistory(user.uid, {
        symptoms: selectedSymptoms,
        customText: customSymptoms,
        location,
        qa: {
          allergies: allergy ? true : false,
          surgeries: pastSurgery ? true : false,
          chronicConditions: chronicIllness ? [chronicIllness] : [],
        },
        severity: severityLevel,
        prediction: predictionText,
      });

      const updatedHistory = await getDiseaseHistory(user.uid);
      setHistory(updatedHistory);
    } catch (error) {
      console.error(error);
      setResult("Failed to generate prediction.");
    }
    setLoading(false);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Clinical Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-emerald-600/10 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-emerald-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-4">
            🧬 CareCompass Pro Predictor
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-bold mt-4 text-sm max-w-2xl leading-relaxed">
            Experience our premium clinical-grade AI analysis. A multi-step diagnostic context engine optimized for precision health insights.
          </p>
        </div>
      </div>

      {/* 🧩 Progress Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-between px-10 gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-2">
              <div className={`h-2 w-full rounded-full transition-all duration-500 ${step >= s ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-800"}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? "text-indigo-600" : "text-gray-400"}`}>
                {s === 1 ? "Symptoms" : s === 2 ? "Context" : "Environment"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 🧠 Wizard interface */}
      {step < 4 && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-lg">1</span>
                  Select Your Symptoms
                </h2>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">What are you feeling right now?</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {SYMPTOM_CHIPS.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button key={symptom} onClick={() => toggleSymptom(symptom)} className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all border ${active ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-white/40 dark:bg-black/20 border-white/60 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 hover:bg-white/60"}`}>{symptom}</button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-black text-gray-700 dark:text-gray-300">✍️ Describe in detail (Recommended)</p>
                <textarea rows={4} value={customSymptoms} onChange={(e) => setCustomSymptoms(e.target.value)} placeholder="e.g. My head hurts in the back, and I feel slightly shaky..." className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-lg">2</span>
                  Health Context
                </h2>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">Help our AI understand your broader health profile.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-black text-gray-700 dark:text-gray-300">⏳ How long have you had this?</p>
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 appearance-none">
                      <option>Less than 24h</option>
                      <option>1-2 days</option>
                      <option>3-7 days</option>
                      <option>7+ days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-gray-700 dark:text-gray-300">📈 Is it getting worse?</p>
                    <div className="flex gap-4">
                      {["No", "Slightly", "Yes"].map(opt => (
                        <button key={opt} onClick={() => setIsWorsening(opt)} className={`flex-1 py-3 rounded-xl text-xs font-black transition ${isWorsening === opt ? "bg-indigo-600 text-white" : "bg-white/40 dark:bg-black/20"}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-black text-gray-700 dark:text-gray-300">💊 Current Medications (Optional)</p>
                  <textarea rows={3} value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="Are you taking any medicine currently?" className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <input value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="Allergies?" className="bg-white/30 dark:bg-black/20 border border-white/20 p-3 rounded-xl text-sm font-black" />
                <input value={pastSurgery} onChange={(e) => setPastSurgery(e.target.value)} placeholder="Past Surgeries?" className="bg-white/30 dark:bg-black/20 border border-white/20 p-3 rounded-xl text-sm font-black" />
                <input value={chronicIllness} onChange={(e) => setChronicIllness(e.target.value)} placeholder="Chronic Conditions?" className="bg-white/30 dark:bg-black/20 border border-white/20 p-3 rounded-xl text-sm font-black" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center py-10">
              <div className="max-w-md mx-auto space-y-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Environmental Sync</h2>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Our AI cross-references your coordinates with seasonal illness patterns in your region.</p>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">📍</span>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter city (e.g. Kolkata, West Bengal)" className="w-full pl-16 border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-lg font-black text-gray-800 dark:text-gray-200" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-4">
            {step > 1 && <button onClick={prevStep} className="flex-1 py-4 rounded-2xl font-black border border-indigo-600/30 text-indigo-600 transition hover:bg-indigo-600/5">Back</button>}
            {step < 3 ? (
              <button onClick={nextStep} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg transition hover:bg-indigo-700">Continue →</button>
            ) : (
              <button onClick={handlePredict} className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg transition hover:scale-[1.02]">Initialize AI Core Analysis</button>
            )}
          </div>
        </div>
      )}

      {/* 🚀 Loading / Analysis Step */}
      {step === 4 && loading && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] p-20 rounded-3xl text-center space-y-10">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-4 rounded-full border-2 border-emerald-500/20 animate-pulse duration-700" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🩻</div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black animate-pulse">Scanning Health Vitals...</h2>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Cross-referencing symptoms with clinical database & regional outbreaks</p>
          </div>
        </div>
      )}

      {/* 📊 Result Section */}
      {step === 4 && !loading && result && (
        <div className="animate-in zoom-in fade-in duration-500 space-y-6">
          <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-indigo-600/10 pb-6">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <span className="p-2 rounded-xl bg-indigo-600 text-white text-xl">📋</span>
                AI Core Diagnosis
              </h2>
              <div className="flex gap-2">
                <span className={`px-5 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider ${severity === "High" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                  {severity} Criticality
                </span>
                <button onClick={() => setStep(1)} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-white/5 font-black text-[10px] uppercase">Restart</button>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-p:font-bold prose-headings:font-black prose-li:font-bold prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* 📚 History List - Simplified for Dashboard feel */}
      {history.length > 0 && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] p-8 rounded-3xl">
          <h2 className="text-xl font-black mb-6">Recent Health Checks ({history.length})</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {history.slice(0, 6).map(item => (
              <div key={item.id} className="relative border border-white/40 dark:border-white/[0.05] bg-white/40 dark:bg-black/20 p-5 rounded-2xl hover:bg-white/60 dark:hover:bg-black/30 transition border-l-4 border-l-indigo-600">
                <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">🩺 {item.symptoms?.join(", ") || "Analysis"}</h3>
                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Severity: {item.severity}</p>
                <button onClick={() => { setResult(item.prediction); setSeverity(item.severity || ""); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-4 text-[10px] font-black text-indigo-600 hover:underline">RE-EXAMINE RESULT →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 Modal expansion kept as simple component logic if needed... */}
      {expandedPrediction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 isolate">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setExpandedPrediction(null)} />
          <div className="relative bg-white/90 dark:bg-[#030712]/90 backdrop-blur-[40px] max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-10 shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setExpandedPrediction(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full">✕</button>
            <h2 className="text-3xl font-black mb-6">Clinical Risk Breakdown</h2>
            <div className="prose dark:prose-invert max-w-none text-sm font-bold leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{expandedPrediction.prediction}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
