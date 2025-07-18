// /src/components/Events/EventList.jsx
import React, { useEffect, useState } from 'react';
import EventCard from './EventCard.jsx';
import LoadingSkeleton from '../Common/LoadingSkeleton.jsx'; // Assuming this path is correct
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Assuming this path is correct

import { db } from '../../utils/firebaseConfig.js'; // Import db
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions

import styles from './Events.module.css'; // Assuming common styles for EventList wrapper

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Your Firebase App ID

// This component now fetches its own events based on props
const EventList = ({ category, timeFilter, ageFilter, searchQuery, locationFilter }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                let eventsRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
                let q = query(eventsRef, where("status", "==", "active")); // CORRECTED: Filter for active events

                // Apply other filters from props
                if (category && category !== 'all') {
                    q = query(q, where("category", "==", category));
                }
                if (locationFilter && locationFilter !== 'All') {
                    q = query(q, where("location", "==", locationFilter));
                }
                // Implement timeFilter, ageFilter, searchQuery client-side if not supported by simple Firestore queries
                // For simplicity, client-side filtering below for search.

                const querySnapshot = await getDocs(q);
                let fetchedEvents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert Firestore Timestamps to Date objects if necessary
                    startDate: doc.data().startDate?.toDate ? doc.data().startDate.toDate() : doc.data().startDate,
                    endDate: doc.data().endDate?.toDate ? doc.data().endDate.toDate() : doc.data().endDate,
                }));

                // Client-side filtering for searchQuery (if not done by Firestore query)
                if (searchQuery) {
                    const lowerCaseSearchQuery = searchQuery.toLowerCase();
                    fetchedEvents = fetchedEvents.filter(event => 
                        event.eventName.toLowerCase().includes(lowerCaseSearchQuery) ||
                        event.description?.toLowerCase().includes(lowerCaseSearchQuery) ||
                        event.organizerName?.toLowerCase().includes(lowerCaseSearchQuery)
                    );
                }

                // Client-side filtering for timeFilter and ageFilter (if not done by Firestore query)
                // Add more complex filtering logic here if needed.
                
                setEvents(fetchedEvents);

            } catch (err) {
                console.error("Error fetching events:", err);
                setError(err);
                showNotification('Failed to load events. Please check your internet connection or Firebase rules.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [category, locationFilter, searchQuery, timeFilter, ageFilter, showNotification]); // Re-fetch on filter changes

    if (loading) {
        return (
            <div className={styles.eventListGrid}>
                {[...Array(6)].map((_, i) => ( 
                    <LoadingSkeleton key={i} width="100%" height="250px" style={{ borderRadius: '15px' }} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                <p>Error loading events: {error.message || 'Please check your internet connection or Firebase rules.'}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <p className={styles.noResultsMessage}>No active events found matching your criteria.</p>
        );
    }

    return (
        <div className={styles.eventListGrid}>
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
};

export default EventList;