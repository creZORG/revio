import React, { useState, useCallback, useEffect } from 'react';
import { FaTicketAlt, FaClock, FaMinus, FaPlus, FaSpinner, FaDollarSign, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa';
import Button from '../../Common/Button.jsx';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { db } from '../../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp for checking

import styles from './details.module.css'; // Use parent's CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcode appId

const TicketPurchaseSection = ({ event }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [selectedTickets, setSelectedTickets] = useState(() => {
    const initialSelection = {};
    event.ticketTypes?.forEach(ticket => {
      initialSelection[ticket.id || ticket.name] = 0;
    });
    return initialSelection;
  });

  const [totalSelectedTickets, setTotalSelectedTickets] = useState(0);
  const [currentTotalPrice, setCurrentTotalPrice] = useState(0);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  useEffect(() => {
    let totalTickets = 0;
    let totalPrice = 0;
    if (event?.ticketTypes) {
      Object.keys(selectedTickets).forEach(ticketTypeId => {
        const quantity = selectedTickets[ticketTypeId];
        const ticketType = event.ticketTypes.find(t => (t.id || t.name) === ticketTypeId);
        if (ticketType) {
          totalTickets += quantity;
          totalPrice += quantity * ticketType.price;
        }
      });
    }
    setTotalSelectedTickets(totalTickets);
    setCurrentTotalPrice(totalPrice);
  }, [selectedTickets, event]);

  const handleQuantityChange = useCallback((ticketIdentifier, delta) => {
    setSelectedTickets(prev => {
      const currentQty = prev[ticketIdentifier] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const ticketType = event.ticketTypes.find(t => (t.id || t.name) === ticketIdentifier);
      
      if (ticketType?.quantity !== null && newQty > ticketType?.quantity) {
        showNotification(`Only ${ticketType.quantity} tickets available for ${ticketType.name}.`, 'info');
        return prev;
      }

      const updated = { ...prev, [ticketIdentifier]: newQty };
      return updated;
    });
  }, [event, showNotification]);

  const handleProceedToCheckout = async () => {
    if (totalSelectedTickets === 0) {
      showNotification('Please select at least one ticket.', 'info');
      return;
    }
    if (!isAuthenticated || !currentUser) {
      showNotification('Please log in to proceed to checkout.', 'info');
      return;
    }

    setIsSubmittingCheckout(true);
    showNotification('Proceeding to checkout...', 'info');

    try {
      const userCartRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/cart`, event.id);
      await setDoc(userCartRef, {
        eventId: event.id,
        eventName: event.eventName,
        selectedTickets: selectedTickets,
        totalTickets: totalSelectedTickets,
        totalPrice: currentTotalPrice,
        checkoutInitiatedAt: Timestamp.now(),
      });

      showNotification('Redirecting to payment gateway (simulated)...', 'success');
      setTimeout(() => {
        alert(`Simulated Checkout: ${totalSelectedTickets} tickets for KES ${currentTotalPrice.toFixed(2)}`);
        setIsSubmittingCheckout(false);
      }, 1500);

    } catch (error) {
      console.error("Error during checkout:", error);
      showNotification("Failed to proceed to checkout. Please try again.", 'error');
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <aside className={`${styles.eventSidebarActions} glassmorphism`}>
      <h2 className={styles.sidebarHeading}>Select Your Tickets</h2>

      {event.ticketTypes && event.ticketTypes.length > 0 ? (
        <div className={styles.ticketTypeList}>
          {event.ticketTypes.map((ticket, index) => {
            // FIX: Robust date handling for bookingEndDate
            const bookingEndDate = ticket.bookingEndDate;
            let formattedBookingEndDate = '';
            if (bookingEndDate) {
                if (bookingEndDate instanceof Timestamp) {
                    formattedBookingEndDate = new Date(bookingEndDate.toDate()).toLocaleString();
                } else if (typeof bookingEndDate === 'string') {
                    // If it's a string, try to parse it
                    const date = new Date(bookingEndDate);
                    if (!isNaN(date.getTime())) { // Check if it's a valid date string
                        formattedBookingEndDate = date.toLocaleString();
                    }
                }
            }

            // Calculate tickets left creatively
            const ticketsLeft = (ticket.quantity !== null && ticket.quantity !== undefined) ? (ticket.quantity - (ticket.sold || 0)) : null;
            const ticketsSoldPercentage = (ticket.quantity !== null && ticket.quantity > 0) ? ((ticket.sold || 0) / ticket.quantity) * 100 : 0;

            let availabilityMessage = 'Available';
            if (ticketsLeft !== null) {
                if (ticketsLeft <= 0) {
                    availabilityMessage = 'Sold Out';
                } else if (ticketsLeft < 100) { // Below 100 left
                    availabilityMessage = `${ticketsLeft} left!`;
                } else if (ticketsSoldPercentage > 0 && ticketsSoldPercentage < 100) {
                    availabilityMessage = `${Math.round(ticketsSoldPercentage)}% sold`;
                }
            }


            return (
              <div key={ticket.id || index} className={`${styles.ticketTypeItem} ${ticket.disabled || ticketsLeft <= 0 ? styles.disabled : ''}`}>
                <div className={styles.ticketInfo}>
                  <h3 className={styles.ticketName}>{ticket.name}</h3>
                  <p className={styles.ticketPrice}>KES {ticket.price.toLocaleString()}</p>
                  {ticket.bookingEndDate && (
                    <p className={styles.ticketSalesInfo}><FaClock /> Sale ends {formattedBookingEndDate}</p>
                  )}
                  {ticketsLeft !== null && <p className={styles.ticketAvailability}>{availabilityMessage}</p>}
                </div>
                <div className={styles.ticketQuantityControl}>
                  <button className={styles.quantityBtn} onClick={() => handleQuantityChange(ticket.id || ticket.name, -1)} disabled={isSubmittingCheckout || selectedTickets[ticket.id || ticket.name] <= 0}>
                    <FaMinus />
                  </button>
                  <span className={styles.ticketQty}>{selectedTickets[ticket.id || ticket.name] || 0}</span>
                  <button className={styles.quantityBtn} onClick={() => handleQuantityChange(ticket.id || ticket.name, 1)} disabled={isSubmittingCheckout || (ticketsLeft !== null && selectedTickets[ticket.id || ticket.name] >= ticket.quantity)}>
                    <FaPlus />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.noTicketsMessage}>No ticket types available for this event.</p>
      )}

      <div className={styles.totalSummary}>
        <p>Selected Tickets: <span className={styles.totalSummarySpan}>{totalSelectedTickets}</span></p>
        <p>Total Price: <span className={styles.totalSummarySpan}>KES {currentTotalPrice.toFixed(2)}</span></p>
      </div>

      <Button onClick={handleProceedToCheckout} className={`btn btn-primary ${styles.checkoutBtn} glassmorphism-button`} disabled={totalSelectedTickets === 0 || isSubmittingCheckout}>
        {isSubmittingCheckout ? <FaSpinner className="spinner" /> : 'Proceed to Checkout'}
      </Button>

      <div className={styles.shareContactSection}>
        <h3 className={styles.shareHeading}>Share This Event</h3>
        <div className={styles.socialShareIcons}>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaFacebookF /></a>
          <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(event.eventName)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaTwitter /></a>
          <a href={`https://wa.me/?text=${encodeURIComponent(event.eventName + " - " + window.location.href)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaWhatsapp /></a>
          <a href={`https://www.instagram.com/direct/new/`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaInstagram /></a>
        </div>
        <button className={`btn btn-secondary ${styles.contactOrganizerBtn} glassmorphism-button`} onClick={() => alert(`Contacting organizer ${event.contactEmail || 'N/A'}`)}>
          <FaEnvelope /> Contact Organizer
        </button>
      </div>
    </aside>
  );
};

export default TicketPurchaseSection;