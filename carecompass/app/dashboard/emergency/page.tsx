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
  ChevronRight,
  Info,
  ExternalLink
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

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
        setQrLoaded(true);
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
          borderRadius: "3rem",
        }
      });
      const link = document.createElement("a");
      link.download = `CareCompass_Emergency_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const currentUrl = typeof window !== "undefined" ? `${window.location.origin}/emergency/${user?.uid}` : "";

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 px-4 sm:px-6">
      
      {/* 🚒 RED GLASS HEADER */}
      <div className="relative group overflow-hidden rounded-[3.5rem] border border-red-500/20 dark:border-white/[0.05] bg-white/40 dark:bg-[#030712]/40 backdrop-blur-[80px] p-10 sm:p-14 shadow-2xl transition-all duration-700 hover:shadow-red-500/10">
        <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-red-600/10 blur-[130px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 blur-[110px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-8 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-5 rounded-[2.5rem] bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 shadow-xl shadow-red-500/10 border border-red-500/20">
                <ShieldAlert size={48} strokeWidth={2.5} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent italic leading-[1.1]">
                  Emergency ID
                </h1>
                <p className="text-xs font-black uppercase tracking-[0.5em] text-red-600 mt-2">Life-Saving Diagnostic Shard</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold max-w-2xl text-xl leading-relaxed opacity-80">
               Forge your vitals into a cryptographic medical ID. Instant scanning capability for first-responders.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
             <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-red-500 via-rose-500 to-red-600 shadow-2xl">
                <div className="px-10 py-8 rounded-[2.4rem] bg-white/95 dark:bg-[#030712] backdrop-blur-3xl text-center min-w-[240px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3">Service Integrity</p>
                  <div className="flex items-center gap-4 justify-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                    <span className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Verified Link</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 🧩 Clinical Configuration Module */}
        <div className="lg:col-span-12 xl:col-span-6 space-y-10 order-2 xl:order-1 text-gray-900 dark:text-gray-100">
          <div className="bg-white/40 dark:bg-[#030712]/40 backdrop-blur-[80px] border border-white/80 dark:border-white/[0.05] p-10 sm:p-14 rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] transition-all duration-700 hover:border-red-500/30">
            
            <div className="flex items-center gap-4 mb-14 pb-10 border-b border-gray-100 dark:border-white/5">
              <div className="p-4 rounded-3xl bg-red-500/10 text-red-600 border border-red-500/10">
                 <Activity size={28} strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Vitals Engine</h2>
            </div>

            <div className="space-y-10">
              <Input label="Identity: Full Legal Name" value={name} setValue={setName} icon={<User size={18} />} placeholder="ENTER NAME..." />

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 px-1 flex items-center gap-2">
                  <Droplet size={14} className="text-red-500" /> Serology Classification
                </label>
                <div className="relative group/select">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-18 bg-white/50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] px-8 rounded-3xl text-gray-800 dark:text-gray-100 font-black focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 outline-none transition-all appearance-none cursor-pointer text-xl"
                  >
                    <option value="" className="bg-white dark:bg-gray-900 font-bold">SELECT TYPE...</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-white dark:bg-gray-900 font-bold">{bg}</option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-red-500">
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <Input label="Diagnostic: Allergies" value={allergies} setValue={setAllergies} icon={<AlertCircle size={18} />} placeholder="PEANUTS..." />
                 <Input label="Diagnostic: Medical Conditions" value={conditions} setValue={setConditions} icon={<Stethoscope size={18} />} placeholder="ASTHMA..." />
                 <Input label="Pharma: Medications" value={medications} setValue={setMedications} icon={<Pill size={18} />} placeholder="ASPIRIN..." />
                 <Input label="Relay: contact" value={contact} setValue={setContact} icon={<Phone size={18} />} placeholder="LINK..." />
              </div>
            </div>

            <div className="mt-16 flex items-center justify-end gap-8 pt-12 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto relative group flex items-center justify-center gap-4 px-12 py-6 rounded-[2.5rem] bg-red-600 text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-red-600/30 disabled:opacity-40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Save size={20} className={saving ? "animate-spin" : ""} />
                {saving ? "SAVING..." : "SYNC TO BIO-SHARD"}
              </button>
            </div>
          </div>
        </div>

        {/* 💳 THE CARD FACE (MAXIMUM SCANNABILITY) */}
        <div className="lg:col-span-12 xl:col-span-6 order-1 xl:order-2">
          <div className="sticky top-12 space-y-10">
            
            <div className="relative group perspective-1000">
              {/* Card Ambient Glow */}
              <div className="absolute -inset-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-[5rem] blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />

              <div
                ref={cardRef}
                className="relative w-full aspect-[1.58/1] min-h-[520px] bg-white dark:bg-[#030712] rounded-[4rem] overflow-hidden border border-white/60 dark:border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.2)] dark:shadow-none transition-all duration-700 hover:rotate-1"
              >
                {/* ID Header Section */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 p-12 flex items-center justify-between shadow-2xl relative z-10">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Heart size={32} className="text-white fill-white shadow-xl" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black uppercase tracking-[0.4em] text-[11px] leading-tight">CARECOMPASS</span>
                        <span className="text-white font-black text-3xl tracking-tighter uppercase italic leading-none">EMERGENCY ID</span>
                      </div>
                   </div>
                   <div className="px-6 py-4 bg-black/40 rounded-[1.5rem] border border-white/20 backdrop-blur-md flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none">SYNC ACTIVE</span>
                   </div>
                </div>

                <div className="p-14 space-y-12 relative z-10">
                   <div className="flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-between">
                      
                      {/* Left Side: Medical Details */}
                      <div className="space-y-12 flex-1 w-full text-gray-900 dark:text-gray-100">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">SUBJECT IDENTITY</p>
                            <h3 className="text-5xl font-black tracking-tighter uppercase italic truncate origin-left leading-none">{name || "AWAITING DATA..."}</h3>
                         </div>

                         <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-3">
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">SEROLOGY</p>
                               <div className="flex items-center gap-4">
                                  <span className="text-4xl font-black text-red-600 tracking-tighter italic">{bloodGroup || "--"}</span>
                                  {bloodGroup && <Droplet size={24} className="text-red-500 fill-red-500 animate-bounce" />}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">RELAY LINK</p>
                               <div className="flex items-center gap-3">
                                  <Phone size={18} className="text-red-500" />
                                  <span className="text-lg font-black truncate">{contact || "STANDBY..."}</span>
                               </div>
                            </div>
                         </div>

                         {/* DETAILED DIAGNOSTIC ROWS */}
                         <div className="pt-10 border-t border-gray-100 dark:border-white/5 space-y-8">
                            <DetailRow label="ALLERGENICS" icon={<AlertCircle size={16}/>} value={allergies} />
                            <DetailRow label="DIAGNOSIS" icon={<Stethoscope size={16}/>} value={conditions} />
                            <DetailRow label="PHARMA" icon={<Pill size={16}/>} value={medications} />
                         </div>
                      </div>

                      {/* Right Side: MAXIMUM SCAN QR */}
                      <div className="shrink-0 flex flex-col items-center gap-10 mt-6 xl:mt-2">
                         <div className="relative group/qr p-6 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[3.5rem] border-[14px] border-red-500/5 transition-all duration-700 hover:scale-110">
                            {currentUrl ? (
                               <div className="bg-white p-2 rounded-2xl">
                                  <QRCode 
                                    value={currentUrl} 
                                    size={180} 
                                    level="Q" 
                                    viewBox={`0 0 256 256`}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                  />
                               </div>
                            ) : (
                               <div className="w-44 h-44 bg-gray-50 animate-pulse rounded-[2.5rem] flex items-center justify-center text-[11px] font-black uppercase text-gray-400">Syncing Protocol...</div>
                            )}
                            
                            {/* Scanning Brackets */}
                            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-8 border-l-8 border-red-600 rounded-tl-3xl opacity-40 group-hover/qr:opacity-100 transition-opacity" />
                            <div className="absolute -top-4 -right-4 w-12 h-12 border-t-8 border-r-8 border-red-600 rounded-tr-3xl opacity-40 group-hover/qr:opacity-100 transition-opacity" />
                            <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-8 border-l-8 border-red-600 rounded-bl-3xl opacity-40 group-hover/qr:opacity-100 transition-opacity" />
                            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-8 border-r-8 border-red-600 rounded-br-3xl opacity-40 group-hover/qr:opacity-100 transition-opacity" />
                         </div>
                         <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 px-6 py-2 bg-red-600/10 rounded-full border border-red-500/10">
                               <QrCode size={14} className="text-red-500" />
                               <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] italic mb-0.5">Biosignature Persisted</p>
                            </div>
                            <p className="text-[9px] font-mono text-gray-400 tracking-[0.3em] font-black uppercase mt-2">ID: {user?.uid.substring(0, 16).toUpperCase()}</p>
                         </div>
                      </div>
                   </div>

                   {/* ID FOOTER */}
                   <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex gap-4">
                         {[1,2,3,4,5,6].map(i => <div key={i} className="w-10 h-1.5 bg-red-600/10 rounded-full" />)}
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] tracking-widest uppercase italic">
                            <Clock size={12} /> {new Date().toLocaleDateString()}
                         </div>
                         <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <button
                  onClick={downloadEmergencyCard}
                  className="h-28 rounded-[3.5rem] bg-[#030712] dark:bg-white text-white dark:text-[#030712] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-6 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl hover:shadow-red-500/20 group/btn"
               >
                  <Download size={32} className="group-hover/btn:animate-bounce" />
                  <div className="flex flex-col items-start leading-none gap-2">
                     <span className="text-[9px] font-black opacity-40 tracking-widest">MANIFEST PHYSICAL ID</span>
                     <span className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">Download Shard</span>
                  </div>
               </button>

               <a
                  href={currentUrl}
                  target="_blank"
                  className="h-28 rounded-[3.5rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-6 hover:scale-[1.03] active:scale-95 transition-all shadow-xl group/link"
               >
                  <ExternalLink size={32} className="text-red-600 group-hover/link:rotate-12 transition-transform" />
                  <div className="flex flex-col items-start leading-none gap-2">
                     <span className="text-[9px] font-black opacity-40 tracking-widest">VERIFY PROTOCOL</span>
                     <span className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">Open Public Link</span>
                  </div>
               </a>
            </div>

            <div className="p-8 rounded-[3rem] bg-red-500/5 border border-red-500/10 flex items-start gap-4">
               <Info size={20} className="text-red-500 shrink-0 mt-1" />
               <p className="text-[10px] font-black text-gray-500 leading-relaxed uppercase tracking-widest">
                  This card is a life-critical asset. Ensure all vitals are synchronized before manifesting the physical shard. The QR code links to your public emergency profile for rapid first-responder diagnostics.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, icon, placeholder }: any) {
  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100">
      <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 px-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative group/input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full h-18 bg-white/50 dark:bg-white/[0.1] border border-gray-200 dark:border-white/[0.1] px-8 rounded-3xl font-black focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 outline-none transition-all placeholder:text-gray-400/40 text-xl"
        />
        <div className="absolute inset-0 rounded-3xl ring-2 ring-red-500/0 group-focus-within/input:ring-red-500/10 transition-all pointer-events-none" />
      </div>
    </div>
  );
}

function DetailRow({ label, icon, value }: any) {
   return (
      <div className="flex items-start gap-5">
         <div className="p-3 rounded-2xl bg-red-600/5 dark:bg-red-600/10 text-red-600 border border-red-500/10">
            {icon}
         </div>
         <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 opacity-60 leading-none mb-1">
               {label}
            </p>
            <p className="text-xl font-black italic leading-tight uppercase tracking-tighter text-gray-800 dark:text-gray-100">
               {value || "NONE DECLARED"}
            </p>
         </div>
      </div>
   );
}
