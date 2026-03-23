"use client";

import { useEffect, useState } from "react";
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
  // 🔥 NEW: modal expand state (NON-BREAKING)
  const [expandedPrediction, setExpandedPrediction] =
    useState<DiseaseHistory | null>(null);

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

    try {
      const res = await fetch("/api/ai/disease-predictor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          qa: {
            allergies: allergy ? true : false,
            surgeries: pastSurgery ? true : false,
            chronicConditions: chronicIllness
              ? [chronicIllness]
              : [],
            duration: null,
            medications: null,
          },
        }),
      });

      const data = await res.json();

      const predictionText =
        data?.prediction || "No analysis generated.";
      const severityLevel = data?.severity || "Low";

      setResult(predictionText);
      setSeverity(severityLevel);

      // 💾 Save History (UNCHANGED)
      await saveDiseaseHistory(user.uid, {
        symptoms: selectedSymptoms,
        customText: customSymptoms,
        location,
        qa: {
          allergies: allergy ? true : false,
          surgeries: pastSurgery ? true : false,
          chronicConditions: chronicIllness
            ? [chronicIllness]
            : [],
        },
        severity: severityLevel,
        prediction: predictionText,
      });

      // 🔄 Refresh history instantly (UNCHANGED)
      const updatedHistory = await getDiseaseHistory(user.uid);
      setHistory(updatedHistory);
    } catch (error) {
      console.error(error);
      setResult("Failed to generate prediction.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Clinical Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-emerald-600/10 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-emerald-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-4">
            🧬 AI Disease Risk Predictor
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-bold mt-4 text-sm max-w-2xl leading-relaxed">
            Hybrid AI + rule-based non-diagnostic disease risk analysis based on symptoms, location, and health context.
          </p>
        </div>
      </div>

      {/* 🧠 Input Card */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
            Symptom Input (Hybrid Mode)
          </h2>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Select standard symptoms or describe your condition manually
          </p>
        </div>

        {/* Symptom Chips */}
        <div>
          <p className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span>🌡️ Common Symptoms</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {SYMPTOM_CHIPS.map((symptom) => {
              const active = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all border ${
                    active
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105"
                      : "bg-white/40 dark:bg-black/20 border-white/60 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-black/30"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Symptoms */}
        <div className="space-y-3">
          <p className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span>✍️ Additional Symptoms (Optional)</span>
          </p>
          <textarea
            rows={3}
            value={customSymptoms}
            onChange={(e) => setCustomSymptoms(e.target.value)}
            placeholder="Type symptoms like: chills, loss of smell, mild fever..."
            className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
          />
        </div>

        {/* Location & Health QA Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Location */}
          <div className="space-y-3">
            <p className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>📍 Your Location (India)</span>
            </p>

            {!useManualLocation ? (
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner appearance-none cursor-pointer"
                >
                  <option value="">Select your city (optional)</option>
                  {INDIAN_CITIES.map((city) => (
                    <option key={city} value={`${city}, India`}>
                      {city}
                    </option>
                  ))}
                  <option value="manual">Other (Type manually)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>

                {location === "manual" && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualLocation(true);
                      setLocation("");
                    }}
                    className="mt-3 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    ✎ Switch to manual input
                  </button>
                )}
              </div>
            ) : (
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Type your city (e.g., Siliguri, India)"
                className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
              />
            )}
          </div>

          {/* Health Context */}
          <div className="space-y-4">
            <p className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>🏥 Health Context (Optional)</span>
            </p>
            <div className="space-y-3">
              <input
                value={allergy}
                onChange={(e) => setAllergy(e.target.value)}
                placeholder="Allergies?"
                className="w-full border border-white/40 dark:border-white/[0.05] bg-white/30 dark:bg-black/10 backdrop-blur-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm placeholder-gray-500"
              />
              <input
                value={pastSurgery}
                onChange={(e) => setPastSurgery(e.target.value)}
                placeholder="Past surgeries?"
                className="w-full border border-white/40 dark:border-white/[0.05] bg-white/30 dark:bg-black/10 backdrop-blur-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm placeholder-gray-500"
              />
              <input
                value={chronicIllness}
                onChange={(e) => setChronicIllness(e.target.value)}
                placeholder="Chronic illnesses? (diabetes, asthma...)"
                className="w-full border border-white/40 dark:border-white/[0.05] bg-white/30 dark:bg-black/10 backdrop-blur-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* 🚀 Action Button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all text-white py-5 rounded-2xl font-black shadow-lg disabled:opacity-50 text-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              🧠 Analyzing Health Risk...
            </span>
          ) : (
            "Analyze Disease Risk AI →"
          )}
        </button>
      </div>

      {/* 📊 Result Section */}
      {result && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
              <span>🩺 Health Risk Analysis</span>
            </h2>

            {severity && (
              <span
                className={`px-5 py-2 rounded-xl border font-black text-xs uppercase tracking-wider ${
                  severity === "High"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : severity === "Moderate"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                Severity: {severity}
              </span>
            )}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-8">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              ⚠️ Non-diagnostic AI guidance only. Not a medical substitute.
            </p>
          </div>

          <div className="text-sm font-bold leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
            {result}
          </div>
        </div>
      )}

      {/* 📚 History Section */}
      {history.length > 0 && (
        <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
              <span>📚 Prediction History</span>
            </h2>
            <span className="text-sm font-black text-gray-500 dark:text-gray-400">
              {history.length} Saved Analysis
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative border border-white/60 dark:border-white/[0.05] bg-white/40 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl transition-all hover:bg-white/60 dark:hover:bg-black/30 shadow-inner"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-black text-xl text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      🩺 {item.symptoms?.slice(0, 2).join(", ") || "Custom Analysis"}
                      {item.symptoms && item.symptoms.length > 2 && "..."}
                    </h3>
                    {item.location && (
                      <p className="text-xs font-bold text-gray-500 mt-1">📍 {item.location}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase ${
                      item.severity === "High"
                        ? "bg-red-500/10 text-red-600 border border-red-500/10"
                        : item.severity === "Moderate"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/10"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/10"
                    }`}
                  >
                    {item.severity} Risk
                  </span>
                </div>

                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {item.prediction}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setResult(item.prediction);
                      setSeverity(item.severity || "");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex-1 py-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-black transition hover:-translate-y-1 hover:shadow-md"
                  >
                    View Result
                  </button>
                  <button
                    onClick={() => setExpandedPrediction(item)}
                    className="flex-1 py-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 rounded-xl text-xs font-black transition hover:-translate-y-1 hover:shadow-md"
                  >
                    Expand
                  </button>
                  <button
                    onClick={async () => {
                      if (!user) return;
                      await deleteDiseaseHistory(user.uid, item.id);
                      const updated = await getDiseaseHistory(user.uid);
                      setHistory(updated);
                    }}
                    className="p-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 Premium Modal Viewer */}
      {expandedPrediction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 isolate">
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
            onClick={() => setExpandedPrediction(null)}
          />
          <div className="relative bg-white/90 dark:bg-[#030712]/90 backdrop-blur-[40px] max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/[0.05] p-10 animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setExpandedPrediction(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                🧠 Full Risk Analysis
              </h2>
              <span
                className={`px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-wider ${
                  expandedPrediction.severity === "High"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : expandedPrediction.severity === "Moderate"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                {expandedPrediction.severity} Risk
              </span>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-8">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                ⚠️ This is a computer-generated risk prediction based on provided context.
              </p>
            </div>

            <div className="text-base font-bold leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
              {expandedPrediction.prediction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}