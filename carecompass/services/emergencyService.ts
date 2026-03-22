import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

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

  // 1. Try new nested structure first
  const newRef = doc(db, "users", uid, "emergency_profile", "profile");
  const snap = await getDoc(newRef);
  if (snap.exists()) {
    return snap.data();
  }

  // 2. Fallback to legacy structure (doc with uid as ID in 'emergency_profile')
  try {
    const legacyDoc1 = doc(db, "emergency_profile", uid);
    const snap1 = await getDoc(legacyDoc1);
    if (snap1.exists()) {
      // Auto-migrate it quietly
      await setDoc(newRef, snap1.data());
      return snap1.data();
    }
  } catch (err) {}

  // 3. Fallback to legacy structure ('emergency_profiles')
  try {
    const legacyDoc2 = doc(db, "emergency_profiles", uid);
    const snap2 = await getDoc(legacyDoc2);
    if (snap2.exists()) {
      await setDoc(newRef, snap2.data());
      return snap2.data();
    }
  } catch (err) {}

  // 4. Fallback to queried collection structure
  try {
    const legacyQ = query(collection(db, "emergency_profiles"), where("userId", "==", uid));
    const snap3 = await getDocs(legacyQ);
    if (!snap3.empty) {
      const legacyData = snap3.docs[0].data();
      await setDoc(newRef, legacyData);
      return legacyData;
    }
  } catch (err) {}

  return null;
};