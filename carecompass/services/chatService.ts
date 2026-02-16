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

export const createChatSession = async (uid: string) => {
  const ref = await addDoc(
    collection(db, "users", uid, "chatSessions"),
    {
      title: "New Chat",
      createdAt: serverTimestamp(),
    }
  );

  return ref.id;
};

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

  return snapshot.docs.map((doc) => doc.data());
};

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

export const deleteChatSession = async (
  uid: string,
  sessionId: string
) => {
  await deleteDoc(
    doc(db, "users", uid, "chatSessions", sessionId)
  );
};

export const updateChatTitle = async (
  uid: string,
  sessionId: string,
  title: string
) => {
  await updateDoc(
    doc(db, "users", uid, "chatSessions", sessionId),
    { title }
  );
};
