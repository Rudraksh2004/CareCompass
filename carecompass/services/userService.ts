import { db, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

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

// 📸 Upload Profile Photo
export const uploadUserProfilePhoto = async (uid: string, file: File) => {
  if (!uid || !file) return null;

  const storageRef = ref(storage, `users/${uid}/profile-photo`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};