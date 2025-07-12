import React, { useState } from 'react';
import { FaUsers, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import Button from '../../Common/Button.jsx';
import Modal from '../../Common/Modal.jsx';
// FIX: Corrected import paths for contexts, hooks, utils
import { useNotification } from '../../../contexts/NotificationContext.jsx'
import { useAuth } from '../../../hooks/useAuth.js';
import { db } from '../../../utils/firebaseConfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';


import styles from '../EventDetailPage.module.css';// Use parent's CSS module

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcode appId

const RsvpFormSection = ({ event }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({ name: '', email: '', phone: '', address: '', company: '', jobTitle: '', dietary: '' });
  const [rsvpFormErrors, setRsvpFormErrors] = useState({});
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  const handleRsvpInputChange = (e) => {
    const { name, value } = e.target;
    setRsvpForm(prev => ({ ...prev, [name]: value }));
    setRsvpFormErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRsvp(true);
    setRsvpFormErrors({});

    const errors = {};
    if (!rsvpForm.name.trim()) errors.name = 'Full Name is required.';
    if (!rsvpForm.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(rsvpForm.email)) errors.email = 'Invalid email format.';

    if (event?.rsvpConfig?.requiredAttendeeInfo) {
      if (event.rsvpConfig.requiredAttendeeInfo.includes('phone') && !rsvpForm.phone.trim()) errors.phone = 'Phone number is required.';
      if (event.rsvpConfig.requiredAttendeeInfo.includes('address') && !rsvpForm.address.trim()) errors.address = 'Address is required.';
      if (event.rsvpConfig.requiredAttendeeInfo.includes('company') && !rsvpForm.company.trim()) errors.company = 'Company Name is required.';
      if (event.rsvpConfig.requiredAttendeeInfo.includes('jobTitle') && !rsvpForm.jobTitle.trim()) errors.jobTitle = 'Job Title is required.';
    }

    if (Object.keys(errors).length > 0) {
      setRsvpFormErrors(errors);
      setIsSubmittingRsvp(false);
      showNotification('Please fill in all required RSVP fields.', 'error');
      return;
    }

    try {
      const rsvpCollectionRef = collection(db, `artifacts/${appId}/public/data_for_app/rsvps`);
      await addDoc(rsvpCollectionRef, {
        eventId: event.id,
        eventName: event.eventName,
        userId: currentUser?.uid || 'unauthenticated',
        rsvpedAt: Timestamp.now(),
        status: 'confirmed', // Or 'waitlisted' based on capacity
        ...rsvpForm, // Include form data
      });

      showNotification('RSVP submitted successfully!', 'success');
      setShowRsvpModal(false);
      setRsvpForm({ name: '', email: '', phone: '', address: '', company: '', jobTitle: '', dietary: '' }); // Reset form
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      showNotification('Failed to submit RSVP. Please try again.', 'error');
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  return (
    <aside className={`${styles.eventSidebarActions} glassmorphism`}>
      <h2 className={styles.sidebarHeading}>Register for Event</h2>
      <p className={styles.rsvpInfoText}>
        {event.rsvpConfig?.capacityLimit ? `Limited to ${event.rsvpConfig.capacityLimit} attendees.` : 'No capacity limit specified.'}
        {event.rsvpConfig?.enableWaitlist && ' A waitlist is available.'}
      </p>

      <button onClick={() => setShowRsvpModal(true)} className={`btn btn-primary ${styles.checkoutBtn} glassmorphism-button`}>
        Register for Event <FaUsers />
      </button>

      {/* RSVP Modal */}
      <Modal isOpen={showRsvpModal} onClose={() => setShowRsvpModal(false)} title={`RSVP for ${event.eventName}`}>
        <form onSubmit={handleRsvpSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px'}}>
          <div className="form-group">
            <label htmlFor="rsvpName" className="form-label">Full Name <span style={{color: 'red'}}>*</span></label>
            <input type="text" id="rsvpName" name="name" className="input-field" value={rsvpForm.name} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} required />
            {rsvpFormErrors.name && <p className="error-message-box">{rsvpFormErrors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="rsvpEmail" className="form-label">Email <span style={{color: 'red'}}>*</span></label>
            <input type="email" id="rsvpEmail" name="email" className="input-field" value={rsvpForm.email} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} required />
            {rsvpFormErrors.email && <p className="error-message-box">{rsvpFormErrors.email}</p>}
          </div>

          {event?.rsvpConfig?.requiredAttendeeInfo?.includes('phone') && (
            <div className="form-group">
              <label htmlFor="rsvpPhone" className="form-label">Phone Number <span style={{color: 'red'}}>*</span></label>
              <input type="tel" id="rsvpPhone" name="phone" className="input-field" value={rsvpForm.phone} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} required />
              {rsvpFormErrors.phone && <p className="error-message-box">{rsvpFormErrors.phone}</p>}
            </div>
          )}
          {event?.rsvpConfig?.requiredAttendeeInfo?.includes('address') && (
            <div className="form-group">
              <label htmlFor="rsvpAddress" className="form-label">Address <span style={{color: 'red'}}>*</span></label>
              <input type="text" id="rsvpAddress" name="address" className="input-field" value={rsvpForm.address} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} required />
              {rsvpFormErrors.address && <p className="error-message-box">{rsvpFormErrors.address}</p>}
            </div>
          )}
          {event?.rsvpConfig?.requiredAttendeeInfo?.includes('company') && (
            <div className="form-group">
              <label htmlFor="rsvpCompany" className="form-label">Company Name <span style={{color: 'red'}}>*</span></label>
              <input type="text" id="rsvpCompany" name="company" className="input-field" value={rsvpForm.company} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} required />
              {rsvpFormErrors.company && <p className="error-message-box">{rsvpFormErrors.company}</p>}
            </div>
          )}
          {event?.rsvpConfig?.requiredAttendeeInfo?.includes('jobTitle') && (
            <div className="form-group">
              <label htmlFor="rsvpJobTitle" className="form-label">Job Title <span style={{color: 'red'}}>*</span></label>
              <input type="text" id="rsvpJobTitle" name="jobTitle" className="input-field" value={rsvpForm.jobTitle} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} required />
              {rsvpFormErrors.jobTitle && <p className="error-message-box">{rsvpFormErrors.jobTitle}</p>}
            </div>
          )}
          {event?.rsvpConfig?.requiredAttendeeInfo?.includes('dietary') && (
            <div className="form-group">
              <label htmlFor="rsvpDietary" className="form-label">Dietary Restrictions <span className="optional-label">(Optional)</span></label>
              <input type="text" id="rsvpDietary" name="dietary" className="input-field" value={rsvpForm.dietary} onChange={handleRsvpInputChange} disabled={isSubmittingRsvp} />
            </div>
          )}

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
            <button type="button" onClick={() => setShowRsvpModal(false)} className="btn btn-secondary" disabled={isSubmittingRsvp}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmittingRsvp}>
              {isSubmittingRsvp ? <FaSpinner className="spinner" /> : 'Submit RSVP'}
            </button>
          </div>
        </form>
      </Modal>
    </aside>
  );
};

export default RsvpFormSection;