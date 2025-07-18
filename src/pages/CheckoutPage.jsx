// src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { db } from '../utils/firebaseConfig.js';
import { collection, doc, setDoc, getDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore'; 
import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx'; 
import Modal from '../components/Common/Modal.jsx'; 
import TextInput from '../components/Common/TextInput.jsx'; // For guest info
import commonFormStyles from './Organizer/Dashboard/Tabs/CreateEventWizard.module.css'; // For common button styles
import styles from './CheckoutPage.module.css'; // NEW: Dedicated CSS for CheckoutPage
import { 
    ShoppingCartIcon, CreditCardIcon, CheckCircleIcon, // Step icons
    PlusCircleIcon, MinusCircleIcon, TrashIcon, // Quantity modification icons
    UserIcon, EnvelopeIcon, PhoneIcon, DocumentDuplicateIcon, InformationCircleIcon, // Form/info icons
    ArrowLeftIcon, ArrowRightIcon, TicketIcon, CalendarDaysIcon, // Navigation/info icons
    ArrowPathIcon // For polling status spinner
} from '@heroicons/react/24/outline'; // Using Heroicons for consistency


// IMPORTANT: Define BASE_URL for your PHP backend. This should match your cPanel domain.
// You might want to define this in a global constants.js file or similar.
const BASE_URL = 'https://platform.naksyetu.co.ke'; 

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
const { currentUser, loadingAuth, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  // Order data from navigation state (passed from EventDetailPage or Cart)
  const [order, setOrder] = useState(location.state?.order || null); 
  const [eventDetails, setEventDetails] = useState(location.state?.eventDetails || null);
  
  // Checkout flow states
  const [currentStep, setCurrentStep] = useState(1); // 1: Order Confirmation, 2: Payment, 3: Confirmation
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState(currentUser?.phoneNumber || ''); 
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');

  // Loading and Error states for initial data fetch
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [initialDataError, setInitialDataError] = useState(null);

  // Payment processing states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [darajaCheckoutRequestID, setDarajaCheckoutRequestID] = useState(null); // To link frontend to backend transaction

  // --- Constants for Firestore Paths (Client-side) ---
  const FIREBASE_PROJECT_ID = "naksyetu-9c648"; // As per your backend config.php
  const ORDERS_COLLECTION_PATH = `artifacts/${FIREBASE_PROJECT_ID}/public/orders`;
  const PAYMENTS_TRANSACTIONS_COLLECTION_PATH = `artifacts/${FIREBASE_PROJECT_ID}/public/payments/transactions`;

  // Effect to load data or use dummy data if not provided via navigation state
  useEffect(() => {
    const fetchInitialData = async () => {
      if (order && eventDetails) {
        setLoadingInitialData(false);
        return; // Data already provided via navigation state
      }

      setLoadingInitialData(true);
      setInitialDataError(null);

      // --- Fallback/Dummy Data for direct access to /checkout ---
      // In a real app, you'd fetch from an API/Firestore based on order ID from URL or user's session
      // For now, if no state is passed, use hardcoded dummy data
      const dummyOrder = {
        orderId: 'dummy_order_' + Date.now(),
        eventId: 'e1', // Must match an existing event in Firestore/dummy data
        tickets: [
          { ticketTypeId: 't1', name: 'General Admission', price: 1000, quantity: 2 },
          { ticketTypeId: 't2', name: 'VIP Ticket', price: 2500, quantity: 1 }
        ],
        totalAmount: 4500 
      };
      const dummyEventDetails = {
        id: 'e1',
        eventName: 'Sample Music Fest',
        bannerImageUrl: 'https://placehold.co/400x200/cccccc/333333?text=Event+Banner',
        startDate: '2025-08-15',
        startTime: '18:00',
        mainLocation: 'Nakuru City',
      };
      setOrder(dummyOrder);
      setEventDetails(dummyEventDetails);
      showNotification("Loaded dummy order data. Real order data should be passed via navigation state.", 'info'); 
      setLoadingInitialData(false);
    };

    if (!loadingAuth) { 
      fetchInitialData();
    }
  }, [order, eventDetails, loadingAuth, showNotification]);

  // Update customer info if auth state changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setCustomerName(currentUser.displayName || '');
      setCustomerEmail(currentUser.email || '');
      setMpesaPhoneNumber(currentUser.phoneNumber || '');
    }
  }, [currentUser, isAuthenticated]);


  // Calculate dynamic total amount
  const calculateTotal = useCallback(() => {
    return order?.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0) || 0;
  }, [order]);

  const totalAmount = calculateTotal();

  // --- Order Modification Handlers ---
  const handleModifyQuantity = (ticketTypeId, change) => {
    if (!order || isProcessingPayment) return; // Prevent modification during payment
    setOrder(prevOrder => {
      const updatedTickets = prevOrder.tickets.map(ticket => {
        if (ticket.ticketTypeId === ticketTypeId) {
          const newQuantity = ticket.quantity + change;
          return { ...ticket, quantity: Math.max(0, newQuantity) }; // Quantity cannot go below 0
        }
        return ticket;
      }).filter(ticket => ticket.quantity > 0); // Remove ticket type if its quantity becomes 0

      return { ...prevOrder, tickets: updatedTickets }; // Total amount will be recalculated by calculateTotal
    });
  };

  const handleRemoveTicket = (ticketTypeId) => {
    if (!order || isProcessingPayment) return; // Prevent modification during payment
    setOrder(prevOrder => {
      const updatedTickets = prevOrder.tickets.filter(ticket => ticket.ticketTypeId !== ticketTypeId);
      return { ...prevOrder, tickets: updatedTickets };
    });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); 
    if (value.length > 12) value = value.substring(0, 12); 
    if (value.startsWith('0') && value.length > 1) value = '254' + value.substring(1); 
    else if (!value.startsWith('254') && value.length > 0 && value.length < 12) value = '254' + value; // Only prepend if it's a short number
    
    setMpesaPhoneNumber(value);
  };

  // --- Step Navigation & Validation ---
  const handleNextStep = useCallback(() => {
    if (currentStep === 1) { // Validate Order Confirmation step
        if (totalAmount <= 0 || !order?.tickets.length) {
            showNotification("Your cart is empty or total amount is zero. Please add tickets.", 'error');
            return;
        }
        if (!isAuthenticated) { // Validate guest info if not logged in
            if (!customerName.trim()) {
                showNotification('Your name is required for the order.', 'error');
                return;
            }
            if (!customerEmail.trim() || !/\S+@\S+\.\S+/.test(customerEmail)) {
                showNotification('A valid email is required for ticket delivery.', 'error');
                return;
            }
        }
    }
    // No specific validation for step 2 (Payment) as it triggers payment directly
    setCurrentStep(prev => prev + 1);
  }, [currentStep, totalAmount, order, isAuthenticated, customerName, customerEmail, showNotification]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, [currentStep]);


  // Function to initiate payment with PHP backend
  const initiateSTKPushPayment = async () => {
    if (!currentUser?.uid) {
      showNotification("You must be logged in to complete a purchase.", 'error');
      return;
    }
    if (!mpesaPhoneNumber || mpesaPhoneNumber.length < 12 || !mpesaPhoneNumber.startsWith('2547')) {
      showNotification("Please enter a valid M-Pesa phone number (e.g., 2547XXXXXXXX).", 'error');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatusMessage('Initiating M-Pesa STK Push...');
    setShowPaymentStatusModal(true); // Show modal immediately
    setInitialDataError(null); // Clear previous errors

    // Generate a unique order ID or use existing one for retry
    const orderId = order?.orderId || `order_${currentUser.uid}_${Date.now()}`; 

    try {
      // 1. Save/Update Order Document in Firestore (Initial state of the order)
      const orderDocRef = doc(collection(db, ORDERS_COLLECTION_PATH), orderId); 
      await setDoc(orderDocRef, {
        orderId: orderId,
        userId: currentUser.uid,
        eventId: order.eventId,
        eventDetails: { 
          id: eventDetails.id,
          eventName: eventDetails.eventName,
          bannerImageUrl: eventDetails.bannerImageUrl,
          startDate: eventDetails.startDate, 
          startTime: eventDetails.startTime,
          mainLocation: eventDetails.mainLocation,
        },
        tickets: order.tickets,
        totalAmount: totalAmount,
        mpesaPhoneNumber: mpesaPhoneNumber,
        customerName: customerName, // Store customer name
        customerEmail: customerEmail, // Store customer email
        orderStatus: 'pending_initiation', // Initial status
        initiatedAt: serverTimestamp(), 
        createdAt: Timestamp.now(), 
        updatedAt: Timestamp.now(),
        paymentStatus: 'pending', 
      }, { merge: true }); 

      showNotification('Order saved, initiating payment...', 'info');

      // 2. Call PHP Backend for STK Push
      const response = await fetch(`${BASE_URL}/initiate.php`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: mpesaPhoneNumber,
          amount: totalAmount,
          event_id: order.eventId,
          user_id: currentUser.uid,
          selected_tickets: order.tickets, 
          transaction_description: `Naks Yetu Tickets for ${eventDetails?.eventName}`,
          checkout_request_id: orderId, // Pass orderId as CheckoutRequestID for linking
        }),
      });

      const data = await response.json();
      console.log("STK Push PHP Response:", data); 

      if (data.success) {
        setPaymentStatusMessage(data.CustomerMessage || 'Please approve the STK Push on your phone.');
        showNotification('STK Push sent. Check your phone!', 'success');
        setDarajaCheckoutRequestID(data.CheckoutRequestID); // Save Daraja's ID
        // Update order document with Daraja's CheckoutRequestID
        await orderDocRef.update({
            checkoutRequestID: data.CheckoutRequestID,
            orderStatus: 'stk_push_sent',
            updatedAt: serverTimestamp(),
        });
        // Start polling Firestore for status updates from callback.php
        pollPaymentStatus(orderId, data.CheckoutRequestID);

      } else {
        setPaymentStatusMessage(data.message || 'Payment initiation failed.');
        setInitialDataError(data.developerMessage || 'Unknown error from M-Pesa.');
        showNotification(`Payment failed: ${data.message}`, 'error');
        // Update order status to failed
        await orderDocRef.update({
            orderStatus: 'stk_push_failed',
            ResultDesc: data.message,
            updatedAt: serverTimestamp(),
        });
        setIsProcessingPayment(false); // Allow user to retry
        // Modal remains open, closed by user.
      }
    } catch (err) {
      console.error("Error during checkout process:", err);
      setInitialDataError(`Checkout error: ${err.message}`);
      setPaymentStatusMessage('An error occurred during checkout.');
      showNotification(`Checkout error: ${err.message}`, 'error');
      // Update order status to internal error
      if (order?.orderId) {
          try {
              await doc(collection(db, ORDERS_COLLECTION_PATH), order.orderId).update({
                  orderStatus: 'internal_error',
                  ResultDesc: err.message,
                  updatedAt: serverTimestamp(),
              });
          } catch (updateErr) {
              console.error("Failed to update order status to internal_error:", updateErr);
          }
      }
    } finally {
      // setIsProcessingPayment(false); // This is handled by polling for success/failure
    }
  };

  // Function to poll Firestore for payment status updates from callback.php
  const pollPaymentStatus = useCallback((orderId, checkoutRequestId) => {
    const paymentDocRef = doc(collection(db, PAYMENTS_TRANSACTIONS_COLLECTION_PATH), checkoutRequestId);
    
    // Set up real-time listener for the payment document
    const unsubscribe = onSnapshot(paymentDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log("Polling update for CheckoutRequestID " + checkoutRequestId + ":", data);
        setPaymentStatusMessage(`M-Pesa status: ${data.ResultDesc || data.status}`);

        if (data.status === 'Completed') {
          showNotification('Payment successful! Your tickets will be emailed shortly.', 'success', 8000);
          setPaymentStatusMessage('Payment successful! Generating tickets...');
          // Update main order status to paid/completed
          doc(collection(db, ORDERS_COLLECTION_PATH), orderId).update({
            orderStatus: 'paid',
            paymentStatus: 'completed',
            orderEndTime: serverTimestamp(), 
            mpesaReceipt: data.MpesaReceiptNumber,
            updatedAt: serverTimestamp(),
          });
          setIsProcessingPayment(false); // Payment is done
          setShowPaymentStatusModal(true); // Keep modal open for final message
          setCurrentStep(3); // Move to confirmation step
          unsubscribe(); // Stop polling
        } else if (data.status === 'Failed' || data.status === 'STK_Push_Failed' || data.status === 'Cancelled') {
          showNotification('Payment failed or cancelled. Please try again.', 'error', 8000);
          setPaymentStatusMessage('Payment failed. ' + data.ResultDesc);
          // Update main order status to failed
          doc(collection(db, ORDERS_COLLECTION_PATH), orderId).update({
            orderStatus: 'payment_failed',
            paymentStatus: 'failed',
            ResultDesc: data.ResultDesc,
            updatedAt: serverTimestamp(),
          });
          setIsProcessingPayment(false); // Payment is done
          setShowPaymentStatusModal(true); // Keep modal open to show failure
          unsubscribe(); // Stop polling
        } else if (data.status === 'Pending' || data.status === 'STK_Push_Sent') {
          // Keep showing status message, continue polling
          setIsProcessingPayment(true); // Keep processing flag true
        }
      }
    }, (err) => {
      console.error("Error polling payment status:", err);
      showNotification("Error checking payment status. Please check your M-Pesa messages.", 'error');
      unsubscribe();
      setIsProcessingPayment(false);
      setShowPaymentStatusModal(false); // Close modal on polling error
    });

    // Timeout to stop polling after a certain period (e.g., 5 minutes)
    const pollingTimeout = setTimeout(() => {
        if (unsubscribe) {
            unsubscribe();
            showNotification("Payment confirmation timed out. Please check your M-Pesa messages or contact support.", 'warning');
            doc(collection(db, ORDERS_COLLECTION_PATH), orderId).update({
                orderStatus: 'payment_timeout',
                updatedAt: serverTimestamp(),
            });
            setIsProcessingPayment(false);
            setShowPaymentStatusModal(false);
        }
    }, 5 * 60 * 1000); // 5 minutes timeout

    // Cleanup function for useEffect (if this pollPaymentStatus is called inside useEffect)
    return () => {
        clearTimeout(pollingTimeout);
        if (unsubscribe) unsubscribe();
    };
  }, [showNotification]); // Dependencies for useCallback


  if (loadingInitialData || loadingAuth || !order || !eventDetails) {
    return (
      <div className={styles.checkoutContainer}>
        <LoadingSkeleton count={3} />
        <p className={styles.loadingText}>Loading checkout details...</p>
      </div>
    );
  }

  const total = totalAmount; // Use totalAmount from state
  const PAYBILL_NUMBER = "4168319"; 
  // Refined ACCOUNT_REFERENCE_DISPLAY: Use customer name if available, otherwise User ID, then event name.
  const ACCOUNT_REFERENCE_DISPLAY = `NAKS_${(customerName.replace(/\s+/g, '') || currentUser?.uid?.substring(0,5) || 'Guest').substring(0, 5).toUpperCase()}_${eventDetails.eventName.replace(/\s+/g, '').substring(0, 5).toUpperCase()}`;

  // Disable payment button if cart is empty or amount is 0, or phone number invalid
  const isPayButtonDisabled = isProcessingPayment || total <= 0 || !mpesaPhoneNumber || mpesaPhoneNumber.length < 12 || !mpesaPhoneNumber.startsWith('2547');

  // Progress steps for UI
  const progressSteps = [
    { id: 1, name: 'Order Confirmation', icon: ShoppingCartIcon },
    { id: 2, name: 'Payment', icon: CreditCardIcon },
    { id: 3, name: 'Confirmation', icon: CheckCircleIcon },
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
          <div className={styles.progressBarFill} style={{ width: `${((currentStep - 1) / (progressSteps.length - 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Main Content Area based on Step */}
      <div className={styles.checkoutContent}>
        {/* Step 1: Order Confirmation */}
        {currentStep === 1 && (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>Confirm Your Order: <span className={styles.gradientText}>{eventDetails.eventName}</span></h2>
            
            <div className={styles.eventSummary}>
              <img src={eventDetails.bannerImageUrl || 'https://placehold.co/100x100?text=Event'} alt={eventDetails.eventName} className={styles.eventThumbnail} />
              <div className={styles.eventInfo}>
                <h4 className={styles.eventName}>{eventDetails.eventName}</h4>
                <p className={styles.eventMeta}>{eventDetails.startDate ? new Date(eventDetails.startDate).toLocaleDateString() : 'N/A'} at {eventDetails.startTime} - {eventDetails.mainLocation}</p>
              </div>
            </div>

            <div className={styles.ticketsSummary}>
              <h3 className={styles.sectionSubHeader}>Selected Tickets:</h3>
              {order.tickets.length === 0 ? (
                <p className={styles.noTicketsMessage}>No tickets selected. Please go back to the event page.</p>
              ) : (
                <ul className={styles.ticketsList}>
                  {order.tickets.map(ticket => (
                    <li key={ticket.ticketTypeId} className={styles.ticketItem}>
                      <div className={styles.ticketDetails}>
                        <span>{ticket.name}</span>
                        <span className={styles.ticketPrice}>KES {parseFloat(ticket.price).toFixed(2)}</span>
                      </div>
                      <div className={styles.ticketQuantityControls}>
                        <button onClick={() => handleModifyQuantity(ticket.ticketTypeId, -1)} disabled={ticket.quantity <= 1 || isProcessingPayment} className={styles.quantityButton}>
                          <MinusCircleIcon className="h-5 w-5" />
                        </button>
                        <span className={styles.ticketQuantity}>{ticket.quantity}</span>
                        <button onClick={() => handleModifyQuantity(ticket.ticketTypeId, 1)} disabled={isProcessingPayment} className={styles.quantityButton}>
                          <PlusCircleIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleRemoveTicket(ticket.ticketTypeId)} disabled={isProcessingPayment} className={styles.removeTicketButton} title="Remove all of this ticket type">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.totalSection}>
              <span>Total Amount:</span>
              <span className={styles.totalAmount}>KES {total.toFixed(2)}</span>
            </div>

            {/* Customer Information Section (for display only if authenticated, otherwise for input) */}
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

            <div className={styles.navigationButtons}>
                <button onClick={() => navigate('/events')} className={commonFormStyles.secondaryButton}>
                    <ArrowLeftIcon className="h-5 w-5" /> Back to Events
                </button>
                <button onClick={handleNextStep} className={commonFormStyles.primaryButton} disabled={totalAmount <= 0}>
                    Proceed to Payment <ArrowRightIcon className="h-5 w-5" />
                </button>
            </div>
          </section>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>M-Pesa Payment</h2>
            
            <div className={styles.mpesaForm}>
                <label htmlFor="mpesaPhone" className={styles.formLabel}>M-Pesa Phone Number:</label>
                <TextInput 
                    id="mpesaPhone" 
                    name="mpesaPhone" 
                    type="tel" 
                    value={mpesaPhoneNumber} 
                    onChange={handlePhoneChange} 
                    placeholder="e.g., 2547XXXXXXXX" 
                    className={styles.formInput} 
                    disabled={isProcessingPayment}
                    icon={PhoneIcon}
                />
                <p className={styles.formHint}>Enter your Safaricom M-Pesa registered number.</p>
            </div>

            <div className={styles.paymentInstructions}>
                <p className={styles.instructionIntro}>
                    Your payment for **{eventDetails.eventName}** is **KES {total.toFixed(2)}**.
                    Please use the following details to complete your payment via M-Pesa.
                </p>
                <div className={styles.manualPayDetails}>
                    <p><strong>Business No.:</strong> <span id="paybill-number">{PAYBILL_NUMBER}</span> 
                        <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(PAYBILL_NUMBER).then(() => showNotification('Paybill copied!', 'info'))}>
                            <DocumentDuplicateIcon className="h-4 w-4" /> Copy
                        </button>
                    </p>
                    <p><strong>Account No.:</strong> <span id="account-number" className={styles.highlightText}>{ACCOUNT_REFERENCE_DISPLAY}</span> 
                        <button className={styles.copyButton} onClick={() => navigator.clipboard.writeText(ACCOUNT_REFERENCE_DISPLAY).then(() => showNotification('Account number copied!', 'info'))}>
                            <DocumentDuplicateIcon className="h-4 w-4" /> Copy
                        </button>
                    </p>
                    <p><strong>Amount:</strong> <span id="amount-display" className={styles.highlightText}>KES {total.toFixed(2)}</span></p>
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
                    <li>Enter **Amount** as **<span className={styles.highlightText}>KES {total.toFixed(2)}</span>**.</li>
                    <li>Enter your M-Pesa PIN and confirm.</li>
                </ol>
                <p className={styles.finalInstructionText}>
                    **Important:** Use the Account No. exactly as displayed. Your tickets will be confirmed after payment.
                </p>
            </div>

            <div className={styles.navigationButtons}>
                <button onClick={handlePrevStep} className={commonFormStyles.secondaryButton} disabled={isProcessingPayment}>
                    <ArrowLeftIcon className="h-5 w-5" /> Back
                </button>
                <button 
                  onClick={initiateSTKPushPayment} 
                  className={commonFormStyles.primaryButton}
                  disabled={isPayButtonDisabled}
                >
                  {isProcessingPayment ? 'Processing...' : `Initiate STK Push for KES ${total.toFixed(2)}`}
                </button>
            </div>
          </section>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>Payment Confirmation</h2>
            <div className={styles.confirmationContent}>
              {paymentStatusMessage.includes('successful') ? (
                <>
                  <CheckCircleIcon className={styles.confirmationIconSuccess} />
                  <p className={styles.confirmationMessageSuccess}>Payment Confirmed!</p>
                  <p className={styles.confirmationSubMessage}>Your tickets have been sent to **{customerEmail || 'your email'}** and are available in your profile.</p>
                  <div className={styles.navigationButtons}>
                    <button onClick={() => navigate('/dashboard/my-tickets')} className={commonFormStyles.primaryButton}>
                      <TicketIcon className="h-5 w-5" /> Go to My Tickets
                    </button>
                    <button onClick={() => navigate('/events')} className={commonFormStyles.secondaryButton}>
                      <CalendarDaysIcon className="h-5 w-5" /> Explore More Events
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <InformationCircleIcon className={styles.confirmationIconInfo} />
                  <p className={styles.confirmationMessageInfo}>Payment Status: {paymentStatusMessage}</p>
                  <p className={styles.confirmationSubMessage}>If payment was successful, your tickets will be emailed shortly. If not, please try again or contact support.</p>
                  <div className={styles.navigationButtons}>
                    <button onClick={() => setCurrentStep(2)} className={commonFormStyles.primaryButton}>
                      <ArrowPathIcon className="h-5 w-5" /> Retry Payment
                    </button>
                    <button onClick={() => navigate('/events')} className={commonFormStyles.secondaryButton}>
                      <CalendarDaysIcon className="h-5 w-5" /> Go to Events
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Global Payment Status Modal (for polling feedback) */}
      <Modal isOpen={showPaymentStatusModal} onClose={() => { if (!isProcessingPayment) setShowPaymentStatusModal(false); }}> 
        <h3 className={styles.modalTitle}>{isProcessingPayment ? 'Payment In Progress' : 'Payment Status'}</h3>
        <p className={styles.modalMessage}>{paymentStatusMessage}</p>
        {isProcessingPayment && (
          <div className={styles.spinner}></div> 
        )}
        {initialDataError && <p className={styles.errorMessage}>{initialDataError}</p>}
        {!isProcessingPayment && ( 
          <button onClick={() => setShowPaymentStatusModal(false)} className={commonFormStyles.secondaryButton}>Close</button>
        )}
      </Modal>
    </div>
  );
};

export default CheckoutPage;