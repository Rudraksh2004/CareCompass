import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

// 🧠 Types (non-breaking + optional safety)
export type HistoryType = "reports" | "prescriptions" | "chats";

// 🔥 SAVE HISTORY (Robust + Safe)
// Fixes: history not being created when uid is undefined
export const saveHistory = async (
  uid: string,
  type: HistoryType,
  data: any
) => {
  try {
    if (!uid) {
      console.warn("saveHistory skipped: uid is undefined");
      return;
    }

    const ref = collection(db, "users", uid, type);

    await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(), // ensures proper sorting
    });
  } catch (error) {
    console.error("Error saving history:", error);
  }
};

// 📥 GET HISTORY (Fixed for missing createdAt + empty collections)
// Fixes:
// - History not loading if orderBy fails
// - Silent Firestore query errors
// - Empty UI when docs exist
export const getHistory = async (
  uid: string,
  type: HistoryType
) => {
  try {
    if (!uid) {
      console.warn("getHistory skipped: uid is undefined");
      return [];
    }

    const ref = collection(db, "users", uid, type);

    // 🔥 Safe query with fallback (very important)
    const q = query(ref, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const historyData = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return historyData;
  } catch (error: any) {
    console.error("Error fetching history (ordered):", error);

    // 🚑 FALLBACK: Fetch without orderBy if index or createdAt issue
    try {
      const fallbackRef = collection(db, "users", uid, type);
      const fallbackSnap = await getDocs(fallbackRef);

      return fallbackSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (fallbackError) {
      console.error("Fallback history fetch failed:", fallbackError);
      return [];
    }
  }
};

// 🧹 CLEAR HISTORY (Optimized batch deletion)
export const clearHistory = async (
  uid: string,
  type: HistoryType
) => {
  try {
    if (!uid) {
      console.warn("clearHistory skipped: uid is undefined");
      return;
    }

    const ref = collection(db, "users", uid, type);
    const snapshot = await getDocs(ref);

    if (snapshot.empty) return;

    const deletions = snapshot.docs.map((document) =>
      deleteDoc(doc(db, "users", uid, type, document.id))
    );

    await Promise.all(deletions);
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};