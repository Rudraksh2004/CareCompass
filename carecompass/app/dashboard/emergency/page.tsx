"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getEmergencyProfile,
  saveEmergencyProfile,
} from "@/services/emergencyService";
import { getUserProfile } from "@/services/userService";
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
  ExternalLink,
  Info,
  Dna,
  Zap,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  ScanLine
} from "lucide-react";

export default function EmergencyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-red-500 font-black">ENCRYPTING BIO-SHARD CORES...</div>}>
      <EmergencyContent />
    </Suspense>
  );
}

function EmergencyContent() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [contact, setContact] = useState("");
  const [photoURL, setPhotoURL] = useState("");

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
      
      // 🧬 Bio-Ledger Retrieval
      const profile: any = await getUserProfile(user.uid);
      if (profile?.photoURL) {
        setPhotoURL(profile.photoURL);
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
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* 🔮 Clinical Emergency Header */}
      <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/80 dark:border-white/[0.05] bg-white/[0.4] dark:bg-[#030712]/30 backdrop-blur-[60px] p-6 md:p-12 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-red-600/20 to-purple-500/10 blur-[130px] -mr-64 -mt-64 transition-all group-hover:scale-110" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-xl shadow-red-500/20">
                <ShieldAlert className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-gray-900 via-gray-700 to-gray-400 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                Bio-Shard Protocol
              </h1>
            </div>
            <p className="text-gray-950 dark:text-gray-400 font-bold max-w-xl text-base md:text-lg leading-relaxed">
              Diagnostic identity synchronization. Your critical vitals are synthesized into a secure Bio-Shard ID for immediate clinical retrieval.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-6 py-4 md:px-8 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-red-500/10 border border-red-500/20 backdrop-blur-md flex flex-row md:flex-col items-center gap-3 md:gap-0">
                <Dna className="text-red-500 md:mb-2" size={20} />
                <div className="flex flex-col md:items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-none">Genetic Ledger</span>
                  <span className="text-lg md:text-xl font-black mt-1 text-gray-950 dark:text-white leading-none">SECURE</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* 📋 Vitals Intake (Input Side) */}
        <div className="xl:col-span-12 xl:max-w-none 2xl:col-span-7 space-y-8 order-2 xl:order-2">
          <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/60 dark:border-white/[0.05] bg-white/[0.3] dark:bg-[#030712]/30 backdrop-blur-[60px] p-6 md:p-8 shadow-xl transition-all">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <Activity className="text-red-500" size={24} />
                <h2 className="text-2xl font-black tracking-tighter text-gray-950 dark:text-white">Diagnostic Intake</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Identity Matrix" value={name} setValue={setName} icon={<User size={16} className="text-blue-500" />} placeholder="Clinical Holder Identity..." />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Serology Type</label>
                  <div className="relative group/input">
                    <Droplet className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 pl-12 pr-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-red-500/10 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select Protocol...</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input label="Immunology (Allergies)" value={allergies} setValue={setAllergies} icon={<AlertCircle size={16} className="text-amber-500" />} placeholder="Detecting sensitivities..." />
                <Input label="Pathology History" value={conditions} setValue={setConditions} icon={<Stethoscope size={16} className="text-indigo-500" />} placeholder="Clinical conditions..." />
                <Input label="Metabolic Regimen" value={medications} setValue={setMedications} icon={<Pill size={16} className="text-purple-500" />} placeholder="Active medications..." />
                <Input label="Relay Protocol (Contact)" value={contact} setValue={setContact} icon={<Phone size={16} className="text-emerald-500" />} placeholder="Emergency uplink..." />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gray-900 dark:bg-red-600 text-white py-5 rounded-[2rem] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-red-600/20 flex items-center justify-center gap-3"
              >
                {saving ? "SYNCING LEDGER..." : "COMMIT TO BIO-SHARD"} <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-[3rem] bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-500/20 backdrop-blur-md flex items-start gap-4">
             <Info className="text-amber-500 shrink-0 mt-1" size={20} />
             <p className="text-xs font-bold text-gray-900 dark:text-gray-400 leading-relaxed italic">
               "Your Bio-Shard is accessed by first responders via the Diagnostic QR protocol during critical status events."
             </p>
          </div>
        </div>

        {/* 💳 Live Bio-Shard Preview (Right Side) */}
        <div className="xl:col-span-12 2xl:col-span-5 order-1 xl:order-1 space-y-10">
          <div className="sticky top-10 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-lg md:text-xl font-black italic tracking-widest text-gray-900 dark:text-gray-500 uppercase">Shard Manifest</h3>
               <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 text-[10px] font-black text-emerald-500">
                  <ShieldCheck size={12} /> <span className="hidden sm:inline">SECURE PREVIEW</span><span className="sm:hidden">ENCRYPTED</span>
               </div>
            </div>

            <div
              ref={cardRef}
              className="relative w-full aspect-[1.58/1] md:min-h-[300px] bg-gradient-to-br from-[#0a0a0c] via-[#111114] to-[#0a0a0c] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-700 group/card"
            >
               {/* 🧬 Holographic Matrix Overlay */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.1),_transparent_50%)] opacity-50 group-hover/card:opacity-100 transition-opacity duration-1000" />
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
               
               {/* Card Frame Header */}
               <div className="h-12 md:h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2 md:gap-3">
                     <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/40">
                        <Heart className="w-3 h-3 md:w-4 md:h-4 text-white fill-white" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-white font-black text-[8px] md:text-[10px] tracking-widest uppercase italic leading-none">Bio-Shard ID</span>
                        <span className="text-[6px] md:text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 md:mt-1">Diagnostic Registry</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-1">
                     {[1,2,3].map(i => <div key={i} className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-red-500/30" />)}
                  </div>
               </div>

                <div className="p-4 md:p-8 pb-4 md:pb-6 flex flex-col justify-between h-[calc(100%-3rem)] md:h-[calc(100%-4rem)]">
                   <div className="flex justify-between items-start gap-4 md:gap-6">
                      <div className="flex items-start gap-3 md:gap-5 flex-1 min-w-0">
                         {photoURL ? (
                            <img src={photoURL} className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover border border-white/10 shadow-xl shrink-0 transition-transform group-hover/card:scale-110 duration-700" alt="Avatar" />
                         ) : (
                            <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm md:text-xl font-black text-gray-500 shrink-0 uppercase transition-all group-hover/card:scale-110">
                               {name?.charAt(0) || "U"}
                            </div>
                         )}

                         <div className="space-y-1.5 md:space-y-4 flex-1 min-w-0">
                            <div className="space-y-0.5">
                               <p className="text-[6px] md:text-[7px] font-black text-gray-600 uppercase tracking-widest">Holders Name</p>
                               <h3 className="text-sm md:text-2xl font-black text-white tracking-tighter uppercase italic truncate leading-none">
                                  {name || "AWAITING..."}
                               </h3>
                            </div>
                            
                            <div className="flex items-center gap-4 md:gap-8">
                               <div className="space-y-0.5">
                                  <p className="text-[6px] md:text-[7px] font-black text-gray-600 uppercase tracking-widest">Serotype</p>
                                  <div className="flex items-center gap-1 md:gap-1.5">
                                     <span className="text-xs md:text-xl font-black text-red-500 leading-none">{bloodGroup || "--"}</span>
                                     <Droplet className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-500/40 fill-red-500" />
                                  </div>
                               </div>
                               <div className="space-y-0.5 flex-1 min-w-0">
                                  <p className="text-[6px] md:text-[7px] font-black text-gray-600 uppercase tracking-widest">Relay Link</p>
                                  <span className="text-[8px] md:text-[10px] font-black text-gray-300 truncate block tracking-tighter leading-none">{contact || "IDLE STATUS"}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      {showQR && (
                        <div className="shrink-0 p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-500">
                           <QRCode 
                             value={currentUrl} 
                             size={typeof window !== 'undefined' && window.innerWidth < 768 ? 45 : 60} 
                             level="M" 
                             viewBox={`0 0 256 256`}
                             style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                           />
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-3 gap-2 md:gap-4 py-3 md:py-4 border-y border-white/[0.03]">
                      <div className="space-y-0.5">
                        <p className="text-[6px] md:text-[7px] font-black text-gray-600 uppercase tracking-widest">Allergies</p>
                        <p className="text-[7px] md:text-[9px] font-bold text-gray-300 line-clamp-1 truncate">{allergies || "None"}</p>
                      </div>
                      <div className="space-y-0.5 border-x border-white/[0.03] px-2 md:px-4">
                        <p className="text-[6px] md:text-[7px] font-black text-gray-600 uppercase tracking-widest">Vitals</p>
                        <p className="text-[7px] md:text-[9px] font-bold text-gray-300 line-clamp-1 truncate">{conditions || "None"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[6px] md:text-[7px] font-black text-gray-600 uppercase tracking-widest">Regimen</p>
                        <p className="text-[7px] md:text-[9px] font-bold text-gray-300 line-clamp-1 truncate">{medications || "None"}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between opacity-50 group-hover/card:opacity-100 transition-opacity pt-2">
                      <div className="flex flex-col">
                         <span className="text-[6px] font-black text-gray-600 uppercase tracking-widest">Protocol Sync</span>
                         <span className="text-[8px] font-mono text-gray-500 tracking-widest uppercase">{user?.uid.substring(0, 10)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Zap size={10} className="text-red-500 fill-red-500" />
                         <span className="text-[7px] font-black text-white uppercase tracking-widest">CareCompass Cloud</span>
                      </div>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button
                  onClick={downloadEmergencyCard}
                  className="h-16 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl"
               >
                  <Download size={20} /> <span className="sm:hidden">Download ID Card</span><span className="hidden sm:inline">Manifest Shard</span>
               </button>
               <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white/40 dark:bg-black/40 border border-white/60 dark:border-white/10 flex items-center justify-between px-6 md:px-8">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">QR Protocol</span>
                     <span className="text-xs font-black uppercase text-gray-950 dark:text-white">{showQR ? "ACTIVE" : "IDLE"}</span>
                  </div>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full transition-all duration-300 ${showQR ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-800'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-500 ${showQR ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>
            </div>

            <a
              href={currentUrl}
              target="_blank"
              className="w-full h-14 md:h-16 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-200 dark:border-white/5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white dark:hover:bg-white/5 transition-all text-center px-4"
            >
               <ExternalLink size={16} /> <span className="hidden sm:inline">OPEN PUBLIC CLOUD UPLINK</span><span className="sm:hidden">PUBLIC CLOUD UPLINK</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, setValue, icon, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 ml-2">
        {label}
      </label>
      <div className="relative group/input">
        <div className="absolute left-5 top-1/2 -translate-y-1/2">
           {icon}
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/40 dark:bg-black/40 border border-white/80 dark:border-white/10 pl-12 pr-6 py-4 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-red-500/10 transition-all text-sm placeholder-gray-500 text-gray-950 dark:text-white"
        />
      </div>
    </div>
  );
}
