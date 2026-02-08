"use client";
import { useState } from "react";
import { Pill, Plus, Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function MedsPage() {
  const { user } = useAuth();
  const [meds, setMeds] = useState([
    { name: "Amoxicillin", dose: "500mg", frequency: "Twice a day" }
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medication Hub</h1>
          <p className="text-slate-500">Track your prescriptions and schedules.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100">
          <Plus size={20} /> Add New
        </button>
      </header>

      <div className="grid gap-4">
        {meds.map((med, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
              <Pill size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800">{med.name}</h3>
              <p className="text-slate-500 text-sm font-medium">{med.dose} • {med.frequency}</p>
            </div>
            <button className="text-slate-300 hover:text-red-500 transition-colors p-2">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}