import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart, FaRegHeart, FaLaptopCode, FaTicketAlt, FaUsers } from 'react-icons/fa';
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
          startDate: event.startDate,
          addedAt: Timestamp.now(),
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

  const isAdCard = event.type === 'ad'; // Flag for ad cards
  const isPoster = event.type === 'poster'; // NEW: Flag for admin-created posters

  // FIX: Calculate lowest price and sold out status for ticketed events
  let displayPrice = '';
  let isSoldOut = false;
  let totalTicketsAvailable = 0;
  let totalTicketsSold = 0;

  if (event.eventType === 'ticketed' && event.ticketTypes && event.ticketTypes.length > 0) {
    let lowestPrice = Infinity;
    let hasAvailableTickets = false;

    event.ticketTypes.forEach(ticket => {
      const price = parseFloat(ticket.price);
      const quantity = parseInt(ticket.quantity);
      const sold = parseInt(ticket.sold || 0);

      if (!isNaN(price) && price < lowestPrice) {
        lowestPrice = price;
      }
      if (!isNaN(quantity) && (quantity - sold) > 0) {
        hasAvailableTickets = true;
      }
      totalTicketsAvailable += isNaN(quantity) ? 0 : quantity;
      totalTicketsSold += isNaN(sold) ? 0 : sold;
    });

    if (totalTicketsAvailable > 0 && totalTicketsSold >= totalTicketsAvailable) {
      isSoldOut = true;
      displayPrice = 'Sold Out';
    } else if (lowestPrice !== Infinity) {
      displayPrice = `From KES ${lowestPrice.toLocaleString()}`;
    } else {
      displayPrice = 'N/A';
    }
  } else if (event.eventType === 'free') {
    displayPrice = 'FREE';
  } else if (event.eventType === 'rsvp') {
    displayPrice = 'RSVP';
  } else if (event.eventType === 'online') {
    displayPrice = 'ONLINE'; // Display for online events if no ticket type
  }


  return (
    <Link to={isPoster ? '#' : `/events/${event.id}`} className={`${styles.eventCard} glassmorphism ${isAdCard ? styles.adCard : ''} ${isPoster ? styles.posterCard : ''}`}> {/* FIX: Add posterCard style */}
      {/* Floating Calendar Card */}
      {!isAdCard && !isPoster && startDate && ( // FIX: Hide calendar for posters too
        <div className={styles.calendarCard}>
          <div className={styles.dayOfWeek}>{formattedStartDate.dayOfWeek}</div>
          <div className={styles.date}>{formattedStartDate.day}</div>
          <div className={styles.month}>{formattedStartDate.month}</div>
        </div>
      )}

      {/* Floating Save Button (Heart) */}
      {!isAdCard && !isPoster && ( // FIX: Hide save button for posters too
        <button className={styles.saveButton} onClick={handleSaveToggle}>
          {isSaved ? <FaHeart className={styles.saved} /> : <FaRegHeart />}
        </button>
      )}

      {isAdCard && <span className={styles.adLabel}>AD</span>}
      {isPoster && <span className={styles.posterLabel}>POSTER</span>} {/* NEW: Poster label */}
      <img
        src={event.bannerImageUrl || "https://placehold.co/300x400/E0E0E0/808080?text=No+Image"}
        alt={event.eventName || 'Event Image'}
        className={styles.eventCardImage}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/CCCCCC/000000?text=Image+Error'; }}
      />
      <div className={styles.eventCardContent}>
        <h3 className={styles.eventCardTitle}>{event.eventName || 'Event Title'}</h3>
        {/* Date Display (for non-poster/ad events) */}
        {!isPoster && !isAdCard && startDate && (
          <p className={styles.eventCardMeta}>
            <FaCalendarAlt /> {displayDateRange}
          </p>
        )}
        {/* Location Display (for non-poster/ad events) */}
        {!isPoster && !isAdCard && event.specificAddress && (
          <p className={styles.eventCardMeta}>
            <FaMapMarkerAlt /> {displayLocation}
          </p>
        )}
        {/* Online Event Type Display (for non-poster/ad events) */}
        {!isPoster && !isAdCard && event.eventType === 'online' && (
          <p className={styles.eventCardMeta}>
            <FaLaptopCode /> {onlineEventTypeDisplay}
          </p>
        )}

        {/* FIX: Price and Tickets Left Row - Conditional display for Naks Yetu Ticketed and RSVP */}
        {!isAdCard && !isPoster && (event.eventType === 'ticketed' || event.eventType === 'rsvp' || event.eventType === 'free') && (
            <div className={styles.ticketInfoRow}>
                {/* Price on bottom left */}
                <span className={styles.ticketPriceBottom}>
                    {displayPrice}
                </span>

                {/* Tickets left/RSVP count on bottom right */}
                {event.eventType === 'ticketed' && totalTicketsAvailable > 0 && !isSoldOut && (
                    <span className={styles.ticketsLeft}>
                        <FaTicketAlt /> {totalTicketsAvailable - totalTicketsSold} left
                    </span>
                )}
                {event.eventType === 'ticketed' && isSoldOut && (
                    <span className={styles.ticketsLeft} style={{color: 'var(--naks-error)'}}>
                        <FaTicketAlt /> Sold Out
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