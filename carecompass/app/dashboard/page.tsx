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
      {/* 🔷 Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold">
          Welcome back, {profile?.name || "User"} 👋
        </h2>
        <p className="opacity-90 mt-2 text-sm">
          Your AI-powered health companion is monitoring your insights and wellness data.
        </p>

        <div className="flex flex-wrap gap-6 mt-6 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur">
            Blood Group: <span className="font-semibold">{profile?.bloodGroup || "N/A"}</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur">
            Age: <span className="font-semibold">{profile?.age || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* 📊 Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Active Reminders</p>
          <h3 className="text-3xl font-bold mt-2">
            {reminders.length}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Medicine & health alerts
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">AI Features Used</p>
          <h3 className="text-3xl font-bold mt-2">
            6+
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Reports, Chat, Trends & Insights
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Health Status</p>
          <h3 className="text-3xl font-bold mt-2 text-emerald-600">
            Stable
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Based on recent AI analysis
          </p>
        </div>
      </div>

      {/* 💊 Upcoming Reminders Section */}
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
              Add medicine reminders to stay on track with your treatment.
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

      {/* 🧠 AI Assistant Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-2">
          CareCompass AI Assistant
        </h3>
        <p className="text-sm opacity-90">
          Analyze reports, simplify prescriptions, detect trends, and get personalized
          health insights — all powered by AI.
        </p>
      </div>
    </div>
  );
}
