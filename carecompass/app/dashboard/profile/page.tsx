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
    <div className="space-y-3 group/field">
      <label className="text-sm font-black text-gray-950 dark:text-gray-300 flex items-center gap-2 transition-colors group-focus-within/field:text-indigo-500">
        <span className="shrink-0">{icon}</span> {label}
      </label>
      <div className="relative group/input">
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition text-base font-bold text-gray-950 dark:text-gray-100 shadow-inner placeholder-gray-400/50"
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 pointer-events-none" />
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

    // 🔬 Clinical-Grade Image Compression (Canvas)
    const resizeImage = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 300; // Small size for fast database sync
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/webp", 0.7)); // WebP at 70% quality
          };
          img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      setUploadingPhoto(true);
      const base64: string = await resizeImage(file);
      
      if (base64) {
        setPhotoURL(base64);
        
        // ⭐ Firestore Protocol: Securely anchor in Bio-Ledger
        await updateUserProfile(user.uid, { photoURL: base64 });
        
        // ⭐ Auth Signal: Sync with Neural Hub
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: base64 });
        }
        
        alert("Clinical signature synchronized via Data-Ledger!");
      }
    } catch (error) {
      console.error("Photo synchronization error:", error);
      alert("Failed to synchronize biometric signature.");
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
    <div className="max-w-6xl mx-auto space-y-12 text-gray-900 dark:text-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12 px-4">
      
      {/* 🌟 Premium Clinical Header */}
      <div className="relative overflow-hidden rounded-[3.5rem] border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] p-10 lg:p-14 shadow-2xl transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-blue-600/5 to-emerald-600/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_40%)]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-6 flex-1">
            <h1 className="text-4xl lg:text-7xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 dark:from-indigo-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent italic leading-[0.9] tracking-tighter">
              Bio-Metric <br /> <span className="not-italic text-gray-900 dark:text-white opacity-90">Protocol Hub</span>
            </h1>
            <p className="text-gray-950 dark:text-gray-400 font-bold text-lg max-w-2xl leading-relaxed">
               Calibrate your foundational biometric signatures for hyper-accurate AI synthesis.
            </p>
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 backdrop-blur-md w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 opacity-70">Authenticated: {user?.email}</span>
            </div>
          </div>
          <div className="shrink-0 relative group perspective-1000">
             <div className="absolute -inset-10 bg-indigo-500/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
             
             <div className="relative z-10">
                <div className="w-40 h-40 rounded-[3.5rem] bg-gradient-to-br from-indigo-600 to-emerald-500 p-[1.5px] shadow-2xl transform-gpu transition-all duration-700 group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:scale-110 overflow-hidden relative">
                   {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover rounded-[3.4rem]" />
                   ) : (
                      <div className="w-full h-full rounded-[3.4rem] bg-white dark:bg-[#030712] flex items-center justify-center text-6xl font-black text-indigo-600 dark:text-indigo-400 shadow-inner">
                         {name ? name.charAt(0).toUpperCase() : "U"}
                      </div>
                   )}

                   {/* 📸 Upload Overlay */}
                   <label className="absolute inset-0 cursor-pointer group/label transition-all duration-500 hover:backdrop-blur-sm">
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover/label:opacity-100 transition-all duration-500 transform translate-y-4 group-hover/label:translate-y-0 bg-gradient-to-t from-gray-950/80 to-transparent p-4 flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 border border-white/20">
                            {uploadingPhoto ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={20} />}
                         </div>
                         <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Calibration</span>
                      </div>
                   </label>
                </div>

                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white dark:bg-[#030712] border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-xl z-20">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 🧠 Core Identity Module */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-10 order-2 xl:order-1">
          <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.65] dark:bg-[#030712]/40 backdrop-blur-[40px] p-8 lg:p-12 rounded-[4rem] shadow-2xl space-y-12">
            
            <div className="flex items-center justify-between pb-10 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-lg border border-indigo-500/5">
                   <User size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-950 dark:text-white uppercase tracking-tighter italic leading-none">Personal Manifest</h2>
                  <p className="text-xs font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest mt-2 opacity-80">Secure Clinical Record</p>
                </div>
              </div>
              <ShieldCheck size={48} className="text-emerald-500/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              <BioInput label="Full Name" value={name} setValue={setName} icon={<User size={16} />} placeholder="Enter identity..." />
              
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-950 dark:text-gray-300 flex items-center gap-2">
                   <Droplet size={14} className="text-red-500" /> Serology Type
                </label>
                <div className="relative group/select">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition text-base font-bold text-gray-900 dark:text-gray-100 appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="bg-white dark:bg-gray-900 font-bold opacity-30">SELECT TYPE...</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-white dark:bg-gray-900 font-bold">{bg}</option>
                    ))}
                  </select>
                  <ArrowRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>

              <BioInput label="Age" value={age} setValue={setAge} icon={<Calendar size={16} />} placeholder="YY..." type="number" />
              
              <div className="space-y-4">
                <label className="text-sm font-black text-gray-950 dark:text-gray-300 flex items-center gap-2">
                   <Activity size={14} className="text-blue-500" /> Physiological Axis
                </label>
                <div className="relative group/select">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition text-base font-bold text-gray-900 dark:text-gray-100 appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" className="bg-white dark:bg-gray-900 font-bold opacity-30">SELECT AXIS...</option>
                    <option value="Male" className="bg-white dark:bg-gray-900 font-bold">Male</option>
                    <option value="Female" className="bg-white dark:bg-gray-900 font-bold">Female</option>
                    <option value="Other" className="bg-white dark:bg-gray-900 font-bold">Other</option>
                  </select>
                  <ArrowRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pt-12 border-t border-gray-100 dark:border-white/5">
               <BioInput label="Height (cm)" value={height} setValue={setHeight} icon={<Ruler size={16} />} placeholder="180..." type="number" />
               <BioInput label="Weight (kg)" value={weight} setValue={setWeight} icon={<Weight size={16} />} placeholder="75..." type="number" />
               
               <div className="space-y-4">
                  <label className="text-sm font-black text-gray-950 dark:text-gray-300 flex items-center gap-2">
                     <Zap size={14} className="text-amber-500" /> Metabolism Scale
                  </label>
                  <div className="relative group/select">
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition text-base font-bold text-gray-900 dark:text-gray-100 appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="" className="bg-white dark:bg-gray-900 font-bold opacity-30">SELECT LEVEL...</option>
                      <option value="Sedentary" className="bg-white dark:bg-gray-900 font-bold">Sedentary</option>
                      <option value="Moderate" className="bg-white dark:bg-gray-900 font-bold">Moderate</option>
                      <option value="Active" className="bg-white dark:bg-gray-900 font-bold">Active</option>
                      <option value="Professional" className="bg-white dark:bg-gray-900 font-bold">Professional</option>
                    </select>
                    <ArrowRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-sm font-black text-gray-950 dark:text-gray-300 flex items-center gap-2">
                     <Target size={14} className="text-emerald-500" /> Primary Health Objective
                  </label>
                  <div className="relative group/select">
                    <select
                      value={healthGoal}
                      onChange={(e) => setHealthGoal(e.target.value)}
                      className="w-full border border-white/60 dark:border-white/[0.1] bg-white/40 dark:bg-black/20 backdrop-blur-md px-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition text-base font-bold text-gray-900 dark:text-gray-100 appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="" className="bg-white dark:bg-gray-900 font-bold opacity-30">SELECT GOAL...</option>
                      <option value="Maintenance" className="bg-white dark:bg-gray-900 font-bold">Maintenance</option>
                      <option value="Weight Loss" className="bg-white dark:bg-gray-900 font-bold">Weight Loss</option>
                      <option value="Muscle Gain" className="bg-white dark:bg-gray-900 font-bold">Muscle Gain</option>
                      <option value="Recovery" className="bg-white dark:bg-gray-900 font-bold">Recovery</option>
                    </select>
                    <ArrowRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                  </div>
               </div>
            </div>

            <div className="mt-16 flex justify-end pt-12 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto overflow-hidden group/save bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:scale-[1.05] hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] transition-all text-white px-16 py-6 rounded-3xl font-black shadow-2xl disabled:opacity-50 text-base relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover/save:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-4">
                   {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={22} />}
                   {saving ? "SYNCING..." : "COMMIT BIO-LEDGER"}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 📟 Sidebar Shards */}
        <div className="lg:col-span-12 xl:col-span-4 order-1 xl:order-2 space-y-10">
           
           <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] p-10 rounded-[4rem] shadow-2xl transition-all duration-700 group flex flex-col items-center text-center">
              <div className="p-6 rounded-[2.5rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-8 border border-indigo-500/10 shadow-xl group-hover:scale-110 transition-transform duration-700">
                 <Sparkles size={48} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 leading-none">AI Synthesis</h3>
              <p className="text-gray-950 dark:text-gray-400 text-sm font-bold leading-relaxed mb-8">
                 Calibrating these fields optimizes the CareCompass Neural Engine for hyper-relevant diagnostic synthesis.
              </p>
              <div className="w-full p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed italic">
                 ✨ Maintenance of bio-signatures ensures protocol integrity.
              </div>
           </div>

           <div className="relative border border-white/80 border-t-white border-l-white/90 dark:border-white/[0.05] dark:border-t-white/[0.15] dark:border-l-white/[0.1] bg-white/[0.5] dark:bg-[#030712]/30 backdrop-blur-[40px] p-10 rounded-[4rem] shadow-2xl transition-all duration-700">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <ShieldCheck size={28} className="text-emerald-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Data Privacy</h3>
                 </div>
                 <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest leading-loose text-justify opacity-70">
                    ENCRYPTION: AES-256 <br />
                    PROTOCOL: SECURE BIO-LEDGER <br />
                    ACCESS: SUBJECT ONLY
                 </p>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 text-center">
              <p className="text-[10px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                 AI HEALTH HUB | CLINICAL ASSIST
              </p>
           </div>

           {/* 🧨 Dangerous Protocol: Account Termination */}
           <div className="relative overflow-hidden border border-red-500/20 dark:border-red-500/10 bg-red-500/[0.02] dark:bg-red-500/[0.01] p-10 rounded-[4rem] group transition-all duration-500 shadow-xl shadow-red-500/[0.03]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                       <Power size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-600 dark:text-red-500">Session Halt</h3>
                       <p className="text-[9px] font-black text-gray-950 dark:text-gray-400 uppercase tracking-widest leading-none mt-1 opacity-80">Clinical Disconnect</p>
                    </div>
                 </div>

                 <p className="text-xs font-bold text-gray-900 dark:text-gray-400 opacity-90 leading-relaxed">
                    Terminate the active clinical session and seal all neural links until next biometric authentication.
                 </p>

                 <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-600/20 hover:bg-red-700 hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                    {loggingOut ? (
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                       <LogOut size={16} />
                    )}
                    {loggingOut ? "DISCONNECTING..." : "HALT SESSION"}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}