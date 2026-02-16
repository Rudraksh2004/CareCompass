import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Create new chat session
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

// Get all chat sessions (like ChatGPT sidebar)
export const getChatSessions = async (uid: string) => {
  const q = query(
    collection(db, "users", uid, "chatSessions"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Save message inside a session
export const saveMessage = async (
  uid: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
) => {
  await addDoc(
    collection(db, "users", uid, "chatSessions", sessionId, "messages"),
    {
      role,
      content,
      createdAt: serverTimestamp(),
    }
  );
};

// Get messages of a specific chat
export const getMessages = async (uid: string, sessionId: string) => {
  const q = query(
    collection(db, "users", uid, "chatSessions", sessionId, "messages"),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data());
};

// Delete entire chat session
export const deleteChatSession = async (
  uid: string,
  sessionId: string
) => {
  await deleteDoc(doc(db, "users", uid, "chatSessions", sessionId));
};
