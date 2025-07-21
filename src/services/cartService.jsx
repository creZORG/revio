// src/services/cartService.jsx
import { db } from '../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';

const FIREBASE_PROJECT_ID = "naksyetu-9c648"; // Ensure this matches your project ID
const USERS_COLLECTION_PATH = `artifacts/${FIREBASE_PROJECT_ID}/users`;

/**
 * Gets a reference to the user's cart document.
 * @param {string} userId The ID of the user.
 * @returns {DocumentReference}
 */
const getUserCartRef = (userId) => {
  return doc(db, USERS_COLLECTION_PATH, userId, 'private', 'cart');
};

/**
 * Fetches the current state of the user's cart.
 * @param {string} userId The ID of the user.
 * @returns {Promise<Object>} The cart items object.
 */
export const getCart = async (userId) => {
  try {
    const cartDocRef = getUserCartRef(userId);
    const cartSnapshot = await getDoc(cartDocRef);
    const cartData = cartSnapshot.exists() ? cartSnapshot.data() : {};
    console.log(`cartService: Fetched cart for user ${userId}:`, cartData);
    return cartData;
  } catch (error) {
    console.error(`cartService: Error fetching cart for user ${userId}:`, error);
    return {};
  }
};

/**
 * Updates the user's cart with new items or quantities.
 * This function expects an object where keys are ticket IDs and values are the full ticket objects
 * (e.g., { ticketId: { id: 'ticket_1', name: 'Entry', quantity: 2, price: 1000, ... } }).
 * To remove an item, set its value to `deleteField()`.
 * @param {string} userId The ID of the user.
 * @param {Object} itemsToUpdate An object containing ticket IDs and their updated data or `deleteField()`.
 * @returns {Promise<void>}
 */
export const updateCart = async (userId, itemsToUpdate) => {
  try {
    const cartDocRef = getUserCartRef(userId);
    // Use setDoc with merge: true for partial updates or adding new fields (tickets)
    // This ensures existing fields (other tickets) are not overwritten
    await setDoc(cartDocRef, itemsToUpdate, { merge: true });
    console.log(`cartService: Cart updated in Firestore for user: ${userId}. Items:`, JSON.stringify(itemsToUpdate));
  } catch (error) {
    console.error(`cartService: Error updating cart for user ${userId}:`, error);
    throw error; // Re-throw to allow calling component to handle
  }
};

/**
 * Clears the user's entire cart.
 * @param {string} userId The ID of the user.
 * @returns {Promise<void>}
 */
export const clearUserCart = async (userId) => {
  try {
    const cartDocRef = getUserCartRef(userId);
    // Setting an empty object with merge: false effectively overwrites the entire document
    // or you can use deleteDoc if you want to remove the document entirely.
    // For clearing, `setDoc({}, { merge: false })` is safer than `deleteDoc` if you want to keep the document existing.
    await setDoc(cartDocRef, {}); // Overwrite with an empty object to clear
    console.log(`cartService: Cart cleared for user: ${userId}`);
  } catch (error) {
    console.error(`cartService: Error clearing cart for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Subscribes to real-time updates for the user's cart.
 * @param {string} userId The ID of the user.
 * @param {function(Object): void} callback Callback function to receive cart updates.
 * @returns {function(): void} An unsubscribe function.
 */
export const subscribeToCart = (userId, callback) => {
  const cartDocRef = getUserCartRef(userId);
  const unsubscribe = onSnapshot(cartDocRef, (snapshot) => {
    const cartData = snapshot.exists() ? snapshot.data() : {};
    console.log(`cartService: Real-time cart update received for user ${userId}:`, cartData);
    callback(cartData);
  }, (error) => {
    console.error(`cartService: Error subscribing to cart for user ${userId}:`, error);
    callback({}); // Pass empty cart on error
  });
  return unsubscribe;
};