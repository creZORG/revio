import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart, FaRegHeart, FaLaptopCode, FaTicketAlt, FaUsers, FaClock } from 'react-icons/fa';
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { format } from 'date-fns'; // Import format for date formatting

import styles from './EventCard.module.css'; // Import the CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcode appId for consistency

const EventCard = ({ event }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && currentUser && event?.id) { 
        const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, event.id);
        const docSnap = await getDoc(savedEventRef);
        setIsSaved(docSnap.exists());
      } else if (!isAuthenticated) { 
        setIsSaved(false);
      }
    };
    checkSavedStatus();
  }, [isAuthenticated, currentUser, event?.id]); 

  const handleSaveToggle = async (e) => {
    e.stopPropagation(); 
    e.preventDefault(); 

    if (!isAuthenticated || !currentUser) {
      showNotification("Please log in to save events!", "info");
      return;
    }
    if (!event?.id) {
      showNotification("Event data not loaded yet.", "error");
      return;
    }
    const savedEventRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`, event.id);
    try {
      if (isSaved) {
        await deleteDoc(savedEventRef);
        setIsSaved(false);
        showNotification(`'${event.eventName}' removed from favorites.`, "info");
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
  const eventLink = `/events/${event.id}`; 

  // Derived values for display
  const displayDate = startDate ? format(startDate, 'MMM d, yyyy') : 'N/A';
  const displayTime = event.startTime || 'N/A';
  // CORRECTED: Define displayLocation here
  const displayLocation = event.specificAddress || event.mainLocation || (event.isOnlineEvent ? 'Online' : 'N/A');

  let displayPrice = '';
  let ticketsAvailableText = 'N/A';
  let isSoldOut = false;

  if (event.isTicketed && event.ticketDetails && event.ticketDetails.length > 0) {
    let lowestPrice = Infinity;
    let totalTickets = 0;
    let totalSold = 0;

    event.ticketDetails.forEach(ticket => {
      const price = parseFloat(ticket.price);
      const quantity = parseInt(ticket.quantity);
      const sold = parseInt(ticket.sold || 0);

      if (!isNaN(price) && price < lowestPrice) {
        lowestPrice = price;
      }
      totalTickets += isNaN(quantity) ? 0 : quantity;
      totalSold += isNaN(sold) ? 0 : sold;
    });

    if (totalTickets > 0 && totalSold >= totalTickets) {
      isSoldOut = true;
      displayPrice = 'Sold Out';
      ticketsAvailableText = 'Sold Out';
    } else if (lowestPrice !== Infinity) {
      displayPrice = `From KES ${lowestPrice.toLocaleString()}`;
      ticketsAvailableText = `${totalTickets - totalSold} Tickets Left`;
    } else {
      displayPrice = 'N/A';
      ticketsAvailableText = 'N/A';
    }
  } else if (event.isFreeEvent) {
    displayPrice = 'FREE';
    ticketsAvailableText = 'No Ticket Required';
  } else if (event.isRsvp) {
    displayPrice = 'RSVP';
    ticketsAvailableText = `RSVP: ${event.rsvpConfig?.capacityLimit ? (event.rsvpsCount || 0) + '/' + event.rsvpConfig.capacityLimit : 'Available'}`;
  } else if (event.isOnlineEvent) {
    displayPrice = 'ONLINE';
    ticketsAvailableText = 'Virtual Event';
  }


  // Determine status badge
  let statusText = 'Upcoming';
  let statusClass = styles.statusUpcoming;
  if (event.status === 'active') {
      statusText = 'Active';
      statusClass = styles.statusActive;
  } else if (event.status === 'completed') {
      statusText = 'Completed';
      statusClass = styles.statusCompleted;
  } else if (event.status === 'cancelled') {
      statusText = 'Cancelled';
      statusClass = styles.statusCancelled;
  } else if (event.status === 'pending') { 
      statusText = 'Pending';
      statusClass = styles.statusPending;
  }


  const isAdCard = event.type === 'ad'; 
  const isPoster = event.type === 'poster'; 

  return (
    <Link to={isPoster ? '#' : eventLink} className={`${styles.eventCard} glassmorphism ${isAdCard ? styles.adCard : ''} ${isPoster ? styles.posterCard : ''}`}> 
      {/* Floating Calendar Card */}
      {!isAdCard && !isPoster && startDate && ( 
        <div className={styles.calendarCard}>
          <div className={styles.dayOfWeek}>{format(startDate, 'EEE').toUpperCase()}</div>
          <div className={styles.date}>{format(startDate, 'd')}</div>
          <div className={styles.month}>{format(startDate, 'MMM').toUpperCase()}</div>
        </div>
      )}

      {/* Floating Save Button (Heart) */}
      {!isAdCard && !isPoster && ( 
        <button className={styles.saveButton} onClick={handleSaveToggle}>
          {isSaved ? <FaHeart className={styles.saved} /> : <FaRegHeart />}
        </button>
      )}

      {isAdCard && <span className={styles.adLabel}>AD</span>}
      {isPoster && <span className={styles.posterLabel}>POSTER</span>} 
      <img
        src={event.bannerImageUrl || "https://placehold.co/300x400/E0E0E0/808080?text=No+Image"}
        alt={event.eventName || 'Event Image'}
        className={styles.eventCardImage}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/CCCCCC/000000?text=Image+Error'; }}
      />
      <div className={styles.eventCardContent}>
        <h3 className={styles.eventCardTitle}>{event.eventName || 'Event Title'}</h3>
        {/* Date and Start Time */}
        <p className={styles.eventCardMeta}>
            <FaCalendarAlt /> {displayDate} | <FaClock /> {displayTime}
        </p>
        {/* Location Display */}
        <p className={styles.eventCardMeta}>
            <FaMapMarkerAlt /> {displayLocation}
        </p>
        
        {/* Price and Tickets Left Row */}
        {!isAdCard && !isPoster && (event.isTicketed || event.isRsvp || event.isFreeEvent || event.isOnlineEvent) && (
            <div className={styles.ticketInfoRow}>
                {/* Price on bottom left */}
                <span className={styles.ticketPriceBottom}>{displayPrice}</span>

                {/* Tickets left on bottom right */}
                <span className={styles.ticketsLeft}>
                    { (event.isTicketed || event.isRsvp) && <FaTicketAlt />} {ticketsAvailableText}
                </span>
            </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;