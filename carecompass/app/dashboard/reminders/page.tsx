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
    if (!user || !medicineName || !time) return;

    await addReminder(user.uid, medicineName, dosage, time);

    setMedicineName("");
    setDosage("");
    setTime("");

    loadReminders();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Medicine Reminders
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Schedule and manage your daily medication reminders.
        </p>
      </div>

      {/* Add Reminder Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-lg font-semibold mb-4">
          Add New Reminder
        </h2>

        <div className="grid gap-4">
          <input
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Medicine Name (e.g., Paracetamol)"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />

          <input
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dosage (e.g., 500mg)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />

          <input
            type="time"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button
            onClick={handleAddReminder}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl font-medium shadow-sm disabled:opacity-50"
          >
            Add Reminder
          </button>
        </div>
      </div>

      {/* Reminders List Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-4">
          Your Reminders
        </h2>

        {reminders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No reminders yet. Add your first medicine reminder above.
          </p>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-4 rounded-xl transition-colors"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {reminder.medicineName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {reminder.dosage
                      ? `${reminder.dosage} • `
                      : ""}
                    {reminder.time}
                  </p>
                </div>

                <div className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-3 py-1 rounded-full font-medium">
                  Active
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
