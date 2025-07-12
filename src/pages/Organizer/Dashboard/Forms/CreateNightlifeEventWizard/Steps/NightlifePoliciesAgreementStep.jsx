import React, { useCallback, useState } from 'react';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';

import styles from '../CreateNightlifeEventWizard.module.css'; // Wizard specific styles

const NightlifePoliciesAgreementStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, onPrev, isSubmitting }) => {
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, [setFormData, setFormErrors]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and conditions.';
    }
    if (formData.refundPolicyType === 'custom' && !formData.customRefundPolicy.trim()) {
      errors.customRefundPolicy = 'Custom refund policy is required if selected.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleSubmit = () => {
    if (validateStep()) {
      onNext(formData); // Pass all formData to the final submit handler
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Policies & Agreements</h3>

      <div className="form-group">
        <label className={styles.formLabel}>Refund Policy <span className={styles.requiredStar}>*</span></label>
        <div className={styles.radioGroup}>
          <label>
            <input type="radio" name="refundPolicyType" value="naksyetu" checked={formData.refundPolicyType === 'naksyetu'} onChange={handleInputChange} disabled={isSubmitting} />
            Use Naks Yetu Standard Refund Policy
          </label>
          <label>
            <input type="radio" name="refundPolicyType" value="custom" checked={formData.refundPolicyType === 'custom'} onChange={handleInputChange} disabled={isSubmitting} />
            Provide Custom Refund Policy
          </label>
        </div>
        {formErrors.refundPolicyType && <p className="error-message-box">{formErrors.refundPolicyType}</p>}
      </div>

      {formData.refundPolicyType === 'custom' && (
        <div className="form-group">
          <label htmlFor="customRefundPolicy" className={styles.formLabel}>Custom Refund Policy Details <span className={styles.requiredStar}>*</span></label>
          <textarea id="customRefundPolicy" name="customRefundPolicy" className={styles.inputField} rows="6" placeholder="Describe your custom refund policy..." required value={formData.customRefundPolicy} onChange={handleInputChange} disabled={isSubmitting}></textarea>
          {formErrors.customRefundPolicy && <p className="error-message-box">{formErrors.customRefundPolicy}</p>}
        </div>
      )}

      <div className="form-group">
        <label className={styles.formLabel}>
          <input type="checkbox" id="agreedToTerms" name="agreedToTerms" className={styles.formCheckbox} checked={formData.agreedToTerms} onChange={handleInputChange} disabled={isSubmitting} />
          I agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-link">Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-link">Privacy Policy</a> <span className={styles.requiredStar}>*</span>
        </label>
        {formErrors.agreedToTerms && <p className="error-message-box">{formErrors.agreedToTerms}</p>}
      </div>

      <div className={styles.actionButtons}>
        <Button onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
          <FaArrowLeft /> Previous
        </Button>
        <Button onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {isSubmitting ? 'Creating Event...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default NightlifePoliciesAgreementStep;