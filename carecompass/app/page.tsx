"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getUserReportHistory } from "@/lib/db";
import { FileText, Clock, ChevronRight, Activity, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserReportHistory(user.uid).then(setReports);
    }
  }, [user]);

  if (loading) return null;

  // --- VIEW 1: LANDING PAGE (Logged Out) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <ShieldCheck size={28} /> CareCompass
          </div>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all">
            Get Started
          </Link>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
            Understand your health <br />
            <span className="text-blue-600 font-serif italic">without the jargon.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mt-6 max-w-2xl mx-auto">
            The AI-powered health companion that simplifies medical reports, 
            explains prescriptions, and keeps your health data organized and private.
          </p>
          
          <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2">
              <Zap size={20} fill="currentColor" /> Start Analyzing Now
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-blue-50 text-left">
              <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Report Simplifier</h3>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">Upload complex lab results and get clear, plain-English explanations instantly.</p>
            </div>
            {/* Add more feature cards here */}
          </div>
        </main>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD (Logged In) ---
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
        <p className="text-slate-500 font-medium">Health overview for {user.email}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-between">
          <Activity size={32} />
          <div>
            <p className="opacity-80 text-sm font-medium">Reports Analyzed</p>
            <h3 className="text-4xl font-black">{reports.length}</h3>
          </div>
        </div>
        <Link href="/simplify" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">New Analysis</h3>
          <p className="text-slate-400 text-sm mt-1">Upload a new document</p>
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-400">
              No history found. Start by simplifying your first report.
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white p-5 rounded-3xl border border-slate-50 flex items-center justify-between hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{report.fileName}</h4>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {report.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}