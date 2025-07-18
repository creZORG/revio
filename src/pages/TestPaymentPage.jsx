// /src/pages/TestPaymentPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa'; 

import TextInput from '../components/Common/TextInput.jsx';
import Button from '../components/Common/Button.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx'; 

import styles from './TestPaymentPage.module.css';

// NEW: Use the URL of your deployed PHP script for STK push initiation
// REPLACE THIS WITH YOUR ACTUAL DEPLOYED PHP SCRIPT URL
const PHP_STK_INITIATE_URL = "https://platform.naksyetu.co.ke/paystack_initiate.php"; // THIS IS THE URL TO YOUR paystack_initiate.php


const TestPaymentPage = () => {
    const { showNotification } = useNotification();
    const [phoneNumber, setPhoneNumber] = useState(''); 
    const [status, setStatus] = useState('initial'); 
    const [isLoading, setIsLoading] = useState(false);
    const [logMessages, setLogMessages] = useState([]); 
    const [message, setMessage] = useState(''); 
    const [transactionId, setTransactionId] = useState(null); 

    const logsEndRef = useRef(null); 

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logMessages]);

    const addLog = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogMessages(prev => [...prev, { time: timestamp, message: msg, type }]);
        setMessage(msg); 
    };

    const handleInitiateSTKPush = async () => { 
        setLogMessages([]); 
        addLog('Test initiated. Validating...', 'info');
        setStatus('initiating');
        setIsLoading(true);

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

        addLog('Calling PHP endpoint for STK Push initiation...', 'info');
        
        try {
            const requestBody = { 
                phoneNumber: phoneNumber,
                totalAmount: 1, // Fixed to 1 KES for testing
                eventName: "Test PHP Event", // Mock event name
                customerEmail: "test.user@example.com", 
                customerName: "Test User",        
                userId: "test-user-123", 
                eventId: "test-event-id-123", // Required by PHP for Firestore record
                selectedTickets: { "test-ticket-id": 1 }, // Required by PHP for Firestore record
            };
            
            const response = await fetch(PHP_STK_INITIATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json(); 
            console.log("PHP endpoint raw response:", response); 
            console.log("PHP endpoint parsed result:", result); 
            addLog(`HTTP Response Status: ${response.status} ${response.statusText}`, response.ok ? 'info' : 'error');

            if (response.ok && result && result.success) { 
                addLog(`PHP Script Success: ${result.message}`, 'success');
                addLog(`CheckoutRequestID: ${result.checkoutRequestID || 'N/A'}, PaymentId: ${result.paymentId || 'N/A'}`, 'info');
                setTransactionId(result.paymentId || result.checkoutRequestID || null); 
                setStatus('stk_sent'); 
                addLog('STK Push sent! Please check your phone to complete payment.', 'stk_sent');

                // --- NEW: Start Firestore listener to track payment status ---
                // Requires 'db', 'doc', 'onSnapshot' imports from firebaseConfig and firestore
                // For this test page, we'll keep it simple and assume success once STK is sent.
                // For a full system, you would poll the Firestore document created by PHP.

            } else {
                addLog(`PHP Script Failed: ${result.message || 'Unknown error from PHP script.'}`, 'error');
                if (result.error?.errorMessage) {
                    addLog(`Daraja Error: ${result.error.errorMessage} (Code: ${result.error.errorCode})`, 'error');
                }
                setStatus('failed');
            }

        } catch (error) {
            console.error("TestPaymentPage: General Error during STK Push process:", error);
            addLog(`General Error: ${error.message || 'Failed to send request to PHP script.'}`, 'error');
            setStatus('failed');
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.testCard}>
                <h1>M-Pesa STK Push Debugger (PHP Backend)</h1>
                <p>Initiate a 1 KES STK Push to test your PHP script and M-Pesa integration.</p>
                
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
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {status !== 'initial' && !isLoading && ( 
                    <div className={`${styles.finalStatus} ${styles[status]}`}>
                        {status === 'success' && <FaCheckCircle className={styles.finalStatusIcon} />}
                        {status === 'failed' && <FaTimesCircle className={styles.finalStatusIcon} />}
                        {status === 'stk_sent' && <FaPhone className={styles.finalStatusIcon} />}
                        {status === 'confirming' && <FaExclamationTriangle className={styles.finalStatusIcon} />}
                        
                        <h3>{status === 'success' ? 'STK Push Initiated Successfully!' : status === 'failed' ? 'STK Push Failed!' : 'STK Push Sent (Awaiting Confirmation)...'}</h3>
                        <p>{message}</p> 
                        {transactionId && <p>Last Tx ID: <strong>{transactionId}</strong></p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestPaymentPage;