import React, { useCallback, useRef } from 'react';
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowRight, FaSpinner, FaCloudUploadAlt, FaTimes, FaPlus } from 'react-icons/fa';

// NEW: Import TicketSetup and RsvpSetup here
import TicketSetup from '../Components/TicketSetup.jsx';
import RsvpSetup from '../Components/RsvpSetup.jsx';

import styles from '../NaksYetuEventLaunchpad.module.css'; // Use wizard's CSS module

const EVENT_CATEGORIES = [
  "", "Music", "Art & Culture", "Nightlife", "Sports", "Food & Drink",
  "Business & Networking", "Education", "Community & Charity",
  "Fashion & Beauty", "Kids & Family", "Technology & Gaming", "Health & Wellness"
];

const NAKURU_LOCATIONS = [
  "", "Nakuru City", "Naivasha", "Gilgil", "Molo", "Njoro", "Rongai", "Subukia", "Bahati",
  "Kuresoi North", "Kuresoi South", "Nakuru East", "Nakuru West"
];

const BasicInfoStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, isSubmitting, onSaveTicketsConfig, onSaveRsvpConfig }) => { // NEW: Receive onSaveTicketsConfig, onSaveRsvpConfig
  const bannerFileInputRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === 'file') {
      if (name === 'bannerFile') {
        const file = files[0];
        setFormData(prev => ({ ...prev, bannerFile: file }));
        if (file) {
          setFormData(prev => ({ ...prev, bannerImageUrl: URL.createObjectURL(file) }));
          setFormErrors(prev => ({ ...prev, bannerFile: undefined }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      // Reset type-specific configs if event type changes
      if (name === 'eventType') {
        if (value === 'free') {
          setFormData(prev => ({ ...prev, ticketTypes: [], rsvpConfig: {}, onlineEventUrl: '', onlineEventType: '' }));
        } else if (value === 'ticketed') {
          setFormData(prev => ({ ...prev, rsvpConfig: {}, onlineEventUrl: '', onlineEventType: '', donationOption: false }));
        } else if (value === 'rsvp') {
          setFormData(prev => ({ ...prev, ticketTypes: [], onlineEventUrl: '', onlineEventType: '', donationOption: false }));
        } else if (value === 'online') {
          setFormData(prev => ({ ...prev, ticketTypes: [], rsvpConfig: {}, donationOption: false }));
        }
      }
    }
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, [setFormData, setFormErrors]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (!formData.eventName.trim()) errors.eventName = 'Event Title is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.bannerFile && !formData.bannerImageUrl) errors.bannerFile = 'Event Banner Image is required.';
    if (!formData.category) errors.category = 'Category is required.';
    if (!formData.mainLocation) errors.mainLocation = 'Main Location is required.';
    if (!formData.specificAddress.trim()) errors.specificAddress = 'Specific Address/Venue is required.';
    if (!formData.startDate) errors.startDate = 'Start Date is required.';
    if (!formData.startTime) errors.startTime = 'Start Time is required.';
    if (!formData.contactEmail.trim()) errors.contactEmail = 'Contact Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.contactEmail = 'Invalid email format.';

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    if (isNaN(startDateTime.getTime())) errors.startDate = 'Invalid Start Date or Time.';
    else if (startDateTime < new Date()) errors.startDate = 'Start Date & Time cannot be in the past.';

    if (formData.endDate && formData.endTime) {
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      if (isNaN(endDateTime.getTime())) errors.endDate = 'Invalid End Date or Time.';
      else if (startDateTime && endDateTime <= startDateTime) errors.endDate = 'End Date & Time must be after Start Date & Time.';
    } else if (formData.endDate && !formData.endTime) {
        errors.endTime = 'End Time is required if End Date is provided.';
    } else if (!formData.endDate && formData.endTime) {
        errors.endDate = 'End Date is required if End Time is provided.';
    }

    // Validation for event type specific fields
    if (formData.eventType === 'ticketed') {
      if (!formData.ticketTypes || formData.ticketTypes.length === 0) {
        errors.ticketTypes = 'At least one ticket type must be configured.';
      } else {
        formData.ticketTypes.forEach((ticket, index) => {
          if (!ticket.name || !ticket.price || parseFloat(ticket.price) <= 0) {
            errors.ticketTypes = `Ticket type ${index + 1} must have a name and a positive price.`;
          }
        });
      }
    }
    if (formData.eventType === 'rsvp') {
      if (formData.rsvpConfig.capacityLimit && (isNaN(parseInt(formData.rsvpConfig.capacityLimit)) || parseInt(formData.rsvpConfig.capacityLimit) <= 0)) {
        errors.rsvpConfig = 'RSVP capacity must be a positive integer.';
      }
      if (!Array.isArray(formData.rsvpConfig.requiredAttendeeInfo)) {
          formData.rsvpConfig.requiredAttendeeInfo = [];
      }
    }
    if (formData.eventType === 'online' && !formData.onlineEventUrl.trim()) {
        errors.onlineEventUrl = 'Online event URL is required.';
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleNext = () => {
    if (validateStep()) {
      onNext(formData);
    } else {
      alert('Please correct the errors before proceeding.');
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Basic Event Information</h3>
      <div className="form-group">
        <label htmlFor="eventName" className={styles.formLabel}>Event Title <span className="required-star">*</span></label>
        <input type="text" id="eventName" name="eventName" className={styles.inputField} placeholder="e.g., Nairobi Music Festival" required value={formData.eventName} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.eventName && <p className="error-message-box">{formErrors.eventName}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className={styles.formLabel}>Description <span className="required-star">*</span></label>
        <textarea id="description" name="description" className={styles.inputField} rows="6" placeholder="Provide a detailed description of your event..." required value={formData.description} onChange={handleInputChange} disabled={isSubmitting}></textarea>
        {formErrors.description && <p className="error-message-box">{formErrors.description}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="bannerFile" className={styles.formLabel}>Event Banner Image <span className="required-star">*</span></label>
        <input type="file" id="bannerFile" name="bannerFile" className={`${styles.inputField} ${styles.fileUploadArea}`} accept="image/*" onChange={handleInputChange} disabled={isSubmitting} ref={bannerFileInputRef} />
        <p className={styles.fileUploadText}>Recommended: JPG, PNG, WebP (Max 5MB)</p>
        {formErrors.bannerFile && <p className="error-message-box">{formErrors.bannerFile}</p>}
        {formData.bannerImageUrl && (
          <div className={styles.imagePreviewContainer}>
            <p className={styles.formLabel}>Image Preview:</p>
            <img src={formData.bannerImageUrl} alt="Banner Preview" className={styles.imagePreviewContainerImg} />
            {isSubmitting && <p className={styles.uploadStatus}><FaSpinner className="spinner" /> Uploading...</p>}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="category" className={styles.formLabel}>Category <span className="required-star">*</span></label>
        <select id="category" name="category" className={styles.inputField} required value={formData.category} onChange={handleInputChange} disabled={isSubmitting}>
          {EVENT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat || "Select Category"}</option>
          ))}
        </select>
        {formErrors.category && <p className="error-message-box">{formErrors.category}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="mainLocation" className={styles.formLabel}>Main Location <span className="required-star">*</span></label>
        <select id="mainLocation" name="mainLocation" className={styles.inputField} required value={formData.mainLocation} onChange={handleInputChange} disabled={isSubmitting}>
          {NAKURU_LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc || "Select Main Location"}</option>
          ))}
        </select>
        {formErrors.mainLocation && <p className="error-message-box">{formErrors.mainLocation}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="specificAddress" className={styles.formLabel}>Specific Address/Venue <span className="required-star">*</span></label>
        <input type="text" id="specificAddress" name="specificAddress" className={styles.inputField} placeholder="e.g., KICC Amphitheatre" required value={formData.specificAddress} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.specificAddress && <p className="error-message-box">{formErrors.specificAddress}</p>}
      </div>

      <div className={`${styles.formGroup} ${styles.grid2}`}>
        <div>
          <label htmlFor="startDate" className={styles.formLabel}>Start Date <span className="required-star">*</span></label>
          <input type="date" id="startDate" name="startDate" className={styles.inputField} required value={formData.startDate} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.startDate && <p className="error-message-box">{formErrors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="startTime" className={styles.formLabel}>Start Time <span className="required-star">*</span></label>
          <input type="time" id="startTime" name="startTime" className={styles.inputField} required value={formData.startTime} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.startTime && <p className="error-message-box">{formErrors.startTime}</p>}
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.grid2}`}>
        <div>
          <label htmlFor="endDate" className={styles.formLabel}>End Date <span className="optional-label">(Optional)</span></label>
          <input type="date" id="endDate" name="endDate" className={styles.inputField} value={formData.endDate} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.endDate && <p className="error-message-box">{formErrors.endDate}</p>}
        </div>
        <div>
          <label htmlFor="endTime" className={styles.formLabel}>End Time <span className="optional-label">(Optional)</span></label>
          <input type="time" id="endTime" name="endTime" className={styles.inputField} value={formData.endTime} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.endTime && <p className="error-message-box">{formErrors.endTime}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contactEmail" className={styles.formLabel}>Contact Email <span className="required-star">*</span></label>
        <input type="email" id="contactEmail" name="contactEmail" className={styles.inputField} placeholder="contact@yourevent.com" required value={formData.contactEmail} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.contactEmail && <p className="error-message-box">{formErrors.contactEmail}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="contactPhone" className={styles.formLabel}>Contact Phone <span className="optional-label">(Optional)</span></label>
        <input type="tel" id="contactPhone" name="contactPhone" className={styles.inputField} placeholder="+254 7XX XXX XXX" value={formData.contactPhone} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.contactPhone && <p className="error-message-box">{formErrors.contactPhone}</p>}
      </div>

      {/* NEW: Event Type & Details Section (Moved from EventTypeDetailsStep) */}
      <div className={styles.formSection}> {/* This is a nested formSection */}
        <h3 className={styles.sectionHeading}>Event Type & Details</h3>

        <div className="form-group">
          <label className={styles.formLabel}>Event Type <span className="required-star">*</span></label>
          <div className={styles.radioGroup}>
            <label><input type="radio" name="eventType" value="ticketed" checked={formData.eventType === 'ticketed'} onChange={handleInputChange} disabled={isSubmitting} /> Ticketed</label>
            <label><input type="radio" name="eventType" value="free" checked={formData.eventType === 'free'} onChange={handleInputChange} disabled={isSubmitting} /> Free</label>
            <label><input type="radio" name="eventType" value="rsvp" checked={formData.eventType === 'rsvp'} onChange={handleInputChange} disabled={isSubmitting} /> RSVP Required</label>
            <label><input type="radio" name="eventType" value="online" checked={formData.eventType === 'online'} onChange={handleInputChange} disabled={isSubmitting} /> Online</label>
          </div>
          {formErrors.eventType && <p className="error-message-box">{formErrors.eventType}</p>}
        </div>

        {/* Conditional Sections based on Event Type */}
        {formData.eventType === 'ticketed' && (
          <TicketSetup
            ticketTypes={formData.ticketTypes}
            onSaveTickets={onSaveTicketsConfig} /* FIX: Pass onSaveTicketsConfig */
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        {formData.eventType === 'rsvp' && (
          <RsvpSetup
            rsvpConfig={formData.rsvpConfig}
            setRsvpConfig={(config) => setFormData(prev => ({ ...prev, rsvpConfig: config }))}
            onSaveRsvpConfig={onSaveRsvpConfig} /* FIX: Pass onSaveRsvpConfig */
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        {formData.eventType === 'online' && (
          <div className="form-group">
              <label htmlFor="onlineEventUrl" className={styles.formLabel}>Online Event URL <span className="required-star">*</span></label>
              <input type="url" id="onlineEventUrl" name="onlineEventUrl" className={styles.inputField} placeholder="e.g., https://zoom.us/webinar/123" required value={formData.onlineEventUrl} onChange={handleInputChange} disabled={isSubmitting} />
              {formErrors.onlineEventUrl && <p className="error-message-box">{formErrors.onlineEventUrl}</p>}
              <label htmlFor="onlineEventType" className={styles.formLabel} style={{marginTop: '15px'}}>Online Event Type <span className="optional-label">(e.g., Webinar, Live Stream)</span></label>
              <input type="text" id="onlineEventType" name="onlineEventType" className={styles.inputField} placeholder="e.g., Webinar, Virtual Conference" value={formData.onlineEventType} onChange={handleInputChange} disabled={isSubmitting} />
          </div>
        )}

        {formData.eventType === 'free' && (
          <div className="form-group">
              <label className={styles.formLabel}>
                  <input type="checkbox" id="donationOption" name="donationOption" className={styles.formCheckbox} checked={formData.donationOption} onChange={handleInputChange} disabled={isSubmitting} /> Offer Donation Option
              </label>
          </div>
        )}
      </div> {/* End of Event Type & Details Section */}


      <div className={`${styles.actionButtons} ${styles.justifyEnd}`}>
        <Button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
          Next Step <FaArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;