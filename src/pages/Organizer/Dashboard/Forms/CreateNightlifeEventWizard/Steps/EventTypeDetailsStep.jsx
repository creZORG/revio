import React, { useCallback, useState } from 'react';
import TextInput from '../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../components/Common/Button.jsx';
import TicketSetup from '../Components/TicketSetup.jsx'; // NEW
import RsvpSetup from '../Components/RsvpSetup.jsx';     // NEW
import { FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';

import styles from '../CreateNormalEventWizard.module.css'; // Wizard specific styles

const EventTypeDetailsStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, onPrev, isSubmitting }) => {
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
    // Reset type-specific configs if event type changes
    if (name === 'eventType') {
      if (value === 'free') {
        setFormData(prev => ({ ...prev, ticketTypes: [], rsvpConfig: {} }));
      } else if (value === 'ticketed') {
        setFormData(prev => ({ ...prev, rsvpConfig: {} }));
      } else if (value === 'rsvp') {
        setFormData(prev => ({ ...prev, ticketTypes: [] }));
      } else if (value === 'online') {
        setFormData(prev => ({ ...prev, ticketTypes: [], rsvpConfig: {} }));
      }
    }
  }, [setFormData, setFormErrors]);

  const onSaveTicketsConfig = useCallback((tickets) => {
    setFormData(prev => ({ ...prev, ticketTypes: tickets }));
    setFormErrors(prev => ({ ...prev, ticketTypes: undefined }));
  }, [setFormData, setFormErrors]);

  const onSaveRsvpConfig = useCallback((config) => {
    setFormData(prev => ({ ...prev, rsvpConfig: config }));
    setFormErrors(prev => ({ ...prev, rsvpConfig: undefined }));
  }, [setFormData, setFormErrors]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (formData.eventType === 'ticketed' && formData.ticketTypes.length === 0) {
      errors.ticketTypes = 'At least one ticket type must be configured.';
    }
    if (formData.eventType === 'rsvp' && (!formData.rsvpConfig.capacityLimit || parseInt(formData.rsvpConfig.capacityLimit) <= 0)) {
      errors.rsvpConfig = 'RSVP capacity must be configured for RSVP events.';
    }
    if (formData.eventType === 'online' && !formData.onlineEventUrl.trim()) {
        errors.onlineEventUrl = 'Online event URL is required.';
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
      <h3 className={styles.sectionHeading}>Event Type & Details</h3>

      <div className="form-group">
        <label className="form-label">Event Type <span className="required-star">*</span></label>
        <div className="radio-group">
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
          onSaveTickets={onSaveTicketsConfig}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
        />
      )}

      {formData.eventType === 'rsvp' && (
        <RsvpSetup
          rsvpConfig={formData.rsvpConfig}
          setRsvpConfig={(config) => setFormData(prev => ({ ...prev, rsvpConfig: config }))} // Pass setter
          onSaveRsvpConfig={onSaveRsvpConfig}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
        />
      )}

      {formData.eventType === 'online' && (
        <div className="form-group">
            <label htmlFor="onlineEventUrl" className="form-label">Online Event URL <span className="required-star">*</span></label>
            <input type="url" id="onlineEventUrl" name="onlineEventUrl" className="input-field" placeholder="e.g., https://zoom.us/webinar/123" required value={formData.onlineEventUrl} onChange={handleInputChange} disabled={isSubmitting} />
            {formErrors.onlineEventUrl && <p className="error-message-box">{formErrors.onlineEventUrl}</p>}
            <label htmlFor="onlineEventType" className="form-label" style={{marginTop: '15px'}}>Online Event Type <span className="optional-label">(e.g., Webinar, Live Stream)</span></label>
            <input type="text" id="onlineEventType" name="onlineEventType" className="input-field" placeholder="e.g., Webinar, Virtual Conference" value={formData.onlineEventType} onChange={handleInputChange} disabled={isSubmitting} />
        </div>
      )}

      {formData.eventType === 'free' && (
        <div className="form-group">
            <label className="form-label inline"><input type="checkbox" id="donationOption" name="donationOption" checked={formData.donationOption} onChange={handleInputChange} disabled={isSubmitting} /> Offer Donation Option</label>
        </div>
      )}

      <div className={styles.actionButtons}>
        <Button onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
          <FaArrowLeft /> Previous
        </Button>
        <Button onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {isSubmitting ? 'Submitting...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default EventTypeDetailsStep;