"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { 
  ChevronLeft, 
  Brain, 
  ShieldCheck, 
  Zap, 
  Search, 
  HeartPulse, 
  Dna,
  Database,
  Globe
} from "lucide-react";

export default function AboutPage() {
  const { theme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : false;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 dark:from-[#020617] dark:via-[#050b18] dark:to-[#020814] text-gray-900 dark:text-gray-100 selection:bg-blue-500/20">
      
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/60 dark:border-white/[0.08] backdrop-blur-[40px] bg-white/40 dark:bg-[#030712]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
               <ChevronLeft size={20} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Back to Hub</span>
          </Link>
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="w-8 h-8" />
             <span className="text-lg font-black italic tracking-tighter">CareCompass</span>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-blue-500/[0.03] blur-[150px] -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mb-12">
            MISSION REPORT V1.0
          </div>
          <h1 className="text-5xl md:text-8xl font-black leading-[1] tracking-tighter mb-10 italic">
            The Clinical <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">Sovereignty Node.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-400 max-w-3xl mx-auto font-bold italic leading-relaxed">
            CareCompass isn't just a dashboard—it's a clinical-grade architectural response to the fragmentation of modern healthcare data.
          </p>
        </div>
      </section>

      {/* ─── CORE VISION ─── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">The <span className="text-blue-600">Vision</span></h2>
               <p className="text-gray-700 dark:text-gray-400 text-xl font-bold italic leading-relaxed">
                 To empower every human with an autonomous, AI-driven diagnostic node that bridge the gap between complex clinical reports and actionable personal health knowledge.
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
               <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 font-black italic tracking-[0.4em]">01</div>
                  <h4 className="text-lg font-black italic uppercase tracking-tighter mb-4">Accuracy</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">Leveraging Google's Gemini 1.5 Pro infrastructure for high-precision inference.</p>
               </div>
               <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 font-black italic tracking-[0.4em]">02</div>
                  <h4 className="text-lg font-black italic uppercase tracking-tighter mb-4">Privacy</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">End-to-End encrypted data silos ensuring total sovereignty.</p>
               </div>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
             <div className="relative p-3 rounded-[4rem] border border-white dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] backdrop-blur-[80px] overflow-hidden glass-grain shadow-2xl">
                <div className="p-16 space-y-10">
                   {[
                     { icon: <ShieldCheck size={24} />, title: "HIPAA Compliant", desc: "Enterprise-grade data standards." },
                     { icon: <Dna size={24} />, title: "Medical Modeling", desc: "Non-diagnostic interpretative AI." },
                     { icon: <Globe size={24} />, title: "Universal Access", desc: "Global health democratization." }
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                           {item.icon}
                        </div>
                        <div>
                           <h5 className="font-black uppercase tracking-widest text-sm">{item.title}</h5>
                           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight italic opacity-70">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── PROJECT ARCHITECT (RUDRAKSH GANGULY) ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.05] blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[4rem] bg-white/40 dark:bg-white/[0.02] border border-white dark:border-white/[0.08] backdrop-blur-[100px] glass-grain relative shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="relative">
                <div className="w-full aspect-square rounded-[3rem] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 border border-white dark:border-white/[0.1] shadow-2xl flex items-center justify-center relative overflow-hidden group/img">
                   <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-700" />
                   <div className="text-6xl font-black italic tracking-tighter text-blue-600 dark:text-blue-500">RG</div>
                   <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10 opacity-0 group-hover/img:opacity-100 translate-y-4 group-hover/img:translate-y-0 transition-all duration-700">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Status: Active</p>
                      <p className="text-[10px] font-bold text-gray-800 dark:text-gray-300">Identity: Verified Architect</p>
                   </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-3xl bg-blue-600 p-8 flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-12 transition-transform duration-700">
                   <Brain size={48} />
                </div>
             </div>

             <div className="space-y-8">
                <div>
                   <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-500 mb-4 opacity-80">Project Architect</h4>
                   <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-6 dark:text-white leading-none">Rudraksh Ganguly</h2>
                   <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                </div>
                
                <p className="text-lg text-gray-700 dark:text-gray-400 font-bold italic leading-relaxed">
                  "CareCompass was engineered to provide total personal sovereignty over clinical data. We are building more than an AI tool—we are building an infrastructure of trust."
                </p>

                <div className="space-y-4 pt-6">
                   {[
                     "Lead Developer of the Liquid Glass Protocol",
                     "Architect of Neural Status Bio-Linking",
                     "Chief Operations Node & Full-Stack Strategist"
                   ].map((spec, i) => (
                     <div key={i} className="flex items-center gap-4 group/item">
                        <div className="w-2 h-2 rounded-full bg-blue-500/40 group-hover/item:bg-blue-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{spec}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES SECTION ─── */}
      <section className="py-32 px-6 bg-blue-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-600 animate-gradient-shift opacity-90" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-16 leading-tight">
              Our Institutional <br /> Values Node
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { title: "Sovereignty", desc: "Your medical data belongs to you. Not to us, not to providers." },
                { title: "Clarity", desc: "Transforming medical jaragon into actionable health protocols." },
                { title: "Velocity", desc: "Instant AI processing for high-speed diagnostic interpretration." }
              ].map((v, i) => (
                <div key={i} className="p-12 rounded-[3.5rem] bg-white/10 backdrop-blur-xl border border-white/20 text-center">
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-6">{v.title}</h3>
                   <p className="text-sm font-bold opacity-80 italic leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
        </div>
      </section>

      <footer className="py-24 border-t border-white/60 dark:border-white/[0.08] text-center">
         <p className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 mb-8">Clinical Integrity Verified</p>
         <Link href="/" className="px-10 py-5 rounded-[2rem] bg-gray-900 text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl">
            Return to Protocol Hub
         </Link>
      </footer>
    </div>
  );
}
