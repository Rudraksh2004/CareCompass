"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import {
  ChevronRight,
  Menu,
  X,
  Shield,
  Brain,
  Zap,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  Search,
  FileText,
  Clock,
  Layout,
  Sun,
  Moon,
  Pill,
  LineChart,
  Bot,
  Stethoscope,
  HeartPulse,
  Upload,
  Database,
  Globe,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Send
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── HOOKS ─── */
const useCountUp = (end: number, duration: number = 2000, start: number = 0, trigger: boolean = true) => {
  const [count, setCount] = useState(start);
  useEffect(() => {
    if (!trigger) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * (end - start) + start));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration, start, trigger]);
  return count;
};

/* ─── Star Background Component ─── */
const StarField = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number; pulse: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initStars(); };
    const initStars = () => {
      stars = [];
      const count = isDark ? 150 : 70;
      for (let i = 0; i < count; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2, speed: Math.random() * 0.3 + 0.1, opacity: Math.random() * 0.7 + 0.3, pulse: Math.random() * Math.PI * 2 });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.pulse += 0.01;
        const flicker = 0.5 + Math.sin(star.pulse) * 0.5;
        ctx.fillStyle = isDark ? `rgba(147, 197, 253, ${star.opacity * flicker * 0.6})` : `rgba(59, 130, 246, ${star.opacity * flicker * 0.2})`;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
        star.y -= star.speed; if (star.y < 0) star.y = canvas.height;
      });
      animationFrameId = window.requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize); resize(); draw();
    return () => { window.removeEventListener("resize", resize); window.cancelAnimationFrame(animationFrameId); };
  }, [isDark]);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

/* ─── Trust Marquee ─── */
const TrustMarquee = () => {
  const items = ["HIPAA READY", "END-TO-END ENCRYPTED", "GEMINI 1.5 PRO", "CLINICAL GRADE", "PRIVACY FIRST", "RELIABLE INSIGHTS", "SECURE DATA SILOS"];
  return (
    <div className="w-full py-6 md:py-8 bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl border-y border-white/60 dark:border-white/[0.08] overflow-hidden glass-grain glass-liquid">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-10 md:gap-16 mx-4 md:mx-8">
            <span className="text-[11px] md:text-sm font-black text-gray-700 dark:text-gray-400 tracking-[0.2em] md:tracking-[0.4em] uppercase whitespace-nowrap">{text}</span>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500/50 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

const AccordionItem = ({ title, content }: { title: string, content: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mb-6 rounded-[2.5rem] border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] backdrop-blur-[60px] glass-grain glass-liquid glass-refraction overflow-hidden transition-all duration-500">
            <button onClick={() => setOpen(!open)} className="w-full p-6 md:p-8 flex items-center justify-between text-left group">
                <span className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{title}</span>
                <ChevronDown className={`w-6 h-6 text-blue-500 transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`px-6 md:px-10 overflow-hidden transition-all duration-500 ease-in-out ${open ? "pb-8 md:pb-10 max-h-96" : "max-h-0"}`}>
                <p className="text-lg text-gray-700 dark:text-gray-400 font-bold leading-relaxed">{content}</p>
            </div>
        </div>
    );
};

export default function Home() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { user } = useAuth();
  const isDark = mounted ? theme === "dark" : false;
  const [mobileMenu, setMobileMenu] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const revealRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    
    const observer = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }); }, { threshold: 0.1 });
    revealRefs.current.forEach((r) => r && observer.observe(r));
    const statsObs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) statsObs.observe(statsRef.current);
    
    return () => { 
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect(); 
      statsObs.disconnect(); 
    };
  }, [mounted, lastScrollY]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 dark:from-[#020617] dark:via-[#050b18] dark:to-[#020814] text-gray-900 dark:text-gray-100 overflow-x-hidden scroll-smooth transition-all duration-700">
      
      <div className="fixed inset-0 -z-10 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-1000">
        <StarField isDark={isDark} />
        {/* Dynamic Fluid Mesh - RESTORED & BOOSTED */}
        <div className="absolute inset-0 overflow-hidden opacity-70 dark:opacity-50">
          <div className="absolute top-[-15%] left-[-15%] w-[90%] h-[90%] rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-[130px] animate-fluid-mesh" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[80%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/15 blur-[120px] animate-fluid-mesh [animation-delay:3s]" />
          <div className="absolute top-[25%] right-[5%] w-[50%] h-[50%] rounded-full bg-indigo-400/25 dark:bg-indigo-600/15 blur-[110px] animate-fluid-mesh [animation-delay:5s]" />
          <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] rounded-full bg-rose-400/10 dark:bg-rose-600/10 blur-[100px] animate-fluid-mesh [animation-delay:2s]" />
        </div>
        <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.3) 1.5px, transparent 1.5px)', backgroundSize: '64px 64px' }} />
      </div>

      <header 
        style={{ 
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 6}px) ${visible ? 'translateY(0)' : 'translateY(-150%)'}`,
          transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease, max-width 0.7s ease, top 0.7s ease'
        }}
        className={`fixed ${visible ? "opacity-100" : "opacity-0"} ${scrolled ? "top-3 md:top-6 max-w-[90%] md:max-w-5xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] md:rounded-[3rem]" : "top-6 md:top-10 max-w-[95%] md:max-w-7xl shadow-2xl md:rounded-[3.5rem]"} left-0 right-0 mx-auto border border-white/60 dark:border-white/[0.08] backdrop-blur-[40px] bg-white/50 dark:bg-[#030712]/50 z-50 glass-grain glass-liquid glass-refraction rounded-[2rem]`}
      >
        <div className={`px-5 md:px-10 ${scrolled ? "py-1.5 md:py-3" : "py-2.5 md:py-4"} flex items-center justify-between gap-4 transition-all duration-700`}>
          <Link href="/" className="flex items-center gap-3 md:gap-4 group shrink-0">
            <img src="/logo.png" alt="Logo" className={`${scrolled ? "w-6 h-6 md:w-8 md:h-8" : "w-7 h-7 md:w-11 md:h-11"} transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`} />
            <span className={`${scrolled ? "text-sm md:text-xl" : "text-base md:text-2xl"} font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent italic leading-none transition-all duration-500`}>CareCompass</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {["Services", "FAQ", "Compliance", "Protocol"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className={`${scrolled ? "text-[9px]" : "text-[10px]"} font-black uppercase tracking-[0.3em] text-gray-700 dark:text-gray-400 hover:text-blue-500 transition-all duration-500`}>{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-5">
            <button onClick={toggleTheme} className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-[1.2rem] border border-white/80 dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] flex items-center justify-center hover:scale-110 transition-all shadow-xl group cursor-pointer">
              {isDark ? <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" /> : <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />}
            </button>
            {user ? (
              <Link href="/dashboard" className={`${scrolled ? "px-4 md:px-6 py-2 md:py-2.5" : "px-6 md:px-8 py-3 md:py-3.5"} bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl md:rounded-[1.2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl hover:scale-[1.05] btn-liquid transition-all inline-flex items-center gap-2`}>
                Go to Hub <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden lg:inline-flex text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-400 hover:text-blue-500 transition-colors">Login</Link>
                <Link href="/auth/signup" className={`${scrolled ? "px-4 md:px-6 py-2 md:py-2.5" : "px-6 md:px-8 py-3 md:py-3.5"} hidden sm:inline-flex bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl md:rounded-[1.2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl hover:scale-[1.05] btn-liquid transition-all`}>Get Started</Link>
              </>
            )}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-9 h-9 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white/40 dark:bg-white/[0.05] flex items-center justify-center transition-all z-[60]">
              {mobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Menu Hub */}
        {mobileMenu && (
          <div className="md:hidden absolute top-[115%] left-2 right-2 p-1 rounded-[2.5rem] overflow-hidden border border-white/40 dark:border-white/[0.08] backdrop-blur-[100px] bg-white/90 dark:bg-[#030712]/90 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 fade-in duration-500 z-50">
            <div className="glass-grain p-8 space-y-8">
              <div className="flex flex-col gap-6 items-center text-center">
                {["Services", "FAQ", "Compliance", "Protocol"].map(l => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white hover:text-blue-500 transition-all italic leading-tight active:scale-95">{l}</a>
                ))}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
                <div className="flex flex-col gap-4 w-full">
                  {user ? (
                    <Link href="/dashboard" onClick={() => setMobileMenu(false)} className="w-full py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      Open Hub <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileMenu(false)} className="w-full py-5 rounded-2xl border border-gray-200 dark:border-white/10 font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white active:scale-95 transition-transform">Login</Link>
                      <Link href="/auth/signup" onClick={() => setMobileMenu(false)} className="w-full py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">Join Protocol</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-24 md:pt-36 pb-12 md:pb-32">
        <div className="max-w-6xl mx-auto text-center z-10">
          <div className="animate-fade-in-up inline-flex items-center gap-3 mb-8 md:mb-10 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-white/40 dark:bg-white/[0.04] border border-white/80 dark:border-blue-400/30 text-[8px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.15em] md:tracking-[0.3em] shadow-2xl glass-grain">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 animate-badge-pulse" /> AI HEALTH INTELLIGENCE V3.1
          </div>
          <h1 className="animate-fade-in-up stagger-1 text-4xl md:text-6xl lg:text-[5.5rem] font-black leading-[1.1] md:leading-[0.9] tracking-tighter mb-6 md:mb-10 text-gray-900 dark:text-white px-2">
            Understand Your <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient-shift py-2 md:py-4 block">Health Protocol</span>
          </h1>
          <p className="animate-fade-in-up stagger-2 text-sm md:text-2xl text-gray-800 dark:text-gray-400 max-w-4xl mx-auto mb-12 md:mb-20 leading-relaxed md:leading-[1.3] font-bold italic selection:bg-blue-500/20 px-4">
            The first medical-grade AI engine designed to decode clinical reports, manage pharmacology, and predict health anomalies.
          </p>
          <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto group relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-[2rem] text-base md:text-xl font-black italic shadow-[0_30px_70px_-15px_rgba(59,130,246,0.6)] hover:scale-105 btn-liquid transition-all flex items-center justify-center gap-4 overflow-hidden">
                <span className="relative z-10">Command Center</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-3 transition-transform duration-500" />
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className="w-full sm:w-auto group relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-[2rem] text-base md:text-xl font-black italic shadow-[0_30px_70px_-15px_rgba(59,130,246,0.6)] hover:scale-105 btn-liquid transition-all flex items-center justify-center gap-4 overflow-hidden">
                  <span className="relative z-10">Initialize Tracker</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-3 transition-transform duration-500" />
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-[2rem] border-2 border-slate-200 dark:border-white/[0.1] text-base md:text-xl font-black italic hover:bg-white dark:hover:bg-white/[0.05] transition-all text-center">
                  User Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-4 md:px-6 pb-24 md:pb-40">
        <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal max-w-6xl mx-auto perspective-1000">
          <div className="relative group p-1.5 md:p-3 rounded-[1.5rem] md:rounded-[3.5rem] bg-white/[0.4] dark:bg-[#030712]/40 border border-white/60 dark:border-white/[0.08] backdrop-blur-[60px] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.25)] transition-all hover:rotate-x-2 preserve-3d glass-grain glass-liquid glass-refraction">
             <div className="rounded-[1.3rem] md:rounded-[2.8rem] bg-gray-50 dark:bg-[#0a0f1e] overflow-hidden border border-gray-200/50 dark:border-white/[0.05]">
                <div className="flex items-center gap-3 px-6 md:px-8 py-4 md:py-5 border-b border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02]">
                    <div className="flex gap-2"><div className="w-3 md:w-3.5 h-3 md:h-3.5 rounded-full bg-[#ff5f56]" /><div className="w-3 md:w-3.5 h-3 md:h-3.5 rounded-full bg-[#ffbd2e]" /><div className="w-3 md:w-3.5 h-3 md:h-3.5 rounded-full bg-[#27c93f]" /></div>
                    <div className="flex-1 text-center pr-10 text-[8px] md:text-[10px] font-black uppercase text-gray-600 tracking-[0.1em] md:tracking-[0.2em] truncate">
                      <Lock className="w-2.5 h-2.5 inline mr-2" /> carecompass.ai/secure-node
                    </div>
                </div>
                <div className="p-6 md:p-16 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
                    <div className="hidden md:block col-span-1 space-y-6 opacity-30">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/40" />
                        {[...Array(6)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-200 dark:bg-white/5" />)}
                    </div>
                    <div className="col-span-1 md:col-span-3 space-y-6 md:space-y-8">
                        <div className="h-24 md:h-44 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border dark:border-white/[0.05] p-5 md:p-10 flex flex-col justify-center">
                            <div className="h-3 md:h-6 w-32 md:w-72 bg-blue-500/30 rounded-full mb-3 md:mb-4" />
                            <div className="h-1.5 md:h-3 w-full max-w-xs md:max-w-md bg-gray-200 dark:bg-white/5 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                            <div className="h-24 md:h-40 rounded-xl md:rounded-[2rem] bg-white dark:bg-white/[0.04] p-5 md:p-8 border border-gray-200 dark:border-white/[0.05] transition-all group-hover:bg-white/60 dark:group-hover:bg-white/[0.08]"><div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-emerald-500/20 mb-4 md:mb-6" /><div className="h-2 md:h-4 w-20 md:w-32 bg-gray-200 dark:bg-white/10 rounded-full" /></div>
                            <div className="h-24 md:h-40 rounded-xl md:rounded-[2rem] bg-white dark:bg-white/[0.04] p-5 md:p-8 border border-gray-200 dark:border-white/[0.05] transition-all group-hover:bg-white/60 dark:group-hover:bg-white/[0.08]"><div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-blue-500/20 mb-4 md:mb-6" /><div className="h-2 md:h-4 w-20 md:w-32 bg-gray-200 dark:bg-white/10 rounded-full" /></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <TrustMarquee />

      {/* CORE FEATURES SECTION (Detailed) */}
      <section id="services" className="px-6 py-24 md:py-40 max-w-7xl mx-auto">
        <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal text-center mb-16 md:mb-32">
          <span className="inline-flex items-center gap-3 mb-6 md:mb-8 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] md:tracking-[0.4em]">INTELLIGENCE MODULES</span>
          <h2 className="text-3xl md:text-6xl font-black mb-6 md:mb-10 tracking-tighter leading-tight md:leading-[1.1]">Clinical-Grade <br /><span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent italic">AI Engines</span></h2>
          <p className="text-gray-700 dark:text-gray-400 max-w-4xl mx-auto text-base md:text-xl font-bold leading-relaxed">Six specialized nodes operating in tandem to provide a comprehensive health sovereignty framework.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {fullFeatures.map((f, i) => (
              <div key={i} ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className={`reveal stagger-${i + 1} group relative rounded-[2.5rem] md:rounded-[3.5rem] p-[1.5px] transition-all hover:-translate-y-4`}>
              <div className="absolute inset-0 rounded-[1.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-blue-500/40 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white/[0.5] dark:bg-[#030712]/40 backdrop-blur-[60px] rounded-[1.4rem] md:rounded-[3.4rem] p-6 md:p-12 h-full border border-white/60 dark:border-white/[0.08] shadow-2xl glass-grain glass-liquid glass-refraction overflow-hidden">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-8 md:mb-12 shadow-2xl group-hover:scale-110 transition-all duration-700 text-white`}>
                   <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
                    {f.icon}
                   </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">{f.title}</h3>
                <p className="text-gray-700 dark:text-gray-400 leading-relaxed text-base md:text-lg font-bold mb-6 md:mb-8 italic">{f.description}</p>
                <div className="space-y-3 md:space-y-4">
                    {f.highlights.map((h, j) => (
                        <div key={j} className="flex items-center gap-3 text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 flex-shrink-0" /> {h}</div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (Protocol) */}
      <section id="protocol" className="py-24 md:py-40 px-6 bg-white/30 dark:bg-white/[0.01] border-y border-white/20 dark:border-white/[0.05] glass-grain">
        <div className="max-w-7xl mx-auto text-center mb-16 md:mb-32">
          <span className="text-[9px] md:text-[10px] font-black text-blue-500 tracking-[0.2em] md:tracking-[0.4em] mb-4 block uppercase leading-none">The CareCompass Method</span>
          <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white italic uppercase">Operational Protocol</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
            {protocolSteps.map((s, i) => (
              <div key={i} ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className={`reveal stagger-${i + 1} text-center group`}>
                <div className="w-[80px] md:w-[140px] h-[80px] md:h-[140px] mx-auto rounded-[1.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center mb-6 md:mb-12 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all text-white">
                   <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center">
                    {s.icon}
                   </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{s.title}</h3>
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-400 font-bold leading-relaxed px-4 md:px-6">{s.description}</p>
              </div>
            ))}
        </div>
      </section>

      {/* COMPLIANCE & SECURITY */}
      <section id="compliance" className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal text-center lg:text-left">
                <span className="text-[10px] md:text-xs font-black text-emerald-500 tracking-[0.3em] md:tracking-[0.5em] mb-6 md:mb-8 block uppercase">FORTRESS ARCHITECTURE</span>
                <h2 className="text-3xl md:text-6xl font-black mb-8 md:mb-12 tracking-tighter leading-tight md:leading-none italic uppercase">Sovereign Data <br />Security</h2>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-400 font-bold leading-relaxed mb-12 md:mb-16 italic">Every dataset is siloed, encrypted, and processed on dedicated Gemini instances to ensure clinical-grade privacy.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                    {complianceStats.map((s, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] shadow-xl">
                            <div className="text-xl md:text-3xl font-black text-blue-500 mb-1 md:mb-4 italic uppercase">{s.label}</div>
                            <div className="text-[9px] md:text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal stagger-2 relative group">
                <div className="absolute inset-x-0 inset-y-0 bg-blue-500/10 md:bg-blue-500/20 blur-[100px] md:blur-[150px] rounded-full group-hover:bg-blue-500/30 transition-all duration-1000" />
                <div className="relative p-1.5 rounded-[1.5rem] md:rounded-[4rem] bg-white/20 dark:bg-white/[0.02] border border-white/60 dark:border-white/[0.08] backdrop-blur-[80px] overflow-hidden glass-grain glass-liquid glass-refraction shadow-2xl">
                    <div className="p-8 md:p-16 space-y-10 md:space-y-12">
                        {[
                          { icon: <Lock className="w-6 h-6 md:w-8 md:h-8" />, label: "AES-256 Encryption", desc: "Military-grade data transit", color: "emerald" },
                          { icon: <Database className="w-6 h-6 md:w-8 md:h-8" />, label: "Encrypted Silos", desc: "No cross-user leakage", color: "blue" },
                          { icon: <Globe className="w-6 h-6 md:w-8 md:h-8" />, label: "HIPAA & GDPR", desc: "International standards", color: "indigo" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-6 md:gap-8">
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-${item.color}-500/20 flex items-center justify-center text-${item.color}-500 flex-shrink-0`}>{item.icon}</div>
                            <div>
                              <div className="text-base md:text-lg font-black uppercase text-gray-900 dark:text-white tracking-widest italic leading-tight">{item.label}</div>
                              <div className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 italic mt-1">{item.desc}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 md:py-40 px-6 bg-white/10 dark:bg-white/[0.01] glass-grain glass-liquid">
        <div className="max-w-4xl mx-auto">
            <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal text-center mb-16 md:mb-24">
                <span className="text-[9px] md:text-[10px] font-black text-blue-500 tracking-[0.4em] mb-4 block uppercase leading-none">Common Inquiries</span>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white italic uppercase">Intelligence FAQ</h2>
            </div>
            {faqs.map((f, i) => (
                <AccordionItem key={i} title={f.q} content={f.a} />
            ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 md:py-24 px-6" ref={statsRef}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {mainStats.map((s, i) => (
                <div key={i} className="text-center group p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/[0.1] backdrop-blur-[60px] glass-grain glass-liquid glass-refraction hover:-translate-y-4 transition-all">
                    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3 md:mb-4 italic">{s.v}</div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-700 dark:text-gray-400">{s.l}</div>
                </div>
            ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 md:px-6 py-24 md:py-40">
        <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal relative max-w-7xl mx-auto overflow-hidden rounded-[2.5rem] md:rounded-[4.5rem] border border-white/20 dark:border-white/[0.1] shadow-[0_100px_180px_-40px_rgba(0,0,0,0.3)] glass-grain glass-liquid glass-refraction bg-blue-600">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 animate-gradient-shift opacity-90" /><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
            <div className="relative z-10 p-10 md:p-32 text-center flex flex-col items-center">
                <h2 className="text-3xl md:text-[5.5rem] font-black mb-8 md:mb-14 text-white leading-[1.1] md:leading-[0.9] tracking-tighter uppercase italic">Secure Your <br />Health Node</h2>
                <p className="text-white/80 text-base md:text-2xl mb-12 md:mb-20 max-w-4xl mx-auto leading-relaxed font-bold italic selection:bg-white/20">The future of clinical intelligence is sovereign. Join the 400+ health architects already decoding their timeline with CareCompass.</p>
                <Link href="/auth/signup" className="group bg-white text-gray-900 px-6 md:px-12 py-3.5 md:py-6 rounded-xl md:rounded-[2rem] text-base md:text-2xl font-black uppercase tracking-tighter shadow-2xl hover:scale-110 active:scale-95 transition-all">Initialize Now</Link>
            </div>
        </div>
      </section>

      <footer className="relative mt-24 md:mt-32 border-t border-white/80 dark:border-white/[0.08] bg-white/40 dark:bg-[#030712]/30 backdrop-blur-[120px] overflow-hidden">
        {/* ─── AMBIENT BACKGROUND GLOWS ─── */}
        <div className="absolute top-0 left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-blue-500/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-emerald-500/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12">
          {/* ─── NEURAL UPLINK (Sub-footer CTA) ─── */}
          <div className="mb-10 md:mb-24 p-6 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] bg-white/30 dark:bg-white/[0.02] border border-white/30 dark:border-white/[0.08] backdrop-blur-[80px] flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 group transition-all duration-700 hover:border-blue-500/30 shadow-2xl glass-grain glass-liquid glass-refraction">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic mb-3">Neural <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Uplink</span></h3>
              <p className="text-gray-800 dark:text-gray-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-[9px] md:text-[10px] leading-relaxed">
                Connect your node to the latest clinical developments and protocol updates.
              </p>
            </div>
            <div className="w-full lg:w-[450px] relative group/input">
              <input 
                type="email" 
                placeholder="SECURE EMAIL ADDRESS..." 
                className="w-full bg-white/40 dark:bg-white/[0.03] border border-white/80 dark:border-white/[0.1] rounded-xl md:rounded-2xl px-5 md:px-8 py-3.5 md:py-5 text-[9px] md:text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder-gray-500/60 dark:placeholder-gray-400/50 text-gray-900 dark:text-white"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-5 md:px-8 rounded-lg md:rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-lg active:scale-95">
                <Send className="w-4 h-4 transition-transform group-hover/input:translate-x-1" />
              </button>
            </div>
          </div>

          {/* ─── 4-COLUMN PREMIUM GRID ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 lg:gap-12 mb-16 md:mb-24">
            {/* Identity Node */}
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 group cursor-pointer">
                <img src="/logo.png" alt="CareCompass" className="w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:rotate-12 duration-500" />
                <span className="text-xl md:text-2xl font-black tracking-tighter italic bg-gradient-to-r from-blue-800 to-indigo-800 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">CareCompass</span>
              </div>
              <p className="text-gray-800 dark:text-gray-400 text-xs md:text-sm font-bold italic leading-relaxed max-w-xs">
                Empowering healthcare decisions with high-fidelity, medical-grade AI intelligence and autonomous diagnostic insights.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: (
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
                    </svg>
                  ), href: "https://www.instagram.com/__ninja18__/" },
                  { icon: <Linkedin size={18} />, href: "https://www.linkedin.com/in/rudraksh-ganguly-411a39328/" },
                  { icon: <Github size={18} />, href: "https://github.com/Rudraksh2004" },
                ].map((soc, i) => (
                  <a 
                    key={i} 
                    href={soc.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-[1.2rem] bg-white/40 dark:bg-white/[0.04] border border-white/80 dark:border-white/[0.08] flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:scale-110 transition-all shadow-md group/soc"
                  >
                     <div className="group-hover/soc:scale-110 transition-transform">{soc.icon}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Services Protocol */}
            <div>
              <h4 className="text-[9px] md:text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-10 opacity-70 italic">Services Node</h4>
              <ul className="space-y-4 md:space-y-5 text-xs md:text-sm font-black text-gray-800 dark:text-gray-400 tracking-tight uppercase italic font-bold">
                <li><Link href="/dashboard/report" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Report Analyzer</Link></li>
                <li><Link href="/dashboard/disease-predictor" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Disease Predictor</Link></li>
                <li><Link href="/dashboard/reminders" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Medicine Details</Link></li>
                <li><Link href="/dashboard/chat" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Diagnostic Chat</Link></li>
              </ul>
            </div>

            {/* Architecture Node */}
            <div>
              <h4 className="text-[9px] md:text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-10 opacity-70 italic">Infrastructure</h4>
              <ul className="space-y-4 md:space-y-5 text-xs md:text-sm font-black text-gray-800 dark:text-gray-400 tracking-tight uppercase italic font-bold">
                <li><Link href="/about" className="hover:text-blue-600 hover:translate-x-1 block transition-all">About Us</Link></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Security Protocol</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">HIPAA Ready</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Contact Hub</a></li>
              </ul>
            </div>

            {/* Compliance Node */}
            <div>
              <h4 className="text-[9px] md:text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-10 opacity-70 italic">Compliance Deck</h4>
              <ul className="space-y-4 md:space-y-5 text-xs md:text-sm font-black text-gray-800 dark:text-gray-400 tracking-tight uppercase italic font-bold">
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Privacy Sandbox</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Usage Terms</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Cookie Protocol</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:translate-x-1 block transition-all">Legal Disclaimer</a></li>
              </ul>
            </div>
          </div>

          {/* ─── BOTTOM STATUS & COPYRIGHT ─── */}
          <div className="pt-12 border-t border-white/60 dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black text-gray-800 dark:text-gray-500 uppercase tracking-widest italic">
              © {new Date().getFullYear()} CareCompass AI Bureau. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="relative w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500">
                  <div className="absolute inset-0 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-ping opacity-40" />
                </div>
                Diagnostic Core Active
              </span>
              <div className="w-px h-4 bg-gray-200 dark:bg-white/10 hidden md:block" />
              <div className="flex gap-3">
                {["🔬","🛡️","💎"].map(e => (
                  <div key={e} className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-white dark:border-white/[0.08] flex items-center justify-center text-sm shadow-inner transition-transform hover:scale-110 cursor-default">
                    {e}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const fullFeatures = [
  { icon: <Brain className="w-12 h-12 text-white" />, title: "Disease Predictor", description: "Advanced diagnostic-modeling engine that evaluates symptom clusters to predict pharmacological risks and chronic potential.", alignment: "left", highlights: ["Gemini 1.5 Pro powered", "85%+ accuracy modeling", "Temporal trend analysis"], gradient: "from-blue-600 to-blue-800" },
  { icon: <Pill className="w-12 h-12 text-white" />, title: "Meds Manager", description: "Dynamic medicine reminder system with cross-reactive drug interaction monitoring and dosage precision logic.", alignment: "center", highlights: ["Voice reminders", "Stock monitoring", "Family sync"], gradient: "from-violet-600 to-indigo-800" },
  { icon: <FileText className="w-12 h-12 text-white" />, title: "Report Explainer", description: "Translate complex clinical terminology into actionable health intelligence. Supports pathology, radiology, and blood work.", alignment: "right", highlights: ["OCR engine integration", "Instant decoding", "Med-jargon mapping"], gradient: "from-emerald-600 to-teal-800" },
  { icon: <Activity className="w-12 h-12 text-white" />, title: "Vitals Analytics", description: "Monitor BP, Glucose, Heart Rate, and Oxygen levels with medical-grade visualization and alert system.", alignment: "left", highlights: ["Real-time charting", "Threshold alerts", "Historical exports"], gradient: "from-cyan-600 to-blue-800" },
  { icon: <Stethoscope className="w-12 h-12 text-white" />, title: "Consult Connect", description: "Secure networking with medical professionals and localized specialist referrals based on AI risk-modeling.", alignment: "center", highlights: ["Verified specialists", "Encrypted history", "Local referral"], gradient: "from-rose-600 to-pink-800" },
  { icon: <Shield className="w-12 h-12 text-white" />, title: "Emergency ID", description: "Instant access to critical medical data for first responders. One-tap sharing of allergies, blood group, and emergency contacts.", alignment: "right", highlights: ["Quick-access QR", "Offline support", "Contact cascading"], gradient: "from-orange-600 to-red-800" },
];

const protocolSteps = [
    { icon: <Upload className="w-16 h-16 text-white" />, title: "Secure Ingest", description: "Encrypted data injection into your private CareCompass vault." },
    { icon: <Search className="w-16 h-16 text-white" />, title: "AI Inference", description: "Deep-layer processing via Gemini 1.5 Pro clinical intelligence nodes." },
    { icon: <CheckCircle2 className="w-16 h-16 text-white" />, title: "Health Output", description: "Actionable, non-diagnostic insights delivered via Liquid Glass UI." },
];

const complianceStats = [
    { label: "100%", desc: "HIPAA ELIGIBLE Stack" },
    { label: "AES", desc: "Military Grade Encryption" },
    { label: "E2E", desc: "Private Signal Protocol" },
    { label: "SOC2", desc: "System Oversight Ready" },
];

const mainStats = [
    { v: "6+", l: "AI CORE NODES" },
    { v: "100%", l: "DATA PRIVACY" },
    { v: "24/7", l: "VITAL MONITORING" },
    { v: "∞", l: "SECURE CLOUD STORAGE" },
];

const faqs = [
    { q: "Is CareCompass a medical diagnostic tool?", a: "No. CareCompass is an interpretative clinical-grade AI platform intended for informational use and wellness awareness. It should never replace professional medical diagnosis." },
    { q: "How is my medical data stored?", a: "Your data is end-to-end encrypted and siloed in dedicated private instances. We do not sell or share data with third parties or insurance providers." },
    { q: "Can I share my reports with my doctor?", a: "Yes. CareCompass provides secure export protocols designed to facilitate deeper, more informed medical consultations with your healthcare provider." },
    { q: "What AI model powers project?", a: "CareCompass leverages Google's Gemini 1.5 Pro with custom-tuned medical prompt-engineering to ensure high precision in interpretative tasks." }
];
