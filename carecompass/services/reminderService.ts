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
  takenTimes: string[]; // format: YYYY-MM-DD_HH:MM
  createdAt?: any;
}

// 🔑 Helper: Today Key (Used for Daily Reset Logic)
const getTodayKey = () => {
  return new Date().toISOString().split("T")[0];
};

// ➕ Add Reminder (Supports Multi-Dose)
export const addReminder = async (
  uid: string,
  medicineName: string,
  dosage: string,
  time: string
) => {
  if (!uid || !medicineName || !time) return;

  await addDoc(collection(db, "reminders"), {
    userId: uid,
    medicineName,
    dosage: dosage || "",
    times: [time], // multi-dose schema
    takenTimes: [], // daily tracked entries like 2026-02-20_08:00
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

    // Backward compatibility (old schema had "time")
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
  }
) => {
  if (!reminderId) return;

  try {
    const docRef = doc(db, "reminders", reminderId);
    const docSnap = await getDoc(docRef);

    // Prevent "No document to update" error (your previous bug)
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

// ✅ Mark Dose as Taken (PER DOSE + PER DAY)  — A+B+C+D CORE FIX
export const markDoseTaken = async (
  reminderId: string,
  time: string,
  currentTaken: string[] = []
) => {
  if (!reminderId || !time) return;

  try {
    const docRef = doc(db, "reminders", reminderId);
    const docSnap = await getDoc(docRef);

    // Prevent runtime crash
    if (!docSnap.exists()) {
      console.error("Reminder not found:", reminderId);
      return;
    }

    const today = getTodayKey();
    const todayDoseKey = `${today}_${time}`; // e.g. 2026-02-20_08:00

    const takenArray = Array.isArray(currentTaken) ? currentTaken : [];

    // 🔒 Prevent duplicate marking (Bug D fix)
    if (takenArray.includes(todayDoseKey)) {
      return;
    }

    const updatedTaken = [...takenArray, todayDoseKey];

    await updateDoc(docRef, {
      takenTimes: updatedTaken,
    });
  } catch (error) {
    console.error("Error marking dose as taken:", error);
  }
};

// 📊 Get Today's Progress (Used for Dashboard + UI Progress Bar)
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