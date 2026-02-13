import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { deleteDoc, doc} from "firebase/firestore";

export const saveHistory = async (
  uid: string,
  type: "reports" | "prescriptions" | "chats",
  data: any,
) => {
  const ref = collection(db, "users", uid, type);

  await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getHistory = async (
  uid: string,
  type: "reports" | "prescriptions" | "chats",
) => {
  const ref = collection(db, "users", uid, type);
  const q = query(ref, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const clearHistory = async (
  uid: string,
  type: "reports" | "prescriptions" | "chats",
) => {
  const ref = collection(db, "users", uid, type);
  const snapshot = await getDocs(ref);

  const deletions = snapshot.docs.map((document) =>
    deleteDoc(doc(db, "users", uid, type, document.id)),
  );

  await Promise.all(deletions);
};
