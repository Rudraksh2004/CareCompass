import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export const createUserProfile = async (
  uid: string,
  data: {
    name: string;
    age: number;
    bloodGroup: string;
    email: string;
  }
) => {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const updateUserProfile = async (
  uid: string,
  data: any
) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
};
