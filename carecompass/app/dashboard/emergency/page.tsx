"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getEmergencyProfile,
  saveEmergencyProfile,
} from "@/services/emergencyService";
import QRCode from "react-qr-code";
import { useRef } from "react";
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
  Clock
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
  const [showQR, setShowQR] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
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
        style: {
          borderRadius: "2.5rem",
        }
      });
      const link = document.createElement("a");
      link.download = `CareCompass_ID_${name.replace(/\s+/g, '_') || 'Emergency'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 px-4 sm:px-6">
      
      {/* 🚑 High-Fidelity Diagnostic Header */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-red-500/20 dark:border-red-500/10 bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-8 sm:p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-500/10 blur-[120px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 blur-[100px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-4 rounded-3xl bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <ShieldAlert size={42} strokeWidth={2.5} className="animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                Emergency ID
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-2xl text-lg sm:text-xl leading-relaxed">
              Synthesize your vital clinical profile. Accessible via cryptographic protocols for rapid first-responder diagnostics.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="px-8 py-6 rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-red-500/20 dark:border-white/[0.05] backdrop-blur-md shadow-xl text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Diagnostic Status</p>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                <span className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter">Emergency Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* 🧩 Diagnostic Configuration Module */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-10 order-2 xl:order-1">
          <div className="bg-white/[0.4] dark:bg-[#030712]/40 backdrop-blur-[80px] border border-white/80 dark:border-white/[0.05] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group/form">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] group-hover/form:bg-indigo-500/10 transition-all" />
            
            <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-100 dark:border-white/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                 <Activity size={24} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Vital Metrics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Input label="Full Identity Name" value={name} setValue={setName} icon={<User size={18} />} placeholder="Enter legal name..." />

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
                  <Droplet size={14} className="text-red-500" /> Blood Classification
                </label>
                <div className="relative group/select">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-16 bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] px-6 rounded-[1.5rem] text-gray-800 dark:text-gray-100 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">Select Serology</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-white dark:bg-gray-900">{bg}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/select:text-red-500 transition-colors">
                    <Activity size={18} />
                  </div>
                </div>
              </div>

              <Input label="Allergenic Triggers" value={allergies} setValue={setAllergies} icon={<AlertCircle size={18} />} placeholder="Peanuts, Penicillin..." />
              <Input label="Clinical Conditions" value={conditions} setValue={setConditions} icon={<Stethoscope size={18} />} placeholder="Asthma, Diabetes..." />
              <Input label="Active Medications" value={medications} setValue={setMedications} icon={<Pill size={18} />} placeholder="Current prescriptions..." />
              <Input label="Primary Emergency Access" value={contact} setValue={setContact} icon={<Phone size={18} />} placeholder="Contact name & number..." />
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-end gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => setShowQR(true)}
                disabled={!name || !bloodGroup}
                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-tighter text-sm transition-all hover:bg-indigo-500 hover:text-white disabled:opacity-40 disabled:grayscale overflow-hidden shadow-lg shadow-indigo-500/10"
              >
                <QrCode size={18} className="group-hover:rotate-12 transition-transform" />
                Diagnostic Scan
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto relative flex items-center justify-center gap-3 px-12 py-5 rounded-[2rem] bg-red-600 text-white font-black uppercase tracking-tighter text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-red-500/30 disabled:opacity-40 disabled:grayscale"
              >
                <Save size={18} className={saving ? "animate-spin" : ""} />
                {saving ? "Encrypting..." : "Sync Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* 🛸 Holographic Emergency Card Display */}
        <div className="lg:col-span-12 xl:col-span-5 order-1 xl:order-2 flex flex-col items-center">
          <div className="sticky top-12 w-full max-w-lg space-y-12">
            
            <div className="w-full relative group perspective-1000">
              {/* Card Ambient Glow */}
              <div className="absolute -inset-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-[3rem] blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />

              <div
                ref={cardRef}
                className="relative w-full aspect-[1.58/1] bg-[#020617] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-all duration-700 group-hover:scale-[1.03] group-hover:rotate-1"
              >
                {/* 🌈 Holographic Foil Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-red-500/10 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
                
                {/* ID Header */}
                <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-8 flex items-center justify-between shadow-lg">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                        <Heart size={24} className="text-white fill-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black uppercase tracking-[0.3em] text-[11px] opacity-80">CareCompass</span>
                        <span className="text-white font-black text-2xl tracking-tighter -mt-1 uppercase">Medical ID</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-black/20 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span className="text-[11px] font-black text-white uppercase tracking-tighter">Authorized</span>
                   </div>
                </div>

                <div className="pt-36 px-10 pb-10 flex flex-col h-full justify-between">
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Subject Identity</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{name || "Awaiting Data..."}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Serology</p>
                          <div className="flex items-center gap-3">
                             <span className="text-3xl font-black text-white">{bloodGroup || "--"}</span>
                             {bloodGroup && (
                               <div className="p-2 rounded-lg bg-red-600/20 text-red-500">
                                  <Droplet size={20} className="fill-red-500" />
                               </div>
                             )}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Emergency Link</p>
                          <span className="text-base font-black text-white truncate block">{contact || "Standby..."}</span>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Medical Shard UUID</span>
                        <span className="text-[10px] font-mono text-gray-500 tracking-wider">CC-ID-{user?.uid.substring(0, 12).toUpperCase()}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {[1,2,3,4].map(i => <div key={i} className="w-6 h-1.5 bg-red-600/20 rounded-full" />)}
                     </div>
                  </div>
                </div>

                {/* 🔍 QR Sub-Layer */}
                {showQR && (
                  <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl z-30 flex flex-col items-center justify-center p-12 animate-in fade-in zoom-in duration-500">
                    <button onClick={() => setShowQR(false)} className="absolute top-10 right-10 text-white/30 hover:text-white transition-colors duration-300">
                       <AlertCircle size={32} />
                    </button>
                    <div className="relative group/qr">
                       <div className="absolute -inset-10 bg-red-600/20 blur-[60px] rounded-full opacity-60 animate-pulse" />
                       <div className="bg-white p-8 rounded-[3rem] shadow-[0_0_60px_rgba(255,255,255,0.1)] relative z-10 transition-transform hover:scale-[1.02] duration-500">
                         <QRCode value={origin ? `${origin}/emergency/${user?.uid}` : ""} size={200} />
                       </div>
                    </div>
                    <p className="text-white font-black text-[10px] uppercase tracking-[0.4em] mt-12 text-center bg-red-600/10 px-8 py-3 rounded-full border border-red-500/20 shadow-lg">
                       Cryptographic Access Relay
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={downloadEmergencyCard}
              className="w-full relative group overflow-hidden flex items-center justify-center gap-4 py-8 rounded-[3rem] bg-gray-950 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_30px_70px_rgba(0,0,0,0.3)] dark:shadow-indigo-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Download size={24} className="animate-bounce" />
              Manifest Physical ID
            </button>
            <div className="flex items-center justify-center gap-4 py-4 px-10 rounded-[2rem] bg-white/5 border border-white/5">
                <Clock size={14} className="text-gray-500" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Diagnostics Valid: {new Date().toLocaleDateString()} CLN-STD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, icon, placeholder }: any) {
  return (
    <div className="space-y-4">
      <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative group/input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full h-16 bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.1] px-6 rounded-[1.5rem] text-gray-800 dark:text-gray-100 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 outline-none transition-all placeholder:text-gray-400/40"
        />
        <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-transparent group-focus-within/input:ring-red-500/20 transition-all pointer-events-none" />
      </div>
    </div>
  );
}
