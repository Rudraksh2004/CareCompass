"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme(); // theme only (no logic change)

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const linkClasses = (path: string) =>
    `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      pathname === path
        ? "bg-gradient-to-r from-blue-500/10 to-emerald-500/10 text-blue-600 dark:text-emerald-400 border border-blue-200 dark:border-emerald-900 shadow-sm"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

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
            <span>🏠</span>
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/dashboard/report"
            className={linkClasses("/dashboard/report")}
          >
            <span>📄</span>
            <span className="font-medium">Report Explainer</span>
          </Link>

          <Link
            href="/dashboard/prescription"
            className={linkClasses("/dashboard/prescription")}
          >
            <span>💊</span>
            <span className="font-medium">Simplify Prescription</span>
          </Link>

          <Link
            href="/dashboard/health"
            className={linkClasses("/dashboard/health")}
          >
            <span>📊</span>
            <span className="font-medium">Health Tracking</span>
          </Link>

          <Link
            href="/dashboard/reminders"
            className={linkClasses("/dashboard/reminders")}
          >
            <span>⏰</span>
            <span className="font-medium">Medicine Reminders</span>
          </Link>

          <Link
            href="/dashboard/medicine"
            className={linkClasses("/dashboard/medicine")}
          >
            Medicine Describer
          </Link>

          <Link
            href="/dashboard/chat"
            className={linkClasses("/dashboard/chat")}
          >
            <span>🤖</span>
            <span className="font-medium">AI Health Chat</span>
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className={`${linkClasses("/dashboard/profile")} mb-2`}
          >
            <span>👤</span>
            <span className="font-medium">Profile</span>
          </Link>

          {/* Theme Toggle (UI only) */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:scale-[1.02] transition"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-red-500 text-sm font-semibold hover:text-red-600 transition py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Logout
          </button>

          {/* User Info (Subtle Premium Touch) */}
          {user && (
            <div className="mt-3 text-xs text-gray-400 text-center truncate">
              Logged in as {user.email}
            </div>
          )}
        </div>
      </aside>

      {/* 🌟 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        {/* Premium Top Bar */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#020617]/60 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Welcome back 👋
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your AI-powered health dashboard
            </p>
          </div>

          {/* Glow Badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-200 dark:border-emerald-900 text-xs font-medium text-blue-600 dark:text-emerald-400">
            ✨ CareCompass AI Active
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-10 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
