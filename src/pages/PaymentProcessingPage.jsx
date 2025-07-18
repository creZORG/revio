// /src/pages/TestPaymentPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, app, db } from '../utils/firebaseConfig.js'; // Import db to listen to Firestore
import { signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot

import TextInput from '../components/Common/TextInput.jsx';
import Button from '../components/Common/Button.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx'; // Use notification context

import styles from './TestPaymentPage.module.css'; // Dedicated CSS for this test page

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Your Firebase App ID

// Initialize Firebase Functions instance once
const functionsInstance = getFunctions(app);
const initiateMpesaPaymentCallable = httpsCallable(functionsInstance, 'initiateMpesaPayment');

const TestPaymentPage = () => {
    const { showNotification } = useNotification();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState('initial'); // 'initial', 'initiating', 'stk_sent', 'confirming', 'success', 'failed'
    const [isLoading, setIsLoading] = useState(false);
    const [logMessages, setLogMessages] = useState([]); // Array of { time, message, type } for UI logging

    const logsEndRef = useRef(null); // Ref for auto-scrolling logs

    // Auto-scroll logs to bottom
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logMessages]);

    const addLog = (message, type = 'info') => {
        setLogMessages(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
    };

    const handleInitiateSTKPush = async () => {
        setLogMessages([]); // Clear previous logs
        addLog('Test initiated. Authenticating...', 'info');
        setStatus('initiating');
        setIsLoading(true);

        // Basic validation
        if (!phoneNumber.trim()) {
            addLog('Error: Phone number is required.', 'error');
            setStatus('failed');
            setIsLoading(false);
            return;
        }
        if (!/^(07\d{8}|2547\d{8}|01\d{8})$/.test(phoneNumber)) {
            addLog('Error: Invalid Kenyan M-Pesa number.', 'error');
            setStatus('failed');
            setIsLoading(false);
            return;
        }

        let userId = null;
        let paymentDocId = null;
        let unsubscribe = null; // For Firestore listener

        try {
            // Step 1: Authenticate (Anonymously)
            const userCredential = await signInAnonymously(auth);
            userId = userCredential.user.uid;
            addLog(`Authenticated anonymously. User ID: ${userId}`, 'info');

            // Step 2: Call Cloud Function to initiate STK Push
            addLog('Calling Cloud Function: initiateMpesaPayment...', 'info');
            
            const result = await initiateMpesaPaymentCallable({
                eventId: "test-event-id-123", // Mock event ID
                eventName: "Test Payment Debug",      // Mock event name
                selectedTickets: { "test-ticket-id": 1 }, // Mock selected tickets
                totalAmount: 1,               // 1 KES for testing
                phoneNumber: phoneNumber,
                customerEmail: "test.user@naksyetu.com", // Mock email
                customerName: "Test User",        // Mock name
                userId: userId, 
            });

            if (result.data.success) {
                const { message: cfMessage, paymentId, checkoutRequestID } = result.data;
                paymentDocId = paymentId; // Store paymentDocId for logging

                addLog(`Cloud Function Success: ${cfMessage}`, 'success');
                addLog(`STK Push sent! Payment Doc ID: ${paymentId}, CheckoutRequestID: ${checkoutRequestID}`, 'info');
                setStatus('stk_sent');

                // Step 3: Start Real-time Listener (Polling) for Payment Status
                addLog('Starting Firestore listener for payment status updates...', 'info');
                const paymentDocRef = doc(db, `artifacts/${appId}/public/data_for_app/payments`, paymentDocId);
                
                unsubscribe = onSnapshot(paymentDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const paymentData = docSnap.data();
                        addLog(`Firestore Update: Status: ${paymentData.status}`, 'info');
                        addLog(`Log details: ${paymentData.log?.[paymentData.log.length - 1]?.details || 'No new details.'}`, 'info');

                        if (paymentData.status === 'completed') {
                            unsubscribe(); // Stop listening
                            addLog(`Payment Confirmed! Receipt: ${paymentData.mpesaReceiptNumber}`, 'success');
                            addLog('Ticket generation triggered (check Firebase Functions logs for `issueTicket`).', 'success');
                            setStatus('success');
                            setIsLoading(false); // Stop loading on final status
                        } else if (paymentData.status === 'failed' || paymentData.status === 'failed_issuance') {
                            unsubscribe(); // Stop listening
                            addLog(`Payment Failed! Reason: ${paymentData.errorReason || 'Unknown error.'}`, 'error');
                            setStatus('failed');
                            setIsLoading(false); // Stop loading on final status
                        } else if (paymentData.status === 'pending') {
                            addLog('Payment status is still pending confirmation from M-Pesa.', 'info');
                            setStatus('confirming');
                        } else if (paymentData.status === 'processing') {
                            addLog('Payment being processed by Cloud Function...', 'info');
                            setStatus('confirming');
                        }
                    } else {
                        addLog('Payment document not found or deleted in Firestore.', 'error');
                        setStatus('failed');
                        setIsLoading(false);
                    }
                }, (error) => {
                    console.error("Error listening to payment status:", error);
                    addLog(`Error listening to Firestore: ${error.message}`, 'error');
                    setStatus('failed');
                    setIsLoading(false);
                });

            } else {
                addLog(`Cloud Function Failed: ${result.data.message || 'STK Push initiation failed.'}`, 'error');
                setStatus('failed');
                setIsLoading(false);
            }

        } catch (error) {
            console.error("TestPaymentPage: General Error during STK Push process:", error);
            addLog(`General Error: ${error.message || 'Something went wrong.'}`, 'error');
            setStatus('failed');
            setIsLoading(false);
        } finally {
            // Keep setIsLoading(false) only after the final status is determined by onSnapshot
            // Or if an immediate error occurs.
        }
    };

    // Cleanup listener on unmount
    useEffect(() => {
        return () => {
            // If there's an active unsubscribe function, call it here
            // This is handled inside the handleInitiateSTKPush's onSnapshot block
        };
    }, []);


    return (
        <div className={styles.pageContainer}>
            <div className={styles.testCard}>
                <h1>M-Pesa STK Push Debugger</h1>
                <p>Initiate a 1 KES STK Push to test your Cloud Functions and M-Pesa integration.</p>
                
                <div className={styles.formGroup}>
                    <label htmlFor="phone-number" className={styles.formLabel}>M-Pesa Phone Number</label>
                    <TextInput
                        id="phone-number"
                        name="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., 0712345678 or 2547XXXXXXXX"
                        required
                        icon={FaPhone}
                        isDisabled={isLoading}
                    />
                </div>
                
                <Button 
                    onClick={handleInitiateSTKPush} 
                    className={styles.initiateButton} 
                    disabled={isLoading}
                >
                    {isLoading ? <FaSpinner className="fa-spin" /> : 'Initiate STK Push (KES 1.00)'}
                </Button>

                <div className={styles.logArea}>
                    <h3 className={styles.logTitle}>Live Debug Log</h3>
                    <div className={styles.logMessages}>
                        {logMessages.map((log, index) => (
                            <p key={index} className={`${styles.logMessage} ${styles[log.type]}`}>
                                <span className={styles.logTime}>[{log.time}]</span>
                                {log.type === 'processing' && <FaSpinner className={`${styles.logIcon} fa-spin`} />}
                                {log.type === 'success' && <FaCheckCircle className={styles.logIcon} />}
                                {log.type === 'error' && <FaTimesCircle className={styles.logIcon} />}
                                {log.type === 'info' && <FaInfoCircle className={styles.logIcon} />}
                                {log.type === 'stk_sent' && <FaPhone className={styles.logIcon} />}
                                {log.type === 'confirming' && <FaExclamationTriangle className={styles.logIcon} />}
                                {log.message}
                            </p>
                        ))}
                        <div ref={logsEndRef} /> {/* For auto-scrolling */}
                    </div>
                </div>

                {status !== 'initial' && !isLoading && (
                    <div className={`${styles.finalStatus} ${styles[status]}`}>
                        {status === 'success' && <FaCheckCircle className={styles.finalStatusIcon} />}
                        {status === 'failed' && <FaTimesCircle className={styles.finalStatusIcon} />}
                        {status === 'confirming' && <FaExclamationTriangle className={styles.finalStatusIcon} />}
                        
                        <h3>{status === 'success' ? 'Payment Flow Successful!' : status === 'failed' ? 'Payment Flow Failed!' : 'Status Confirming...'}</h3>
                        <p>{message}</p>
                        {transactionId && <p>Last Tx ID: <strong>{transactionId}</strong></p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestPaymentPage;