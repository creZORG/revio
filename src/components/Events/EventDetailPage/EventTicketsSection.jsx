// /src/components/Events/EventDetailPage/EventTicketsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaMinus, FaClock, FaCalendarCheck, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import { format, isBefore, isAfter } from 'date-fns';

import styles from './EventTicketsSection.module.css'; // Dedicated CSS for ticket section
import commonStyles from '../EventDetailPage.module.css'; // Common page-level styles

import { useCart } from '../../../contexts/CartContext.jsx'; // NEW: Import useCart hook

const EventTicketsSection = ({ event, onProceedToCheckout, isProcessingMpesa, mpesaError, setMpesaAmount, setMpesaPhoneNumber, mpesaPhoneNumber }) => {
    // REMOVED: selectedTickets, totalPrice, totalTicketsCount local states
    // These are now managed by CartContext
    const { cartItems, totalTicketsCount, updateCartItemQuantity } = useCart(); // NEW: Get cart state and actions

    // Calculate totalPrice based on cartItems and current event's ticket details
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        let currentTotal = 0;
        if (event && event.ticketDetails) {
            event.ticketDetails.forEach(ticket => {
                const quantity = cartItems[ticket.id] || 0; // Use cartItems
                currentTotal += quantity * (ticket.price || 0);
            });
        }
        setTotalPrice(currentTotal);
        setMpesaAmount(currentTotal); // Update parent's M-Pesa amount (for display)
    }, [cartItems, event, setMpesaAmount]); // Depend on cartItems and event

    const handleQuantityChange = useCallback((ticketId, change) => {
        const ticket = event.ticketDetails.find(t => t.id === ticketId);
        if (!ticket) return;

        const currentQty = cartItems[ticketId] || 0; // Use cartItems
        const newQty = Math.max(0, currentQty + change);

        const maxAvailable = ticket.quantity - (ticket.sold || 0);
        if (change > 0 && newQty > maxAvailable) {
            alert(`Maximum ${maxAvailable} tickets available for "${ticket.name}".`); // Show simple alert
            return;
        }

        updateCartItemQuantity(ticketId, newQty); // NEW: Update CartContext
    }, [cartItems, event.ticketDetails, updateCartItemQuantity]); // Depend on cartItems, event.ticketDetails, updateCartItemQuantity

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


    return (
        <section className={`${commonStyles.sectionContent} ${styles.ticketsSection}`} id="ticket-section">
            <h2 className={commonStyles.sectionTitle}>Select Your Tickets</h2>
            
            <div className={styles.ticketTypesList}>
                {event.ticketDetails.length === 0 ? (
                    <p className={styles.noTicketsMessage}>No tickets configured for this event yet.</p>
                ) : (
                    event.ticketDetails.map(ticket => {
                        const status = getTicketStatus(ticket);
                        const currentQty = cartItems[ticket.id] || 0; // Use cartItems
                        const isTicketDisabled = !status.canBuy || isProcessingMpesa;

                        return (
                            <div key={ticket.id} className={`${styles.ticketItem} ${isTicketDisabled ? styles.disabled : ''}`}>
                                <div className={styles.ticketInfo}>
                                    <h3 className={styles.ticketName}>{ticket.name}</h3>
                                    <p className={styles.ticketPrice}>KES {ticket.price ? ticket.price.toFixed(2) : '0.00'}</p>
                                    <p className={`${styles.ticketStatusInfo} ${status.class}`}>
                                        <FaClock /> {status.text}
                                    </p>
                                    {ticket.description && <p className={styles.ticketDescription}>{ticket.description}</p>}
                                    {ticket.quantity && <p className={styles.ticketAvailability}>{ticket.quantity - (ticket.sold || 0)} available</p>}
                                </div>
                                <div className={styles.quantityControl}>
                                    <button
                                        className={styles.quantityButton}
                                        onClick={() => handleQuantityChange(ticket.id, -1)}
                                        disabled={isTicketDisabled || currentQty <= 0}
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className={styles.currentQuantity}>{currentQty}</span>
                                    <button
                                        className={styles.quantityButton}
                                        onClick={() => handleQuantityChange(ticket.id, 1)}
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

            <div className={styles.summaryBox}>
                <div className={styles.totalSummary}>
                    <p>Total Selected:</p>
                    <span>{totalTicketsCount} Tickets</span>
                </div>
                <div className={styles.totalSummary}>
                    <p>Total Price:</p>
                    <span>KES {totalPrice.toFixed(2)}</span>
                </div>
            </div>
            
            {totalPrice > 0 && (
                <div className={styles.paymentActions}>
                    <button 
                        className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.checkoutButton}`}
                        onClick={() => onProceedToCheckout({ tickets: cartItems, totalPrice: totalPrice })} // Pass cartItems and totalPrice
                        disabled={isProcessingMpesa || totalTicketsCount === 0}
                    >
                        {isProcessingMpesa ? <FaSpinner className="fa-spin" /> : 'Proceed to Checkout'}
                    </button>
                    {mpesaError && <p className={commonStyles.errorMessageBox} style={{textAlign: 'center'}}>{mpesaError}</p>}
                </div>
            )}
        </section>
    );
};

export default EventTicketsSection;