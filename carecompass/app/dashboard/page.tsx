"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  if (!profile) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome {profile.name} ({profile.bloodGroup})
      </h1>

      <p className="mt-2 text-gray-600">Age: {profile.age}</p>

      <Link
        href="/dashboard/report"
        className="inline-block mt-6 text-blue-600 underline"
      >
        Explain Medical Report →
      </Link>

      <Link
        href="/dashboard/reminders"
        className="block mt-3 text-blue-600 underline"
      >
        Manage Medicine Reminders →
      </Link>
    </div>
  );
}
