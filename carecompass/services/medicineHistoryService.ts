import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const saveMedicineHistory = async (
  uid: string,
  data: {
    medicineText: string;
    aiResponse: string;
  }
) => {
  if (!uid || !data?.medicineText || !data?.aiResponse) return;

  await addDoc(
    collection(db, "users", uid, "medicine_history"),
    {
      medicineText: data.medicineText,
      aiResponse: data.aiResponse,
      createdAt: serverTimestamp(),
    }
  );
};

export const getMedicineHistory = async (uid: string) => {
  if (!uid) return [];

  const q = query(
    collection(db, "users", uid, "medicine_history"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};