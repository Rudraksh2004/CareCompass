import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC6WEcJPzr6nJnDOFB1e1anuAQR58-vtCA",
  authDomain: "carecompass-f6890.firebaseapp.com",
  projectId: "carecompass-f6890",
  storageBucket: "carecompass-f6890.firebasestorage.app",
  messagingSenderId: "709308990920",
  appId: "1:709308990920:web:72dfe006959a6d03042cfd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
