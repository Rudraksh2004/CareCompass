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

  try {
    // 🔒 Prevent duplicate saves within short time window
    const q = query(
      collection(db, "medicine_history"),
      where("userId", "==", uid),
      where("medicineName", "==", medicineName)
    );

    const snapshot = await getDocs(q);
    const now = Date.now();

    const isRecentDuplicate = snapshot.docs.some((doc) => {
      const data = doc.data();
      if (!data.createdAt) return false;
      const createdTime = data.createdAt.toDate().getTime();
      return now - createdTime < 60000; // 1 minute duplicate protection
    });

    if (isRecentDuplicate) {
      console.log("Duplicate medicine analysis prevented");
      return;
    }

    await addDoc(collection(db, "medicine_history"), {
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