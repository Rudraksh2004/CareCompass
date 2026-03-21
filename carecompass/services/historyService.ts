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

// 🧠 Types
export type HistoryType = "reports" | "prescriptions" | "chats";

// 🔥 SAVE HISTORY (Production-safe)
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
      type, // ⭐ future timeline support
      createdAt: serverTimestamp(), // ensures consistent ordering
    });

  } catch (error) {
    console.error("Error saving history:", error);
  }
};

// 📥 GET HISTORY (Reliable ordered fetch)
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

    const q = query(
      ref,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

  } catch (error: any) {
    console.error("Error fetching ordered history:", error);

    // 🚑 fallback without ordering (index-safe fallback)
    try {
      const fallbackRef = collection(db, "users", uid, type);

      const fallbackSnap = await getDocs(fallbackRef);

      return fallbackSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

    } catch (fallbackError) {
      console.error(
        "Fallback history fetch failed:",
        fallbackError
      );

      return [];
    }
  }
};

// 🧹 CLEAR HISTORY (Batch-safe deletion)
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
      deleteDoc(
        doc(
          db,
          "users",
          uid,
          type,
          document.id
        )
      )
    );

    await Promise.all(deletions);

  } catch (error) {
    console.error("Error clearing history:", error);
  }
};