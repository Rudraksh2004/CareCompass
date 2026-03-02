"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900 overflow-hidden">
      {/* 🔥 GLOBAL PREMIUM BACKGROUND GLOWS */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[420px] h-[420px] bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_40%)]" />
      </div>

      {/* NAVBAR (GLASS + PREMIUM) */}
      <header className="w-full border-b border-white/40 backdrop-blur-xl bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            CareCompass
          </h1>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION (ULTRA PREMIUM) */}
      <section className="relative px-6 pt-28 pb-24 text-center">
        {/* Grid Pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shadow-sm">
            🧠 AI-Powered Non-Diagnostic Health Companion
          </span>

          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Understand Your Health
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              With Clinical-Grade AI Insights
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            CareCompass helps you simplify medical reports, decode prescriptions,
            track health trends, and generate professional AI health insights —
            all in one secure, intelligent, and privacy-first platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:scale-105 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-2xl transition-all duration-300"
            >
              🚀 Get Started Free
            </Link>

            <Link
              href="/auth/login"
              className="px-10 py-4 rounded-2xl border border-gray-300 text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition backdrop-blur-md bg-white/60"
            >
              Login
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2">🔒 Secure & Private</span>
            <span className="flex items-center gap-2">🧠 AI-Powered Analysis</span>
            <span className="flex items-center gap-2">⚕️ Non-Diagnostic Guidance</span>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS (GLASS + HOVER GLOW) */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need For Smart Health Tracking
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A complete AI health ecosystem designed to help you understand,
            monitor, and manage your medical data intelligently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Glow Hover Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-500/10 to-emerald-500/10" />

              <div className="relative z-10">
                <div className="text-4xl mb-5">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (PREMIUM CARDS) */}
      <section className="bg-white/80 backdrop-blur-xl border-y border-gray-100 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-16">
            How CareCompass Works
          </h3>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 text-2xl group-hover:scale-110 transition">
                  {step.icon}
                </div>
                <h4 className="text-xl font-semibold mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM CTA (SAAS STYLE) */}
      <section className="px-6 py-24 text-center">
        <div className="relative max-w-4xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-3xl p-14 text-white shadow-2xl overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your AI Health Journey Today
            </h3>

            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Generate clinical AI reports, detect health trends, and understand
              your medical data with intelligent, secure, non-diagnostic insights.
            </p>

            <Link
              href="/auth/signup"
              className="inline-block bg-white text-blue-600 px-12 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition shadow-xl"
            >
              Create Free Account →
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-10 max-w-2xl mx-auto">
          CareCompass provides AI-generated health insights for informational
          purposes only and does not replace professional medical advice.
        </p>
      </section>

      {/* FOOTER (PREMIUM MINIMAL) */}
      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500 bg-white/70 backdrop-blur-xl">
        <p className="font-medium">
          © {new Date().getFullYear()} CareCompass AI
        </p>
        <p className="mt-1">
          Built with Next.js, Firebase & Gemini AI
        </p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🧾",
    title: "AI Report Explainer",
    description:
      "Upload medical reports (PDF, images, handwritten) and receive simplified AI explanations instantly.",
  },
  {
    icon: "💊",
    title: "Prescription Simplifier",
    description:
      "Decode complex prescriptions and medicine instructions into clear, easy-to-understand insights.",
  },
  {
    icon: "📊",
    title: "AI Trend Detection",
    description:
      "Track weight, blood sugar, blood pressure, and custom health metrics with intelligent analysis.",
  },
  {
    icon: "🤖",
    title: "AI Health Assistant",
    description:
      "Chat with an AI health companion for personalized non-diagnostic guidance and awareness.",
  },
  {
    icon: "⏰",
    title: "Smart Reminders",
    description:
      "Manage medicine schedules and never miss a dose with intelligent reminder tracking.",
  },
  {
    icon: "📄",
    title: "Clinical PDF Reports",
    description:
      "Generate professional multi-page AI health reports with insights, trends, and risk overview.",
  },
];

const steps = [
  {
    icon: "📤",
    title: "Upload Medical Data",
    description:
      "Securely upload reports, prescriptions, and health logs to your private dashboard.",
  },
  {
    icon: "🧠",
    title: "AI Clinical Analysis",
    description:
      "Advanced AI models analyze your data and extract meaningful health insights.",
  },
  {
    icon: "📈",
    title: "Smart Health Insights",
    description:
      "Receive simplified explanations, trend detection, and preventive guidance.",
  },
];