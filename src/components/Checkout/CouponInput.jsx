import React from 'react';
import styles from './CouponInput.module.css'; // Import the CSS Module

const CouponInput = ({
    couponCode,
    setCouponCode,
    applyCoupon,
    appliedCoupon,
    isApplying, // Indicates if a process (like payment initiation) is ongoing
}) => {
    const handleInputChange = (e) => {
        setCouponCode(e.target.value);
    };

    const handleApplyClick = () => {
        applyCoupon(couponCode);
    };

    return (
        <div className={styles.couponContainer}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    value={couponCode}
                    onChange={handleInputChange}
                    placeholder="Enter coupon code"
                    className={`${styles.inputField} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
                    disabled={isApplying || appliedCoupon} // Disable if applying or a coupon is already applied
                    aria-label="Coupon code input"
                />
                <button
                    onClick={handleApplyClick}
                    className={styles.applyButton}
                    disabled={isApplying || !couponCode.trim() || !!appliedCoupon} // Disable if applying, input is empty, or coupon already applied
                >
                    {isApplying ? 'Applying...' : (appliedCoupon ? 'Applied' : 'Apply')}
                </button>
            </div>
            {appliedCoupon && (
                <p className={`${styles.feedbackMessage} ${styles.successMessage}`}>
                    Coupon '{appliedCoupon.code}' applied! You get KES {appliedCoupon.discount.toFixed(2)} off.
                </p>
            )}
            {/* You might add an error message display here if applyCoupon provides detailed error */}
            {/* For example: {!appliedCoupon && couponCode.trim() && !isApplying && <p className={`${styles.feedbackMessage} ${styles.errorMessage}`}>Invalid or expired coupon code.</p>} */}
        </div>
    );
};

export default CouponInput;