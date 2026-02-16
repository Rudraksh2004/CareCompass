"use client";

import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* 🔥 Premium Gradient Background (MATCHES SIGNUP) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-emerald-100" />

      {/* Glow Effects */}
      <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[320px] h-[320px] bg-emerald-400/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* 🏥 Brand Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            CareCompass
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">
            AI-Powered Health Companion
          </p>
        </div>

        {/* 💎 Premium Glass Card (HIGH READABILITY) */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Welcome Back
          </h2>

          {/* Email Field */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 🔴 Premium Error Alert */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          {/* 🚀 Gradient CTA Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Footer Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* 🔒 Trust + Medical Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-6 max-w-sm mx-auto">
          Secure authentication powered by Firebase. CareCompass provides
          non-diagnostic AI health assistance. Always consult a medical
          professional for clinical decisions.
        </p>
      </div>
    </div>
  );
}
