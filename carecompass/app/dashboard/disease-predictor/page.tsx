"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  saveDiseaseHistory,
  getDiseaseHistory,
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

  const [history, setHistory] = useState<DiseaseHistory[]>([]);

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
      {/* 🌟 PREMIUM HEADER (UI ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
            🧠 AI Disease Risk Predictor
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-2xl leading-relaxed">
            Hybrid AI + rule-based non-diagnostic health risk analysis based on
            symptoms, location, and personal health context for students.
          </p>
        </div>
      </div>

      {/* 🧾 INPUT CARD (POLISHED UI ONLY) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">
            Symptom Input (Hybrid Mode)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Select symptoms + optional context for smarter AI risk analysis
          </p>
        </div>

        {/* Symptom Chips */}
        <div>
          <p className="text-sm font-semibold mb-3">
            Select Symptoms
          </p>
          <div className="flex flex-wrap gap-3">
            {SYMPTOM_CHIPS.map((symptom) => {
              const active =
                selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.03]"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-[1.02] hover:shadow"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Symptoms */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Additional Symptoms (Optional)
          </p>
          <textarea
            rows={3}
            value={customSymptoms}
            onChange={(e) =>
              setCustomSymptoms(e.target.value)
            }
            placeholder="e.g., chills, loss of smell, mild fever..."
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            📍 Your Location (India)
          </p>

          {!useManualLocation ? (
            <>
              <select
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
              >
                <option value="">
                  Select your city (optional)
                </option>
                {INDIAN_CITIES.map((city) => (
                  <option
                    key={city}
                    value={`${city}, India`}
                  >
                    {city}
                  </option>
                ))}
                <option value="manual">
                  Other (Type manually)
                </option>
              </select>

              {location === "manual" && (
                <button
                  type="button"
                  onClick={() => {
                    setUseManualLocation(true);
                    setLocation("");
                  }}
                  className="text-sm text-indigo-600 font-semibold hover:underline"
                >
                  Enter custom location
                </button>
              )}
            </>
          ) : (
            <input
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="e.g., Siliguri, India"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
            />
          )}
        </div>

        {/* Optional QA (UNCHANGED LOGIC) */}
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">
            🩺 Optional Health Context
          </h3>

          <input
            value={allergy}
            onChange={(e) =>
              setAllergy(e.target.value)
            }
            placeholder="Any allergies? (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <input
            value={pastSurgery}
            onChange={(e) =>
              setPastSurgery(e.target.value)
            }
            placeholder="Any past surgeries? (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <input
            value={chronicIllness}
            onChange={(e) =>
              setChronicIllness(e.target.value)
            }
            placeholder="Any chronic illness (diabetes, asthma, etc.) (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold shadow-xl hover:opacity-90 transition disabled:opacity-50 text-lg"
        >
          {loading
            ? "🧠 Analyzing Symptoms..."
            : "Analyze Disease Risk"}
        </button>
      </div>

      {/* 📊 RESULT CARD (UI ONLY) */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              AI Health Risk Analysis
            </h2>

            {severity && (
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  severity === "High"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : severity === "Moderate"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                }`}
              >
                Severity: {severity}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-6">
            ⚠️ Non-diagnostic AI guidance for educational purposes only.
          </p>

          <div className="text-sm leading-relaxed whitespace-pre-line">
            {result}
          </div>
        </div>
      )}

      {/* 📜 HISTORY (UI POLISH ONLY — LOGIC UNTOUCHED) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              🧾 Disease Prediction History
            </h2>
            <span className="text-xs text-gray-500">
              {history.length} records
            </span>
          </div>

          <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm">
                    🤒 {item.symptoms.join(", ") || "Custom Symptoms"}
                  </p>

                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {item.severity} Risk
                  </span>
                </div>

                {item.location && (
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {item.location}
                  </p>
                )}

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-line">
                  {item.prediction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}