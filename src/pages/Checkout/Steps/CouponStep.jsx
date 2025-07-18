// /src/pages/Checkout/Steps/CouponStep.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaInfoCircle, FaSpinner } from 'react-icons/fa';

import TextInput from '../../../components/Common/TextInput.jsx';
import Button from '../../../components/Common/Button.jsx';
import styles from './CouponStep.module.css'; // Dedicated styles
import commonStyles from '../../CheckoutPage.module.css'; // For common checkout page styles

const CouponStep = ({ checkoutData, updateCheckoutData, showNotification }) => {
    const [couponCodeInput, setCouponCodeInput] = useState(checkoutData.couponCode || '');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponAppliedSuccessfully, setCouponAppliedSuccessfully] = useState(false);

    // Sync input with checkoutData when component loads or checkoutData changes externally
    useEffect(() => {
        setCouponCodeInput(checkoutData.couponCode || '');
        setCouponAppliedSuccessfully(checkoutData.couponDiscountAmount > 0);
    }, [checkoutData.couponCode, checkoutData.couponDiscountAmount]);


    const handleApplyCoupon = useCallback(async () => {
        setCouponError('');
        setCouponAppliedSuccessfully(false);
        if (!couponCodeInput.trim()) {
            setCouponError('Please enter a coupon code.');
            return;
        }

        setIsApplyingCoupon(true);
        showNotification('Applying coupon...', 'info');

        try {
            // --- SERVER-SIDE COUPON VALIDATION (Cloud Function) ---
            // In a real app, you'd call a Cloud Function to validate the coupon
            // This function would check:
            // 1. If coupon code exists
            // 2. If it's valid for this event/ticket types
            // 3. If quantity threshold is met (if applicable)
            // 4. Return discount amount

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock validation logic
            const lowerCaseCoupon = couponCodeInput.toLowerCase();
            let discountAmount = 0;
            let isValid = false;

            if (lowerCaseCoupon === 'naksyetu20' && checkoutData.calculatedTotalPrice >= 1000) {
                discountAmount = checkoutData.calculatedTotalPrice * 0.20; // 20% off
                isValid = true;
            } else if (lowerCaseCoupon === 'welcome500' && checkoutData.calculatedTotalPrice >= 500) {
                discountAmount = 500; // KES 500 off
                isValid = true;
            } else {
                setCouponError('Invalid or expired coupon code.');
                showNotification('Invalid coupon.', 'error');
            }

            if (isValid) {
                updateCheckoutData({
                    couponCode: couponCodeInput,
                    couponDiscountAmount: discountAmount,
                    finalAmountToPay: checkoutData.calculatedTotalPrice - discountAmount
                });
                setCouponAppliedSuccessfully(true);
                showNotification(`Coupon applied! You saved KES ${discountAmount.toFixed(2)}`, 'success');
            }

        } catch (err) {
            console.error("Coupon application error:", err);
            setCouponError(err.message || 'Failed to apply coupon.');
            showNotification('Failed to apply coupon.', 'error');
        } finally {
            setIsApplyingCoupon(false);
        }
    }, [couponCodeInput, checkoutData, updateCheckoutData, showNotification]);

    const handleRemoveCoupon = useCallback(() => {
        setCouponCodeInput('');
        setCouponError('');
        setCouponAppliedSuccessfully(false);
        updateCheckoutData({
            couponCode: '',
            couponDiscountAmount: 0,
            finalAmountToPay: checkoutData.calculatedTotalPrice // Reset to original total
        });
        showNotification('Coupon removed.', 'info');
    }, [checkoutData, updateCheckoutData, showNotification]);


    return (
        <motion.div
            className={`${commonStyles.section} ${styles.couponSection}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className={commonStyles.sectionTitle}>Do you have a coupon?</h2>
            
            <TextInput
                label="Coupon Code"
                id="couponCode"
                name="couponCode"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                placeholder="Enter coupon code"
                error={couponError}
                isDisabled={isApplyingCoupon || couponAppliedSuccessfully}
            />

            {!couponAppliedSuccessfully ? (
                <Button 
                    onClick={handleApplyCoupon} 
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.couponButton}`}
                >
                    {isApplyingCoupon ? <FaSpinner className="fa-spin" /> : 'Apply Coupon'}
                </Button>
            ) : (
                <div className={styles.couponAppliedInfo}>
                    <p className={styles.couponAppliedMessage}>
                        <FaCheckCircle /> Coupon "{checkoutData.couponCode}" applied! You save KES {checkoutData.couponDiscountAmount.toFixed(2)}.
                    </p>
                    <p className={styles.newTotalMessage}>New Total: KES {checkoutData.finalAmountToPay.toFixed(2)}</p>
                    <Button onClick={handleRemoveCoupon} className={`${commonStyles.btn} ${commonStyles.btnSecondary} ${styles.couponButton}`}>
                        Remove Coupon
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

CouponStep.validate = (data) => {
    // No specific validation needed for this step to proceed, as coupon is optional
    // Server-side validation handles coupon logic
    return {}; 
};

export default CouponStep;