import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import EventCard from './EventCard.jsx';
import LoadingSkeleton from '../Common/LoadingSkeleton.jsx';
import { FaArrowRight } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

import styles from './Events.module.css'; // Import the CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

// Universal Date Conversion Helper
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

  // FIX: Separate events into Naks Yetu Ticketed and Other Events
  const naksYetuTicketedEvents = events.filter(e => e.eventType === 'ticketed' && (e.isNaksYetuTicketed || true)); // Assuming isNaksYetuTicketed is true for created ticketed events
  const otherExcitingEvents = events.filter(e => e.eventType !== 'ticketed' || !e.isNaksYetuTicketed); // All others

  // FIX: Ad card only for Other Exciting Events
  const finalOtherExcitingEvents = [...otherExcitingEvents];
  if (finalOtherExcitingEvents.length > 0) {
    // Insert ad card at a reasonable position, e.g., after the first few events
    finalOtherExcitingEvents.splice(1, 0, { // Insert after the first event
      id: 'ad-promo', type: 'ad', eventName: 'Promote Your Event!', description: 'Reach thousands of Naks Yetu users.', bannerImageUrl: "https://placehold.co/300x400/A0522D/FFFFFF?text=Your+Ad+Here",
      meta: 'Reach thousands of Naks Yetu users.', buttonText: 'Learn More', buttonClass: 'btn-primary'
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
              {naksYetuTicketedEvents.length === 0 ? (
                <div className="profile-section-card" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                  <p className="text-naks-text-secondary">No Naks Yetu Ticketed Events found.</p>
                </div>
              ) : (
                naksYetuTicketedEvents.map((event, index) => (
                    <EventCard key={event.id || index} event={event} />
                ))
              )}
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
              {finalOtherExcitingEvents.length === 0 ? (
                <div className="profile-section-card" style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                  <p className="text-naks-text-secondary">No other exciting events found.</p>
                </div>
              ) : (
                finalOtherExcitingEvents.map((event, index) => (
                    <EventCard key={event.id || index} event={event} />
                ))
              )}
          </div>
      </section>
    </>
  );
};

export default EventList;