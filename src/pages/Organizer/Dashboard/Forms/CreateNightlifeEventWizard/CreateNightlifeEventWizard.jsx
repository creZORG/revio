import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../../hooks/useAuth.js';
import { useNotification } from '../../../../../contexts/NotificationContext.jsx';
import { db } from '../../../../../utils/firebaseConfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { uploadFileToFirebaseStorage } from '../../../../../services/storageService.js';

import NightlifeBasicInfoStep from './Steps/NightlifeBasicInfoStep.jsx';
import NightlifeSpecificsStep from './Steps/NightlifeSpecificsStep.jsx';
import NightlifePoliciesAgreementStep from './Steps/NightlifePoliciesAgreementStep.jsx'; // NEW: Policies Agreement Step

import styles from './CreateNightlifeEventWizard.module.css'; // Dedicated CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcode appId

const LOCAL_STORAGE_KEY_NIGHTLIFE = 'naksyetu_nightlife_wizard_data';

const CreateNightlifeEventWizard = ({ onBack }) => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    // Load from local storage on initial render
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_NIGHTLIFE);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ensure bannerFile is null, as File objects cannot be stored in localStorage
        return { ...parsedData, bannerFile: null };
      }
    } catch (error) {
      console.error("Failed to load nightlife wizard data from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY_NIGHTLIFE); // Clear corrupted data
    }
    // Default initial state if no saved data or error
    return {
      eventName: '',
      description: '',
      bannerFile: null,
      bannerImageUrl: '',
      mainLocation: '',
      specificAddress: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      contactEmail: '',
      contactPhone: '',
      category: 'Nightlife',
      eventType: 'ticketed',
      entranceFee: '',
      disclaimer: '',
      selectedAgeCategories: ['18plus'],
      isNightlife: true,
      isFreeEvent: false,
      isOnline: false,
      onlineEventUrl: '',
      onlineEventType: '',
      adminPriority: 5,
      refundPolicyType: 'naksyetu', // Default for policies
      customRefundPolicy: '',
      agreedToTerms: false,
    };
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const totalSteps = 3; // FIX: Now 3 steps (Basic, Specifics, Policies)

  // Save to local storage whenever formData or currentStep changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NIGHTLIFE, JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save nightlife wizard data to localStorage:", error);
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

  const handleSubmit = useCallback(async (finalData) => {
    setIsSubmitting(true);
    showNotification('Creating Nightlife Event...', 'info');

    let finalBannerUrl = finalData.bannerImageUrl;

    try {
      if (finalData.bannerFile) {
        setIsUploadingImage(true);
        finalBannerUrl = await uploadFileToFirebaseStorage(finalData.bannerFile, currentUser.uid, 'event_banners');
        showNotification('Banner image uploaded successfully!', 'success');
        setIsUploadingImage(false);
      } else if (!finalBannerUrl) {
        throw new Error('No banner image provided or uploaded.');
      }

      // FIX: Create a new object to send to Firestore, explicitly excluding 'bannerFile'
      const { bannerFile, ...dataWithoutBannerFile } = finalData;

      const eventDataToSave = {
        ...dataWithoutBannerFile,
        bannerImageUrl: finalBannerUrl,
        startDate: finalData.startDate ? Timestamp.fromDate(new Date(`${finalData.startDate}T${finalData.startTime}`)) : null,
        endDate: (finalData.endDate && finalData.endTime) ? Timestamp.fromDate(new Date(`${finalData.endDate}T${finalData.endTime}`)) : null,
        organizerId: currentUser.uid,
        status: 'pending',
        createdAt: Timestamp.now(),
        pageViews: 0,
        isNightlife: true,
        isFreeEvent: finalData.entranceFee === 0 || finalData.entranceFee === '0' || finalData.entranceFee === '',
        eventType: finalData.entranceFee > 0 ? 'ticketed' : 'free',
        // Clean up fields not applicable to nightlife
        ticketTypes: [],
        rsvpConfig: {},
        onlineEventUrl: null,
        onlineEventType: null,
        donationOption: false,
      };

      const eventsCollectionRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
      await addDoc(eventsCollectionRef, eventDataToSave);

      showNotification('Nightlife event created successfully! Pending admin review.', 'success');
      // Clear local storage after successful submission
      localStorage.removeItem(LOCAL_STORAGE_KEY_NIGHTLIFE);
      setFormData({ // Reset form for next creation
        eventName: '', description: '', bannerFile: null, bannerImageUrl: '',
        mainLocation: '', specificAddress: '', startDate: '', startTime: '', endDate: '', endTime: '',
        contactEmail: '', contactPhone: '', category: 'Nightlife', eventType: 'ticketed',
        entranceFee: '', disclaimer: '', selectedAgeCategories: ['18plus'],
        isNightlife: true, isFreeEvent: false, isOnline: false, onlineEventUrl: '', onlineEventType: '', adminPriority: 5,
        refundPolicyType: 'naksyetu', customRefundPolicy: '', agreedToTerms: false,
      });
      setFormErrors({});
      setCurrentStep(1);
      onBack();

    } catch (err) {
      console.error('Error creating nightlife event:', err);
      showNotification('Error: ' + (err.message || 'Failed to create nightlife event. Please try again.'), 'error');
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  }, [formData, currentUser, showNotification, onBack, isAuthenticated, userRole]);


  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== 'organizer')) {
      showNotification('You must be logged in as an organizer to create events.', 'error');
      // Optionally redirect
    }
  }, [authLoading, isAuthenticated, userRole, showNotification]);


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <NightlifeBasicInfoStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 isSubmitting={isSubmitting || isUploadingImage}
               />;
      case 2:
        return <NightlifeSpecificsStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep} // Next step is Policies
                 onPrev={handlePrevStep}
                 isSubmitting={isSubmitting || isUploadingImage}
               />;
      case 3: // NEW: Policies Agreement Step
        return <NightlifePoliciesAgreementStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleSubmit} // Final step submits
                 onPrev={handlePrevStep}
                 isSubmitting={isSubmitting || isUploadingImage}
               />;
      default:
        return <NightlifeBasicInfoStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 isSubmitting={isSubmitting || isUploadingImage}
               />;
    }
  };

  const progressSteps = [
    { label: 'Basic Info', step: 1 },
    { label: 'Nightlife Details', step: 2 },
    { label: 'Policies', step: 3 }, // NEW: Policies step
  ];

  return (
    <div className={`${styles.wizardContainer} ${styles.nightlifeTheme}`}>
      <h2 className={styles.wizardTitle}>Create Nightlife Event</h2>

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
    </div>
  );
};

export default CreateNightlifeEventWizard;