import React, { createContext, useState, useEffect, useContext } from 'react';
// import { db } from '../utils/firebaseConfig'; // Will use Firestore later
// import { collection, getDocs } from 'firebase/firestore'; // Will use later

// FIX: Export EventContext so it can be imported as a named export
export const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        // Placeholder for fetching from Firestore
        // const querySnapshot = await getDocs(collection(db, "events"));
        // const fetchedEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const dummyEvents = [
            { id: 'e1', title: 'Summer Music Fest', date: '2025-08-15', location: 'Park Lane', type: 'ticketed' },
            { id: 'e2', title: 'Community Cookout', date: '2025-07-20', location: 'Central Green', type: 'free' },
            { id: 'e3', title: 'Networking Mixer', date: '2025-09-01', location: 'Rooftop Bar', type: 'rsvp' },
        ];
        setEvents(dummyEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const value = {
    events,
    loading,
    error,
    // addEvent, updateEvent, deleteEvent (will add later)
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  return useContext(EventContext);
};