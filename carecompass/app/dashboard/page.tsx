"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { getUserReminders } from "@/services/reminderService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
      getUserReminders(user.uid).then(setReminders);
    }
  }, [user]);

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
          Your AI-powered health companion is ready to assist you.
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-4">
          Health Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Name
            </p>
            <p className="font-semibold">
              {profile.name}
            </p>
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

      {/* Reminders Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-4">
          Upcoming Medicine Reminders
        </h2>

        {reminders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No reminders scheduled yet. Add one in the reminders section.
          </p>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-4 rounded-xl transition-colors"
              >
                <div>
                  <p className="font-semibold">
                    {reminder.medicineName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {reminder.dosage} • {reminder.time}
                  </p>
                </div>

                <div className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                  Scheduled
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
