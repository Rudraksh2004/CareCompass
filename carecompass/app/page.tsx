import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-gray-900">
      {/* NAVBAR */}
      <header className="w-full border-b border-gray-200/60 backdrop-blur-md bg-white/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-blue-600">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-24 pb-20 text-center">
        {/* Glow Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />

        <div className="max-w-5xl mx-auto">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            AI-Powered Non-Diagnostic Health Companion
          </span>

          <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Understand Your Health
            <br />
            <span className="text-blue-600">
              With Clinical-Grade AI Insights
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            CareCompass helps you simplify medical reports, decode prescriptions,
            track health trends, and generate professional AI health insights —
            all in one secure and intelligent platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg transition"
            >
              Get Started Free
            </Link>

            <Link
              href="/auth/login"
              className="px-8 py-4 rounded-2xl border border-gray-300 text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition"
            >
              Login
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-500">
            <span>🔒 Secure & Private</span>
            <span>🧠 AI-Powered Analysis</span>
            <span>⚕️ Non-Diagnostic Guidance</span>
          </div>
        </div>
      </section>

      {/* PREMIUM FEATURE CARDS */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
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
              className="group bg-white/70 backdrop-blur-lg border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (PREMIUM TIMELINE STYLE) */}
      <section className="bg-white border-y border-gray-100 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-16">
            How CareCompass Works
          </h3>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  {step.icon}
                </div>
                <h4 className="text-xl font-semibold mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-emerald-500 rounded-3xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your AI Health Journey Today
          </h3>

          <p className="text-blue-100 text-lg mb-10">
            Generate clinical AI reports, detect health trends, and understand
            your medical data with intelligent, non-diagnostic insights.
          </p>

          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-10 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition shadow-lg"
          >
            Create Free Account →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8 max-w-2xl mx-auto">
          CareCompass provides AI-generated health insights for informational
          purposes only and does not replace professional medical advice.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CareCompass AI • Built with Next.js,
        Firebase & AI
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
      "Track weight, blood sugar, and health metrics with intelligent abnormal trend analysis.",
  },
  {
    icon: "🤖",
    title: "AI Health Assistant",
    description:
      "Chat with an AI health companion for non-diagnostic guidance and health awareness.",
  },
  {
    icon: "⏰",
    title: "Smart Reminders",
    description:
      "Manage medicine schedules and never miss a dose with personalized reminders.",
  },
  {
    icon: "📄",
    title: "Clinical PDF Reports",
    description:
      "Generate professional multi-page AI health reports with risk assessment and insights.",
  },
];

const steps = [
  {
    icon: "📤",
    title: "Upload Medical Data",
    description:
      "Upload reports, prescriptions, or health logs securely to the platform.",
  },
  {
    icon: "🧠",
    title: "AI Analysis",
    description:
      "Advanced AI models analyze your data and extract meaningful health insights.",
  },
  {
    icon: "📈",
    title: "Smart Insights",
    description:
      "Receive simplified explanations, trends, and non-diagnostic recommendations.",
  },
];
