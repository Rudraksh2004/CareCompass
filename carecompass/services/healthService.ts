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

  const logsRef = collection(
    db,
    "users",
    userId,
    "health_logs"
  );

  const q = query(
    logsRef,
    where("type", "==", type),
    orderBy("createdAt")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
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