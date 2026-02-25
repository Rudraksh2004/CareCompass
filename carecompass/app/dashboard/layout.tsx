"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  Home,
  FileText,
  Pill,
  LineChart,
  Clock,
  FlaskConical,
  Brain,
  Bot,
  User,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme(); // NO LOGIC CHANGE

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // 🔥 PREMIUM ACTIVE LINK STYLING (UI ONLY)
  const linkClasses = (path: string) => {
    const isActive = pathname === path;

    return `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
      isActive
        ? "bg-gradient-to-r from-blue-500/10 to-emerald-500/10 text-blue-600 dark:text-emerald-400 border border-blue-200/70 dark:border-emerald-900 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
    }`;
  };

  const iconClasses = (path: string) => {
    const isActive = pathname === path;
    return `w-5 h-5 transition-all duration-300 ${
      isActive
        ? "scale-110 text-blue-600 dark:text-emerald-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
        : "group-hover:scale-105"
    }`;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]">
      {/* 🌟 PREMIUM SIDEBAR */}
      <aside className="w-72 p-6 border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl shadow-xl flex flex-col">
        {/* Brand */}
        <div className="mb-10">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            CareCompass
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            AI Health Companion
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className={linkClasses("/dashboard")}>
            {pathname === "/dashboard" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <Home className={iconClasses("/dashboard")} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/dashboard/report"
            className={linkClasses("/dashboard/report")}
          >
            {pathname === "/dashboard/report" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <FileText className={iconClasses("/dashboard/report")} />
            <span className="font-medium">Report Explainer</span>
          </Link>

          <Link
            href="/dashboard/prescription"
            className={linkClasses("/dashboard/prescription")}
          >
            {pathname === "/dashboard/prescription" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <Pill className={iconClasses("/dashboard/prescription")} />
            <span className="font-medium">Simplify Prescription</span>
          </Link>

          <Link
            href="/dashboard/health"
            className={linkClasses("/dashboard/health")}
          >
            {pathname === "/dashboard/health" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <LineChart className={iconClasses("/dashboard/health")} />
            <span className="font-medium">Health Tracking</span>
          </Link>

          <Link
            href="/dashboard/reminders"
            className={linkClasses("/dashboard/reminders")}
          >
            {pathname === "/dashboard/reminders" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <Clock className={iconClasses("/dashboard/reminders")} />
            <span className="font-medium">Medicine Reminders</span>
          </Link>

          <Link
            href="/dashboard/medicine"
            className={linkClasses("/dashboard/medicine")}
          >
            {pathname === "/dashboard/medicine" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <FlaskConical className={iconClasses("/dashboard/medicine")} />
            <span className="font-medium">Medicine Describer</span>
          </Link>

          <Link
            href="/dashboard/disease-predictor"
            className={linkClasses("/dashboard/disease-predictor")}
          >
            {pathname === "/dashboard/disease-predictor" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <Brain className={iconClasses("/dashboard/disease-predictor")} />
            <span className="font-medium">Disease Predictor</span>
          </Link>

          <Link
            href="/dashboard/chat"
            className={linkClasses("/dashboard/chat")}
          >
            {pathname === "/dashboard/chat" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-emerald-400 shadow-lg" />
            )}
            <Bot className={iconClasses("/dashboard/chat")} />
            <span className="font-medium">AI Health Chat</span>
          </Link>
        </nav>

        {/* Bottom Section (UNCHANGED LOGIC) */}
        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <Link
            href="/dashboard/profile"
            className={linkClasses("/dashboard/profile")}
          >
            <User className={iconClasses("/dashboard/profile")} />
            <span className="font-medium">Profile</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:scale-[1.02] transition"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-red-500 text-sm font-semibold hover:text-red-600 transition py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Logout
          </button>

          {user && (
            <div className="mt-3 text-xs text-gray-400 text-center truncate">
              Logged in as {user.email}
            </div>
          )}
        </div>
      </aside>

      {/* 🌟 MAIN CONTENT AREA (UNCHANGED) */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#020617]/60 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Welcome back 👋
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your AI-powered health dashboard
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-200 dark:border-emerald-900 text-xs font-medium text-blue-600 dark:text-emerald-400">
            ✨ CareCompass AI Active
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-auto">{children}</div>
      </main>
    </div>
  );
}