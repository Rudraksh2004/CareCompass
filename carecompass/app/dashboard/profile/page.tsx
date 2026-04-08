"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/userService";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import { 
  User, 
  Calendar, 
  Droplet, 
  Weight, 
  Ruler, 
  Activity, 
  Target, 
  ShieldCheck, 
  Save,
  Zap,
  Sparkles,
  ArrowRight,
  ChevronRight,
  LogOut,
  Power,
  Camera,
  UploadCloud
} from "lucide-react";

// 🧩 INTERNAL COMPONENT: BIO-INPUT
interface InputProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
}

function BioInput({ label, value, setValue, icon, placeholder, type = "text" }: InputProps) {
  return (
    <div className="space-y-4 group/field">
      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 flex items-center gap-3 transition-colors group-focus-within/field:text-accent-primary italic">
        <span className="shrink-0 scale-125">{icon}</span> {label}
      </label>
      <div className="relative group/input">
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="input-void px-6 py-5 italic text-sm"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-primary opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-[2px]" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile States
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [healthGoal, setHealthGoal] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      try {
        const data: any = await getUserProfile(user.uid);

        if (data) {
          setName(data.name || "");
          setAge(data.age ? String(data.age) : "");
          setBloodGroup(data.bloodGroup || "");
          setGender(data.gender || "");
          setHeight(data.height ? String(data.height) : "");
          setWeight(data.weight ? String(data.weight) : "");
          setActivityLevel(data.activityLevel || "");
          setHealthGoal(data.healthGoal || "");
          setPhotoURL(data.photoURL || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;

    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(user.uid, {
        name: name.trim(),
        age: Number(age) || 0,
        bloodGroup,
        gender,
        height: Number(height) || 0,
        weight: Number(weight) || 0,
        activityLevel,
        healthGoal,
      });
      alert("Profile synchronized successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to synchronize profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
       setLoggingOut(true);
       await logout();
       router.push("/auth/login");
    } catch (error) {
       console.error("Logout error:", error);
    } finally {
       setLoggingOut(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    const resizeImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject("Signal Read Error");
        reader.onload = (ev) => {
          const img = new Image();
          img.onerror = () => reject("Imaging Core Failure");
          img.onload = () => {
             try {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 400; // Increased quality slightly for high-fidelity sync
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/webp", 0.8));
             } catch (e) { reject(e); }
          };
          img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      console.log("Initializing Biometric Capture...");
      setUploadingPhoto(true);
      const base64: string = await resizeImage(file);
      console.log("Biometric signature generated successfully.");
      
      if (base64) {
        setPhotoURL(base64);
        
        // ⭐ Secure Bios-Link: Anchoring to Data-Ledger (Firestore)
        await updateUserProfile(user.uid, { photoURL: base64 });
        
        alert("Biological signature anchored to Data-Ledger.");
      }
    } catch (error) {
      console.error("Critical Protocol Error:", error);
      alert("Neural handshake failed. Please check imaging permissions.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
        <div className="text-center space-y-2">
           <p className="text-sm font-black text-indigo-500 uppercase tracking-[0.4em] animate-pulse">Syncing Bio-Ledger</p>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verifying Clinical Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
      {/* 🔮 LUMINA PROFILE HEADER */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-ghost-border bg-surface-container-low/40 backdrop-blur-[60px] p-8 md:p-14 transition-all duration-700 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-primary/5 blur-[150px] -mr-80 -mt-80 transition-all group-hover:bg-accent-primary/10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-emerald/5 blur-[120px] -ml-40 -mb-40" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary shadow-inner">
                  <User className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
               </div>
               <div className="flex flex-col">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary italic">
                    Bio-Metric <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-emerald bg-clip-text text-transparent">Nexus</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-2 h-2 rounded-full bg-accent-emerald animate-vital-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Clinical Profile Calibrated</span>
                  </div>
               </div>
            </div>
            <p className="text-text-secondary font-bold text-lg md:text-xl max-w-2xl leading-relaxed italic">
               Calibrate your foundational biometric signatures for hyper-accurate AI synthesis and epidemiological alignment.
            </p>
            <div className="chip-vital bg-surface-container-high/40 border-ghost-border py-4 px-6 rounded-2xl">
               <div className="w-2 h-2 rounded-full bg-accent-emerald animate-vital-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Authenticated: {user?.email}</span>
            </div>
          </div>

          <div className="relative group perspective-1000 shrink-0">
             <div className="absolute -inset-12 bg-accent-primary/10 blur-[80px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
             
             <div className="relative z-10">
                <div className="w-48 h-48 rounded-[3.5rem] bg-ghost-border p-[1.5px] shadow-3xl transform-gpu transition-all duration-1000 group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:scale-110 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-accent-primary via-transparent to-accent-emerald opacity-20" />
                   
                   {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover rounded-[2.5rem]" />
                   ) : (
                      <div className="w-full h-full rounded-[3.4rem] bg-surface-base flex items-center justify-center text-7xl font-black text-accent-primary shadow-inner italic">
                         {name ? name.charAt(0).toUpperCase() : "U"}
                      </div>
                   )}

                   <input id="calibration-input" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                   <div 
                      onClick={() => document.getElementById('calibration-input')?.click()}
                      className="absolute inset-0 cursor-pointer group/label transition-all duration-500 hover:backdrop-blur-md z-30"
                   >
                      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover/label:opacity-100 transition-all duration-500 transform translate-y-4 group-hover/label:translate-y-0 bg-gradient-to-t from-gray-950/80 to-transparent p-6 flex flex-col items-center">
                         <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 border border-white/20 shadow-lg">
                            {uploadingPhoto ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={24} />}
                         </div>
                         <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none italic">Calibrate</span>
                      </div>
                   </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-surface-container-high border border-ghost-border flex items-center justify-center shadow-xl z-20">
                    <div className="w-4 h-4 rounded-full bg-accent-emerald animate-vital-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 🧠 Core Identity Module */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-10 order-2 xl:order-1">
          <div className="card-biometric p-8 lg:p-14 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.02] via-transparent to-accent-emerald/[0.02] pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between pb-12 border-b border-ghost-border">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-accent-indigo/10 text-accent-indigo shadow-lg border border-accent-indigo/5">
                   <User size={36} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-text-primary uppercase tracking-tighter italic leading-none">Personal Manifest</h2>
                  <div className="chip-vital mt-3">
                     <ShieldCheck size={14} className="text-accent-emerald" />
                     <span className="text-[9px] font-black uppercase tracking-[0.3em]">Secure Clinical Record</span>
                  </div>
                </div>
              </div>
              <Activity size={56} className="text-accent-primary/5 absolute right-0 top-0 mt-8 mr-8" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pt-12">
              <BioInput label="Full Name" value={name} setValue={setName} icon={<User size={14} />} placeholder="Enter identity..." />
              
              <div className="space-y-4 group/field">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted ml-2 flex items-center gap-3 italic">
                   <Droplet size={14} className="text-accent-rose" /> Serology Type
                </label>
                <div className="relative group/select">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full input-void px-6 py-5 appearance-none cursor-pointer italic text-sm"
                  >
                    <option value="" className="bg-surface-base font-bold opacity-30 italic">SELECT TYPE...</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-surface-base font-bold italic">{bg}</option>
                    ))}
                  </select>
                  <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-accent-primary transition-all group-hover:translate-x-1 rotate-90" />
                </div>
              </div>

              <BioInput label="Age" value={age} setValue={setAge} icon={<Calendar size={14} />} placeholder="YY..." type="number" />
              
              <div className="space-y-4 group/field">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted ml-2 flex items-center gap-3 italic">
                   <Activity size={14} className="text-accent-indigo" /> Physiological Axis
                </label>
                <div className="relative group/select">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full input-void px-6 py-5 appearance-none cursor-pointer italic text-sm"
                  >
                    <option value="" className="bg-surface-base font-bold opacity-30 italic">SELECT AXIS...</option>
                    <option value="Male" className="bg-surface-base font-bold italic">Male</option>
                    <option value="Female" className="bg-surface-base font-bold italic">Female</option>
                    <option value="Other" className="bg-surface-base font-bold italic">Other</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-accent-primary transition-all group-hover:translate-x-1 rotate-90" />
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pt-12 mt-12 border-t border-ghost-border">
               <BioInput label="Height (cm)" value={height} setValue={setHeight} icon={<Ruler size={14} />} placeholder="180..." type="number" />
               <BioInput label="Weight (kg)" value={weight} setValue={setWeight} icon={<Weight size={14} />} placeholder="75..." type="number" />
               
               <div className="space-y-4 group/field">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted ml-2 flex items-center gap-3 italic">
                     <Zap size={14} className="text-accent-amber" /> Metabolism Scale
                  </label>
                  <div className="relative group/select">
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full input-void px-6 py-5 appearance-none cursor-pointer italic text-sm"
                    >
                      <option value="" className="bg-surface-base font-bold opacity-30 italic">SELECT LEVEL...</option>
                      <option value="Sedentary" className="bg-surface-base font-bold italic">Sedentary</option>
                      <option value="Moderate" className="bg-surface-base font-bold italic">Moderate</option>
                      <option value="Active" className="bg-surface-base font-bold italic">Active</option>
                      <option value="Professional" className="bg-surface-base font-bold italic">Professional</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-accent-primary transition-all group-hover:translate-x-1 rotate-90" />
                  </div>
               </div>

               <div className="space-y-4 group/field">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted ml-2 flex items-center gap-3 italic">
                     <Target size={14} className="text-accent-emerald" /> Primary Health Objective
                  </label>
                  <div className="relative group/select">
                    <select
                      value={healthGoal}
                      onChange={(e) => setHealthGoal(e.target.value)}
                      className="w-full input-void px-6 py-5 appearance-none cursor-pointer italic text-sm"
                    >
                      <option value="" className="bg-surface-base font-bold opacity-30 italic">SELECT GOAL...</option>
                      <option value="Maintenance" className="bg-surface-base font-bold italic">Maintenance</option>
                      <option value="Weight Loss" className="bg-surface-base font-bold italic">Weight Loss</option>
                      <option value="Muscle Gain" className="bg-surface-base font-bold italic">Muscle Gain</option>
                      <option value="Recovery" className="bg-surface-base font-bold italic">Recovery</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-accent-primary transition-all group-hover:translate-x-1 rotate-90" />
                  </div>
               </div>
            </div>

            <div className="relative z-10 mt-16 flex justify-end pt-12 border-t border-ghost-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-gem px-20 py-6 text-lg tracking-[0.2em] shadow-2xl shadow-accent-primary/20 disabled:opacity-50"
              >
                 <span className="flex items-center gap-4 italic uppercase">
                   {saving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={24} />}
                   {saving ? "SYNCING CORE..." : "COMMIT BIO-LEDGER"}
                 </span>
              </button>
            </div>
          </div>
        </div>

        {/* 📟 Sidebar Shards */}
        <div className="lg:col-span-12 xl:col-span-4 order-1 xl:order-2 space-y-10">
           
           <div className="card-biometric p-10 flex flex-col items-center text-center group">
              <div className="p-6 rounded-[2.5rem] bg-accent-primary/10 text-accent-primary mb-8 border border-ghost-border shadow-xl group-hover:scale-110 transition-transform duration-700">
                 <Sparkles size={48} className="animate-vital-pulse" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 text-text-primary">AI Synthesis</h3>
              <p className="text-text-secondary text-sm font-bold leading-relaxed mb-8 italic">
                 Calibrating these fields optimizes the CareCompass Neural Engine for hyper-relevant diagnostic synthesis.
              </p>
              <div className="chip-vital bg-accent-primary/5 border-accent-primary/20 w-full py-4 justify-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-accent-primary">✨ Bio-Signature Integrity Verified</span>
              </div>
           </div>

           <div className="card-biometric p-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-accent-emerald/10 text-accent-emerald border border-ghost-border">
                       <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-text-primary">Data Sovereignty</h3>
                 </div>
                 <div className="space-y-3 pt-2">
                    {[
                      { label: "Encryption", val: "AES-256-GCM" },
                      { label: "Protocol", val: "SECURE-LEDGER-V3" },
                      { label: "Visibility", val: "SUBJECT-BOUND" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-ghost-border/50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{item.label}</span>
                        <span className="text-[10px] font-black text-accent-emerald italic">{item.val}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* 🧨 Dangerous Protocol: Session Halt */}
           <div className="relative overflow-hidden border border-accent-rose/20 bg-accent-rose/[0.02] p-10 rounded-[3rem] group transition-all duration-500 hover:shadow-2xl hover:shadow-accent-rose/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent-rose/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-accent-rose/10 text-accent-rose border border-accent-rose/10 shadow-lg">
                       <Power size={24} strokeWidth={3} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter italic text-accent-rose">Session Halt</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Clinical Disconnect</span>
                       </div>
                    </div>
                 </div>

                 <p className="text-xs font-bold text-text-secondary leading-relaxed italic">
                    Terminate the active clinical session and seal all neural links until next biometric authentication.
                 </p>

                 <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full relative overflow-hidden group/btn flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-accent-rose text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-accent-rose/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    {loggingOut ? (
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                       <LogOut size={16} strokeWidth={3} />
                    )}
                    <span className="relative z-10 italic">
                       {loggingOut ? "DISCONNECTING..." : "HALT SESSION PROTOCOL"}
                    </span>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}