// src/components/Checkout/CustomerInfoForm.jsx
import React from 'react';
import TextInput from '../Common/TextInput.jsx';
import styles from './CustomerInfoForm.module.css';
import { UserIcon, EnvelopeIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * Renders the customer information form or display.
 * If authenticated, shows user's name and email.
 * If not authenticated, provides input fields for guest details.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isAuthenticated - Flag indicating if the user is authenticated.
 * @param {string} props.customerName - The customer's name.
 * @param {function} props.setCustomerName - Setter for customer's name.
 * @param {string} props.customerEmail - The customer's email.
 * @param {function} props.setCustomerEmail - Setter for customer's email.
 */
const CustomerInfoForm = ({ isAuthenticated, customerName, setCustomerName, customerEmail, setCustomerEmail }) => {
    return (
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
                        icon={UserIcon}
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
                        icon={EnvelopeIcon}
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
    );
};

export default CustomerInfoForm;
