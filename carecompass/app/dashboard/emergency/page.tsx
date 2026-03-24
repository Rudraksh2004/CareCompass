"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getEmergencyProfile,
  saveEmergencyProfile,
} from "@/services/emergencyService";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";
import { 
  ShieldAlert, 
  Droplet, 
  User, 
  Phone, 
  Pill, 
  Activity, 
  Download, 
  QrCode, 
  Save, 
  AlertCircle,
  Stethoscope,
  Heart,
  Clock,
  Sparkles,
  ExternalLink,
  Info,
  Dna,
  Zap,
  ArrowRight
} from "lucide-react";

export default function EmergencyPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [contact, setContact] = useState("");

  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getEmergencyProfile(user.uid);
      if (data) {
        setName(data.name || "");
        setBloodGroup(data.bloodGroup || "");
        setAllergies(data.allergies || "");
        setConditions(data.conditions || "");
        setMedications(data.medications || "");
        setContact(data.contact || "");
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await saveEmergencyProfile(user.uid, {
      name,
      bloodGroup,
      allergies,
      conditions,
      medications,
      contact,
    });
    setSaving(false);
  };

  const downloadEmergencyCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "transparent",
        pixelRatio: 4,
        style: {
          borderRadius: "1.5rem",
        }
      });
      const link = document.createElement("a");
      link.download = `CareCompass_Emergency_ID.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const currentUrl = typeof window !== "undefined" ? `${window.location.origin}/emergency/${user?.uid}` : "";

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100 animate-in fade-in duration-700 pb-20 px-4">
      
      {/* 🌟 Premium Clinical Header (Medicine Reminder Style) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] backdrop-saturate-[2] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-blue-600/5 to-purple-600/10 dark:from-red-500/10 dark:via-blue-500/5 dark:to-purple-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.15),_transparent_40%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-blue-600 to-purple-500 dark:from-red-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-4">
              <ShieldAlert size={36} className="text-red-500" />
              Emergency ID Protocol
            </h1>
            <p className="text-gray-700 dark:text-gray-300 font-bold text-sm max-w-2xl leading-relaxed">
              Synthesize your vital clinical profile into a digital Bio-Shard. Designed for instant diagnostic access by first responders in critical situations.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/10 backdrop-blur-md">
             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Bio-Link Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* 🧠 Input Card (Medicine Reminder Style) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-10 order-2 xl:order-1">
          <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] backdrop-saturate-[2] p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-sm flex items-center gap-3">
                <Activity size={24} className="text-blue-500" />
                Vitals Configuration
              </h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
                Enter your medical data to update your Emergency Bio-Shard
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Full Name" value={name} setValue={setName} icon={<User size={16} />} placeholder="Legal name..." />

              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <Droplet size={14} className="text-red-500" /> Blood Group
                </label>
                <div className="relative group/select">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">Select...</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-white dark:bg-gray-900">{bg}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Zap size={14} />
                  </div>
                </div>
              </div>

              <Input label="Allergies" value={allergies} setValue={setAllergies} icon={<AlertCircle size={16} />} placeholder="Peanuts, etc..." />
              <Input label="Conditions" value={conditions} setValue={setConditions} icon={<Stethoscope size={16} />} placeholder="Asthma, etc..." />
              <Input label="Medications" value={medications} setValue={setMedications} icon={<Pill size={16} />} placeholder="Aspirin, etc..." />
              <Input label="Contact" value={contact} setValue={setContact} icon={<Phone size={16} />} placeholder="Emergency link..." />
            </div>

            <button
               onClick={handleSave}
               disabled={saving}
               className="w-full bg-gradient-to-r from-red-600 via-blue-600 to-purple-600 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(239,68,68,0.4)] transition-all text-white py-5 rounded-2xl font-black shadow-lg disabled:opacity-50 text-base flex items-center justify-center gap-3"
            >
               {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
               {saving ? "Updating Cloud Ledger..." : "Sync Vitals to Bio-Shard ID"}
            </button>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
             <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
             <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed uppercase tracking-tighter">
                NOTICE: THE DATA ENTERED HERE IS FOR EMERGENCY FIRST-RESPONDER USE. MAINTAIN ACCURACY FOR OPTIMAL CLINICAL PERFORMANCE.
             </p>
          </div>

          {/* QR Code Toggle Controller */}
          <div className="relative border border-white/80 dark:border-white/[0.05] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${showQR ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                <QrCode size={24} />
              </div>
              <div>
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Diagnostic QR Protocol</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Enable instant cloud record access</p>
              </div>
            </div>
            <button 
              onClick={() => setShowQR(!showQR)}
              className={`relative w-14 h-8 rounded-full transition-all duration-500 ${showQR ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-300 dark:bg-gray-800'}`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-500 ${showQR ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* 💳 The Premium Emergency Card (Refined Style) */}
        <div className="lg:col-span-12 xl:col-span-5 order-1 xl:order-2">
          <div className="sticky top-10 space-y-10">
            
            <div
              ref={cardRef}
              className="relative w-full aspect-[1.58/1] bg-gradient-to-br from-[#111827] via-[#03060f] to-[#111827] rounded-[1.5rem] overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700"
            >
               {/* Titanium Glint Animation */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-red-500/5 pointer-events-none" />
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
               
               {/* Card Header */}
               <div className="h-16 px-8 flex items-center justify-between bg-white/[0.02] border-b border-white/10">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                        <Heart size={16} className="text-white fill-white shadow-lg" />
                     </div>
                     <span className="text-white font-black text-sm tracking-tighter uppercase whitespace-nowrap italic">CareCompass Bio-Shard ID</span>
                  </div>
                  <div className="flex gap-1">
                     {[1,2,3].map(i => <div key={i} className="w-4 h-[2px] bg-red-500/40 rounded-full" />)}
                  </div>
               </div>

                <div className="p-8 space-y-6 flex flex-col h-[calc(100%-4rem)]">
                   {/* Primary Identity Section */}
                   <div className="flex justify-between items-start gap-6">
                      <div className="space-y-3 flex-1 min-w-0">
                         <div className="space-y-0.5">
                            <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest opacity-70">Medical Shard Identity</p>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic truncate bg-gradient-to-r from-white via-white to-white/60 bg-clip-text">
                               {name || "Awaiting Setup"}
                            </h3>
                         </div>
                         
                         <div className="flex items-center gap-6">
                            <div className="space-y-0.5">
                               <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest opacity-70">Serology</p>
                               <div className="flex items-center gap-1.5">
                                  <span className="text-xl font-black text-red-500 tracking-tighter">{bloodGroup || "--"}</span>
                                  <Droplet size={14} className="text-red-500/40 fill-red-500" />
                               </div>
                            </div>
                            <div className="space-y-0.5 max-w-[140px]">
                               <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest opacity-70">Relay Link</p>
                               <span className="text-[10px] font-black text-gray-200 truncate block tracking-tighter">{contact || "IDLE"}</span>
                            </div>
                         </div>
                      </div>
                      
                      {showQR && (
                        <div className="shrink-0 p-2 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/20 animate-in zoom-in duration-500">
                           <QRCode 
                             value={currentUrl} 
                             size={64} 
                             level="M" 
                             viewBox={`0 0 256 256`}
                             style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                           />
                        </div>
                      )}
                   </div>

                   {/* Secondary Medical Details (Multi-Column) */}
                   <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/[0.05]">
                      <div className="space-y-0.5 group">
                        <div className="flex items-center gap-1">
                          <AlertCircle size={8} className="text-amber-500" />
                          <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest opacity-70">Allergies</p>
                        </div>
                        <p className="text-[9px] font-bold text-gray-300 line-clamp-1 leading-tight group-hover:line-clamp-none transition-all">{allergies || "None Registered"}</p>
                      </div>

                      <div className="space-y-0.5 group">
                        <div className="flex items-center gap-1">
                          <Stethoscope size={8} className="text-blue-500" />
                          <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest opacity-70">Conditions</p>
                        </div>
                        <p className="text-[9px] font-bold text-gray-300 line-clamp-1 leading-tight">{conditions || "None Registered"}</p>
                      </div>

                      <div className="space-y-0.5 group">
                        <div className="flex items-center gap-1">
                          <Pill size={8} className="text-purple-500" />
                          <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest opacity-70">Medications</p>
                        </div>
                        <p className="text-[9px] font-bold text-gray-300 line-clamp-1 leading-tight">{medications || "None Registered"}</p>
                      </div>
                   </div>

                   {/* Professional Footer */}
                   <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Protocol-UID</span>
                         <span className="text-[8px] font-mono text-gray-500 tracking-tighter opacity-60">
                            {user?.uid.substring(0, 8)}...{user?.uid.substring(user.uid.length - 8)}
                         </span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Bio-Link Secure</span>
                            <span className="text-[6px] font-bold text-gray-600 uppercase tracking-tighter">Verified Clinical Profile</span>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                   </div>
                </div>
            </div>

            <div className="space-y-4">
               <button
                  onClick={downloadEmergencyCard}
                  className="w-full h-20 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:scale-[1.01] transition-all shadow-xl group"
               >
                  <Download size={24} className="group-hover:animate-bounce" />
                  Manifest Physical ID Card
               </button>
               <a
                  href={currentUrl}
                  target="_blank"
                  className="w-full h-16 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
               >
                  <ExternalLink size={18} />
                  Open Public Bio-Link
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, icon, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative group/input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm font-bold text-gray-800 dark:text-gray-200 shadow-inner placeholder-gray-500"
        />
      </div>
    </div>
  );
}
