import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Button from './../Common/Button';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Confirmation.module.css';
import pageStyles from '../../pages/CheckoutPage.module.css';
import commonButtonStyles from './../Common/Button.module.css';
import TicketDisplayCard from './TicketDisplayCard';
// CORRECTED: Import Fa icons from react-icons/fa
import { FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

const Confirmation = ({
    paymentStatus,
    paymentStatusMessage,
    customerEmail,
    orderId,
    generatedTickets,
    authenticatedUser,
    handleTryAgain,
    eventDetails,
}) => {
    const navigate = useNavigate();
    const [ticketsToDisplay, setTicketsToDisplay] = useState([]);

    const SUPPORT_EMAIL = "support@naksyetu.co.ke";
    const SUPPORT_PHONE = "+254 795 505007";
    const INSTAGRAM_HANDLE = "@naksyetu";
    const X_HANDLE = "@naksyetu";
    const TIKTOK_HANDLE = "@naksyetu_";

    // REMOVED: Function to mask email for display (as per instruction)
    // const maskEmail = (email) => {
    //     if (!email) return 'N/A';
    //     const [name, domain] = email.split('@');
    //     if (name.length <= 2) return `${name.substring(0, 1)}***@${domain}`;
    //     return `${name.substring(0, 2)}***@${domain}`;
    // };

    useEffect(() => {
        if (paymentStatus === 'completed' && generatedTickets && generatedTickets.length > 0) {
            setTicketsToDisplay(generatedTickets);
        } else if (paymentStatus === 'completed' && (!generatedTickets || generatedTickets.length === 0)) {
            setTicketsToDisplay([]);
        }
    }, [paymentStatus, generatedTickets]);


    const renderStatusContent = () => {
        switch (paymentStatus) {
            case 'completed':
                return (
                    <div className={styles.confirmationContent}>
                        <CheckCircleIcon className={`${styles.iconSuccess}`} />
                        <h2 className={`${styles.messageHeader} ${pageStyles.gradientText}`}>Payment Confirmed!</h2>
                        <p className={`${styles.messageSubHeader}`}>
                            Your tickets are being generated and will be sent to <span className="font-semibold">{customerEmail}</span> shortly.
                        </p>

                        <div className={styles.orderSummarySection}>
                            <h3 className={styles.orderSummaryHeader}>Order Details</h3>
                            <div className="space-y-2">
                                <div className={styles.orderDetailItem}>
                                    <span className={styles.orderDetailLabel}>Order ID:</span>
                                    <span className={styles.orderDetailValue}>{orderId || 'N/A'}</span>
                                </div>
                                <div className={styles.orderDetailItem}>
                                    <span className={styles.orderDetailLabel}>Event:</span>
                                    <span className={styles.orderDetailValue}>{eventDetails?.eventName || 'N/A'}</span>
                                </div>
                                <div className={styles.orderDetailItem}>
                                    <span className={styles.orderDetailLabel}>Date:</span>
                                    <span className={styles.orderDetailValue}>{eventDetails?.startDate && format(new Date(eventDetails.startDate), 'PPP') || 'N/A'}</span>
                                </div>
                                <div className={styles.orderDetailItem}>
                                    <span className={styles.orderDetailLabel}>Time:</span>
                                    <span className={styles.orderDetailValue}>{eventDetails?.startTime || 'N/A'}</span>
                                </div>
                                <div className={styles.orderDetailItem}>
                                    <span className={styles.orderDetailLabel}>Location:</span>
                                    <span className={styles.orderDetailValue}>{eventDetails?.mainLocation || 'N/A'}</span>
                                </div>
                                <div className={styles.orderDetailItem}>
                                    <span className={styles.orderDetailLabel}>Recipient Email:</span>
                                    <span className={styles.orderDetailValue}>{customerEmail || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {ticketsToDisplay.length > 0 && (
                            <div className={styles.ticketGridSection}>
                                <h3 className={styles.ticketGridHeader}>Your Tickets</h3>
                                <div className={styles.ticketsGrid}>
                                    {ticketsToDisplay.map((ticket, index) => (
                                        <TicketDisplayCard
                                            key={ticket.ticketId || index}
                                            ticket={ticket}
                                            eventDetails={eventDetails}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.supportInfoSection}>
                            <h3 className={styles.supportInfoHeader}>Need Help?</h3>
                            <p>Naks Yetu support is always ready to help 24/7.</p>
                            <p>Email: <span className={styles.supportEmail}>{SUPPORT_EMAIL}</span></p> {/* Display directly */}
                            <p>Phone: <span className={styles.supportPhone}>{SUPPORT_PHONE}</span></p>
                            <div className={styles.socialIconsContainer}>
                                <a href={`https://www.instagram.com/${INSTAGRAM_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Follow us on Instagram"><FaInstagram /></a>
                                <a href={`https://twitter.com/${X_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Follow us on X (Twitter)"><FaTwitter /></a>
                                <a href={`https://www.tiktok.com/${TIKTOK_HANDLE.substring(1)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Follow us on TikTok"><FaTiktok /></a>
                            </div>
                        </div>


                        <div className={styles.actionButtonsContainer}>
                            {authenticatedUser && (
                                <Button
                                    onClick={() => navigate('/user-dashboard/my-tickets')}
                                    className={`${styles.actionButton} ${styles.primary}`}
                                >
                                    Go to My Tickets
                                </Button>
                            )}
                            <Button
                                onClick={() => navigate('/events')}
                                className={`${styles.actionButton} ${styles.secondary}`}
                            >
                                Explore More Events
                            </Button>
                        </div>
                    </div>
                );
            case 'failed':
                return (
                    <div className={styles.confirmationContent}>
                        <XCircleIcon className={`${styles.iconInfo} text-red-500`} />
                        <h2 className={`${styles.messageHeader} text-red-600`}>Payment Not Successful</h2>
                        <p className={`${styles.messageSubHeader}`}>
                            {paymentStatusMessage || 'Payment failed. Please check your M-Pesa or try again.'}
                        </p>
                        <p className={`${styles.messageSubHeader}`}>Would you like to try again?</p>
                        <div className={styles.actionButtonsContainer}>
                            <Button
                                onClick={handleTryAgain}
                                className={`${styles.actionButton} ${styles.primary}`}
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={() => navigate('/events')}
                                className={`${styles.actionButton} ${styles.secondary}`}
                            >
                                Explore More Events
                            </Button>
                        </div>
                        <div className={styles.supportInfoSection}>
                            <h3 className={styles.supportInfoHeader}>Need Help?</h3>
                            <p>If you believe there was an error or need assistance, please contact us.</p>
                            <p>Email: <span className={styles.supportEmail}>{SUPPORT_EMAIL}</span></p> {/* Display directly */}
                            <p>Phone: <span className={styles.supportPhone}>{SUPPORT_PHONE}</span></p>
                            <p className={styles.supportDisclaimer}>Naks Yetu support is always ready to help 24/7.</p>
                        </div>
                    </div>
                );
            case 'pending':
            case 'processing':
            case 'stk_push_sent':
            case 'pending_manual':
            default:
                return null; // This case is now handled by the ProcessingModalContent
        }
    };

    return (
        <div className={styles.confirmationContainer}>
            {renderStatusContent()}
        </div>
    );
}
export default Confirmation;