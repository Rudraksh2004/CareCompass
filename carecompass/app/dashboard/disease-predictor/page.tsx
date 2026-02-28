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
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* 🌟 Header (ONLY CHANGE: ICON ADDED, NOTHING ELSE) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          🧬 AI Disease Risk Predictor
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
          Hybrid AI + rule-based non-diagnostic disease risk analysis
          based on symptoms, location, and health context.
        </p>
      </div>

      {/* 🧠 Input Card (UNCHANGED) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <h2 className="text-2xl font-semibold">
          Symptom Input (Hybrid Mode)
        </h2>

        {/* Symptom Chips */}
        <div>
          <p className="text-sm font-medium mb-3">
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
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Symptoms */}
        <div>
          <p className="text-sm font-medium mb-2">
            Additional Symptoms (Optional)
          </p>
          <textarea
            rows={3}
            value={customSymptoms}
            onChange={(e) =>
              setCustomSymptoms(e.target.value)
            }
            placeholder="Type symptoms like: chills, loss of smell, mild fever..."
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl"
          />
        </div>

        {/* Location */}
        <div>
          <p className="text-sm font-medium mb-2">
            Your Location (India)
          </p>

          {!useManualLocation ? (
            <>
              <select
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl"
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
                  className="mt-2 text-sm text-indigo-600 font-semibold"
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
              placeholder="Type your city (e.g., Siliguri, India)"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl"
            />
          )}
        </div>

        {/* Optional QA Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Optional Health Questions
          </h3>

          <input
            value={allergy}
            onChange={(e) =>
              setAllergy(e.target.value)
            }
            placeholder="Any allergies? (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
          />

          <input
            value={pastSurgery}
            onChange={(e) =>
              setPastSurgery(e.target.value)
            }
            placeholder="Any past surgeries? (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
          />

          <input
            value={chronicIllness}
            onChange={(e) =>
              setChronicIllness(e.target.value)
            }
            placeholder="Any chronic illness (diabetes, asthma, etc.) (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
          />
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50"
        >
          {loading
            ? "Analyzing Symptoms..."
            : "Analyze Disease Risk"}
        </button>
      </div>

      {/* 📊 Result Card (ALREADY COLOR-CODED — LEFT UNTOUCHED) */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
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

          <p className="text-sm text-gray-500 mb-4">
            ⚠️ Non-diagnostic AI guidance only.
          </p>

          <div className="text-sm leading-relaxed whitespace-pre-line">
            {result}
          </div>
        </div>
      )}

      {/* 🔥 HISTORY SECTION (ONLY CHANGE: RISK COLOR BADGE) */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">
            🧾 Disease Prediction History
          </h2>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-800"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">
                    Symptoms:{" "}
                    {item.symptoms?.join(", ") || "Custom"}
                  </p>

                  {/* ONLY CHANGE: COLOR-CODED RISK BADGE */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      item.severity === "High"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : item.severity === "Moderate"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }`}
                  >
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

                {/* NEW ACTIONS (UNCHANGED) */}
                <div className="flex flex-wrap gap-4 mt-3">
                  <button
                    onClick={() => {
                      setResult(item.prediction);
                      setSeverity(item.severity || "");
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    View in Main Analysis →
                  </button>

                  <button
                    onClick={() =>
                      setExpandedPrediction(item)
                    }
                    className="text-sm font-semibold text-purple-600 hover:underline"
                  >
                    Expand Full Analysis
                  </button>

                  <button
                    onClick={async () => {
                      if (!user) return;
                      await deleteDiseaseHistory(
                        user.uid,
                        item.id
                      );
                      const updated =
                        await getDiseaseHistory(user.uid);
                      setHistory(updated);
                    }}
                    className="text-sm font-semibold text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 MODAL VIEWER (UNCHANGED) */}
      {expandedPrediction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-900 max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 relative">
            <button
              onClick={() =>
                setExpandedPrediction(null)
              }
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">
              🧠 Full Disease Risk Analysis
            </h2>

            <p className="text-xs text-gray-500 mb-4">
              ⚠️ Non-diagnostic AI guidance only.
            </p>

            <div className="text-sm leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
              {expandedPrediction.prediction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}