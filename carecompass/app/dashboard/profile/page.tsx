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

      const data = await getUserProfile(user.uid);

      if (data) {
        setName(data.name || "");
        setAge(data.age || "");
        setBloodGroup(data.bloodGroup || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!name || !age || !bloodGroup) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await updateUserProfile(user.uid, {
        name,
        age,
        bloodGroup,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold">
          Your Profile
        </h1>
        <p className="text-indigo-100 text-sm mt-1">
          Update your personal health information.
        </p>
      </div>

      {/* Editable Profile Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-6">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Email (Read Only)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ""}
              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Age *
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Blood Group *
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl font-medium shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-4">
          Profile Summary
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          This information is used by CareCompass to personalize AI health
          explanations, insights, and recommendations. Keeping your profile
          updated helps the AI provide more relevant (non-diagnostic)
          guidance.
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Note: CareCompass is an AI health companion and does not replace
          professional medical advice.
        </p>
      </div>
    </div>
  );
}
