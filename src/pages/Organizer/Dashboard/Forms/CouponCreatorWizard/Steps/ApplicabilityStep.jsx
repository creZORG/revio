import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowLeft, FaArrowRight, FaInfoCircle, FaCalendarAlt, FaStar } from 'react-icons/fa';
import { db } from '../../../../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../../../../../hooks/useAuth.js';
import { useNotification } from '../../../../../../contexts/NotificationContext.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

import styles from '../CouponCreatorWizard.module.css'; // Wizard specific styles

const ApplicabilityStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, onPrev, isSubmitting }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loadingOrganizerEvents, setLoadingOrganizerEvents] = useState(true);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!currentUser?.uid) {
        setLoadingOrganizerEvents(false);
        return;
      }
      setLoadingOrganizerEvents(true);
      try {
        const q = query(
          collection(db, `artifacts/${appId}/public/data_for_app/events`),
          where('organizerId', '==', currentUser.uid),
          where('status', '==', 'approved'), // Only approved events
          where('eventType', '==', 'ticketed'), // Only ticketed events for coupons
          orderBy('startDate', 'desc')
        );
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().eventName }));
        setOrganizerEvents(events);
      } catch (err) {
        console.error("Error fetching organizer events for coupons:", err);
        showNotification("Failed to load your events for coupon applicability.", 'error');
      } finally {
        setLoadingOrganizerEvents(false);
      }
    };

    if (isAuthenticated && currentUser) {
      fetchOrganizerEvents();
    }
  }, [isAuthenticated, currentUser, showNotification]);


  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, [setFormData, setFormErrors]);

  const handleApplicableEventChange = useCallback((eventId) => {
    setFormData(prev => {
      const currentEventIds = prev.applicableEventIds || [];
      if (currentEventIds.includes(eventId)) {
        return { ...prev, applicableEventIds: currentEventIds.filter(id => id !== eventId) };
      } else {
        return { ...prev, applicableEventIds: [...currentEventIds, eventId] };
      }
    });
    setFormErrors(prev => ({ ...prev, applicableEventIds: undefined }));
  }, [setFormData, setFormErrors]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required.';
    else if (new Date(formData.expiryDate) < new Date()) errors.expiryDate = 'Expiry date cannot be in the past.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleNext = () => {
    if (validateStep()) {
      onNext(formData);
    } else {
      showNotification('Please correct the errors before proceeding.', 'error');
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Coupon Applicability & Expiry</h3>

      <div className="form-group">
        <label htmlFor="expiryDate" className="form-label">Expiry Date <span className="required-star">*</span></label>
        <input type="date" id="expiryDate" name="expiryDate" className="input-field" value={formData.expiryDate} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.expiryDate && <p className="error-message-box">{formErrors.expiryDate}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="applicableEventIds" className="form-label">Applicable Events <span className="optional-label">(Optional)</span> <FaInfoCircle title="Select specific events this coupon can be used for. Leave blank for all events." style={{verticalAlign: 'middle', marginLeft: '5px', color: 'var(--naks-text-secondary)'}}/></label>
        {loadingOrganizerEvents ? (
            <LoadingSkeleton width="100%" height="120px" style={{borderRadius: '8px'}} />
        ) : organizerEvents.length === 0 ? (
            <p className="text-naks-text-secondary">No ticketed events found for applicability.</p>
        ) : (
            <div className={styles.checkboxGroup} style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                {organizerEvents.map(event => (
                    <label key={event.id} className="form-label">
                        <input
                            type="checkbox"
                            name="applicableEventIds"
                            value={event.id}
                            checked={(formData.applicableEventIds || []).includes(event.id)}
                            onChange={() => handleApplicableEventChange(event.id)}
                            disabled={isSubmitting}
                        />
                        {event.name}
                    </label>
                ))}
            </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="attachedInfluencerId" className="form-label">Attached Influencer ID <span className="optional-label">(Optional)</span> <FaInfoCircle title="Link this coupon to a specific influencer for tracking earnings." style={{verticalAlign: 'middle', marginLeft: '5px', color: 'var(--naks-text-secondary)'}}/></label>
        <input type="text" id="attachedInfluencerId" name="attachedInfluencerId" className="input-field" value={formData.attachedInfluencerId} onChange={handleInputChange} disabled={isSubmitting} placeholder="e.g., influencer_john_doe" />
      </div>

      <div className="form-group">
        <label htmlFor="status" className="form-label">Status <span className="required-star">*</span></label>
        <select id="status" name="status" className="input-field" value={formData.status} onChange={handleInputChange} disabled={isSubmitting}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.actionButtons}>
        <Button onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
          <FaArrowLeft /> Previous
        </Button>
        <Button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
          Next Step <FaArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default ApplicabilityStep;