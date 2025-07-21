// /src/components/Events/Details/TicketPurchaseSection.jsx
import React, { useState, useCallback } from 'react';
import { FaPlus, FaMinus, FaClock, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { format, isBefore, isAfter } from 'date-fns';

import { useNotification } from '../../../contexts/NotificationContext.jsx';
import { useCart } from '../../../contexts/CartContext.jsx';

import styles from './TicketPurchaseSection.module.css'; // Import dedicated CSS module
import commonStyles from '../../Common/Button.module.css'; // For common button styles (e.g., btn, btnPrimary)
import eventDetailPageStyles from '../../Events/EventDetailPage.module.css'; // For general sectionContent, sectionTitle


const TicketPurchaseSection = ({ event, onProceedToCheckout, setShowMpesaModal, setMpesaAmount, setMpesaPhoneNumber }) => {
    const { showNotification } = useNotification();
    const { cartItems, updateCartItemQuantity } = useCart(); // Get cartItems and update function

    // Derived total price for display within this section (matches sidebar)
    const currentTotalPrice = (cartItems && event?.ticketDetails) ?
        Object.values(cartItems).reduce((sum, cartItem) => { // Iterate over cart items (which now contain full ticket data)
            // No need to find ticket in event.ticketDetails here, cartItem already has it
            const qty = cartItem.quantity || 0;
            const rawPrice = cartItem.price; // Get price directly from cartItem
            const numericPrice = typeof rawPrice === 'object' && rawPrice !== null ? Object.values(rawPrice)[0] || 0 : rawPrice || 0;
            const finalPrice = typeof numericPrice === 'number' ? numericPrice : 0;
            return sum + (qty * finalPrice);
        }, 0) : 0;

    const getTicketStatus = useCallback((ticket) => {
        const now = new Date();
        const salesStarts = ticket.salesStartDate instanceof Date ? ticket.salesStartDate : null;
        const salesEnds = ticket.salesEndDate instanceof Date ? ticket.salesEndDate : null;
        const isSoldOut = (ticket.sold || 0) >= ticket.quantity;

        let status = { text: 'Available', class: styles.statusActive, canBuy: true };

        if (isSoldOut) {
            status = { text: 'Sold Out', class: styles.statusEnded, canBuy: false };
        } else if (salesStarts && isAfter(salesStarts, now)) {
            status = { text: `Sale starts ${format(salesStarts, 'MMM d, yyyy')}`, class: styles.statusUpcoming, canBuy: false };
        } else if (salesEnds && isBefore(salesEnds, now)) {
            status = { text: 'Sale Ended', class: styles.statusEnded, canBuy: false };
        }
        return status;
    }, []);

    const handleQuantityChange = useCallback((ticket, change) => {
        // `ticket` here is the full ticket object from `event.ticketDetails`
        const currentCartItem = cartItems[ticket.id] || { quantity: 0 };
        const currentQty = currentCartItem.quantity;

        const newQty = Math.max(0, currentQty + change); // Calculate the new absolute quantity

        const maxAvailable = ticket.quantity - (ticket.sold || 0);
        if (change > 0 && newQty > maxAvailable) {
            showNotification(`Maximum ${maxAvailable} tickets available for "${ticket.name}".`, 'warning');
            return;
        }

        // Pass the full ticket object and the calculated new absolute quantity
        updateCartItemQuantity(ticket, newQty);
    }, [cartItems, updateCartItemQuantity, showNotification]);


    // Handle "Proceed to Checkout" button click for this section
    const handleCheckoutClick = useCallback(() => {
        if (currentTotalPrice > 0) {
            setMpesaAmount(currentTotalPrice);
            // setMpesaPhoneNumber(currentUser?.phoneNumber || ''); // If you want to pre-fill phone
            setShowMpesaModal(true);
        } else {
            showNotification('Please select at least one ticket.', 'error');
        }
    }, [currentTotalPrice, setMpesaAmount, setShowMpesaModal, showNotification]);


    return (
        <section className={`${eventDetailPageStyles.sectionContent} ${styles.ticketsSection}`}>
            <h2 className={eventDetailPageStyles.sectionTitle}>Tickets</h2>

            <div className={styles.ticketTypesList}>
                {event?.ticketDetails?.length === 0 ? (
                    <p className={styles.noTicketsMessage}>No tickets configured for this event yet.</p>
                ) : (
                    event?.ticketDetails?.map(ticket => {
                        const status = getTicketStatus(ticket);
                        // Access quantity for this specific ticket from cartItems object
                        const currentQty = cartItems[ticket.id]?.quantity || 0;
                        const isTicketDisabled = !status.canBuy;

                        return (
                            <div key={ticket.id} className={`${styles.ticketItem} ${isTicketDisabled ? styles.disabled : ''}`}>
                                <div className={styles.ticketInfo}>
                                    <h3 className={styles.ticketName}>{ticket.name}</h3>
                                    <p className={styles.ticketPrice}>KES {ticket.price ? ticket.price.toFixed(2) : '0.00'}</p>
                                    <p className={`${styles.ticketSalesInfo} ${status.class}`}>
                                        <FaClock /> {status.text}
                                        {ticket.salesStartDate instanceof Date && (
                                            <span> | <FaCalendarAlt /> {format(ticket.salesStartDate, 'MMM d')} - {format(ticket.salesEndDate, 'MMM d, yyyy')}</span>
                                        )}
                                    </p>
                                    {ticket.description && <p className={styles.ticketDescription}>{ticket.description}</p>}
                                    {ticket.quantity !== undefined && ticket.quantity !== null && (
                                        <p className={styles.ticketAvailability}>Available: {ticket.quantity - (ticket.sold || 0)}</p>
                                    )}
                                </div>
                                <div className={styles.ticketQuantityControl}>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => handleQuantityChange(ticket, -1)}
                                        disabled={isTicketDisabled || currentQty <= 0}
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className={styles.ticketQty}>{currentQty}</span>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => handleQuantityChange(ticket, 1)}
                                        disabled={isTicketDisabled || currentQty >= (ticket.quantity - (ticket.sold || 0))}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* Removed the mini-cart section as per your feedback */}
        </section>
    );
};

export default TicketPurchaseSection;