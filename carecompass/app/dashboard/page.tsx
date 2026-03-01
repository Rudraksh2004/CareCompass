"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserReminders } from "@/services/reminderService";
import { getHealthLogs } from "@/services/healthService";

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
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const reminderData = await getUserReminders(user.uid);
        setReminders(reminderData as Reminder[]);
        setReminderCount(reminderData?.length || 0);

        const logs = await getHealthLogs(user.uid, "weight");
        setHealthActive((logs?.length || 0) > 0);
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

      takenToday += takenTimes.filter((t) =>
        t.startsWith(today)
      ).length;
    });

    const progressPercent =
      totalDoses === 0
        ? 0
        : Math.round((takenToday / totalDoses) * 100);

    return {
      totalDoses,
      takenToday,
      progressPercent,
    };
  }, [reminders]);

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

  return (
    <div className="space-y-8 relative">
      {/* Ambient AI Glow Background (UI ONLY) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* 🌟 Welcome Header (FUTURISTIC POLISH ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 p-10 shadow-[0_0_60px_rgba(59,130,246,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.15),_transparent_45%)]" />

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome to CareCompass 🧭
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
            Your all-in-one AI health companion to manage reports, prescriptions,
            disease risk, health tracking, reminders, and clinical summaries in one
            intelligent dashboard.
          </p>
        </div>
      </div>

      {/* 📊 Premium Stat Cards (ENHANCED GLOW ONLY) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(59,130,246,0.25)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-blue-500/10 to-transparent" />
          <p className="text-sm text-slate-400">
            Active Medicine Reminders
          </p>

          <h2 className="text-4xl font-extrabold text-white mt-2">
            {reminderCount}
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Stay consistent with your medications
          </p>
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(168,85,247,0.25)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-purple-500/10 to-transparent" />
          <p className="text-sm text-slate-400">
            Platform Features
          </p>

          <h2 className="text-lg font-semibold text-white mt-2 leading-relaxed">
            Reports • Prescriptions • Chat • Tracking
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Complete AI health toolkit
          </p>
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(16,185,129,0.25)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-emerald-500/10 to-transparent" />
          <p className="text-sm text-slate-400">
            Health Monitoring
          </p>

          <h2 className="text-3xl font-extrabold mt-2 text-emerald-400">
            {healthActive ? "Active" : "Inactive"}
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Tracking logs & AI insights enabled
          </p>
        </div>
      </div>

      {/* 🧠 AI Disease Predictor Card (UI GLOW ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-8 shadow-2xl hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_45%)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold text-white">
              🧠 AI Disease Predictor
            </h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
              Analyze symptoms using hybrid AI, clinical logic, and
              location-aware intelligence for advanced non-diagnostic
              health risk insights.
            </p>
          </div>

          <Link
            href="/dashboard/disease-predictor"
            className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-90 transition text-white px-8 py-4 rounded-2xl font-semibold shadow-xl"
          >
            🧠 Start Analysis →
          </Link>
        </div>
      </div>

      {/* 💊 Daily Adherence Widget (UI ENHANCED ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-8 shadow-2xl hover:shadow-[0_0_45px_rgba(16,185,129,0.2)] transition">
        <p className="text-sm text-slate-400">
          Today’s Medication Adherence
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-white">
              {adherenceData.takenToday} / {adherenceData.totalDoses}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Doses taken today
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-extrabold text-emerald-400">
              {adherenceData.progressPercent}%
            </p>
            <p className="text-xs text-slate-500">
              Daily consistency
            </p>
          </div>
        </div>

        <div className="mt-5 w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700"
            style={{
              width: `${adherenceData.progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* 💊 Smart Reminders Widget (LOGIC UNCHANGED, UI POLISH ONLY) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 border border-slate-800 p-8 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.15),_transparent_45%)]" />

        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold text-white mb-2">
            Upcoming Medication Schedule ⏰
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Your next doses based on your saved reminder timings.
          </p>

          {reminders.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No reminders added yet. Start by adding medicine reminders.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reminders.slice(0, 4).map((reminder) =>
                reminder.times?.map((t) => {
                  const key = `${reminder.id}-${t}`;

                  return (
                    <div
                      key={key}
                      className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition"
                    >
                      <p className="text-white font-semibold text-lg">
                        💊 {reminder.medicineName}
                      </p>

                      <p className="text-slate-400 text-sm">
                        {reminder.dosage || "No dosage specified"}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-amber-400 font-semibold">
                          ⏰ {t}
                        </span>
                        <span className="text-xs text-slate-400">
                          Next in {countdowns[key] || "Calculating..."}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* 💎 Capabilities Section (UNCHANGED STRUCTURE, UI GLOW ONLY) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 border border-slate-800 p-8 rounded-3xl shadow-[0_0_70px_rgba(99,102,241,0.12)] backdrop-blur-xl">
        <h3 className="text-2xl font-extrabold text-white mb-2">
          CareCompass Capabilities
        </h3>
        <p className="text-slate-400 text-sm mb-8">
          Explore the core AI-powered features designed to simplify your health management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FeatureCard icon="📄" title="Medical Report Explainer" desc="Understand complex medical reports in simple language" />
          <FeatureCard icon="💊" title="Prescription Simplifier" desc="Supports image, PDF and handwritten prescriptions" />
          <FeatureCard icon="📊" title="Health Tracking & Trend Detection" desc="Track weight, sugar & health metrics over time" />
          <FeatureCard icon="🤖" title="Health Assistant Chat" desc="Conversational AI support for health queries" />
          <FeatureCard icon="⏰" title="Smart Medicine Reminders" desc="Never miss your medication schedule" />
          <FeatureCard icon="🧠" title="PDF Health Report Export" desc="Download professional clinical-style reports" />
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
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-white">
            {title}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}