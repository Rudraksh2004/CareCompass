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

  // 🔥 Premium QA States
  const [allergies, setAllergies] = useState<boolean | null>(null);
  const [surgeries, setSurgeries] = useState<boolean | null>(null);
  const [chronicIllness, setChronicIllness] = useState("");
  const [duration, setDuration] = useState("");
  const [medications, setMedications] = useState("");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          qa: {
            allergies: allergies ?? false,
            surgeries: surgeries ?? false,
            chronicConditions: chronicIllness
              ? [chronicIllness]
              : [],
            duration: duration || null,
            medications: medications || null,
          },
        }),
      });

      const data = await res.json();

      const predictionText =
        data?.prediction ||
        "⚠️ AI could not generate analysis. Please try again.";

      const severityLevel = data?.severity || "Low";

      setResult(predictionText);
      setSeverity(severityLevel);

      if (user && predictionText) {
        await saveDiseaseHistory(user.uid, {
          symptoms: selectedSymptoms,
          customText: customSymptoms,
          location,
          qa: {
            allergies: allergies ?? false,
            surgeries: surgeries ?? false,
            chronicConditions: chronicIllness
              ? [chronicIllness]
              : [],
            duration: duration || "",
            medications: medications || "",
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
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-emerald-600/10 p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AI Disease Risk Predictor
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Smart hybrid AI analysis based on symptoms, location and optional clinical background.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">

        {/* Symptoms */}
        <div className="flex flex-wrap gap-3">
          {SYMPTOM_CHIPS.map((symptom) => {
            const active = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white"
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
          placeholder="Additional symptoms (optional)"
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl"
        />

        {/* Location */}
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

        {/* 🔥 PREMIUM QA SECTION */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-xl font-semibold">
            Optional Clinical Background
          </h3>

          {/* Allergies Toggle */}
          <div>
            <p className="text-sm font-medium mb-2">Do you have any allergies?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setAllergies(true)}
                className={`px-4 py-2 rounded-xl ${
                  allergies === true
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setAllergies(false)}
                className={`px-4 py-2 rounded-xl ${
                  allergies === false
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Surgeries Toggle */}
          <div>
            <p className="text-sm font-medium mb-2">Any past surgeries?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setSurgeries(true)}
                className={`px-4 py-2 rounded-xl ${
                  surgeries === true
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setSurgeries(false)}
                className={`px-4 py-2 rounded-xl ${
                  surgeries === false
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Chronic Illness */}
          <input
            value={chronicIllness}
            onChange={(e) => setChronicIllness(e.target.value)}
            placeholder="Chronic illness (e.g., Diabetes, Asthma)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
          />

          {/* Duration */}
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
          >
            <option value="">Symptom duration (optional)</option>
            <option value="1-2 days">1–2 days</option>
            <option value="3-5 days">3–5 days</option>
            <option value="1 week+">1 week+</option>
          </select>

          {/* Medications */}
          <input
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="Current medications (optional)"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
          />
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
        >
          {loading ? "Analyzing Symptoms..." : "Analyze Disease Risk"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              AI Health Risk Analysis
            </h2>
            {severity && (
              <span className="px-4 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Severity: {severity}
              </span>
            )}
          </div>

          <div className="whitespace-pre-line text-sm leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}