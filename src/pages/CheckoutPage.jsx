// src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { db } from '../utils/firebaseConfig.js';
import { collection, doc, setDoc, serverTimestamp, Timestamp, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx';
import Modal from '../components/Common/Modal.jsx';
import commonFormStyles from './Organizer/Dashboard/Tabs/CreateEventWizard.module.css';
import styles from './CheckoutPage.module.css';

// Import new components
import OrderAndCouponSummary from '../components/Checkout/OrderAndCouponSummary.jsx';
import Confirmation from '../components/Checkout/Confirmation.jsx'; // Will be heavily modified

import {
    ShoppingCartIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

import { getEventById } from '../services/eventApiService.js';

const BASE_URL = 'https://us-central1-naksyetu-9c648.cloudfunctions.net/initiateStkPush'; // Your initiateStkPush CF URL

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, loadingAuth, isAuthenticated, isAuthReady } = useAuth();
    const { showNotification } = useNotification();

    const functionsInstance = getFunctions();
    const createOrderCallable = httpsCallable(functionsInstance, 'createOrder');

    const { eventId: initialEventId, selectedTickets: initialSelectedTickets } = location.state || {};

    const [eventDetails, setEventDetails] = useState(null);
    const [order, setOrder] = useState(null); // 'order' state will still hold base info
    const [originalTotalAmount, setOriginalTotalAmount] = useState(0);

    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [initialDataError, setInitialDataError] = useState(null);

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
    const [darajaCheckoutRequestID, setDarajaCheckoutRequestID] = useState(null);

    // Use a ref to store the latest order data for async calls
    const latestOrderRef = useRef(order);
    useEffect(() => {
        latestOrderRef.current = order;
    }, [order]);


    const FIREBASE_PROJECT_ID = "naksyetu-9c648";
    const ORDERS_COLLECTION_PATH = `artifacts/${FIREBASE_PROJECT_ID}/public/data/orders`;
    const PAYMENTS_TRANSACTIONS_COLLECTION_PATH = `artifacts/${FIREBASE_PROJECT_ID}/public/data/payments`;

    useEffect(() => {
        const loadCheckoutData = async () => {
            // DEBUG: Log auth states
            console.log("DEBUG: loadCheckoutData useEffect triggered. loadingAuth:", loadingAuth, "isAuthReady:", isAuthReady, "currentUser:", currentUser);

            // CRITICAL FIX: Only proceed if auth is ready AND not currently loading auth
            if (!isAuthReady || loadingAuth) {
                console.log("DEBUG: loadCheckoutData returning early because auth not ready or loading.");
                return;
            }
            // Also, only load if order is not already set (prevent re-running after successful load)
            if (order && eventDetails) {
                console.log("DEBUG: loadCheckoutData returning early because order/eventDetails already set.");
                setLoadingInitialData(false); // Ensure loading is off if already set
                return;
            }


            if (!initialEventId || !initialSelectedTickets || Object.keys(initialSelectedTickets).length === 0) {
                setInitialDataError("No event or tickets selected for checkout. Redirecting...");
                showNotification("No event or tickets selected. Please select items from an event page.", 'error');
                setLoadingInitialData(false);
                setTimeout(() => navigate('/events', { replace: true }), 3000);
                return;
            }

            setLoadingInitialData(true);
            setInitialDataError(null);

            try {
                const fetchedEvent = await getEventById(initialEventId);

                if (!fetchedEvent) {
                    setInitialDataError("Event not found. It might have been removed or is unavailable.");
                    showNotification("Event not found. Please try again.", 'error');
                    setLoadingInitialData(false);
                    setTimeout(() => navigate('/events', { replace: true }), 3000);
                    return;
                }

                setEventDetails(fetchedEvent);

                let constructedTickets = [];
                let calculatedTotalPrice = 0;
                for (const ticketTypeId in initialSelectedTickets) {
                    const quantity = initialSelectedTickets[ticketTypeId];
                    const ticketDetail = fetchedEvent.ticketDetails.find(td => td.id === ticketTypeId);

                    if (ticketDetail && quantity > 0) {
                        constructedTickets.push({
                            ticketTypeId: ticketDetail.id,
                            name: ticketDetail.name,
                            price: ticketDetail.price,
                            quantity: quantity
                        });
                        calculatedTotalPrice += quantity * ticketDetail.price;
                    }
                }

                if (constructedTickets.length === 0) {
                    setInitialDataError("No valid tickets selected for checkout.");
                    showNotification("No valid tickets selected. Please re-select from the event page.", 'error');
                    setLoadingInitialData(false);
                    setTimeout(() => navigate('/events', { replace: true }), 3000);
                    return;
                }

                setOriginalTotalAmount(calculatedTotalPrice);
                setOrder({
                    orderId: `order_${currentUser?.uid || 'guest'}_${Date.now()}`,
                    userId: currentUser?.uid, // Use currentUser.uid (will be anonymous UID for guests)
                    customerName: currentUser?.displayName || '',
                    customerEmail: currentUser?.email || '',
                    mpesaPhoneNumber: '',
                    eventId: fetchedEvent.id,
                    eventDetails: { // Store essential event details, with fallbacks for undefined
                        id: fetchedEvent.id,
                        eventName: fetchedEvent.eventName || 'Unknown Event',
                        bannerImageUrl: fetchedEvent.bannerImageUrl || '',
                        startDate: fetchedEvent.startDate || '',
                        startTime: fetchedEvent.startTime || '',
                        mainLocation: fetchedEvent.mainLocation || 'Online/TBD',
                    },
                    tickets: constructedTickets,
                    totalAmount: calculatedTotalPrice,
                    couponApplied: null,
                    orderStatus: 'pending_initiation',
                    initiatedAt: null,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
                console.log("DEBUG: Initial order state set:", {
                    orderId: `order_${currentUser?.uid || 'guest'}_${Date.now()}`,
                    userId: currentUser?.uid,
                    customerName: currentUser?.displayName || '',
                    customerEmail: currentUser?.email || '',
                    mpesaPhoneNumber: '',
                    eventId: fetchedEvent.id,
                    eventDetails: fetchedEvent.eventDetails,
                    tickets: constructedTickets,
                    totalAmount: calculatedTotalPrice,
                    couponApplied: null,
                    orderStatus: 'pending_initiation',
                });


            } catch (err) {
                console.error("Error loading checkout data:", err);
                setInitialDataError(`Failed to load checkout details: ${err.message}`);
                showNotification("Failed to load checkout details. Please try again.", 'error');
            } finally {
                setLoadingInitialData(false);
            }
        };

        loadCheckoutData();
    }, [initialEventId, initialSelectedTickets, loadingAuth, currentUser, navigate, showNotification, isAuthReady, order, eventDetails]); // Added order, eventDetails to dependencies

    useEffect(() => {
        if (currentUser) {
            if (!customerName || customerName === 'Guest User') {
                setCustomerName(currentUser.displayName || 'Guest User');
            }
            if (!customerEmail) {
                setCustomerEmail(currentUser.email || '');
            }
        } else {
            setCustomerName('');
            setCustomerEmail('');
        }
    }, [currentUser, customerName, customerEmail]); // Added customerName, customerEmail to dependencies

    useEffect(() => {
        if (order) {
            let currentTotal = order.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
            setOriginalTotalAmount(currentTotal);

            let newCalculatedTotal = currentTotal;
            if (appliedCoupon && appliedCoupon.discount) {
                newCalculatedTotal = currentTotal * (1 - appliedCoupon.discount);
            }
            
            if (order.totalAmount !== newCalculatedTotal) { // Corrected from totalTotal
                setOrder(prevOrder => ({ ...prevOrder, totalAmount: newCalculatedTotal }));
                console.log("DEBUG: Order totalAmount updated:", newCalculatedTotal);
            }
        }
    }, [order?.tickets, appliedCoupon, order?.totalAmount]); // Corrected from totalTotal

    const totalAmount = order?.totalAmount || 0; // Corrected from totalTotal

    const handleModifyQuantity = (ticketTypeId, change) => {
        if (!order || isProcessingPayment) return;
        setOrder(prevOrder => {
            const updatedTickets = prevOrder.tickets.map(ticket => {
                if (ticket.ticketTypeId === ticketTypeId) {
                    const newQuantity = ticket.quantity + change;
                    return { ...ticket, quantity: Math.max(0, newQuantity) };
                }
                return ticket;
            }).filter(ticket => ticket.quantity > 0);

            const newOriginalTotal = updatedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
            setOriginalTotalAmount(newOriginalTotal);

            let newCalculatedTotal = newOriginalTotal;
            if (appliedCoupon && appliedCoupon.discount) {
                newCalculatedTotal = newOriginalTotal * (1 - appliedCoupon.discount);
            }
            return { ...prevOrder, tickets: updatedTickets };
        });
    };

    const handleRemoveTicket = (ticketTypeId) => {
        if (!order || isProcessingPayment) return;
        setOrder(prevOrder => {
            const updatedTickets = prevOrder.tickets.filter(ticket => ticket.ticketTypeId !== ticketTypeId);

            const newOriginalTotal = updatedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
            setOriginalTotalAmount(newOriginalTotal);

            let newCalculatedTotal = newOriginalTotal;
            if (appliedCoupon && appliedCoupon.discount) {
                newCalculatedTotal = newOriginalTotal * (1 - appliedCoupon.discount);
            }
            return { ...prevOrder, tickets: updatedTickets };
        });
    };

    const handlePhoneChange = useCallback((e) => {
        let value = e.target.value;
        value = value.replace(/[^0-9]/g, '');

        if (value.startsWith('0') && value.length > 10) {
            value = value.substring(0, 10);
        } else if (value.startsWith('254') && value.length > 12) {
            value = value.substring(0, 12);
        } else if (!value.startsWith('0') && !value.startsWith('254') && value.length > 9) {
            value = value.substring(0, 9);
        }

        if ((value.startsWith('07') || value.startsWith('01')) && value.length === 10) {
            value = '254' + value.substring(1);
        } else if ((value.startsWith('7') || value.startsWith('1')) && value.length === 9) {
            value = '254' + value;
        }

        setMpesaPhoneNumber(value);
        setOrder(prevOrder => ({ ...prevOrder, mpesaPhoneNumber: value }));
    }, [setMpesaPhoneNumber, setOrder]);

    const handleCustomerNameChange = (e) => {
        setCustomerName(e.target.value);
        setOrder(prevOrder => ({ ...prevOrder, customerName: e.target.value }));
    };

    const handleCustomerEmailChange = (e) => {
        setCustomerEmail(e.target.value);
        setOrder(prevOrder => ({ ...prevOrder, customerEmail: e.target.value }));
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            showNotification('Please enter a coupon code.', 'warning');
            setAppliedCoupon(null);
            setOrder(prevOrder => ({ ...prevOrder, couponApplied: null }));
            return;
        }

        if (couponCode.toUpperCase() === 'NAKSYETU10') {
            setAppliedCoupon({ code: 'NAKSYETU10', discount: 0.10 });
            showNotification('Coupon "NAKSYETU10" applied! You get 10% off.', 'success');
            setOrder(prevOrder => ({
                ...prevOrder,
                couponApplied: { code: 'NAKSYETU10', discount: 0.10 }
            }));
        } else {
            setAppliedCoupon(null);
            showNotification('Invalid or expired coupon code.', 'error');
            setOrder(prevOrder => ({ ...prevOrder, couponApplied: null }));
        }
    };

    // --- Step Navigation & Validation ---
    const handleNextStep = useCallback(async () => {
        // Validation for Step 1 (Order Confirmation & Payment)
        if (currentStep === 1) {
            if (order.tickets.length === 0) {
                showNotification("Your cart is empty. Please add tickets to proceed.", 'error');
                return;
            }
            if (!isAuthenticated) {
                if (!customerName.trim()) {
                    showNotification('Your name is required for the order.', 'error');
                    return;
                }
                if (!customerEmail.trim() || !/\S+@\S+\.\S+/.test(customerEmail)) {
                    showNotification('A valid email is required for ticket delivery.', 'error');
                    return;
                }
            }
            // Phone number validation is now done when moving from Step 1 to Step 2 (Payment)
            // This is the only place we update order.mpesaPhoneNumber before payment
            if (!mpesaPhoneNumber || !(mpesaPhoneNumber.startsWith('2547') || mpesaPhoneNumber.startsWith('2541')) || mpesaPhoneNumber.length !== 12) {
                showNotification("Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX or 2541XXXXXXXX).", 'error');
                return;
            }
            
            // This entire try/catch block for createOrderCallable is now moved to initiateSTKPushPayment
            // It will be called when the user clicks the "Initiate STK Push" button.
            // No action needed here other than proceeding to the next step.
        }

        // Validation for proceeding from any step if totalAmount is 0
        if (totalAmount <= 0 && currentStep < 2 && !(appliedCoupon?.discount === 1)) { // currentStep < 2 for 2 steps
            showNotification("Total amount is zero. Cannot proceed with payment unless a 100% coupon is applied.", 'error');
            return;
        }

        setCurrentStep(prev => prev + 1);
    }, [currentStep, totalAmount, order, isAuthenticated, customerName, customerEmail, showNotification, appliedCoupon, mpesaPhoneNumber, createOrderCallable, originalTotalAmount, eventDetails, currentUser]);

    const handlePrevStep = useCallback(() => {
        setCurrentStep(prev => prev - 1);
        if (currentStep === 2) { // If going back from Confirmation to Order & Payment
            setIsProcessingPayment(false);
            setPaymentStatusMessage('');
        }
    }, [currentStep]);

    const initiateSTKPushPayment = async () => {
        // This function is now called from the button on Step 1.
        // It needs to first create the order document via Cloud Function, then initiate STK Push.

        // Re-validate phone number just before initiating payment to be safe
        if (!mpesaPhoneNumber || !(mpesaPhoneNumber.startsWith('2547') || mpesaPhoneNumber.startsWith('2541')) || mpesaPhoneNumber.length !== 12) {
            showNotification("Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX or 2541XXXXXXXX).", 'error');
            setIsProcessingPayment(false);
            return;
        }
        if (!isAuthenticated && (!customerName || !customerEmail)) {
            showNotification("Please provide your name and email for the order.", 'error');
            setIsProcessingPayment(false);
            return;
        }
        
        if (totalAmount <= 0 && appliedCoupon?.discount !== 1) {
            showNotification("Cannot process payment for zero amount unless a 100% coupon is applied.", 'error');
            setIsProcessingPayment(false);
            return;
        }

        setIsProcessingPayment(true);
        setPaymentStatusMessage('Initiating M-Pesa STK Push...');
        setInitialDataError(null);

        let currentOrderId = order.orderId; // Initialize with current orderId

        try {
            // CRITICAL FIX: Call createOrder callable function for ALL users here
            // This ensures the order document is created/updated securely by the CF
            setPaymentStatusMessage('Finalizing order details...'); // Update modal message

            const orderDataForCloudFunction = {
                orderId: order.orderId, // Use existing generated orderId
                customerName: customerName, // Use from state
                customerEmail: customerEmail, // Use from state
                mpesaPhoneNumber: mpesaPhoneNumber, // Use the collected phone number
                eventId: order.eventId, // Use from order state
                eventDetails: order.eventDetails, // Use from order state
                tickets: order.tickets, // Use from order state
                originalTotalAmount: originalTotalAmount, // Use from state
                totalAmount: totalAmount, // Use from state
                couponApplied: appliedCoupon, // Use from state
                userId: currentUser?.uid, // Pass the actual UID from AuthContext (anonymous or authenticated)
                checkoutRequestIdFromMpesa: `ws_CO_${currentUser?.uid || 'guest'}_${Date.now()}` // Temporary ID
            };
            console.log("Calling createOrder with:", orderDataForCloudFunction);

            const createOrderResult = await createOrderCallable(orderDataForCloudFunction);
            console.log("createOrder result:", createOrderResult.data);

            if (createOrderResult.data.success) {
                // Update local order state with confirmed IDs from Cloud Function
                // This is crucial for the subsequent STK Push call
                const updatedOrderFromCF = {
                    ...order, // Start with existing order data
                    checkoutRequestID: createOrderResult.data.checkoutRequestId,
                    orderStatus: 'pending_initiation',
                    mpesaPhoneNumber: mpesaPhoneNumber, // Ensure phone number is on order state
                    userId: currentUser?.uid, // Ensure userId is correctly set from CF's perspective
                    customerName: customerName, // Ensure latest customerName
                    customerEmail: customerEmail, // Ensure latest customerEmail
                };
                setOrder(updatedOrderFromCF); // Update state for polling and subsequent calls
                setDarajaCheckoutRequestID(createOrderResult.data.checkoutRequestId);
                currentOrderId = updatedOrderFromCF.orderId; // Update currentOrderId for this scope
                showNotification('Order prepared successfully!', 'success');
            } else {
                throw new Error(createOrderResult.data.message || 'Failed to prepare order via Cloud Function.');
            }
        } catch (error) {
            console.error("Error creating order via Cloud Function:", error);
            showNotification(`Error preparing order: ${error.message}`, 'error');
            setInitialDataError(`Error preparing order: ${error.message}`);
            setIsProcessingPayment(false); // Turn off loading
            return; // Stop progression if order creation fails
        }

        // Now, proceed with initiating STK Push
        setPaymentStatusMessage('Initiating M-Pesa STK Push...'); // Update message for next stage

        try {
            // CRITICAL FIX: Use the most recent order data (updatedOrderFromCF) for the STK push payload
            // This ensures all fields are correctly populated.
            const orderDataForStkPush = {
                phoneNumber: mpesaPhoneNumber, // Use directly from state
                amount: totalAmount, // Use directly from state
                event_id: eventDetails.id, // Use directly from state
                user_id: currentUser?.uid, // Use directly from state
                selected_tickets: order.tickets, // Use from order state (should be consistent)
                coupon_code: appliedCoupon?.code || null, // Use from state
                transaction_description: `Naks Yetu Tickets for ${eventDetails?.eventName}`, // Use directly from state
                checkout_request_id: darajaCheckoutRequestID, // Use directly from state
            };
            console.log("Calling initiateStkPush with:", orderDataForStkPush);


            const response = await fetch(`${BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDataForStkPush), // Use the explicitly constructed requestBody
            });

            const data = await response.json();
            console.log("STK Push Cloud Function Response:", data);

            if (response.ok && data.success) {
                setPaymentStatusMessage(data.CustomerMessage || 'STK Push sent. Check your phone!');
                showNotification('STK Push sent. Check your phone!', 'success');
                setDarajaCheckoutRequestID(data.CheckoutRequestID);

                await updateDoc(doc(db, ORDERS_COLLECTION_PATH, currentOrderId), {
                    checkoutRequestID: data.CheckoutRequestID,
                    orderStatus: 'stk_push_sent',
                    updatedAt: serverTimestamp(),
                });
                pollPaymentStatus(currentOrderId, data.CheckoutRequestID);

            } else {
                setPaymentStatusMessage(data.message || 'Payment initiation failed.');
                setInitialDataError(data.developerMessage || 'Unknown error from M-Pesa.');
                showNotification(`Payment failed: ${data.message}`, 'error');
                await updateDoc(doc(db, ORDERS_COLLECTION_PATH, currentOrderId), {
                    orderStatus: 'stk_push_failed',
                    ResultDesc: data.ResultDesc,
                    updatedAt: serverTimestamp(),
                });
                setIsProcessingPayment(false);
            }
        } catch (err) {
            console.error("Error during checkout process:", err);
            setInitialDataError(`Checkout error: ${err.message}`);
            setPaymentStatusMessage('An error occurred during checkout.');
            showNotification(`Checkout error: ${err.message}`, 'error');
            if (currentOrderId) {
                try {
                    await updateDoc(doc(db, ORDERS_COLLECTION_PATH, currentOrderId), {
                        orderStatus: 'internal_error',
                        ResultDesc: err.message,
                        updatedAt: serverTimestamp(),
                    });
                } catch (updateErr) {
                    console.error("Failed to update order status to internal_error:", updateErr);
                }
            }
            setIsProcessingPayment(false);
        }
    };

    const pollPaymentStatus = useCallback((orderId, checkoutRequestId) => {
        const paymentDocRef = doc(collection(db, PAYMENTS_TRANSACTIONS_COLLECTION_PATH), checkoutRequestId);

        const unsubscribe = onSnapshot(paymentDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Polling update for CheckoutRequestID " + checkoutRequestId + ":", data);
                
                if (data.status === 'Completed') {
                    setPaymentStatusMessage('Payment successful! Generating your tickets...');
                    showNotification('Payment successful! Your tickets will be emailed shortly.', 'success', 8000);
                    setIsProcessingPayment(false);
                    updateDoc(doc(db, ORDERS_COLLECTION_PATH, orderId), {
                        orderStatus: 'paid',
                        paymentStatus: 'completed',
                        orderEndTime: serverTimestamp(),
                        mpesaReceipt: data.MpesaReceiptNumber,
                        updatedAt: serverTimestamp(),
                    });
                    setCurrentStep(2); // Move to final confirmation step (now step 2)
                    unsubscribe();
                } else if (data.status === 'Failed' || data.status === 'STK_Push_Failed' || data.status === 'Cancelled') {
                    setPaymentStatusMessage('Payment failed. ' + (data.ResultDesc || 'Please try again.'));
                    showNotification('Payment failed or cancelled. Please try again.', 'error', 8000);
                    setIsProcessingPayment(false);
                    updateDoc(doc(db, ORDERS_COLLECTION_PATH, orderId), {
                        orderStatus: 'payment_failed',
                        paymentStatus: 'failed',
                        ResultDesc: data.ResultDesc,
                        updatedAt: serverTimestamp(),
                    });
                    setCurrentStep(2); // Move to final confirmation step (now step 2)
                    unsubscribe();
                } else if (data.status === 'Pending' || data.status === 'STK_Push_Sent') {
                    setPaymentStatusMessage('Waiting on your payment. Please approve the STK Push on your phone...');
                    setIsProcessingPayment(true);
                }
            }
        }, (err) => {
            console.error("Error polling payment status:", err);
            showNotification("Error checking payment status. Please check your M-Pesa messages.", 'error');
            unsubscribe();
            setIsProcessingPayment(false);
            setCurrentStep(2); // Move to final confirmation step on error
        });

        const pollingTimeout = setTimeout(() => {
            if (unsubscribe) {
                unsubscribe();
                if (isProcessingPayment) { // Only show timeout if payment is still considered processing
                    showNotification("Payment confirmation timed out. Please check your M-Pesa messages or contact support.", 'warning');
                    setPaymentStatusMessage('Payment timed out. Please check your phone or try again.');
                    updateDoc(doc(db, ORDERS_COLLECTION_PATH, orderId), {
                        orderStatus: 'payment_timeout',
                        updatedAt: serverTimestamp(),
                    });
                    setIsProcessingPayment(false);
                    setCurrentStep(2); // Move to final confirmation step on timeout
                }
            }
        }, 5 * 60 * 1000); // 5 minutes timeout

        return () => {
            clearTimeout(pollingTimeout);
            if (unsubscribe) unsubscribe();
        };
    }, [showNotification, isProcessingPayment]);


    if (loadingInitialData || !order || !eventDetails) {
        return (
            <div className={styles.checkoutContainer}>
                <LoadingSkeleton count={3} />
                <p className={styles.loadingText}>Loading checkout details...</p>
                {initialDataError && <p className={styles.errorMessage}>{initialDataError}</p>}
            </div>
        );
    }

    const PAYBILL_NUMBER = "4168319";
    const ACCOUNT_REFERENCE_DISPLAY = `NAKS_${(customerName.replace(/\s+/g, '') || currentUser?.uid?.substring(0, 5) || 'Guest').substring(0, 5).toUpperCase()}_${eventDetails.eventName.replace(/\s+/g, '').substring(0, 5).toUpperCase()}`;

    const isPayButtonDisabled = isProcessingPayment || totalAmount <= 0 || !mpesaPhoneNumber || !(mpesaPhoneNumber.startsWith('2547') || mpesaPhoneNumber.startsWith('2541')) || mpesaPhoneNumber.length !== 12;

    const progressSteps = [
        { id: 1, name: 'Order & Payment', icon: ShoppingCartIcon }, // Combined step 1 and 2
        { id: 2, name: 'Confirm', icon: CheckCircleIcon },          // Now step 2
    ];

    return (
        <div className={styles.checkoutContainer}>
            <h1 className={styles.pageTitle}>Secure Checkout</h1>

            {/* Progress Indicator */}
            <div className={styles.progressIndicator}>
                {progressSteps.map(step => (
                    <div key={step.id} className={`${styles.progressStep} ${currentStep >= step.id ? styles.activeStep : ''}`}>
                        <step.icon className={styles.stepIcon} />
                        <span className={styles.stepName}>{step.name}</span>
                    </div>
                ))}
                <div className={styles.progressBar}>
                    <div className={styles.progressBarFill} style={{ width: `${(currentStep / (progressSteps.length - 1)) * 100}%` }}></div> {/* Adjusted progress bar fill */}
                </div>
            </div>

            {/* Main Content Area based on Step */}
            <div className={styles.checkoutContent}>
                {/* Step 1: Order Confirmation & Payment */}
                {currentStep === 1 && (
                    <>
                        <OrderAndCouponSummary
                            eventDetails={eventDetails}
                            order={order}
                            originalTotalAmount={originalTotalAmount}
                            isProcessingPayment={isProcessingPayment}
                            isAuthenticated={isAuthenticated}
                            customerName={customerName}
                            handleCustomerNameChange={handleCustomerNameChange}
                            customerEmail={customerEmail}
                            handleCustomerEmailChange={handleCustomerEmailChange}
                            handleModifyQuantity={handleModifyQuantity}
                            handleRemoveTicket={handleRemoveTicket}
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            appliedCoupon={appliedCoupon}
                            handleApplyCoupon={handleApplyCoupon}
                            totalAmount={totalAmount}
                            // Pass phone number state and handler to OrderAndCouponSummary
                            mpesaPhoneNumber={mpesaPhoneNumber}
                            handlePhoneChange={handlePhoneChange}
                        />
                        {/* Payment Details (STK Push button) - Now integrated here */}
                        <div className={styles.paymentDetailsSection}> {/* New section for payment details */}
                            <h3 className={styles.sectionSubHeader}>Payment Details</h3>
                            <p className={styles.paymentIntroText}>
                                Click "Initiate STK Push" to receive a payment prompt on your M-Pesa registered phone number.
                            </p>
                            <button
                                onClick={initiateSTKPushPayment} // This button now triggers the whole process
                                className={commonFormStyles.primaryButton}
                                disabled={isPayButtonDisabled}
                            >
                                {isProcessingPayment ? 'Processing...' : `Initiate STK Push for KES ${totalAmount.toFixed(2)}`}
                            </button>
                        </div>
                        <div className={styles.navigationButtons}>
                            <button onClick={() => navigate(`/events/${eventDetails.id}`)} className={commonFormStyles.secondaryButton}>
                                Back to Event
                            </button>
                            {/* Removed "Next: Payment" button, as initiateSTKPushPayment handles progression */}
                        </div>
                    </>
                )}

                {/* Step 2: Confirmation */}
                {currentStep === 2 && ( // Now Step 2
                    <Confirmation
                        paymentStatusMessage={paymentStatusMessage}
                        customerEmail={customerEmail}
                        isProcessingPayment={isProcessingPayment}
                        isAuthenticated={isAuthenticated}
                        handleNavigateToTickets={() => navigate('/dashboard/my-tickets')}
                        handleExploreMoreEvents={() => navigate('/events')}
                        handleRetryPayment={() => {
                            setCurrentStep(1); // Go back to Step 1 (Order & Payment)
                            setIsProcessingPayment(false);
                            setPaymentStatusMessage('');
                        }}
                    />
                )}
            </div>

            {/* Global Loading/Error Modal (for initial data load or unexpected errors) */}
            { (loadingInitialData && !order) || initialDataError ? (
                <Modal isOpen={true} onClose={() => { /* Don't close if loading */ }}>
                    <h3 className={styles.modalTitle}>{initialDataError ? 'Error' : 'Loading'}</h3>
                    <p className={styles.modalMessage}>{initialDataError || 'Loading checkout details...'}</p>
                    {loadingInitialData && !initialDataError && (
                        <div className={styles.spinner}></div>
                    )}
                    {initialDataError && (
                        <button onClick={() => { setInitialDataError(null); navigate('/events'); }} className={commonFormStyles.secondaryButton}>
                            Go to Events
                        </button>
                    )}
                </Modal>
            ) : null }
        </div>
    );
};

export default CheckoutPage;