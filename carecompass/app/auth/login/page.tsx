"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Sparkles, Shield, Eye, EyeOff, Sun, Moon, Activity } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
    <div className="min-h-screen flex items-center justify-center px-6 py-10 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 dark:from-[#020617] dark:via-[#050b18] dark:to-[#020814] text-gray-900 dark:text-gray-100 transition-all duration-700">

      {/* ─── Liquid Glass Background Layers ─── */}
      <div className="absolute inset-0 -z-10 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-1000">
        <StarField isDark={isDark} />
        {/* Dynamic Fluid Mesh */}
        <div className="absolute inset-0 overflow-hidden opacity-70 dark:opacity-50">
          <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full bg-blue-400/25 dark:bg-blue-600/15 blur-[130px] animate-fluid-mesh" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[120%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[120px] animate-fluid-mesh [animation-delay:4s]" />
          <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/15 dark:bg-indigo-600/10 blur-[100px] animate-fluid-mesh [animation-delay:2s]" />
        </div>
        <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.3) 1.5px, transparent 1.5px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* Theme Toggle - Restored to standard top-right positioning */}
      {mounted && (
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={handleToggle}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.2rem] border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.04] backdrop-blur-[40px] flex items-center justify-center hover:scale-110 transition-all duration-500 cursor-pointer shadow-xl glass-grain glass-liquid glass-refraction"
          >
            {isDark ? <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" /> : <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />}
          </button>
        </div>
      )}

      <div className="relative w-full max-w-[440px]">
        {/* Brand */}
        <div className="text-center mb-10 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <img src="/logo.png" alt="Logo" className="w-11 h-11 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent italic">CareCompass</span>
          </Link>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500/70 animate-badge-pulse" />
            AI HEALTH INTELLIGENCE
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
            className="relative rounded-[2.5rem] p-10 transition-all duration-500 glass-grain glass-liquid glass-refraction"
          >
            <h2 className="text-xl font-black text-gray-900 dark:text-white text-center mb-1.5 tracking-tighter uppercase italic">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-10 font-bold italic">
              Sign in to access your health dashboard
            </p>

            {/* Email */}
            <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 block">
                Email Address
              </label>
              <div className={`relative rounded-[1.2rem] transition-all duration-300 ${focusedField === "email" ? "ring-2 ring-blue-500/30" : ""}`}>
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="email"
                  className="w-full pl-12 pr-5 py-4 rounded-[1.2rem] border border-white/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-bold shadow-sm"
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
            <div className="mb-10">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 block">
                Password
              </label>
              <div className={`relative rounded-[1.2rem] transition-all duration-300 ${focusedField === "password" ? "ring-2 ring-blue-500/30" : ""}`}>
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-14 py-4 rounded-[1.2rem] border border-white/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-bold shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-all duration-300 hover:scale-110 z-10 cursor-pointer"
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
              className="group w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden relative"
            >
              <span className="relative z-10 italic">{loading ? "Initializing..." : "Authorize Access"}</span>
              {!loading && <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-semibold">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />
            </div>

            {/* Signup Link */}
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center font-bold italic">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-500 font-black hover:text-indigo-500 transition-all uppercase tracking-tight decoration-blue-500/30 underline-offset-8"
              >
                Initialize Profile
              </Link>
            </p>
          </form>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-[40px] border border-white/60 dark:border-white/[0.08] shadow-lg flex items-center gap-2 glass-grain">
             <Shield className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sovereign Node</span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-[40px] border border-white/60 dark:border-white/[0.08] shadow-lg flex items-center gap-2 glass-grain">
             <Activity className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol V3.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
