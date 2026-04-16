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
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* 🔮 ULTRA-PREMIUM DASHBOARD HEADER (Consistent with other pages) */}
      <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[60px] p-6 md:p-10 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-blue-500/20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[100px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                Command Center
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-400 font-bold max-w-xl text-base md:text-lg leading-relaxed">
              Synthesizing high-fidelity anatomical diagnostics and real-time biological data for your holistic health overview.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="px-6 py-4 md:px-8 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/[0.05] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1">Secure Core ID</p>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">{secureUID}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 CORE METRIC CLUSTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Reminders", val: reminderCount, icon: <Clock />, color: "from-blue-600/20 to-indigo-600/10", border: "border-blue-500/20" },
          { label: "Adherence Pulse", val: `${adherenceData.progressPercent}%`, icon: <Activity />, color: "from-emerald-600/20 to-teal-600/10", border: "border-emerald-500/20" },
          { label: "Predictor Hub", val: "Operational", icon: <Brain />, color: "from-purple-600/20 to-indigo-600/10", border: "border-purple-500/20" }
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-[2rem] border ${stat.border} bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-md p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl`}>
             <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="p-2 md:p-3 rounded-xl bg-gray-900/5 dark:bg-white/5 text-gray-700 dark:text-gray-400">
                   {stat.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">{stat.label}</p>
             </div>
             <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* 🚑 PROTOCOL ACCESS NODES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Node */}
        {emergencyProfile && (
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-red-600 to-rose-700 p-8 md:p-10 flex flex-col justify-between h-auto min-h-[260px] md:h-[300px] gap-6">
             <div className="relative z-10">
                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-red-600 shadow-xl">
                      <AlertCircle size={20} />
                   </div>
                   <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Emergency Protocol</h3>
                </div>
                <p className="text-red-100/60 font-bold text-xs md:text-sm tracking-widest">Medical ID: {user?.uid ? user.uid.slice(0, 10).toUpperCase() : "AUTH-REF"}</p>
             </div>
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex gap-4">
                   <span className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-white/10 text-white text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/20 whitespace-nowrap">Blood: {emergencyProfile.bloodGroup || "-"}</span>
                </div>
                <Link href="/dashboard/emergency" className="px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-white text-red-600 font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                   Access
                </Link>
             </div>
          </div>
        )}

        {/* AI Predictor Scan */}
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 p-8 md:p-10 flex flex-col justify-between h-auto min-h-[260px] md:h-[300px] gap-6">
           <div className="relative z-10">
              <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-xl">
                    <Activity size={20} />
                 </div>
                 <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Disease Predictor</h3>
              </div>
              <p className="text-indigo-100/60 font-bold text-xs md:text-sm tracking-widest leading-relaxed max-w-sm">Execute hybrid bio-marker analysis and regional epidemiological synthesis.</p>
           </div>
           <div className="relative z-10 text-right">
              <Link href="/dashboard/disease-predictor" className="inline-block px-8 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl bg-white text-indigo-600 font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                 Initiate Bio-Sync →
              </Link>
           </div>
        </div>
      </div>

      {/* 🛠️ CORE OPERATIVES MATRIX */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-2">
           <h4 className="text-[12px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-[0.4em] leading-none">Diagnostic Modules</h4>
           <div className="h-px w-full bg-gray-200 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <FileText size={18} />, title: "Report Explainer", desc: "Neuro-linguistic analysis.", route: "/dashboard/report", color: "blue" },
            { icon: <Stethoscope size={18} />, title: "Predictor Node", desc: "Diagnostic synthesis engine.", route: "/dashboard/disease-predictor", color: "indigo" },
            { icon: <Pill size={18} />, title: "Prescription Sync", desc: "Pharmacological digitizer.", route: "/dashboard/prescription", color: "emerald" },
            { icon: <MessageSquare size={18} />, title: "Virtual Consultation", desc: "High-fidelity AI consultation.", route: "/dashboard/chat", color: "indigo" },
            { icon: <Clock size={18} />, title: "Medicine Tracker", desc: "Pulse scheduling & relay.", route: "/dashboard/reminders", color: "rose" },
            { icon: <Microscope size={18} />, title: "Bio-Catalog", desc: "Deep pharmaceutical ledger.", route: "/dashboard/medicine", color: "amber" }
          ].map((feature, i) => (
            <Link key={i} href={feature.route} className="group relative overflow-hidden rounded-[2rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-md p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
               <div className={`absolute -inset-1 bg-gradient-to-br from-${feature.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
               <div className="flex items-center gap-4 md:gap-5 relative z-10">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h5 className="font-black text-gray-900 dark:text-white tracking-tight uppercase text-xs md:text-sm mb-1">{feature.title}</h5>
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-400">{feature.desc}</p>
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}