"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link"; // ✅ NEW (safe import)
import { useAuth } from "@/context/AuthContext";
import { getUserReminders } from "@/services/reminderService";
import { getHealthLogs } from "@/services/healthService";
import { getEmergencyProfile } from "@/services/emergencyService";

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes?: string[];
}

// 🔒 Local date key (IST-safe & daily reset accurate)
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
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);

  // 🧠 AI Health Summary (NEW - SAFE)
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState("");

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

  // 🧠 Generate AI Health Summary
  const generateAISummary = async () => {
    if (!user) return;

    setLoadingSummary(true);
    setAiSummary("");

    try {
      const res = await fetch("/api/ai/health-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      const data = await res.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error("AI summary error:", error);
      setAiSummary("Failed to generate summary.");
    }

    setLoadingSummary(false);
  };

  // 💊 NEW: Calculate today's adherence (SAFE - uses existing schema)
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

    const progressPercent =
      totalDoses === 0 ? 0 : Math.round((takenToday / totalDoses) * 100);

    return {
      totalDoses,
      takenToday,
      progressPercent,
    };
  }, [reminders]);

  // ⏰ Countdown for upcoming doses (Dashboard Widget)
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
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          updated[`${reminder.id}-${t}`] = `${hours}h ${minutes}m`;
        });
      });

      setCountdowns(updated);
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <div className="relative space-y-10">
      {/* Floating background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* 🌟 Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.7] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-blue-400/80 dark:hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_40%)]" />

        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
            Welcome to CareCompass 🧭
          </h1>

          <p className="text-gray-700 dark:text-slate-400 mt-3 max-w-2xl leading-relaxed font-medium">
            Your all-in-one health companion to manage reports, prescriptions,
            health tracking, reminders, and clinical summaries in one secure
            platform.
          </p>
        </div>
      </div>

      {/* 📊 Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.12] dark:border-l-white/[0.08] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_15px_35px_rgba(59,130,246,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent dark:from-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest relative z-10">Active Reminders</p>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-3 drop-shadow-sm relative z-10">
            {reminderCount}
          </h2>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 relative z-10">
            Stay consistent with your medications
          </p>
        </div>

        <div className="relative group overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.12] dark:border-l-white/[0.08] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_15px_35px_rgba(168,85,247,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent dark:from-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest relative z-10">Platform Features</p>
          <h2 className="text-lg font-black text-gray-900 dark:text-white mt-3 leading-relaxed drop-shadow-sm relative z-10">
            Reports • Prescriptions • Chat
          </h2>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 relative z-10">
            Complete health companion toolkit
          </p>
        </div>

        <div className="relative group overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.12] dark:border-l-white/[0.08] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_15px_35px_rgba(16,185,129,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent dark:from-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest relative z-10">Health Monitoring</p>
          <h2 className="text-3xl font-black mt-3 text-emerald-600 dark:text-emerald-400 drop-shadow-sm relative z-10">
            {healthActive ? "Active" : "Inactive"}
          </h2>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 relative z-10">
            Tracking logs & health insights enabled
          </p>
        </div>
      </div>

      {/* 🚑 Emergency Card Widget */}
      {emergencyProfile && (
        <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.7] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-red-400/80 dark:hover:border-red-500/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_20px_40px_rgba(239,68,68,0.25)]">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                🚑 Emergency Medical Card
              </h3>

              <p className="text-gray-700 dark:text-slate-400 text-sm font-medium mt-2 max-w-xl">
                Quick access to your emergency medical information.
              </p>

              <div className="flex flex-wrap gap-4 mt-5 text-sm font-bold">
                <span className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 backdrop-blur shadow-sm">
                  Blood Group: {emergencyProfile.bloodGroup || "-"}
                </span>

                <span className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 backdrop-blur shadow-sm">
                  Contact: {emergencyProfile.contact || "-"}
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/emergency"
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 transition text-white px-8 py-4 rounded-2xl font-bold shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_24px_rgba(239,68,68,0.4)] hover:scale-[1.04]"
            >
              View Emergency Card →
            </Link>
          </div>
        </div>
      )}

      {/* 🧠 Disease Predictor */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.7] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-purple-400/80 dark:hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_40%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm">
              🧠 AI Disease Predictor
            </h3>

            <p className="text-gray-700 dark:text-slate-400 text-sm font-medium mt-2 max-w-xl leading-relaxed">
              Analyze symptoms using hybrid AI, clinical logic, and
              location-aware insights with optional medical Q&A.
            </p>
          </div>

          <Link
            href="/dashboard/disease-predictor"
            className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition text-white px-8 py-4 rounded-2xl font-bold shadow-[0_4px_16px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_24px_rgba(168,85,247,0.4)] hover:scale-[1.04]"
          >
            🧠 Start Analysis →
          </Link>
        </div>
      </div>

      {/* 💊 Adherence Widget */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.7] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-emerald-400/80 dark:hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
        <p className="text-sm font-bold text-gray-600 dark:text-slate-400 uppercase tracking-widest">Today’s Medication Adherence</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
              {adherenceData.takenToday} / {adherenceData.totalDoses}
            </h2>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-500 mt-1 uppercase tracking-wide">Doses taken today</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
              {adherenceData.progressPercent}%
            </p>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wide">Daily consistency</p>
          </div>
        </div>

        <div className="mt-5 w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{
              width: `${adherenceData.progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Capabilities */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.7] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 drop-shadow-sm">
          CareCompass Capabilities
        </h3>

        <p className="text-gray-700 dark:text-slate-400 font-medium text-sm mb-8">
          Explore the core features designed to simplify your health management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon="📄"
            title="Medical Report Explainer"
            desc="Understand complex medical reports in simple language"
          />
          <FeatureCard
            icon="💊"
            title="Prescription Simplifier"
            desc="Supports image, PDF and handwritten prescriptions"
          />
          <FeatureCard
            icon="📊"
            title="Health Tracking & Trend Detection"
            desc="Track weight, sugar & health metrics over time"
          />
          <FeatureCard
            icon="🤖"
            title="Health Assistant Chat"
            desc="Conversational support for health queries"
          />
          <FeatureCard
            icon="⏰"
            title="Smart Medicine Reminders"
            desc="Never miss your medication schedule"
          />
          <FeatureCard
            icon="🧪"
            title="Medicine Describer"
            desc="Get AI explanation of medicines, usage, and side effects"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  const getRoute = (title: string) => {
    if (title.includes("Report")) return "/dashboard/report";
    if (title.includes("Prescription")) return "/dashboard/prescription";
    if (title.includes("Tracking")) return "/dashboard/health";
    if (title.includes("Chat")) return "/dashboard/chat";
    if (title.includes("Reminders")) return "/dashboard/reminders";
    if (title.includes("Medicine")) return "/dashboard/medicine";
    return "/dashboard";
  };

  const route = getRoute(title);

  return (
    <Link href={route}>
      <div className="group cursor-pointer bg-white/50 dark:bg-white/[0.02] border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.06] dark:border-t-white/[0.15] dark:border-l-white/[0.1] rounded-2xl p-5 backdrop-blur-[20px] backdrop-saturate-[1.5] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] hover:bg-white/80 dark:hover:bg-white/[0.08] hover:border-blue-400/60 dark:hover:border-blue-500/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-transparent group-hover:from-blue-400/5 transition-opacity duration-500" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] dark:shadow-none border border-white/80 dark:border-white/[0.1] group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white drop-shadow-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">{title}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
