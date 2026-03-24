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
  Bot
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

  const secureUID = user?.uid ? user.uid.slice(0, 12).toUpperCase() : "SECURE-ID";
  const emergencyUID = user?.uid ? user.uid.slice(0, 10).toUpperCase() : "AUTH-REF";

  return (
    <div className="max-w-[1500px] mx-auto space-y-16 pb-32">
      {/* 🔮 ULTRA-PREMIUM BENTO HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Welcome Feature */}
        <div className="lg:col-span-8 relative group overflow-hidden rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/50 backdrop-blur-[100px] p-16 transition-all duration-700 hover:shadow-[0_80px_120px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_80px_120px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(59,130,246,0.12),_transparent_60%)]" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-10">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/40 dark:bg-white/5 border border-white dark:border-white/[0.08] text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">
                  <Sparkles size={14} className="animate-pulse" />
                  Neural Synthesis Active
               </div>
               <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-none bg-gradient-to-br from-gray-900 via-gray-700 to-gray-400 dark:from-white dark:via-gray-200 dark:to-gray-600 bg-clip-text text-transparent italic">
                 CareCompass
               </h1>
               <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xl text-2xl leading-relaxed">
                 High-fidelity anatomical diagnostics fused with real-time bio-marker synchronization.
               </p>
            </div>

            <div className="flex items-center gap-8">
               <Link href="/dashboard/chat" className="group relative px-14 py-6 rounded-[2.5rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-100 dark:from-gray-100 dark:to-white transition-opacity" />
                  <span className="relative z-10">Launch AI Inquiry</span>
                  <ChevronRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
               </Link>
               
               <div className="hidden md:flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Secure Core ID</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white uppercase leading-none">{secureUID}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Adherence Node (Bento Right) */}
        <div className="lg:col-span-4 relative group overflow-hidden rounded-[3.5rem] border border-white/80 dark:border-white/5 bg-gradient-to-br from-emerald-600 to-teal-800 p-12 transition-all duration-700 hover:shadow-2xl hover:shadow-emerald-500/20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="relative z-10 flex flex-col justify-between h-full text-white">
             <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60">Daily Adherence</p>
                <h3 className="text-4xl font-black tracking-tighter leading-tight uppercase">Biological <br/> Integrity</h3>
             </div>

             <div className="space-y-8 mt-10">
                <div className="flex items-baseline justify-between">
                   <span className="text-8xl font-black tracking-tighter italic">{adherenceData.progressPercent}%</span>
                   <TrendingUp size={48} className="opacity-40" />
                </div>
                
                <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="absolute inset-0 bg-white transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.8)]" style={{ width: `${adherenceData.progressPercent}%` }} />
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span>{adherenceData.takenToday} Node Completed</span>
                   <span className="opacity-50">Sync Target: 100%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 💊 QUICK METRIC STREAMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Active Doses", val: reminderCount, icon: <Pill size={24} />, color: "blue", sub: "Doses Remaining" },
          { label: "Predictor Scans", val: "Active", icon: <Activity size={24} />, color: "indigo", sub: "Regional Data Sync" },
          { label: "Lab Reports", val: 3, icon: <FileText size={24} />, color: "purple", sub: "Categorized Ledger" },
          { label: "Clinical Chat", val: "Online", icon: <Bot size={24} />, color: "emerald", sub: "Neural Context OK" }
        ].map((item, i) => (
          <div key={i} className="relative group overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[60px] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
             <div className={`absolute -inset-1 bg-gradient-to-br from-${item.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
             <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{item.label}</p>
             <h4 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{item.val}</h4>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* 🚑 CRITICAL PROTOCOL HUB */}
      {emergencyProfile && (
        <div className="relative group overflow-hidden rounded-[3.5rem] bg-gray-900 dark:bg-[#030712]/80 border border-white/5 transition-all duration-700 hover:shadow-[0_60px_100px_rgba(0,0,0,0.4)]">
           <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/5" />
           <div className="absolute top-0 right-0 w-[600px] h-full bg-red-600/10 blur-[120px] pointer-events-none" />
           
           <div className="relative z-10 p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-16">
              <div className="space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.2rem] bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/40">
                       <AlertCircle size={40} />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Emergency Protocols</h3>
                       <p className="text-red-500 text-xs font-black tracking-[0.4em] uppercase">Security Level: Maximum</p>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-6">
                    <div className="px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">Blood Group</p>
                       <span className="text-2xl font-black text-white">{emergencyProfile.bloodGroup || "PENDING-SYNC"}</span>
                    </div>
                    <div className="px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-2">Relay Contact</p>
                       <span className="text-2xl font-black text-white">{emergencyProfile.contact || "SECURE-ID-NONE"}</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-red-200/40 uppercase tracking-widest text-center">Protocol Reference: {emergencyUID}</span>
                <Link href="/dashboard/emergency" className="w-full lg:w-auto px-16 py-7 rounded-[2.8rem] bg-red-600 text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-600/30 flex items-center justify-center gap-4">
                   Access Secure Vault
                </Link>
              </div>
           </div>
        </div>
      )}

      {/* 🧠 DIAGNOSTIC & OPERATIVE MODULES */}
      <div className="space-y-16">
        <div className="flex items-center gap-10 px-6">
           <h3 className="text-[15px] font-black text-gray-400 uppercase tracking-[0.5em] leading-none whitespace-nowrap">Core Operatives</h3>
           <div className="h-px w-full bg-gradient-to-r from-gray-200 via-transparent to-transparent dark:from-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { icon: <FileText size={32} />, title: "Report Explainer", desc: "Neuro-linguistic diagnostic breakdown.", route: "/dashboard/report", color: "blue", tag: "AI ANALYSIS" },
            { icon: <Stethoscope size={32} />, title: "Disease Predictor", desc: "Regional bio-marker synthesis engine.", route: "/dashboard/disease-predictor", color: "indigo", tag: "DIAGNOSTICS" },
            { icon: <Pill size={32} />, title: "Prescription Sync", desc: "CIPHER handwritten & digital OCR.", route: "/dashboard/prescription", color: "emerald", tag: "PHARMA CORE" },
            { icon: <MessageSquare size={32} />, title: "Clinical Chat", desc: "High-fidelity operative consultation.", route: "/dashboard/chat", color: "purple", tag: "AI PHYSICIAN" },
            { icon: <Clock size={32} />, title: "Medicine Matrix", desc: "Cellular scheduling & relay node.", route: "/dashboard/reminders", color: "rose", tag: "ADHERENCE" },
            { icon: <Microscope size={32} />, title: "Bio-Catalog", desc: "Deep pharmaceutical usage ledger.", route: "/dashboard/medicine", color: "amber", tag: "BIO-SYNTHESIS" }
          ].map((feature, i) => (
            <Link key={i} href={feature.route} className="group relative overflow-hidden rounded-[3.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[80px] p-12 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
               <div className={`absolute -inset-1 bg-gradient-to-br from-${feature.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
               
               <div className="space-y-8 relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                     <div className={`w-16 h-16 rounded-[2rem] bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                       {feature.icon}
                     </div>
                     <span className={`text-[9px] font-black tracking-widest text-${feature.color}-500 opacity-60`}>{feature.tag}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none italic">{feature.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-bold opacity-80">{feature.desc}</p>
                  </div>

                  <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                     Initiate Module <ChevronRight size={14} />
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
