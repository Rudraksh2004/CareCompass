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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="relative min-h-screen flex overflow-x-hidden bg-background text-foreground transition-colors duration-700">
      
      {/* ─── LUMINA AMBIENT BACKGROUND ─── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Deep mesh gradients (Fluid Mesh) */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] animate-fluid-mesh opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-600/10 dark:bg-emerald-600/15 blur-[130px] animate-fluid-mesh [animation-delay:3s] opacity-60" />
        
        {/* Floating Bio-Orbs (Breathe) */}
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] animate-breathe" />
        <div className="absolute bottom-[30%] left-[5%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[110px] animate-breathe [animation-delay:2s]" />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 opacity-[var(--grid-opacity)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" 
             style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.3) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(148,163,184,0.3) 1.5px, transparent 1.5px)', backgroundSize: '64px 64px' }} />
        
        {/* Grainy Noise is handled by glass-grain utility but we keep a soft global base if needed */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] lg:hidden animate-in fade-in duration-500" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Lumina Glass) */}
      <aside
        className={`
          ${collapsed ? "w-20 px-3" : "w-[260px] p-6"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          py-6 fixed top-0 left-0 h-screen z-[110] transition-all duration-500 ease-in-out group/sidebar
          glass-liquid glass-grain glass-refraction border-y-0 border-l-0 rounded-none
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />
        
        {/* Premium Edge Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-5 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high border border-ghost-border shadow-xl z-[120] text-accent-primary focus:outline-none group/btn transition-transform hover:scale-110 active:scale-95`}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5 transition-transform group-hover/btn:rotate-12" />
          ) : (
            <PanelLeftClose className="w-5 h-5 transition-transform group-hover/btn:-rotate-12" />
          )}
        </button>

        {/* Brand */}
        <div className={`mb-10 relative ${collapsed ? "px-0" : "px-2"}`}>
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-4"
            } transition-all duration-500`}
          >
            <div className="relative group/logo flex-shrink-0">
               <div className="absolute -inset-2 bg-gradient-to-tr from-accent-primary to-accent-emerald rounded-2xl blur-lg opacity-0 group-hover/logo:opacity-30 transition-opacity duration-500" />
               <img
                 src="/logo.png"
                 alt="CareCompass Logo"
                 className="w-10 h-10 object-contain relative z-10 transition-transform duration-500 group-hover/logo:scale-110"
               />
            </div>

            {!collapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
                <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-text-primary via-accent-primary to-accent-emerald bg-clip-text text-transparent leading-none italic">
                  CareCompass
                </h1>
                
                <div className="flex items-center gap-1.5 mt-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] leading-none">
                     Neural Core
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-none relative z-10">
          {[
            { href: "/dashboard", icon: <Home className={iconClasses("/dashboard")} />, label: "Dashboard" },
            { href: "/dashboard/report", icon: <FileText className={iconClasses("/dashboard/report")} />, label: "Report Explainer" },
            { href: "/dashboard/prescription", icon: <Pill className={iconClasses("/dashboard/prescription")} />, label: "Simplify Prescription" },
            { href: "/dashboard/health", icon: <LineChart className={iconClasses("/dashboard/health")} />, label: "Health Tracking" },
            { href: "/dashboard/reminders", icon: <Clock className={iconClasses("/dashboard/reminders")} />, label: "Medicine Reminders" },
            { href: "/dashboard/medicine", icon: <FlaskConical className={iconClasses("/dashboard/medicine")} />, label: "Medicine Describer" },
            { href: "/dashboard/disease-predictor", icon: <Brain className={iconClasses("/dashboard/disease-predictor")} />, label: "Disease Predictor" },
            { href: "/dashboard/chat", icon: <Bot className={iconClasses("/dashboard/chat")} />, label: "AI Health Chat" },
            { href: "/dashboard/emergency", icon: <HeartPulse className={iconClasses("/dashboard/emergency")} />, label: "Emergency Card" },
            { href: "/about", icon: <Info className={iconClasses("/about")} />, label: "About Us" },
          ].map((item) => (
            <NavItem
              key={item.href}
              {...item}
              collapsed={collapsed}
              pathname={pathname}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-ghost-border relative z-10">
          <div className="space-y-3">
            <NavItem
              href="/dashboard/profile"
              icon={<User className={iconClasses("/dashboard/profile")} />}
              label="Profile Settings"
              collapsed={collapsed}
              pathname={pathname}
              onClick={() => setMobileMenuOpen(false)}
            />

            {!collapsed && user && (
               <div className="px-3 py-4 rounded-2xl bg-white/5 dark:bg-white/[0.02] border border-ghost-border flex flex-col items-center animate-in fade-in duration-700 group/profile">
                <div className="relative mb-3 group/avatar">
                   <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-emerald rounded-full blur opacity-0 group-hover/avatar:opacity-40 transition duration-500" />
                   {profilePhoto ? (
                      <img src={profilePhoto} className="w-10 h-10 rounded-full object-cover border-2 border-white/20 relative z-10 transition-transform group-hover/avatar:scale-110" alt="Profile" />
                   ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-black text-accent-primary relative z-10 uppercase transition-all group-hover/avatar:scale-110 shadow-lg">
                        {user.email?.charAt(0)}
                      </div>
                   )}
                </div>
                <div className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-1.5 text-center">
                  SECURE CLINICAL UPLINK
                </div>
                <div className="text-[10px] font-bold text-text-primary/90 truncate w-full text-center italic tracking-tight">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer */}
      <div className={`hidden lg:block shrink-0 transition-all duration-500 ${collapsed ? "w-20" : "w-[260px]"}`} />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header (Lumina Glass) */}
        <header className="h-[80px] lg:h-[95px] px-6 lg:px-12 flex items-center justify-between border-b border-ghost-border backdrop-blur-[60px] bg-white/[0.45] dark:bg-background/40 sticky top-0 z-[100] transition-all duration-700">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-3 rounded-xl bg-surface-container-low border border-ghost-border text-text-primary transition-transform active:scale-90"
            >
              <PanelLeftOpen size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tighter text-text-primary italic">
                Bio-Status <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">Center</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="w-2 h-2 rounded-full bg-accent-emerald animate-vital-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted leading-none">Operational Integrity Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={toggleTheme}
              className="w-14 h-14 rounded-2xl bg-surface-container-low border border-ghost-border backdrop-blur-3xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {theme === "dark" ? <Sun className="w-5 h-5 text-accent-amber animate-pulse" /> : <Moon className="w-5 h-5 text-accent-secondary" />}
            </button>

            <div className="hidden lg:flex items-center gap-5 px-8 py-4 rounded-full bg-surface-container-low border border-ghost-border backdrop-blur-3xl transition-all hover:scale-[1.05] hover:shadow-xl group">
               <div className="w-3 h-3 rounded-full bg-accent-emerald animate-vital-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] leading-none mb-1">AI Link Status</span>
                  <span className="text-[11px] font-bold text-text-primary uppercase leading-none tracking-tight">Diagnostic Core Ready</span>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-[1500px] mx-auto animate-fade-in-up">
            {children}
          </div>
        </div>

        {/* ─── DASHBOARD FOOTER ─── */}
        <footer className="mt-auto relative border-t border-ghost-border bg-surface-base/30 backdrop-blur-[100px] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent animate-glow-line" />
          
          <div className="max-w-[1500px] mx-auto px-12 pt-20 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
              <div className="space-y-8 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 group cursor-pointer">
                  <img src="/logo.png" alt="CareCompass" className="w-10 h-10 transition-transform group-hover:rotate-12 duration-500" />
                  <span className="text-2xl font-black tracking-tighter italic text-text-primary">CareCompass</span>
                </div>
                <p className="text-xs font-bold text-text-secondary leading-relaxed uppercase tracking-[0.2em] italic">
                  Advanced High-Fidelity <br />Health Intelligence Node.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  {[
                    { icon: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
                      </svg>
                    ), href: "https://www.instagram.com/__ninja18__/" },
                    { icon: <Linkedin size={16} />, href: "https://www.linkedin.com/in/rudraksh-ganguly-411a39328/" },
                    { icon: <Github size={16} />, href: "https://github.com/Rudraksh2004" },
                  ].map((soc, i) => (
                    <a 
                      key={i} 
                      href={soc.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-11 h-11 rounded-2xl bg-surface-container-low border border-ghost-border flex items-center justify-center text-text-secondary hover:text-accent-primary transition-all shadow-md hover:scale-110 active:scale-95"
                    >
                      {soc.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.5em] mb-10 opacity-70 italic">Services Node</h4>
                <div className="flex flex-col gap-5 text-xs font-black text-text-secondary tracking-tight uppercase italic">
                  <Link href="/dashboard/report" className="hover:text-accent-primary transition-all hover:translate-x-1 inline-block">Report Analyzer</Link>
                  <Link href="/dashboard/disease-predictor" className="hover:text-accent-primary transition-all hover:translate-x-1 inline-block">Predictor Engine</Link>
                  <Link href="/dashboard/reminders" className="hover:text-accent-primary transition-all hover:translate-x-1 inline-block">Medication Lab</Link>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.5em] mb-10 opacity-70 italic">Architecture</h4>
                <div className="flex flex-col gap-5 text-xs font-black text-text-secondary tracking-tight uppercase italic">
                  <Link href="/about" className="hover:text-accent-primary transition-all hover:translate-x-1 inline-block">About Us</Link>
                  <span className="hover:text-accent-primary cursor-pointer transition-all hover:translate-x-1 inline-block">Security Specs</span>
                  <span className="hover:text-accent-primary cursor-pointer transition-all hover:translate-x-1 inline-block">Compliance Node</span>
                  <span className="hover:text-accent-primary cursor-pointer transition-all hover:translate-x-1 inline-block">Protocol Docs</span>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.5em] mb-10 opacity-70 italic">Compliance Deck</h4>
                <div className="flex flex-col gap-5 text-xs font-black text-text-secondary tracking-tight uppercase italic">
                  <span className="hover:text-accent-primary cursor-pointer transition-all hover:translate-x-1 inline-block">Privacy Sandbox</span>
                  <span className="hover:text-accent-primary cursor-pointer transition-all hover:translate-x-1 inline-block">Usage Protocol</span>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-ghost-border flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] italic">
                © {new Date().getFullYear()} CareCompass Protocol Bureau. Integrity Verified.
              </p>
              <div className="flex items-center gap-8">
                <span className="text-[9px] font-black text-accent-emerald uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="relative w-2.5 h-2.5 rounded-full bg-accent-emerald">
                    <div className="absolute inset-0 rounded-full bg-accent-emerald animate-ping opacity-40" />
                  </div>
                  Core Active
                </span>
                <div className="flex gap-4">
                  {["🧪","🛡️","💎"].map(e => (
                    <div key={e} className="w-10 h-10 rounded-xl bg-surface-container-low border border-ghost-border flex items-center justify-center text-sm shadow-inner transition-transform hover:scale-110 cursor-default">
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
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center ${
        collapsed ? "justify-center px-0 w-full" : "gap-4 px-5 w-full"
      } py-3 rounded-2xl transition-all duration-500 ${
        isActive
          ? "bg-white/[0.8] dark:bg-white/[0.08] text-accent-primary shadow-lg border border-white dark:border-white/[0.1] backdrop-blur-[40px] font-black translate-x-1.5"
          : "text-text-secondary hover:text-accent-primary hover:bg-white/60 dark:hover:bg-white/[0.04] border border-transparent hover:border-ghost-border font-black hover:translate-x-1"
      }`}
    >
      {/* Dynamic Active Indicator Glow */}
      {isActive && (
        <>
          <div className="absolute inset-y-2 left-0 w-1.5 bg-gradient-to-b from-accent-primary to-accent-emerald rounded-full shadow-[0_0_15px_rgba(37,99,235,0.7)] z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-transparent pointer-events-none opacity-100" />
        </>
      )}
      
      <div className={`flex items-center justify-center w-6 h-6 shrink-0 z-10 transition-all duration-500 ${isActive ? "scale-110 rotate-3 drop-shadow-md" : "drop-shadow-sm group-hover:scale-110 group-hover:-rotate-3"}`}>
        {icon}
      </div>

      {!collapsed && (
        <span className="whitespace-nowrap translate-y-[0.5px] uppercase tracking-[0.2em] text-[10px] italic">{label}</span>
      )}
    </Link>
  );
}
