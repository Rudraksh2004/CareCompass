"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/userService";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  if (!profile) {
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
          Manage your personal health information.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-6">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Full Name
            </p>
            <p className="text-lg font-semibold">
              {profile.name || "Not provided"}
            </p>
          </div>

          {/* Email */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Email
            </p>
            <p className="text-lg font-semibold">
              {user?.email || "Not available"}
            </p>
          </div>

          {/* Age */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Age
            </p>
            <p className="text-lg font-semibold">
              {profile.age || "Not set"}
            </p>
          </div>

          {/* Blood Group */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Blood Group
            </p>
            <p className="text-lg font-semibold">
              {profile.bloodGroup || "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Health Summary Card (UI only, no logic change) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-semibold mb-4">
          Profile Summary
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          This profile is used by CareCompass to personalize AI health
          explanations, insights, and recommendations. Keeping your
          information updated helps the AI provide more relevant and
          accurate health guidance (non-diagnostic).
        </p>

        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          Note: CareCompass provides informational AI assistance only and
          does not replace professional medical advice.
        </div>
      </div>
    </div>
  );
}
