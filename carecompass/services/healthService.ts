import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";

export const addHealthLog = async (
  userId: string,
  type: string,
  value: string
) => {
  await addDoc(collection(db, "health_logs"), {
    userId,
    type,
    value,
    createdAt: serverTimestamp(),
  });
};

export const getHealthLogs = async (
  userId: string,
  type: string
) => {
  const q = query(
    collection(db, "health_logs"),
    where("userId", "==", userId),
    where("type", "==", type),
    orderBy("createdAt")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteHealthLog = async (id: string) => {
  await deleteDoc(doc(db, "health_logs", id));
};