import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ✅ Save Emergency Profile
export const saveEmergencyProfile = async (
  uid: string,
  data: any
) => {
  if (!uid || !data) return;

  await setDoc(
    doc(db, "users", uid, "emergency_profile", "profile"),
    {
      ...data,
      updatedAt: new Date(),
    }
  );
};

// ✅ Get Emergency Profile
export const getEmergencyProfile = async (uid: string) => {
  if (!uid) return null;

  const snap = await getDoc(
    doc(db, "users", uid, "emergency_profile", "profile")
  );

  if (!snap.exists()) return null;

  return snap.data();
};