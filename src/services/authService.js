// src/services/authService.js
import { auth } from '../utils/firebaseConfig.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { db } from '../utils/firebaseConfig.js'; // Import Firestore instance
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions

// Define the global __app_id variable as per Canvas guidelines
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Function to create a user document in Firestore
const createUserProfileDocument = async (user, displayName, email) => {
  if (!user || !user.uid) {
    console.error("Cannot create user profile: User object or UID is missing.");
    return;
  }

  // Use a more standard and simplified path for user profiles
  const userDocRef = doc(db, "users", user.uid);

  const userProfile = {
    uid: user.uid,
    email: email,
    displayName: displayName || email.split('@')[0], // Default display name
    role: 'user', // Default role for new signups
    createdAt: serverTimestamp(), // Use server timestamp for consistency
    photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}` // Add a default avatar
  };

  try {
    await setDoc(userDocRef, userProfile, { merge: true });
    console.log("User profile created/updated in Firestore for UID:", user.uid);
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error.message);
    throw new Error("Failed to create user profile in database.");
  }
};

// --- NEW --- Function to log platform activity
const logPlatformActivity = async (type, text) => {
    try {
        const activitiesRef = collection(db, 'platform_activities');
        await addDoc(activitiesRef, {
            type,
            text,
            timestamp: serverTimestamp()
        });
        console.log("Platform activity logged:", text);
    } catch (error) {
        console.error("Error logging platform activity:", error);
        // We don't re-throw here as logging is a non-critical background task
    }
};


// Function to handle user signup
export const signupUser = async (email, password, displayName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const finalDisplayName = displayName || email.split('@')[0];

    // Update user profile in Firebase Auth
    await updateProfile(user, { displayName: finalDisplayName });
    
    // Create user profile document in Firestore
    await createUserProfileDocument(user, finalDisplayName, email);
    
    // --- NEW --- Log this activity for the admin dashboard
    await logPlatformActivity('user', `New user <strong>${finalDisplayName}</strong> registered.`);

    // Send email verification
    await sendEmailVerification(user);
    console.log("Signup successful, verification email sent to:", email);
    return user;
  } catch (error) {
    console.error("Signup error:", error.message);
    throw error;
  }
};

// Function to handle user login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login successful for:", email);
    return user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};

// Function to handle user logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

// Add other auth related functions (e.g., password reset, social login) as needed