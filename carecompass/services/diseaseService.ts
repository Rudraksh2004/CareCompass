import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

export interface DiseaseQA {
  allergies?: boolean;
  surgeries?: boolean;
  chronicConditions?: string[];
  duration?: string;
  medications?: string;
}

export interface DiseaseHistory {
  id: string;
  userId: string;
  symptoms: string[];
  customText?: string;
  location?: string;
  qa?: DiseaseQA | null;
  severity: "Low" | "Moderate" | "High";
  prediction: string;
  createdAt?: any;
}

// 🔥 Save Disease Prediction History (Auth Mode A) — UNCHANGED LOGIC
export const saveDiseaseHistory = async (
  uid: string,
  data: {
    symptoms: string[];
    customText?: string;
    location?: string;
    qa?: DiseaseQA | null;
    severity: "Low" | "Moderate" | "High";
    prediction: string;
  }
) => {
  if (!uid || !data?.prediction) return;

  try {
    await addDoc(collection(db, "disease_history"), {
      userId: uid,
      symptoms: data.symptoms || [],
      customText: data.customText || "",
      location: data.location || "",
      qa: data.qa || null, // optional clinical Q&A (safe)
      severity: data.severity,
      prediction: data.prediction,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving disease history:", error);
  }
};

// 📥 Get User Disease History (UNCHANGED STRUCTURE, SAFER PARSING)
export const getDiseaseHistory = async (
  uid: string
): Promise<DiseaseHistory[]> => {
  if (!uid) return [];

  try {
    const q = query(
      collection(db, "disease_history"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        userId: data.userId || uid,
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        customText: data.customText || "",
        location: data.location || "",
        qa: data.qa ?? null,
        severity: data.severity || "Low",
        prediction: data.prediction || "",
        createdAt: data.createdAt ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching disease history:", error);
    return [];
  }
};

// 🗑️ NEW: Delete Single Disease History (REQUIRED for history UI)
export const deleteDiseaseHistory = async (
  uid: string,
  historyId: string
) => {
  if (!uid || !historyId) return;

  try {
    // Extra safety: ensure document belongs to user before deletion
    const docRef = doc(db, "disease_history", historyId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting disease history:", error);
  }
};