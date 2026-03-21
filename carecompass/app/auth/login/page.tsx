"use client";

import { useState, useCallback, useEffect } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Sparkles, Shield, Eye, EyeOff, Sun, Moon, Activity } from "lucide-react";
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 dark:from-[#020617] dark:via-[#0a0f1f] dark:to-[#030b1a] transition-colors duration-700">

      {/* ─── Liquid Glass Background Layers ─── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Primary orbs */}
        <div className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 dark:from-blue-600/20 dark:to-cyan-500/10 blur-[100px] animate-float" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-emerald-400/25 to-teal-300/15 dark:from-emerald-600/15 dark:to-teal-500/8 blur-[100px] animate-float-reverse" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-violet-400/15 to-fuchsia-300/10 dark:from-violet-600/10 dark:to-fuchsia-500/5 blur-[120px]" />

        {/* Smaller floating accent orbs */}
        <div className="absolute top-[20%] left-[15%] w-[200px] h-[200px] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[80px] animate-float" style={{ animationDelay: "1s", animationDuration: "8s" }} />
        <div className="absolute bottom-[25%] right-[15%] w-[180px] h-[180px] rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-[80px] animate-float-reverse" style={{ animationDelay: "2s", animationDuration: "9s" }} />

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.08]" style={{
          backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />
      </div>

      {/* Theme Toggle */}
      {mounted && (
        <button
          type="button"
          onClick={handleToggle}
          className="absolute top-6 right-6 z-50 w-11 h-11 rounded-2xl border border-white/40 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.04] backdrop-blur-2xl flex items-center justify-center hover:bg-white/70 dark:hover:bg-white/[0.08] transition-all duration-500 hover:scale-110 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]"
          aria-label="Toggle theme"
        >
          {isDark ? <Moon className="w-[18px] h-[18px] text-blue-400" /> : <Sun className="w-[18px] h-[18px] text-amber-500" />}
        </button>
      )}

      <div className="relative w-full max-w-[440px]">
        {/* Brand */}
        <div className="text-center mb-10 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <img src="/logo.png" alt="CareCompass" className="relative w-12 h-12 object-contain" />
            </div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
              CareCompass
            </span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500/70 dark:text-blue-400/70" />
            AI-Powered Health Companion
          </p>
        </div>

        {/* ─── Liquid Glass Card ─── */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {/* Glass refraction border effect */}
          <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-white/60 via-white/20 to-white/40 dark:from-white/[0.12] dark:via-white/[0.03] dark:to-white/[0.08] -z-10" />
          <div className="absolute -inset-[2px] rounded-[29px] bg-gradient-to-br from-blue-400/15 via-transparent to-emerald-400/15 dark:from-blue-500/10 dark:via-transparent dark:to-emerald-500/10 blur-[2px] -z-20" />

          {/* Inner glow */}
          <div className="absolute inset-0 rounded-[27px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] -z-10" />

          <form
            onSubmit={handleLogin}
            className="relative bg-white/60 dark:bg-white/[0.03] backdrop-blur-3xl backdrop-saturate-[1.8] rounded-[27px] border border-white/50 dark:border-white/[0.07] p-9 md:p-10 transition-all duration-500"
            style={{
              boxShadow: isDark
                ? "0 24px 80px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)"
                : "0 24px 80px -12px rgba(0,0,0,0.08), 0 8px 32px -8px rgba(59,130,246,0.06)"
            }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1.5 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              Sign in to access your health dashboard
            </p>

            {/* Email */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">
                Email Address
              </label>
              <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === "email" ? "ring-2 ring-blue-500/30 dark:ring-blue-400/20" : ""}`}>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400 dark:text-gray-500 transition-colors" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200/80 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-medium"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">
                Password
              </label>
              <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === "password" ? "ring-2 ring-blue-500/30 dark:ring-blue-400/20" : ""}`}>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200/80 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-medium"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200/60 dark:border-red-500/15 bg-red-50/80 dark:bg-red-500/[0.06] backdrop-blur-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 text-center font-medium animate-fade-in-up">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:via-indigo-500 hover:to-emerald-400 text-white py-4 rounded-2xl font-semibold text-base shadow-[0_8px_30px_-6px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_-6px_rgba(59,130,246,0.5)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">{loading ? "Signing In..." : "Sign In"}</span>
              {!loading && <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-semibold">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />
            </div>

            {/* Signup Link */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300 underline decoration-blue-400/30 underline-offset-4 hover:decoration-blue-500/60"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2.5 mt-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl border border-white/50 dark:border-white/[0.06]">
            <Shield className="w-3 h-3 text-emerald-500/70 dark:text-emerald-400/70" />
            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium tracking-wide">Secured by Firebase</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl border border-white/50 dark:border-white/[0.06]">
            <Activity className="w-3 h-3 text-blue-500/70 dark:text-blue-400/70" />
            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium tracking-wide">Non-diagnostic AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
