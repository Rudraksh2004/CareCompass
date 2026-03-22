import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

// ✅ Add Health Log → users/{uid}/health_logs/{doc}
export const addHealthLog = async (
  userId: string,
  type: string,
  value: string
) => {
  if (!userId || !type || !value) return;

  await addDoc(
    collection(db, "users", userId, "health_logs"),
    {
      userId,
      type,
      value,
      createdAt: serverTimestamp(),
    }
  );
};

// ✅ Get Health Logs (per user + per type)
export const getHealthLogs = async (
  userId: string,
  type: string
) => {
  if (!userId || !type) return [];

  let mergedDocs: any[] = [];

  // Old Structure (Legacy root)
  try {
    const rootRef = collection(db, "health_logs");
    const rootQ = query(rootRef, where("userId", "==", userId), where("type", "==", type));
    const rootSnap = await getDocs(rootQ);
    mergedDocs = [...mergedDocs, ...rootSnap.docs];
  } catch (err) {
    console.warn("Legacy root fetch failed:", err);
  }

  // New Structure
  try {
    const logsRef = collection(db, "users", userId, "health_logs");
    const q = query(logsRef, where("type", "==", type));
    const snapshot = await getDocs(q);
    mergedDocs = [...mergedDocs, ...snapshot.docs];
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

  // Sort by createdAt in JS to avoid composite index requirement
  return logs.sort((a: any, b: any) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
    return timeA - timeB;
  });
};

// ✅ Delete Health Log
export const deleteHealthLog = async (
  userId: string,
  logId: string
) => {
  if (!userId || !logId) return;

  await deleteDoc(
    doc(db, "users", userId, "health_logs", logId)
  );
};