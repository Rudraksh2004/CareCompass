"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/userService";

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const data = await getUserProfile(user.uid);

        if (data) {
          setName(data.name || "");
          setAge(data.age ? String(data.age) : "");
          setBloodGroup(data.bloodGroup || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!name.trim() || !age || !bloodGroup) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await updateUserProfile(user.uid, {
        name: name.trim(),
        age: Number(age),
        bloodGroup,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-gray-500 dark:text-gray-400 p-6">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* 🌟 Premium Clinical Header (UI ONLY) */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600/10 via-blue-600/10 to-emerald-600/10 backdrop-blur-xl p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_40%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
            👤 Your Health Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm max-w-2xl leading-relaxed">
            Manage your personal health details to help CareCompass AI generate
            more accurate and contextual health insights tailored specifically
            to you.
          </p>

          {/* User Identity Badge */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 backdrop-blur">
            ✨ Logged in as {user?.email}
          </div>
        </div>
      </div>

      {/* 🧠 Editable Profile Card (Glass + Premium UX) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl transition">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">
              Personal Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Used to personalize AI health analysis and summaries
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
            Secure & Private
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Full Name *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Email (Read Only)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-sm"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Age *
            </label>
            <input
              type="number"
              min="1"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
            />
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Blood Group *
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:opacity-90 transition text-white px-8 py-3 rounded-2xl font-semibold shadow-xl disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </div>

      {/* 📊 AI Health Summary Card (Polished UI Only) */}
      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl transition">
        <h2 className="text-2xl font-semibold mb-4">
          🧠 AI Health Summary
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          CareCompass generates a personalized AI health summary using your
          profile details, health logs, medical reports, and prescription
          history. This enables the AI to provide more relevant, contextual,
          and student-friendly (non-diagnostic) health insights tailored to
          your profile.
        </p>

        <div className="mt-5 p-5 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-900/20 dark:to-emerald-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-sm text-gray-700 dark:text-gray-200">
          💡 Tip: Go to the Dashboard and click "Generate Summary" to analyze
          your complete health data with CareCompass AI.
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 leading-relaxed">
          Disclaimer: CareCompass is an AI health companion designed for
          informational and educational purposes only. It does not provide
          medical diagnosis, treatment, or professional medical advice.
        </p>
      </div>
    </div>
  );
}