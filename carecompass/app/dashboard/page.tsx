"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { getUserReminders } from "@/services/reminderService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getUserProfile(user.uid),
        getUserReminders(user.uid),
      ]).then(([profileData, remindersData]) => {
        setProfile(profileData);
        setReminders(remindersData || []);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Loading your health dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">
      {/* 🔷 Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold">
          Welcome back, {profile?.name || "User"} 👋
        </h2>
        <p className="opacity-90 mt-2 text-sm">
          Your AI-powered health companion for reports, prescriptions, tracking,
          and personalized insights.
        </p>

        <div className="flex flex-wrap gap-6 mt-6 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur">
            Blood Group:{" "}
            <span className="font-semibold">
              {profile?.bloodGroup || "N/A"}
            </span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur">
            Age:{" "}
            <span className="font-semibold">
              {profile?.age || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reminders Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">
            Active Medicine Reminders
          </p>
          <h3 className="text-3xl font-bold mt-2">
            {reminders.length}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Stay consistent with your medications
          </p>
        </div>

        {/* Features Card (UPDATED AS YOU REQUESTED) */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">
            Platform Features
          </p>
          <h3 className="text-lg font-semibold mt-2 leading-relaxed">
            Reports • Prescriptions • Chat • Tracking
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Complete AI health companion toolkit
          </p>
        </div>

        {/* Health Status Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">
            Health Monitoring
          </p>
          <h3 className="text-3xl font-bold mt-2 text-emerald-600">
            Active
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Tracking logs & AI insights enabled
          </p>
        </div>
      </div>

      {/* 🧭 Feature Showcase Section (NEW & PREMIUM) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold mb-6">
          CareCompass Capabilities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border">
            📄 Medical Report Explainer
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border">
            💊 Prescription Simplifier (Image/PDF/Handwritten)
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border">
            📊 Health Tracking & Trend Detection
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border">
            🤖 AI Health Assistant Chat (Memory Enabled)
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border">
            ⏰ Smart Medicine Reminders
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border">
            🧠 AI PDF Health Report Export
          </div>
        </div>
      </div>

      {/* 💊 Upcoming Reminders */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            Upcoming Medicine Reminders
          </h3>
          <span className="text-sm text-gray-400">
            {reminders.length} scheduled
          </span>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg font-medium">
              No reminders scheduled
            </p>
            <p className="text-sm mt-1">
              Add reminders to manage your medications efficiently.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200 dark:border-gray-600"
              >
                <div>
                  <p className="font-semibold">
                    {reminder.medicineName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {reminder.dosage}
                  </p>
                </div>

                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {reminder.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
