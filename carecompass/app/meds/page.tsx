"use client";
import { useState } from 'react';
import { Pill, Plus, Clock, Bell } from 'lucide-react';

export default function MedsPage() {
  // Logic for adding meds and reminders will go here
  const [meds, setMeds] = useState([
    { name: "Amoxicillin", dose: "500mg", time: "08:00 AM", days: "5 remaining" },
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medications</h1>
          <p className="text-slate-500 font-medium">Manage your prescriptions and reminders.</p>
        </div>
        <button className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-100">
          <Plus size={20} />
          <span className="hidden md:inline">Add Medication</span>
        </button>
      </header>

      <div className="grid gap-4">
        {meds.map((med, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-6 shadow-sm">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
              <Pill size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">{med.name}</h3>
              <p className="text-slate-500 text-sm">{med.dose} • {med.days}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
                <Clock size={16} className="text-blue-500" />
                {med.time}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                Next Dose
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white flex items-center justify-between shadow-xl shadow-blue-100">
        <div className="flex items-center gap-4">
          <Bell className="animate-bounce" />
          <div>
            <p className="font-bold">Reminders are Active</p>
            <p className="text-blue-100 text-sm">We'll notify you when it's time for your next dose.</p>
          </div>
        </div>
        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          Settings
        </button>
      </div>
    </div>
  );
}