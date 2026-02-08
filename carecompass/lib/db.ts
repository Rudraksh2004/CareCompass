import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  orderBy 
} from "firebase/firestore";

// Save a report to Firestore
export async function saveReportToDb(userId: string, fileName: string, analysis: string) {
  try {
    await addDoc(collection(db, "reports"), {
      userId,
      fileName,
      analysis,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Firestore Save Error:", error);
  }
}

// Fetch all reports for a specific user
export async function getUserReportHistory(userId: string) {
  const q = query(
    collection(db, "reports"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

//Add Medication to Firestore
export async function addMedication(userId: string, medData: { name: string, dose: string, frequency: string }) {
  try {
    await addDoc(collection(db, "meds"), {
      userId,
      ...medData,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding medication:", e);
  }
}