import React, { useCallback } from 'react';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaCalendarAlt, FaPercentage, FaDollarSign, FaUsers, FaInfoCircle, FaStar } from 'react-icons/fa';

import styles from '../CouponCreatorWizard.module.css'; // Wizard specific styles

const ReviewAndPublishStep = ({ formData, onNext, onPrev, isSubmitting }) => {
  const displayDiscount = formData.discountType === 'percentage' ? `${formData.discountValue}% OFF` : `KES ${parseFloat(formData.discountValue).toLocaleString()} OFF`;
  const displayExpiryDate = formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'N/A';

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Review & Publish Coupon</h3>

      <div className={styles.reviewSummary}>
        <div className={styles.reviewItem}>
          <strong>Coupon Code:</strong> <span>{formData.code}</span>
        </div>
        <div className={styles.reviewItem}>
          <strong>Discount:</strong> <span>{displayDiscount}</span>
        </div>
        <div className={styles.reviewItem}>
          <strong>Usage Limit:</strong> <span>{formData.usageLimit || 'No Limit'}</span>
        </div>
        <div className={styles.reviewItem}>
          <strong>Uses Per User:</strong> <span>{formData.perUserLimit || 'No Limit'}</span>
        </div>
        <div className={styles.reviewItem}>
          <strong>Expiry Date:</strong> <span>{displayExpiryDate}</span>
        </div>
        <div className={styles.reviewItem}>
          <strong>Applicable Events:</strong> <span>{formData.applicableEventIds.length > 0 ? `${formData.applicableEventIds.length} event(s)` : 'All Events'}</span>
        </div>
        {formData.attachedInfluencerId && (
          <div className={styles.reviewItem}>
            <strong>Attached Influencer:</strong> <span>{formData.attachedInfluencerId}</span>
          </div>
        )}
        <div className={styles.reviewItem}>
          <strong>Status:</strong> <span>{formData.status.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <Button onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
          <FaArrowLeft /> Previous
        </Button>
        <Button onClick={onNext} className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {isSubmitting ? 'Publishing...' : 'Publish Coupon'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewAndPublishStep;