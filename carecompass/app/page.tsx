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
    <div className="w-full py-8 bg-white/30 dark:bg-white/[0.01] backdrop-blur-3xl border-y border-white/40 dark:border-white/[0.06] overflow-hidden glass-grain">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-16 mx-8">
            <span className="text-sm font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase">{text}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30" />
          </div>
        ))}
      </div>
    </div>
  );
};

const AccordionItem = ({ title, content }: { title: string, content: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mb-6 rounded-[2.5rem] border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] backdrop-blur-[60px] glass-grain overflow-hidden transition-all duration-500">
            <button onClick={() => setOpen(!open)} className="w-full p-10 flex items-center justify-between text-left group">
                <span className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{title}</span>
                <ChevronDown className={`w-8 h-8 text-blue-500 transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`px-10 overflow-hidden transition-all duration-500 ease-in-out ${open ? "pb-10 max-h-96" : "max-h-0"}`}>
                <p className="text-xl text-gray-400 dark:text-gray-400 font-bold leading-relaxed">{content}</p>
            </div>
        </div>
    );
};

export default function Home() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;
  const [mobileMenu, setMobileMenu] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const revealRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }); }, { threshold: 0.1 });
    revealRefs.current.forEach((r) => r && observer.observe(r));
    const statsObs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) statsObs.observe(statsRef.current);
    return () => { observer.disconnect(); statsObs.disconnect(); };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 dark:from-[#020617] dark:via-[#050b18] dark:to-[#020814] text-gray-900 dark:text-gray-100 overflow-hidden scroll-smooth transition-all duration-700">
      
      <div className="fixed inset-0 -z-10">
        <StarField isDark={isDark} />
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] rounded-full bg-blue-500/15 dark:bg-blue-600/20 blur-[130px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[800px] h-[800px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[120px] animate-float-reverse" />
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <header className="w-full border-b border-white/60 dark:border-white/[0.08] backdrop-blur-[40px] bg-white/40 dark:bg-[#030712]/30 sticky top-0 z-50 glass-grain">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <img src="/logo.png" alt="Logo" className="w-11 h-11 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent italic">CareCompass</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            {["Services", "Network", "Compliance", "Protocol"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-blue-500 transition-all">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={toggleTheme} className="w-12 h-12 rounded-[1.2rem] border border-white/80 dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] flex items-center justify-center hover:scale-110 transition-all shadow-xl group cursor-pointer">{isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}</button>
            <Link href="/auth/login" className="hidden lg:inline-flex text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup" className="hidden md:inline-flex bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-[1.2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-[1.05] transition-all">Get Started</Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-11 h-11 rounded-[1.2rem] border border-gray-200 dark:border-white/[0.1] bg-gray-100/80 flex items-center justify-center transition-all">{mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-24 md:pt-36 pb-32">
        <div className="max-w-6xl mx-auto text-center z-10">
          <div className="animate-fade-in-up inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-white/40 dark:bg-white/[0.04] border border-white/80 dark:border-blue-400/30 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] shadow-2xl glass-grain">
            <Sparkles className="w-4 h-4 animate-badge-pulse" /> AI HEALTH INTELLIGENCE V3.1
          </div>
          <h1 className="animate-fade-in-up stagger-1 text-5xl md:text-8xl lg:text-[7.5rem] font-black leading-[0.9] tracking-tighter mb-10 text-gray-900 dark:text-white">Understand Your <br /><span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient-shift py-4 block">Health Protocol</span></h1>
          <p className="animate-fade-in-up stagger-2 text-xl md:text-3xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-20 leading-[1.2] font-bold italic selection:bg-blue-500/20">The first medical-grade AI engine (Non-Diagnostic) designed to decode medical reports, manage pharmacological cycles, and predict health anomalies with precision.</p>
          <div className="animate-fade-in-up stagger-3 flex flex-wrap justify-center gap-8">
            <Link href="/auth/signup" className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-14 py-6 rounded-[2.5rem] text-2xl font-black italic shadow-[0_30px_70px_-15px_rgba(59,130,246,0.6)] hover:scale-105 transition-all flex items-center gap-4 overflow-hidden"><span className="relative z-10">Initialize Tracker</span><ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform duration-500" /></Link>
            <Link href="/auth/login" className="px-14 py-6 rounded-[2.5rem] border-2 border-slate-200 dark:border-white/[0.1] text-2xl font-black italic hover:bg-white dark:hover:bg-white/[0.05] transition-all">User Login</Link>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section id="services" className="px-6 pb-40">
        <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal max-w-6xl mx-auto perspective-1000">
          <div className="relative group p-3 rounded-[3.5rem] bg-white/[0.4] dark:bg-[#030712]/40 border border-white/80 dark:border-white/[0.08] backdrop-blur-[60px] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.2)] transition-all hover:rotate-x-2 preserve-3d glass-grain">
             <div className="rounded-[2.8rem] bg-gray-50 dark:bg-[#0a0f1e] overflow-hidden border border-gray-200/50 dark:border-white/[0.05]">
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02]">
                    <div className="flex gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" /><div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" /><div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" /></div>
                    <div className="flex-1 text-center pr-10 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]"><Lock className="w-3 h-3 inline mr-2" /> carecompass.ai/secure-node</div>
                </div>
                <div className="p-16 grid grid-cols-4 gap-10">
                    <div className="col-span-1 space-y-6 opacity-30">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/40" />
                        {[...Array(6)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-200 dark:bg-white/5" />)}
                    </div>
                    <div className="col-span-3 space-y-8">
                        <div className="h-44 rounded-[2.5rem] bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border dark:border-white/[0.05] p-10 flex flex-col justify-center">
                            <div className="h-6 w-72 bg-blue-500/30 rounded-full mb-4" /><div className="h-3 w-full max-w-md bg-gray-200 dark:bg-white/5 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="h-40 rounded-[2rem] bg-white dark:bg-white/[0.04] p-8 border border-gray-200 dark:border-white/[0.05]"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 mb-6" /><div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-full" /></div>
                            <div className="h-40 rounded-[2rem] bg-white dark:bg-white/[0.04] p-8 border border-gray-200 dark:border-white/[0.05]"><div className="w-10 h-10 rounded-xl bg-blue-500/20 mb-6" /><div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-full" /></div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <TrustMarquee />

      {/* CORE FEATURES SECTION (Detailed) */}
      <section className="px-6 py-40 max-w-7xl mx-auto">
        <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal text-center mb-32">
          <span className="inline-flex items-center gap-3 mb-8 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">INTELLIGENCE MODULES</span>
          <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">Clinical-Grade <br /><span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent italic">AI Engines</span></h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-4xl mx-auto text-2xl font-bold">Six specialized nodes operating in tandem to provide a comprehensive health sovereignty framework.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {fullFeatures.map((f, i) => (
            <div key={i} ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className={`reveal stagger-${i + 1} group relative rounded-[3.5rem] p-[1.5px] transition-all hover:-translate-y-4`}>
              <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-br from-blue-500/40 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white/[0.5] dark:bg-[#030712]/40 backdrop-blur-[60px] rounded-[3.4rem] p-12 h-full border border-white dark:border-white/[0.08] shadow-2xl glass-grain overflow-hidden">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-12 shadow-2xl group-hover:scale-110 transition-all duration-700`}>{f.icon}</div>
                <h3 className="text-3xl font-black mb-6 text-gray-900 dark:text-white uppercase tracking-tighter italic">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xl font-bold mb-8 italic">{f.description}</p>
                <div className="space-y-4">
                    {f.highlights.map((h, j) => (
                        <div key={j} className="flex items-center gap-3 text-sm font-black text-gray-400 uppercase tracking-widest"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {h}</div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (Protocol) */}
      <section id="protocol" className="py-40 px-6 bg-white/30 dark:bg-white/[0.01] border-y border-white/20 dark:border-white/[0.05] glass-grain">
        <div className="max-w-7xl mx-auto text-center mb-32">
          <span className="text-[10px] font-black text-blue-500 tracking-[0.4em] mb-4 block uppercase leading-none">The CareCompass Method</span>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white italic">Operational Protocol</h2>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-20">
            {protocolSteps.map((s, i) => (
              <div key={i} ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className={`reveal stagger-${i + 1} text-center group`}>
                <div className="w-[140px] h-[140px] mx-auto rounded-[3.5rem] bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center mb-12 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all">{s.icon}</div>
                <h3 className="text-3xl font-black mb-6 text-gray-900 dark:text-white uppercase tracking-tighter">{s.title}</h3>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-bold leading-relaxed px-6">{s.description}</p>
              </div>
            ))}
        </div>
      </section>

      {/* COMPLIANCE & SECURITY */}
      <section id="compliance" className="py-40 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal">
                <span className="text-xs font-black text-emerald-500 tracking-[0.5em] mb-8 block uppercase">FORTRESS ARCHITECTURE</span>
                <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter leading-none italic">Sovereign Data <br />Security</h2>
                <p className="text-2xl text-gray-500 dark:text-gray-400 font-bold leading-relaxed mb-16 italic">Every dataset is siloed, encrypted, and processed on dedicated Gemini instances to ensure clinical-grade privacy.</p>
                <div className="grid grid-cols-2 gap-10">
                    {complianceStats.map((s, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] shadow-xl">
                            <div className="text-4xl font-black text-blue-500 mb-4 italic uppercase">{s.label}</div>
                            <div className="text-sm font-black text-gray-400 uppercase tracking-widest">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal stagger-2 relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-[150px] rounded-full group-hover:bg-blue-500/30 transition-all duration-1000" />
                <div className="relative p-2 rounded-[4rem] bg-white/20 dark:bg-white/[0.02] border border-white/60 dark:border-white/[0.08] backdrop-blur-[80px] overflow-hidden glass-grain shadow-2xl">
                    <div className="p-16 space-y-12">
                        <div className="flex items-center gap-8"><div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Lock className="w-8 h-8" /></div><div><div className="text-xl font-black uppercase text-white tracking-widest italic">AES-256 Encryption</div><div className="text-sm font-bold text-gray-400 italic">Military-grade data transit</div></div></div>
                        <div className="flex items-center gap-8"><div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500"><Database className="w-8 h-8" /></div><div><div className="text-xl font-black uppercase text-white tracking-widest italic">Encrypted Silos</div><div className="text-sm font-bold text-gray-400 italic">No cross-user data leakage</div></div></div>
                        <div className="flex items-center gap-8"><div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500"><Globe className="w-8 h-8" /></div><div><div className="text-xl font-black uppercase text-white tracking-widest italic">HIPAA & GDPR</div><div className="text-sm font-bold text-gray-400 italic">International standard compliance</div></div></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-40 px-6 bg-white/10 dark:bg-white/[0.01] glass-grain">
        <div className="max-w-4xl mx-auto">
            <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal text-center mb-24">
                <span className="text-xs font-black text-blue-500 tracking-[0.4em] mb-4 block uppercase leading-none">Common Inquiries</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white italic">Intelligence FAQ</h2>
            </div>
            {faqs.map((f, i) => (
                <AccordionItem key={i} title={f.q} content={f.a} />
            ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-24 px-6" ref={statsRef}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
            {mainStats.map((s, i) => (
                <div key={i} className="text-center group p-12 rounded-[3.5rem] bg-white/40 dark:bg-white/[0.03] border border-white/60 dark:border-white/[0.1] backdrop-blur-[60px] glass-grain hover:-translate-y-4 transition-all">
                    <div className="text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4 italic italic">{s.v}</div>
                    <div className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">{s.l}</div>
                </div>
            ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-40">
        <div ref={el => { if(el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }} className="reveal relative max-w-7xl mx-auto overflow-hidden rounded-[4.5rem] border border-white/20 dark:border-white/[0.1] shadow-[0_100px_180px_-40px_rgba(0,0,0,0.3)] glass-grain bg-blue-600">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 animate-gradient-shift opacity-90" /><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
            <div className="relative z-10 p-32 text-center flex flex-col items-center">
                <h2 className="text-5xl md:text-[8rem] font-black mb-14 text-white leading-[0.85] tracking-tighter uppercase italic">Secure Your <br />Health Node</h2>
                <p className="text-white/80 text-2xl md:text-3xl mb-20 max-w-4xl mx-auto leading-relaxed font-bold italic selection:bg-white/20">The future of clinical intelligence is sovereign. Join the 400+ health architects already decoding their timeline with CareCompass.</p>
                <Link href="/auth/signup" className="group bg-white text-gray-900 px-16 py-8 rounded-[3rem] text-3xl font-black uppercase tracking-tighter shadow-2xl hover:scale-110 active:scale-95 transition-all">Initialize Now</Link>
            </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] backdrop-blur-[60px] glass-grain">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 grid md:grid-cols-4 gap-24">
            <div className="md:col-span-2 space-y-12">
                <div className="flex items-center gap-5"><img src="/logo.png" alt="Logo" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" /><span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent italic">CareCompass</span></div>
                <p className="text-gray-500 dark:text-gray-400 text-2xl max-w-md leading-relaxed font-bold uppercase tracking-tight selection:bg-blue-500/20">Advanced medical-grade AI intelligence for autonomous health sovereignty. HIPAA Compliant. E2E Encrypted.</p>
            </div>
            <div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.4em] mb-10">Module Stack</h4>
                <ul className="space-y-6 text-xl font-bold text-gray-400 italic">
                    <li><a href="#" className="hover:text-blue-600 transition-all uppercase">Disease AI Predictor</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-all uppercase">Medicine Reminder</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-all uppercase">Report Simplifier</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.4em] mb-10">Legal Protocol</h4>
                <ul className="space-y-6 text-xl font-bold text-gray-400 italic">
                    <li><a href="#" className="hover:text-blue-600 transition-all uppercase">Privacy Sandbox</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-all uppercase">HIPAA Specs</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-all uppercase">Usage Terms</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-white/[0.08] flex justify-between items-center">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">© 2026 CareCompass Bureau Lab. All rights reserverd.</p>
            <div className="flex gap-4">{["🏥","🔬","🛡️"].map(e => <div key={e} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-xl">{e}</div>)}</div>
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
