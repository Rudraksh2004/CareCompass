"use client";

import { useState, useCallback } from "react";
import { signup } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User, Calendar, Droplets, Mail, Lock, Shield, Eye, EyeOff, HeartPulse, Sun, Moon, Activity } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;
  const handleToggle = useCallback(() => { toggleTheme(); }, [toggleTheme]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !age || !bloodGroup || !email || !password) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await signup(email, password);
      await createUserProfile(userCredential.user.uid, {
        name,
        age: Number(age),
        bloodGroup,
        email,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError("Failed to create account. Try again.");
    }
    setLoading(false);
  };

  const inputClass = (field: string) =>
    `w-full pl-12 pr-5 py-4 rounded-[1.2rem] border border-white/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-bold shadow-sm`;

  const wrapperClass = (field: string) =>
    `relative rounded-[1.2rem] transition-all duration-300 ${focusedField === field ? "ring-2 ring-emerald-500/30" : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8 relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/20 to-indigo-50/10 dark:from-[#020617] dark:via-[#051814] dark:to-[#020814] text-gray-900 dark:text-gray-100 transition-all duration-700">

      {/* ─── Liquid Glass Background Layers ─── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] rounded-full bg-emerald-500/15 dark:bg-emerald-600/20 blur-[130px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[800px] h-[800px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] animate-float-reverse" />
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Theme Toggle */}
      {mounted && (
        <button
          type="button"
          onClick={handleToggle}
          className="absolute top-6 right-6 z-50 w-11 h-11 rounded-2xl border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.04] backdrop-blur-[40px] flex items-center justify-center hover:scale-110 transition-all duration-500 cursor-pointer shadow-xl glass-grain"
          aria-label="Toggle theme"
        >
          {isDark ? <Moon className="w-[18px] h-[18px] text-blue-400" /> : <Sun className="w-[18px] h-[18px] text-amber-500" />}
        </button>
      )}

      <div className="relative w-full max-w-[480px]">
        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <img src="/logo.png" alt="Logo" className="w-11 h-11 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 dark:from-emerald-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent italic">CareCompass</span>
          </Link>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500/70 animate-badge-pulse" />
            INITIALIZE HEALTH PROTOCOL
          </p>
        </div>

        {/* ─── Liquid Glass Card ─── */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {/* Refraction border */}
          <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-white/60 via-white/20 to-white/40 dark:from-white/[0.12] dark:via-white/[0.03] dark:to-white/[0.08] -z-10" />
          <div className="absolute -inset-[2px] rounded-[29px] bg-gradient-to-br from-emerald-400/15 via-transparent to-blue-400/15 dark:from-emerald-500/10 dark:via-transparent dark:to-blue-500/10 blur-[2px] -z-20" />
          <div className="absolute inset-0 rounded-[27px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] -z-10" />

          <form
            onSubmit={handleSignup}
            className="relative bg-white/40 dark:bg-white/[0.02] backdrop-blur-[60px] rounded-[2.5rem] border border-white/60 dark:border-white/[0.08] p-10 transition-all duration-500 glass-grain"
            style={{
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.15)"
            }}
          >
            <h2 className="text-xl font-black text-gray-900 dark:text-white text-center mb-1.5 tracking-tighter uppercase italic">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-10 font-bold italic">
              Set up your personalized health dashboard
            </p>

            {/* Name + Age (2-column) */}
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 block">Name</label>
                <div className={wrapperClass("name")}>
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className={inputClass("name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 block">Age</label>
                <div className={wrapperClass("age")}>
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10" />
                  <input
                    type="number"
                    placeholder="Age"
                    className={inputClass("age")}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onFocus={() => setFocusedField("age")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Blood Group */}
            <div className="mb-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 block">Blood Group</label>
              <div className={wrapperClass("blood")}>
                <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10" />
                <select
                  className="w-full pl-12 pr-10 py-4 rounded-[1.2rem] border border-white/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white focus:outline-none transition-all duration-300 text-sm font-bold appearance-none cursor-pointer"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  onFocus={() => setFocusedField("blood")}
                  onBlur={() => setFocusedField(null)}
                  required
                >
                  <option value="" className="dark:bg-gray-900">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg} className="dark:bg-gray-900">{bg}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 block">Email</label>
              <div className={wrapperClass("email")}>
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 block">Password</label>
              <div className={wrapperClass("password")}>
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-14 py-4 rounded-[1.2rem] border border-white/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-bold shadow-sm"
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
              className="group w-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden relative"
            >
              <span className="relative z-10 italic">{loading ? "Initializing..." : "Register Profile"}</span>
              {!loading && <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-semibold">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />
            </div>

            {/* Login Link */}
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center font-bold italic">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-500 font-black hover:text-indigo-500 transition-all uppercase tracking-tight decoration-blue-500/30 underline-offset-8"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-[40px] border border-white/60 dark:border-white/[0.08] shadow-lg flex items-center gap-2 glass-grain">
             <Shield className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secure Node</span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-[40px] border border-white/60 dark:border-white/[0.08] shadow-lg flex items-center gap-2 glass-grain">
             <Activity className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Non-Diagnostic AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
