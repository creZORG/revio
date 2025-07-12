import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../../hooks/useAuth.js';
import { useNotification } from '../../../../../contexts/NotificationContext.jsx';
import { db } from '../../../../../utils/firebaseConfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { uploadFileToFirebaseStorage } from '../../../../../services/storageService.js';

import BasicInfoStep from './Steps/BasicInfoStep.jsx';
import EventTypeDetailsStep from './Steps/EventTypeDetailsStep.jsx';
import PoliciesAgreementStep from './Steps/PoliciesAgreementStep.jsx';
import GalleryAndSponsorsStep from './Steps/GalleryAndSponsorsStep.jsx';

import Modal from '../../../../../components/Common/Modal.jsx';

import styles from './NaksYetuEventLaunchpad.module.css';

import {
  FaArrowRight, FaSpinner, FaCheckCircle, FaArrowLeft, FaTimes, FaPlus, FaTag,
  FaCloudUploadAlt,
  FaTicketAlt, FaGift, FaUsers, FaLaptopCode, FaInfoCircle, FaClock, FaDollarSign,
  FaMicrophoneAlt, FaCompactDisc, FaTree, FaHome, FaGuitar, FaMask, FaBeer, FaCocktail, FaUserAlt
} from 'react-icons/fa';


const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const LOCAL_STORAGE_KEY_NORMAL = 'naksyetu_normal_wizard_data';

// FIX: Reintroduce and apply cleanObject helper
const cleanObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject).filter(item => item !== undefined);
  }

  const cleaned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) { // Only include if not undefined
        cleaned[key] = cleanObject(value);
      }
    }
  }
  return cleaned;
};


const CreateNormalEventWizard = ({ onBack, initialEventType = 'ticketed' }) => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_NORMAL);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return {
          ...parsedData,
          bannerFile: null,
          rsvpConfig: parsedData.rsvpConfig ? {
            ...parsedData.rsvpConfig,
            requiredAttendeeInfo: parsedData.rsvpConfig.requiredAttendeeInfo || []
          } : { capacityLimit: '', enableWaitlist: false, rsvpStartDate: null, rsvpStartTime: '', rsvpEndDate: null, rsvpEndTime: '', requiredAttendeeInfo: [], dietarySpecification: '' }, // Ensure null for dates
          ticketTypes: parsedData.ticketTypes || [],
          galleryFiles: null,
          galleryImageUrls: parsedData.galleryImageUrls || [],
          sponsors: (parsedData.sponsors || []).map(s => ({ ...s, logoFile: null })),
          onlineEventUrl: parsedData.onlineEventUrl || '',
          onlineEventType: parsedData.onlineEventType || '',
          donationOption: parsedData.donationOption || false,
          selectedAgeCategories: parsedData.selectedAgeCategories || [],
          disclaimer: parsedData.disclaimer || '',
          customRefundPolicy: parsedData.customRefundPolicy || '',
          agreedToTerms: parsedData.agreedToTerms || false,
          eventType: parsedData.eventType || initialEventType,
          category: parsedData.category || '',
          mainLocation: parsedData.mainLocation || '',
          specificAddress: parsedData.specificAddress || '',
          contactEmail: parsedData.contactEmail || '',
          contactPhone: parsedData.contactPhone || '',
          startDate: parsedData.startDate ? rehydrateTimestamp(parsedData.startDate) : null, // Rehydrate
          startTime: parsedData.startTime || '',
          endDate: parsedData.endDate ? rehydrateTimestamp(parsedData.endDate) : null, // Rehydrate
          endTime: parsedData.endTime || '',
          refundPolicyType: parsedData.refundPolicyType || 'naksyetu',
        };
      }
    } catch (error) {
      console.error("Failed to load normal wizard data from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY_NORMAL);
    }
    return {
      eventName: '',
      description: '',
      bannerFile: null,
      bannerImageUrl: '',
      category: '',
      mainLocation: '',
      specificAddress: '',
      startDate: null,
      startTime: '',
      endDate: null,
      endTime: '',
      contactEmail: '',
      contactPhone: '',
      eventType: initialEventType,
      ticketTypes: [],
      rsvpConfig: { capacityLimit: '', enableWaitlist: false, rsvpStartDate: null, rsvpStartTime: '', rsvpEndDate: null, rsvpEndTime: '', requiredAttendeeInfo: [], dietarySpecification: '' },
      isFreeEvent: false,
      isOnline: false,
      onlineEventUrl: '',
      onlineEventType: '',
      donationOption: false,
      selectedAgeCategories: [],
      adminPriority: 5,
      disclaimer: '',
      refundPolicyType: 'naksyetu',
      customRefundPolicy: '',
      agreedToTerms: false,
      galleryFiles: [],
      galleryImageUrls: [],
      sponsors: [],
    };
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [uploadProgressStatus, setUploadProgressStatus] = useState([]);

  const totalSteps = 4;

  useEffect(() => {
    try {
      const serializableFormData = {
        ...formData,
        bannerFile: null,
        galleryFiles: null,
        sponsors: formData.sponsors.map(s => ({ ...s, logoFile: null }))
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_NORMAL, JSON.stringify(serializableFormData));
    } catch (error) {
      console.error("Failed to save normal wizard data to localStorage:", error);
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

  const onSaveTicketsConfig = useCallback((tickets) => {
    setFormData(prev => ({ ...prev, ticketTypes: tickets }));
    setFormErrors(prev => ({ ...prev, ticketTypes: undefined }));
  }, [setFormData, setFormErrors]);

  const onSaveRsvpConfig = useCallback((config) => {
    setFormData(prev => ({ ...prev, rsvpConfig: config }));
    setFormErrors(prev => ({ ...prev, rsvpConfig: undefined }));
  }, [setFormData, setFormErrors]);


  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setUploadProgressStatus([]);
    setShowSuccessModal(true);
    showNotification('Creating Event...', 'info');

    let finalBannerUrl = formData.bannerImageUrl;
    let finalGalleryImageUrls = [];
    let finalSponsors = [];

    const initialUploads = [];
    if (formData.bannerFile) initialUploads.push({ id: 'banner', name: 'Banner Image', progress: 0, status: 'pending', type: 'banner' });
    (formData.galleryFiles || []).forEach((file, index) => {
      if (file instanceof File) initialUploads.push({ id: `gallery-${index}`, name: `Gallery Image ${index + 1}`, progress: 0, status: 'pending', type: 'gallery', file: file });
    });
    (formData.sponsors || []).forEach((sponsor, index) => {
      if (sponsor.logoFile instanceof File) initialUploads.push({ id: `sponsor-${index}`, name: `Sponsor Logo (${sponsor.name || index + 1})`, progress: 0, status: 'pending', type: 'sponsor', file: sponsor.logoFile, sponsorIndex: index });
    });
    setUploadProgressStatus(initialUploads);


    const updateItemProgress = (idToUpdate, progress, status, error = null) => {
      setUploadProgressStatus(prev => prev.map(item => {
        if (item.id === idToUpdate) {
          return { ...item, progress, status, error };
        }
        return item;
      }));
    };

    let allUploadsSuccessful = true;

    try {
      if (formData.bannerFile instanceof File) {
        updateItemProgress('banner', 0, 'uploading');
        try {
          finalBannerUrl = await uploadFileToFirebaseStorage(formData.bannerFile, currentUser.uid, 'event_banners', (progress) => updateItemProgress('banner', progress, 'uploading'));
          updateItemProgress('banner', 100, 'success');
        } catch (uploadErr) {
          updateItemProgress('banner', 0, 'failed', uploadErr.message);
          allUploadsSuccessful = false;
          console.error(`Banner upload failed:`, uploadErr);
        }
      } else if (formData.bannerImageUrl) {
        finalBannerUrl = formData.bannerImageUrl;
        updateItemProgress('banner', 100, 'success');
      } else {
        throw new Error('No banner image provided or uploaded.');
      }


      if (formData.galleryFiles && formData.galleryFiles.length > 0) {
        const uploadPromises = formData.galleryFiles.map(async (file, index) => {
          const itemId = `gallery-${index}`;
          if (!(file instanceof File)) {
            updateItemProgress(itemId, 0, 'failed', 'Invalid file object');
            allUploadsSuccessful = false;
            return null;
          }
          updateItemProgress(itemId, 0, 'uploading');
          try {
            const url = await uploadFileToFirebaseStorage(file, currentUser.uid, 'event_galleries', (progress) => updateItemProgress(itemId, progress, 'uploading'));
            updateItemProgress(itemId, 100, 'success');
            return url;
          } catch (uploadErr) {
            updateItemProgress(itemId, 0, 'failed', uploadErr.message);
            allUploadsSuccessful = false;
            console.error(`Gallery image ${index + 1} failed:`, uploadErr);
            return null;
          }
        });
        const results = await Promise.all(uploadPromises);
        finalGalleryImageUrls = results.filter(url => url !== null);
      }

      if (formData.sponsors && formData.sponsors.length > 0) {
        const sponsorUploadPromises = formData.sponsors.map(async (sponsor, index) => {
          const itemId = `sponsor-${index}`;
          if (sponsor.logoFile instanceof File) {
            updateItemProgress(itemId, 0, 'uploading');
            try {
              const logoUrl = await uploadFileToFirebaseStorage(sponsor.logoFile, currentUser.uid, 'sponsor_logos', (progress) => updateItemProgress(itemId, progress, 'uploading'));
              updateItemProgress(itemId, 100, 'success');
              return { ...sponsor, logoFile: undefined, logoUrl: logoUrl };
            } catch (uploadErr) {
              updateItemProgress(itemId, 0, 'failed', uploadErr.message);
              allUploadsSuccessful = false;
              console.error(`Sponsor logo ${sponsor.name || index + 1} failed:`, uploadErr);
              return { ...sponsor, logoFile: undefined, logoUrl: '' };
            }
          } else if (sponsor.logoUrl) {
            updateItemProgress(itemId, 100, 'success');
            return sponsor;
          }
          return { ...sponsor, logoFile: undefined, logoUrl: '' };
        });
        const results = await Promise.all(sponsorUploadPromises);
        finalSponsors = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      }


      const { bannerFile, galleryFiles, sponsors, ...dataWithoutFiles } = formData;

      const processedTicketTypes = (formData.ticketTypes || []).map(ticket => ({
        ...ticket,
        bookingStartDate: (ticket.bookingStartDate && ticket.bookingStartTime) ? Timestamp.fromDate(new Date(`${ticket.bookingStartDate}T${ticket.bookingStartTime}`)) : null,
        bookingEndDate: (ticket.bookingEndDate && ticket.bookingEndTime) ? Timestamp.fromDate(new Date(`${ticket.bookingEndDate}T${ticket.bookingEndTime}`)) : null,
        bookingStartTime: undefined,
        bookingEndTime: undefined,
      }));

      const processedRsvpConfig = formData.rsvpConfig ? {
          ...formData.rsvpConfig,
          rsvpStartDate: (formData.rsvpConfig.rsvpStartDate && formData.rsvpConfig.rsvpStartTime) ? Timestamp.fromDate(new Date(`${formData.rsvpConfig.rsvpStartDate}T${formData.rsvpConfig.rsvpStartTime}`)) : null,
          rsvpEndDate: (formData.rsvpConfig.rsvpEndDate && formData.rsvpConfig.rsvpEndTime) ? Timestamp.fromDate(new Date(`${formData.rsvpConfig.rsvpEndDate}T${formData.rsvpConfig.rsvpEndTime}`)) : null,
          rsvpStartTime: undefined,
          rsvpEndTime: undefined,
      } : {};


      // FIX: Apply cleanObject to the final eventDataToSave
      const eventDataToSave = cleanObject({
        ...dataWithoutFiles,
        bannerImageUrl: finalBannerUrl,
        galleryImageUrls: finalGalleryImageUrls,
        sponsors: finalSponsors,
        startDate: formData.startDate ? Timestamp.fromDate(new Date(`${formData.startDate}T${formData.startTime}`)) : null,
        endDate: (formData.endDate && formData.endTime) ? Timestamp.fromDate(new Date(`${formData.endDate}T${formData.endTime}`)) : null,
        organizerId: currentUser.uid,
        status: 'pending',
        createdAt: Timestamp.now(),
        pageViews: 0,
        isNightlife: false,
        isFreeEvent: formData.eventType === 'free',
        eventType: formData.eventType,
        onlineEventUrl: formData.eventType === 'online' ? formData.onlineEventUrl : null,
        onlineEventType: formData.eventType === 'online' ? formData.onlineEventType : null,
        donationOption: formData.eventType === 'free' ? formData.donationOption : false,
        ticketTypes: processedTicketTypes,
        rsvpConfig: processedRsvpConfig,
        refundPolicyType: formData.eventType === 'ticketed' ? formData.refundPolicyType : null,
        customRefundPolicy: (formData.eventType === 'ticketed' && formData.refundPolicyType === 'custom') ? formData.customRefundPolicy : null,
        agreedToTerms: formData.eventType === 'ticketed' ? formData.agreedToTerms : false,
      });


      const eventsCollectionRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
      await addDoc(eventsCollectionRef, eventDataToSave);

      localStorage.removeItem(LOCAL_STORAGE_KEY_NORMAL);
      setFormData({
        eventName: '', description: '', bannerFile: null, bannerImageUrl: '', category: '',
        mainLocation: '', specificAddress: '', startDate: null, startTime: '', endDate: null, endTime: '', // Reset dates to null
        contactEmail: '', contactPhone: '', eventType: initialEventType,
        ticketTypes: [],
        rsvpConfig: { capacityLimit: '', enableWaitlist: false, rsvpStartDate: null, rsvpStartTime: '', rsvpEndDate: null, rsvpEndTime: '', requiredAttendeeInfo: [], dietarySpecification: '' },
        isFreeEvent: false, isOnline: false, onlineEventUrl: '', onlineEventType: '', donationOption: false,
        selectedAgeCategories: [], adminPriority: 5, disclaimer: '',
        refundPolicyType: 'naksyetu', customRefundPolicy: '', agreedToTerms: false,
        galleryFiles: [], galleryImageUrls: [], sponsors: [],
      });
      setFormErrors({});
      setCurrentStep(1);

    } catch (err) {
      console.error('Error creating event:', err);
      setUploadProgressStatus(prev => prev.map(item => ({ ...item, status: 'failed', error: err.message })));
      showNotification('Error: ' + (err.message || 'Failed to create event. Please try again.'), 'error');
      allUploadsSuccessful = false;
    } finally {
      setIsSubmitting(false);
      // setIsUploadingImage(false); // Keep true until all uploads are truly done
      // Final check for modal status when all is done
      if (allUploadsSuccessful) {
        setUploadProgressStatus(prev => prev.map(item => ({ ...item, status: 'success' })));
      }
    }
  }, [formData, currentUser, showNotification, onBack, isAuthenticated, userRole, initialEventType]);


  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== 'organizer')) {
      showNotification('You must be logged in as an organizer to create events.', 'error');
    }
  }, [authLoading, isAuthenticated, userRole, showNotification]);


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 isSubmitting={isSubmitting || isUploadingImage}
                 onSaveTicketsConfig={onSaveTicketsConfig}
                 onSaveRsvpConfig={onSaveRsvpConfig}
               />;
      case 2:
        return <EventTypeDetailsStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 onPrev={handlePrevStep}
                 isSubmitting={isSubmitting || isUploadingImage}
               />;
      case 3:
        return <GalleryAndSponsorsStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 onPrev={handlePrevStep}
                 isSubmitting={isSubmitting || isUploadingImage}
               />;
      case 4:
        if (formData.eventType === 'ticketed') {
            return <PoliciesAgreementStep
                     formData={formData}
                     setFormData={setFormData}
                     formErrors={formErrors}
                     setFormErrors={setFormErrors}
                     onNext={handleSubmit}
                     onPrev={handlePrevStep}
                     isSubmitting={isSubmitting || isUploadingImage}
                   />;
        } else {
            useEffect(() => {
                handleSubmit();
            }, [handleSubmit]);
            return (
                <div className={styles.formSection}>
                    <h3 className={styles.sectionHeading}>Finalizing Event...</h3>
                    <p style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>Skipping policies for non-ticketed event and submitting.</p>
                    <FaSpinner className="spinner" style={{fontSize: '2rem', margin: '20px auto', display: 'block'}} />
                </div>
            );
        }
      default:
        return <BasicInfoStep
                 formData={formData}
                 setFormData={setFormData}
                 formErrors={formErrors}
                 setFormErrors={setFormErrors}
                 onNext={handleNextStep}
                 isSubmitting={isSubmitting || isUploadingImage}
                 onSaveTicketsConfig={onSaveTicketsConfig}
                 onSaveRsvpConfig={onSaveRsvpConfig}
               />;
    }
  };

  const progressSteps = [
    { label: 'Basic Info', step: 1 },
    { label: 'Type & Details', step: 2 },
    { label: 'Gallery & Sponsors', step: 3 },
    { label: 'Policies', step: 4 },
  ];

  return (
    <div className={styles.wizardContainer}>
      <h2 className={styles.wizardTitle}>Naks Yetu Event Launchpad</h2>

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

      {/* Success Modal (now also shows upload progress) */}
      <Modal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); onBack(); }} title="Event Creation Status">
        <div style={{textAlign: 'center', padding: '20px'}}>
          {uploadProgressStatus.every(item => item.status === 'success') ? (
            <FaCheckCircle style={{fontSize: '3rem', color: 'var(--sys-success)', marginBottom: '15px'}} />
          ) : (
            <FaSpinner className="spinner" style={{fontSize: '3rem', color: 'var(--sys-info)', marginBottom: '15px'}} />
          )}
          <h3 style={{color: 'var(--naks-text-primary)', marginBottom: '10px'}}>
            {uploadProgressStatus.every(item => item.status === 'success') ? `Your event "${formData.eventName}" has been submitted!` : 'Uploading and Finalizing...'}
          </h3>
          <p style={{color: 'var(--naks-text-secondary)', marginBottom: '20px'}}>
            {uploadProgressStatus.every(item => item.status === 'success') ? "We'll notify you once it's approved and live." : "Please wait while we process your event assets."}
          </p>
          
          {/* Event Preview in Modal */}
          {formData.bannerImageUrl && (
            <div style={{marginBottom: '20px', border: '1px solid var(--naks-border-light)', borderRadius: '8px', overflow: 'hidden'}}>
              <img src={formData.bannerImageUrl} alt="Event Banner" style={{width: '100%', height: '150px', objectFit: 'cover'}} />
              <div style={{padding: '10px', textAlign: 'left', backgroundColor: 'var(--naks-gray-100)', color: 'var(--naks-text-primary)'}}>
                <h4 style={{margin: '0', fontSize: '1.1rem', fontWeight: '600'}}>{formData.eventName}</h4>
                <p style={{margin: '5px 0 0', fontSize: '0.85rem', color: 'var(--naks-text-secondary)'}}>{formData.specificAddress || formData.mainLocation}</p>
              </div>
            </div>
          )}

          {/* Upload Progress Status List */}
          {uploadProgressStatus.length > 0 && (
            <div style={{marginTop: '20px', borderTop: '1px solid var(--naks-border-light)', paddingTop: '15px'}}>
              <h4 style={{color: 'var(--naks-text-primary)', marginBottom: '10px', textAlign: 'left'}}>Upload Details:</h4>
              <ul style={{listStyle: 'none', padding: '0'}}>
                {uploadProgressStatus.map((item, index) => (
                  <li key={item.id || index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '0.9rem'}}>
                    <span>{item.name}:</span>
                    <span style={{color: item.status === 'success' ? 'var(--sys-success)' : item.status === 'failed' ? 'var(--sys-error)' : 'var(--sys-info)'}}>
                      {item.status === 'uploading' ? `${Math.round(item.progress)}%` : item.status.toUpperCase()}
                      {item.error && ` (${item.error})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => { setShowSuccessModal(false); onBack(); }} className="btn btn-primary" style={{marginTop: '20px'}} disabled={uploadProgressStatus.some(item => item.status === 'uploading' || item.status === 'pending')}>
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateNormalEventWizard;