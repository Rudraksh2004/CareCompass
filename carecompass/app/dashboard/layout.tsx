"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react"; // ⭐ NEW (safe)
import {
  Home,
  FileText,
  Pill,
  LineChart,
  Clock,
  FlaskConical,
  Brain,
  HeartPulse,
  Bot,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // ⭐ ONLY NEW STATE (NON-BREAKING)
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

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
    <div className="relative min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* 🌟 SIDEBAR */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } p-6 border-r border-white/10 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] flex flex-col transition-all duration-300`}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 mx-auto flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 border border-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-lg shadow-lg hover:scale-105"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-white" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Brand */}
        <div className="mb-10">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <img
              src="/logo.png"
              alt="CareCompass Logo"
              className="w-10 h-10 object-contain drop-shadow-lg"
            />

            {!collapsed && (
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  CareCompass
                </h1>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  AI Health Companion
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem
            href="/dashboard"
            icon={<Home className={iconClasses("/dashboard")} />}
            label="Dashboard"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/report"
            icon={<FileText className={iconClasses("/dashboard/report")} />}
            label="Report Explainer"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/prescription"
            icon={<Pill className={iconClasses("/dashboard/prescription")} />}
            label="Simplify Prescription"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/health"
            icon={<LineChart className={iconClasses("/dashboard/health")} />}
            label="Health Tracking"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/reminders"
            icon={<Clock className={iconClasses("/dashboard/reminders")} />}
            label="Medicine Reminders"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/medicine"
            icon={
              <FlaskConical className={iconClasses("/dashboard/medicine")} />
            }
            label="Medicine Describer"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/disease-predictor"
            icon={
              <Brain className={iconClasses("/dashboard/disease-predictor")} />
            }
            label="Disease Predictor"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/chat"
            icon={<Bot className={iconClasses("/dashboard/chat")} />}
            label="AI Health Chat"
            collapsed={collapsed}
            pathname={pathname}
          />

          <NavItem
            href="/dashboard/emergency"
            icon={
              <HeartPulse className={iconClasses("/dashboard/emergency")} />
            }
            label="Emergency Card"
            collapsed={collapsed}
            pathname={pathname}
          />
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
          <NavItem
            href="/dashboard/profile"
            icon={<User className={iconClasses("/dashboard/profile")} />}
            label="Profile"
            collapsed={collapsed}
            pathname={pathname}
          />

          {!collapsed && (
            <>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur border border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:scale-[1.03] transition"
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-red-500 text-sm font-semibold hover:text-red-600 transition py-2 rounded-xl hover:bg-red-500/10"
              >
                Logout
              </button>

              {user && (
                <div className="mt-3 text-xs text-gray-400 text-center truncate">
                  Logged in as {user.email}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-white/10 bg-white/60 dark:bg-[#020617]/60 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Welcome back 👋
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your AI-powered health dashboard
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-200 dark:border-emerald-900 text-xs font-medium text-blue-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
            ✨ CareCompass AI Active
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  collapsed,
  pathname,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`group relative flex items-center ${
        collapsed ? "justify-center" : "gap-3"
      } px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-blue-500/10 to-emerald-500/10 text-blue-600 dark:text-emerald-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
      }`}
    >
      {/* 🔥 FIX: Fixed icon container (prevents disappearing icons) */}
      <div className="flex items-center justify-center w-6 h-6 shrink-0">
        {icon}
      </div>

      {/* Label only when expanded (UNCHANGED behavior) */}
      {!collapsed && (
        <span className="font-medium whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}
