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

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await signup(email, password);

      await createUserProfile(userCredential.user.uid, {
        name,
        age: Number(age),
        bloodGroup,
        email,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* 🔥 Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-emerald-100" />

      {/* Glow Effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* 🏥 Brand Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            CareCompass
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">
            Create Your AI Health Profile
          </p>
        </div>

        {/* 💎 Premium Glass Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Create Account
          </h2>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Age
              </label>
              <input
                type="number"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Blood Group
              </label>
              <input
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="e.g., O+, B+, AB-"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
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

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 🚀 CTA Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Footer */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* 🔒 Trust Note */}
        <p className="text-xs text-gray-500 text-center mt-6 max-w-sm mx-auto">
          Your health data is securely stored and used only for AI insights.
          CareCompass provides non-diagnostic assistance only.
        </p>
      </div>
    </div>
  );
}
