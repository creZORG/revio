// /src/pages/Checkout/Steps/ReviewOrderStep.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { format } from 'date-fns';

import TextInput from '../../../components/Common/TextInput.jsx';
import styles from './ReviewOrderStep.module.css';
import commonStyles from '../../CheckoutPage.module.css';

const ReviewOrderStep = ({ checkoutData, updateCheckoutData, currentUser }) => {
    const {
        event,
        selectedTickets,
        calculatedTotalPrice,
        calculatedTotalTickets,
        customerName,
        customerEmail,
        ticketDeliveryMethod
    } = checkoutData;

    const handleCustomerNameChange = (e) => {
        updateCheckoutData({ customerName: e.target.value });
    };

    const handleCustomerEmailChange = (e) => {
        updateCheckoutData({ customerEmail: e.target.value });
    };

    const handleReceiveTicketsMethodChange = (e) => {
        updateCheckoutData({ ticketDeliveryMethod: e.target.value });
    };

    const eventName = event?.eventName || 'Loading Event...';
    const eventStartDate = event?.startDate instanceof Date ? event.startDate : null;
    const eventVenueName = event?.venueName || event?.onlineLink || 'N/A';

    // Fallback if selectedTickets is nested like { tickets: { ticketId: qty } }
    const ticketMap = selectedTickets?.tickets || selectedTickets || {};

    return (
        <motion.div
            className={`${commonStyles.section} ${styles.reviewOrderSection}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className={commonStyles.sectionTitle}>Order Summary for {eventName}</h2>

            <div className={commonStyles.summaryDetails}>
                <div className={commonStyles.summaryItem}>
                    <p>Event Date:</p>
                    <span>{eventStartDate ? format(eventStartDate, 'MMM d, yyyy') : 'N/A'}</span>
                </div>
                <div className={commonStyles.summaryItem}>
                    <p>Location:</p>
                    <span>{eventVenueName}</span>
                </div>
                <div className={commonStyles.summaryItem}>
                    <p>Tickets:</p>
                    <span>{calculatedTotalTickets}</span>
                </div>

                <div className={commonStyles.selectedTicketsList}>
                    {Object.keys(ticketMap).map(ticketId => {
                        const qty = ticketMap[ticketId];
                        if (qty === 0) return null;

                        const ticket = event?.ticketDetails?.find(t => t.id === ticketId);

                        let ticketName = ticket?.name || 'Unknown Ticket';
                        let unitPrice = 0;

                        console.log(`\n== Ticket Debug (${ticketId}) ==`);
                        console.log('Raw ticket.price:', ticket?.price);

                        if (ticket?.price && typeof ticket.price === 'object') {
                            const [label, value] = Object.entries(ticket.price)[0];
                            console.log('Ticket label:', label);
                            console.log('Ticket value:', value);

                            ticketName += ` (${label.replace(/_/g, ' ')})`;
                            unitPrice = typeof value === 'object'
                                ? Object.values(value)[0]
                                : value;
                        } else {
                            unitPrice = ticket?.price || 0;
                        }

                        console.log('Final unitPrice:', unitPrice);

                        return (
                            <div key={ticketId} className={commonStyles.selectedTicketItem}>
                                <span>{qty} x {ticketName}</span>
                                <span>KES {(qty * unitPrice).toFixed(2)}</span>
                            </div>
                        );
                    })}
                </div>

                <div className={`${commonStyles.summaryItem} ${commonStyles.totalPriceItem}`}>
                    <h3>Total Amount:</h3>
                    <span>KES {calculatedTotalPrice.toFixed(2)}</span>
                </div>
            </div>

            <h2 className={commonStyles.sectionTitle} style={{ marginTop: '30px' }}>Your Information</h2>

            <TextInput
                label="Full Name"
                id="customerName"
                name="customerName"
                value={customerName}
                onChange={handleCustomerNameChange}
                placeholder="Enter your full name"
                required
                icon={FaUser}
            />

            <TextInput
                label="Email Address"
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={customerEmail}
                onChange={handleCustomerEmailChange}
                placeholder="Enter your email address"
                required
                icon={FaEnvelope}
            />

            <div className={styles.ticketDeliveryOptions}>
                <h4 className={styles.deliveryOptionTitle}>How would you like to receive your ticket?</h4>
                <div className={styles.radioGroup}>
                    <label className={styles.radioOption}>
                        <input
                            type="radio"
                            name="ticketDelivery"
                            value="email"
                            checked={ticketDeliveryMethod === 'email'}
                            onChange={handleReceiveTicketsMethodChange}
                        />
                        <span>Send to my email ({customerEmail || 'your email'})</span>
                    </label>
                    <label className={styles.radioOption}>
                        <input
                            type="radio"
                            name="ticketDelivery"
                            value="download"
                            checked={ticketDeliveryMethod === 'download'}
                            onChange={handleReceiveTicketsMethodChange}
                        />
                        <span>Download after payment</span>
                    </label>
                </div>
            </div>

            <p className={commonStyles.assuranceText}>
                <FaCheckCircle style={{ color: 'var(--naks-info)' }} /> Your tickets are secure and can always be traced back to your phone number.
            </p>
        </motion.div>
    );
};

ReviewOrderStep.validate = (data) => {
    const errors = {};
    if (!data.customerName.trim()) errors.customerName = 'Full Name is required.';
    if (!data.customerEmail.trim()) errors.customerEmail = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(data.customerEmail)) errors.customerEmail = 'Invalid email format.';
    return Object.keys(errors).length > 0 ? errors : {};
};

export default ReviewOrderStep;
