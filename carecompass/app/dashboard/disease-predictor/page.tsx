"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveDiseaseHistory } from "@/services/diseaseService";

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
            allergies: !!allergy,
            surgeries: !!pastSurgery,
            chronicConditions: chronicIllness
              ? [chronicIllness]
              : [],
          },
        }),
      });

      const data = await res.json();

      // 🔥 CRITICAL FIX: always read prediction (not analysis)
      const predictionText =
        data?.prediction ||
        "⚠️ AI could not generate analysis. Please try again.";

      const severityLevel = data?.severity || "Low";

      setResult(predictionText);
      setSeverity(severityLevel);

      // 💾 Save history (no undefined fields)
      if (predictionText && user) {
        await saveDiseaseHistory(user.uid, {
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          qa: {
            allergies: !!allergy,
            surgeries: !!pastSurgery,
            chronicConditions: chronicIllness
              ? [chronicIllness]
              : [],
          },
          severity: severityLevel,
          prediction: predictionText,
        });
      }
    } catch (error) {
      console.error("Prediction Error:", error);
      setResult(
        "⚠️ Failed to generate prediction. Please check your internet or API key."
      );
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AI Disease Risk Predictor
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
          Enter symptoms, location, and optional health context to receive
          AI-powered non-diagnostic health risk insights.
        </p>
      </div>

      {/* Input Card (UNCHANGED UI) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
        <h2 className="text-2xl font-semibold">
          Symptom Input (Hybrid Mode)
        </h2>

        <div className="flex flex-wrap gap-3">
          {SYMPTOM_CHIPS.map((symptom) => {
            const active = selectedSymptoms.includes(symptom);
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

        <textarea
          rows={3}
          value={customSymptoms}
          onChange={(e) => setCustomSymptoms(e.target.value)}
          placeholder="Type additional symptoms..."
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl"
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl"
        >
          <option value="">Select your city (optional)</option>
          {INDIAN_CITIES.map((city) => (
            <option key={city} value={`${city}, India`}>
              {city}
            </option>
          ))}
        </select>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
        >
          {loading ? "Analyzing Symptoms..." : "Analyze Disease Risk"}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              AI Health Risk Analysis
            </h2>
            {severity && (
              <span className="px-4 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Severity: {severity}
              </span>
            )}
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-line">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}