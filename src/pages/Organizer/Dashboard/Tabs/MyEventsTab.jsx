import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
// CRITICAL FIX: Import getOrganizerEventsQuery
import { getOrganizerEventsQuery, onCollectionSnapshot } from '../../../../services/firestoreService.js';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp directly from firebase/firestore
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';

import styles from './MyEventsTab.module.css';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

const MyEventsTab = ({ organizerId }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [myEvents, setMyEvents] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || !organizerId) {
            setLoading(false);
            return () => {};
        }

        setLoading(true);
        setError(null);

        // CRITICAL FIX: Use the correct query function for organizer's events
        const q = getOrganizerEventsQuery(organizerId);

        const unsubscribe = onCollectionSnapshot(
            q,
            (events) => {
                console.log("MyEventsTab: Real-time events update:", events);
                setMyEvents(events);
                setLoading(false);
            },
            (err) => {
                console.error("MyEventsTab: Error listening to events:", err);
                setError("Failed to load your events. Please try again.");
                showNotification("Failed to load your events.", "error");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isAuthenticated, organizerId, showNotification]);

    if (authLoading || loading) {
        return (
            <div className={styles.myEventsContainer}>
                <LoadingSkeleton count={3} />
                <p className={styles.loadingMessage}>Loading your events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.myEventsContainer}>
                <p className={styles.errorMessage}>{error}</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.myEventsContainer}>
                <p className={styles.errorMessage}>Please log in to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className={styles.myEventsContainer}>
            <h1 className={styles.header}>My Events</h1>

            {myEvents.length === 0 ? (
                <p className={styles.noEventsMessage}>You haven't created any events yet.</p>
            ) : (
                <ul className={styles.eventList}>
                    {myEvents.map(event => (
                        <li key={event.id} className={styles.eventItem}>
                            <div className={styles.eventThumbnailWrapper}>
                                {event.bannerImageUrl && (
                                    <img src={event.bannerImageUrl} alt={event.eventName} className={styles.eventThumbnail} />
                                )}
                            </div>
                            <div className={styles.eventDetails}>
                                <h3 className={styles.eventName}>{event.eventName}</h3>
                                <p className={styles.eventMeta}>
                                    <FaCalendarAlt /> {event.startDate ? format(event.startDate instanceof Timestamp ? event.startDate.toDate() : event.startDate, 'MMM d, yyyy') : 'N/A'} at {event.startTime || 'N/A'}
                                </p>
                                <p className={styles.eventMeta}>
                                    <FaMapMarkerAlt /> {event.mainLocation || 'Online'}
                                </p>
                                <p className={styles.eventStatus}>Status: <span className={styles[event.status]}>{event.status}</span></p>
                            </div>
                            <div className={styles.eventActions}>
                                <button className={styles.actionButton}>
                                    <FaEye /> View Details
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyEventsTab;