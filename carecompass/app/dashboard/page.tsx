"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/userService";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  if (!profile) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome {profile.name} ({profile.bloodGroup})
      </h1>
      <p className="mt-2">Age: {profile.age}</p>
    </div>
  );
}
