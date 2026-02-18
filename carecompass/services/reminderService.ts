import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export const addReminder = async (
  uid: string,
  medicineName: string,
  dosage: string,
  time: string
) => {
  await addDoc(collection(db, "reminders"), {
    userId: uid,
    medicineName,
    dosage,
    times: [time], // 🔥 supports multiple reminders
    takenTimes: [],
    createdAt: serverTimestamp(),
  });
};

export const getUserReminders = async (uid: string) => {
  const q = query(
    collection(db, "reminders"),
    where("userId", "==", uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const deleteReminder = async (reminderId: string) => {
  await deleteDoc(doc(db, "reminders", reminderId));
};

export const updateReminder = async (
  reminderId: string,
  data: any
) => {
  await updateDoc(doc(db, "reminders", reminderId), data);
};

// ✅ Mark dose as taken (per time)
export const markDoseTaken = async (
  reminderId: string,
  time: string,
  currentTaken: string[]
) => {
  const updatedTaken = currentTaken.includes(time)
    ? currentTaken
    : [...currentTaken, time];

  await updateDoc(doc(db, "reminders", reminderId), {
    takenTimes: updatedTaken,
  });
};
