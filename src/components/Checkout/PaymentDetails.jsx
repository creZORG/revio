// src/components/Checkout/PaymentDetails.jsx
import React, { useState } from 'react';
// Removed: import TextInput from '../Common/TextInput.jsx'; // No longer needed for phone number input
import Button from '../Common/Button.jsx'; // Assuming you have a Button component
import styles from './PaymentDetails.module.css';
import commonFormStyles from '../../pages/Organizer/Dashboard/Tabs/CreateEventWizard.module.css'; // For common button styles
import { InformationCircleIcon } from '@heroicons/react/24/outline'; // Keeping for info icon

/**
 * Renders the payment details section with STK Push and Manual Pay tabs.
 *
 * @param {object} props - The component props.
 * @param {string} props.mpesaPhoneNumber - The M-Pesa phone number.
 * @param {function} props.handlePhoneChange - Handler for M-Pesa phone number input change.
 * @param {boolean} props.isProcessingPayment - Flag indicating if payment is in progress.
 * @param {object} props.eventDetails - Details of the event.
 * @param {number} props.totalAmount - The total amount to be paid.
 * @param {string} props.customerName - The customer's name (for account reference).
 * @param {string} props.currentUserUid - The current user's UID (for account reference fallback).
 * @param {function} props.showNotification - Function to display notifications.
 * @param {function} props.initiateSTKPushPayment - Function to call the PHP backend for STK Push.
 */
const PaymentDetails = ({
    mpesaPhoneNumber,
    handlePhoneChange, // This prop is passed from the parent CheckoutPage
    isProcessingPayment,
    eventDetails,
    totalAmount,
    customerName,
    currentUserUid,
    showNotification,
    initiateSTKPushPayment // New prop for STK Push initiation
}) => {
    const [activeTab, setActiveTab] = useState('stkPush'); // 'stkPush' or 'manualPay'

    const PAYBILL_NUMBER = "4168319";
    const ACCOUNT_REFERENCE_DISPLAY = `NAKS_${(customerName.replace(/\s+/g, '') || currentUserUid?.substring(0, 5) || 'Guest').substring(0, 5).toUpperCase()}_${eventDetails.eventName.replace(/\s+/g, '').substring(0, 5).toUpperCase()}`;

    // Determine if the STK Push button should be disabled
    // The button is disabled if processing, total is 0, or phone number is invalid for initiation
    const isSTKPushButtonDisabled = isProcessingPayment || totalAmount <= 0 || !mpesaPhoneNumber || !(mpesaPhoneNumber.startsWith('2547') || mpesaPhoneNumber.startsWith('2541')) || mpesaPhoneNumber.length !== 12;

    return (
        <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>M-Pesa Payment</h2>

            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'stkPush' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('stkPush')}
                    disabled={isProcessingPayment}
                >
                    STK Push
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'manualPay' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('manualPay')}
                    disabled={isProcessingPayment}
                >
                    Manual Pay
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'stkPush' && (
                    <div className={styles.stkPushContent}>
                        <div className="w-full max-w-sm mb-4"> {/* Added a wrapper for styling consistency */}
                            <label htmlFor="mpesaPhone" className={styles.formLabel}>M-Pesa Phone Number:</label>
                            <input
                                id="mpesaPhone"
                                name="mpesaPhone"
                                type="tel" // Use type="tel" for phone numbers
                                value={mpesaPhoneNumber}
                                onChange={handlePhoneChange} // Directly use the prop from the parent
                                placeholder="e.g., 07XXXXXXXX or 01XXXXXXXX"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                disabled={isProcessingPayment} // Only disable if payment is in progress
                            />
                            <p className={styles.formHint}>Enter your Safaricom M-Pesa registered number for the STK Push.</p>
                        </div>

                        <div className={styles.totalSection}>
                            <span>Amount to Pay:</span>
                            <span className={styles.totalAmount}>KES {totalAmount.toFixed(2)}</span>
                        </div>

                        <Button
                            onClick={initiateSTKPushPayment}
                            className={commonFormStyles.primaryButton} // Using common button style
                            disabled={isSTKPushButtonDisabled} // Button disabled based on validation
                        >
                            {isProcessingPayment ? 'Processing...' : `Initiate STK Push for KES ${totalAmount.toFixed(2)}`}
                        </Button>
                        <p className={styles.stkInfo}>
                            <InformationCircleIcon className={styles.infoIcon} /> A pop-up will appear on your phone to confirm payment.
                        </p>
                    </div>
                )}

                {activeTab === 'manualPay' && (
                    <div className={styles.manualPayContent}>
                        <p className={styles.instructionIntro}>
                            Your payment for **{eventDetails.eventName}** is **KES {totalAmount.toFixed(2)}**.
                            Please use the following details to complete your payment via M-Pesa.
                        </p>
                        <div className={styles.manualPayDetails}>
                            <p><strong>Business No.:</strong> <span id="paybill-number">{PAYBILL_NUMBER}</span>
                                <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(PAYBILL_NUMBER).then(() => showNotification('Paybill copied!', 'info'))}>
                                    Copy
                                </button>
                            </p>
                            <p><strong>Account No.:</strong> <span id="account-number" className={styles.highlightText}>{ACCOUNT_REFERENCE_DISPLAY}</span>
                                <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(ACCOUNT_REFERENCE_DISPLAY).then(() => showNotification('Account number copied!', 'info'))}>
                                    Copy
                                </button>
                            </p>
                            <p><strong>Amount:</strong> <span id="amount-display" className={styles.highlightText}>KES {totalAmount.toFixed(2)}</span></p>
                        </div>
                        <p className={styles.manualPayInstructions}>
                            <InformationCircleIcon className={styles.infoIcon} /> Follow these steps on your phone:
                        </p>
                        <ol className={styles.instructionList}>
                            <li>Go to your M-Pesa menu.</li>
                            <li>Select **"Lipa Na M-Pesa"**.</li>
                            <li>Select **"Pay Bill"**.</li>
                            <li>Enter **Business No.** as **<span className={styles.highlightText}>{PAYBILL_NUMBER}</span>**.</li>
                            <li>Enter **Account No.** as **<span className={styles.highlightText}>{ACCOUNT_REFERENCE_DISPLAY}</span>**.</li>
                            <li>Enter **Amount** as **<span className={styles.highlightText}>KES {totalAmount.toFixed(2)}</span>**.</li>
                            <li>Enter your M-Pesa PIN and confirm.</li>
                        </ol>
                        <p className={styles.finalInstructionText}>
                            **Important:** Use the Account No. exactly as displayed. Your tickets will be confirmed after payment.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PaymentDetails;
