// src/components/Checkout/Confirmation.jsx
import React from 'react';
import styles from './Confirmation.module.css';
import commonFormStyles from '../../pages/Organizer/Dashboard/Tabs/CreateEventWizard.module.css';
import { CheckCircleIcon, InformationCircleIcon, TicketIcon, CalendarDaysIcon, ArrowPathIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * Renders the payment confirmation section with real-time status updates.
 *
 * @param {object} props - The component props.
 * @param {string} props.paymentStatusMessage - The message indicating the payment status.
 * @param {string} props.customerEmail - The customer's email for ticket delivery information.
 * @param {boolean} props.isProcessingPayment - True if payment is still being processed/polled.
 * @param {boolean} props.isAuthenticated - True if the user is logged in.
 * @param {function} props.handleNavigateToTickets - Function to navigate to "My Tickets" page.
 * @param {function} props.handleExploreMoreEvents - Function to navigate to "Explore Events" page.
 * @param {function} props.handleRetryPayment - Function to navigate back to the payment step.
 */
const Confirmation = ({
    paymentStatusMessage,
    customerEmail,
    isProcessingPayment,
    isAuthenticated,
    handleNavigateToTickets,
    handleExploreMoreEvents,
    handleRetryPayment
}) => {
    // Determine status based on message content
    const isSuccessful = paymentStatusMessage.includes('successful') || paymentStatusMessage.includes('generating tickets');
    const isFailed = paymentStatusMessage.includes('failed') || paymentStatusMessage.includes('timed out') || paymentStatusMessage.includes('error');
    // If not successful, not failed, and still processing, it's pending
    const isPending = isProcessingPayment && !isSuccessful && !isFailed;

    return (
        <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>Payment Status</h2>
            <div className={styles.confirmationContent}>
                {isPending ? (
                    <>
                        <InformationCircleIcon className={styles.confirmationIconInfo} />
                        <h3 className={styles.confirmationMessageInfo}>Waiting on your payment...</h3>
                        <p className={styles.confirmationSubMessage}>{paymentStatusMessage}</p>
                        <div className={styles.spinner}></div>
                        <p className={styles.smallText}>
                            Please approve the STK Push on your phone. This page will update automatically.
                        </p>
                    </>
                ) : isSuccessful ? (
                    <>
                        <CheckCircleIcon className={styles.confirmationIconSuccess} />
                        <h3 className={styles.confirmationMessageSuccess}>Payment Confirmed!</h3>
                        <p className={styles.confirmationSubMessage}>
                            Your tickets are being generated and will be sent to <strong>{customerEmail || 'your email'}</strong> shortly.
                        </p>
                        {isAuthenticated && (
                            <p className={styles.smallText}>
                                You can also access your tickets anytime in your profile under <a onClick={handleNavigateToTickets} className={styles.dashboardLink}>My Tickets</a>.
                            </p>
                        )}
                        <div className={styles.navigationButtons}>
                            {isAuthenticated && (
                                <button onClick={handleNavigateToTickets} className={commonFormStyles.primaryButton}>
                                    <TicketIcon className="h-5 w-5" /> Go to My Tickets
                                </button>
                            )}
                            <button onClick={handleExploreMoreEvents} className={commonFormStyles.secondaryButton}>
                                <CalendarDaysIcon className="h-5 w-5" /> Explore More Events
                            </button>
                        </div>
                    </>
                ) : isFailed ? (
                    <>
                        <XCircleIcon className={styles.confirmationIconFailed} />
                        <h3 className={styles.confirmationMessageFailed}>Payment Not Successful</h3>
                        <p className={styles.confirmationSubMessage}>{paymentStatusMessage}</p>
                        <p className={styles.smallText}>Would you like to try again?</p>
                        <div className={styles.navigationButtons}>
                            <button onClick={handleRetryPayment} className={commonFormStyles.primaryButton}>
                                <ArrowPathIcon className="h-5 w-5" /> Try Again
                            </button>
                            <button onClick={handleExploreMoreEvents} className={commonFormStyles.secondaryButton}>
                                <CalendarDaysIcon className="h-5 w-5" /> Go to Events
                            </button>
                        </div>
                    </>
                ) : (
                    // Fallback state if status is unclear (e.g., initial render before polling starts)
                    <>
                        <InformationCircleIcon className={styles.confirmationIconInfo} />
                        <h3 className={styles.confirmationMessageInfo}>Awaiting Payment Status</h3>
                        <p className={styles.confirmationSubMessage}>
                            We're waiting for confirmation. This page will update automatically.
                        </p>
                        <div className={styles.spinner}></div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Confirmation;