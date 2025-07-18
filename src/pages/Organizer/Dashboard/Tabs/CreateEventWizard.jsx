// src/pages/Organizer/Dashboard/Tabs/CreateEventWizard.jsx
import React, { useState, useEffect } from 'react';
import styles from './CreateEventWizard.module.css'; // Dedicated styles for the wizard container
import BasicInfoStep from '../Forms/CreateEventWizard/Steps/BasicInfoStep.jsx'; // Corrected import with extension
import EventTypeDetailsStep from '../Forms/CreateEventWizard/Steps/EventTypeDetailsStep.jsx'; // Corrected import with extension
import GalleryAndSponsorsStep from '../Forms/CreateEventWizard/Steps/GalleryAndSponsorsStep.jsx'; // Corrected import with extension
import PoliciesAgreementStep from '../Forms/CreateEventWizard/Steps/PoliciesAgreementStep.jsx'; // Corrected import with extension
import ReviewAndPublishStep from '../Forms/CreateEventWizard/Steps/ReviewAndPublishStep.jsx'; // Corrected import with extension
import { useNotification } from '../../../../contexts/NotificationContext.jsx'; // Corrected import with extension
import { createEvent } from '../../../../services/eventApiService.js'; // Corrected import with extension
import { useAuth } from '../../../../hooks/useAuth.js'; // Corrected import with extension

const CreateEventWizard = () => {
  const { showNotification } = useNotification();
  const { currentUser } = useAuth(); // Get current user for organizerId
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: State for submission loading
  const [submissionError, setSubmissionError] = useState(null); // NEW: State for submission error

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    eventName: '',
    description: '',
    bannerFile: null, 
    bannerImageUrl: '',
    category: '',
    eventTags: '',
    targetAge: '',
    mainLocation: '',
    specificAddress: '',
    startDate: '',
    startTime: '',
    endDate: '', 
    endTime: '', 

    // Step 2: Event Type Details
    isTicketed: false,
    isOnlineEvent: false,
    onlineEventUrl: '',
    onlineEventType: '',
    isRsvp: false,
    rsvpCapacity: '',
    rsvpEnableWaitlist: false,
    rsvpQuestions: '',
    isFreeEvent: false,
    donationOption: false,

    // Step 3: Ticket Details (Array of ticket objects)
    ticketTypes: [],

    // Step 4: Gallery & Sponsors
    galleryFiles: [], 
    galleryImageUrls: [], 
    sponsors: [], 

    // Step 5: Policies & Agreement
    refundPolicyType: 'Naks Yetu Standard',
    customRefundPolicyText: '', 
    disclaimer: '',
    naksyetuTermsAccepted: false,
  });

  const updateFormData = (newData) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  };

  // NEW: Validation logic for each step
  const validateStep = (step) => {
    let isValid = true;
    let errors = [];

    switch (step) {
      case 1: // Basic Information Step
        if (!formData.eventName) errors.push("Event Title is required.");
        if (!formData.description) errors.push("Event Description is required.");
        if (!formData.bannerImageUrl) errors.push("Event Banner Image is required.");
        if (!formData.category) errors.push("Event Category is required.");
        if (!formData.targetAge) errors.push("Target Age Category is required.");
        if (!formData.startDate || !formData.startTime) errors.push("Event Start Date and Time are required.");
        // Conditional location validation
        if (!formData.isOnlineEvent && (!formData.mainLocation || !formData.specificAddress)) {
          errors.push("Main Location and Specific Address are required for physical/hybrid events.");
        }
        if (formData.isOnlineEvent && !formData.onlineEventUrl) {
          errors.push("Online Event URL is required for online/hybrid events.");
        }
        break;
      case 2: // Event Type Details Step
        // At least one access type (ticketed, online, RSVP, free) should be selected, or at least one is explicitly true
        if (!formData.isTicketed && !formData.isOnlineEvent && !formData.isRsvp && !formData.isFreeEvent) {
          errors.push("At least one event access type (Ticketed, Online, RSVP, or Free) must be selected.");
        }
        if (formData.isTicketed && formData.ticketTypes.length === 0) {
          errors.push("At least one Ticket Type is required for a ticketed event.");
        }
        if (formData.isTicketed) {
          formData.ticketTypes.forEach((ticket, idx) => {
            if (!ticket.name || !ticket.price || !ticket.quantity || !ticket.salesStartDate || !ticket.salesStartTime || !ticket.salesEndDate || !ticket.salesEndTime) {
              errors.push(`All fields for Ticket Type ${idx + 1} are required.`);
            }
            if (parseFloat(ticket.price) <= 0) errors.push(`Price for Ticket Type ${idx + 1} must be greater than zero.`);
            if (parseInt(ticket.quantity) <= 0) errors.push(`Quantity for Ticket Type ${idx + 1} must be greater than zero.`);
          });
        }
        if (formData.isOnlineEvent && !formData.onlineEventUrl) {
          errors.push("Online Event URL is required for online events.");
        }
        if (formData.isRsvp && formData.rsvpCapacity && parseInt(formData.rsvpCapacity) <= 0) {
          errors.push("RSVP Capacity must be a positive number if set.");
        }
        break;
      case 3: // Gallery & Sponsors Step (optional content)
        // No hard requirements for this step itself. Validation handled by ImageUpload/TextInput.
        // If sponsor entries exist, their required fields should be filled
        formData.sponsors.forEach((sponsor, idx) => {
          if (sponsor.name.length > 0 || (sponsor.logoUrl && sponsor.logoUrl.length > 0) || (sponsor.websiteUrl && sponsor.websiteUrl.length > 0)) {
            if (!sponsor.name) {
              errors.push(`Sponsor Name for entry ${idx + 1} is required if sponsor details are provided.`);
            }
          }
        });
        break;
      case 4: // Policies Agreement Step
        if (!formData.naksyetuTermsAccepted) {
          errors.push("You must agree to the Naks Yetu Terms of Service.");
        }
        if (formData.refundPolicyType === 'Custom' && !formData.customRefundPolicyText) {
          errors.push("Custom Refund Policy Text is required if 'Custom' policy type is selected.");
        }
        break;
      case 5: // Review & Publish Step (Final Check)
        // This step primarily relies on prior step validations
        // Add final check for terms acceptance here too, if not already caught
        if (!formData.naksyetuTermsAccepted) {
          errors.push("You must agree to the Naks Yetu Terms of Service to publish.");
        }
        break;
      default:
        break;
    }

    if (errors.length > 0) {
      errors.forEach(err => showNotification(err, 'error'));
      isValid = false;
    }
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmissionError(null); // Clear previous errors
    if (!validateStep(5)) { // Validate all steps before final submission
        setSubmissionError("Please fix the errors in your form before publishing.");
        showNotification("Please fix the errors in your form before publishing.", 'error');
        return;
    }

    if (!currentUser?.uid) {
        setSubmissionError("Organizer not authenticated. Please log in again.");
        showNotification("Organizer not authenticated. Please log in again.", 'error');
        return;
    }

    setIsSubmitting(true);
    try {
        // Prepare data for submission to Firestore
        const eventDataToSave = {
            ...formData,
            organizerId: currentUser.uid, // Set organizer ID
            contactEmail: currentUser.email, // Use current user's email
            // Remove local file objects before saving to Firestore
            bannerFile: null, 
            galleryFiles: [],
            sponsors: formData.sponsors.map(s => ({
                ...s,
                logoFile: null // Remove logoFile before saving
            }))
        };

        const result = await createEvent(eventDataToSave);
        showNotification('Event published successfully!', 'success');
        console.log('Published event:', result);

        // Optional: Reset form or redirect after successful submission
        setFormData({ /* ... initial empty state ... */ }); // Reset form
        setCurrentStep(1); // Go back to first step
    } catch (error) {
        console.error("Error publishing event:", error);
        setSubmissionError(`Failed to publish event: ${error.message}`);
        showNotification(`Failed to publish event: ${error.message}`, 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} />;
      case 2:
        return <EventTypeDetailsStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <GalleryAndSponsorsStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <PoliciesAgreementStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 5:
        return <ReviewAndPublishStep formData={formData} updateFormData={updateFormData} handleSubmit={handleSubmit} prevStep={prevStep} isSubmitting={isSubmitting} submissionError={submissionError} />; {/* NEW: Pass submission states */}
      default:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} />;
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <h2 className={styles.stepTitle}>Create New Event</h2>
      <div className={styles.progressIndicator}>
        <div className={styles.progressBar} style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div> {/* Adjusted for 0-indexed progress */}
      </div>
      <p className={styles.stepCount}>Step {currentStep} of 5</p> {/* NEW: Styled step count */}
      
      <div className={styles.stepContent}>
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateEventWizard;