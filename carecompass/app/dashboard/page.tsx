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
      <div className="flex items-center justify-center h-full text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          Welcome back, {profile.name}
        </h2>
        <p className="text-slate-500 mt-2">
          Blood Group: {profile.bloodGroup} • Age: {profile.age}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Reminders</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">
            {reminders.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Health Logs</p>
          <p className="text-2xl font-bold mt-2 text-emerald-600">
            Track your health trends
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">AI Features</p>
          <p className="text-2xl font-bold mt-2 text-purple-600">
            Active
          </p>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-slate-800">
          Upcoming Reminders
        </h3>

        {reminders.length === 0 && (
          <p className="text-slate-500">
            No reminders scheduled.
          </p>
        )}

        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <p className="font-semibold text-slate-800">
                {reminder.medicineName}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {reminder.dosage} at {reminder.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
