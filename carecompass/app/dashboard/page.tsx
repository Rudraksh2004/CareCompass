"use client";

import { useEffect, useState } from "react";
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
    <div className="space-y-8">
      {/* 🌟 Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_40%)]" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">
            Welcome to CareCompass 🧭
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Your all-in-one health companion to manage reports, prescriptions,
            health tracking, reminders, and clinical summaries in one secure
            platform.
          </p>
        </div>
      </div>

      {/* 📊 Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reminders Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]">
          <p className="text-sm text-slate-400">
            Active Medicine Reminders
          </p>

          <h2 className="text-4xl font-bold text-white mt-2">
            {reminderCount}
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Stay consistent with your medications
          </p>
        </div>

        {/* Platform Features Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]">
          <p className="text-sm text-slate-400">
            Platform Features
          </p>

          <h2 className="text-lg font-semibold text-white mt-2 leading-relaxed">
            Reports • Prescriptions • Chat • Tracking
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Complete health companion toolkit
          </p>
        </div>

        {/* Health Monitoring Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]">
          <p className="text-sm text-slate-400">
            Health Monitoring
          </p>

          <h2 className="text-3xl font-bold mt-2 text-emerald-400">
            {healthActive ? "Active" : "Inactive"}
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Tracking logs & health insights enabled
          </p>
        </div>
      </div>

      {/* 💊 NEW: Smart Reminders Widget (Premium) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_40%)]" />

        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white mb-2">
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
                      className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition"
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

      {/* 💎 Capabilities Section (UNCHANGED) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <h3 className="text-2xl font-bold text-white mb-2">
          CareCompass Capabilities
        </h3>
        <p className="text-slate-400 text-sm mb-8">
          Explore the core features designed to simplify your health management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FeatureCard icon="📄" title="Medical Report Explainer" desc="Understand complex medical reports in simple language" />
          <FeatureCard icon="💊" title="Prescription Simplifier" desc="Supports image, PDF and handwritten prescriptions" />
          <FeatureCard icon="📊" title="Health Tracking & Trend Detection" desc="Track weight, sugar & health metrics over time" />
          <FeatureCard icon="🤖" title="Health Assistant Chat" desc="Conversational support for health queries" />
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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl">
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
