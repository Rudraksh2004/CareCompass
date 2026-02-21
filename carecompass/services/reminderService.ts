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
  arrayUnion,
} from "firebase/firestore";

export interface Reminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  takenTimes: string[]; // format: YYYY-MM-DD_HH:MM
  createdAt?: any;
}

// 🔑 Helper: Today Key (Used for Daily Reset Logic)
const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ➕ Add Reminder (Supports Multi-Dose)
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
    times: [time],
    takenTimes: [],
    createdAt: serverTimestamp(),
  });
};

// 📥 Get User Reminders (Schema Safe + Backward Compatible)
export const getUserReminders = async (uid: string): Promise<Reminder[]> => {
  if (!uid) return [];

  const q = query(collection(db, "reminders"), where("userId", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    const safeTimes = Array.isArray(data.times)
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

// 🗑 Delete Reminder
export const deleteReminder = async (reminderId: string) => {
  if (!reminderId) return;
  await deleteDoc(doc(db, "reminders", reminderId));
};

// ✏️ Update Reminder (Crash-Proof)
export const updateReminder = async (
  reminderId: string,
  data: {
    medicineName?: string;
    dosage?: string;
    times?: string[];
  },
) => {
  if (!reminderId) return;

  try {
    const docRef = doc(db, "reminders", reminderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Reminder document does not exist:", reminderId);
      return;
    }

    const payload: any = {};

    if (data.medicineName !== undefined)
      payload.medicineName = data.medicineName;

    if (data.dosage !== undefined) payload.dosage = data.dosage;

    if (data.times !== undefined) payload.times = data.times;

    await updateDoc(docRef, payload);
  } catch (error) {
    console.error("Error updating reminder:", error);
  }
};

// ✅ FIXED: Mark Dose as Taken (DATE-SAFE + ATOMIC + NO DOUBLE PREFIX BUG)
export const markDoseTaken = async (
  reminderId: string,
  todayDoseKey: string, // IMPORTANT: already formatted like 2026-02-21_14:00
  currentTaken: string[] = [],
) => {
  if (!reminderId || !todayDoseKey) return;

  try {
    const docRef = doc(db, "reminders", reminderId);

    // 🔒 Prevent duplicate marking
    if (currentTaken?.includes(todayDoseKey)) {
      return;
    }

    // 🚀 Atomic Firestore update (NO overwrite bug)
    await updateDoc(docRef, {
      takenTimes: arrayUnion(todayDoseKey),
    });
  } catch (error) {
    console.error("Error marking dose as taken:", error);
  }
};

// 📊 Get Today's Progress (Dashboard Safe)
export const getTodayProgress = (reminder: Reminder) => {
  const today = getTodayKey();
  const totalDoses = reminder.times?.length || 0;

  const takenToday =
    reminder.takenTimes?.filter((t) => t.startsWith(today)).length || 0;

  return {
    takenToday,
    totalDoses,
    progressPercent:
      totalDoses === 0 ? 0 : Math.round((takenToday / totalDoses) * 100),
  };
};
