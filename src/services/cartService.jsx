// /src/services/cartService.js
import { db } from '../utils/firebaseConfig'; 
import { doc, getDoc, setDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore'; 

const APP_ID = "1:147113503727:web:1d9d351c30399b2970241a"; 

const getUserCartRef = (userId) => {
    if (!userId) {
        // Log a warning or throw a more specific error in a real app
        console.warn("cartService: getUserCartRef called with null or undefined userId.");
        // Return a dummy ref or throw to prevent crashes if user ID is genuinely missing
        return doc(db, "temp_carts/invalid_user"); 
    }
    return doc(db, `artifacts/${APP_ID}/users/${userId}/privateData/cart`);
};

export const getCart = async (userId) => {
    try {
        const cartRef = getUserCartRef(userId);
        const docSnap = await getDoc(cartRef);
        if (docSnap.exists()) {
            return docSnap.data().items || {}; 
        }
        return {}; 
    } catch (error) {
        console.error("cartService: Error getting cart:", error);
        return {};
    }
};

export const updateCart = async (userId, cartItems) => {
    try {
        const cartRef = getUserCartRef(userId);
        const cartDataToSet = {};
        let hasItems = false;

        for (const ticketId in cartItems) {
            if (cartItems[ticketId] > 0) {
                cartDataToSet[ticketId] = cartItems[ticketId];
                hasItems = true;
            } else {
                // If quantity is 0, explicitly delete the field in Firestore
                cartDataToSet[ticketId] = deleteField();
            }
        }

        if (hasItems) {
            await setDoc(cartRef, { items: cartDataToSet, updatedAt: new Date() }, { merge: true });
        } else {
            // If no items are left after update, clear the 'items' map entirely
            await setDoc(cartRef, { items: {}, updatedAt: new Date() });
        }
        
        // CORRECTED: Use console.log for JavaScript, remove PHP syntax
        console.log(`cartService: Cart updated in Firestore for user: ${userId}. Items: ${JSON.stringify(cartItems)}`); 
        return true;
    } catch (error) {
        console.error("cartService: Error updating cart:", error);
        throw new Error("Failed to update cart in database.");
    }
};

export const clearUserCart = async (userId) => {
    try {
        const cartRef = getUserCartRef(userId);
        // Set 'items' to an empty map to explicitly clear it
        await setDoc(cartRef, { items: {}, updatedAt: new Date() }); 
        // CORRECTED: Use console.log for JavaScript
        console.log(`cartService: Cart cleared in Firestore for user: ${userId}`); 
        return true;
    } catch (error) {
        console.error("cartService: Error clearing cart:", error);
        if (error.code === 'not-found') {
            return true; 
        }
        throw new Error("Failed to clear cart in database.");
    }
};

export const subscribeToCart = (userId, callback) => {
    if (!userId) {
        console.warn("cartService: Cannot subscribe to cart: userId is null or undefined.");
        // Return no-op unsubscribe function
        return () => {}; 
    }
    const cartRef = getUserCartRef(userId);
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().items || {});
        } else {
            callback({}); 
        }
    }, (error) => {
        console.error("cartService: Error subscribing to cart:", error);
        // Optionally notify user about real-time sync issues
    });
    return unsubscribe; 
};