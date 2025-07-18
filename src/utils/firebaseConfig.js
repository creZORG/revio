// src/utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions'; // Removed connectFunctionsEmulator import as it's no longer used

const firebaseConfig = {
  apiKey: "AIzaSyAwP2YVy_Z2y4fJ52tWyZsvnyya2HAMnHk",
  authDomain: "naksyetu-9c648.firebaseapp.com",
  projectId: "naksyetu-9c648",
  storageBucket: "naksyetu-9c648.firebasestorage.app",
  messagingSenderId: "147113503727",
  appId: "1:147113503727:web:1d9d351c30399b2970241a",
  measurementId: "G-6DTTXJ859H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig); 

// Initialize services that your frontend will interact with
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// REMOVED: The entire if (import.meta.env.DEV) block.
// This ensures your app always connects to the live Firebase project.