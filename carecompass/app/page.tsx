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
} from "lucide-react";

/* ─── HOOKS ─── */
const useCountUp = (end: number, duration: number = 2000, start: number = 0, trigger: boolean = true) => {
  const [count, setCount] = useState(start);
  useEffect(() => {
    if (!trigger) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = isDark ? 150 : 70;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.7 + 0.3,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.pulse += 0.01;
        const flicker = 0.5 + Math.sin(star.pulse) * 0.5;
        ctx.fillStyle = isDark 
          ? `rgba(147, 197, 253, ${star.opacity * flicker * 0.6})` 
          : `rgba(59, 130, 246, ${star.opacity * flicker * 0.2})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y -= star.speed;
        if (star.y < 0) star.y = canvas.height;
      });
      animationFrameId = window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

/* ─── Trust Marquee ─── */
const TrustMarquee = () => {
  const items = [
    "HIPAA READY", "END-TO-END ENCRYPTED", "GEMINI 1.5 PRO", "CLINICAL GRADE", 
    "PRIVACY FIRST", "RELIABLE INSIGHTS", "SECURE DATA SILOS"
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full py-8 bg-white/30 dark:bg-white/[0.01] backdrop-blur-3xl border-y border-white/40 dark:border-white/[0.06] overflow-hidden glass-grain">
      <div className="flex whitespace-nowrap animate-marquee">
        {doubled.map((text, i) => (
          <div key={i} className="flex items-center gap-16 mx-8">
            <span className="text-sm font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase">{text}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── MAIN HOME COMPONENT ─── */
export default function Home() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;
  const [mobileMenu, setMobileMenu] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const revealRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    const statsObs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) statsObs.observe(statsRef.current);

    return () => {
      observer.disconnect();
      statsObs.disconnect();
    };
  }, [mounted]);

  const addRevealRef = useCallback((el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  }, []);

  const toolCount = useCountUp(6, 1800, 0, statsVisible);
  const availCount = useCountUp(24, 1600, 0, statsVisible);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 dark:from-[#020617] dark:via-[#050b18] dark:to-[#020814] text-gray-900 dark:text-gray-100 overflow-hidden scroll-smooth transition-colors duration-700">
      
      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="fixed inset-0 -z-10">
        <StarField isDark={isDark} />
        {/* Large Liquid Orbs */}
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] rounded-full bg-blue-500/15 dark:bg-blue-600/20 blur-[130px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[800px] h-[800px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[120px] animate-float-reverse" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-violet-500/5 dark:bg-indigo-600/10 blur-[150px]" />
        {/* Grain Layer */}
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ─── NAVBAR (Ultra Glass) ─── */}
      <header className="w-full border-b border-white/60 dark:border-white/[0.08] backdrop-blur-[40px] backdrop-saturate-[1.8] bg-white/40 dark:bg-[#030712]/30 sticky top-0 z-50 transition-all duration-500 glass-grain">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <img src="/logo.png" alt="CareCompass" className="w-11 h-11 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent italic">CareCompass</span>
          </Link>

          <nav className="hidden md:flex items-center gap-12">
            {["Features", "How It Works", "Testimonials"].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 relative group/nav">
                {label}
                <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 group-hover/nav:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={toggleTheme}
              className="relative w-12 h-12 rounded-[1.2rem] border border-white/80 dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] backdrop-blur-2xl flex items-center justify-center hover:bg-white/90 dark:hover:bg-white/[0.1] transition-all duration-500 hover:scale-110 shadow-xl group cursor-pointer"
            >
              {isDark ? <Moon className="w-5 h-5 text-blue-400 group-hover:rotate-12" /> : <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45" />}
            </button>

            <Link href="/auth/login" className="hidden lg:inline-flex text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Login</Link>

            <Link href="/auth/signup" className="hidden md:inline-flex relative group bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-[1.2rem] font-black uppercase tracking-widest text-xs transition-all duration-500 hover:scale-[1.05] shadow-2xl overflow-hidden active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">Get Started <ChevronRight className="w-4 h-4" /></span>
            </Link>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-11 h-11 rounded-[1.2rem] border border-gray-200 dark:border-white/[0.1] bg-gray-100/80 dark:bg-white/[0.04] flex items-center justify-center transition-all">
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-white/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] backdrop-blur-[40px] px-8 py-8 space-y-5 animate-fade-in-up">
            {["Features", "How It Works", "Testimonials"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="block text-xl font-black uppercase tracking-tighter text-gray-600 dark:text-gray-300 hover:text-blue-500" onClick={() => setMobileMenu(false)}>{l}</a>
            ))}
            <div className="flex flex-col gap-4 pt-6 border-t border-white/20 dark:border-white/[0.05]">
              <Link href="/auth/login" className="text-center py-4 rounded-2xl border border-gray-200 dark:border-white/[0.1] text-sm font-black uppercase">Login</Link>
              <Link href="/auth/signup" className="text-center py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-black uppercase shadow-xl">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="relative px-6 pt-24 md:pt-36 pb-32">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-white/40 dark:bg-white/[0.04] border border-white/80 dark:border-blue-400/30 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] backdrop-blur-3xl shadow-2xl glass-grain">
            <Sparkles className="w-4 h-4 animate-badge-pulse" />
            AI Health Intelligence Platform
          </div>

          <h1 className="animate-fade-in-up stagger-1 text-5xl md:text-8xl lg:text-[7.5rem] font-black leading-[0.9] tracking-tighter mb-10 text-gray-900 dark:text-white perspective-1000">
            Understand Your
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient-shift py-4 block drop-shadow-[0_0_60px_rgba(59,130,246,0.2)] dark:drop-shadow-[0_0_100px_rgba(59,130,246,0.4)]">
              Health Protocol
            </span>
          </h1>

          <p className="animate-fade-in-up stagger-2 text-xl md:text-3xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-20 leading-[1.2] font-bold">
            Simplify medical reports, decode complex prescriptions, and monitor vitals with medical-grade non-diagnostic AI.
          </p>

          <div className="animate-fade-in-up stagger-3 flex flex-wrap justify-center gap-8">
            <Link href="/auth/signup" className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-14 py-6 rounded-[2.5rem] text-2xl font-black italic shadow-[0_30px_70px_-15px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">Initialize Tracker</span>
              <ArrowRight className="relative z-10 w-8 h-8 group-hover:translate-x-3 transition-transform duration-500" />
            </Link>
            <Link href="/auth/login" className="px-14 py-6 rounded-[2.5rem] border-2 border-slate-200 dark:border-white/[0.1] text-2xl font-black italic hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-2xl">
              User Login
            </Link>
          </div>

          <div className="animate-fade-in-up stagger-4 flex flex-wrap justify-center gap-10 mt-28">
            {[
              { icon: <Shield className="w-6 h-6 text-emerald-500" />, text: "HIPAA Compliant Stack" },
              { icon: <Brain className="w-6 h-6 text-blue-500" />, text: "Gemini 1.5 Pro Engine" },
              { icon: <Zap className="w-6 h-6 text-amber-500" />, text: "Real-Time AI Logic" },
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-white/40 dark:bg-white/[0.03] border border-white/60 dark:border-white/[0.08] text-sm md:text-base font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 backdrop-blur-[60px] shadow-2xl hover:translate-y-[-8px] transition-all duration-500 glass-grain">
                {badge.icon} {badge.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ─── */}
      <section className="px-6 pb-40">
        <div ref={addRevealRef} className="reveal max-w-6xl mx-auto perspective-1000">
          <div className="relative group p-3 rounded-[3.5rem] bg-white/[0.4] dark:bg-[#030712]/40 border border-white/80 dark:border-white/[0.08] backdrop-blur-[60px] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.2),0_0_100px_rgba(59,130,246,0.1)] transition-all duration-[1.2s] hover:rotate-x-2 preserve-3d glass-grain">
            <div className="rounded-[2.8rem] bg-gray-50 dark:bg-[#0a0f1e] overflow-hidden border border-gray-200/50 dark:border-white/[0.05]">
              {/* Fake Chrome Head */}
              <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] backdrop-blur-md">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 text-center pr-10">
                  <span className="text-[12px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600 flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" /> carecompass.ai/dashboard
                  </span>
                </div>
              </div>

              <div className="p-12 md:p-16 grid grid-cols-4 gap-10">
                <div className="col-span-1 space-y-6">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl animate-pulse-slow" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-full" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-14 rounded-2xl ${i === 0 ? "bg-blue-500/10 border border-blue-500/20" : "bg-gray-100 dark:bg-white/[0.03]"} flex items-center gap-4 px-5 transition-all group-hover:scale-[1.02]`}>
                      <div className={`w-6 h-6 rounded-lg ${i === 0 ? "bg-blue-500/40" : "bg-gray-200 dark:bg-white/10"}`} />
                      <div className={`h-3 rounded-full ${i === 0 ? "w-24 bg-blue-500/50" : "w-20 bg-gray-200 dark:bg-white/5"}`} />
                    </div>
                  ))}
                </div>
                <div className="col-span-3 space-y-8">
                  <div className="h-44 rounded-[2.5rem] bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-gray-200 dark:border-white/[0.08] p-10 flex flex-col justify-center relative group-hover:shadow-2xl transition-all">
                    <div className="h-6 w-72 bg-blue-500/30 rounded-full mb-4" />
                    <div className="h-3 w-full max-w-md bg-gray-200 dark:bg-white/[0.05] rounded-full" />
                    <Sparkles className="absolute top-8 right-8 text-blue-500/30 w-16 h-16 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-32 rounded-[2rem] bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] p-6 shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded-full" />
                          <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} />
                        </div>
                        <div className="h-10 w-28 bg-blue-600/20 rounded-xl" />
                      </div>
                    ))}
                  </div>
                  <div className="h-60 rounded-[2.5rem] bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] p-10 relative overflow-hidden group-hover:shadow-2xl transition-all">
                    <div className="flex justify-between items-center mb-10">
                      <div className="h-5 w-48 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>
                    <div className="flex items-end gap-5 h-28 px-4">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 40].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-600/40 to-cyan-500/20 hover:scale-x-110 transition-transform cursor-pointer" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="py-10">
        <TrustMarquee />
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="px-6 py-40 max-w-7xl mx-auto relative">
        <div ref={addRevealRef} className="reveal text-center mb-32">
          <span className="inline-flex items-center gap-3 mb-8 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] backdrop-blur-3xl">
            <Activity className="w-5 h-5" /> Intelligence Suite
          </span>
          <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">
            Clinical-Grade
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent italic">AI Modules</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-3xl mx-auto text-2xl font-bold">Comprehensive toolset for autonomous health data interpretation.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 perspective-1000">
          {features.map((f, i) => (
            <div key={i} ref={addRevealRef} className={`reveal stagger-${i + 1} group relative rounded-[3.5rem] p-[1.5px] transition-all duration-[0.8s] hover:-translate-y-4 preserve-3d`}>
              <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-br from-blue-500/20 to-emerald-500/10 dark:from-blue-500/40 dark:to-emerald-500/20 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white/[0.5] dark:bg-[#030712]/40 backdrop-blur-[60px] rounded-[3.4rem] p-12 h-full border border-white dark:border-white/[0.08] shadow-2xl glass-grain overflow-hidden flex flex-col justify-between">
                <div>
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-12 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700`}>
                    {f.icon}
                    </div>
                    <h3 className="text-3xl font-black mb-6 text-gray-900 dark:text-white flex items-center gap-4 transition-all">
                    {f.title}
                    <ArrowRight className="w-6 h-6 opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 text-blue-500" />
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xl font-bold">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS (STYLISH PROCESS) ─── */}
      <section id="how-it-works" className="py-40 px-6 relative overflow-hidden bg-white/30 dark:bg-white/[0.01] backdrop-blur-[60px] glass-grain">
        <div className="max-w-7xl mx-auto relative z-10">
          <div ref={addRevealRef} className="reveal text-center mb-32">
            <span className="inline-flex items-center gap-3 mb-8 px-6 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] backdrop-blur-3xl">
              <Sparkles className="w-5 h-5" /> Operational Protocol
            </span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white">Seamless Ecosystem</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-20 relative">
            {/* Connector Lines */}
            <div className="hidden md:block absolute top-[60px] left-[20%] right-[20%] h-[3px]">
                <div className="w-full h-full bg-gradient-to-r from-blue-500/40 via-indigo-500/50 to-emerald-500/40 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            </div>

            {steps.map((s, i) => (
              <div key={i} ref={addRevealRef} className={`reveal stagger-${i + 1} group text-center relative`}>
                <div className="relative mx-auto mb-12">
                  <div className={`w-[120px] h-[120px] mx-auto rounded-[3rem] bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-1000`}>
                    {s.icon}
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-[1.2rem] bg-white dark:bg-[#030712] border-4 border-slate-50 dark:border-white/[0.1] flex items-center justify-center text-lg font-black text-gray-900 dark:text-white shadow-2xl">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-6 text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-xl leading-relaxed font-bold">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-32 px-6" ref={statsRef}>
        <div ref={addRevealRef} className="reveal max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: `${toolCount}+`, label: "AI Engines", icon: <Zap className="w-8 h-8 text-amber-500" /> },
              { value: "0", label: "Diagnostic Claims", icon: <Shield className="w-8 h-8 text-emerald-500" /> },
              { value: `${availCount}/7`, label: "Uptime Pulse", icon: <Activity className="w-8 h-8 text-blue-500" /> },
              { value: "HIPAA", label: "Ready Stack", icon: <Lock className="w-8 h-8 text-purple-500" /> },
            ].map((stat, i) => (
              <div key={i} className="group text-center p-12 rounded-[3rem] bg-white/40 dark:bg-white/[0.03] border border-white dark:border-white/[0.1] backdrop-blur-[60px] hover:border-blue-500/40 transition-all duration-700 hover:-translate-y-4 shadow-2xl glass-grain">
                <div className="flex justify-center mb-10 opacity-30 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1000 drop-shadow-[0_0_20px_currentColor]">{stat.icon}</div>
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4 italic italic">{stat.value}</div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-32">
            <span className="inline-flex items-center gap-3 mb-8 px-6 py-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.4em] backdrop-blur-3xl">
              <MessageSquare className="w-5 h-5" /> Clinical Feedback
            </span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 text-gray-900 dark:text-white">Professional Consensus</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <div key={i} ref={addRevealRef} className={`reveal stagger-${i + 1} group relative rounded-[3.5rem] p-[1.5px]`}>
                <div className="relative bg-white/[0.6] dark:bg-[#030712]/40 backdrop-blur-[60px] rounded-[3.4rem] p-12 h-full border border-white dark:border-white/[0.08] shadow-2xl glass-grain">
                  <div className="flex gap-2 mb-10">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-6 h-6 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-2xl leading-relaxed mb-12 font-bold italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-6 pt-10 border-t border-gray-100 dark:border-white/[0.05]">
                    <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-white text-xl font-black shadow-2xl`}>{t.initials}</div>
                    <div>
                      <div className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t.name}</div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA (MASSIVE GLASS CARD) ─── */}
      <section className="px-6 py-40">
        <div ref={addRevealRef} className="reveal relative max-w-7xl mx-auto overflow-hidden rounded-[4.5rem] border border-white/20 dark:border-white/[0.1] shadow-[0_100px_180px_-40px_rgba(0,0,0,0.3)] glass-grain bg-blue-600">
            {/* Animated BG for CTA */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 animate-gradient-shift opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
            
            <div className="relative z-10 p-16 md:p-32 text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-3 mb-12 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-xs font-black text-white uppercase tracking-[0.4em] backdrop-blur-3xl">
                    <Zap className="w-6 h-6 fill-white" /> Access Operational Dashboard
                </div>
                <h2 className="text-5xl md:text-[6rem] lg:text-[7.5rem] font-black mb-14 text-white leading-[0.85] tracking-tighter uppercase italic">
                    Decode Your
                    <br />
                    Future Health
                </h2>
                <p className="text-white/80 text-2xl md:text-3xl mb-20 max-w-4xl mx-auto leading-relaxed font-bold">Secure your medical baseline with clinical AI interpretations.</p>
                
                <div className="flex flex-wrap justify-center gap-8">
                    <Link href="/auth/signup" className="group relative bg-white text-gray-900 px-[4.5rem] py-8 rounded-[3rem] text-[2.2rem] font-black uppercase tracking-tighter shadow-2xl hover:scale-105 active:scale-95 transition-all duration-700 hover:shadow-white/20">
                        Initialize Tracking
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full transition-all group-hover:scale-150" />
                    </Link>
                </div>
            </div>
        </div>
        <div className="mt-20 flex flex-col items-center gap-6">
          <p className="text-sm font-black text-gray-400 dark:text-gray-600 flex items-center gap-3 uppercase tracking-[0.3em]">
            <Shield className="w-5 h-5" /> PRIVACY FIRST • NON-DIAGNOSTIC • SECURE PROTOCOL
          </p>
        </div>
      </section>

      {/* ─── FOOTER (Dashboard Style) ─── */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] backdrop-blur-[60px] transition-all duration-700 glass-grain">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-32">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24">
            <div className="md:col-span-2 space-y-12">
              <div className="flex items-center gap-5">
                <img src="/logo.png" alt="CareCompass" className="w-16 h-16 object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent italic">CareCompass</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-2xl max-w-md leading-relaxed font-bold uppercase tracking-tight">Revolutionizing health data intelligence with secure, private clinical-grade AI.</p>
            </div>
            <div className="space-y-10">
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.4em]">Technology Stack</h4>
              <ul className="space-y-6 text-xl font-bold text-gray-400 dark:text-gray-500">
                <li><a href="#features" className="hover:text-blue-600 transition-all uppercase tracking-tight">Gemini 1.5 Pro</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-all uppercase tracking-tight">Temporal Engine</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-all uppercase tracking-tight">Protocol Sync</a></li>
              </ul>
            </div>
            <div className="space-y-10">
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.4em]">Infrastructure</h4>
              <ul className="space-y-6 text-xl font-bold text-gray-400 dark:text-gray-500">
                <li><Link href="/" className="hover:text-blue-600 transition-all uppercase tracking-tight">E2E Privacy</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-all uppercase tracking-tight">HIPAA Specs</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-all uppercase tracking-tight">Global Care</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-32 pt-12 border-t border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest italic">© {new Date().getFullYear()} CareCompass Intel Bureau. All rights reserved.</p>
            <div className="flex gap-4">
               {["🏥", "🔬", "💡", "🛡️"].map((e, i) => (
                  <div key={i} className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.08] flex items-center justify-center text-2xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xl">{e}</div>
                ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Data ─── */
const features = [
  { icon: <FileText className="w-12 h-12 text-white" />, title: "Report Explainer", description: "Decode complex medical reports with autonomous clinical-grade interpretative logic.", gradient: "from-blue-600 to-blue-800" },
  { icon: <Pill className="w-12 h-12 text-white" />, title: "Precision Scan", description: "Identify pharmacological risks and schedule complexity through AI visual recognition.", gradient: "from-violet-600 to-purple-800" },
  { icon: <LineChart className="w-12 h-12 text-white" />, title: "Vitals Analytics", description: "Monitor glucose, BP, and biomarkers with high-fidelity temporal trend detection.", gradient: "from-emerald-600 to-teal-800" },
  { icon: <Bot className="w-12 h-12 text-white" />, title: "Health Intel", description: "Continuous AI companion for Wellness Awareness (Non-Diagnostic) and protocol adherence.", gradient: "from-sky-600 to-blue-800" },
  { icon: <Clock className="w-12 h-12 text-white" />, title: "Temporal Keeper", description: "Dynamic medication cycles synchronized with your metabolic schedule for continuity.", gradient: "from-amber-600 to-orange-800" },
  { icon: <Brain className="w-12 h-12 text-white" />, title: "Risk Forensics", description: "Evaluate symptom clusters through hybrid diagnostic-modeling for preventive awareness.", gradient: "from-rose-600 to-pink-800" },
];

const steps = [
  { icon: <Upload className="w-14 h-14 text-white" />, title: "Data Ingest", description: "Inject reports and vitals into your encrypted private healthcare bureau.", gradient: "from-blue-700 to-indigo-900" },
  { icon: <Brain className="w-14 h-14 text-white" />, title: "Core Analysis", description: "Gemini 1.5 Pro interpretative logic processes raw medical datasets.", gradient: "from-indigo-700 to-purple-900" },
  { icon: <HeartPulse className="w-14 h-14 text-white" />, title: "Protocol Output", description: "Actionable non-diagnostic insights delivered for informed medical collaboration.", gradient: "from-emerald-700 to-teal-900" },
];

const testimonials = [
  { quote: "The interpretative logic of CareCompass provides a clarity previously inaccessible to patients.", name: "Dr. Elena Vance", role: "Bureau Chief of Medicine", initials: "EV", avatarGradient: "from-blue-700 to-indigo-900" },
  { quote: "Finally, a medical-grade interface for managing complex family pharmacological schedules.", name: "Marcus Thorne", role: "Health Architect", initials: "MT", avatarGradient: "from-emerald-700 to-teal-900" },
  { quote: "Autonomous trend detection identified a cycle of sodium imbalance before symptomatology occurred.", name: "Sarah Chen", role: "Biotech Analyst", initials: "SC", avatarGradient: "from-rose-700 to-pink-900" },
];
