import React, { useState, useEffect } from 'react';
import TextInput from './../Common/TextInput';
import Button from './../Common/Button';
import CouponInput from './CouponInput';
import { InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
// CORRECTED: Import Fa icons from react-icons/fa
import { FaUser, FaEnvelope, FaPhoneAlt, FaTrashAlt, FaPlus, FaMinus, FaTag } from 'react-icons/fa';
import { format } from 'date-fns';
import styles from './CheckoutStepOne.module.css';
import pageStyles from '../../pages/CheckoutPage.module.css';
import commonButtonStyles from './../Common/Button.module.css';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const CheckoutStepOne = ({
    cartItems,
    eventDetails,
    customerInfo,
    setCustomerInfo,
    couponCode,
    setCouponCode,
    applyCoupon,
    appliedCoupon,
    totalAmount,
    originalTotalAmount,
    paymentMethod,
    setPaymentMethod,
    handleInitiatePayment,
    handleManualPaymentConfirmation,
    isProcessingPayment,
    authenticatedUser,
    paybillNumber,
    orderId,
    handleModifyQuantity,
    handleRemoveTicket,
}) => {
    const { showNotification } = useNotification();

    const [fullNameError, setFullNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mpesaPhoneNumberError, setMpesaPhoneNumberError] = useState('');

    const PROCESSING_FEE = 0.00;

    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleMpesaPhoneInputChange = (e) => {
        let value = e.target.value;
        value = value.replace(/[^0-9]/g, '');

        if (value.startsWith('07') && value.length <= 10) {
            value = '254' + value.substring(1);
        } else if (value.startsWith('01') && value.length <= 10) {
            value = '254' + value.substring(1);
        } else if (value.startsWith('7') && value.length <= 9) {
            value = '254' + value;
        } else if (value.startsWith('1') && value.length <= 9) {
            value = '254' + value;
        }

        if (value.length > 12) {
            value = value.substring(0, 12);
        }

        setCustomerInfo(prev => ({ ...prev, mpesaPhoneNumber: value }));
        validateField('mpesaPhoneNumber', value);
    };


    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'fullName':
                if (!value.trim()) {
                    error = 'Full name is required.';
                }
                setFullNameError(error);
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'Email address is required.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address.';
                }
                setEmailError(error);
                break;
            case 'mpesaPhoneNumber':
                if (!value.trim()) {
                    error = 'Phone number is required.';
                } else if (!/^(2547|2541)\d{8}$/.test(value)) {
                    error = 'Format: 2547XXXXXXXX or 2541XXXXXXXX.';
                }
                setMpesaPhoneNumberError(error);
                break;
            default:
                break;
        }
        return error === '';
    };

    const isFormValid = () => {
        const isFullNameValid = customerInfo.fullName.trim() !== '';
        const isEmailValid = customerInfo.email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email);
        const isMpesaPhoneValid = customerInfo.mpesaPhoneNumber.trim() !== '' && /^(2547|2541)\d{8}$/.test(customerInfo.mpesaPhoneNumber);

        return isFullNameValid && isEmailValid && isMpesaPhoneValid;
    };

    const handleInitiatePaymentClick = () => {
        if (isProcessingPayment) return;
        if (isFormValid()) {
            // CRITICAL FIX: Only open the modal, the modal itself will trigger handleInitiatePayment
            // The modal is controlled by isProcessingPayment and currentStep in CheckoutPage.jsx
            // By setting isProcessingPayment to true and currentStep to 2, the modal will open.
            // The handleInitiatePayment prop will be passed to the modal.
            handleInitiatePayment(); // This will now be called by the modal's useEffect
        } else {
            validateField('fullName', customerInfo.fullName);
            validateField('email', customerInfo.email);
            validateField('mpesaPhoneNumber', customerInfo.mpesaPhoneNumber);
            showNotification('Please correct the errors in your information.', 'error');
        }
    };

    const handleManualPaymentConfirmationClick = () => {
        if (isProcessingPayment) return;
        if (isFormValid()) {
            handleManualPaymentConfirmation(); // This will now be called by the modal's useEffect
        } else {
            validateField('fullName', customerInfo.fullName);
            validateField('email', customerInfo.email);
            validateField('mpesaPhoneNumber', customerInfo.mpesaPhoneNumber);
            showNotification('Please correct the errors in your information.', 'error');
        }
    };

    const arePaymentButtonsDisabled = isProcessingPayment || Number(totalAmount) <= 0;

    useEffect(() => {
        if (authenticatedUser) {
            validateField('fullName', customerInfo.fullName);
            validateField('email', customerInfo.email);
            validateField('mpesaPhoneNumber', customerInfo.mpesaPhoneNumber);
        }
    }, [authenticatedUser, customerInfo.fullName, customerInfo.email, customerInfo.mpesaPhoneNumber]);


    return (
        <div className={styles.sectionCard}>
            {/* Section 1: Order Summary */}
            <section className="mb-8">
                <h2 className={styles.sectionHeader}>Order Summary: <span className={pageStyles.gradientText}>{eventDetails?.eventName || 'Loading Event...'}</span></h2>

                {eventDetails && (
                    <div className={styles.eventSummary}>
                        {eventDetails.bannerImageUrl && (
                            <img
                                src={eventDetails.bannerImageUrl}
                                alt={eventDetails.eventName}
                                className={styles.eventThumbnail}
                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                        )}
                        <div className={styles.eventInfo}>
                            <p className={styles.eventName}>{eventDetails.eventName}</p>
                            <p className={styles.eventMeta}>
                                {eventDetails.startDate && format(new Date(eventDetails.startDate), 'MMM d, yyyy')} at {eventDetails.startTime}
                            </p>
                            <p className={styles.eventMeta}>{eventDetails.mainLocation}</p>
                        </div>
                    </div>
                )}

                <div className={styles.ticketsSummary}>
                    <ul className={styles.ticketsList}>
                        {Object.values(cartItems).map(item => (
                            <li key={item.id} className={styles.ticketItem}>
                                <div className={styles.ticketDetails}>
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span className={styles.ticketPrice}>KES {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                                <div className={styles.ticketQuantityControls}>
                                    <button
                                        type="button"
                                        className={styles.quantityButton}
                                        onClick={() => handleModifyQuantity(item, -1)}
                                        disabled={item.quantity <= 1 || isProcessingPayment}
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className={styles.ticketQuantity}>{item.quantity}</span>
                                    <button
                                        type="button"
                                        className={styles.quantityButton}
                                        onClick={() => handleModifyQuantity(item, 1)}
                                        disabled={isProcessingPayment}
                                    >
                                        <FaPlus />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTicket(item.id)}
                                        disabled={isProcessingPayment}
                                        className={styles.removeTicketButton}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {Object.keys(cartItems).length === 0 && (
                        <p className={styles.noTicketsMessage}>No tickets in your cart.</p>
                    )}
                </div>
                <div className={styles.totalSection}>
                    <div>
                        <p className={styles.processingFee}>Processing Fee: KES {PROCESSING_FEE.toFixed(2)}</p>
                        <div className={styles.subtotalLine}>
                            <span>Subtotal:</span>
                            <span>KES {originalTotalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className={styles.totalLine}>
                        <span>Total:</span>
                        <span className={styles.totalAmount}>KES {totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </section>

            {/* Section 2: Your Information */}
            <section className={styles.customerInfoSection}>
                <h2 className={styles.sectionHeader}>Your Information</h2>
                {authenticatedUser ? (
                    <div className={styles.ticketDeliveryMessage}>
                        <InformationCircleIcon className={styles.messageIcon} />
                        Logged in as <span className="font-semibold">{authenticatedUser.displayName}</span>. Tickets will be sent to <span className="font-semibold">{authenticatedUser.email}</span> and will be available under your 'My Tickets' section in your profile.
                        <Link to="/user-dashboard/my-tickets" className={styles.dashboardLink}>View My Tickets</Link>
                    </div>
                ) : (
                    <div className={styles.inputGroupContainer}>
                        <TextInput
                            label="Full Name"
                            name="fullName"
                            value={customerInfo.fullName}
                            onChange={handleCustomerInfoChange}
                            required
                            className={styles.formInputCompact}
                            error={fullNameError}
                            icon={FaUser}
                        />

                        <TextInput
                            label="Email Address"
                            name="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={handleCustomerInfoChange}
                            required
                            className={styles.formInputCompact}
                            error={emailError}
                            icon={FaEnvelope}
                        />

                        {/* Custom Phone Number Input */}
                        <div className={`${styles.formInputCompact} ${styles.fullWidth}`}>
                            <label htmlFor="mpesaPhoneNumber" className={styles.label}>M-Pesa Phone Number<span className={styles.required}>*</span></label>
                            <div className={`${styles.phoneInputWrapper} ${mpesaPhoneNumberError ? styles.error : ''}`}>
                                <FaPhoneAlt className={styles.inputIcon} />
                                <span className={styles.phonePrefix}>254</span>
                                <input
                                    id="mpesaPhoneNumber"
                                    name="mpesaPhoneNumber"
                                    type="tel"
                                    value={customerInfo.mpesaPhoneNumber.replace(/^254/, '')}
                                    onChange={handleMpesaPhoneInputChange}
                                    required
                                    placeholder="7XXXXXXXXX or 1XXXXXXXXX"
                                    className={styles.phoneInputField}
                                    disabled={isProcessingPayment}
                                />
                            </div>
                            {mpesaPhoneNumberError && <p className={styles.errorMessage}>{mpesaPhoneNumberError}</p>}
                        </div>
                    </div>
                )}
                {authenticatedUser && (
                    <div className={styles.ticketDeliveryMessage}>
                        <CheckCircleIcon className={styles.messageIcon} />
                        Your tickets will be sent to <span className="font-semibold">{authenticatedUser.email}</span> and will be available under your 'My Tickets' section in your profile.
                        <Link to="/user-dashboard/my-tickets" className={styles.dashboardLink}>View My Tickets</Link>
                    </div>
                )}
            </section>

            {/* Section 3: Have a Coupon Code? */}
            <section className={styles.couponSection}>
                <h2 className={styles.sectionHeader}>Have a Coupon Code?</h2>
                <p className={`${styles.guestMessage} text-center`}>
                    <FaTag className="inline-block mr-2 text-gray-500" />Unlock amazing savings! Use coupon codes from your favorite Naks Yetu influencers and get up to KES {appliedCoupon ? appliedCoupon.discount.toFixed(2) : (originalTotalAmount * 0.15).toFixed(2)} off your current subtotal!
                </p>
                <CouponInput
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    applyCoupon={applyCoupon}
                    appliedCoupon={appliedCoupon}
                    isApplying={isProcessingPayment}
                />
            </section>

            {/* Section 4: Final Total & Payment Method */}
            <section className={styles.paymentDetailsSection}>
                <h2 className={styles.sectionHeader}>Payment Details</h2>

                <div className={styles.totalSection}>
                    <span>Total to Pay:</span>
                    <span className={styles.totalAmount}>KES {totalAmount.toFixed(2)}</span>
                </div>

                <div className="mt-6 mb-6">
                    <h3 className={styles.sectionSubHeader}>Choose Payment Method</h3>
                    <div className="flex flex-col space-y-3">
                        <label className="inline-flex items-center text-gray-700 dark:text-gray-200">
                            <input
                                type="radio"
                                className="form-radio text-pink-500"
                                name="paymentMethod"
                                value="stkPush"
                                checked={paymentMethod === 'stkPush'}
                                onChange={() => setPaymentMethod('stkPush')}
                            />
                            <span className="ml-2">M-Pesa STK Push (Recommended)</span>
                        </label>
                        <label className="inline-flex items-center text-gray-700 dark:text-gray-200">
                            <input
                                type="radio"
                                className="form-radio text-pink-500"
                                name="paymentMethod"
                                value="manualPaybill"
                                checked={paymentMethod === 'manualPaybill'}
                                onChange={() => setPaymentMethod('manualPaybill')}
                            />
                            <span className="ml-2">Manual M-Pesa Paybill</span>
                        </label>
                    </div>
                </div>

                {paymentMethod === 'stkPush' && (
                    <div className={styles.mpesaForm}>
                        <p className={styles.instructionIntro}>
                            Click "Initiate STK Push" to receive a payment prompt on your M-Pesa registered phone number.
                        </p>
                        <button
                            type="button"
                            onClick={handleInitiatePaymentClick} // This now opens the modal
                            disabled={arePaymentButtonsDisabled}
                            className={`${commonButtonStyles.btn} ${commonButtonStyles.btnPrimary}`}
                        >
                            {isProcessingPayment ? 'Initiating...' : `Initiate STK Push for KES ${totalAmount.toFixed(2)}`}
                        </button>
                    </div>
                )}

                {paymentMethod === 'manualPaybill' && (
                    <div className={styles.paymentInstructions}>
                        <p className={styles.instructionIntro}>
                            To complete your payment manually, follow these steps:
                        </p>
                        <div className={styles.manualPayDetails}>
                            <p><strong>Business No.:</strong> <span className={styles.highlightText}>{paybillNumber}</span>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(paybillNumber)}
                                    className={styles.copyButton}
                                >
                                    Copy
                                </button>
                            </p>
                            <p><strong>Account No.:</strong> <span className={styles.highlightText}>{orderId || 'Generating...'}</span>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(orderId)}
                                    disabled={!orderId}
                                    className={styles.copyButton}
                                >
                                    Copy
                                </button>
                            </p>
                            <p><strong>Amount:</strong> <span className={styles.highlightText}>KES {totalAmount.toFixed(2)}</span>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(totalAmount.toFixed(2))}
                                    className={styles.copyButton}
                                >
                                    Copy
                                </button>
                            </p>
                        </div>
                        <ol className={styles.instructionList}>
                            <li>Go to M-Pesa on your phone.</li>
                            <li>Select 'Lipa Na M-Pesa'.</li>
                            <li>Select 'Pay Bill'.</li>
                            <li>Enter Business No.: <strong>{paybillNumber}</strong></li>
                            <li>Enter Account No.: <strong>{orderId || 'Your Order ID'}</strong></li>
                            <li>Enter Amount: <strong>KES {totalAmount.toFixed(2)}</strong></li>
                            <li>Enter your M-Pesa PIN.</li>
                        </ol>
                        <button
                            type="button"
                            onClick={handleManualPaymentConfirmationClick}
                            disabled={arePaymentButtonsDisabled}
                            className={`${commonButtonStyles.btn} ${commonButtonStyles.btnPrimary}`}
                        >
                            {isProcessingPayment ? 'Confirming...' : 'I have paid manually'}
                        </button>
                        <p className={styles.finalInstructionText}>
                            Your order status will update once we confirm your manual payment. This may take a few minutes.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CheckoutStepOne;