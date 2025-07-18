// /src/pages/Checkout/Steps/ConfirmationStep.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'; // Added FaExclamationTriangle for warnings

import Button from '../../../components/Common/Button.jsx';
import styles from './ConfirmationStep.module.css'; // Dedicated styles
import commonStyles from '../../CheckoutPage.module.css'; // For common checkout page styles

const ConfirmationStep = ({ checkoutData, onClose }) => { // onClose prop might be useful to close wizard/modal
    const navigate = useNavigate();
    const { paymentStatus, transactionId, event, customerEmail } = checkoutData;

    const isSuccess = paymentStatus === 'completed';
    const isFailed = paymentStatus === 'failed';
    const isPending = paymentStatus === 'pending' || paymentStatus === 'processing'; // For cases where it's still being confirmed

    const handleButtonClick = () => {
        if (isSuccess) {
            navigate('/dashboard/my-tickets'); // Go to user's tickets
        } else {
            navigate(`/events/${event?.id}`); // Go back to event page to try again
        }
        // Optionally call onClose if ConfirmationStep is part of a modal
        if (onClose) onClose();
    };

    return (
        <motion.div
            className={`${commonStyles.section} ${styles.confirmationSection}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.confirmationContent}>
                {isSuccess && (
                    <FaCheckCircle className={styles.modalIconSuccess} />
                )}
                {isFailed && (
                    <FaTimesCircle className={styles.modalIconError} />
                )}
                {isPending && (
                    <FaExclamationTriangle className={styles.modalIconWarning} /> // Use warning icon for pending
                )}
                
                {isSuccess && (
                    <>
                        <h3>Payment Successful!</h3>
                        <p>Your purchase for **{checkoutData.event?.eventName}** is complete!</p>
                        <p>Your tickets have been sent to <strong>{customerEmail || 'your email address'}</strong>.</p>
                        {transactionId && <p className={styles.transactionIdText}>Transaction ID: <strong>{transactionId}</strong></p>}
                        <p>You can also find them in your <Link to="/dashboard/my-tickets" className={styles.modalLink}>My Tickets</Link> section of your profile.</p>
                    </>
                )}
                {isFailed && (
                    <>
                        <h3>Payment Could Not Be Processed.</h3>
                        <p>Your payment for **{checkoutData.event?.eventName}** failed.</p>
                        <p>{checkoutData.mpesaError || 'An unexpected error occurred. Please check your M-Pesa number or try again.'}</p>
                        {transactionId && <p className={styles.transactionIdText}>Attempted ID: <strong>{transactionId}</strong></p>}
                    </>
                )}
                {isPending && ( /* Case for if user refreshes or comes back while payment is pending */
                    <>
                        <h3>Payment Status Unknown.</h3>
                        <p>Your payment for **{checkoutData.event?.eventName}** is currently being processed or its status is pending confirmation.</p>
                        <p>Please check your M-Pesa messages or your profile's "My Tickets" dashboard in a few minutes.</p>
                    </>
                )}

                <Button onClick={handleButtonClick} className={isSuccess ? commonStyles.btnPrimary : commonStyles.btnSecondary}>
                    {isSuccess ? 'View My Tickets' : 'Go Back to Event'}
                </Button>
            </div>
        </motion.div>
    );
};

ConfirmationStep.validate = (data) => {
    // This is a display-only step, no validation needed
    return {};
};

export default ConfirmationStep;