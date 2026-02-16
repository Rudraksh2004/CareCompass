import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-emerald-50 text-gray-900">
      {/* NAVBAR */}
      <header className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">
          CareCompass
        </h1>

        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="text-gray-600 hover:text-blue-600 transition font-medium"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="text-center px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold leading-tight mb-6">
          Your AI-Powered{" "}
          <span className="text-blue-600">
            Health Companion
          </span>
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          CareCompass is a non-diagnostic AI health assistant that helps you
          understand medical reports, simplify prescriptions, track health
          trends, and generate clinical AI insights — all in one secure platform.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition"
          >
            Get Started Free
          </Link>

          <Link
            href="/auth/login"
            className="border border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-3 rounded-xl text-lg font-medium transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-14">
          Powerful AI Health Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
            <h4 className="text-xl font-semibold mb-3">
              🧾 Medical Report Explainer
            </h4>
            <p className="text-gray-600">
              Upload handwritten, scanned, or PDF medical reports and get
              easy-to-understand AI explanations instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
            <h4 className="text-xl font-semibold mb-3">
              💊 Prescription Simplifier
            </h4>
            <p className="text-gray-600">
              Decode complex prescriptions, medicines, and dosages using
              AI-powered medical interpretation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
            <h4 className="text-xl font-semibold mb-3">
              📊 AI Health Trend Analysis
            </h4>
            <p className="text-gray-600">
              Track weight, blood sugar, and health metrics with AI-powered
              trend detection and abnormal pattern alerts.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
            <h4 className="text-xl font-semibold mb-3">
              🤖 AI Health Chat Assistant
            </h4>
            <p className="text-gray-600">
              Ask health-related questions and receive intelligent,
              non-diagnostic AI guidance anytime.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
            <h4 className="text-xl font-semibold mb-3">
              ⏰ Smart Medicine Reminders
            </h4>
            <p className="text-gray-600">
              Never miss your medication with personalized reminder scheduling
              and tracking.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition">
            <h4 className="text-xl font-semibold mb-3">
              📄 Clinical AI PDF Reports
            </h4>
            <p className="text-gray-600">
              Generate professional multi-page AI health reports with risk
              assessment and clinical summaries.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">
            How CareCompass Works
          </h3>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="text-4xl mb-4">📤</div>
              <h4 className="text-xl font-semibold mb-2">
                Upload Reports or Data
              </h4>
              <p className="text-gray-600">
                Upload medical reports, prescriptions, or health logs securely.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">🧠</div>
              <h4 className="text-xl font-semibold mb-2">
                AI Analysis
              </h4>
              <p className="text-gray-600">
                Advanced AI analyzes your data and detects patterns and insights.
              </p>
            </div>

            <div>
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold mb-2">
                Smart Health Insights
              </h4>
              <p className="text-gray-600">
                Receive clear explanations, trends, and non-diagnostic guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER + CTA */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold mb-6">
          Built for Smarter Health Understanding
        </h3>

        <p className="text-gray-600 mb-8">
          CareCompass is a non-diagnostic AI health companion designed to help
          users better understand their medical data. It does not replace
          professional medical advice. Always consult a qualified healthcare
          professional for medical decisions.
        </p>

        <Link
          href="/auth/signup"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg transition"
        >
          Start Using CareCompass →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CareCompass AI • Non-Diagnostic Health Companion
      </footer>
    </div>
  );
}
