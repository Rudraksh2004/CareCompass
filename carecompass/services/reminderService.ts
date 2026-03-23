import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  arrayUnion,
  where
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

// ✅ NEW STRUCTURE: users/{uid}/reminders/{doc}
export const addReminder = async (
  uid: string,
  medicineName: string,
  dosage: string,
  times: string[]
) => {
  if (!uid || !medicineName || !times || times.length === 0) return;

  await addDoc(collection(db, "users", uid, "reminders"), {
    userId: uid,
    medicineName,
    dosage: dosage || "",
    times,
    takenTimes: [],
    createdAt: serverTimestamp(),
  });
};

// 📥 Get User Reminders (UPDATED PATH)
export const getUserReminders = async (
  uid: string
): Promise<Reminder[]> => {
  if (!uid) return [];

  let mergedDocs: any[] = [];

  // Old Structure (Legacy root)
  try {
    const rootRef = collection(db, "reminders");
    const rootQ = query(rootRef, where("userId", "==", uid));
    const rootSnap = await getDocs(rootQ);
    mergedDocs = [...mergedDocs, ...rootSnap.docs];
  } catch (err) {
    console.warn("Legacy root reminders fetch failed:", err);
  }

  // New Structure
  try {
    const subRef = collection(db, "users", uid, "reminders");
    const subSnap = await getDocs(subRef);
    mergedDocs = [...mergedDocs, ...subSnap.docs];
  } catch (err) {
    console.warn("Subcollection reminders fetch failed:", err);
  }

  const uniqueMap = new Map();
  mergedDocs.forEach((docSnap) => {
    if (!uniqueMap.has(docSnap.id)) {
      const data = docSnap.data();
      const safeTimes = Array.isArray(data.times)
        ? data.times
        : data.time
        ? [data.time]
        : [];
  
      uniqueMap.set(docSnap.id, {
        id: docSnap.id,
        userId: data.userId || uid,
        medicineName: data.medicineName || "",
        dosage: data.dosage || "",
        times: safeTimes,
        takenTimes: Array.isArray(data.takenTimes)
          ? data.takenTimes
          : [],
        createdAt: data.createdAt || null,
      });
    }
  });

  return Array.from(uniqueMap.values());
};

// 🗑 Delete Reminder
export const deleteReminder = async (
  uid: string,
  reminderId: string
) => {
  if (!uid || !reminderId) return;

  // Try deleting from new structure
  try {
    await deleteDoc(doc(db, "users", uid, "reminders", reminderId));
  } catch (err) {
    console.warn("New structure delete failed, trying legacy:", err);
  }

  // Also try deleting from legacy structure
  try {
    await deleteDoc(doc(db, "reminders", reminderId));
  } catch (err) {
    console.error("Legacy structure delete failed:", err);
  }

};

// ✏️ Update Reminder
export const updateReminder = async (
  uid: string,
  reminderId: string,
  data: {
    medicineName?: string;
    dosage?: string;
    times?: string[];
  }
) => {
  if (!uid || !reminderId) return;

  try {
    const docRef = doc(
      db,
      "users",
      uid,
      "reminders",
      reminderId
    );

    let docSnap = await getDoc(docRef);

    // 🔥 FALLBACK: Check Legacy Path
    if (!docSnap.exists()) {
      const legacyRef = doc(db, "reminders", reminderId);
      const legacySnap = await getDoc(legacyRef);

      if (legacySnap.exists()) {
        const payload: any = {};
        if (data.medicineName !== undefined) payload.medicineName = data.medicineName;
        if (data.dosage !== undefined) payload.dosage = data.dosage;
        if (data.times !== undefined) payload.times = data.times;

        await updateDoc(legacyRef, payload);
        return;
      }

      console.error("Reminder document does not exist in any collection:", reminderId);
      return;
    }

    const payload: any = {};

    if (data.medicineName !== undefined)
      payload.medicineName = data.medicineName;

    if (data.dosage !== undefined)
      payload.dosage = data.dosage;

    if (data.times !== undefined)
      payload.times = data.times;

    await updateDoc(docRef, payload);
  } catch (error) {
    console.error("Error updating reminder:", error);
  }
};

// ✅ Mark Dose Taken
export const markDoseTaken = async (
  uid: string,
  reminderId: string,
  todayDoseKey: string,
  currentTaken: string[] = []
) => {
  if (!uid || !reminderId || !todayDoseKey) return;

  try {
    const docRef = doc(
      db,
      "users",
      uid,
      "reminders",
      reminderId
    );

    let docSnap = await getDoc(docRef);

    // 🔥 FALLBACK: Check Legacy Path
    if (!docSnap.exists()) {
      const legacyRef = doc(db, "reminders", reminderId);
      const legacySnap = await getDoc(legacyRef);

      if (legacySnap.exists()) {
        if (currentTaken?.includes(todayDoseKey)) return;
        await updateDoc(legacyRef, {
          takenTimes: arrayUnion(todayDoseKey),
        });
        return;
      }
      return;
    }

    if (currentTaken?.includes(todayDoseKey)) return;

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
    reminder.takenTimes?.filter((t) =>
      t.startsWith(today)
    ).length || 0;

  return {
    takenToday,
    totalDoses,
    progressPercent:
      totalDoses === 0
        ? 0
        : Math.round((takenToday / totalDoses) * 100),
  };
};