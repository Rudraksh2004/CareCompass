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
  getDoc,
} from "firebase/firestore";

export interface Reminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes: string[];
  createdAt?: any;
}

const getTodayKey = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
};

// ➕ Add Reminder (Supports Multiple Times)
export const addReminder = async (
  uid: string,
  medicineName: string,
  dosage: string,
  time: string,
) => {
  if (!uid || !medicineName || !time) return;

  await addDoc(collection(db, "reminders"), {
    userId: uid,
    medicineName,
    dosage: dosage || "",
    times: [time], // multi-dose ready
    takenTimes: [], // 🔒 SAME SCHEMA (unchanged)
    createdAt: serverTimestamp(),
  });
};

// 📥 Get All User Reminders (Schema Safe + Backward Compatible)
export const getUserReminders = async (uid: string): Promise<Reminder[]> => {
  if (!uid) return [];

  const q = query(collection(db, "reminders"), where("userId", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    const safeTimes =
      Array.isArray(data.times)
        ? data.times
        : data.time
        ? [data.time]
        : [];

    return {
      id: docSnap.id,
      userId: data.userId,
      medicineName: data.medicineName || "",
      dosage: data.dosage || "",
      times: safeTimes,
      takenTimes: Array.isArray(data.takenTimes) ? data.takenTimes : [],
      createdAt: data.createdAt || null,
    };
  });
};

// 🗑 Delete Reminder (Safe)
export const deleteReminder = async (reminderId: string) => {
  if (!reminderId) return;

  try {
    await deleteDoc(doc(db, "reminders", reminderId));
  } catch (error) {
    console.error("Error deleting reminder:", error);
  }
};

// ✏️ Update Reminder (Crash-Proof Edit Fix — PRESERVES YOUR LOGIC)
export const updateReminder = async (
  reminderId: string,
  data: {
    medicineName?: string;
    dosage?: string;
    times?: string[];
  },
) => {
  if (!reminderId) {
    console.error("No reminderId provided for update");
    return;
  }

  try {
    const docRef = doc(db, "reminders", reminderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Reminder document does not exist:", reminderId);
      return;
    }

    const updatePayload: any = {};

    if (data.medicineName !== undefined) {
      updatePayload.medicineName = data.medicineName;
    }

    if (data.dosage !== undefined) {
      updatePayload.dosage = data.dosage;
    }

    if (data.times !== undefined) {
      updatePayload.times = data.times;
    }

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error("Error updating reminder:", error);
  }
};

// ✅ Mark Dose as Taken (DAILY RESET FIX — NO SCHEMA CHANGE)
export const markDoseTaken = async (
  reminderId: string,
  time: string,
  currentTaken: string[] = [],
) => {
  if (!reminderId || !time) return;

  try {
    const today = getTodayKey();
    const todayKey = `${today}_${time}`; // 🔥 DAILY UNIQUE KEY

    const docRef = doc(db, "reminders", reminderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Reminder not found for marking taken:", reminderId);
      return;
    }

    const takenTimes = Array.isArray(currentTaken) ? currentTaken : [];

    // Prevent duplicate marking for SAME DAY
    if (takenTimes.includes(todayKey)) return;

    const updatedTaken = [...takenTimes, todayKey];

    await updateDoc(docRef, {
      takenTimes: updatedTaken,
    });
  } catch (error) {
    console.error("Error marking dose as taken:", error);
  }
};
