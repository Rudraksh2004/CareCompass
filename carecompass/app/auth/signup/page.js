"use client";

import { useState } from "react";
import { signup } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await signup(email, password);
      alert("Account created!");
      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-4">Signup</h2>

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 mb-3 w-full"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="bg-blue-500 text-white px-4 py-2 w-full"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
