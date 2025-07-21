import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { db } from '../utils/firebaseConfig.js';
import { collection, doc, setDoc, serverTimestamp, Timestamp, onSnapshot, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx';
import Modal from '../components/Common/Modal.jsx';
import commonFormStyles from './Organizer/Dashboard/Tabs/CreateEventWizard.module.css';
import styles from './CheckoutPage.module.css'; // Correct import for pageStyles

// Import new components
import CheckoutStepOne from '../components/Checkout/CheckoutStepOne';
import Confirmation from '../components/Checkout/Confirmation.jsx';
import ProcessingModalContent from '../components/Checkout/ProcessingModalContent.jsx';

import {
    ShoppingCartIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

import { getEventById } from '../services/eventApiService.js';

import { CartContext } from '../contexts/CartContext';

// CRITICAL FIX: Define all necessary constants GLOBALLY in this file
const FIREBASE_COLLECTIONS_BASE_ID = "naksyetu-9c648"; // Your Firebase Project ID
const FIREBASE_EVENTS_APP_ID = "1:147113503727:web:1d9d351c30399b2970241a"; // The specific App ID for your events collection

// Define Firestore collection segments (arrays) globally
const ORDERS_COLLECTION_SEGMENTS = ['artifacts', FIREBASE_COLLECTIONS_BASE_ID, 'orders'];
const PAYMENTS_COLLECTIONS_SEGMENTS = ['artifacts', FIREBASE_COLLECTIONS_BASE_ID, 'payments'];
const EVENTS_COLLECTION_SEGMENTS = ['artifacts', FIREBASE_EVENTS_APP_ID, 'public', 'data_for_app', 'events'];


const BASE_URL = 'https://us-central1-naksyetu-9c648.cloudfunctions.net/initiateStkPush';
const NAKSYETU_PAYBILL_NUMBER = '4168319';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, loadingAuth, isAuthenticated, isAuthReady, authenticatedUser } = useAuth();
    const { showNotification } = useNotification();
    const { cartItems, clearCart, updateCartItemQuantity, removeCartItem, loadingCart } = useContext(CartContext);

    const functionsInstance = getFunctions();
    const createOrderCallable = httpsCallable(functionsInstance, 'createOrder');
    const createManualPaymentRecordCallable = httpsCallable(functionsInstance, 'createManualPaymentRecord');


    const { eventId: initialEventIdFromState } = location.state || {};


    const [eventDetails, setEventDetails] = useState(null);
    const [order, setOrder] = useState(null);
    const [originalTotalAmount, setOriginalTotalAmount] = useState(0);

    const [totalAmount, setTotalAmount] = useState(0);
    const [orderId, setOrderId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('stkPush');

    const [customerInfo, setCustomerInfo] = useState({
        fullName: authenticatedUser ? authenticatedUser.displayName : '',
        email: authenticatedUser ? authenticatedUser.email : '',
        mpesaPhoneNumber: '',
    });

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [initialDataError, setInitialDataError] = useState(null);

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
    const [checkoutRequestId, setCheckoutRequestId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [generatedTickets, setGeneratedTickets] = useState([]);

    const hasLoadedInitialData = useRef(false);


    useEffect(() => {
        const loadCheckoutData = async () => {
            if (loadingAuth || loadingCart || hasLoadedInitialData.current) {
                return;
            }
            hasLoadedInitialData.current = true;

            if (Object.keys(cartItems).length === 0) {
                setInitialDataError("Your cart is empty. Please add tickets to proceed.");
                showNotification("Your cart is empty. Redirecting to events.", 'error');
                setTimeout(() => navigate('/events', { replace: true }), 1500);
                return;
            }

            const cartItemsArray = Object.values(cartItems);
            const eventId = (cartItemsArray.length > 0 ? cartItemsArray[0].eventId : null) || initialEventIdFromState;

            if (!eventId) {
                setInitialDataError("No event ID found in cart or navigation state.");
                showNotification("Could not determine event for checkout. Please try again.", 'error');
                setTimeout(() => navigate('/events', { replace: true }), 3000);
                return;
            }

            setInitialDataError(null);

            try {
                const fetchedEvent = await getEventById(eventId);

                if (!fetchedEvent) {
                    setInitialDataError("Event not found. It might have been removed or is unavailable.");
                    showNotification("Event not found. Please try again.", 'error');
                    setTimeout(() => navigate('/events', { replace: true }), 3000);
                    return;
                }

                setEventDetails(fetchedEvent);

                let calculatedTotalPrice = 0;
                const constructedTickets = Object.values(cartItems).map(item => {
                    const itemPrice = parseFloat(item.price) || 0;
                    calculatedTotalPrice += itemPrice * item.quantity;
                    return {
                        ticketTypeId: item.id,
                        name: item.name,
                        price: itemPrice,
                        quantity: item.quantity,
                    };
                });

                setOriginalTotalAmount(calculatedTotalPrice);
                setTotalAmount(calculatedTotalPrice);

                setOrder({
                    orderId: `order_${currentUser?.uid || 'guest'}_${Date.now()}`,
                    userId: currentUser?.uid || 'anonymous',
                    customerName: authenticatedUser?.displayName || '',
                    customerEmail: authenticatedUser?.email || '',
                    mpesaPhoneNumber: '',
                    eventId: fetchedEvent.id,
                    eventDetails: {
                        id: fetchedEvent.id,
                        eventName: fetchedEvent.eventName || 'Unknown Event',
                        bannerImageUrl: fetchedEvent.bannerImageUrl || '',
                        startDate: fetchedEvent.startDate || '',
                        startTime: fetchedEvent.startTime || '',
                        mainLocation: fetchedEvent.mainLocation || 'Online/TBD',
                    },
                    tickets: constructedTickets,
                    originalTotalAmount: calculatedTotalPrice,
                    totalAmount: calculatedTotalPrice,
                    couponApplied: null,
                    orderStatus: 'pending_creation',
                    paymentStatus: 'pending_creation',
                    initiatedAt: null,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    checkoutRequestID: null,
                });

            } catch (err) {
                console.error("Error loading checkout data:", err);
                setInitialDataError(`Failed to load checkout details: ${err.message}`);
                showNotification("Failed to load checkout details. Please try again.", 'error');
            }
        };

        if (!loadingAuth && !loadingCart && !hasLoadedInitialData.current) {
            loadCheckoutData();
        }
    }, [loadingAuth, loadingCart, cartItems, initialEventIdFromState, navigate, showNotification, currentUser, authenticatedUser]);


    useEffect(() => {
        let newCalculatedTotal = originalTotalAmount;
        if (appliedCoupon && appliedCoupon.discount) {
            newCalculatedTotal = originalTotalAmount * (1 - appliedCoupon.discount);
        }
        setTotalAmount(newCalculatedTotal);

        setOrder(prevOrder => {
            const currentOrder = prevOrder || {
                orderId: `order_${currentUser?.uid || 'guest'}_${Date.now()}`,
                userId: currentUser?.uid || 'anonymous',
                customerName: authenticatedUser?.displayName || '',
                customerEmail: authenticatedUser?.email || '',
                mpesaPhoneNumber: '',
                eventId: eventDetails?.id,
                eventDetails: eventDetails,
                couponApplied: null,
                orderStatus: 'pending_creation',
                paymentStatus: 'pending_creation',
                initiatedAt: null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                checkoutRequestID: null,
            };

            return {
                ...currentOrder,
                originalTotalAmount: originalTotalAmount,
                totalAmount: newCalculatedTotal,
                tickets: Object.values(cartItems).map(item => ({
                    ticketTypeId: item.id,
                    name: item.name,
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity,
                })),
            };
        });

    }, [cartItems, eventDetails, appliedCoupon, order, originalTotalAmount, setOrder, setOriginalTotalAmount, setTotalAmount, currentUser, authenticatedUser]);


    const applyCoupon = useCallback(async (code) => {
        if (code === 'NAKSYETU10') {
            const discount = originalTotalAmount * 0.10;
            setAppliedCoupon({ code: 'NAKSYETU10', discount: discount });
            showNotification(`Coupon 'NAKSYETU10' applied! You get KES ${discount.toFixed(2)} off.`, 'success');
        } else {
            setAppliedCoupon(null);
            showNotification('Invalid or expired coupon code.', 'error');
        }
    }, [originalTotalAmount, showNotification]);


    const handleModifyQuantity = useCallback((item, change) => {
        updateCartItemQuantity(item, item.quantity + change);
    }, [updateCartItemQuantity]);

    const handleRemoveTicket = useCallback((ticketId) => {
        removeCartItem(ticketId);
    }, [removeCartItem]);


    const handleInitiatePayment = useCallback(async () => {
        // CRITICAL FIX: Check if callable functions are initialized
        if (!createOrderCallable || !createManualPaymentRecordCallable) {
            showNotification("Payment services are not ready. Please wait or refresh.", "error");
            setIsProcessingPayment(false);
            return;
        }

        if (isProcessingPayment || (orderId && checkoutRequestId && (paymentStatus === 'processing' || paymentStatus === 'stk_push_sent'))) {
            console.warn("Frontend: Payment already processing or initiated. Ignoring duplicate request.");
            showNotification("Payment is already being processed. Please check your phone.", "info");
            return;
        }

        setIsProcessingPayment(true);
        setPaymentStatusMessage('Initiating payment...');
        setPaymentStatus('processing');
        setCurrentStep(2);


        if (!eventDetails || Object.keys(cartItems).length === 0) {
            showNotification('Missing event or cart details. Please refresh and try again.', 'error');
            setIsProcessingPayment(false);
            setPaymentStatus('pending');
            return;
        }

        if (totalAmount <= 0 && (!appliedCoupon || appliedCoupon.discount !== 1)) {
            showNotification("Cannot process payment for zero amount unless a 100% coupon is applied.", 'error');
            setIsProcessingPayment(false);
            setPaymentStatus('failed');
            return;
        }

        let currentOrderId = orderId;
        if (!currentOrderId) {
            currentOrderId = `order_${currentUser?.uid || uuidv4()}_${Date.now()}`;
            setOrderId(currentOrderId);
        }

        console.log(`Frontend: Initiating STK Push for Order ID: ${currentOrderId}`);

        try {
            setPaymentStatusMessage('Finalizing order details...');
            const createOrderResult = await createOrderCallable({
                orderId: currentOrderId,
                userId: currentUser?.uid || 'anonymous',
                customerName: customerInfo.fullName,
                customerEmail: customerInfo.email,
                mpesaPhoneNumber: customerInfo.mpesaPhoneNumber,
                eventId: eventDetails.id,
                eventDetails: {
                    id: eventDetails.id,
                    eventName: eventDetails.eventName,
                    bannerImageUrl: eventDetails.bannerImageUrl || '',
                    startDate: eventDetails.startDate || '',
                    startTime: eventDetails.startTime || '',
                    mainLocation: eventDetails.mainLocation || 'Online/TBD',
                },
                tickets: Object.values(cartItems).map(item => ({
                    ticketTypeId: item.id,
                    name: item.name,
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity,
                })),
                couponApplied: appliedCoupon,
            });

            if (!createOrderResult.data.success) {
                throw new Error(createOrderResult.data.message || 'Failed to prepare order via Cloud Function.');
            }
            setOriginalTotalAmount(createOrderResult.data.originalTotalAmount);
            setTotalAmount(createOrderResult.data.totalAmount);
            setOrder(prevOrder => ({
                ...prevOrder,
                originalTotalAmount: createOrderResult.data.originalTotalAmount,
                totalAmount: createOrderResult.data.totalAmount,
                orderStatus: 'pending_payment_initiation',
                paymentStatus: 'pending_payment_initiation',
                checkoutRequestID: createOrderResult.data.checkoutRequestId,
            }));
            setCheckoutRequestId(createOrderResult.data.checkoutRequestId);
            console.log('Frontend: Order created/updated by CF:', createOrderResult.data.orderId, 'Backend verified total:', createOrderResult.data.totalAmount, 'Backend generated checkoutRequestId:', createOrderResult.data.checkoutRequestId);
            showNotification('Order prepared successfully!', 'success');


            setPaymentStatusMessage('Sending STK Push to your phone...');
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: customerInfo.mpesaPhoneNumber,
                    amount: totalAmount,
                    event_id: eventDetails.id,
                    user_id: currentUser?.uid || 'anonymous',
                    selected_tickets: Object.values(cartItems).map(item => ({ id: item.id, quantity: item.quantity })),
                    transaction_description: `Tickets for ${eventDetails.eventName}`,
                    orderId: currentOrderId,
                    checkout_request_id: order?.checkoutRequestID || createOrderResult.data.checkoutRequestId,
                }),
            });

            const data = await response.json();
            console.log("Frontend: M-Pesa STK Push Response from CF:", data);

            if (response.ok && data.success) {
                setPaymentStatusMessage(data.CustomerMessage || 'STK Push initiated successfully. Please check your phone.');
                showNotification('STK Push sent. Check your phone!', 'success');
                console.log(`Frontend: Switched listener to CF-generated CheckoutRequestID: ${data.CheckoutRequestID}`);

            } else {
                setPaymentStatus('failed');
                setPaymentStatusMessage(data.message || 'STK Push initiation failed.');
                showNotification(`Payment failed: ${data.message}`, 'error');
                await updateDoc(doc(db, ...ORDERS_COLLECTION_SEGMENTS, currentOrderId), {
                    orderStatus: 'stk_push_failed',
                    paymentStatus: 'failed',
                    ResultDesc: data.message || 'STK Push failed.',
                    updatedAt: serverTimestamp(),
                });
                setIsProcessingPayment(false);
            }
        } catch (error) {
            console.error('Frontend: Payment initiation error:', error);
            setPaymentStatus('failed');
            setPaymentStatusMessage('An error occurred during payment initiation. Please try again.');
            showNotification(error.message || 'An unexpected error occurred.', 'error');
            if (currentOrderId) {
                try {
                    await updateDoc(doc(db, ...ORDERS_COLLECTION_SEGMENTS, currentOrderId), {
                        orderStatus: 'internal_error',
                        paymentStatus: 'failed',
                        ResultDesc: error.message || 'Internal error.',
                        updatedAt: serverTimestamp(),
                    });
                } catch (updateErr) {
                    console.error("Frontend: Failed to update order status to internal_error:", updateErr);
                }
            }
            setIsProcessingPayment(false);
        }
    }, [
        customerInfo, eventDetails, cartItems, originalTotalAmount, totalAmount, appliedCoupon,
        currentUser, orderId, showNotification, createOrderCallable,
        db, isProcessingPayment, paymentStatus, checkoutRequestId, order, ORDERS_COLLECTION_SEGMENTS
    ]);


    const handleManualPaymentConfirmation = useCallback(async () => {
        // CRITICAL FIX: Check if callable functions are initialized
        if (!createOrderCallable || !createManualPaymentRecordCallable) {
            showNotification("Payment services are not ready. Please wait or refresh.", "error");
            setIsProcessingPayment(false);
            return;
        }

        if (isProcessingPayment || (orderId && checkoutRequestId && (paymentStatus === 'processing' || paymentStatus === 'pending_manual'))) {
            console.warn("Frontend: Manual payment already processing or initiated. Ignoring duplicate request.");
            showNotification("Manual payment is already being processed. Please check your order status.", "info");
            return;
        }

        setIsProcessingPayment(true);
        setPaymentStatusMessage('Confirming manual payment...');
        setPaymentStatus('processing');
        setCurrentStep(2);


        if (!eventDetails || Object.keys(cartItems).length === 0) {
            showNotification('Missing event or cart details. Please refresh and try again.', 'error');
            setIsProcessingPayment(false);
            setPaymentStatus('pending');
            return;
        }

        if (totalAmount <= 0 && (!appliedCoupon || appliedCoupon.discount !== 1)) {
            showNotification("Cannot process payment for zero amount unless a 100% coupon is applied.", 'error');
            setIsProcessingPayment(false);
            setPaymentStatus('failed');
            return;
        }

        let currentOrderId = orderId;
        if (!currentOrderId) {
            currentOrderId = `order_${currentUser?.uid || uuidv4()}_${Date.now()}`;
            setOrderId(currentOrderId);
        }

        try {
            const createOrderResult = await createOrderCallable({
                orderId: currentOrderId,
                userId: currentUser?.uid || 'anonymous',
                customerName: customerInfo.fullName,
                customerEmail: customerInfo.email,
                mpesaPhoneNumber: customerInfo.mpesaPhoneNumber,
                eventId: eventDetails.id,
                eventDetails: {
                    id: eventDetails.id,
                    eventName: eventDetails.eventName,
                    bannerImageUrl: eventDetails.bannerImageUrl || '',
                    startDate: eventDetails.startDate || '',
                    startTime: eventDetails.startTime || '',
                    mainLocation: eventDetails.mainLocation || 'Online/TBD',
                },
                tickets: Object.values(cartItems).map(item => ({
                    ticketTypeId: item.id,
                    name: item.name,
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity,
                })),
                couponApplied: appliedCoupon,
            });

            if (!createOrderResult.data.success) {
                throw new Error(createOrderResult.data.message || 'Failed to prepare order for manual payment.');
            }
            setOriginalTotalAmount(createOrderResult.data.originalTotalAmount);
            setTotalAmount(createOrderResult.data.totalAmount);
            setOrder(prevOrder => ({
                ...prevOrder,
                originalTotalAmount: createOrderResult.data.originalTotalAmount,
                totalAmount: createOrderResult.data.totalAmount,
                orderStatus: 'pending_payment_initiation',
                paymentStatus: 'pending_payment_initiation',
                checkoutRequestID: createOrderResult.data.checkoutRequestId,
            }));
            setCheckoutRequestId(createOrderResult.data.checkoutRequestId);
            console.log('Frontend: Order created/updated for manual payment by CF:', createOrderResult.data.orderId, 'Backend verified total:', createOrderResult.data.totalAmount);
            showNotification('Order prepared successfully!', 'success');


            setPaymentStatusMessage('Creating manual payment record...');
            const createManualPaymentResult = await createManualPaymentRecordCallable({
                orderId: currentOrderId,
                userId: currentUser?.uid || 'anonymous',
                customerName: customerInfo.fullName,
                customerEmail: customerInfo.email,
                mpesaPhoneNumber: customerInfo.mpesaPhoneNumber,
                eventId: eventDetails.id,
                totalAmount: totalAmount,
            });

            if (!createManualPaymentResult.data.success) {
                throw new Error(createManualPaymentResult.data.message || 'Failed to create manual payment record.');
            }
            console.log('Frontend: Manual payment record created by CF:', createManualPaymentResult.data.checkoutRequestId);
            showNotification('Manual payment record created. Please complete payment via M-Pesa Paybill.', 'info');

            setCheckoutRequestId(createManualPaymentResult.data.checkoutRequestId);
            console.log(`Frontend: Switched listener to CF-generated Manual CheckoutRequestID: ${createManualPaymentResult.data.checkoutRequestId}`);

        } catch (error) {
            console.error('Frontend: Manual payment initiation error:', error);
            setPaymentStatus('failed');
            setPaymentStatusMessage('An error occurred during manual payment setup. Please try again.');
            showNotification(error.message || 'An unexpected error occurred for manual payment.', 'error');
            if (currentOrderId) {
                try {
                    await updateDoc(doc(db, ...ORDERS_COLLECTION_SEGMENTS, currentOrderId), {
                        orderStatus: 'internal_error',
                        paymentStatus: 'failed',
                        ResultDesc: error.message || 'Internal error.',
                        updatedAt: serverTimestamp(),
                    });
                } catch (updateErr) {
                    console.error("Frontend: Failed to update order status to internal_error:", updateErr);
                }
            }
            setIsProcessingPayment(false);
        }
    }, [
        customerInfo, eventDetails, cartItems, originalTotalAmount, totalAmount, appliedCoupon,
        currentUser, orderId, showNotification, createOrderCallable, createManualPaymentRecordCallable,
        db, isProcessingPayment, paymentStatus, checkoutRequestId, order, ORDERS_COLLECTION_SEGMENTS
    ]);


    const pollPaymentStatus = useCallback((currentOrderId, currentCheckoutRequestId) => {
        if (!currentOrderId || !currentCheckoutRequestId) {
            console.warn("pollPaymentStatus called with invalid IDs. Skipping listener setup.");
            return () => {};
        }

        console.log(`Frontend: Setting up Firestore listeners for Order: ${currentOrderId} and Payment: ${currentCheckoutRequestId}`);

        const orderDocRef = doc(db, ...ORDERS_COLLECTION_SEGMENTS, currentOrderId);
        const paymentDocRef = doc(db, ...PAYMENTS_COLLECTIONS_SEGMENTS, currentCheckoutRequestId);


        const unsubscribeOrder = onSnapshot(orderDocRef, (orderDocSnap) => {
            if (orderDocSnap.exists()) {
                const data = orderDocSnap.data();
                console.log('Frontend: Polling Order Update:', data);
                setPaymentStatus(data.paymentStatus || 'pending');
                setPaymentStatusMessage(data.ResultDesc || data.orderStatus || 'Awaiting payment confirmation...');
                setGeneratedTickets(data.generatedTicketDetails || []);

                if (data.paymentStatus === 'completed') {
                    setIsProcessingPayment(false);
                } else if (data.paymentStatus === 'failed' || data.paymentStatus === 'payment_failed' || data.paymentStatus === 'stk_push_failed' || data.paymentStatus === 'internal_error') {
                    setIsProcessingPayment(false);
                }
            }
        }, (error) => {
            console.error('Frontend: Error listening to order document:', error);
            showNotification('Failed to get real-time order updates.', 'error');
            setIsProcessingPayment(false);
        });

        const unsubscribePayment = onSnapshot(paymentDocRef, (paymentDocSnap) => {
            if (paymentDocSnap.exists()) {
                const data = paymentDocSnap.data();
                console.log('Frontend: Polling Payment Transaction Update:', data);
                if (data.status && data.status !== 'pending_initiation' && data.status !== 'STK_Push_Sent') {
                    setPaymentStatus(data.status.toLowerCase());
                    setPaymentStatusMessage(data.ResultDesc || data.status);
                }
            }
        }, (error) => {
            console.error('Frontend: Error listening to payment document:', error);
            showNotification('Failed to get real-time payment updates for transaction.', 'error');
        });

        const pollingTimeout = setTimeout(() => {
            if (isProcessingPayment) {
                showNotification("Payment confirmation timed out. Please check your M-Pesa messages or contact support.", 'warning');
                setPaymentStatusMessage('Payment timed out. Please check your phone or try again.');
                updateDoc(doc(db, ...ORDERS_COLLECTION_SEGMENTS, currentOrderId), {
                    orderStatus: 'payment_timeout',
                    paymentStatus: 'failed',
                    updatedAt: serverTimestamp(),
                }).catch(err => console.error("Frontend: Failed to update order status to payment_timeout:", err));
                setIsProcessingPayment(false);
            }
            unsubscribeOrder();
            unsubscribePayment();
        }, 5 * 60 * 1000);

        return () => {
            console.log(`Frontend: Unsubscribing from Firestore listeners for Order: ${currentOrderId} and Payment: ${currentCheckoutRequestId}`);
            clearTimeout(pollingTimeout);
            unsubscribeOrder();
            unsubscribePayment();
        };
    }, [showNotification, clearCart, isProcessingPayment, ORDERS_COLLECTION_SEGMENTS, PAYMENTS_COLLECTIONS_SEGMENTS, db]);


    useEffect(() => {
        let cleanupFn = () => {};
        if (currentStep === 2 && orderId && checkoutRequestId) {
            cleanupFn = pollPaymentStatus(orderId, checkoutRequestId);
        }
        return cleanupFn;
    }, [currentStep, orderId, checkoutRequestId, pollPaymentStatus]);


    const handleTryAgain = useCallback(() => {
        setCurrentStep(1);
        setPaymentStatus('pending');
        setPaymentStatusMessage('Ready to try again.');
        setIsProcessingPayment(false);
        setOrderId(null);
        setCheckoutRequestId(null);
        setGeneratedTickets([]);
    }, []);

    useEffect(() => {
        if (!loadingAuth && !loadingCart && !hasLoadedInitialData.current && Object.keys(cartItems).length === 0 && paymentStatus !== 'completed' && paymentStatus !== 'processing') {
            if (hasCheckedCartInitially.current) {
                showNotification('Your cart is empty. Redirecting to events.', 'info');
                navigate('/events', { replace: true });
            } else {
                hasLoadedInitialData.current = true;
            }
        }
    }, [cartItems, loadingAuth, loadingCart, navigate, showNotification, paymentStatus]);


    if (loadingAuth || loadingCart || (!hasLoadedInitialData.current && (Object.keys(cartItems).length === 0 && !initialDataError))) {
        return (
            <div className={styles.checkoutContainer}>
                <LoadingSkeleton count={3} />
                <p className={styles.loadingText}>Loading checkout details...</p>
            </div>
        );
    }

    if (initialDataError) {
        return (
            <div className={styles.checkoutContainer}>
                <h1 className={styles.pageTitle}>Checkout Error</h1>
                <div className={`${styles.sectionCard} max-w-xl mx-auto p-8 text-center`}>
                    <p className="text-red-500 text-lg mb-4">{initialDataError}</p>
                    <button onClick={() => { setInitialDataError(null); navigate('/events'); }} className={commonFormStyles.secondaryButton}>
                        Go to Events
                    </button>
                </div>
            </div>
        );
    }

    if (!order || !eventDetails) {
        return (
            <div className={styles.checkoutContainer}>
                <h1 className={styles.pageTitle}>Checkout Unavailable</h1>
                <div className={`${styles.sectionCard} max-w-xl mx-auto p-8 text-center`}>
                    <p className="text-gray-700 text-lg mb-4">No order details found. Please ensure you have selected tickets.</p>
                    <button onClick={() => navigate('/events')} className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                        Go to Events
                    </button>
                </div>
            </div>
        );
    }

    const isPayButtonDisabled = isProcessingPayment || Number(totalAmount) <= 0;

    const progressSteps = [
        { id: 1, name: 'Order & Payment', icon: ShoppingCartIcon },
        { id: 2, name: 'Confirm', icon: CheckCircleIcon },
    ];

    return (
        <div className={`${styles.checkoutContainer} dark-mode-class-if-any`}>
            <h1 className={styles.pageTitle}>Secure Checkout</h1>

            {/* Progress Indicator */}
            <div className={styles.progressIndicator}>
                <div className={`${styles.progressStep} ${currentStep >= 1 ? styles.activeStep : ''}`}>
                    <div className={styles.stepIconContainer}>
                        <ShoppingCartIcon className={styles.stepIcon} />
                    </div>
                    <span className={styles.stepName}>Order & Payment</span>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressBarFill} style={{ width: `${(currentStep - 1) / (progressSteps.length - 1) * 100}%` }}></div>
                </div>
                <div className={`${styles.progressStep} ${currentStep >= 2 ? styles.activeStep : ''}`}>
                    <div className={styles.stepIconContainer}>
                        <CheckCircleIcon className={styles.stepIcon} />
                    </div>
                    <span className={styles.stepName}>Confirmation</span>
                </div>
            </div>

            <div className={styles.checkoutContent}>
                {currentStep === 1 && (
                    <CheckoutStepOne
                        cartItems={cartItems}
                        eventDetails={eventDetails}
                        customerInfo={customerInfo}
                        setCustomerInfo={setCustomerInfo}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        applyCoupon={applyCoupon}
                        appliedCoupon={appliedCoupon}
                        totalAmount={totalAmount}
                        originalTotalAmount={originalTotalAmount}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        handleInitiatePayment={handleInitiatePayment}
                        handleManualPaymentConfirmation={handleManualPaymentConfirmation}
                        isProcessingPayment={isProcessingPayment}
                        authenticatedUser={authenticatedUser}
                        paybillNumber={NAKSYETU_PAYBILL_NUMBER}
                        orderId={orderId}
                        handleModifyQuantity={handleModifyQuantity}
                        handleRemoveTicket={handleRemoveTicket}
                    />
                )}

                {currentStep === 2 && (
                    <Confirmation
                        paymentStatus={paymentStatus}
                        paymentStatusMessage={paymentStatusMessage}
                        customerEmail={customerInfo.email}
                        orderId={orderId}
                        generatedTickets={generatedTickets}
                        authenticatedUser={authenticatedUser}
                        handleTryAgain={handleTryAgain}
                        eventDetails={eventDetails}
                        onGoToMyTickets={() => { clearCart(); navigate('/user-dashboard/my-tickets'); }}
                        onExploreMoreEvents={() => { clearCart(); navigate('/events'); }}
                    />
                )}
            </div>

            { /* Show processing modal when payment is in progress and not yet completed/failed */ }
            {(isProcessingPayment && paymentStatus !== 'completed' && paymentStatus !== 'failed') && (
                <Modal isOpen={true} onClose={() => { /* Modal is not dismissible by user */ }}>
                    <ProcessingModalContent paymentStatusMessage={paymentStatusMessage} onInitiatePayment={paymentMethod === 'stkPush' ? handleInitiatePayment : handleManualPaymentConfirmation} />
                </Modal>
            )}

            { (initialDataError && !isProcessingPayment) ? (
                <Modal isOpen={true} onClose={() => { /* Don't close if loading */ }}>
                    <h3 className={styles.modalTitle}>{initialDataError ? 'Error' : 'Loading'}</h3>
                    <p className={styles.modalMessage}>{initialDataError || 'Loading checkout details...'}</p>
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