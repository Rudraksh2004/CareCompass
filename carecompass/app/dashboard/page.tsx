"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { getUserReminders } from "@/services/reminderService";
import { getHealthLogs } from "@/services/healthService";
import { getHistory } from "@/services/historyService";

export default function DashboardPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
      getUserReminders(user.uid).then(setReminders);
      getHealthLogs(user.uid, "weight").then(setHealthLogs);
      getHistory(user.uid, "reports").then(setReports);
      getHistory(user.uid, "prescriptions").then(setPrescriptions);
    }
  }, [user]);

  const generateSummary = async () => {
    if (!profile) return;

    setLoadingSummary(true);
    setSummary("");

    try {
      const res = await fetch("/api/ai/health-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          healthLogs,
          reports,
          prescriptions,
        }),
      });

      const data = await res.json();
      setSummary(data.summary || "No summary generated.");
    } catch (error) {
      console.error(error);
      setSummary("Failed to generate AI health summary.");
    }

    setLoadingSummary(false);
  };

  if (!profile) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, {profile.name} 👋
        </h1>
        <p className="text-blue-100 text-sm">
          Your AI-powered health companion is analyzing your health patterns.
        </p>
      </div>

      {/* 🧠 AI Health Summary Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            AI Health Summary
          </h2>

          <button
            onClick={generateSummary}
            disabled={loadingSummary}
            className="bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loadingSummary ? "Analyzing..." : "Generate Summary"}
          </button>
        </div>

        {summary ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-sm whitespace-pre-wrap">
            {summary}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Generate a personalized AI health summary based on your
            reports, prescriptions, and health logs.
          </p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Disclaimer: This AI summary is informational and non-diagnostic.
          Always consult a medical professional for medical decisions.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Health Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Name
            </p>
            <p className="font-semibold">{profile.name}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Age
            </p>
            <p className="font-semibold">
              {profile.age || "Not set"}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Blood Group
            </p>
            <p className="font-semibold">
              {profile.bloodGroup || "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Upcoming Medicine Reminders
        </h2>

        {reminders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No reminders scheduled yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl"
              >
                <p className="font-semibold">
                  {reminder.medicineName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {reminder.dosage} • {reminder.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
