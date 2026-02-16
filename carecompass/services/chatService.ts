import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// 🔹 Create a new chat session
export const createChatSession = async (uid: string) => {
  const sessionRef = await addDoc(
    collection(db, "users", uid, "chatSessions"),
    {
      title: "New Chat",
      createdAt: serverTimestamp(),
    }
  );

  return sessionRef.id;
};

// 🔹 Get all chat sessions (for sidebar)
export const getChatSessions = async (uid: string) => {
  const q = query(
    collection(db, "users", uid, "chatSessions"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// 🔹 Get messages of a specific session
export const getMessages = async (uid: string, sessionId: string) => {
  const q = query(
    collection(
      db,
      "users",
      uid,
      "chatSessions",
      sessionId,
      "messages"
    ),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    role: docSnap.data().role,
    content: docSnap.data().content,
  }));
};

// 🔹 Save a message to a session
export const saveMessage = async (
  uid: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
) => {
  await addDoc(
    collection(
      db,
      "users",
      uid,
      "chatSessions",
      sessionId,
      "messages"
    ),
    {
      role,
      content,
      createdAt: serverTimestamp(),
    }
  );
};

// 🔹 Delete an entire chat session
export const deleteChatSession = async (
  uid: string,
  sessionId: string
) => {
  await deleteDoc(
    doc(db, "users", uid, "chatSessions", sessionId)
  );
};

// 🔥 NEW: Update chat title (AI Generated like ChatGPT)
export const updateChatTitle = async (
  uid: string,
  sessionId: string,
  title: string
) => {
  const ref = doc(db, "users", uid, "chatSessions", sessionId);
  await updateDoc(ref, { title });
};
