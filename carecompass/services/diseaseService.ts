import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  query,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";

export interface DiseaseQA {
  allergies?: boolean;
  surgeries?: boolean;
  chronicConditions?: string[];
  duration?: string;
  medications?: string;
  recentTravel?: string;
  biometrics?: {
    temperature?: string;
    heartRate?: string;
    spo2?: string;
    bloodPressure?: string;
    sleepLevel?: number;
    stressLevel?: number;
  };
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

// ✅ Save Disease Prediction History → users/{uid}/disease_history/{doc}
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
    await addDoc(
      collection(db, "users", uid, "disease_history"),
      {
        userId: uid,
        symptoms: data.symptoms || [],
        customText: data.customText || "",
        location: data.location || "",
        qa: data.qa || null,
        severity: data.severity,
        prediction: data.prediction,
        createdAt: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error("Error saving disease history:", error);
  }
};

// 📥 Get User Disease History
export const getDiseaseHistory = async (
  uid: string
): Promise<DiseaseHistory[]> => {
  if (!uid) return [];

  try {
    let mergedDocs: any[] = [];
    
    // Fetch from Old Root Collection (Legacy Data)
    try {
      const rootRef = collection(db, "disease_history");
      const rootQ = query(rootRef, where("userId", "==", uid));
      const rootSnap = await getDocs(rootQ);
      mergedDocs = [...mergedDocs, ...rootSnap.docs];
    } catch (err) {
      console.warn("Legacy root fetch failed (permissions/missing):", err);
    }

    // Fetch from New Subcollection Structure
    try {
      const historyRef = collection(db, "users", uid, "disease_history");
      const newSnap = await getDocs(historyRef);
      mergedDocs = [...mergedDocs, ...newSnap.docs];
    } catch (err) {
      console.warn("Subcollection fetch failed:", err);
    }

    // Extract, merge unique by ID, and sort in JavaScript to avoid composite index requirements
    const uniqueMap = new Map();
    mergedDocs.forEach((docSnap) => {
      if (!uniqueMap.has(docSnap.id)) {
        uniqueMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      }
    });

    const combinedHistory = Array.from(uniqueMap.values()).map((data: any) => ({
      id: data.id,
      userId: data.userId || uid,
      symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
      customText: data.customText || "",
      location: data.location || "",
      qa: data.qa ?? null,
      severity: data.severity || "Low",
      prediction: data.prediction || "",
      createdAt: data.createdAt ?? null,
    }));

    return combinedHistory.sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
      return timeB - timeA; // Descending order
    });

  } catch (error) {
    console.error("Error fetching disease history:", error);
    return [];
  }
};

// 🗑️ Delete Disease History Entry
export const deleteDiseaseHistory = async (
  uid: string,
  historyId: string
) => {
  if (!uid || !historyId) return;

  try {
    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "disease_history",
        historyId
      )
    );
  } catch (error) {
    console.error("Error deleting disease history:", error);
  }
};