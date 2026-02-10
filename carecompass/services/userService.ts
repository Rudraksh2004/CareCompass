import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};
