
// Fix: Use direct modular package imports to ensure named exports are recognized
import { initializeApp, getApp, getApps } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAuj6-4VFwXbT6hSCVwvnVKRR0nRSx7QA",
  authDomain: "newsvortex-d8d8f.firebaseapp.com",
  projectId: "newsvortex-d8d8f",
  storageBucket: "newsvortex-d8d8f.firebasestorage.app",
  messagingSenderId: "740682839222",
  appId: "1:740682839222:web:3027ce98b195cb6724a217",
  measurementId: "G-6QLY8D4GZ8"
};

// Initialize Firebase App as a singleton using the Modular SDK pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore and export the service reference via the modular getter
export const db = getFirestore(app);
