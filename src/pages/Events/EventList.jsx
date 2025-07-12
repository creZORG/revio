import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import EventCard from './EventCard.jsx';
import LoadingSkeleton from '../Common/LoadingSkeleton.jsx';
import { FaArrowRight } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

import styles from './Events.module.css'; // Import the CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

// FIX: Implement the robust toJSDate helper function
const toJSDate = (firestoreTimestampOrDateValue) => {
  if (!firestoreTimestampOrDateValue) return null;

  // If it's already a JavaScript Date object, return it.
  if (firestoreTimestampOrDateValue instanceof Date) {
    return firestoreTimestampOrDateValue;
  }
  // If it's a Firestore Timestamp object (check for .toDate() method)
  if (typeof firestoreTimestampOrDateValue.toDate === 'function') {
    return firestoreTimestampOrDateValue.toDate();
  }
  // If it's a plain object that looks like a Timestamp (e.g., { seconds: ..., nanoseconds: ... })
  if (typeof firestoreTimestampOrDateValue === 'object' && firestoreTimestampOrDateValue.seconds !== undefined && firestoreTimestampOrDateValue.nanoseconds !== undefined) {
    return new Date(firestoreTimestampOrDateValue.seconds * 1000 + firestoreTimestampOrDateValue.nanoseconds / 1000000);
  }
  // If it's a string or number, try to parse it into a Date
  if (typeof firestoreTimestampOrDateValue === 'string' || typeof firestoreTimestampOrDateValue === 'number') {
    const date = new Date(firestoreTimestampOrDateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  return null; // If none of the above, it's not a valid date format
};


const EventList = ({ category, timeFilter, ageFilter, searchQuery, locationFilter }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.log("DEBUG: EventList using appId:", appId);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        let eventsRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
        
        let q = query(eventsRef, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);
        // FIX: Use toJSDate helper for all date conversions
        let fetchedEvents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: toJSDate(data.startDate),
            endDate: toJSDate(data.endDate),
            ticketTypes: data.ticketTypes?.map(ticket => ({
              ...ticket,
              bookingStartDate: toJSDate(ticket.bookingStartDate),
              bookingEndDate: toJSDate(ticket.bookingEndDate),
            })) ?? [],
            rsvpConfig: data.rsvpConfig ? {
              ...data.rsvpConfig,
              rsvpStartDate: toJSDate(data.rsvpConfig.rsvpStartDate),
              rsvpEndDate: toJSDate(data.rsvpConfig.rsvpEndDate),
            } : {},
          };
        });

        console.log("DEBUG: All fetched events (after Timestamp conversion and before client-side filtering):", fetchedEvents);

        let filteredEvents = fetchedEvents;

        if (location.pathname === '/nightlife') {
            filteredEvents = filteredEvents.filter(event => event.category === 'Nightlife');
        } else {
            filteredEvents = filteredEvents.filter(event => event.category !== 'Nightlife');
        }

        if (category && category !== 'all' && category !== 'Nightlife') {
          filteredEvents = filteredEvents.filter(event => event.category === category);
        }

        if (locationFilter) {
          filteredEvents = filteredEvents.filter(event => event.mainLocation === locationFilter);
        }

        if (searchQuery) {
          filteredEvents = filteredEvents.filter(event =>
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (ageFilter && ageFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event =>
                event.selectedAgeCategories && event.selectedAgeCategories.includes(ageFilter)
            );
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        if (timeFilter === 'today') {
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = event.startDate;
                return eventDate && eventDate instanceof Date && eventDate >= todayStart && eventDate < todayEnd;
            });
        }

        filteredEvents.sort((a, b) => {
            const priorityA = a.adminPriority || 0;
            const priorityB = b.adminPriority || 0;
            if (priorityA !== priorityB) { return priorityB - priorityA; }
            return Math.random() - 0.5;
        });

        setEvents(filteredEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category, timeFilter, ageFilter, searchQuery, locationFilter, location.pathname]);


  if (loading) {
    return (
      <div className={styles.eventCardsGrid}>
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className={styles.eventCard}>
            <LoadingSkeleton width="100%" height="200px" className="mb-2" />
            <div style={{padding: '12px'}}>
              <LoadingSkeleton width="80%" height="20px" className="mb-1" />
              <LoadingSkeleton width="60%" height="16px" className="mb-1" />
              <LoadingSkeleton width="90%" height="16px" className="mb-1" />
              <LoadingSkeleton width="50%" height="16px" className="mb-4" />
              <LoadingSkeleton width="100%" height="30px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-box">
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="profile-section-card" style={{textAlign: 'center', padding: '20px'}}>
        <p className="text-naks-text-secondary">No events found matching your criteria.</p>
        <p className="text-naks-text-secondary">Try adjusting your filters.</p>
      </div>
    );
  }

  const ticketedEventsDisplay = events.filter(e => e.eventType === 'ticketed' || e.eventType === 'online');
  const otherEventsDisplay = events.filter(e => e.eventType === 'free' || e.eventType === 'rsvp');

  const finalTicketedEvents = [...ticketedEventsDisplay];
  if (finalTicketedEvents.length > 0) {
    finalTicketedEvents.splice(0, 0, {
      id: 'ad-promo', type: 'ad', title: 'Promote Your Event!', meta: 'Reach thousands of Naks Yetu users.', image: "https://placehold.co/300x400/A0522D/FFFFFF?text=Your+Ad+Here", buttonText: 'Learn More', buttonClass: 'btn-primary'
    });
  }


  return (
    <>
      {/* Naks Yetu Ticketed Events Section */}
      <section className={styles.eventsSection}>
          <div className={styles.sectionHeader}>
              <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Naks Yetu Ticketed Events</h2>
              <p className={styles.sectionDescription}>Exclusive events requiring tickets, handpicked for you.</p>
              <Link to="/events/ticketed" className={styles.viewAllLink}>View All <FaArrowRight /></Link>
          </div>
          <div className={styles.eventCardsGrid}>
              {finalTicketedEvents.map((event, index) => (
                  <EventCard key={event.id || index} event={event} />
              ))}
          </div>
      </section>

      {/* Other Exciting Events in Nakuru Section */}
      <section className={styles.eventsSection}>
          <div className={styles.sectionHeader}>
              <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Other Exciting Events in Nakuru</h2>
              <p className={styles.sectionDescription}>Free, RSVP, and community events happening soon.</p>
              <Link to="/events/other" className={styles.viewAllLink}>View All <FaArrowRight /></Link>
          </div>
          <div className={styles.eventCardsGrid}>
              {otherEventsDisplay.map((event, index) => (
                  <EventCard key={event.id || index} event={event} />
              ))}
          </div>
      </section>
    </>
  );
};

export default EventList;