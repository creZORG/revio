import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart, FaRegHeart, FaLaptopCode } from 'react-icons/fa';
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';

import styles from './Events.module.css'; // Import the CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcode appId for consistency

const EventCard = ({ event }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [isSaved, setIsSaved] = useState(false);

  // Check if event is saved on load
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && currentUser && event.id) {
        const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, event.id);
        const docSnap = await getDoc(savedEventRef);
        setIsSaved(docSnap.exists());
      }
    };
    checkSavedStatus();
  }, [isAuthenticated, currentUser, event.id]);

  // Handle save/unsave to Firestore
  const handleSaveToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault(); // Prevent default link behavior

    if (!isAuthenticated || !currentUser) {
      showNotification("Please log in to save events!", "info");
      return;
    }

    const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, event.id);

    try {
      if (isSaved) {
        await deleteDoc(savedEventRef);
        setIsSaved(false);
        showNotification(`'${event.eventName}' removed from favorites.`, "info");
        console.log(`Event ${event.eventName} unsaved.`);
      } else {
        await setDoc(savedEventRef, {
          eventId: event.id,
          eventName: event.eventName,
          bannerImageUrl: event.bannerImageUrl,
          startDate: event.startDate, // startDate is already a Date object here
          addedAt: Timestamp.now(), // Ensure addedAt is Timestamp
        });
        setIsSaved(true);
        showNotification(`'${event.eventName}' added to favorites!`, "success");
        console.log(`Event ${event.eventName} saved.`);
      }
    } catch (error) {
      console.error("Error saving/unsaving event:", error);
      showNotification("Failed to save/unsave event. Please try again.", "error");
    }
  };


  if (!event) {
    return (
      <div className={styles.eventCard} style={{backgroundColor: 'var(--naks-white-surface)'}}>
        <p style={{color: 'var(--naks-text-secondary)'}}>No event data available.</p>
      </div>
    );
  }

  // FIX: Directly use event.startDate and event.endDate (which are now guaranteed Date objects or null)
  const startDate = event.startDate instanceof Date ? event.startDate : null;
  const endDate = event.endDate instanceof Date ? event.endDate : null;

  const getFormattedDate = (date) => {
    if (!date) return 'N/A';
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return { dayOfWeek, day, month };
  };

  const formattedStartDate = getFormattedDate(startDate);

  const displayDateRange = startDate
    ? (endDate && startDate.toDateString() !== endDate.toDateString()
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : startDate.toLocaleDateString())
    : 'N/A';

  const displayLocation = event.specificAddress || event.mainLocation || 'N/A';

  // Online Event Type Display (max 15 words)
  let onlineEventTypeDisplay = '';
  if (event.eventType === 'online') {
    if (event.onlineEventType && event.onlineEventType.trim() !== '') {
      onlineEventTypeDisplay = event.onlineEventType.split(/\s+/).slice(0, 15).join(' ');
      if (onlineEventTypeDisplay.length > 0 && event.onlineEventType.split(/\s+/).length > 15) {
        onlineEventTypeDisplay += '...';
      }
    } else {
      onlineEventTypeDisplay = 'Online Event';
    }
  }

  const isAdCard = event.type === 'ad';

  // Calculate total tickets available for ticketed events
  const totalTicketsAvailable = event.ticketTypes
    ? event.ticketTypes.reduce((sum, type) => sum + (type.quantity || 0), 0)
    : 0;
  const ticketsLeft = totalTicketsAvailable - (event.ticketsSold || 0); // Assuming 'ticketsSold' field exists

  return (
    <Link to={`/events/${event.id}`} className={`${styles.eventCard} glassmorphism ${isAdCard ? styles.adCard : ''}`}>
      {/* Floating Calendar Card */}
      {!isAdCard && startDate && (
        <div className={styles.calendarCard}>
          <div className={styles.dayOfWeek}>{formattedStartDate.dayOfWeek}</div>
          <div className={styles.date}>{formattedStartDate.day}</div>
          <div className={styles.month}>{formattedStartDate.month}</div>
        </div>
      )}

      {/* Floating Save Button (Heart) */}
      {!isAdCard && (
        <button className={styles.saveButton} onClick={handleSaveToggle}>
          {isSaved ? <FaHeart className={styles.saved} /> : <FaRegHeart />}
        </button>
      )}

      {isAdCard && <span className={styles.adLabel}>AD</span>}
      <img
        src={event.bannerImageUrl || "https://placehold.co/300x400/E0E0E0/808080?text=No+Image"}
        alt={event.eventName || 'Event Image'}
        className={styles.eventCardImage}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/CCCCCC/000000?text=Image+Error'; }}
      />
      <div className={styles.eventCardContent}>
        <h3 className={styles.eventCardTitle}>{event.eventName || 'Event Title'}</h3>
        {/* Date Display */}
        {startDate && (
          <p className={styles.eventCardMeta}>
            <FaCalendarAlt /> {displayDateRange}
          </p>
        )}
        {/* Location Display */}
        {event.specificAddress && (
          <p className={styles.eventCardMeta}>
            <FaMapMarkerAlt /> {displayLocation}
          </p>
        )}
        {/* Online Event Type Display */}
        {event.eventType === 'online' && (
          <p className={styles.eventCardMeta}>
            <FaLaptopCode /> {onlineEventTypeDisplay}
          </p>
        )}

        {/* Price and Tickets Left Row */}
        {!isAdCard && (event.price || event.eventType === 'free' || event.eventType === 'rsvp') && (
            <div className={styles.ticketInfoRow}>
                {/* Price on bottom left */}
                {event.price && event.price > 0 ? (
                    <span className={styles.ticketPriceBottom}>
                        KES {event.price.toLocaleString()}
                    </span>
                ) : event.eventType === 'free' ? (
                    <span className={styles.ticketPriceBottom} style={{background: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset', color: 'var(--sys-success)'}}>FREE</span>
                ) : event.eventType === 'rsvp' ? (
                    <span className={styles.ticketPriceBottom} style={{background: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset', color: 'var(--sys-info)'}}>RSVP</span>
                ) : null}

                {/* Tickets left on bottom right (for ticketed/RSVP events) */}
                {event.eventType === 'ticketed' && totalTicketsAvailable > 0 && (
                    <span className={styles.ticketsLeft}>
                        <FaTicketAlt /> {ticketsLeft} left
                    </span>
                )}
                {event.eventType === 'rsvp' && event.rsvpConfig?.capacityLimit > 0 && (
                    <span className={styles.ticketsLeft}>
                        <FaUsers /> {event.rsvpsCount || 0} / {event.rsvpConfig.capacityLimit}
                    </span>
                )}
            </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;