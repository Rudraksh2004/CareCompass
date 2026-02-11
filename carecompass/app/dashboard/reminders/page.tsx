"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addReminder,
  getUserReminders,
} from "@/services/reminderService";

export default function ReminderPage() {
  const { user } = useAuth();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<any[]>([]);

  const loadReminders = async () => {
    if (user) {
      const data = await getUserReminders(user.uid);
      setReminders(data);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  const handleAddReminder = async () => {
    if (!user) return;

    await addReminder(user.uid, medicineName, dosage, time);

    setMedicineName("");
    setDosage("");
    setTime("");

    loadReminders();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Medicine Reminders
      </h1>

      <div className="space-y-3 mb-6">
        <input
          className="w-full border p-2 rounded"
          placeholder="Medicine Name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Dosage (e.g., 500mg)"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
        />
        <input
          type="time"
          className="w-full border p-2 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button
          onClick={handleAddReminder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Reminder
        </button>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Your Reminders</h2>

        {reminders.length === 0 && (
          <p className="text-gray-500">No reminders yet.</p>
        )}

        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="border p-3 rounded mb-2"
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
