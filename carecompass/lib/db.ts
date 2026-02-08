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

// Save a simplified report analysis
export async function saveReport(userId: string, fileName: string, analysis: string) {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      userId,
      fileName,
      analysis,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Fetch user's report history
export async function getUserReports(userId: string) {
  const q = query(
    collection(db, "reports"), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}