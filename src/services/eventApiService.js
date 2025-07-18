// src/services/eventApiService.js
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Define references for both potential event collections
const rootEventsCollectionRef = collection(db, 'events'); // Root level 'events' collection
const nestedEventsCollectionRef = collection(db, 'artifacts', '1:147113503727:web:1d9d351c30399b2970241a', 'public', 'data_for_app', 'events'); 

// Helper to convert Firestore Timestamp to JS Date (needed for fetched data)
const toJSDate = (firestoreTimestampOrDateValue) => {
  if (!firestoreTimestampOrDateValue) return null;
  if (firestoreTimestampOrDateValue instanceof Date) return firestoreTimestampOrDateValue;
  if (typeof firestoreTimestampOrDateValue.toDate === 'function') {
    return firestoreTimestampOrDateValue.toDate();
  }
  if (typeof firestoreTimestampOrDateValue === 'object' && firestoreTimestampOrDateValue.seconds !== undefined && firestoreTimestampOrDateValue.nanoseconds !== undefined) {
    return new Date(firestoreTimestampOrDateValue.seconds * 1000 + firestoreTimestampOrDateValue.nanoseconds / 1000000);
  }
  if (typeof firestoreTimestampOrDateValue === 'string' || typeof firestoreTimestampOrDateValue === 'number') {
    const date = new Date(firestoreTimestampOrDateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};


export const createEvent = async (eventData) => {
  try {
    // FIX: Choose which collection to add to, or add to both if desired.
    // Assuming new events should primarily go into the nested collection as per previous context
    // If you need to write to BOTH, you'd perform two addDoc calls.
    const docRef = await addDoc(nestedEventsCollectionRef, { 
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      pageViews: 0,
      adminPriority: 5,
      status: eventData.status || 'pending_review'
    });
    console.log("Event created with ID: ", docRef.id);
    return { id: docRef.id, ...eventData };
  } catch (e) {
    console.error("Error adding event: ", e);
    throw e;
  }
};

export const getEventById = async (id) => {
  try {
    // Attempt to get from nested collection first, then root if not found
    let docRef = doc(nestedEventsCollectionRef, id); 
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      docRef = doc(rootEventsCollectionRef, id); // Try root collection
      docSnap = await getDoc(docRef);
    }
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        startDate: toJSDate(data.startDate),
        endDate: toJSDate(data.endDate),
        ticketTypes: data.ticketTypes?.map(ticket => ({
          ...ticket,
          salesStartDate: toJSDate(ticket.salesStartDate),
          salesEndDate: toJSDate(ticket.salesEndDate),
        })) ?? [],
        rsvpConfig: data.rsvpConfig ? {
          ...data.rsvpConfig,
          rsvpStartDate: toJSDate(data.rsvpConfig.rsvpStartDate),
          rsvpEndDate: toJSDate(data.rsvpConfig.rsvpEndDate),
        } : {},
      };
    } else {
      console.log("No such event document found in either collection!");
      return null;
    }
  } catch (e) {
    console.error("Error getting event by ID: ", e);
    throw e;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    // Determine which collection the event belongs to (by trying to get it first)
    let eventRef = doc(nestedEventsCollectionRef, id); 
    let docSnap = await getDoc(eventRef);

    if (!docSnap.exists()) { // If not in nested, assume it's in root
      eventRef = doc(rootEventsCollectionRef, id);
      docSnap = await getDoc(eventRef);
    }

    if (docSnap.exists()) {
      await updateDoc(eventRef, {
        ...eventData,
        updatedAt: serverTimestamp()
      });
      console.log("Event updated: ", id);
    } else {
        throw new Error("Event not found in any collection to update.");
    }
  } catch (e) {
    console.error("Error updating event: ", e);
    throw e;
  }
};

// FIX: Modified to fetch events from BOTH collections and combine them
export const getOrganizerEvents = async (organizerId) => {
  if (!organizerId) {
    console.warn("Organizer ID is required to fetch events.");
    return [];
  }
  try {
    const allEvents = new Map(); // Use a Map to store unique events by ID and prevent duplicates

    // 1. Fetch from the nested collection
    const q1 = query(nestedEventsCollectionRef, where("organizerId", "==", organizerId));
    const snapshot1 = await getDocs(q1);
    snapshot1.forEach((doc) => {
      const data = doc.data();
      allEvents.set(doc.id, {
        id: doc.id,
        ...data,
        startDate: toJSDate(data.startDate),
        endDate: toJSDate(data.endDate),
        ticketTypes: data.ticketTypes?.map(ticket => ({
          ...ticket, salesStartDate: toJSDate(ticket.salesStartDate), salesEndDate: toJSDate(ticket.salesEndDate),
        })) ?? [],
        rsvpConfig: data.rsvpConfig ? {
          ...data.rsvpConfig, rsvpStartDate: toJSDate(data.rsvpConfig.rsvpStartDate), rsvpEndDate: toJSDate(data.rsvpConfig.rsvpEndDate),
        } : {},
      });
    });

    // 2. Fetch from the root 'events' collection
    const q2 = query(rootEventsCollectionRef, where("organizerId", "==", organizerId));
    const snapshot2 = await getDocs(q2);
    snapshot2.forEach((doc) => {
      // Add or update if it's a newer version or not already present
      if (!allEvents.has(doc.id)) { // Only add if not already found in the nested collection
        const data = doc.data();
        allEvents.set(doc.id, {
          id: doc.id,
          ...data,
          startDate: toJSDate(data.startDate),
          endDate: toJSDate(data.endDate),
          ticketTypes: data.ticketTypes?.map(ticket => ({
            ...ticket, salesStartDate: toJSDate(ticket.salesStartDate), salesEndDate: toJSDate(ticket.salesEndDate),
          })) ?? [],
          rsvpConfig: data.rsvpConfig ? {
            ...data.rsvpConfig, rsvpStartDate: toJSDate(data.rsvpConfig.rsvpStartDate), rsvpEndDate: toJSDate(data.rsvpConfig.rsvpEndDate),
          } : {},
        });
      }
    });

    return Array.from(allEvents.values()); // Convert Map values back to an array
  } catch (e) {
    console.error("Error fetching organizer events from multiple collections: ", e);
    throw e;
  }
};

export const updateEventStatus = async (eventId, newStatus) => {
  if (!eventId || !newStatus) {
    throw new Error("Event ID and new status are required.");
  }
  try {
    // Determine which collection the event belongs to (by trying to get it first)
    let eventRef = doc(nestedEventsCollectionRef, eventId);
    let docSnap = await getDoc(eventRef);

    if (!docSnap.exists()) { // If not in nested, assume it's in root
      eventRef = doc(rootEventsCollectionRef, eventId);
      docSnap = await getDoc(eventRef);
    }

    if (docSnap.exists()) {
      await updateDoc(eventRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      console.log(`Event ${eventId} status updated to: ${newStatus}`);
    } else {
        throw new Error("Event not found in any collection to update status.");
    }
  } catch (e) {
    console.error(`Error updating event status for ${eventId}: `, e);
    throw e;
  }
};

export const deleteEvent = async (id) => {
  try {
    // Determine which collection the event belongs to (by trying to get it first)
    let eventRef = doc(nestedEventsCollectionRef, id); 
    let docSnap = await getDoc(eventRef);

    if (!docSnap.exists()) { // If not in nested, assume it's in root
      eventRef = doc(rootEventsCollectionRef, id);
      docSnap = await getDoc(eventRef);
    }

    if (docSnap.exists()) {
        await deleteDoc(eventRef);
        console.log("Event deleted: ", id);
    } else {
        throw new Error("Event not found in any collection to delete.");
    }
  } catch (e) {
    console.error("Error deleting event: ", e);
    throw e;
  }
};