"use client";

import { useState, useCallback } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Sparkles, Shield, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;
  const handleToggle = useCallback(() => { toggleTheme(); }, [toggleTheme]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-gray-50 dark:bg-[#030712] transition-colors duration-500">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-180px] right-[-100px] w-[500px] h-[500px] bg-blue-400/15 dark:bg-blue-600/15 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-[-180px] left-[-100px] w-[500px] h-[500px] bg-emerald-400/15 dark:bg-emerald-500/12 rounded-full blur-[140px] animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/8 dark:bg-purple-600/8 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear_gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Theme Toggle */}
      {mounted && (
        <button
          type="button"
          onClick={handleToggle}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] backdrop-blur-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg shadow-gray-200/30 dark:shadow-black/20"
          aria-label="Toggle theme"
        >
          {isDark ? <Moon className="w-[18px] h-[18px] text-blue-400" /> : <Sun className="w-[18px] h-[18px] text-amber-500" />}
        </button>
      )}

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <img src="/logo.png" alt="CareCompass" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_16px_rgba(59,130,246,0.5)] transition-all duration-500" />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              CareCompass
            </span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-base font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            AI-Powered Health Companion
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-emerald-500/20 dark:from-blue-500/15 dark:via-indigo-500/10 dark:to-emerald-500/15 blur-sm -z-10" />
          <form
            onSubmit={handleLogin}
            className="bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-blue-500/5 p-8 md:p-10 transition-colors duration-500"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              Sign in to access your health dashboard
            </p>

            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 text-center font-medium animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full mt-1 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">{loading ? "Signing In..." : "Sign In"}</span>
              {!loading && <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
            </div>

            {/* Signup link */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Shield className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Secured by Firebase • Non-diagnostic AI assistance
          </p>
        </div>
      </div>
    </div>
  );
}
