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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">
        Welcome back, {profile.name}
      </h2>
      <p className="text-gray-500 mb-8">
        Blood Group: {profile.bloodGroup} • Age: {profile.age}
      </p>

      <h3 className="text-xl font-semibold mb-4">
        Upcoming Reminders
      </h3>

      {reminders.length === 0 && (
        <p className="text-gray-500">
          No reminders scheduled.
        </p>
      )}

      <div className="grid gap-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <p className="font-medium">
              {reminder.medicineName}
            </p>
            <p className="text-sm text-gray-600">
              {reminder.dosage} at {reminder.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
