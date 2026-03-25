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
  Fingerprint,
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = isDark ? 200 : 80;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5,
          speed: Math.random() * 0.2 + 0.05,
          opacity: Math.random() * 0.5 + 0.2,
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
          ? `rgba(186, 230, 253, ${star.opacity * flicker * 0.5})` 
          : `rgba(59, 130, 246, ${star.opacity * flicker * 0.15})`;
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
    "PRIVACY FIRST", "RELIABLE INSIGHTS", "SECURE DATA SILOS", "ISO 27001", "EU-GDPR"
  ];
  const doubled = [...items, ...items];
  return (
    <div className="w-full py-6 bg-white/10 dark:bg-black/20 backdrop-blur-3xl border-y border-white/20 dark:border-white/[0.04] overflow-hidden glass-grain">
      <div className="flex whitespace-nowrap animate-marquee">
        {doubled.map((text, i) => (
          <div key={i} className="flex items-center gap-12 mx-6">
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.6em] uppercase transition-colors hover:text-blue-500">{text}</span>
            <div className="w-1 h-1 rounded-full bg-blue-500/20" />
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#02040a] text-[#1a1a1a] dark:text-[#f0f0f0] overflow-hidden selection:bg-blue-500/30 transition-colors duration-1000">
      
      {/* ─── REFINED AMBIENT LAYER ─── */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.02),transparent_40%)]">
        <StarField isDark={isDark} />
        {/* Subtler Liquid Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[100px] animate-float opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 dark:bg-emerald-600/10 blur-[100px] animate-float-reverse opacity-40" />
        {/* Fine-line Grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ─── NAVBAR (Refined) ─── */}
      <header className="w-full border-b border-black/[0.05] dark:border-white/[0.04] backdrop-blur-[30px] bg-white/50 dark:bg-black/30 sticky top-0 z-50 transition-all duration-500 glass-grain">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">CareCompass</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Services", "Protocol", "Network"].map((l) => (
              <a key={l} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">{l}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white/50 dark:bg-black/50 flex items-center justify-center hover:bg-white dark:hover:bg-black transition-all">
              {isDark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <Link href="/auth/login" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup" className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all">Initialize</Link>
          </div>
        </div>
      </header>

      {/* ─── HERO (Refined Sizing) ─── */}
      <section className="relative px-6 pt-20 md:pt-32 pb-24 max-w-5xl mx-auto text-center">
        <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] backdrop-blur-3xl glass-grain">
          <Fingerprint className="w-3.5 h-3.5" />
          SYSTEM VERSION 2.4.0 • ACTIVE
        </div>

        <h1 className="animate-fade-in-up stagger-1 text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8">
          Personal Clinical
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent italic">Security Intelligence</span>
        </h1>

        <p className="animate-fade-in-up stagger-2 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Autonomous interpretation of medical records, pharmacological tracking, and biometric trend detection layer. Secure. Precise. Private.
        </p>

        <div className="animate-fade-in-up stagger-3 flex flex-wrap justify-center gap-4">
          <Link href="/auth/signup" className="group relative bg-blue-600 text-white px-8 py-4 rounded-2xl text-base font-black italic shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all flex items-center gap-3">
            <span>Secure Access</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/auth/login" className="px-8 py-4 rounded-2xl border border-gray-200 dark:border-white/[0.1] text-base font-black italic hover:bg-white dark:hover:bg-white/[0.05] transition-all">
            Registry Login
          </Link>
        </div>

        <div className="animate-fade-in-up stagger-4 flex flex-wrap justify-center gap-6 mt-20">
          {[
            { icon: <Shield className="w-4 h-4" />, text: "HIPAA Compliant" },
            { icon: <Zap className="w-4 h-4" />, text: "Gemini 1.5 Pro" },
            { icon: <Lock className="w-4 h-4" />, text: "E2E Encryption" },
          ].map((b, i) => (
            <span key={i} className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 backdrop-blur-2xl glass-grain">
              {b.icon} {b.text}
            </span>
          ))}
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW (Refined) ─── */}
      <section className="px-6 pb-32">
        <div ref={addRevealRef} className="reveal max-w-4xl mx-auto">
          <div className="relative p-2 rounded-[2rem] bg-white/40 dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.08] backdrop-blur-[40px] shadow-2xl glass-grain overflow-hidden">
             <div className="rounded-[1.6rem] bg-[#f9fafb] dark:bg-[#080808] border border-black/[0.03] dark:border-white/[0.03] overflow-hidden">
                {/* Small Browser Header */}
                <div className="px-6 py-3 border-b border-black/[0.03] dark:border-white/[0.03] bg-white dark:bg-black/20 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20" />
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">Protected Endpoint</div>
                </div>
                <div className="p-8 grid grid-cols-12 gap-6 opacity-60">
                    <div className="col-span-3 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10" />
                        {[1,2,3,4].map(n => <div key={n} className="h-8 rounded-lg bg-gray-100 dark:bg-white/[0.02]" />)}
                    </div>
                    <div className="col-span-9 space-y-6">
                        <div className="h-32 rounded-2xl bg-gradient-to-r from-blue-500/5 to-transparent border border-black/[0.02] dark:border-white/[0.02]" />
                        <div className="grid grid-cols-3 gap-4">
                            {[1,2,3].map(n => <div key={n} className="h-24 rounded-2xl bg-white dark:bg-white/[0.01] border border-black/[0.02] dark:border-white/[0.02]" />)}
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <TrustMarquee />

      {/* ─── FEATURES (Premium Scale) ─── */}
      <section className="px-6 py-32 max-w-6xl mx-auto">
        <div ref={addRevealRef} className="reveal text-center mb-20">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4 block">Core Infrastructure</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Precision Intelligence</h2>
          <div className="w-12 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} ref={addRevealRef} className={`reveal stagger-${i + 1} group p-8 rounded-3xl bg-white/40 dark:bg-white/[0.01] border border-black/[0.05] dark:border-white/[0.05] hover:border-blue-500/30 transition-all duration-500 backdrop-blur-xl glass-grain`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-black mb-3 tracking-tight">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS (Minimal Process) ─── */}
      <section className="py-32 px-6 bg-blue-500/[0.02] border-y border-black/[0.03] dark:border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {steps.map((s, i) => (
              <div key={i} ref={addRevealRef} className={`reveal stagger-${i + 1} relative`}>
                <div className="text-[6rem] font-black text-blue-500/5 absolute -top-12 left-1/2 -translate-x-1/2 select-none">0{i+1}</div>
                <div className="relative z-10">
                   <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-6 shadow-xl`}>
                    {s.icon}
                   </div>
                   <h3 className="text-lg font-black mb-3 uppercase tracking-tighter">{s.title}</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 font-medium px-4">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS (Refined) ─── */}
      <section className="py-24 px-6" ref={statsRef}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: `${toolCount}+`, l: "AI Engines" },
            { v: "256", l: "AES-Bit" },
            { v: "0.0s", l: "Latency" },
            { v: "HIPAA", l: "Compliance" },
          ].map((s, i) => (
            <div key={i} className="p-8 rounded-[1.5rem] bg-white/50 dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.05] text-center backdrop-blur-3xl glass-grain">
              <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-1 italic">{s.v}</div>
              <div className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA (Premium Slim) ─── */}
      <section className="px-6 py-32 max-w-5xl mx-auto">
        <div className="relative rounded-[2.5rem] bg-black dark:bg-[#0c0c0c] border border-white/[0.05] p-12 md:p-20 overflow-hidden text-center shadow-2xl glass-grain">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-blue-600/20 blur-[100px] -z-10" />
           <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Ready for Precision Care?</h2>
           <p className="text-gray-400 text-base mb-12 max-w-lg mx-auto font-medium">Join our secure clinical network and standardize your health data today.</p>
           <Link href="/auth/signup" className="inline-flex px-10 py-5 rounded-2xl bg-blue-600 text-white font-black italic shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
             Begin Initialization <ChevronRight className="ml-2 w-5 h-5" />
           </Link>
        </div>
      </section>

      {/* ─── FOOTER (Premium Minimal) ─── */}
      <footer className="py-20 px-6 border-t border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#02040a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <img src="/logo.png" className="w-8 h-8 opacity-60" />
             <span className="text-lg font-black tracking-tight text-gray-400">CareCompass</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
             <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
             <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
             <a href="#" className="hover:text-blue-500 transition-colors">Protocol</a>
          </div>
          <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest italic">© 2026 CareCompass Bureau Lab</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Data ─── */
const features = [
  { icon: <FileText className="w-6 h-6 text-white" />, title: "Precision Report", description: "Decode complex medical data with Gemini 1.5 Pro interpretative logic.", gradient: "from-blue-600 to-blue-700" },
  { icon: <Pill className="w-6 h-6 text-white" />, title: "Pharmacology", description: "Visual medication recognition and cross-reactive risk detection.", gradient: "from-indigo-600 to-indigo-700" },
  { icon: <Activity className="w-6 h-6 text-white" />, title: "Biometric Lab", description: "High-fidelity temporal trend analysis for vital sign monitoring.", gradient: "from-emerald-600 to-emerald-700" },
  { icon: <Shield className="w-6 h-6 text-white" />, title: "Security Fabric", description: "Zero-knowledge encryption for medical data sovereignty.", gradient: "from-slate-700 to-slate-800" },
  { icon: <Search className="w-6 h-6 text-white" />, title: "Risk Scan", description: "Preventive symptom cluster analysis and specialist referral.", gradient: "from-rose-600 to-rose-700" },
  { icon: <Layout className="w-6 h-6 text-white" />, title: "Unified Node", description: "Centralized command center for decentralized family health.", gradient: "from-amber-600 to-amber-700" },
];

const steps = [
  { icon: <Upload className="w-6 h-6 text-white" />, title: "Data Ingest", description: "Secure upload of clinical datasets.", gradient: "from-blue-600 to-blue-700" },
  { icon: <Brain className="w-6 h-6 text-white" />, title: "AI Inference", description: "Interpretative processing via Gemini 1.5.", gradient: "from-indigo-600 to-indigo-700" },
  { icon: <HeartPulse className="w-6 h-6 text-white" />, title: "Protocol Output", description: "Actionable non-diagnostic insights.", gradient: "from-emerald-600 to-emerald-700" },
];
