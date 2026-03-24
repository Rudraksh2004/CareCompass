"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addReminder,
  getUserReminders,
  deleteReminder,
  markDoseTaken,
  updateReminder,
} from "@/services/reminderService";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Bell, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Activity, 
  Settings2, 
  Pill, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  X,
  Edit3,
  Check
} from "lucide-react";

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes?: string[];
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

export default function ReminderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse">Initializing Chrono-Engine...</div>}>
      <ReminderContent />
    </Suspense>
  );
}

function ReminderContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [doseTimes, setDoseTimes] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [adherence, setAdherence] = useState(0);

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

  useEffect(() => {
    const calculateCountdowns = () => {
      const updated: Record<string, string> = {};
      let totalDosesToday = 0;
      let takenDosesToday = 0;

      reminders.forEach((reminder) => {
        reminder.times?.forEach((t) => {
          totalDosesToday++;
          if (isDoseTakenToday(reminder, t)) {
            takenDosesToday++;
          }

          const now = new Date();
          const [h, m] = t.split(":").map(Number);
          const nextDose = new Date();
          nextDose.setHours(h, m, 0, 0);

          if (nextDose.getTime() <= now.getTime()) {
            nextDose.setDate(nextDose.getDate() + 1);
          }

          const diff = nextDose.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          updated[`${reminder.id}-${t}`] = `${hours}h ${minutes}m`;
        });
      });

      setCountdowns(updated);
      if (totalDosesToday > 0) {
        setAdherence(Math.round((takenDosesToday / totalDosesToday) * 100));
      } else {
        setAdherence(100);
      }
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const getDoseStatus = (reminder: Reminder, t: string) => {
    const now = new Date();
    const [h, m] = t.split(":").map(Number);
    const doseTime = new Date();
    doseTime.setHours(h, m, 0, 0);

    const todayKey = `${today}_${t}`;
    const isTaken = reminder.takenTimes?.includes(todayKey) || reminder.takenTimes?.includes(t);

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

  const isDoseTakenToday = (reminder: Reminder, t: string) => {
    const todayKey = `${today}_${t}`;
    return reminder.takenTimes?.includes(todayKey) || reminder.takenTimes?.includes(t);
  };

  const handleMarkTaken = async (reminder: Reminder, t: string) => {
    const todayKey = `${today}_${t}`;
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id
          ? { ...r, takenTimes: [...(r.takenTimes || []), todayKey] }
          : r
      )
    );

    if (!user) return;
    try {
      await markDoseTaken(user.uid, reminder.id, todayKey, reminder.takenTimes || []);
    } catch (error) {
      console.error("Failed to mark dose as taken:", error);
      loadReminders();
    }
  };

  const handleDescribeMedicine = (name: string) => {
    router.push(`/dashboard/medicine?name=${encodeURIComponent(name)}`);
  };

  const startEditReminder = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditMedicine(reminder.medicineName);
    setEditDosage(reminder.dosage || "");
  };

  const saveReminderEdit = async () => {
    if (!editingId || !user) return;
    await updateReminder(user.uid, editingId, { medicineName: editMedicine, dosage: editDosage });
    setEditingId(null);
    loadReminders();
  };

  const startEditTime = (reminderId: string, currentTime: string) => {
    setEditingTimeKey(`${reminderId}-${currentTime}`);
    setEditTimeValue(currentTime);
  };

  const saveTimeEdit = async (reminder: Reminder, oldTime: string) => {
    const updatedTimes = reminder.times.map((t) => t === oldTime ? editTimeValue : t);
    if (!user) return;
    await updateReminder(user.uid, reminder.id, { times: updatedTimes });
    setEditingTimeKey(null);
    setEditTimeValue("");
    loadReminders();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Ultra-Premium Dashboard Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-blue-500/30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[100px] -ml-40 -mb-40" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
                <Bell size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                Adherence Tracker
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-xl text-lg leading-relaxed">
              Precision medication management with behavioral adherence analytics. Ensure therapeutic continuity through multi-dose temporal tracking.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-8 py-5 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Daily Adherence</p>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000" style={{ width: `${adherence}%` }} />
                </div>
                <span className="text-[10px] font-black text-blue-500 mt-2 uppercase">{adherence}% COMPLIANCE</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* 📋 Configuration Panel */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative group overflow-hidden rounded-[3rem] border border-white/60 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[60px] p-8 shadow-xl transition-all h-full">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <Settings2 className="text-blue-500" size={24} />
                <h2 className="text-2xl font-black tracking-tighter">Schedule Setup</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Medication Name</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 pl-12 pr-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g., Metformin..."
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Dosage Instructions</label>
                  <input
                    className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 px-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g., 500mg daily..."
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Temporal Markers</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      className="flex-1 bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 px-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                    <button
                      onClick={handleAddDoseTime}
                      className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {doseTimes.map((t) => (
                      <div key={t} className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-2 font-black text-xs animate-in zoom-in-95">
                        <Clock size={12} /> {t}
                        <button onClick={() => removeDoseTime(t)}><X size={12} className="text-red-500" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddReminder}
                  className="w-full bg-gray-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3"
                >
                  INITIALIZE TRACKING <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 📅 Active Regimens */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Calendar className="text-blue-600" size={24} />
              <h2 className="text-3xl font-black tracking-tighter">Clinical Regimen</h2>
            </div>
            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sync Active</span>
            </div>
          </div>

          {reminders.length === 0 ? (
            <div className="border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-white/[0.02] backdrop-blur-2xl p-20 rounded-[3rem] text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto text-gray-300">
                 <Pill size={48} />
              </div>
              <p className="text-gray-400 font-bold text-xl italic">No pharmacological schedules detected.</p>
            </div>
          ) : (
            <div className="grid gap-10">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="relative group border border-white/80 dark:border-white/[0.05] bg-white/[0.6] dark:bg-[#030712]/40 backdrop-blur-[60px] p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                     <Pill size={120} />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 dark:border-white/5 pb-8">
                      <div className="flex gap-6 items-start">
                         {/* Medicine-specific Adherence Ring */}
                         <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle
                                  cx="32" cy="32" r="28"
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  className="text-gray-100 dark:text-white/5"
                               />
                               <circle
                                  cx="32" cy="32" r="28"
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  strokeDasharray={176}
                                  strokeDashoffset={176 - (176 * (reminder.times.filter(t => isDoseTakenToday(reminder, t)).length / reminder.times.length))}
                                  className="text-blue-500 transition-all duration-1000"
                                  strokeLinecap="round"
                               />
                            </svg>
                            <span className="absolute text-[10px] font-black text-blue-500">
                               {Math.round((reminder.times.filter(t => isDoseTakenToday(reminder, t)).length / reminder.times.length) * 100)}%
                            </span>
                         </div>

                         <div className="space-y-2">
                           {editingId === reminder.id ? (
                              <div className="flex flex-col gap-3">
                                 <input 
                                   value={editMedicine} 
                                   onChange={e => setEditMedicine(e.target.value)} 
                                   className="text-3xl font-black bg-transparent border-b-2 border-blue-500 outline-none" 
                                 />
                                 <input 
                                   value={editDosage} 
                                   onChange={e => setEditDosage(e.target.value)} 
                                   className="text-gray-500 font-bold bg-transparent border-b border-white/10 outline-none" 
                                 />
                              </div>
                           ) : (
                             <>
                               <h3 className="text-3xl font-black tracking-tighter">
                                 {reminder.medicineName}
                               </h3>
                               <div className="flex items-center gap-3">
                                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Active Regimen</span>
                                  <p className="text-gray-500 font-bold italic">{reminder.dosage || "Generic regimen"}</p>
                               </div>
                             </>
                           )}
                         </div>
                      </div>

                      <div className="flex gap-4 self-end md:self-center">
                        <button onClick={() => handleDescribeMedicine(reminder.medicineName)} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white transition-all text-blue-500 border border-white/80 dark:border-white/10 group/btn">
                           <ShieldCheck size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        {editingId === reminder.id ? (
                           <button onClick={saveReminderEdit} className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"><Check size={20} /></button>
                        ) : (
                           <button onClick={() => startEditReminder(reminder)} className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"><Edit3 size={20} /></button>
                        )}
                        <button onClick={() => handleDelete(reminder.id)} className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {reminder.times.map((t) => {
                        const key = `${reminder.id}-${t}`;
                        const status = getDoseStatus(reminder, t);
                        const isTaken = status === "taken";

                        return (
                          <div key={key} className={`group/time relative p-8 rounded-[2rem] border transition-all duration-500 ${isTaken ? "bg-emerald-500/5 border-emerald-500/20" : status === "missed" ? "bg-red-500/5 border-red-500/20 shadow-inner" : "bg-white/40 dark:bg-white/[0.02] border-white/80 dark:border-white/5 shadow-inner"}`}>
                            <div className="flex justify-between items-center h-full">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                   <Clock size={20} className={isTaken ? "text-emerald-500" : "text-blue-500"} />
                                   {editingTimeKey === key ? (
                                      <div className="flex items-center gap-2">
                                        <input type="time" value={editTimeValue} onChange={e => setEditTimeValue(e.target.value)} className="bg-transparent text-2xl font-black outline-none border-b-2 border-blue-500" autoFocus />
                                        <button onClick={() => saveTimeEdit(reminder, t)} className="p-2 rounded-lg bg-emerald-500 text-white shadow-lg"><Check size={16} /></button>
                                      </div>
                                   ) : (
                                      <div className="flex items-center gap-3">
                                        <h4 className="text-2xl font-black tracking-tighter cursor-pointer" onDoubleClick={() => startEditTime(reminder.id, t)}>{t}</h4>
                                        {!isTaken && (
                                          <button 
                                            onClick={() => startEditTime(reminder.id, t)}
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all opacity-0 group-hover/time:opacity-100"
                                            title="Edit Time"
                                          >
                                            <Edit3 size={14} />
                                          </button>
                                        )}
                                      </div>
                                   )}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  {status === "missed" && (
                                     <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest"><AlertCircle size={12} /> Critical Overdue</div>
                                  )}
                                  {status === "upcoming" && (
                                     <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest"><TrendingUp size={12} /> Next in {countdowns[key]}</div>
                                  )}
                                  {status === "taken" && (
                                     <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={12} /> Adherence Verified</div>
                                  )}
                                </div>
                              </div>

                              {!isTaken && (
                                 <button onClick={() => handleMarkTaken(reminder, t)} className="px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                                    TAKEN
                                 </button>
                              )}
                              {isTaken && (
                                 <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 size={24} strokeWidth={3} />
                                 </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📊 Adherence Analytics Snapshot */}
      <div className="relative group overflow-hidden rounded-[3rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.8] dark:bg-[#030712]/60 backdrop-blur-[60px] p-16 shadow-2xl transition-all duration-700">
         <div className="relative z-10 grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-blue-500">
                  <Activity size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Behavioral Sync</h3>
               </div>
               <p className="text-gray-500 font-bold leading-relaxed text-sm">Adherence metrics are synchronized with your clinical profile for AI disease prediction accuracy.</p>
            </div>
            
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3 text-emerald-500">
                  <Stethoscope size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Clinical Integrity</h3>
               </div>
               <p className="text-gray-500 font-bold leading-relaxed text-sm">Consistent medication timing reduces physiological variability and improves prognostic outcomes.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Protocol Adherence</span>
               <span className="text-6xl font-black italic">{adherence}%</span>
               <span className="text-[10px] font-black uppercase tracking-widest mt-4">Verified Continuity</span>
            </div>
         </div>
      </div>
    </div>
  );
}