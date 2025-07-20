// src/components/Checkout/CouponInput.jsx
import React from 'react';
import TextInput from '../Common/TextInput.jsx';
import Button from '../Common/Button.jsx';
import styles from './CouponInput.module.css';
// Removed: import { TagIcon } from '@heroicons/react/24/outline'; // No longer needed if icon is removed from TextInput

/**
 * Renders the coupon input section.
 * Allows users to enter and apply coupon codes, and displays applied coupon information.
 *
 * @param {object} props - The component props.
 * @param {string} props.couponCode - The current value of the coupon input.
 * @param {function} props.setCouponCode - Setter for the coupon code.
 * @param {object} props.appliedCoupon - Object containing details of the applied coupon (e.g., { code: 'NAKSYETU10', discount: 0.10 }).
 * @param {function} props.handleApplyCoupon - Function to call when the "Apply Coupon" button is clicked.
 * @param {number} props.totalAmount - The current total amount of the order, including any discounts.
 */
const CouponInput = ({ couponCode, setCouponCode, appliedCoupon, handleApplyCoupon, totalAmount }) => {
    return (
        <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeader}>Do you have a coupon?</h2>
            <p className={styles.couponIntro}>Enter your coupon code below to apply discounts to your order.</p>

            <div className={styles.couponInputContainer}>
                <TextInput
                    label="Coupon Code"
                    id="couponCode"
                    name="couponCode"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g., NAKSYETU10"
                    // Removed: icon={TagIcon} // Removed the icon prop
                />
                <Button onClick={handleApplyCoupon} className={styles.applyCouponButton}>
                    Apply Coupon
                </Button>
            </div>

            {appliedCoupon && (
                <div className={styles.appliedCouponInfo}>
                    <p>Coupon <strong>{appliedCoupon.code}</strong> applied!</p>
                    <p>Discount: <strong>{(appliedCoupon.discount * 100).toFixed(0)}% OFF</strong></p>
                </div>
            )}

            <div className={styles.totalSection}>
                <span>Total Amount:</span>
                <span className={styles.totalAmount}>KES {totalAmount.toFixed(2)}</span>
            </div>
        </section>
    );
};

export default CouponInput;
