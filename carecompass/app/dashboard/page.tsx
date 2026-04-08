"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserReminders } from "@/services/reminderService";
import { getHealthLogs } from "@/services/healthService";
import { getEmergencyProfile } from "@/services/emergencyService";
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Pill, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Microscope,
  Box,
  ChevronRight,
  Stethoscope,
  Bot,
  User as UserIcon,
  HeartPulse,
  Brain
} from "lucide-react";

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes?: string[];
}

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [reminderCount, setReminderCount] = useState(0);
  const [healthActive, setHealthActive] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const reminderData = await getUserReminders(user.uid);
        setReminders(reminderData as Reminder[]);
        setReminderCount(reminderData?.length || 0);
        const logs = await getHealthLogs(user.uid, "weight");
        setHealthActive((logs?.length || 0) > 0);
        const emergency = await getEmergencyProfile(user.uid);
        setEmergencyProfile(emergency);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };
    loadData();
  }, [user]);

  const adherenceData = useMemo(() => {
    const today = getTodayKey();
    let totalDoses = 0;
    let takenToday = 0;
    reminders.forEach((reminder) => {
      const times = reminder.times || [];
      const takenTimes = reminder.takenTimes || [];
      totalDoses += times.length;
      takenToday += takenTimes.filter((t) => t.startsWith(today)).length;
    });
    return { 
      totalDoses, 
      takenToday, 
      progressPercent: totalDoses === 0 ? 0 : Math.round((takenToday / totalDoses) * 100) 
    };
  }, [reminders]);

  const secureUID = user?.uid ? user.uid.slice(0, 12).toUpperCase() : "SECURE-ID";

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 LUMINA HUB HEADER */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-ghost-border bg-surface-container-low/40 backdrop-blur-[60px] p-8 md:p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] -mr-64 -mt-64 transition-all group-hover:bg-accent-primary/10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-emerald/5 blur-[100px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 md:p-4 rounded-2xl bg-accent-primary/10 text-accent-primary shadow-inner">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary italic">
                   Command <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-emerald bg-clip-text text-transparent">Center</span>
                 </h1>
                 <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-vital-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Diagnostic Uplink Active</span>
                 </div>
              </div>
            </div>
            <p className="text-text-secondary font-bold max-w-xl text-base md:text-xl leading-relaxed italic">
              Synthesizing high-fidelity anatomical diagnostics and real-time biological data for your holistic health overview.
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
             <div className="px-8 py-5 rounded-[2rem] bg-surface-container-high/40 border border-ghost-border backdrop-blur-xl group/id">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted mb-3 italic">Secure Core ID</p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent-emerald animate-vital-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <span className="text-sm md:text-base font-black text-text-primary uppercase tracking-tighter italic transition-all group-hover/id:text-accent-primary">{secureUID}</span>
                </div>
             </div>
             
             <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low border border-ghost-border flex items-center justify-center text-accent-primary shadow-sm hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low border border-ghost-border flex items-center justify-center text-accent-emerald shadow-sm hover:scale-110 transition-transform">
                   <Zap size={24} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 📊 BIOMETRIC METRIC CLUSTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Active Reminders", val: reminderCount, icon: <Clock className="w-6 h-6" />, type: "primary" as const, sub: "Scheduled Protocols" },
          { label: "Adherence Pulse", val: `${adherenceData.progressPercent}%`, icon: <Activity className="w-6 h-6" />, type: "emerald" as const, sub: "Cycle Compliance" },
          { label: "Predictor Hub", val: "Operational", icon: <Brain className="w-6 h-6" />, type: "indigo" as const, sub: "Neural Engine Ready" }
        ].map((stat, i) => (
          <div key={i} className="card-biometric group cursor-default">
             <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-accent-${stat.type}/10 text-accent-${stat.type} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                   {stat.icon}
                </div>
                <div className="chip-vital">
                  <div className={`w-2 h-2 rounded-full bg-accent-${stat.type} animate-vital-pulse`} />
                  Live Sync
                </div>
             </div>
             
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted italic">{stat.label}</p>
                <h3 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter italic">{stat.val}</h3>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 italic opacity-60">{stat.sub}</p>
             </div>

             <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </div>
        ))}
      </div>

      {/* 🚑 PRIORITY PROTOCOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Node */}
        {emergencyProfile && (
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-accent-rose p-10 md:p-12 flex flex-col justify-between h-auto min-h-[320px] md:h-[350px] shadow-2xl transition-all hover:scale-[1.01]">
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
             <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-white/95 flex items-center justify-center text-accent-rose shadow-xl transition-transform group-hover:rotate-12">
                      <AlertCircle size={32} strokeWidth={2.5} />
                   </div>
                   <div className="flex flex-col">
                      <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Emergency Protocol</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="w-2 h-2 rounded-full bg-white animate-vital-pulse" />
                         <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Critical Ready</span>
                      </div>
                   </div>
                </div>
                <p className="text-white/70 font-black text-xs md:text-sm tracking-[0.2em] uppercase italic bg-black/10 px-4 py-2 rounded-lg inline-block">
                  Medical ID: {user?.uid ? user.uid.slice(0, 10).toUpperCase() : "AUTH-REF"}
                </p>
             </div>

             <div className="relative z-10 flex items-center justify-between mt-10">
                <div className="px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                   <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-1">Blood Group</p>
                   <span className="text-2xl font-black text-white uppercase italic">{emergencyProfile.bloodGroup || "—"}</span>
                </div>
                <Link href="/dashboard/emergency" className="btn-gem px-10 py-5 bg-white text-accent-rose hover:bg-white/90">
                   <span className="text-sm font-black uppercase tracking-[0.2em] italic">Access Vault</span>
                </Link>
             </div>
          </div>
        )}

        {/* AI Predictor Scan */}
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-accent-primary p-10 md:p-12 flex flex-col justify-between h-auto min-h-[320px] md:h-[350px] shadow-2xl transition-all hover:scale-[1.01]">
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-5 mb-6">
                 <div className="w-14 h-14 rounded-2xl bg-white/95 flex items-center justify-center text-accent-primary shadow-xl transition-transform group-hover:rotate-12">
                    <TrendingUp size={32} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Disease Predictor</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-2 h-2 rounded-full bg-white animate-vital-pulse" />
                       <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">AI Core Synced</span>
                    </div>
                 </div>
              </div>
              <p className="text-white/80 font-bold text-sm md:text-lg leading-relaxed max-w-sm italic">
                Execute high-fidelity bio-marker analysis and global epidemiological synthesis.
              </p>
           </div>
           
           <div className="relative z-10 flex justify-end mt-10">
              <Link href="/dashboard/disease-predictor" className="btn-gem px-12 py-5 bg-white text-accent-primary hover:bg-white/90">
                 <span className="text-sm font-black uppercase tracking-[0.2em] italic">Initiate Scan →</span>
              </Link>
           </div>
        </div>
      </div>

      {/* 🛠️ DIAGNOSTIC OPERATIVES MATRIX */}
      <div className="space-y-10">
        <div className="flex items-center gap-6 px-4">
           <h4 className="text-xs md:text-sm font-black text-text-muted uppercase tracking-[0.5em] leading-none italic shrink-0">Diagnostic Modules</h4>
           <div className="h-[2px] w-full bg-gradient-to-r from-ghost-border via-ghost-border to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <FileText size={20} />, title: "Report Explainer", desc: "Neuro-linguistic analysis.", route: "/dashboard/report", type: "primary" as const },
            { icon: <Stethoscope size={20} />, title: "Predictor Node", desc: "Diagnostic synthesis engine.", route: "/dashboard/disease-predictor", type: "indigo" as const },
            { icon: <Pill size={20} />, title: "Prescription Sync", desc: "Pharmacological digitizer.", route: "/dashboard/prescription", type: "emerald" as const },
            { icon: <Bot size={20} />, title: "AI Health Chat", desc: "High-fidelity clinical agent.", route: "/dashboard/chat", type: "indigo" as const },
            { icon: <Clock size={20} />, title: "Medicine Tracker", desc: "Pulse scheduling & relay.", route: "/dashboard/reminders", type: "rose" as const },
            { icon: <Microscope size={20} />, title: "Bio-Catalog", desc: "Deep pharmaceutical ledger.", route: "/dashboard/medicine", type: "amber" as const }
          ].map((feature, i) => (
            <Link key={i} href={feature.route} className="card-biometric group p-8 md:p-10 transition-all duration-500 hover:z-10">
               <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-accent-${feature.type}/10 flex items-center justify-center text-accent-${feature.type} border border-accent-${feature.type}/20 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--accent-${feature.type}-rgb),0.3)]`}>
                    {feature.icon}
                  </div>
                  <div className="flex flex-col">
                    <h5 className="font-black text-text-primary tracking-tight uppercase text-sm md:text-base italic mb-1 group-hover:text-accent-primary transition-colors">{feature.title}</h5>
                    <p className="text-[10px] md:text-[11px] font-bold text-text-muted tracking-wide uppercase italic opacity-70 group-hover:opacity-100">{feature.desc}</p>
                  </div>
               </div>
               
               <div className="absolute top-4 right-4 text-text-muted/20 transition-all group-hover:text-accent-primary group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ChevronRight size={24} strokeWidth={3} />
               </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
