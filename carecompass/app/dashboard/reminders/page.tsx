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
import { useSearchParams, useRouter } from "next/navigation";

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes?: string[];
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

export default function ReminderPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [doseTimes, setDoseTimes] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  // 🔧 ORIGINAL Editing States (UNCHANGED)
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

  useEffect(() => {
    const medFromQuery = searchParams.get("medicine");
    if (medFromQuery) {
      setMedicineName(medFromQuery);
    }
  }, [searchParams]);

  // ⏰ Countdown Timer (UNCHANGED)
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

  // 🆕 MISSED DOSE DETECTION (UNCHANGED)
  const getDoseStatus = (reminder: Reminder, t: string) => {
    const now = new Date();
    const [h, m] = t.split(":").map(Number);

    const doseTime = new Date();
    doseTime.setHours(h, m, 0, 0);

    const todayKey = `${today}_${t}`;
    const isTaken =
      reminder.takenTimes?.includes(todayKey) ||
      reminder.takenTimes?.includes(t);

    if (isTaken) return "taken";
    if (now.getTime() > doseTime.getTime()) return "missed";
    return "upcoming";
  };

  const handleAddDoseTime = () => {
    if (!time || doseTimes.includes(time)) return;
    setDoseTimes((prev) => [...prev, time]);
    setTime("");
  };

  const removeDoseTime = (t: string) => {
    setDoseTimes((prev) => prev.filter((dt) => dt !== t));
  };

  // 🔥 MULTI-DOSE (UNCHANGED)
  const handleAddReminder = async () => {
    if (!user || !medicineName || doseTimes.length === 0) return;

    await addReminder(user.uid, medicineName, dosage, doseTimes);

    setMedicineName("");
    setDosage("");
    setTime("");
    setDoseTimes([]);
    loadReminders();
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    loadReminders();
  };

  // 🔥 ORIGINAL daily check (UNCHANGED)
  const isDoseTakenToday = (reminder: Reminder, t: string) => {
    const todayKey = `${today}_${t}`;
    return (
      reminder.takenTimes?.includes(todayKey) ||
      reminder.takenTimes?.includes(t)
    );
  };

  const handleMarkTaken = async (reminder: Reminder, t: string) => {
    const todayKey = `${today}_${t}`;

    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id
          ? {
              ...r,
              takenTimes: [...(r.takenTimes || []), todayKey],
            }
          : r
      )
    );

    try {
      await markDoseTaken(
        reminder.id,
        todayKey,
        reminder.takenTimes || []
      );
    } catch (error) {
      console.error("Failed to mark dose as taken:", error);
      loadReminders();
    }
  };

  // 🧠 Describe navigation (UNCHANGED)
  const handleDescribeMedicine = (name: string) => {
    router.push(`/dashboard/medicine?name=${encodeURIComponent(name)}`);
  };

  // ✏️ ORIGINAL EDIT LOGIC (UNCHANGED)
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

  // ⏰ ORIGINAL TIME EDIT (UNCHANGED)
  const startEditTime = (reminderId: string, currentTime: string) => {
    setEditingTimeKey(`${reminderId}-${currentTime}`);
    setEditTimeValue(currentTime);
  };

  const saveTimeEdit = async (reminder: Reminder, oldTime: string) => {
    const updatedTimes = reminder.times.map((t) =>
      t === oldTime ? editTimeValue : t
    );

    await updateReminder(reminder.id, { times: updatedTimes });

    setEditingTimeKey(null);
    setEditTimeValue("");
    loadReminders();
  };

  const cancelTimeEdit = () => {
    setEditingTimeKey(null);
    setEditTimeValue("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Header (UI ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-emerald-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
            ⏰ Smart Medicine Reminders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">
            Manage multi-dose schedules, track adherence, and never miss a
            medication with intelligent daily reminder tracking.
          </p>
        </div>
      </div>

      {/* 💊 Add Reminder Card (POLISHED UI ONLY) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6">
          Add New Medicine Reminder
        </h2>

        <div className="grid gap-5">
          <input
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Medicine Name (e.g., Paracetamol)"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />

          <input
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="Dosage (e.g., 500mg after meal)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />

          {/* Dose Time Section */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="time"
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <button
              onClick={handleAddDoseTime}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition"
            >
              Add Dose Time
            </button>
          </div>

          {/* Dose Chips (UI only) */}
          {doseTimes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {doseTimes.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold"
                >
                  ⏰ {t}
                  <button
                    onClick={() => removeDoseTime(t)}
                    className="text-red-500 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleAddReminder}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white px-6 py-4 rounded-2xl font-semibold shadow-xl hover:opacity-90 transition text-lg"
          >
            + Create Smart Reminder
          </button>
        </div>
      </div>

      {/* 🩺 Reminders List (UI POLISHED — LOGIC UNTOUCHED) */}
      <div className="space-y-6">
        {reminders.length === 0 && (
          <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No reminders added yet. Start by creating your first medicine schedule.
            </p>
          </div>
        )}

        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-7 rounded-3xl shadow-xl backdrop-blur-xl"
          >
            {/* TOP SECTION (UNCHANGED LOGIC) */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                {editingId === reminder.id ? (
                  <div className="space-y-3">
                    <input
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
                      value={editMedicine}
                      onChange={(e) => setEditMedicine(e.target.value)}
                    />
                    <input
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold">
                      💊 {reminder.medicineName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {reminder.dosage || "No dosage specified"}
                    </p>
                  </>
                )}
              </div>

              {/* BUTTONS — LOGIC UNCHANGED */}
              <div className="flex gap-2 ml-4 flex-wrap">
                <button
                  onClick={() =>
                    handleDescribeMedicine(reminder.medicineName)
                  }
                  className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-semibold hover:opacity-90 transition"
                >
                  Describe
                </button>

                {editingId === reminder.id ? (
                  <button
                    onClick={saveReminderEdit}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-semibold shadow"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEditReminder(reminder)}
                    className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 rounded-full text-xs font-semibold"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="px-4 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-full text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* DOSE TIMES — LOGIC 100% UNCHANGED */}
            <div className="grid md:grid-cols-2 gap-4">
              {reminder.times.map((t) => {
                const key = `${reminder.id}-${t}`;
                const status = getDoseStatus(reminder, t);
                const isTaken = status === "taken";

                return (
                  <div
                    key={key}
                    className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-lg">
                        ⏰ {t}
                      </p>

                      {status === "missed" && (
                        <p className="text-red-500 text-xs font-semibold">
                          🔴 Missed Dose
                        </p>
                      )}
                      {status === "upcoming" && (
                        <p className="text-amber-500 text-xs">
                          ⏳ Upcoming
                        </p>
                      )}
                      {status === "taken" && (
                        <p className="text-emerald-500 text-xs font-semibold">
                          ✅ Taken Today
                        </p>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Next dose in {countdowns[key] || "Calculating..."}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {editingTimeKey === key ? (
                        <>
                          <input
                            type="time"
                            value={editTimeValue}
                            onChange={(e) =>
                              setEditTimeValue(e.target.value)
                            }
                            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg"
                          />
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
                            className="px-3 py-1 bg-gray-500 text-white rounded-full text-xs"
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
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full text-xs font-semibold"
                          >
                            Edit Time
                          </button>

                          <button
                            onClick={() =>
                              handleMarkTaken(reminder, t)
                            }
                            disabled={isTaken}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                              isTaken
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
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
  );
}