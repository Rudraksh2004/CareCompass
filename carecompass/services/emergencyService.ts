import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveEmergencyProfile = async (uid: string, data: any) => {
  await setDoc(doc(db, "emergency_profiles", uid), data);
};

export const getEmergencyProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "emergency_profiles", uid));

  if (!snap.exists()) return null;

  return snap.data();
};