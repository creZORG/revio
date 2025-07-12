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
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

// Define the global __app_id variable as per Canvas guidelines
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Function to create a user document in Firestore
const createUserProfileDocument = async (user, displayName, email) => {
  if (!user || !user.uid) {
    console.error("Cannot create user profile: User object or UID is missing.");
    return;
  }

  // Path for private user data: /artifacts/{appId}/users/{userId}/profiles/{userId}
  const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);

  const userProfile = {
    uid: user.uid,
    email: email,
    displayName: displayName || email.split('@')[0], // Default display name
    role: 'user', // Default role for new signups
    createdAt: new Date(),
    // Add any other default profile fields here
  };

  try {
    await setDoc(userDocRef, userProfile, { merge: true }); // Use merge to avoid overwriting existing fields
    console.log("User profile created/updated in Firestore for UID:", user.uid);
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error.message);
    throw new Error("Failed to create user profile in database."); // Re-throw for calling component
  }
};


// Function to handle user signup
export const signupUser = async (email, password, displayName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Update user profile (e.g., display name) in Firebase Auth
    if (displayName) {
      await updateProfile(user, { displayName: displayName });
    }

    // Create user profile document in Firestore
    await createUserProfileDocument(user, displayName, email);

    // Send email verification
    await sendEmailVerification(user);
    console.log("Signup successful, verification email sent to:", email);
    return user;
  } catch (error) {
    console.error("Signup error:", error.message);
    throw error; // Re-throw to be caught by the calling component
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
    throw error; // Re-throw to be caught by the calling component
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