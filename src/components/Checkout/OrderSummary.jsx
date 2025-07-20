import React from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../Common/TextInput.jsx';
import Button from '../Common/Button.jsx';
import styles from './OrderSummary.module.css';
import commonFormStyles from '../../pages/Organizer/Dashboard/Tabs/CreateEventWizard.module.css';
import {
    UserIcon, EnvelopeIcon, InformationCircleIcon, CheckCircleIcon // Keeping these for labels/info, not buttons
} from '@heroicons/react/24/outline';

/**
 * Renders the order summary section of the checkout page.
 * Displays event details, selected tickets with modification controls, subtotal,
 * and customer information input/display.
 *
 * @param {object} props - The component props.
 * @param {object} props.eventDetails - Details of the event.
 * @param {object} props.order - The current order object.
 * @param {number} props.originalTotalAmount - The total amount before any discounts.
 * @param {boolean} props.isProcessingPayment - Flag indicating if payment is in progress.
 * @param {boolean} props.isAuthenticated - Flag indicating if the user is authenticated.
 * @param {string} props.customerName - The customer's name.
 * @param {function} props.setCustomerName - Setter for customer's name.
 * @param {string} props.customerEmail - The customer's email.
 * @param {function} props.setCustomerEmail - Setter for customer's email.
 * @param {function} props.handleModifyQuantity - Function to modify ticket quantity.
 * @param {function} props.handleRemoveTicket - Function to remove a ticket type.
 * @param {function} props.handleNavigateToEvent - Function to navigate back to the event page.
 */
const OrderSummary = ({
    eventDetails,
    order,
    originalTotalAmount,
    isProcessingPayment,
    isAuthenticated,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    handleModifyQuantity,
    handleRemoveTicket,
    handleNavigateToEvent,
}) => {
    return (
        <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>Confirm Your Order: <span className={styles.gradientText}>{eventDetails.eventName}</span></h2>

            <div className={styles.eventSummary}>
                <img src={eventDetails.bannerImageUrl || 'https://placehold.co/100x100?text=Event'} alt={eventDetails.eventName} className={styles.eventThumbnail} />
                <div className={styles.eventInfo}>
                    <h4 className={styles.eventName}>{eventDetails.eventName}</h4>
                    <p className={styles.eventMeta}>{eventDetails.startDate ? new Date(eventDetails.startDate).toLocaleDateString() : 'N/A'} at {eventDetails.startTime} - {eventDetails.mainLocation}</p>
                </div>
            </div>

            <div className={styles.ticketsSummary}>
                <h3 className={styles.sectionSubHeader}>Selected Tickets:</h3>
                {order.tickets.length === 0 ? (
                    <p className={styles.noTicketsMessage}>No tickets selected. Please go back to the event page.</p>
                ) : (
                    <ul className={styles.ticketsList}>
                        {order.tickets.map(ticket => (
                            <li key={ticket.ticketTypeId} className={styles.ticketItem}>
                                <div className={styles.ticketDetails}>
                                    <span>{ticket.name}</span>
                                    <span className={styles.ticketPrice}>KES {parseFloat(ticket.price).toFixed(2)}</span>
                                </div>
                                <div className={styles.ticketQuantityControls}>
                                    {/* Allow decrement until quantity is 0 */}
                                    <button onClick={() => handleModifyQuantity(ticket.ticketTypeId, -1)} disabled={ticket.quantity <= 0 || isProcessingPayment} className={styles.quantityButton}>
                                        -
                                    </button>
                                    <span className={styles.ticketQuantity}>{ticket.quantity}</span>
                                    <button onClick={() => handleModifyQuantity(ticket.ticketTypeId, 1)} disabled={isProcessingPayment} className={styles.quantityButton}>
                                        +
                                    </button>
                                    {/* Remove button is always available if quantity > 0 */}
                                    <button onClick={() => handleRemoveTicket(ticket.ticketTypeId)} disabled={isProcessingPayment} className={styles.removeTicketButton} title="Remove all of this ticket type">
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={styles.totalSection}>
                <span>Subtotal:</span>
                <span className={styles.totalAmount}>KES {originalTotalAmount.toFixed(2)}</span>
            </div>

            <div className={styles.customerInfoSection}>
                <h3 className={styles.sectionSubHeader}>Your Information:</h3>
                {isAuthenticated ? (
                    <div className={styles.summaryDetails}>
                        <div className={styles.summaryItem}>
                            <p><UserIcon className={styles.summaryIcon} /> Name:</p>
                            <span>{customerName || 'N/A'}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <p><EnvelopeIcon className={styles.summaryIcon} /> Email:</p>
                            <span>{customerEmail || 'N/A'}</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.guestInfoForm}>
                        <p className={styles.guestMessage}>Please provide your details for ticket delivery.</p>
                        <TextInput
                            label="Your Full Name"
                            id="guestName"
                            name="guestName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g., John Doe"
                            required
                            disabled={isAuthenticated} // Explicitly enable/disable based on auth status
                            // Removed: icon={UserIcon}
                        />
                        <TextInput
                            label="Your Email Address"
                            id="guestEmail"
                            name="guestEmail"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="e.g., john.doe@example.com"
                            required
                            disabled={isAuthenticated} // Explicitly enable/disable based on auth status
                            // Removed: icon={EnvelopeIcon}
                        />
                        <p className={styles.guestAssurance}>
                            <InformationCircleIcon className={styles.infoIcon} /> Your details are only used for ticket delivery and event communication.
                        </p>
                    </div>
                )}
                <p className={styles.assuranceText}>
                    <CheckCircleIcon className={styles.checkIcon} /> Your tickets will be sent to <strong>{customerEmail || 'your email'}</strong> and will be available under your <Link to="/dashboard/my-tickets" className={styles.dashboardLink}>My Tickets</Link> section in your profile.
                </p>
            </div>
        </section>
    );
};

export default OrderSummary;
