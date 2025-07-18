// /src/pages/Checkout/Steps/PaymentDetailsStep.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaCopy, FaInfoCircle, FaSpinner } from 'react-icons/fa';

import TextInput from '../../../components/Common/TextInput.jsx';

import Button from '../../../components/Common/Button.jsx';
import styles from './PaymentDetailsStep.module.css'; // Dedicated styles
import commonStyles from '../../CheckoutPage.module.css'; // For common checkout page styles


const PaymentDetailsStep = ({ 
    checkoutData, 
    updateCheckoutData, 
    currentUser, 
    showNotification, 
    handlePaymentSuccess, // Keep as prop, but not called directly by this component's handlePayClick
    handlePaymentError,   // Keep as prop, but not called directly by this component's handlePayClick
    setMpesaPhoneNumber, 
    setSelectedPaymentMethod, 
    isProcessingPayment, 
    paymentErrors,
    handlePaymentInitiation // NEW: Callback to the parent's payment initiation logic
}) => {
    const [mpesaPhoneNumberInput, setMpesaPhoneNumberInput] = useState(checkoutData.mpesaPhoneNumber || '');
    const [selectedPaymentMethodInternal, setSelectedPaymentMethodInternal] = useState(checkoutData.selectedPaymentMethod || 'mpesa-stk'); 

    // Mock Paybill Details (In a real app, fetched from event or config)
    const mockPaybillNumber = '555555';
    const mockAccountNumber = `${checkoutData.event?.eventName.replace(/\s/g, '_').substring(0, 10) || 'NAKSETU'}_${currentUser?.uid?.substring(0,5) || 'GUEST'}`;

    const handlePaymentMethodChange = useCallback((e) => {
        setSelectedPaymentMethodInternal(e.target.value);
        setSelectedPaymentMethod(e.target.value); // Update parent state
    }, [setSelectedPaymentMethod]);

    const handlePayClick = useCallback(async () => {
        // This function's sole responsibility is to trigger the parent's payment initiation logic.
        // All validation and actual API calls are now handled in the parent (CheckoutPage.jsx)
        // and its associated Cloud Functions/Firestore polling.
        await handlePaymentInitiation(); 

    }, [handlePaymentInitiation]); // Only depend on the parent's handler

    const handleCopy = useCallback(async (targetId) => {
        const textToCopy = document.getElementById(targetId).textContent;
        try {
            await navigator.clipboard.writeText(textToCopy);
            showNotification(`${targetId === 'paybill-number' ? 'Paybill' : 'Account'} number copied!`, 'info');
        } catch (err) {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy. Please copy manually.', 'error');
        }
    }, [showNotification]);


    return (
        <motion.div
            className={`${commonStyles.section} ${styles.paymentDetailsSection}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className={commonStyles.sectionTitle}>Payment Method</h2>
            
            <div className={styles.paymentOptionsToggle}>
                <label className={styles.paymentOptionRadio}>
                    <input
                        type="radio"
                        id="mpesa-stk"
                        name="paymentMethod"
                        value="mpesa-stk"
                        checked={selectedPaymentMethodInternal === 'mpesa-stk'}
                        onChange={handlePaymentMethodChange}
                    />
                    <span className={styles.paymentLabel}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_logo.svg/1200px-M-PESA_logo.svg.png" alt="M-Pesa Logo" className={styles.mpesaLogo} />
                        M-Pesa STK Push
                    </span>
                </label>
                <label className={styles.paymentOptionRadio}>
                    <input
                        type="radio"
                        id="mpesa-manual"
                        name="paymentMethod"
                        value="mpesa-manual"
                        checked={selectedPaymentMethodInternal === 'mpesa-manual'}
                        onChange={handlePaymentMethodChange}
                    />
                    <span className={styles.paymentLabel}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_logo.svg/1200px-M-PESA_logo.svg.png" alt="M-Pesa Logo" className={styles.mpesaLogo} />
                        M-Pesa Manual Paybill
                    </span>
                </label>
            </div>

            {selectedPaymentMethodInternal === 'mpesa-stk' ? (
                <div className={styles.paymentDetailsContainer} id="mpesa-stk-details">
                    <div className={styles.formGroup}>
                        <label htmlFor="mpesa-phone-number" className={styles.formLabel}>M-Pesa Phone Number</label>
                        <TextInput
                            id="mpesa-phone-number"
                            name="mpesaPhoneNumber"
                            type="tel"
                            value={mpesaPhoneNumberInput} // Use local state for input
                            onChange={(e) => setMpesaPhoneNumberInput(e.target.value)} // Update local state
                            placeholder="e.g., 07XXXXXXXX or 2547XXXXXXXX"
                            required
                            error={paymentErrors.mpesaPhoneNumber} // Use paymentErrors from parent
                            icon={FaPhone}
                        />
                        {paymentErrors.mpesaPhoneNumber && <p className={commonStyles.errorMessageBox}>{paymentErrors.mpesaPhoneNumber}</p>}
                    </div>
                    <Button
                        onClick={handlePayClick} // Trigger parent's initiation logic
                        disabled={isProcessingPayment || checkoutData.calculatedTotalTickets === 0}
                        className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.payButton}`}
                    >
                        {isProcessingPayment ? <FaSpinner className="fa-spin" /> : `Pay KES ${checkoutData.finalAmountToPay.toFixed(2)} with M-Pesa`}
                    </Button>
                </div>
            ) : (
                <div id="mpesa-manual-details" className={styles.paymentDetailsContainer}>
                    <div className={styles.manualPayDetails}>
                        <p><strong>Business No.:</strong> <span id="paybill-number">{mockPaybillNumber}</span> <button className={styles.copyBtn} onClick={() => handleCopy('paybill-number')}><FaCopy /></button></p>
                        <p><strong>Account No.:</strong> <span id="account-number">{mockAccountNumber}</span> <button className={styles.copyBtn} onClick={() => handleCopy('account-number')}><FaCopy /></button></p>
                    </div>
                    <p className={styles.manualPayInstructions}>
                        <FaInfoCircle /> Use the M-Pesa menu on your phone: Lipa Na M-Pesa Pay Bill. Enter the Business No. and Account No. above. Your tickets will be confirmed automatically.
                    </p>
                    <Button disabled className={`${commonStyles.btn} ${commonStyles.btnSecondary} ${styles.payButton}`}>Confirm Manual Payment (Coming Soon)</Button>
                </div>
            )}
        </motion.div>
    );
};

PaymentDetailsStep.validate = (data) => {
    const errors = {};
    // Validation for phone number is moved to parent's handlePaymentInitiation.
    // This validate function is called before handlePaymentInitiation.
    // It can perform basic checks, but detailed validation is in the parent.
    if (data.selectedPaymentMethod === 'mpesa-stk') {
        if (!data.mpesaPhoneNumber || !data.mpesaPhoneNumber.trim()) {
            errors.mpesaPhoneNumber = 'M-Pesa phone number is required.';
        }
        // More robust regex check is in the parent
    }
    return Object.keys(errors).length > 0 ? errors : {};
};

export default PaymentDetailsStep;