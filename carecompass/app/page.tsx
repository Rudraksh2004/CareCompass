import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <h1 className="text-4xl font-bold mb-4">
        CareCompass
      </h1>

      <p className="text-gray-600 max-w-xl mb-8">
        AI-powered non-diagnostic health companion that
        helps you understand medical reports, track
        health metrics, manage medicine reminders,
        and receive personalized health insights.
      </p>

      <div className="flex gap-4">
        <Link
          href="/auth/signup"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Get Started
        </Link>

        <Link
          href="/auth/login"
          className="border px-6 py-3 rounded-lg"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
