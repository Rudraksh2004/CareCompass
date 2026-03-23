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
  Clock,
  Sparkles,
  ChevronRight
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
        pixelRatio: 3,
        style: {
          borderRadius: "3rem",
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

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 px-4 sm:px-6">
      
      {/* 🚀 Premium Glass Header (Matching Chat Page) */}
      <div className="relative group overflow-hidden rounded-[3.5rem] border border-white/60 dark:border-white/[0.05] bg-white/40 dark:bg-white/[0.03] backdrop-blur-[80px] p-10 sm:p-14 shadow-2xl transition-all duration-700 hover:shadow-indigo-500/10">
        <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-indigo-500/10 blur-[130px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[110px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-8 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-5 rounded-[2rem] bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 border border-indigo-500/20">
                <ShieldAlert size={48} strokeWidth={2.5} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
                  Emergency ID
                </h1>
                <p className="text-xs font-black uppercase tracking-[0.5em] text-indigo-500 mt-2">Biometric Clinical Shield</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-2xl text-xl leading-relaxed opacity-80">
              Integrate your critical clinical identity. A high-fidelity cryptographic ledger accessible to first-responders instantly.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
             <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 shadow-2xl">
                <div className="px-10 py-8 rounded-[2.4rem] bg-white/95 dark:bg-[#030712] backdrop-blur-3xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3">Diagnostic Status</p>
                  <div className="flex items-center gap-4 justify-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                    <span className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Verified Protocol</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 🧩 Clinical Configuration Module */}
        <div className="lg:col-span-12 xl:col-span-6 space-y-10 order-2 xl:order-1">
          <div className="bg-white/40 dark:bg-white/[0.03] backdrop-blur-[80px] border border-white/80 dark:border-white/[0.05] p-10 sm:p-14 rounded-[4rem] shadow-2xl transition-all duration-700 hover:border-indigo-500/30">
            
            <div className="flex items-center gap-4 mb-14 pb-10 border-b border-gray-100 dark:border-white/5">
              <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
                 <Activity size={28} />
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Vitals Configuration</h2>
            </div>

            <div className="space-y-10">
              <Input label="Identity: Full Legal Name" value={name} setValue={setName} icon={<User size={18} />} placeholder="Enter identifying name..." />

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 px-1 flex items-center gap-2">
                  <Droplet size={14} className="text-indigo-500" /> Serology Classification
                </label>
                <div className="relative group/select">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-18 bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] px-8 rounded-3xl text-gray-800 dark:text-gray-100 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer text-lg"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">SELECT TYPE...</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-white dark:bg-gray-900">{bg}</option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500 transition-colors">
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <Input label="Diagnostic: Allergies" value={allergies} setValue={setAllergies} icon={<AlertCircle size={18} />} placeholder="Data..." />
                 <Input label="Diagnostic: Medical Conditions" value={conditions} setValue={setConditions} icon={<Stethoscope size={18} />} placeholder="Status..." />
                 <Input label="Pharma: Medications" value={medications} setValue={setMedications} icon={<Pill size={18} />} placeholder="Regimen..." />
                 <Input label="Relay: Emergency Contact" value={contact} setValue={setContact} icon={<Phone size={18} />} placeholder="Link..." />
              </div>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-end gap-8 pt-12 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto relative group flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-indigo-600/30 disabled:opacity-40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Save size={20} className={saving ? "animate-spin" : ""} />
                {saving ? "Encrypting..." : "Commit Protocol"}
              </button>
            </div>
          </div>
        </div>

        {/* 💳 The High-Fidelity Detailed Card */}
        <div className="lg:col-span-12 xl:col-span-6 order-1 xl:order-2">
          <div className="sticky top-12 space-y-12">
            
            <div className="relative group">
              {/* Card Ambient Glow */}
              <div className="absolute -inset-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[5rem] blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />

              <div
                ref={cardRef}
                className="relative w-full min-h-[460px] bg-white/95 dark:bg-[#030712] rounded-[4rem] overflow-hidden border border-white dark:border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.15)] dark:shadow-none transition-all duration-700 hover:scale-[1.01]"
              >
                {/* 🌊 Geometric Glass Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

                {/* ID Header Section */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-indigo-600 p-10 flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Heart size={28} className="text-white fill-white shadow-lg" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black uppercase tracking-[0.4em] text-[10px] leading-tight">CareCompass</span>
                        <span className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">Emergency Identity</span>
                      </div>
                   </div>
                   <div className="px-5 py-3 bg-black/20 rounded-[1.25rem] border border-white/10 backdrop-blur-md flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Secured Shard</span>
                   </div>
                </div>

                <div className="p-12 space-y-10">
                   <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                      
                      {/* Left: Identity & QR Group */}
                      <div className="space-y-10 flex-1 w-full">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500">Legal Identity Unit</p>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic truncate">{name || "Awaiting Setup..."}</h3>
                         </div>

                         <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Clinical Type</p>
                               <div className="flex items-center gap-3">
                                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter italic">{bloodGroup || "--"}</span>
                                  {bloodGroup && <Droplet size={20} className="text-indigo-500 animate-bounce" />}
                               </div>
                            </div>
                            <div className="space-y-2">
                               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Emergency Protocol Link</p>
                               <div className="flex items-center gap-2">
                                  <Phone size={14} className="text-indigo-500" />
                                  <span className="text-base font-black text-gray-800 dark:text-gray-100 truncate">{contact || "Standby..."}</span>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                            <div className="grid grid-cols-1 gap-6">
                               <DetailRow label="Known Allergenics" icon={<AlertCircle size={14}/>} value={allergies} />
                               <DetailRow label="Clinical Diagnosis" icon={<Stethoscope size={14}/>} value={conditions} />
                               <DetailRow label="Current Pharmacopoeia" icon={<Pill size={14}/>} value={medications} />
                            </div>
                         </div>
                      </div>

                      {/* Right: Embedded QR Block */}
                      <div className="shrink-0 flex flex-col items-center gap-6">
                         <div className="p-5 bg-white shadow-2xl rounded-[3rem] border-8 border-indigo-500/10">
                            <QRCode value={origin ? `${origin}/emergency/${user?.uid}` : "Pending"} size={140} />
                         </div>
                         <div className="flex flex-col items-center">
                            <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em]">Cryptographic QR</p>
                            <p className="text-[7px] font-mono text-gray-400 tracking-tighter mt-1">{user?.uid.substring(0, 16).toUpperCase()}</p>
                         </div>
                      </div>
                   </div>

                   {/* Footer Bar */}
                   <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                         {[1,2,3,4].map(i => <div key={i} className="w-6 h-1 bg-indigo-500/10 rounded-full" />)}
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">CareCompass Diagnostic ID v2.0</p>
                   </div>
                </div>
              </div>
            </div>

            <button
               onClick={downloadEmergencyCard}
               className="w-full h-24 rounded-[3rem] bg-[#030712] dark:bg-white text-white dark:text-[#030712] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-5 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl hover:shadow-indigo-500/20 group/btn"
            >
               <Download size={28} className="group-hover/btn:animate-bounce" />
               <div className="flex flex-col items-start leading-none gap-1">
                  <span className="text-[9px] font-black opacity-40">MANIFEST CLINICAL ID</span>
                  <span className="text-xl font-black italic tracking-tighter">DOWNLOAD ID CARD</span>
               </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, icon, placeholder }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 px-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative group/input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full h-18 bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] px-8 rounded-3xl text-gray-800 dark:text-gray-100 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all placeholder:text-gray-400/30 text-lg"
        />
        <div className="absolute inset-0 rounded-3xl ring-2 ring-indigo-500/0 group-focus-within/input:ring-indigo-500/10 transition-all pointer-events-none" />
      </div>
    </div>
  );
}

function DetailRow({ label, icon, value }: any) {
   return (
      <div className="space-y-1.5 min-w-[180px]">
         <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2 opacity-60">
            {icon} {label}
         </p>
         <p className="text-sm font-black text-gray-700 dark:text-gray-300 capitalize italic leading-tight">
            {value || "None Declared"}
         </p>
      </div>
   );
}
