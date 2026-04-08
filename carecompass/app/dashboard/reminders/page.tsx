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
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4">
      {/* 🔮 LUMINA CHRONO-HEADER */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-ghost-border bg-surface-container-low/40 backdrop-blur-[60px] p-8 md:p-14 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] -mr-80 -mt-80 animate-vital-pulse" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
               <div className="p-4 rounded-2xl bg-accent-primary/10 text-accent-primary shadow-inner border border-ghost-border">
                  <Bell className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
               </div>
               <div className="flex flex-col">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary italic">
                    Chrono <span className="text-accent-primary">Adherence</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-2 h-2 rounded-full bg-accent-primary animate-vital-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Temporal Sync Active</span>
                  </div>
               </div>
            </div>
            <p className="text-text-secondary font-bold text-lg md:text-xl max-w-2xl leading-relaxed italic">
               Precision medication management with behavioral adherence analytics. Ensure therapeutic continuity through multi-dose temporal tracking.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col items-center md:items-end gap-4">
             <div className="card-biometric bg-surface-container-high/40 border-ghost-border p-6 md:p-8 flex flex-col items-center md:items-end min-w-[240px]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4 italic">Global Compliance</p>
                <div className="w-full h-2.5 bg-surface-base rounded-full overflow-hidden border border-ghost-border mb-3">
                   <div className="h-full bg-gradient-to-r from-accent-primary to-accent-emerald transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${adherence}%` }} />
                </div>
                <div className="flex items-center gap-3">
                   <Activity size={14} className="text-accent-primary" />
                   <span className="text-2xl font-black italic text-text-primary">{adherence}% <span className="text-[10px] not-italic uppercase tracking-widest text-accent-emerald">Synced</span></span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* 📋 Configuration Panel */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
          <div className="card-biometric p-8 md:p-10 space-y-10 group overflow-visible">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary border border-ghost-border">
                    <Settings2 size={24} />
                 </div>
                 <h2 className="text-2xl font-black tracking-tighter text-text-primary uppercase italic">Schedule Setup</h2>
              </div>
              <Pill className="text-text-muted/10 group-hover:text-accent-primary/10 transition-colors" size={40} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4 group/field">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 flex items-center gap-3 italic">
                   <Pill size={14} className="text-accent-primary" /> Medication Name
                </label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within/field:text-accent-primary transition-colors" size={18} />
                  <input
                    className="input-void pl-14 pr-6 py-5 text-sm italic"
                    placeholder="Enter clinical identifier..."
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 group/field">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 flex items-center gap-3 italic">
                   <Activity size={14} className="text-accent-indigo" /> Dosage Instructions
                </label>
                <input
                  className="input-void px-6 py-5 text-sm italic"
                  placeholder="e.g., 500mg therapeutic dose..."
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>

              <div className="space-y-4 group/field">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 flex items-center gap-3 italic">
                   <Clock size={14} className="text-accent-emerald" /> Temporal Markers
                </label>
                <div className="flex gap-4">
                  <input
                    type="time"
                    className="input-void flex-1 px-6 py-5 text-center text-lg font-black italic appearance-none"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <button
                    onClick={handleAddDoseTime}
                    className="p-5 rounded-2xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald hover:text-white transition-all shadow-xl shadow-accent-emerald/10 scale-100 hover:scale-105 active:scale-95"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {doseTimes.map((t) => (
                    <div key={t} className="chip-vital bg-accent-primary/10 text-accent-primary border-accent-primary/20 py-2.5 px-4 animate-in zoom-in-95 group/pill">
                      <Clock size={12} strokeWidth={3} /> 
                      <span className="font-black italic">{t}</span>
                      <button onClick={() => removeDoseTime(t)} className="ml-1 hover:text-accent-rose transition-colors">
                         <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddReminder}
                className="btn-gem w-full py-6 text-base tracking-[0.2em] shadow-2xl shadow-accent-primary/20"
              >
                <span className="flex items-center justify-center gap-3 italic">
                   INITIALIZE TRACKING <ChevronRight size={20} strokeWidth={3} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 📅 Active Regimens */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-10">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
                  <Calendar size={24} />
               </div>
               <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-text-primary uppercase italic">Clinical Regimen</h2>
            </div>
            <div className="chip-vital bg-surface-container-high/40 border-ghost-border px-6 py-3">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-vital-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Live Sync</span>
            </div>
          </div>

          {!reminders || reminders.length === 0 ? (
            <div className="card-biometric p-14 md:p-24 text-center space-y-8">
              <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mx-auto text-text-muted/20 border border-ghost-border shadow-inner">
                 <Pill className="w-12 h-12" />
              </div>
              <div>
                <p className="text-text-primary font-black text-2xl uppercase italic tracking-tighter">System Idle</p>
                <p className="text-text-muted font-bold text-sm italic mt-2">No pharmacological schedules detected in current timeline.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:gap-10">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="card-biometric p-8 md:p-12 hover:shadow-2xl transition-all duration-700 overflow-hidden group/regimen">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/regimen:opacity-10 transition-opacity">
                     <Pill size={160} />
                  </div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-ghost-border pb-10">
                      <div className="flex gap-8 items-start">
                         <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle
                                  cx="40" cy="40" r="36"
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  className="text-surface-container-low"
                               />
                               <circle
                                  cx="40" cy="40" r="36"
                                  fill="transparent"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  strokeDasharray={226}
                                  strokeDashoffset={226 - (226 * (reminder.times.filter(t => isDoseTakenToday(reminder, t)).length / reminder.times.length))}
                                  className="text-accent-primary transition-all duration-1000"
                                  strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-xs font-black text-accent-primary italic">
                               {Math.round((reminder.times.filter(t => isDoseTakenToday(reminder, t)).length / reminder.times.length) * 100)}%
                            </span>
                         </div>

                         <div className="space-y-3">
                           {editingId === reminder.id ? (
                              <div className="flex flex-col gap-4">
                                 <input 
                                   value={editMedicine} 
                                   onChange={e => setEditMedicine(e.target.value)} 
                                   className="text-3xl font-black bg-transparent border-b-2 border-accent-primary outline-none italic text-text-primary" 
                                 />
                                 <input 
                                   value={editDosage} 
                                   onChange={e => setEditDosage(e.target.value)} 
                                   className="text-text-secondary font-bold bg-transparent border-b border-ghost-border outline-none italic" 
                                 />
                              </div>
                           ) : (
                              <div className="flex flex-col">
                                <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-text-primary italic leading-none">
                                  {reminder.medicineName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                   <div className="chip-vital">
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-primary">Protocol Active</span>
                                   </div>
                                   <p className="text-text-secondary font-bold italic text-sm md:text-lg">{reminder.dosage || "Generic therapeutic regimen"}</p>
                                </div>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="flex gap-4 self-end md:self-center">
                        <button onClick={() => handleDescribeMedicine(reminder.medicineName)} className="p-4 rounded-[1.5rem] bg-surface-container-high/50 hover:bg-surface-container-high transition-all text-accent-primary border border-ghost-border shadow-lg group/btn">
                           <ShieldCheck size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        {editingId === reminder.id ? (
                           <button onClick={saveReminderEdit} className="p-4 rounded-[1.5rem] bg-accent-emerald text-white shadow-xl shadow-accent-emerald/20"><Check size={20} strokeWidth={3} /></button>
                        ) : (
                           <button onClick={() => startEditReminder(reminder)} className="p-4 rounded-[1.5rem] bg-accent-amber/10 text-accent-amber border border-accent-amber/20 hover:bg-accent-amber hover:text-white transition-all shadow-lg"><Edit3 size={20} /></button>
                        )}
                        <button onClick={() => handleDelete(reminder.id)} className="p-4 rounded-[1.5rem] bg-accent-rose/10 text-accent-rose border border-accent-rose/20 hover:bg-accent-rose hover:text-white transition-all shadow-lg"><Trash2 size={20} /></button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {reminder.times.map((t) => {
                        const key = `${reminder.id}-${t}`;
                        const status = getDoseStatus(reminder, t);
                        const isTaken = status === "taken";

                        return (
                          <div key={key} className={`group/time relative p-8 rounded-[2.5rem] border transition-all duration-700 ${isTaken ? "bg-accent-emerald/[0.03] border-accent-emerald/20 shadow-inner" : status === "missed" ? "bg-accent-rose/[0.03] border-accent-rose/20 shadow-inner" : "bg-surface-container-low/40 border-ghost-border shadow-xl"}`}>
                            <div className="flex justify-between items-center h-full gap-6">
                              <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                   <Clock size={24} className={isTaken ? "text-accent-emerald" : "text-accent-primary"} />
                                   {editingTimeKey === key ? (
                                      <div className="flex items-center gap-3">
                                        <input type="time" value={editTimeValue} onChange={e => setEditTimeValue(e.target.value)} className="bg-transparent text-2xl font-black outline-none border-b-2 border-accent-primary italic text-text-primary" autoFocus />
                                        <button onClick={() => saveTimeEdit(reminder, t)} className="p-2.5 rounded-xl bg-accent-emerald text-white shadow-xl"><Check size={18} strokeWidth={3} /></button>
                                      </div>
                                   ) : (
                                      <div className="flex items-center gap-4">
                                        <h4 className="text-3xl font-black tracking-tighter cursor-pointer text-text-primary italic" onDoubleClick={() => startEditTime(reminder.id, t)}>{t}</h4>
                                        {!isTaken && (
                                          <button 
                                            onClick={() => startEditTime(reminder.id, t)}
                                            className="p-2.5 rounded-xl bg-surface-container-high/50 text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all opacity-0 md:group-hover/time:opacity-100 shadow-md border border-ghost-border"
                                            title="Recalibrate Time"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                   )}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  {status === "missed" && (
                                     <div className="flex items-center gap-2 text-accent-rose font-black text-[10px] uppercase tracking-[0.2em] italic"><AlertCircle size={14} /> Critical Overdue</div>
                                  )}
                                  {status === "upcoming" && (
                                     <div className="flex items-center gap-2 text-accent-amber font-black text-[10px] uppercase tracking-[0.2em] italic"><TrendingUp size={14} /> Next in {countdowns[key]}</div>
                                  )}
                                  {status === "taken" && (
                                     <div className="flex items-center gap-2 text-accent-emerald font-black text-[10px] uppercase tracking-[0.2em] italic"><CheckCircle2 size={14} /> Adherence Verified</div>
                                  )}
                                </div>
                              </div>

                              {!isTaken && (
                                 <button onClick={() => handleMarkTaken(reminder, t)} className="btn-gem px-8 py-5 text-xs tracking-widest shadow-xl">
                                    <span className="italic">TAKEN</span>
                                 </button>
                              )}
                              {isTaken && (
                                 <div className="w-16 h-16 rounded-[2rem] bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald shadow-2xl shadow-accent-emerald/10">
                                    <CheckCircle2 size={32} strokeWidth={3} />
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
      <div className="card-biometric p-10 md:p-16 transition-all duration-1000 hover:shadow-3xl">
         <div className="relative z-10 grid md:grid-cols-3 gap-12 md:gap-20 items-center">
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-4 text-accent-primary">
                  <div className="p-3 rounded-2xl bg-accent-primary/10 border border-ghost-border">
                     <Activity size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-text-primary">Behavioral Nexus</h3>
               </div>
               <p className="text-text-secondary font-bold leading-relaxed text-sm italic">Adherence metrics are synchronized with your clinical profile for ultra-accurate AI diagnostic synthesis and trend modeling.</p>
            </div>
            
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-4 text-accent-emerald">
                  <div className="p-3 rounded-2xl bg-accent-emerald/10 border border-ghost-border">
                     <Stethoscope size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-text-primary">Continuity Protocol</h3>
               </div>
               <p className="text-text-secondary font-bold leading-relaxed text-sm italic">Consistent medication timing reduces physiological variability and improves prognostic outcomes in long-term treatment cycles.</p>
            </div>

            <div className="relative group/score flex flex-col items-center justify-center p-10 py-12 rounded-[3.5rem] bg-surface-container-high/40 border-ghost-border shadow-2xl transition-all duration-700 hover:scale-105">
               <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-emerald/10 opacity-0 group-hover/score:opacity-100 transition-opacity rounded-[3.5rem]" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-4 italic">Protocol Adherence</span>
               <div className="text-6xl md:text-8xl font-black italic bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-emerald bg-clip-text text-transparent leading-none">
                  {adherence}%
               </div>
               <div className="chip-vital mt-6 bg-accent-emerald/10 border-accent-emerald/20">
                  <CheckCircle2 size={12} className="text-accent-emerald" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-emerald">Verified Continuity</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}