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
  takenTimes: string[];
  createdAt?: any;
}

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ✅ FIXED: Now supports MULTI-DOSE directly (no race condition)
export const addReminder = async (
  uid: string,
  medicineName: string,
  dosage: string,
  times: string[] // 🔥 CHANGED from string → string[]
) => {
  if (!uid || !medicineName || !times || times.length === 0) return;

  await addDoc(collection(db, "reminders"), {
    userId: uid,
    medicineName,
    dosage: dosage || "",
    times: times, // 🔥 save all doses at once
    takenTimes: [],
    createdAt: serverTimestamp(),
  });
};

// 📥 Get User Reminders (UNCHANGED)
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

// 🗑 Delete Reminder (UNCHANGED)
export const deleteReminder = async (reminderId: string) => {
  if (!reminderId) return;
  await deleteDoc(doc(db, "reminders", reminderId));
};

// ✏️ Update Reminder (UNCHANGED)
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

// ✅ Mark Dose as Taken (UNCHANGED)
export const markDoseTaken = async (
  reminderId: string,
  todayDoseKey: string,
  currentTaken: string[] = []
) => {
  if (!reminderId || !todayDoseKey) return;

  try {
    const docRef = doc(db, "reminders", reminderId);

    if (currentTaken?.includes(todayDoseKey)) {
      return;
    }

    await updateDoc(docRef, {
      takenTimes: arrayUnion(todayDoseKey),
    });
  } catch (error) {
    console.error("Error marking dose as taken:", error);
  }
};

// 📊 Progress (UNCHANGED)
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