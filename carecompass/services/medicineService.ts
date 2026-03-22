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

      const createdTime = data.createdAt?.toMillis
        ? data.createdAt.toMillis()
        : data.createdAt?.toDate
        ? data.createdAt.toDate().getTime()
        : Date.now();

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

  let mergedDocs: any[] = [];
  
  // Old Structure (Legacy root)
  try {
    const rootRef = collection(db, "medicine_history");
    const rootQ = query(rootRef, where("userId", "==", uid));
    const rootSnap = await getDocs(rootQ);
    mergedDocs = [...mergedDocs, ...rootSnap.docs];
  } catch (err) {
    console.warn("Legacy root fetch failed:", err);
  }

  // New Structure
  try {
    const subRef = collection(db, "users", uid, "medicine_history");
    const subSnap = await getDocs(subRef);
    mergedDocs = [...mergedDocs, ...subSnap.docs];
  } catch (err) {
    console.warn("Subcollection fetch failed:", err);
  }

  const uniqueMap = new Map();
  mergedDocs.forEach((docSnap) => {
    if (!uniqueMap.has(docSnap.id)) {
      uniqueMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    }
  });

  const logs = Array.from(uniqueMap.values());
  return logs.sort((a: any, b: any) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
    return timeB - timeA;
  });
};