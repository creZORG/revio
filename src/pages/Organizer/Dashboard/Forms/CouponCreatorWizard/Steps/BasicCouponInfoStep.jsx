import React, { useCallback } from 'react';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowRight, FaSpinner, FaPercentage, FaDollarSign } from 'react-icons/fa';

import styles from '../CouponCreatorWizard.module.css'; // Wizard specific styles

const BasicCouponInfoStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, isSubmitting }) => {
  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value })); // Parse numbers
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, [setFormData, setFormErrors]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (!formData.code.trim()) errors.code = 'Coupon code is required.';
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) errors.discountValue = 'Discount value must be a positive number.';
    if (formData.discountType === 'percentage' && (parseFloat(formData.discountValue) > 100 || parseFloat(formData.discountValue) < 0)) errors.discountValue = 'Percentage must be between 0 and 100.';
    if (formData.usageLimit && (isNaN(parseInt(formData.usageLimit)) || parseInt(formData.usageLimit) <= 0)) errors.usageLimit = 'Usage limit must be a positive integer.';
    if (formData.perUserLimit && (isNaN(parseInt(formData.perUserLimit)) || parseInt(formData.perUserLimit) <= 0)) errors.perUserLimit = 'Per user limit must be a positive integer.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleNext = () => {
    if (validateStep()) {
      onNext(formData);
    } else {
      showNotification('Please correct the errors in Basic Coupon Info.', 'error');
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Basic Coupon Information</h3>
      <div className="form-group">
        <label htmlFor="code" className="form-label">Coupon Code <span className="required-star">*</span></label>
        <input type="text" id="code" name="code" className="input-field" value={formData.code} onChange={handleInputChange} disabled={isSubmitting} placeholder="e.g., SUMMER20" />
        {formErrors.code && <p className="error-message-box">{formErrors.code}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="discountType" className="form-label">Discount Type <span className="required-star">*</span></label>
        <select id="discountType" name="discountType" className="input-field" value={formData.discountType} onChange={handleInputChange} disabled={isSubmitting}>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount (KES)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="discountValue" className="form-label">Discount Value <span className="required-star">*</span></label>
        <input type="number" id="discountValue" name="discountValue" className="input-field" value={formData.discountValue} onChange={handleInputChange} disabled={isSubmitting} min="0" step="0.01" placeholder={formData.discountType === 'percentage' ? 'e.g., 20 (for 20%)' : 'e.g., 500 (for KES 500)'} />
        {couponFormErrors.discountValue && <p className="error-message-box">{couponFormErrors.discountValue}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="usageLimit" className="form-label">Total Usage Limit <span className="optional-label">(Optional)</span></label>
        <input type="number" id="usageLimit" name="usageLimit" className="input-field" value={formData.usageLimit} onChange={handleInputChange} disabled={isSubmitting} min="1" placeholder="e.g., 100 (total uses)" />
        {couponFormErrors.usageLimit && <p className="error-message-box">{couponFormErrors.usageLimit}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="perUserLimit" className="form-label">Uses Per User <span className="optional-label">(Optional)</span></label>
        <input type="number" id="perUserLimit" name="perUserLimit" className="input-field" value={formData.perUserLimit} onChange={handleInputChange} disabled={isSubmitting} min="1" placeholder="e.g., 1 (one use per user)" />
        {couponFormErrors.perUserLimit && <p className="error-message-box">{couponFormErrors.perUserLimit}</p>}
      </div>

      <div className={styles.actionButtons} style={{justifyContent: 'flex-end'}}>
        <Button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
          Next Step <FaArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default BasicCouponInfoStep;