import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Analytics
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export async function checkAuth(token: string): Promise<any> {
  const docId = Date.now().toString() + Math.random().toString(36).slice(2);
  await setDoc(doc(collection(db, 'auth_check_requests'), docId), { token });

  let response;
  while (!response) {
    const resDoc = await getDoc(doc(collection(db, 'auth_check_responses'), docId));
    if (resDoc.exists()) response = resDoc.data();
    else await new Promise(r => setTimeout(r, 500));
  }
  return response;
} 