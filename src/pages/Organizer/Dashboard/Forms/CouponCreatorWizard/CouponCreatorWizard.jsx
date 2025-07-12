import React, { useState, useCallback, useEffect } from 'react';
import { db } from '../../../../../utils/firebaseConfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../../../hooks/useAuth.js';
import { useNotification } from '../../../../../contexts/NotificationContext.jsx';
import Modal from '../../../../../components/Common/Modal.jsx';

import BasicCouponInfoStep from './Steps/BasicCouponInfoStep.jsx';
import ApplicabilityStep from './Steps/ApplicabilityStep.jsx';
import ReviewAndPublishStep from './Steps/ReviewAndPublishStep.jsx';

import styles from './CouponCreatorWizard.module.css'; // Dedicated CSS module

import { FaSpinner, FaCheckCircle } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

const LOCAL_STORAGE_KEY_COUPON = 'naksyetu_coupon_wizard_data';

const CouponCreatorWizard = ({ onCouponCreated, onBack }) => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_COUPON);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return { ...parsedData };
      }
    } catch (error) {
      console.error("Failed to load coupon wizard data from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY_COUPON);
    }
    return {
      code: '',
      discountType: 'percentage',
      discountValue: '',
      usageLimit: '',
      perUserLimit: '',
      expiryDate: '',
      applicableEventIds: [],
      attachedInfluencerId: '',
      status: 'active',
    };
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalSteps = 3; // Basic Info, Applicability, Review & Publish

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_COUPON, JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save coupon wizard data to localStorage:", error);
    }
  }, [formData]);

  const handleNextStep = useCallback((newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setCurrentStep(prev => prev + 1);
    setFormErrors({});
  }, []);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
    setFormErrors({});
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    showNotification('Creating coupon...', 'info');

    try {
      if (!isAuthenticated || !currentUser) {
        throw new Error('User not authenticated.');
      }

      const couponDataToSave = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
        expiryDate: Timestamp.fromDate(new Date(formData.expiryDate)), // Convert to Timestamp
        organizerId: currentUser.uid,
        createdAt: Timestamp.now(),
        usedCount: 0, // Initialize usage count
      };

      const couponsCollectionRef = collection(db, `artifacts/${appId}/public/coupons`);
      await addDoc(couponsCollectionRef, couponDataToSave);

      showNotification('Coupon created successfully!', 'success');
      setShowSuccessModal(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY_COUPON);
      setFormData({ // Reset form
        code: '', discountType: 'percentage', discountValue: '', usageLimit: '', perUserLimit: '',
        expiryDate: '', applicableEventIds: [], attachedInfluencerId: '', status: 'active',
      });
      setFormErrors({});
      setCurrentStep(1);
      onCouponCreated(); // Notify parent component

    } catch (err) {
      console.error('Error creating coupon:', err);
      showNotification('Error: ' + (err.message || 'Failed to create coupon. Please try again.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentUser, isAuthenticated, showNotification, onCouponCreated]);


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicCouponInfoStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 isSubmitting={isSubmitting}
               />;
      case 2:
        return <ApplicabilityStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 onPrev={handlePrevStep}
                 isSubmitting={isSubmitting}
               />;
      case 3:
        return <ReviewAndPublishStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleSubmit}
                 onPrev={handlePrevStep}
                 isSubmitting={isSubmitting}
               />;
      default:
        return <BasicCouponInfoStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 isSubmitting={isSubmitting}
               />;
    }
  };

  const progressSteps = [
    { label: 'Basic Info', step: 1 },
    { label: 'Applicability', step: 2 },
    { label: 'Review & Publish', step: 3 },
  ];

  return (
    <div className={styles.wizardContainer}>
      <h2 className={styles.wizardTitle}>Create New Coupon</h2>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressLine}>
          <div className={styles.progressLineFill} style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100 || 0}%` }}></div>
        </div>
        {progressSteps.map((pStep) => (
          <div key={pStep.step} className={styles.progressStep}>
            <div className={`${styles.progressCircle} ${currentStep >= pStep.step ? styles.active : ''}`}>
              {pStep.step}
            </div>
            <span className={`${styles.progressLabel} ${currentStep >= pStep.step ? styles.active : ''}`}>
              {pStep.label}
            </span>
          </div>
        ))}
      </div>

      {/* Render Current Step */}
      <div className={styles.wizardContent}>
        {renderStep()}
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); onBack(); }} title="Coupon Created Successfully!">
        <div style={{textAlign: 'center', padding: '20px'}}>
          <FaCheckCircle style={{fontSize: '3rem', color: 'var(--sys-success)', marginBottom: '15px'}} />
          <h3 style={{color: 'var(--naks-text-primary)', marginBottom: '10px'}}>Your coupon "{formData.code}" has been created!</h3>
          <p style={{color: 'var(--naks-text-secondary)', marginBottom: '20px'}}>It is now ready for use.</p>
          <button onClick={() => { setShowSuccessModal(false); onBack(); }} className="btn btn-primary">
            Go to Promotions List
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CouponCreatorWizard;