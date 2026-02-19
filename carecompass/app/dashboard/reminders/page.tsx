"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addReminder,
  getUserReminders,
  deleteReminder,
  markDoseTaken,
  updateReminder,
} from "@/services/reminderService";

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes?: string[];
}

const getTodayKey = () =>
  new Date().toISOString().split("T")[0];

export default function ReminderPage() {
  const { user } = useAuth();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMedicine, setEditMedicine] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editingTimeKey, setEditingTimeKey] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState("");

  const today = getTodayKey();

  const loadReminders = async () => {
    if (!user) return;
    const data = await getUserReminders(user.uid);
    setReminders(data as Reminder[]);
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  // ⏰ Countdown Timer (UNCHANGED LOGIC)
  useEffect(() => {
    const calculateCountdowns = () => {
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
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 60000);
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

  // 🔥 DAILY RESET FIX (UI side only — no schema change)
  const isDoseTakenToday = (
    reminder: Reminder,
    reminderTime: string
  ) => {
    const key = `${today}_${reminderTime}`;
    return reminder.takenTimes?.includes(key);
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

  // ✏️ Edit Reminder
  const startEditReminder = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditMedicine(reminder.medicineName);
    setEditDosage(reminder.dosage || "");
  };

  const saveReminderEdit = async () => {
    if (!editingId) return;

    await updateReminder(editingId, {
      medicineName: editMedicine,
      dosage: editDosage,
    });

    setEditingId(null);
    loadReminders();
  };

  // ⏰ Edit Time
  const startEditTime = (
    reminderId: string,
    currentTime: string
  ) => {
    setEditingTimeKey(`${reminderId}-${currentTime}`);
    setEditTimeValue(currentTime);
  };

  const saveTimeEdit = async (
    reminder: Reminder,
    oldTime: string
  ) => {
    const updatedTimes = reminder.times.map((t) =>
      t === oldTime ? editTimeValue : t
    );

    await updateReminder(reminder.id, {
      times: updatedTimes,
    });

    setEditingTimeKey(null);
    setEditTimeValue("");
    loadReminders();
  };

  const cancelTimeEdit = () => {
    setEditingTimeKey(null);
    setEditTimeValue("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Smart Medicine Reminders
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          Manage medicines, edit times, track doses, and never miss a schedule.
        </p>
      </div>

      {/* Add Reminder */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">
          Add New Reminder
        </h2>

        <div className="grid gap-5">
          <input
            className="border p-3.5 rounded-xl"
            placeholder="Medicine Name"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />

          <input
            className="border p-3.5 rounded-xl"
            placeholder="Dosage (Optional)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />

          <input
            type="time"
            className="border p-3.5 rounded-xl"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button
            onClick={handleAddReminder}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg"
          >
            + Add Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6">
          Your Active Reminders ({reminders.length})
        </h2>

        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border p-5 rounded-2xl shadow"
            >
              {/* Top Row */}
              <div className="flex justify-between items-center">
                <div>
                  {editingId === reminder.id ? (
                    <>
                      <input
                        className="border p-2 rounded-lg mb-2"
                        value={editMedicine}
                        onChange={(e) =>
                          setEditMedicine(e.target.value)
                        }
                      />
                      <input
                        className="border p-2 rounded-lg"
                        value={editDosage}
                        onChange={(e) =>
                          setEditDosage(e.target.value)
                        }
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-lg">
                        {reminder.medicineName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reminder.dosage || "No dosage specified"}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingId === reminder.id ? (
                    <button
                      onClick={saveReminderEdit}
                      className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditReminder(reminder)}
                      className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Times Section */}
              <div className="mt-4 space-y-3">
                {reminder.times?.map((t) => {
                  const key = `${reminder.id}-${t}`;
                  const isTaken = isDoseTakenToday(reminder, t);

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 border p-4 rounded-xl"
                    >
                      <div>
                        {editingTimeKey === key ? (
                          <input
                            type="time"
                            value={editTimeValue}
                            onChange={(e) =>
                              setEditTimeValue(e.target.value)
                            }
                            className="border p-2 rounded-lg"
                          />
                        ) : (
                          <p className="font-medium">⏰ {t}</p>
                        )}

                        <p className="text-xs text-gray-500">
                          Next dose in{" "}
                          {countdowns[key] || "Calculating..."}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {editingTimeKey === key ? (
                          <>
                            <button
                              onClick={() =>
                                saveTimeEdit(reminder, t)
                              }
                              className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelTimeEdit}
                              className="px-3 py-1 bg-gray-400 text-white rounded-full text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                startEditTime(reminder.id, t)
                              }
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                            >
                              Edit Time
                            </button>

                            <button
                              onClick={() =>
                                handleMarkTaken(reminder, t)
                              }
                              disabled={isTaken}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                                isTaken
                                  ? "bg-emerald-200 text-emerald-700"
                                  : "bg-emerald-500 text-white hover:bg-emerald-600"
                              }`}
                            >
                              {isTaken ? "Taken ✓" : "Mark as Taken"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
