"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { Bot, FileText, Pill, LineChart, Clock, Brain, HeartPulse, Upload, Sparkles, ArrowRight, Shield, Activity, Stethoscope, ChevronRight, Zap, Lock, BarChart3, MessageSquare } from "lucide-react";

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration = 2000, start = 0, shouldStart = false) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [shouldStart, end, duration, start]);
  return value;
}

/* ─── Star Particle Canvas ─── */
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; size: number; speed: number; opacity: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.pulse += 0.01;
        star.y -= star.speed;
        if (star.y < -5) {
          star.y = canvas.height + 5;
          star.x = Math.random() * canvas.width;
        }
        const flicker = 0.5 + Math.sin(star.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${star.opacity * flicker})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

/* ─── Marquee Component ─── */
function TrustMarquee() {
  const items = [
    "🔒 End-to-End Encrypted",
    "🧠 Gemini AI Powered",
    "⚕️ Non-Diagnostic Guidance",
    "🔥 Real-Time Analysis",
    "📊 Smart Health Tracking",
    "💊 Prescription Decoder",
    "🧬 Disease Risk Insights",
    "⏰ Medicine Reminders",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-6 border-y border-white/[0.04] bg-white/[0.015]">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="mx-8 text-sm text-gray-500 font-medium flex-shrink-0">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const revealRefs = useRef<HTMLDivElement[]>([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    // Stats counter observer
    const statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) statsObserver.observe(statsRef.current);

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  const addRevealRef = useCallback((el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  }, []);

  // Animated counters
  const toolCount = useCountUp(6, 1800, 0, statsVisible);
  const availCount = useCountUp(24, 1600, 0, statsVisible);

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 overflow-hidden scroll-smooth">
      {/* GLOBAL AMBIENT BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <StarField />
        <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[180px] animate-float" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] bg-emerald-500/12 rounded-full blur-[180px] animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/8 rounded-full blur-[200px]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px" }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* NAVBAR */}
      <header className="w-full border-b border-white/[0.06] backdrop-blur-2xl bg-[#030712]/70 sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="CareCompass Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(59,130,246,0.6)] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              CareCompass
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-emerald-400 hover:after:w-full after:transition-all after:duration-300">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-emerald-400 hover:after:w-full after:transition-all after:duration-300">How It Works</a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-emerald-400 hover:after:w-full after:transition-all after:duration-300">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-white font-medium transition-colors duration-300"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="relative group bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.03] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-32 pb-16">
        {/* Radial spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-blue-300 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.1)] animate-badge-pulse">
            <Sparkles className="w-4 h-4" />
            AI-Powered Non-Diagnostic Health Companion
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up stagger-1 text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
            Understand Your Health
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-shift">
              With Clinical-Grade AI
            </span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-in-up stagger-2 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed">
            Simplify medical reports, decode prescriptions, track health trends,
            and generate professional AI insights — all in one secure, intelligent platform.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up stagger-3 flex flex-wrap justify-center gap-5">
            <Link
              href="/auth/signup"
              className="group relative bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.04] flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/auth/login"
              className="group px-10 py-4 rounded-2xl border border-white/[0.1] text-lg font-semibold hover:border-white/[0.25] hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-xl flex items-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="animate-fade-in-up stagger-4 flex flex-wrap justify-center gap-6 mt-16">
            {[
              { icon: <Shield className="w-4 h-4 text-emerald-400" />, text: "End-to-End Encrypted" },
              { icon: <Brain className="w-4 h-4 text-indigo-400" />, text: "Gemini AI Powered" },
              { icon: <Stethoscope className="w-4 h-4 text-blue-400" />, text: "Non-Diagnostic Guidance" },
            ].map((badge, i) => (
              <span
                key={i}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 backdrop-blur-xl hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-300"
              >
                {badge.icon}
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HERO DASHBOARD PREVIEW */}
      <section className="px-6 pb-20">
        <div ref={addRevealRef} className="reveal max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-1 shadow-2xl shadow-blue-500/5">
            {/* Gradient border glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 -z-10 blur-sm" />

            {/* Mock dashboard */}
            <div className="rounded-xl bg-[#0a0f1e] overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500">carecompass.ai/dashboard</span>
                </div>
              </div>

              {/* Dashboard content preview */}
              <div className="p-6 grid grid-cols-3 gap-4">
                {/* Sidebar skeleton */}
                <div className="col-span-1 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500" />
                    <div className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-lg ${i === 0 ? "bg-blue-500/15 border border-blue-500/20" : "bg-white/[0.03]"} flex items-center gap-2 px-3`}>
                      <div className={`w-4 h-4 rounded ${i === 0 ? "bg-blue-500/30" : "bg-white/10"}`} />
                      <div className={`h-2 rounded ${i === 0 ? "w-16 bg-blue-400/30" : "w-14 bg-white/5"}`} />
                    </div>
                  ))}
                </div>

                {/* Main content skeleton */}
                <div className="col-span-2 space-y-4">
                  <div className="h-24 rounded-xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-white/[0.06] p-4">
                    <div className="h-3 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-64 bg-white/5 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { color: "blue", value: "3" },
                      { color: "purple", value: "Active" },
                      { color: "emerald", value: "85%" },
                    ].map((card, i) => (
                      <div key={i} className="h-20 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                        <div className="h-2 w-12 bg-white/10 rounded mb-2" />
                        <div className={`h-5 w-8 bg-${card.color}-500/20 rounded mt-1`} />
                      </div>
                    ))}
                  </div>
                  <div className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <div className="h-2 w-24 bg-white/10 rounded mb-4" />
                    <div className="flex items-end gap-2 h-16">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-blue-500/40 to-emerald-500/40"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <TrustMarquee />

      {/* FEATURE CARDS */}
      <section id="features" className="px-6 py-28 max-w-7xl mx-auto">
        <div ref={addRevealRef} className="reveal text-center mb-20">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" />
            Core Features
          </span>

          <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
            Everything You Need For
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Smart Health Management
            </span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A complete AI health ecosystem to understand, monitor, and manage your medical data intelligently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={addRevealRef}
              className={`reveal stagger-${index + 1} group relative rounded-2xl p-[1px] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden`}
            >
              {/* Animated gradient border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.borderGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute inset-0 rounded-2xl bg-white/[0.06] group-hover:bg-transparent transition-colors duration-500" />

              <div className="relative bg-[#060b18] backdrop-blur-xl rounded-2xl p-8 h-full">
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.glow}`} />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3`}>
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>

                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 px-6 relative">
        {/* Section ambient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/8 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-20">
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Simple Process
            </span>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              How CareCompass Works
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-[72px] left-[16.6%] right-[16.6%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-emerald-500/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-emerald-500/50 animate-shimmer" />
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  ref={addRevealRef}
                  className={`reveal stagger-${index + 1} group relative text-center`}
                >
                  <div className="relative mx-auto mb-8">
                    <div className={`w-[72px] h-[72px] mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-6`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#030712] border-2 border-white/[0.15] flex items-center justify-center text-xs font-bold text-white group-hover:border-blue-500/50 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-300">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 max-w-xs mx-auto leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-6" ref={statsRef}>
        <div ref={addRevealRef} className="reveal max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: `${toolCount}+`, label: "AI-Powered Tools", icon: <Zap className="w-5 h-5 text-amber-400" /> },
              { value: "100%", label: "Privacy-First", icon: <Lock className="w-5 h-5 text-emerald-400" /> },
              { value: `${availCount}/7`, label: "AI Availability", icon: <Activity className="w-5 h-5 text-blue-400" /> },
              { value: "Free", label: "To Get Started", icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
            ].map((stat, i) => (
              <div
                key={i}
                className="group text-center p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-center mb-3 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-28 px-6 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-blue-600/6 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-16">
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-semibold text-rose-400 uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" />
              Testimonials
            </span>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Loved by Health-Conscious
              <br />
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                Users Everywhere
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                ref={addRevealRef}
                className={`reveal stagger-${i + 1} group relative rounded-2xl p-[1px]`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.04] transition-all duration-500" />
                <div className="relative bg-[#060b18] rounded-2xl p-8 h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-white text-sm font-bold`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section className="px-6 py-28">
        <div ref={addRevealRef} className="reveal relative max-w-4xl mx-auto overflow-hidden rounded-3xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 animate-gradient-shift" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

          {/* Floating orbs */}
          <div className="absolute top-[-50px] right-[-30px] w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[-60px] left-[-40px] w-[180px] h-[180px] bg-white/10 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10 p-14 md:p-20 text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-white/90">
              <Zap className="w-4 h-4" />
              Start in under 30 seconds
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Start Your AI Health
              <br />
              Journey Today
            </h2>

            <p className="text-blue-100/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Generate clinical AI reports, detect health trends, and understand
              your medical data with intelligent, secure, non-diagnostic insights.
            </p>

            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-3 bg-white text-gray-900 px-12 py-4 rounded-2xl text-lg font-bold hover:scale-[1.04] transition-all duration-300 shadow-2xl animate-pulse-glow"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-10 max-w-2xl mx-auto text-center">
          CareCompass provides AI-generated health insights for informational
          purposes only and does not replace professional medical advice.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#020509]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="CareCompass Logo"
                  className="w-9 h-9 object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  CareCompass
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
                Your AI-powered health companion for smarter medical insights.
                Secure, intelligent, and privacy-first.
              </p>
              <div className="flex gap-3">
                {["🏥", "🔬", "💡"].map((emoji, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer">
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors duration-300 flex items-center gap-1 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />Get Started</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors duration-300 flex items-center gap-1 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Features</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition-colors duration-300 flex items-center gap-1 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />AI Report Explainer</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-300 flex items-center gap-1 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />Health Tracking</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-300 flex items-center gap-1 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />Disease Predictor</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} CareCompass AI. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              Built with <span className="text-gray-500">Next.js</span> • <span className="text-gray-500">Firebase</span> • <span className="text-gray-500">Gemini AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Data ─── */
const features = [
  {
    icon: <FileText className="w-6 h-6 text-white" />,
    title: "AI Report Explainer",
    description:
      "Upload medical reports (PDF, images, handwritten) and receive simplified AI explanations instantly.",
    gradient: "from-blue-500 to-blue-600",
    glow: "from-blue-500/10 to-transparent",
    borderGlow: "from-blue-500/40 via-blue-400/20 to-transparent",
  },
  {
    icon: <Pill className="w-6 h-6 text-white" />,
    title: "Prescription Simplifier",
    description:
      "Decode complex prescriptions and medicine instructions into clear, easy-to-understand insights.",
    gradient: "from-violet-500 to-purple-600",
    glow: "from-violet-500/10 to-transparent",
    borderGlow: "from-violet-500/40 via-purple-400/20 to-transparent",
  },
  {
    icon: <LineChart className="w-6 h-6 text-white" />,
    title: "AI Trend Detection",
    description:
      "Track weight, blood sugar, blood pressure, and custom health metrics with intelligent analysis.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "from-emerald-500/10 to-transparent",
    borderGlow: "from-emerald-500/40 via-teal-400/20 to-transparent",
  },
  {
    icon: <Bot className="w-6 h-6 text-white" />,
    title: "AI Health Assistant",
    description:
      "Chat with an AI health companion for personalized non-diagnostic guidance and wellness awareness.",
    gradient: "from-sky-500 to-blue-600",
    glow: "from-sky-500/10 to-transparent",
    borderGlow: "from-sky-500/40 via-blue-400/20 to-transparent",
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: "Smart Reminders",
    description:
      "Manage medicine schedules and never miss a dose with intelligent reminder tracking and alerts.",
    gradient: "from-amber-500 to-orange-600",
    glow: "from-amber-500/10 to-transparent",
    borderGlow: "from-amber-500/40 via-orange-400/20 to-transparent",
  },
  {
    icon: <Brain className="w-6 h-6 text-white" />,
    title: "Disease Predictor",
    description:
      "Analyze symptoms using hybrid AI and clinical logic to get non-diagnostic disease risk insights.",
    gradient: "from-rose-500 to-pink-600",
    glow: "from-rose-500/10 to-transparent",
    borderGlow: "from-rose-500/40 via-pink-400/20 to-transparent",
  },
];

const steps = [
  {
    icon: <Upload className="w-7 h-7 text-white" />,
    title: "Upload Medical Data",
    description:
      "Securely upload reports, prescriptions, and health logs to your private dashboard.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: <Brain className="w-7 h-7 text-white" />,
    title: "AI Clinical Analysis",
    description:
      "Advanced AI models analyze your data and extract meaningful health insights in seconds.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: <HeartPulse className="w-7 h-7 text-white" />,
    title: "Smart Health Insights",
    description:
      "Receive simplified explanations, trend detection, and preventive guidance for better health.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const testimonials = [
  {
    quote: "CareCompass made understanding my blood test results so much easier. The AI explanations are incredibly clear and helpful.",
    name: "Priya Sharma",
    role: "Health Enthusiast",
    initials: "PS",
    avatarGradient: "from-blue-500 to-indigo-600",
  },
  {
    quote: "I love the prescription simplifier. As a caregiver for my parents, it helps me understand their medications without confusion.",
    name: "Rahul Mehta",
    role: "Family Caregiver",
    initials: "RM",
    avatarGradient: "from-emerald-500 to-teal-600",
  },
  {
    quote: "The health tracking and trend detection caught an upward pattern in my blood sugar before it became concerning. Truly invaluable.",
    name: "Ananya Gupta",
    role: "Fitness Tracker",
    initials: "AG",
    avatarGradient: "from-rose-500 to-pink-600",
  },
];
