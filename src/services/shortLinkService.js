// src/services/shortLinkService.js
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const shortLinksCollection = collection(db, 'shortLinks');

export const createShortLink = async (linkData, organizerId) => {
  try {
    if (!organizerId || !linkData.eventId || !linkData.customPath || !linkData.targetUrl) {
      throw new Error("Missing required short link fields.");
    }

    // TODO: Implement logic to check if customPath is unique globally
    const existingLinkQuery = query(shortLinksCollection, where("customPath", "==", linkData.customPath));
    const existingLinkSnapshot = await getDocs(existingLinkQuery);
    if (!existingLinkSnapshot.empty) {
      throw new Error(`Custom path '${linkData.customPath}' is already in use. Please choose another.`);
    }

    const docRef = await addDoc(shortLinksCollection, {
      ...linkData,
      organizerId: organizerId,
      clicks: 0, // Initialize clicks
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Short link created with ID: ", docRef.id);
    return { id: docRef.id, ...linkData };
  } catch (e) {
    console.error("Error adding short link: ", e);
    throw e;
  }
};

export const getOrganizerShortLinks = async (organizerId) => {
  if (!organizerId) {
    return [];
  }
  try {
    const q = query(shortLinksCollection, where("organizerId", "==", organizerId));
    const querySnapshot = await getDocs(q);
    const links = [];
    querySnapshot.forEach((doc) => {
      links.push({ id: doc.id, ...doc.data() });
    });
    return links;
  } catch (e) {
    console.error("Error fetching organizer short links: ", e);
    throw e;
  }
};

// TODO: Add functions for updateShortLink, getShortLinkByPath (for Cloud Function), incrementClicks, etc.