import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const saveMedicineHistory = async (
  uid: string,
  medicineName: string,
  description: string
) => {
  if (!uid || !medicineName || !description) return;

  await addDoc(collection(db, "medicine_history"), {
    userId: uid,
    medicineName,
    description,
    createdAt: serverTimestamp(),
  });
};

export const getMedicineHistory = async (uid: string) => {
  if (!uid) return [];

  const q = query(
    collection(db, "medicine_history"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};