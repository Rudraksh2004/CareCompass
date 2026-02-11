import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";

export const addReminder = async (
  userId: string,
  medicineName: string,
  dosage: string,
  time: string
) => {
  await addDoc(collection(db, "reminders"), {
    userId,
    medicineName,
    dosage,
    time,
    createdAt: serverTimestamp(),
  });
};

export const getUserReminders = async (userId: string) => {
  const q = query(
    collection(db, "reminders"),
    where("userId", "==", userId),
    orderBy("time")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteReminder = async (id: string) => {
  await deleteDoc(doc(db, "reminders", id));
};