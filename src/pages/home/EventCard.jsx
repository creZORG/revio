// src/pages/home/EventCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart, FaRegHeart, FaLaptopCode, FaTicketAlt, FaUsers, FaArrowRight } from 'react-icons/fa'; // Icons from react-icons/fa
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore'; // Firebase Firestore functions
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';

import styles from './EventCard.module.css'; // Dedicated CSS for EventCard

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; 

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
        showNotification(`'${event.eventName || event.title}' removed from favorites.`, "info");
      } else {
        await setDoc(savedEventRef, {
          eventId: event.id,
          eventName: event.eventName || event.title, 
          bannerImageUrl: event.bannerImageUrl || event.image, 
          startDate: event.startDate instanceof Date ? event.startDate : (event.startDate ? Timestamp.fromDate(event.startDate) : null), 
          addedAt: Timestamp.now(), 
        });
        setIsSaved(true);
        showNotification(`'${event.eventName || event.title}' added to favorites!`, "success");
      }
    } catch (error) {
      console.error("Error saving/unsaving event:", error);
      showNotification("Failed to save/unsave event. Please try again.", "error");
    }
  };


  if (!event) {
    return (
      <div className={styles.eventCard}> 
        <p className={styles.noEventDataText}>No event data available.</p>
      </div>
    );
  }

  // Safely access properties, providing fallbacks
  const eventName = event.eventName || event.title || 'Untitled Event';
  const eventCategory = event.eventCategory || 'Uncategorized';
  const eventStartDate = event.startDate instanceof Date ? event.startDate : null;
  const eventStartTime = event.startTime || 'N/A';
  const eventLocation = event.isOnlineEvent ? 'Online Event' : event.mainLocation || event.location || 'N/A';
  const eventBanner = event.bannerImageUrl || event.image || 'https://placehold.co/400x200/cccccc/333333?text=Event+Image';

  // Formatted date for meta info
  const formattedDate = eventStartDate ? eventStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  // Formatted date for calendar card
  const getFormattedDateForCalendar = (date) => {
    if (!date) return { dayOfWeek: 'N/A', day: 'N/A', month: 'N/A' };
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return { dayOfWeek, day, month };
  };
  const formattedStartDateForCalendar = getFormattedDateForCalendar(eventStartDate);


  const displayLocation = event.specificAddress || event.mainLocation || 'N/A';

  let onlineEventTypeDisplay = '';
  if (event.isOnlineEvent) { 
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
  const isPosterCard = event.type === 'poster'; 

  // Calculate lowest price and sold out status for ticketed events
  let displayPrice = '';
  let isSoldOut = false;
  let ticketsLeftCount = 0; // NEW: Variable for tickets left
  let rsvpCount = 0; // NEW: Variable for RSVP count
  let rsvpCapacity = 0; // NEW: Variable for RSVP capacity

  if (event.isTicketed && event.ticketTypes && event.ticketTypes.length > 0) {
    let lowestPrice = Infinity;
    let totalTicketsAvailable = 0;
    let totalTicketsSold = 0;
    
    event.ticketTypes.forEach(ticket => {
      const price = parseFloat(ticket.price);
      const quantity = parseInt(ticket.quantity);
      const sold = parseInt(ticket.sold || 0); 

      if (!isNaN(price) && price < lowestPrice) {
        lowestPrice = price;
      }
      totalTicketsAvailable += isNaN(quantity) ? 0 : quantity;
      totalTicketsSold += isNaN(sold) ? 0 : sold;
    });

    ticketsLeftCount = totalTicketsAvailable - totalTicketsSold; // Calculate tickets left

    if (totalTicketsAvailable > 0 && totalTicketsSold >= totalTicketsAvailable) {
      isSoldOut = true;
      displayPrice = 'Sold Out';
    } else if (lowestPrice !== Infinity) {
      displayPrice = `From KES ${lowestPrice.toLocaleString()}`;
    } else {
      displayPrice = 'N/A';
    }
  } else if (event.isFreeEvent) {
    displayPrice = 'FREE';
  } else if (event.isRsvp) {
    displayPrice = 'RSVP';
    rsvpCount = event.rsvpsCount || 0; // Assuming rsvpsCount exists on event
    rsvpCapacity = event.rsvpConfig?.capacityLimit || 0; // Assuming rsvpConfig.capacityLimit exists
  } else if (event.isOnlineEvent && !event.isTicketed && !event.isFreeEvent && !event.isRsvp) { 
    displayPrice = 'ONLINE'; 
  }

  const cardLink = isAdCard || isPosterCard ? (event.actionUrl || event.link || '#') : `/events/${event.id}`;
  const shouldOpenInNewTab = isAdCard || isPosterCard; 


  return (
    <Link 
      to={cardLink} 
      className={`${styles.eventCard} ${isAdCard ? styles.adCard : ''} ${isPosterCard ? styles.posterCard : ''}`} 
      target={shouldOpenInNewTab ? "_blank" : "_self"} 
      rel={shouldOpenInNewTab ? "noopener noreferrer" : ""}
    >
      {/* Floating Calendar Card (Hide for Ad/Poster cards) */}
      {!isAdCard && !isPosterCard && eventStartDate && (
        <div className={styles.calendarCard}>
          <div className={styles.dayOfWeek}>{formattedStartDateForCalendar.dayOfWeek}</div> 
          <div className={styles.date}>{formattedStartDateForCalendar.day}</div>
          <div className={styles.month}>{formattedStartDateForCalendar.month}</div>
        </div>
      )}

      {/* Floating Save Button (Heart) (Hide for Ad/Poster cards) */}
      {!isAdCard && !isPosterCard && (
        <button className={styles.saveButton} onClick={handleSaveToggle}>
          {isSaved ? <FaHeart className={styles.saved} /> : <FaRegHeart />}
        </button>
      )}

      {/* AD/POSTER Label */}
      {isAdCard && <span className={styles.adLabel}>AD</span>}
      {isPosterCard && <span className={styles.posterLabel}>POSTER</span>}

      <img
        src={eventBanner}
        alt={eventName}
        className={styles.eventCardImage}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/CCCCCC/000000?text=Image+Error'; }}
      />
      <div className={styles.eventCardContent}>
        <h3 className={styles.eventCardTitle}>{eventName}</h3>
        <p className={styles.eventCategory}>{eventCategory}</p>
        
        {/* Date Display (Hide for Ad/Poster cards) */}
        {!isAdCard && !isPosterCard && eventStartDate && (
          <p className={styles.eventCardMeta}>
            <FaCalendarAlt /> {formattedDate} at {eventStartTime}
          </p>
        )}
        {/* Location Display (Hide for Ad/Poster cards) */}
        {!isAdCard && !isPosterCard && (event.specificAddress || event.mainLocation) && (
          <p className={styles.eventCardMeta}>
            <FaMapMarkerAlt /> {displayLocation}
          </p>
        )}
        {/* Online Event Type Display (Hide for Ad/Poster cards) */}
        {!isAdCard && !isPosterCard && event.isOnlineEvent && (
          <p className={styles.eventCardMeta}>
            <FaLaptopCode /> {onlineEventTypeDisplay}
          </p>
        )}

        {/* Price and Tickets Left Row (Hide for Ad/Poster cards) */}
        {!isAdCard && !isPosterCard && (event.isTicketed || event.isFreeEvent || event.isRsvp || event.isOnlineEvent) && (
            <div className={styles.ticketInfoRow}>
                {/* Price on bottom left */}
                <span className={styles.ticketPriceBottom}>
                    {displayPrice}
                </span>

                {/* Tickets left/RSVP count on bottom right */}
                {event.isTicketed && ticketsLeftCount > 0 && !isSoldOut && (
                    <span className={styles.ticketsLeft}>
                        <FaTicketAlt /> {ticketsLeftCount} left
                    </span>
                )}
                {event.isTicketed && isSoldOut && (
                    <span className={styles.ticketsLeft} style={{color: 'var(--naks-error)'}}>
                        <FaTicketAlt /> Sold Out
                    </span>
                )}
                {event.isRsvp && rsvpCapacity > 0 && (
                    <span className={styles.ticketsLeft}>
                        <FaUsers /> {rsvpCount} / {rsvpCapacity}
                    </span>
                )}
            </div>
        )}

        {/* Ad/Poster specific content (override regular content) */}
        {(isAdCard || isPosterCard) && (
            <div className={styles.adPosterContent}>
                <h3 className={styles.adPosterTitle}>{eventName}</h3>
                <p className={styles.adPosterDescription}>{event.description || event.meta}</p>
                {event.buttonText && (
                    <span className={`${styles.adPosterButton} ${styles[event.buttonClass || 'btn-primary']}`}>
                        {event.buttonText} <FaArrowRight />
                    </span>
                )}
            </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;