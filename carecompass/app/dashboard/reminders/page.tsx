"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addReminder,
  getUserReminders,
  deleteReminder,
  markDoseTaken,
} from "@/services/reminderService";

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes?: string[];
}

export default function ReminderPage() {
  const { user } = useAuth();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  const loadReminders = async () => {
    if (!user) return;
    const data = await getUserReminders(user.uid);
    setReminders(data as Reminder[]);
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  // ⏰ Live Countdown Timer for each reminder time
  useEffect(() => {
    const interval = setInterval(() => {
      const updated: Record<string, string> = {};

      reminders.forEach((reminder) => {
        reminder.times?.forEach((t) => {
          const now = new Date();
          const [h, m] = t.split(":").map(Number);

          const nextDose = new Date();
          nextDose.setHours(h, m, 0, 0);

          if (nextDose.getTime() <= now.getTime()) {
            nextDose.setDate(nextDose.getDate() + 1);
          }

          const diff = nextDose.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60)
          );

          updated[`${reminder.id}-${t}`] = `${hours}h ${minutes}m`;
        });
      });

      setCountdowns(updated);
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const handleAddReminder = async () => {
    if (!user || !medicineName || !time) return;

    await addReminder(user.uid, medicineName, dosage, time);

    setMedicineName("");
    setDosage("");
    setTime("");
    loadReminders();
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    loadReminders();
  };

  const handleMarkTaken = async (
    reminder: Reminder,
    reminderTime: string
  ) => {
    await markDoseTaken(
      reminder.id,
      reminderTime,
      reminder.takenTimes || []
    );
    loadReminders();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header (UNCHANGED STYLE) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <div className="relative">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Medicine Reminders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm max-w-xl">
            Schedule, manage, and stay consistent with your daily medications
            using your personal CareCompass reminder system.
          </p>
        </div>
      </div>

      {/* 💊 Add Reminder Card (SAME PREMIUM UI) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">💊</div>
          <h2 className="text-xl font-semibold">
            Add New Reminder
          </h2>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Medicine Name
            </label>
            <input
              className="w-full mt-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., Paracetamol"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Dosage (Optional)
            </label>
            <input
              className="w-full mt-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="e.g., 500mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Reminder Time
            </label>
            <input
              type="time"
              className="w-full mt-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <button
            onClick={handleAddReminder}
            className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            + Add Reminder
          </button>
        </div>
      </div>

      {/* 📋 Reminders List (PREMIUM + ADVANCED FEATURES) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Your Active Reminders
          </h2>

          <div className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 font-medium">
            {reminders.length} Active
          </div>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-4">⏰</div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              No Reminders Yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Add your first medicine reminder to stay consistent with your treatment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="group bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl transition-all hover:shadow-lg hover:scale-[1.01]"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg shadow-md">
                      💊
                    </div>

                    <div>
                      <p className="font-semibold text-lg">
                        {reminder.medicineName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reminder.dosage || "No dosage specified"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-xs px-4 py-1.5 rounded-full font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:scale-105 transition"
                  >
                    Delete
                  </button>
                </div>

                {/* Times + Countdown + Taken */}
                <div className="mt-4 space-y-3">
                  {reminder.times?.map((t) => {
                    const isTaken =
                      reminder.takenTimes?.includes(t);

                    return (
                      <div
                        key={t}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl"
                      >
                        <div>
                          <p className="font-medium">
                            ⏰ {t}
                          </p>
                          <p className="text-xs text-gray-500">
                            Next dose in{" "}
                            {countdowns[
                              `${reminder.id}-${t}`
                            ] || "Calculating..."}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleMarkTaken(reminder, t)
                          }
                          disabled={isTaken}
                          className={`text-xs px-4 py-1.5 rounded-full font-semibold transition ${
                            isTaken
                              ? "bg-emerald-200 text-emerald-700 cursor-not-allowed"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow"
                          }`}
                        >
                          {isTaken ? "Taken ✓" : "Mark as Taken"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
