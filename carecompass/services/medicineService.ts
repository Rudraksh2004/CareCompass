import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

export const saveMedicineHistory = async (
  uid: string,
  medicineName: string,
  description: string
) => {
  if (!uid || !medicineName || !description) return;

  try {
    const historyRef = collection(
      db,
      "users",
      uid,
      "medicine_history"
    );

    // 🔒 Prevent duplicate saves within short time window
    const q = query(
      historyRef,
      where("medicineName", "==", medicineName)
    );

    const snapshot = await getDocs(q);

    const now = Date.now();

    const isRecentDuplicate = snapshot.docs.some((docSnap) => {
      const data = docSnap.data();

      if (!data.createdAt) return false;

      const createdTime =
        data.createdAt.toDate().getTime();

      return now - createdTime < 60000;
    });

    if (isRecentDuplicate) {
      console.log("Duplicate medicine analysis prevented");
      return;
    }

    await addDoc(historyRef, {
      userId: uid,
      medicineName,
      description,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error("Error saving medicine history:", error);
  }
};

export const getMedicineHistory = async (uid: string) => {
  if (!uid) return [];

  const historyRef = collection(
    db,
    "users",
    uid,
    "medicine_history"
  );

  const q = query(
    historyRef,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};