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
    if (!user) return;
    await deleteReminder(user.uid, id);
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

    if (!user) return;
    try {
      await markDoseTaken(
        user.uid,
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
    if (!editingId || !user) return;

    await updateReminder(user.uid, editingId, {
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

    if (!user) return;
    await updateReminder(user.uid, reminder.id, { times: updatedTimes });

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
      {/* 🌟 Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-emerald-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
            ⏰ Smart Medicine Reminders
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-bold mt-4 text-sm max-w-2xl leading-relaxed">
            Manage multi-dose schedules, track adherence, and never miss a medication with intelligent daily reminder tracking.
          </p>
        </div>
      </div>

      {/* 💊 Add Reminder Card */}
      <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm mb-6">
          Add New Medicine Reminder
        </h2>

        <div className="grid gap-5">
          <input
            className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
            placeholder="Medicine Name (e.g., Paracetamol)"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />

          <input
            className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
            placeholder="Dosage (e.g., 500mg after meal)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />

          {/* Dose Time Section */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="time"
              className="border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner md:w-48 appearance-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <button
              onClick={handleAddDoseTime}
              className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 backdrop-blur-md px-8 py-4 rounded-2xl font-black transition-all"
            >
              Add Dose Time
            </button>
          </div>

          {/* Dose Chips */}
          {doseTimes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {doseTimes.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-black shadow-sm"
                >
                  ⏰ {t}
                  <button
                    onClick={() => removeDoseTime(t)}
                    className="text-red-500 hover:text-red-600 text-xs font-bold bg-white/50 dark:bg-black/20 rounded-full w-5 h-5 flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleAddReminder}
            className="mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all text-white px-6 py-4 rounded-2xl font-black shadow-lg text-lg w-full md:w-auto self-start"
          >
            + Create Smart Reminder
          </button>
        </div>
      </div>

      {/* 🩺 Reminders List  */}
      <div className="space-y-6">
        {reminders.length === 0 && (
          <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-3xl dark:border-gray-800">
            <p className="text-gray-500 font-bold">
              No reminders added yet. Start by creating your first medicine schedule.
            </p>
          </div>
        )}

        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-7 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500"
          >
            {/* TOP SECTION */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                {editingId === reminder.id ? (
                  <div className="space-y-3">
                    <input
                      className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner"
                      value={editMedicine}
                      onChange={(e) => setEditMedicine(e.target.value)}
                    />
                    <input
                      className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                      💊 {reminder.medicineName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-bold mt-1">
                      {reminder.dosage || "No dosage specified"}
                    </p>
                  </>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 ml-4 flex-wrap select-none mt-1 md:mt-0">
                <button
                  onClick={() => handleDescribeMedicine(reminder.medicineName)}
                  className="px-4 py-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  Describe
                </button>

                {editingId === reminder.id ? (
                  <button
                    onClick={saveReminderEdit}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg transition hover:-translate-y-1"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEditReminder(reminder)}
                    className="px-4 py-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="px-4 py-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-black shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* DOSE TIMES */}
            <div className="grid md:grid-cols-2 gap-5">
              {reminder.times.map((t) => {
                const key = `${reminder.id}-${t}`;
                const status = getDoseStatus(reminder, t);
                const isTaken = status === "taken";

                return (
                  <div
                    key={key}
                    className="relative border border-white/60 dark:border-white/[0.05] bg-white/40 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl flex items-center justify-between shadow-inner transition-all hover:bg-white/60 dark:hover:bg-black/30"
                  >
                    <div>
                      <p className="font-black text-xl text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        ⏰ {t}
                      </p>

                      <div className="mt-2 space-y-1">
                        {status === "missed" && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20">
                            🔴 Missed Dose
                          </span>
                        )}
                        {status === "upcoming" && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                            ⏳ Upcoming
                          </span>
                        )}
                        {status === "taken" && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            ✅ Taken Today
                          </span>
                        )}
                        
                        {!isTaken && (
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
                            Next in: {countdowns[key] || "..."}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      {editingTimeKey === key ? (
                        <div className="flex gap-2 isolate">
                          <input
                            type="time"
                            value={editTimeValue}
                            onChange={(e) => setEditTimeValue(e.target.value)}
                            className="border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200"
                          />
                          <button
                            onClick={() => saveTimeEdit(reminder, t)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelTimeEdit}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-xs font-black shadow transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap sm:flex-nowrap justify-end mt-2 md:mt-0">
                          <button
                            onClick={() => startEditTime(reminder.id, t)}
                            className="px-4 py-2.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-300 rounded-xl text-xs font-black shadow-sm hover:-translate-y-0.5 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleMarkTaken(reminder, t)}
                            disabled={isTaken}
                            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all border ${
                              isTaken
                                ? "bg-black/5 dark:bg-white/5 border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                                : "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 dark:border-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-lg"
                            }`}
                          >
                            {isTaken ? "Taken ✓" : "Mark Taken"}
                          </button>
                        </div>
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