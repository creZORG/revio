import React, { useEffect, useRef } from 'react'; // Added useRef
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import pageStyles from '../../pages/CheckoutPage.module.css';
import confirmationStyles from './Confirmation.module.css';
import { FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext.jsx'; // Import useNotification

const ProcessingModalContent = ({ paymentStatusMessage, onInitiatePayment }) => {
    const { showNotification } = useNotification(); // Use notification hook
    const hasInitiatedPaymentRef = useRef(false); // Local ref to ensure onInitiatePayment is called once
    const notificationShownRef = useRef(false); // Local ref to ensure notification is shown once per mount

    const SUPPORT_EMAIL = "support@naksyetu.co.ke";
    const SUPPORT_PHONE = "+254 795 505007";
    const INSTAGRAM_HANDLE = "@naksyetu";
    const X_HANDLE = "@naksyetu";
    const TIKTOK_HANDLE = "@naksyetu_";

    const maskEmail = (email) => {
        if (!email) return 'N/A';
        const [name, domain] = email.split('@');
        if (name.length <= 2) return `${name.substring(0, 1)}***@${domain}`;
        return `${name.substring(0, 2)}***@${domain}`;
    };

    // CRITICAL FIX: Trigger payment initiation and show notification when this modal mounts
    useEffect(() => {
        // Ensure onInitiatePayment is a function and only call it once per modal mount
        if (typeof onInitiatePayment === 'function' && !hasInitiatedPaymentRef.current) {
            console.log("ProcessingModalContent: Triggering payment initiation on mount.");
            onInitiatePayment();
            hasInitiatedPaymentRef.current = true; // Mark as called

            // Show notification only once when the modal is first opened for this process
            if (!notificationShownRef.current) {
                showNotification(paymentStatusMessage || "Payment is being processed. Please check your phone.", "info");
                notificationShownRef.current = true;
            }
        }
    }, [onInitiatePayment, paymentStatusMessage, showNotification]); // Depend on onInitiatePayment and message

    return (
        <div className={confirmationStyles.confirmationContent}>
            <InformationCircleIcon className={`${confirmationStyles.iconInfo}`} />
            <h2 className={`${confirmationStyles.messageHeader}`}>Waiting on your payment...</h2>
            <p className={`${confirmationStyles.messageSubHeader}`}>
                {paymentStatusMessage || 'Please approve the STK Push on your phone or complete the manual transaction.'}
            </p>
            <div className={pageStyles.spinner}></div>

            <div className={confirmationStyles.supportInfoSection}>
                <h3 className={confirmationStyles.supportInfoHeader}>Are you here but you already paid?</h3>
                <p>Please wait as we process your payment. This page will update automatically once payment is confirmed.</p>
                <h3 className={confirmationStyles.supportInfoHeader}>Did you get a double STK push?</h3>
                <p>Your tickets are safe. Double payments will be refunded, and your tickets are automatically sent to your email on successful payment.</p>
                <p className={confirmationStyles.supportDisclaimer}>Naks Yetu support is always ready to help 24/7.</p>
                <p>Email: <span className={confirmationStyles.supportEmail}>{maskEmail(SUPPORT_EMAIL)}</span></p>
                <p>Phone: <span className={confirmationStyles.supportPhone}>{SUPPORT_PHONE}</span></p>
                <div className={confirmationStyles.socialIconsContainer}>
                    <a href={`https://www.instagram.com/${INSTAGRAM_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={confirmationStyles.socialIcon} aria-label="Follow us on Instagram"><FaInstagram /></a>
                    <a href={`https://twitter.com/${X_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={confirmationStyles.socialIcon} aria-label="Follow us on X (Twitter)"><FaTwitter /></a>
                    <a href={`https://www.tiktok.com/${TIKTOK_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={confirmationStyles.socialIcon} aria-label="Follow us on TikTok"><FaTiktok /></a>
                </div>
            </div>
        </div>
    );
};

export default ProcessingModalContent;