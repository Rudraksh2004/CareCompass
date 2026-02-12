"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/userService";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((data) => {
        if (data) {
          setProfile(data);
          setName(data.name || "");
          setAge(data.age || "");
          setBloodGroup(data.bloodGroup || "");
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setSaved(false);

    await updateUserProfile(user.uid, {
      name,
      age,
      bloodGroup,
    });

    setLoading(false);
    setSaved(true);
  };

  if (!profile) {
    return (
      <div className="text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-bold mb-6">
        My Profile
      </h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full border border-slate-300 p-3 rounded-xl bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Blood Group
          </label>
          <input
            value={bloodGroup}
            onChange={(e) =>
              setBloodGroup(e.target.value)
            }
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl shadow-sm"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {saved && (
          <p className="text-green-600 text-sm">
            Profile updated successfully!
          </p>
        )}
      </div>
    </div>
  );
}
