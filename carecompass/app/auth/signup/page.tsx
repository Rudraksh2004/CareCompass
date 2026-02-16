"use client";

import { useState } from "react";
import { signup } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
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
    <div className="min-h-screen relative overflow-hidden px-6 py-10">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-emerald-100" />

      {/* Glow Effects (Premium Feel) */}
      <div className="absolute top-[-120px] right-[-120px] w-[350px] h-[350px] bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[350px] h-[350px] bg-emerald-400/20 rounded-full blur-3xl" />

      {/* Header (FIXED POSITION & PREMIUM) */}
      <div className="relative max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
          CareCompass
        </h1>
        <p className="text-gray-600 mt-3 text-lg font-medium">
          Create Your AI Health Profile
        </p>
      </div>

      {/* Centered Form Container */}
      <div className="relative flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Premium Glass Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-10 transition-all">
            {/* Card Title */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Create Account
            </h2>

            {/* Full Name */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Age */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700">
                Age
              </label>
              <input
                type="number"
                placeholder="Enter your age"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            {/* Blood Group */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700">
                Blood Group
              </label>
              <input
                type="text"
                placeholder="e.g., O+, B+, AB-"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a secure password"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center font-medium">
                {error}
              </p>
            )}

            {/* CTA Button (Premium Gradient) */}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Footer Link */}
            <p className="text-sm text-gray-500 text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>

          {/* Trust Note (Medical SaaS Touch) */}
          <p className="text-xs text-gray-500 text-center mt-6 max-w-md mx-auto">
            Your health data is securely encrypted and used only for AI insights.
            CareCompass provides non-diagnostic assistance and does not replace
            professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
