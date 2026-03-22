"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";

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

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
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
    <div className="relative min-h-screen flex overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#020617] dark:via-[#0a0f1f] dark:to-[#030b1a] text-gray-900 dark:text-gray-100 transition-colors duration-700">
      
      {/* ─── LIQUID GLASS AMBIENT BACKGROUND ─── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Primary liquid orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/10 dark:from-blue-500/25 dark:to-cyan-400/15 blur-[100px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-emerald-400/15 to-teal-300/8 dark:from-emerald-500/20 dark:to-teal-400/12 blur-[100px] animate-float-reverse" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-violet-400/10 to-fuchsia-300/5 dark:from-violet-500/15 dark:to-fuchsia-400/8 blur-[130px]" />
        
        {/* Secondary accent orbs */}
        <div className="absolute top-[20%] right-[15%] w-[280px] h-[280px] rounded-full bg-blue-300/12 dark:bg-blue-400/15 blur-[80px] animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }} />
        <div className="absolute bottom-[30%] left-[10%] w-[250px] h-[250px] rounded-full bg-emerald-300/12 dark:bg-emerald-400/15 blur-[80px] animate-float-reverse" style={{ animationDelay: '2s', animationDuration: '9s' }} />
        
        {/* Warm accent orb (dark mode depth) */}
        <div className="absolute top-[60%] right-[25%] w-[300px] h-[300px] rounded-full bg-transparent dark:bg-amber-500/6 blur-[100px] animate-float" style={{ animationDelay: '3s', animationDuration: '10s' }} />
        
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* SIDEBAR (Liquid Glass) */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } relative z-20 p-6 border-r border-white/40 dark:border-white/[0.08] backdrop-blur-3xl backdrop-saturate-[1.6] bg-white/50 dark:bg-white/[0.03] shadow-[4px_0_30px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_40px_rgba(0,0,0,0.2),0_0_60px_rgba(59,130,246,0.04)] flex flex-col transition-all duration-500 ease-in-out`}
      >
        {/* 🔥 Premium Edge Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-8 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 transition-all duration-300 z-50 text-gray-500 dark:text-gray-400 focus:outline-none group"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5 group-hover:text-blue-500 transition-colors" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5 group-hover:text-blue-500 transition-colors" />
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
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/[0.08] text-sm font-medium hover:bg-white/80 dark:hover:bg-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all duration-500 backdrop-blur-2xl"
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>

              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center text-red-500/80 dark:text-red-400 text-sm font-bold hover:text-red-600 dark:hover:text-red-300 transition-all duration-300 py-3.5 rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 shadow-sm"
              >
                Sign Out
              </button>

              {user && (
                <div className="mt-4 flex flex-col items-center justify-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Secure Session
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                    {user.email}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* Header (Liquid Glass) */}
        <header className="h-[76px] px-8 flex items-center justify-between border-b border-white/40 dark:border-white/[0.08] backdrop-blur-3xl backdrop-saturate-[1.6] bg-white/50 dark:bg-white/[0.03] sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.2),0_0_60px_rgba(59,130,246,0.04)]">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome back 👋
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Your AI-powered health dashboard
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/[0.08] text-xs font-semibold text-blue-600 dark:text-emerald-400 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            CareCompass AI Active
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-10 mb-8">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>

        {/* ─── DASHBOARD FOOTER ─── */}
        <footer className="mt-auto border-t border-white/40 dark:border-white/[0.08] backdrop-blur-3xl backdrop-saturate-[1.6] bg-white/40 dark:bg-white/[0.02] py-8 px-8 transition-all duration-500 shadow-[0_-4px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.15)]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="CareCompass" className="w-7 h-7 object-contain drop-shadow-sm opacity-90 dark:opacity-100" />
              <span className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                CareCompass AI
              </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-500/80 text-center md:text-left font-medium">
              © {new Date().getFullYear()} CareCompass AI. All rights reserved. <br className="md:hidden" />
              Not a medical diagnostic tool.
            </p>

            <div className="flex gap-5 text-xs font-bold tracking-wide text-gray-500 dark:text-gray-500/80">
              <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors duration-300">Privacy</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors duration-300">Terms</span>
            </div>
          </div>
        </footer>
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
      } px-4 py-3.5 rounded-2xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-blue-500/10 to-emerald-500/10 text-blue-600 dark:text-emerald-400 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-blue-500/20 dark:border-emerald-500/20 backdrop-blur-xl"
          : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-white/[0.04] border border-transparent hover:border-white/50 dark:hover:border-white/[0.06]"
      }`}
    >
      <div className="flex items-center justify-center w-6 h-6 shrink-0">
        {icon}
      </div>

      {!collapsed && (
        <span className="font-medium whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}
