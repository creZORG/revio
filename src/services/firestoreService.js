// src/services/firestoreService.js
import { db } from '../utils/firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// CRITICAL FIX: Define the necessary constants directly here for frontend use
const FIREBASE_PROJECT_ID_FOR_COLLECTIONS = "naksyetu-9c648";
const FIREBASE_EVENTS_APP_ID = "1:147113503727:web:1d9d351c30399b2970241a";

// Define the base path segments for collections
// These must match the actual paths where your data resides in Firestore
const ORDERS_COLLECTION_NAME = 'orders';
const PAYMENTS_TRANSACTIONS_COLLECTION_NAME = 'payments';
const FIRESTORE_TICKETS_COLLECTION_NAME = 'tickets'; // This is the collection name for individual ticket docs

// Define the full path segments for the events collection (as seen in Firestore console)
const EVENTS_COLLECTION_PATH_SEGMENTS = ['artifacts', FIREBASE_EVENTS_APP_ID, 'public', 'data_for_app', 'events'];

// Define the base path segments for orders, payments, and tickets for use with doc() and collection()
// Example: doc(db, ...ORDERS_BASE_PATH_SEGMENTS, orderId)
const ORDERS_BASE_PATH_SEGMENTS = ['artifacts', FIREBASE_PROJECT_ID_FOR_COLLECTIONS, ORDERS_COLLECTION_NAME];
const PAYMENTS_BASE_PATH_SEGMENTS = ['artifacts', FIREBASE_PROJECT_ID_FOR_COLLECTIONS, PAYMENTS_TRANSACTIONS_COLLECTION_NAME];
const TICKETS_BASE_PATH_SEGMENTS = ['artifacts', FIREBASE_PROJECT_ID_FOR_COLLECTIONS, FIRESTORE_TICKETS_COLLECTION_NAME];


/**
 * Gets a DocumentReference for a specific document in a collection.
 * @param {Firestore} dbInstance - The Firestore database instance.
 * @param {string[]} segments - Array of path segments (e.g., ['users', userId, 'profile']).
 * @returns {DocumentReference}
 */
export const getDocRef = (dbInstance, ...segments) => {
    return doc(dbInstance, ...segments);
};

/**
 * Gets a CollectionReference for a specific collection.
 * @param {Firestore} dbInstance - The Firestore database instance.
 * @param {string[]} segments - Array of path segments (e.g., ['users', userId, 'favorites']).
 * @returns {CollectionReference}
 */
export const getCollectionRef = (dbInstance, ...segments) => {
    return collection(dbInstance, ...segments);
};

/**
 * Fetches a single document.
 * @param {CollectionReference} collectionRef - Reference to the collection.
 * @param {string} docId - ID of the document to fetch.
 * @returns {Promise<Object|null>} Document data or null if not found.
 */
export const getDocument = async (collectionRef, docId) => {
    try {
        const docSnap = await getDoc(doc(collectionRef, docId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting document:", error);
        throw error;
    }
};

/**
 * Sets (creates or overwrites) a document.
 * @param {CollectionReference} collectionRef - Reference to the collection.
 * @param {string} docId - ID of the document to set.
 * @param {Object} data - Data to set.
 * @param {boolean} merge - Whether to merge with existing data.
 * @returns {Promise<void>}
 */
export const setDocument = async (collectionRef, docId, data, merge = false) => {
    try {
        await setDoc(doc(collectionRef, docId), data, { merge });
    } catch (error) {
        console.error("Error setting document:", error);
        throw error;
    }
};

/**
 * Updates an existing document.
 * @param {CollectionReference} collectionRef - Reference to the collection.
 * @param {string} docId - ID of the document to update.
 * @param {Object} data - Data to update.
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionRef, docId, data) => {
    try {
        await updateDoc(doc(collectionRef, docId), data);
    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
};

/**
 * Deletes a document.
 * @param {CollectionReference} collectionRef - Reference to the collection.
 * @param {string} docId - ID of the document to delete.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionRef, docId) => {
    try {
        await deleteDoc(doc(collectionRef, docId));
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
};

/**
 * Subscribes to real-time updates for a single document.
 * @param {DocumentReference} docRef - Reference to the document to listen to.
 * @param {function(Object|null): void} callback - Callback function for updates (receives data or null if doc doesn't exist).
 * @param {function(Error): void} errorCallback - Callback function for errors.
 * @returns {function(): void} Unsubscribe function.
 */
export const onDocumentSnapshot = (docRef, callback, errorCallback) => {
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        } else {
            callback(null); // Document doesn't exist
        }
    }, errorCallback);
};

/**
 * Subscribes to real-time updates for a collection query.
 * @param {Query} queryRef - Firestore Query object.
 * @param {function(Array<Object>): void} callback - Callback function for updates.
 * @param {function(Error): void} errorCallback - Callback function for errors.
 * @returns {function(): void} Unsubscribe function.
 */
export const onCollectionSnapshot = (queryRef, callback, errorCallback) => {
    return onSnapshot(queryRef, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((docSnap) => {
            data.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(data);
    }, errorCallback);
};

// --- Helper Functions for Specific Collections (using explicit segments) ---

// Exporting collection references directly for convenience
export const getOrdersCollectionRef = () => collection(db, ...ORDERS_BASE_PATH_SEGMENTS);
export const getPaymentsCollectionRef = () => collection(db, ...PAYMENTS_BASE_PATH_SEGMENTS);
export const getTicketsCollectionRef = () => collection(db, ...TICKETS_BASE_PATH_SEGMENTS);
export const getEventsCollectionRef = () => collection(db, ...EVENTS_BASE_PATH_SEGMENTS);


/**
 * Gets a query for an organizer's completed orders.
 * @param {string} organizerId - The ID of the organizer.
 * @returns {Query}
 */
export const getOrganizerCompletedOrdersQuery = (organizerId) => {
    return query(
        getOrdersCollectionRef(),
        where('organizerId', '==', organizerId),
        where('paymentStatus', '==', 'completed')
        // orderBy('createdAt', 'desc') // Add if you have an index and want ordering
    );
};

/**
 * Gets a query for an organizer's tickets (associated with their events).
 * @param {string} organizerId - The ID of the organizer.
 * @returns {Query}
 */
export const getOrganizerTicketsQuery = (organizerId) => {
    return query(
        getTicketsCollectionRef(),
        where('organizerId', '==', organizerId)
        // orderBy('generatedAt', 'desc') // Add if you have an index and want ordering
    );
};

/**
 * Gets a query for an organizer's events.
 * @param {string} organizerId - The ID of the organizer.
 * @returns {Query}
 */
export const getOrganizerEventsQuery = (organizerId) => {
    return query(
        getEventsCollectionRef(),
        where('organizerId', '==', organizerId),
        orderBy('createdAt', 'desc') // Order by creation date, newest first
    );
};


export { serverTimestamp, Timestamp };