"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";

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
  Sun,
  Moon,
  LogOut,
  Settings,
  Twitter,
  Linkedin,
  Github,
  Info
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const profile: any = await getUserProfile(user.uid);
          if (profile?.photoURL) {
            setProfilePhoto(profile.photoURL);
          }
        } catch (error) {
          console.error("Sidebar Bio-Retrieval Error:", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const iconClasses = (path: string) => {
    const isActive = pathname === path;

    return `w-5 h-5 transition-all duration-500 ${
      isActive
        ? "scale-110 text-blue-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        : "text-gray-500 group-hover:scale-110 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
    }`;
  };

  return (
    <div className="relative min-h-screen flex overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#020617] dark:via-[#0a0f1f] dark:to-[#030b1a] text-gray-900 dark:text-gray-100 transition-colors duration-700">
      
      {/* ─── LIQUID GLASS AMBIENT BACKGROUND ─── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Deep mesh gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-transparent blur-[120px] animate-float opacity-70" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[1200px] h-[1200px] rounded-full bg-gradient-to-tl from-emerald-600/15 via-teal-500/10 to-transparent blur-[130px] animate-float-reverse opacity-60" />
        
        {/* Floating Bio-Orbs */}
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/8 blur-[110px] animate-pulse-slow delay-1000" />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Grainy Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      {/* SIDEBAR (Liquid Glass) - Fixed for constant visibility */}
      <aside
        className={`${
          collapsed ? "w-20 px-3" : "w-[260px] p-6"
        } py-6 fixed top-0 left-0 h-screen z-50 border-r border-white/80 dark:border-white/[0.08] border-r-white/40 bg-white/[0.6] dark:bg-[#030712]/50 backdrop-blur-[50px] backdrop-saturate-[2.5] shadow-[12px_0_60px_rgba(0,0,0,0.04)] dark:shadow-[12px_0_60_rgba(0,0,0,0.4)] flex flex-col transition-all duration-500 ease-in-out group/sidebar`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] via-transparent to-emerald-500/[0.02] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-1000" />
        {/* 🔥 Premium Edge Collapse Button (Always Visible in Center) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#111827] border-2 border-blue-500/30 dark:border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-110 transition-all duration-500 z-[100] text-blue-600 dark:text-blue-400 focus:outline-none group`}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5 transition-transform group-hover:rotate-12" />
          ) : (
            <PanelLeftClose className="w-5 h-5 transition-transform group-hover:-rotate-12" />
          )}
        </button>

        {/* Brand */}
        <div className={`mb-6 relative ${collapsed ? "px-0" : "px-2"}`}>
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-4"
            } transition-all duration-500`}
          >
            <div className="relative group/logo flex-shrink-0">
               <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl blur-lg opacity-0 group-hover/logo:opacity-40 transition-opacity duration-500" />
               <img
                 src="/logo.png"
                 alt="CareCompass Logo"
                 className="w-10 h-10 object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 group-hover/logo:scale-110"
               />
            </div>

            {!collapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
                <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-blue-600 to-emerald-500 dark:from-white dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent leading-none">
                  CareCompass
                </h1>
                
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] font-black text-gray-800 dark:text-gray-400 uppercase tracking-widest leading-none">
                     Neural Core
                   </p>
                </div>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="absolute -bottom-4 left-2 right-2 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-none">
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
          <NavItem
            href="/about"
            icon={<Info className={iconClasses("/about")} />}
            label="About Us"
            collapsed={collapsed}
            pathname={pathname}
          />
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-white/80 dark:border-white/[0.08] relative">
          <div className="space-y-3">
            <NavItem
              href="/dashboard/profile"
              icon={<User className={iconClasses("/dashboard/profile")} />}
              label="Profile Settings"
              collapsed={collapsed}
              pathname={pathname}
            />

            {!collapsed && user && (
               <div className="px-3 py-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-emerald-500/5 border border-white/20 dark:border-white/[0.03] flex flex-col items-center animate-in fade-in duration-700">
                <div className="relative mb-3 group/avatar">
                   <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full blur opacity-25 group-hover/avatar:opacity-50 transition duration-500" />
                   {profilePhoto ? (
                      <img src={profilePhoto} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-white/10 relative z-10" alt="Profile" />
                   ) : (
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-white/10 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-blue-400 relative z-10 uppercase transition-all">
                        {user.email?.charAt(0)}
                      </div>
                   )}
                </div>
                <div className="text-[7.5px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 text-center">
                  SECURE CLINICAL UPLINK
                </div>
                <div className="text-[9.5px] font-bold text-gray-900 dark:text-white/80 truncate w-full text-center">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer to keep main content from going under the fixed sidebar */}
      <div className={`shrink-0 transition-all duration-500 ${collapsed ? "w-20" : "w-[260px]"}`} />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* Header (Liquid Glass) */}
        <header className="h-[90px] px-10 flex items-center justify-between border-b border-white/80 dark:border-white/[0.08] backdrop-blur-[60px] bg-white/[0.4] dark:bg-[#030712]/40 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-700">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                Bio-Status <span className="text-blue-600 dark:text-blue-500">Center</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 dark:text-gray-500">Operational Integrity Active</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-white dark:border-white/[0.08] backdrop-blur-3xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400 animate-pulse" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <div className="hidden lg:flex items-center gap-4 px-6 py-3 rounded-[2rem] bg-white/40 dark:bg-white/[0.03] border border-white dark:border-white/[0.08] backdrop-blur-3xl transition-all hover:scale-[1.05] hover:shadow-xl group">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">AI Link Status</span>
                  <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase leading-none">Diagnostic Core Ready</span>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>

        {/* ─── DASHBOARD FOOTER (Liquid Glass) ─── */}
        <footer className="mt-auto relative border-t border-white/80 dark:border-white/[0.08] bg-white/40 dark:bg-[#030712]/30 backdrop-blur-[100px] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" />
          
          <div className="max-w-[1400px] mx-auto px-10 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
              {/* Identity Node */}
              <div className="space-y-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 group cursor-pointer">
                  <img src="/logo.png" alt="CareCompass" className="w-10 h-10 transition-transform group-hover:rotate-12 duration-500" />
                  <span className="text-xl font-black tracking-tighter italic dark:text-white text-gray-900">CareCompass</span>
                </div>
                <p className="text-[10px] font-bold text-gray-800 dark:text-gray-400 leading-relaxed uppercase tracking-widest italic">
                  Advanced High-Fidelity <br />Health Intelligence Node.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {[
                    { icon: <Twitter size={14} />, href: "#" },
                    { icon: <Linkedin size={14} />, href: "#" },
                    { icon: <Github size={14} />, href: "#" },
                  ].map((soc, i) => (
                    <a key={i} href={soc.href} className="w-9 h-9 rounded-xl bg-white/40 dark:bg-white/[0.05] border border-white/80 dark:border-white/[0.08] flex items-center justify-center text-gray-700 dark:text-gray-400 hover:text-blue-500 transition-all shadow-sm">
                      {soc.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Module Protocol */}
              <div className="text-center md:text-left">
                <h4 className="text-[9px] font-black text-gray-950 dark:text-white uppercase tracking-[0.4em] mb-8 opacity-70">Services Node</h4>
                <div className="flex flex-col gap-4 text-[11px] font-black text-gray-700 dark:text-gray-400 tracking-tight uppercase italic">
                  <Link href="/dashboard/report" className="hover:text-blue-600 transition-all">Report Analyzer</Link>
                  <Link href="/dashboard/disease-predictor" className="hover:text-blue-600 transition-all">Predictor Engine</Link>
                  <Link href="/dashboard/reminders" className="hover:text-blue-600 transition-all">Medication Lab</Link>
                </div>
              </div>

              {/* Arch Node */}
              <div className="text-center md:text-left">
                <h4 className="text-[9px] font-black text-gray-950 dark:text-white uppercase tracking-[0.4em] mb-8 opacity-70">Architecture</h4>
                <div className="flex flex-col gap-4 text-[11px] font-black text-gray-700 dark:text-gray-400 tracking-tight uppercase italic">
                  <Link href="/about" className="hover:text-blue-600 transition-all">About Us</Link>
                  <span className="hover:text-blue-600 cursor-pointer transition-all">Security Specs</span>
                  <span className="hover:text-blue-600 cursor-pointer transition-all">Compliance Node</span>
                  <span className="hover:text-blue-600 cursor-pointer transition-all">Protocol Docs</span>
                </div>
              </div>

              {/* Legal Node */}
              <div className="text-center md:text-left">
                <h4 className="text-[9px] font-black text-gray-950 dark:text-white uppercase tracking-[0.4em] mb-8 opacity-70">Compliance Deck</h4>
                <div className="flex flex-col gap-4 text-[11px] font-black text-gray-700 dark:text-gray-400 tracking-tight uppercase italic">
                  <span className="hover:text-blue-600 cursor-pointer transition-all">Privacy Sandbox</span>
                  <span className="hover:text-blue-600 cursor-pointer transition-all">Usage Protocol</span>
                </div>
              </div>
            </div>

            {/* Bottom: Status & Copyright */}
            <div className="pt-10 border-t border-white/60 dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[9px] font-black text-gray-800 dark:text-gray-400 uppercase tracking-widest italic">
                © {new Date().getFullYear()} CareCompass Protocol Bureau. Integrity Verified.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="relative w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500">
                    <div className="absolute inset-0 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-ping opacity-40" />
                  </div>
                  Core Active
                </span>
                <div className="flex gap-2">
                  {["🧪","🛡️"].map(e => (
                    <div key={e} className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/[0.03] border border-white dark:border-white/[0.08] flex items-center justify-center text-xs shadow-inner">
                      {e}
                    </div>
                  ))}
                </div>
              </div>
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
        collapsed ? "justify-center px-0 w-full" : "gap-3 px-4 w-full"
      } py-2 rounded-xl transition-all duration-500 overflow-hidden ${
        isActive
          ? "bg-white/[0.9] dark:bg-white/[0.07] text-blue-700 dark:text-emerald-300 shadow-md dark:shadow-xl border border-white dark:border-white/[0.12] backdrop-blur-[40px] font-black translate-x-1"
          : "text-gray-800 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/70 dark:hover:bg-white/[0.04] border border-transparent hover:border-white/70 dark:hover:border-white/[0.07] font-black hover:translate-x-1"
      }`}
    >
      {/* Dynamic Active Indicator Glow */}
      {isActive && (
        <>
          <div className="absolute inset-y-2 left-0 w-1 bg-gradient-to-b from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-300 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)] z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent dark:from-emerald-500/10 pointer-events-none opacity-100" />
        </>
      )}
      
      <div className={`flex items-center justify-center w-6 h-6 shrink-0 z-10 transition-all duration-500 ${isActive ? "scale-110 rotate-3 drop-shadow-md" : "drop-shadow-sm group-hover:scale-110 group-hover:-rotate-3"}`}>
        {icon}
      </div>

      {!collapsed && (
        <span className="whitespace-nowrap translate-y-[0.5px] uppercase tracking-wider text-[10px]">{label}</span>
      )}
    </Link>
  );
}
