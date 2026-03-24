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
  Box
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

    const progressPercent = totalDoses === 0 ? 0 : Math.round((takenToday / totalDoses) * 100);

    return { totalDoses, takenToday, progressPercent };
  }, [reminders]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🎭 Cinematic Neural Header */}
      <div className="relative group overflow-hidden rounded-[3rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[80px] p-12 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[130px] -mr-64 -mt-64 transition-all group-hover:bg-blue-500/20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[120px] -ml-48 -mb-48" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4 duration-1000">
               <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
               Clinical Matrix Operational
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-600 bg-clip-text text-transparent">
                CareCompass <span className="text-blue-600 dark:text-blue-500">Core</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-bold max-w-2xl text-xl leading-relaxed">
                Synthesizing high-fidelity health vectors, pharmaceutical adherence, and neurological predictive diagnostics in real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
               <Link href="/dashboard/chat" className="px-10 py-5 rounded-[2.2rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3">
                 <Sparkles size={18} /> Inquiry AI
               </Link>
               <div className="px-8 py-5 rounded-[2.2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Secure Node Connected</span>
               </div>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
             <div className="w-64 h-64 rounded-full border-2 border-dashed border-blue-500/20 animate-[spin_20s_linear_infinite] flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-blue-500/10 flex items-center justify-center">
                   <Zap size={48} className="text-blue-500 opacity-20" />
                </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Box size={80} className="text-blue-600 dark:text-blue-400 animate-pulse" />
             </div>
          </div>
        </div>
      </div>

      {/* 📊 High-Performance Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Active Doses", val: reminderCount, sub: "Remaining Today", color: "blue", icon: <Pill size={24} /> },
          { label: "Sync Integrity", val: healthActive ? "ONLINE" : "OFFLINE", sub: "Data Flux Status", color: "emerald", icon: <TrendingUp size={24} /> },
          { label: "Protocol Ready", val: "9/9", sub: "Modular Efficiency", color: "purple", icon: <ShieldCheck size={24} /> }
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[3rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[60px] p-10 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
             <div className={`absolute -inset-1 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
             
             <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
             </div>
             
             <h2 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">{stat.val}</h2>
             <span className="text-[11px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest leading-none">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* 🚑 Emergency Critical Path */}
      {emergencyProfile && (
        <div className="relative group overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-red-600 to-rose-700 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(239,68,68,0.3)]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="relative z-10 p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center text-red-600 shadow-2xl">
                    <AlertCircle size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-1">Emergency Protocol</h3>
                    <p className="text-red-100/60 text-sm font-bold tracking-widest uppercase">Verified Medical ID: {user?.uid?.slice(0, 10).toUpperCase()}</p>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-4">
                  <div className="px-8 py-4 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md">
                     <p className="text-[9px] font-black uppercase tracking-widest text-red-200/50 mb-1">Blood Registry</p>
                     <span className="text-xl font-black text-white">{emergencyProfile.bloodGroup || "SYS-PEND"}</span>
                  </div>
                  <div className="px-8 py-4 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md">
                     <p className="text-[9px] font-black uppercase tracking-widest text-red-200/50 mb-1">Contact Sync</p>
                     <span className="text-xl font-black text-white">{emergencyProfile.contact || "NO-LINK"}</span>
                  </div>
               </div>
            </div>

            <Link href="/dashboard/emergency" className="w-full lg:w-auto px-14 py-6 rounded-[2.5rem] bg-white text-red-600 font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl">
               Access Vault
            </Link>
          </div>
        </div>
      )}

      {/* 🧠 Predictive Analysis Overlay */}
      <div className="relative group overflow-hidden rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[80px] p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                   <Activity size={32} />
                 </div>
                 <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">AI Diagnosis</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-bold max-w-xl text-xl leading-relaxed">
                Advanced bio-marker extraction with regional synchronization and multi-vector diagnostic synthesis.
              </p>
           </div>

           <Link href="/dashboard/disease-predictor" className="w-full lg:w-auto px-14 py-6 rounded-[2.5rem] bg-indigo-600 text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30">
              Initiate Scan
           </Link>
        </div>
      </div>

      {/* 💊 Bio-Pharmaceutical Adherence */}
      <div className="relative group overflow-hidden rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[80px] p-14 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute -left-32 -top-32 w-80 h-80 bg-emerald-500/10 blur-[120px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
        
        <div className="relative z-10 space-y-12">
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3">
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Biological Adherence</p>
                 <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Molecular Integrity</h3>
              </div>
              <div className="text-right">
                 <span className="text-8xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter drop-shadow-2xl leading-none">
                   {adherenceData.progressPercent}%
                 </span>
              </div>
           </div>

           <div className="relative w-full h-6 bg-gray-200 dark:bg-black/40 rounded-full overflow-hidden shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 transition-all duration-1000 shadow-[0_0_25px_rgba(16,185,129,0.5)]" 
                style={{ width: `${adherenceData.progressPercent}%` }} 
              />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
           </div>

           <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-gray-200 dark:border-white/[0.05]">
              <div className="flex items-center gap-4">
                 <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest uppercase">
                   Sync: {adherenceData.takenToday} / {adherenceData.totalDoses} Doses
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Pharmacological Node</span>
              </div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Efficiency Optimal</p>
           </div>
        </div>
      </div>

      {/* 🛠️ Multi-Vector Core Modules */}
      <div className="space-y-12">
        <div className="flex items-center gap-8 px-6">
           <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none whitespace-nowrap">Core Operatives</h3>
           <div className="h-px w-full bg-gradient-to-r from-gray-200 via-transparent to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <FileText size={28} />, title: "Report Explainer", desc: "Neuro-linguistic analysis of reports.", route: "/dashboard/report", color: "blue" },
            { icon: <Pill size={28} />, title: "Prescription Sync", desc: "Handwriting & digital ciphering.", route: "/dashboard/prescription", color: "emerald" },
            { icon: <TrendingUp size={28} />, title: "Bio-Tracker", desc: "Longitudinal health vector monitoring.", route: "/dashboard/health", color: "purple" },
            { icon: <MessageSquare size={28} />, title: "Clinical Chat", desc: "Neural bio-core consultation.", route: "/dashboard/chat", color: "indigo" },
            { icon: <Clock size={28} />, title: "Medicine Matrix", desc: "Pulse scheduling Node.", route: "/dashboard/reminders", color: "rose" },
            { icon: <Microscope size={28} />, title: "Bio-Catalog", desc: "Deep pharmaceutical ledger.", route: "/dashboard/medicine", color: "amber" }
          ].map((feature, i) => (
            <Link key={i} href={feature.route} className="group relative overflow-hidden rounded-[3rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[60px] p-10 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
               <div className={`absolute -inset-1 bg-gradient-to-br from-${feature.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
               <div className="flex flex-col gap-8 relative z-10">
                  <div className={`w-16 h-16 rounded-[1.8rem] bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                    {feature.icon}
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">{feature.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-bold opacity-80">{feature.desc}</p>
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
