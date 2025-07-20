// src/components/Checkout/OrderAndCouponSummary.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../Common/TextInput.jsx';
import Button from '../Common/Button.jsx';
import styles from './OrderAndCouponSummary.module.css'; // New CSS module
import {
    UserIcon, EnvelopeIcon, InformationCircleIcon, CheckCircleIcon // For customer info
} from '@heroicons/react/24/outline';

/**
 * Renders the combined order summary and coupon application section.
 * This is the first step of the checkout wizard.
 *
 * @param {object} props - The component props.
 * @param {object} props.eventDetails - Details of the event.
 * @param {object} props.order - The current order object.
 * @param {number} props.originalTotalAmount - The total amount before any discounts.
 * @param {boolean} props.isProcessingPayment - Flag indicating if payment is in progress.
 * @param {boolean} props.isAuthenticated - Flag indicating if the user is authenticated.
 * @param {object} props.currentUser - The current user object from useAuth.
 * @param {string} props.customerName - The customer's name.
 * @param {function} props.handleCustomerNameChange - The event handler for customer name input.
 * @param {string} props.customerEmail - The customer's email.
 * @param {function} props.handleCustomerEmailChange - The event handler for customer email input.
 * @param {function} props.handleModifyQuantity - Function to modify ticket quantity.
 * @param {function} props.handleRemoveTicket - Function to remove a ticket type.
 * @param {string} props.couponCode - The current value of the coupon input.
 * @param {function} props.setCouponCode - Setter for the coupon code.
 * @param {object} props.appliedCoupon - Object containing details of the applied coupon.
 * @param {function} props.handleApplyCoupon - Function to call when the "Apply Coupon" button is clicked.
 * @param {number} props.totalAmount - The current total amount of the order, including any discounts.
 * @param {string} props.mpesaPhoneNumber - The M-Pesa phone number.
 * @param {function} props.handlePhoneChange - Handler for M-Pesa phone number input change.
 */
const OrderAndCouponSummary = ({
    eventDetails,
    order,
    originalTotalAmount,
    isProcessingPayment,
    isAuthenticated,
    currentUser, // NEW: Pass currentUser to distinguish anonymous
    customerName,
    handleCustomerNameChange,
    customerEmail,
    handleCustomerEmailChange,
    handleModifyQuantity,
    handleRemoveTicket,
    couponCode,
    setCouponCode,
    appliedCoupon,
    handleApplyCoupon,
    totalAmount,
    mpesaPhoneNumber,
    handlePhoneChange
}) => {
    const discountAmount = appliedCoupon ? (originalTotalAmount * appliedCoupon.discount) : 0;

    // Determine if the user is a permanently logged-in user (not anonymous)
    const isPermanentlyAuthenticated = isAuthenticated && currentUser && !currentUser.isAnonymous;

    return (
        <section className={styles.sectionCard}>
            <h2 className={styles.mainHeader}>Your Naks Yetu Order</h2>

            {/* Ticket Holder Details (User Details Section) */}
            <div className={styles.sectionBlock}>
                <h3 className={styles.sectionSubHeader}>Ticket Holder Details</h3>
                {isPermanentlyAuthenticated ? ( // Show pre-filled and disabled for permanent users
                    <div className={styles.summaryDetails}>
                        <div className={styles.summaryItem}>
                            <p><UserIcon className={styles.summaryIcon} /> Name:</p>
                            <span>{customerName || currentUser.displayName || 'N/A'}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <p><EnvelopeIcon className={styles.summaryIcon} /> Email:</p>
                            <span>{customerEmail || currentUser.email || 'N/A'}</span>
                        </div>
                    </div>
                ) : ( // Allow input for guests (including anonymous users)
                    <div className={styles.guestInfoForm}>
                        <p className={styles.guestMessage}>Please provide your details for ticket delivery.</p>
                        <TextInput
                            label="Full Name"
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={customerName}
                            onChange={handleCustomerNameChange}
                            placeholder="e.g., Jane Doe"
                            required
                            disabled={isProcessingPayment} // Disable only during payment processing
                        />
                        <TextInput
                            label="Email Address"
                            id="emailAddress"
                            name="emailAddress"
                            type="email"
                            value={customerEmail}
                            onChange={handleCustomerEmailChange}
                            placeholder="e.g., jane.doe@example.com"
                            required
                            disabled={isProcessingPayment} // Disable only during payment processing
                        />
                        {/* M-Pesa Phone Number Input - Now in Step 1 */}
                        <div className={styles.mpesaPhoneInputGroup}>
                            <label htmlFor="mpesaPhone" className={styles.formLabel}>M-Pesa Phone Number:</label>
                            <input
                                id="mpesaPhone"
                                name="mpesaPhone"
                                type="tel"
                                value={mpesaPhoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="e.g., 07XXXXXXXX or 01XXXXXXXX"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                disabled={isProcessingPayment} // Disable only during payment processing
                            />
                            <p className={styles.formHint}>Enter your Safaricom M-Pesa registered number for the STK Push.</p>
                        </div>
                        <p className={styles.guestAssurance}>
                            <InformationCircleIcon className={styles.infoIcon} /> Your details are only used for ticket delivery and event communication.
                        </p>
                    </div>
                )}
                <p className={styles.assuranceText}>
                    <CheckCircleIcon className={styles.checkIcon} /> Your tickets will be sent to <strong>{customerEmail || 'your email'}</strong> and will be available under your <Link to="/dashboard/my-tickets" className={styles.dashboardLink}>My Tickets</Link> section in your profile.
                </p>
            </div>

            {/* Order Summary Section */}
            <div className={styles.sectionBlock}>
                <h3 className={styles.sectionSubHeader}>Order Summary</h3>
                <div className={styles.eventSummary}>
                    <img src={eventDetails.bannerImageUrl || 'https://placehold.co/100x100?text=Event'} alt={eventDetails.eventName} className={styles.eventThumbnail} />
                    <div className={styles.eventInfo}>
                        <h4 className={styles.eventName}>{eventDetails.eventName}</h4>
                        <p className={styles.eventMeta}>{eventDetails.startDate ? new Date(eventDetails.startDate).toLocaleDateString() : 'N/A'} at {eventDetails.startTime} - {eventDetails.mainLocation}</p>
                    </div>
                </div>

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
                                    <button onClick={() => handleModifyQuantity(ticket.ticketTypeId, -1)} disabled={ticket.quantity <= 0 || isProcessingPayment} className={styles.quantityButton}>
                                        -
                                    </button>
                                    <span className={styles.ticketQuantity}>{ticket.quantity}</span>
                                    <button onClick={() => handleModifyQuantity(ticket.ticketTypeId, 1)} disabled={isProcessingPayment} className={styles.quantityButton}>
                                        +
                                    </button>
                                    <button onClick={() => handleRemoveTicket(ticket.ticketTypeId)} disabled={isProcessingPayment} className={styles.removeTicketButton} title="Remove all of this ticket type">
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Coupon Section */}
            <div className={styles.sectionBlock}>
                <h3 className={styles.sectionSubHeader}>Have a Coupon Code?</h3>
                <p className={styles.couponEncouragement}>
                    Unlock amazing savings! Use coupon codes from your favorite Naks Yetu influencers and get up to **KES {discountAmount.toFixed(2)} off** your current subtotal!
                </p>
                <div className={styles.couponInputContainer}>
                    <TextInput
                        label="Enter coupon code here"
                        id="couponCode"
                        name="couponCode"
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g., NAKSYETU10"
                    />
                    <Button onClick={handleApplyCoupon} className={styles.applyButton}>
                        Apply
                    </Button>
                </div>
                {appliedCoupon && (
                    <div className={styles.appliedCouponInfo}>
                        <p>Coupon <strong>{appliedCoupon.code}</strong> applied!</p>
                        <p>Discount: <strong>{(appliedCoupon.discount * 100).toFixed(0)}% OFF</strong></p>
                    </div>
                )}
            </div>

            {/* Final Total Section */}
            <div className={styles.finalTotalSection}>
                <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span>KES {originalTotalAmount.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                    <div className={styles.totalRow}>
                        <span>Discount ({appliedCoupon.code}):</span>
                        <span className={styles.discountAmount}>- KES {discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                    <span>Total to Pay</span>
                    <span>KES {totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </section>
    );
};

export default OrderAndCouponSummary;