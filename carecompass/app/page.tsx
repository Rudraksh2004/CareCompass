"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Bot, FileText, Pill, LineChart, Clock, FlaskConical, Brain, HeartPulse, Upload, Sparkles, ArrowRight, Shield, Activity, Stethoscope } from "lucide-react";

export default function Home() {
  const revealRefs = useRef<HTMLDivElement[]>([]);

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

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 overflow-hidden">
      {/* GLOBAL AMBIENT BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[180px] animate-float" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] bg-emerald-500/12 rounded-full blur-[180px] animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/8 rounded-full blur-[200px]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* NAVBAR */}
      <header className="w-full border-b border-white/[0.06] backdrop-blur-2xl bg-[#030712]/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CareCompass Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
            />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              CareCompass
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">How It Works</a>
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
              className="relative group bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.03]"
            >
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-32 pb-28">
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
              className="group relative bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.04] flex items-center gap-3"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/auth/login"
              className="px-10 py-4 rounded-2xl border border-white/[0.1] text-lg font-semibold hover:border-white/[0.25] hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-xl"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="animate-fade-in-up stagger-4 flex flex-wrap justify-center gap-6 mt-16">
            {[
              { icon: <Shield className="w-4 h-4" />, text: "End-to-End Encrypted" },
              { icon: <Brain className="w-4 h-4" />, text: "Gemini AI Powered" },
              { icon: <Stethoscope className="w-4 h-4" />, text: "Non-Diagnostic Guidance" },
            ].map((badge, i) => (
              <span
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 backdrop-blur-xl"
              >
                {badge.icon}
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </section>

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
              className={`reveal stagger-${index + 1} group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.05] overflow-hidden`}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.glow}`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
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
            <div className="hidden md:block absolute top-[72px] left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-emerald-500/30" />

            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  ref={addRevealRef}
                  className={`reveal stagger-${index + 1} group relative text-center`}
                >
                  {/* Step number */}
                  <div className="relative mx-auto mb-8">
                    <div className={`w-[72px] h-[72px] mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#030712] border-2 border-white/[0.1] flex items-center justify-center text-xs font-bold text-white">
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
      <section className="py-20 px-6">
        <div ref={addRevealRef} className="reveal max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
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

          <div className="relative z-10 p-14 md:p-20 text-center">
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
      <footer className="border-t border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl">
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
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                Your AI-powered health companion for smarter medical insights.
                Secure, intelligent, and privacy-first.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Features</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition-colors">AI Report Explainer</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Health Tracking</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Disease Predictor</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} CareCompass AI. All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              Built with Next.js, Firebase & Gemini AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <FileText className="w-6 h-6 text-white" />,
    title: "AI Report Explainer",
    description:
      "Upload medical reports (PDF, images, handwritten) and receive simplified AI explanations instantly.",
    gradient: "from-blue-500 to-blue-600",
    glow: "from-blue-500/10 to-transparent",
  },
  {
    icon: <Pill className="w-6 h-6 text-white" />,
    title: "Prescription Simplifier",
    description:
      "Decode complex prescriptions and medicine instructions into clear, easy-to-understand insights.",
    gradient: "from-violet-500 to-purple-600",
    glow: "from-violet-500/10 to-transparent",
  },
  {
    icon: <LineChart className="w-6 h-6 text-white" />,
    title: "AI Trend Detection",
    description:
      "Track weight, blood sugar, blood pressure, and custom health metrics with intelligent analysis.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "from-emerald-500/10 to-transparent",
  },
  {
    icon: <Bot className="w-6 h-6 text-white" />,
    title: "AI Health Assistant",
    description:
      "Chat with an AI health companion for personalized non-diagnostic guidance and wellness awareness.",
    gradient: "from-sky-500 to-blue-600",
    glow: "from-sky-500/10 to-transparent",
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: "Smart Reminders",
    description:
      "Manage medicine schedules and never miss a dose with intelligent reminder tracking and alerts.",
    gradient: "from-amber-500 to-orange-600",
    glow: "from-amber-500/10 to-transparent",
  },
  {
    icon: <Brain className="w-6 h-6 text-white" />,
    title: "Disease Predictor",
    description:
      "Analyze symptoms using hybrid AI and clinical logic to get non-diagnostic disease risk insights.",
    gradient: "from-rose-500 to-pink-600",
    glow: "from-rose-500/10 to-transparent",
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

const stats = [
  { value: "6+", label: "AI-Powered Tools" },
  { value: "100%", label: "Privacy-First" },
  { value: "24/7", label: "AI Availability" },
  { value: "Free", label: "To Get Started" },
];
