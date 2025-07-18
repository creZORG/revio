// src/pages/home/EventList.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { db } from '../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import EventCard from './EventCard.jsx'; // Correct import: EventCard from src/pages/home/
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';
import { FaArrowRight } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

import styles from './EventList.module.css'; // Dedicated CSS for EventList

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

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; 

const EventList = ({ category, timeFilter, ageFilter, searchQuery, locationFilter }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Wrap the async fetch function in useCallback to stabilize its reference
  const fetchAndFilterEvents = useCallback(async () => {
    console.log("DEBUG: fetchAndFilterEvents CALLED with dependencies:", { category, timeFilter, ageFilter, searchQuery, locationFilter, pathname: location.pathname }); // More detailed debug
    setLoading(true);
    setError(null);
    try {
      // Ensure 'db' is correctly initialized in firebaseConfig.js
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
            salesStartDate: toJSDate(ticket.salesStartDate),
            salesEndDate: toJSDate(ticket.salesEndDate),
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

      // --- Apply Client-Side Filters based on HomePage props ---

      if (location.pathname === '/nightlife') {
            filteredEvents = filteredEvents.filter(event => event.category === 'Nightlife');
      } else {
            filteredEvents = filteredEvents.filter(event => event.category !== 'Nightlife'); 
      }

      if (searchQuery) {
        filteredEvents = filteredEvents.filter(event => {
          const eventName = event.eventName ?? '';
          const eventDescription = event.description ?? '';
          return eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 eventDescription.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }

      if (category && category !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category?.toLowerCase() === category.toLowerCase());
      }

      if (locationFilter && locationFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.mainLocation?.toLowerCase().includes(locationFilter.toLowerCase()));
      }

      if (ageFilter && ageFilter !== 'all-ages') {
          filteredEvents = filteredEvents.filter(event => event.targetAge?.toLowerCase() === ageFilter.toLowerCase());
      }

      if (timeFilter && timeFilter !== 'all-time') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const startOfThisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); 
        const endOfThisWeek = new Date(startOfThisWeek.getFullYear(), startOfThisWeek.getMonth(), startOfThisWeek.getDate() + 6, 23, 59, 59, 999); 
        const startOfNextWeek = new Date(endOfThisWeek.getFullYear(), endOfThisWeek.getMonth(), endOfThisWeek.getDate() + 1);
        const endOfNextWeek = new Date(startOfNextWeek.getFullYear(), startOfNextWeek.getMonth(), startOfNextWeek.getDate() + 6, 23, 59, 59, 999);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); 
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);

        filteredEvents = filteredEvents.filter(event => {
            const eventDate = event.startDate;
            if (!eventDate || !(eventDate instanceof Date)) return false;

            if (timeFilter === 'today') return eventDate.toDateString() === today.toDateString();
            if (timeFilter === 'tomorrow') return eventDate.toDateString() === tomorrow.toDateString();
            if (timeFilter === 'this-week') return eventDate >= today && eventDate <= endOfThisWeek;
            if (timeFilter === 'next-week') return eventDate >= startOfNextWeek && eventDate <= endOfNextWeek;
            if (timeFilter === 'this-month') return eventDate >= startOfThisMonth && eventDate <= endOfThisMonth;
            if (timeFilter === 'next-month') return eventDate >= startOfNextMonth && eventDate <= endOfNextMonth;
            
            return true;
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
  }, [category, timeFilter, ageFilter, searchQuery, locationFilter, location.pathname, db]); // db is a dependency if used inside useCallback

  useEffect(() => {
    // Only call fetchAndFilterEvents when its memoized dependencies change
    fetchAndFilterEvents();
  }, [fetchAndFilterEvents]); // Depend only on the memoized function


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
      <div className={styles.errorMessage}> 
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.noEventsFound}> 
        <p>No events found matching your criteria.</p>
        <p>Try adjusting your filters.</p>
      </div>
    );
  }

  const naksYetuTicketedEvents = events.filter(e => e.isTicketed || e.isOnlineEvent); 
  const otherExcitingEvents = events.filter(e => e.isFreeEvent || e.isRsvp);

  const finalOtherExcitingEvents = [...otherExcitingEvents];
  if (finalOtherExcitingEvents.length > 0) {
    finalOtherExcitingEvents.splice(1, 0, { 
      id: 'ad-promo-other', type: 'ad', eventName: 'Promote Your Event!', description: 'Reach thousands of Naks Yetu users.', bannerImageUrl: "https://placehold.co/300x400/A0522D/FFFFFF?text=Your+Ad+Here",
      meta: 'Reach thousands of Naks Yetu users.', buttonText: 'Learn More', buttonClass: 'btn-primary'
    });
  }


  return (
    <>
      {naksYetuTicketedEvents.length > 0 && (
          <section className={styles.eventsSection}> 
              <div className={styles.sectionHeader}> 
                  <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}></h2>
               
              </div>
              <div className={styles.eventCardsGrid}> 
                  {naksYetuTicketedEvents.map((event, index) => (
                      <EventCard key={event.id || index} event={event} />
                  ))}
              </div>
          </section>
      )}

      {finalOtherExcitingEvents.length > 0 && (
          <section className={styles.eventsSection}> 
              <div className={styles.sectionHeader}> 
                  <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>Other Exciting Events in Nakuru</h2>
                  <p className={styles.sectionDescription}>Free, RSVP, and community events happening soon.</p>
                  <Link to="/events/other" className={styles.viewAllLink}>View All <FaArrowRight /></Link> 
              </div>
              <div className={styles.eventCardsGrid}> 
                  {finalOtherExcitingEvents.map((event, index) => (
                      <EventCard key={event.id || index} event={event} />
                  ))}
              </div>
          </section>
      )}
    </>
  );
};

export default EventList;