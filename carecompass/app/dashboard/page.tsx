"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { getUserReminders } from "@/services/reminderService";
import Link from "next/link";

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
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        Welcome {profile.name} ({profile.bloodGroup})
      </h1>

      <p className="mt-2 text-gray-600">Age: {profile.age}</p>

      {/* Quick Actions */}
      <div className="mt-6 space-x-4">
        <Link href="/dashboard/report" className="text-blue-600 underline">
          Explain Medical Report
        </Link>

        <Link href="/dashboard/reminders" className="text-blue-600 underline">
          Manage Reminders
        </Link>

        <Link
          href="/dashboard/chat"
          className="block mt-3 text-blue-600 underline"
        >
          AI Health Assistant →
        </Link>
      </div>

      {/* Upcoming Reminders */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Reminders</h2>

        {reminders.length === 0 && (
          <p className="text-gray-500">No reminders scheduled.</p>
        )}

        {reminders.map((reminder) => (
          <div key={reminder.id} className="border p-3 rounded mb-2">
            <p className="font-medium">{reminder.medicineName}</p>
            <p className="text-sm text-gray-600">
              {reminder.dosage} at {reminder.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
