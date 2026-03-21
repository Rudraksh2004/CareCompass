"use client";

import { useState } from "react";
import { signup } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User, Calendar, Droplets, Mail, Lock, Sparkles, Shield, Eye, EyeOff, HeartPulse } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 relative overflow-hidden bg-gray-50 dark:bg-[#030712] transition-colors duration-500">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-180px] left-[-100px] w-[500px] h-[500px] bg-emerald-400/15 dark:bg-emerald-500/12 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-[-180px] right-[-100px] w-[500px] h-[500px] bg-blue-400/15 dark:bg-blue-600/15 rounded-full blur-[140px] animate-float-reverse" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-purple-300/8 dark:bg-purple-600/8 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-3">
            <img src="/logo.png" alt="CareCompass" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:drop-shadow-[0_0_16px_rgba(16,185,129,0.5)] transition-all duration-500" />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              CareCompass
            </span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-base font-medium flex items-center justify-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Create Your AI Health Profile
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 dark:from-emerald-500/15 dark:via-blue-500/10 dark:to-purple-500/15 blur-sm -z-10" />
          <form
            onSubmit={handleSignup}
            className="bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-emerald-500/5 p-8 md:p-10 transition-colors duration-500"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              Set up your personalized health dashboard
            </p>

            {/* Name + Age row */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Blood Group */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Blood Group</label>
              <div className="relative">
                <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm appearance-none cursor-pointer"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
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
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-gray-50/80 dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm"
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
              className="group w-full mt-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">{loading ? "Creating Account..." : "Create Account"}</span>
              {!loading && <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
            </div>

            {/* Login link */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Shield className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Encrypted health data • Non-diagnostic AI assistance
          </p>
        </div>
      </div>
    </div>
  );
}
