// src/services/userService.js
import { db } from '../utils/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const usersCollection = collection(db, 'users'); // Assuming your user profiles are in a 'users' collection

export const getUserByUsername = async (username) => {
  if (!username) {
    return null;
  }
  try {
    const q = query(usersCollection, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Assuming usernames are unique, return the first match
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null; // No user found with that username
  } catch (e) {
    console.error("Error fetching user by username: ", e);
    throw e;
  }
};

// TODO: Add other user-related service functions as needed