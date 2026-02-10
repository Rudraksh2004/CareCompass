"use client";

import { useState } from "react";
import { signup } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    try {
      const res = await signup(email, password);

      await createUserProfile(res.user.uid, {
        name,
        age: Number(age),
        bloodGroup,
        email,
      });

      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-black rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-4">Create Profile</h2>

        <input className="input" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Age" onChange={(e) => setAge(e.target.value)} />
        <input className="input" placeholder="Blood Group" onChange={(e) => setBloodGroup(e.target.value)} />
        <input className="input" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="input" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleSignup} className="btn-primary mt-3">
          Signup
        </button>
      </div>
    </div>
  );
}
