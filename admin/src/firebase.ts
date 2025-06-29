import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2i2yVE-pX74HYihUMHWZajEMmlKGPBDc",
  authDomain: "cypherock-server.firebaseapp.com",
  projectId: "cypherock-server",
  storageBucket: "cypherock-server.firebasestorage.app",
  messagingSenderId: "732921379415",
  appId: "1:732921379415:web:035ac28931a43213f5c112",
  measurementId: "G-4KNK9X7MDF"
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