import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// 🧠 Create User Profile
export const createUserProfile = async (
  uid: string,
  data: {
    name: string;
    age: number;
    bloodGroup: string;
    email: string;
  }
) => {
  if (!uid || !data) return;

  await setDoc(
    doc(db, "users", uid),
    {
      ...data,
      profileCompleted: true, // ⭐ future onboarding logic
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// 📥 Get User Profile
export const getUserProfile = async (uid: string) => {
  if (!uid) return null;

  const docRef = doc(db, "users", uid);

  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
};

// ✏️ Update User Profile
export const updateUserProfile = async (
  uid: string,
  data: any
) => {
  if (!uid || !data) return;

  const docRef = doc(db, "users", uid);

  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true } // prevents overwrite
  );
};