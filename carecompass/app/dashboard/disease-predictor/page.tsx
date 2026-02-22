"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  saveDiseaseHistory,
  getDiseaseHistory,
} from "@/services/diseaseService";

interface QAState {
  allergies?: boolean;
  surgeries?: boolean;
  chronicConditions: string[];
  duration?: string;
  medications?: string;
}

interface HistoryItem {
  id: string;
  symptoms: string[];
  customText?: string;
  location?: string;
  severity: "Low" | "Moderate" | "High";
  prediction: string;
}

const SYMPTOM_CHIPS = [
  "Fever",
  "Cough",
  "Headache",
  "Body Pain",
  "Fatigue",
  "Sore Throat",
  "Nausea",
  "Vomiting",
  "Chest Pain", // red flag
  "Breathing Difficulty", // red flag
  "Dizziness",
];

const RED_FLAGS = ["Chest Pain", "Breathing Difficulty"];

export default function DiseasePredictorPage() {
  const { user } = useAuth();
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Moderate" | "High" | "">("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [qa, setQa] = useState<QAState>({
    chronicConditions: [],
  });

  const loadHistory = async () => {
    if (!user) return;
    const data = await getDiseaseHistory(user.uid);
    setHistory(data as HistoryItem[]);
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const toggleChronic = (condition: string) => {
    setQa((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
  };

  const handleAnalyze = async () => {
    if (!user) return;
    if (selectedSymptoms.length === 0 && !customText.trim()) return;

    setLoading(true);
    setPrediction("");

    try {
      const res = await fetch("/api/ai/disease-predictor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          customText,
          location,
          qa,
        }),
      });

      const data = await res.json();
      setPrediction(data.prediction);
      setSeverity(data.severity);

      await saveDiseaseHistory(user.uid, {
        symptoms: selectedSymptoms,
        customText,
        location,
        qa,
        severity: data.severity,
        prediction: data.prediction,
      });

      loadHistory();

      // Auto-scroll (Result UX: A)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (error) {
      console.error(error);
      setPrediction("Failed to analyze symptoms.");
    }

    setLoading(false);
  };

  const SeverityBadge = () => {
    if (!severity) return null;

    const color =
      severity === "High"
        ? "bg-red-500"
        : severity === "Moderate"
        ? "bg-amber-500"
        : "bg-emerald-500";

    return (
      <span className={`${color} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
        {severity} Risk
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-emerald-600/10 backdrop-blur-xl p-10 shadow-xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🧠 AI Disease Predictor
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
          Hybrid symptom analysis using AI, clinical logic, and location-aware insights.
          (Non-diagnostic)
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              step === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            Step {s}
          </div>
        ))}
      </div>

      {/* STEP 1: Symptoms */}
      {step === 1 && (
        <div className="bg-white/70 dark:bg-gray-900/60 p-8 rounded-3xl shadow-2xl border">
          <h2 className="text-2xl font-semibold mb-6">
            Select Your Symptoms
          </h2>

          <div className="flex flex-wrap gap-3 mb-6">
            {SYMPTOM_CHIPS.map((symptom) => {
              const isRed = RED_FLAGS.includes(symptom);
              const active = selectedSymptoms.includes(symptom);

              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    active
                      ? isRed
                        ? "bg-red-500 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>

          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Describe additional symptoms..."
            className="w-full border p-4 rounded-2xl"
          />

          <button
            onClick={() => setStep(2)}
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Next →
          </button>
        </div>
      )}

      {/* STEP 2: Location */}
      {step === 2 && (
        <div className="bg-white/70 dark:bg-gray-900/60 p-8 rounded-3xl shadow-2xl border">
          <h2 className="text-2xl font-semibold mb-4">
            🌍 Your Location (Recommended)
          </h2>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Kolkata, India"
            className="w-full border p-4 rounded-2xl"
          />

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 rounded-xl bg-gray-300"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Optional QA */}
      {step === 3 && (
        <div className="bg-white/70 dark:bg-gray-900/60 p-8 rounded-3xl shadow-2xl border space-y-6">
          <h2 className="text-2xl font-semibold">
            🧾 Clinical Questions (Optional)
          </h2>

          <div className="flex gap-4">
            <button
              onClick={() => setQa({ ...qa, allergies: true })}
              className="px-4 py-2 rounded-full bg-amber-100"
            >
              Allergies: Yes
            </button>
            <button
              onClick={() => setQa({ ...qa, allergies: false })}
              className="px-4 py-2 rounded-full bg-gray-200"
            >
              Allergies: No
            </button>
          </div>

          <input
            value={qa.medications || ""}
            onChange={(e) =>
              setQa({ ...qa, medications: e.target.value })
            }
            placeholder="Current medications (optional)"
            className="w-full border p-4 rounded-2xl"
          />

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 rounded-xl bg-gray-300"
            >
              ← Back
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "🧠 Analyze with AI"}
            </button>
          </div>
        </div>
      )}

      {/* RESULT SECTION (Auto-scroll target) */}
      {prediction && (
        <div
          ref={resultRef}
          className="bg-white dark:bg-gray-900 border p-8 rounded-3xl shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              AI Clinical Analysis
            </h2>
            <SeverityBadge />
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm">
            {prediction}
          </div>

          <p className="text-xs text-red-500 mt-6">
            ⚠️ This AI analysis is for educational purposes only and not a medical diagnosis.
            Please consult a healthcare professional for medical advice.
          </p>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/60 p-8 rounded-3xl shadow-2xl border">
          <h2 className="text-2xl font-semibold mb-6">
            Previous Analyses
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="border p-5 rounded-2xl bg-white dark:bg-gray-800"
              >
                <p className="font-semibold">
                  Symptoms: {item.symptoms.join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  Location: {item.location || "Not provided"}
                </p>
                <p className="text-xs mt-2 line-clamp-3">
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