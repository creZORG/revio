import React, { useCallback } from 'react';
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaInfoCircle } from 'react-icons/fa';

import styles from '../CreateNormalEventWizard.module.css'; // Wizard specific styles

const RsvpSetup = ({ rsvpConfig, setRsvpConfig, formErrors, isSubmitting }) => {
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setRsvpConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, [setRsvpConfig]);

  const handleRequiredAttendeeInfoChange = useCallback((field) => {
    setRsvpConfig(prevRsvpConfig => {
      // Ensure requiredAttendeeInfo is an array and create a NEW array for update
      const currentInfo = prevRsvpConfig.requiredAttendeeInfo ? [...prevRsvpConfig.requiredAttendeeInfo] : [];
      
      let updatedInfo;
      if (currentInfo.includes(field)) {
        // If already included, remove it (create a new array via filter)
        updatedInfo = currentInfo.filter(item => item !== field);
      } else {
        // If not included, add it (create a new array via spread)
        updatedInfo = [...currentInfo, field];
      }
      
      // FIX: Ensure we return a NEW rsvpConfig object with the updated requiredAttendeeInfo array
      return { ...prevRsvpConfig, requiredAttendeeInfo: updatedInfo };
    });
  }, [setRsvpConfig]);

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>RSVP Configuration</h3>
      <div className="form-group">
        <label htmlFor="capacityLimit" className="form-label">Capacity Limit <span className="optional-label">(Optional)</span></label>
        <input type="number" id="capacityLimit" name="capacityLimit" className="input-field" min="1" placeholder="e.g., 100" value={rsvpConfig?.capacityLimit || ''} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.rsvpConfig && formErrors.rsvpConfig.capacityLimit && <p className="error-message-box">{formErrors.rsvpConfig.capacityLimit}</p>}
      </div>
      <div className="form-group">
        <label className="form-label inline">
          <input type="checkbox" id="enableWaitlist" name="enableWaitlist" className="form-checkbox" checked={rsvpConfig?.enableWaitlist || false} onChange={handleInputChange} disabled={isSubmitting || !rsvpConfig?.capacityLimit || parseInt(rsvpConfig?.capacityLimit) <= 0} /> Enable Waitlist
        </label>
        <p className="text-xs text-naks-text-secondary mt-1">Attendees will be added to a waitlist if the event reaches its capacity.</p>
      </div>

      {(rsvpConfig && rsvpConfig.capacityLimit && parseInt(rsvpConfig.capacityLimit) > 0) && (
          <div className="profile-section-card" style={{padding: '15px'}}>
              <h3 className={styles.sectionHeading} style={{fontSize: '1.2rem', marginBottom: '10px', borderBottom: 'none', paddingBottom: '0'}}>RSVP Period</h3>
              <div className="form-group">
                  <label htmlFor="rsvpStartDate" className="form-label">Start Date <span className="optional-label">(Optional)</span></label>
                  <input type="date" id="rsvpStartDate" name="rsvpStartDate" className="input-field" value={rsvpConfig.rsvpStartDate || ''} onChange={handleInputChange} disabled={isSubmitting} />
                  {formErrors.rsvpConfig && formErrors.rsvpConfig.rsvpStartDate && <p className="error-message-box">{formErrors.rsvpConfig.rsvpStartDate}</p>}
              </div>
              <div className="form-group">
                  <label htmlFor="rsvpStartTime" className="form-label">Start Time <span class="optional-label">(Optional)</span></label>
                  <input type="time" id="rsvpStartTime" name="rsvpStartTime" className="input-field" value={rsvpConfig.rsvpStartTime || ''} onChange={handleInputChange} disabled={isSubmitting} />
                  {formErrors.rsvpConfig && formErrors.rsvpConfig.rsvpStartTime && <p className="error-message-box">{formErrors.rsvpConfig.rsvpStartTime}</p>}
              </div>
              <div className="form-group">
                  <label htmlFor="rsvpEndDate" className="form-label">End Date <span class="optional-label">(Optional)</span></label>
                  <input type="date" id="rsvpEndDate" name="rsvpEndDate" className="input-field" value={rsvpConfig.rsvpEndDate || ''} onChange={handleInputChange} disabled={isSubmitting} />
                  {formErrors.rsvpConfig && formErrors.rsvpConfig.rsvpEndDate && <p className="error-message-box">{formErrors.rsvpConfig.rsvpEndDate}</p>}
              </div>
              <div className="form-group">
                  <label htmlFor="rsvpEndTime" className="form-label">End Time <span class="optional-label">(Optional)</span></label>
                  <input type="time" id="rsvpEndTime" name="rsvpEndTime" className="input-field" value={rsvpConfig.rsvpEndTime || ''} onChange={handleInputChange} disabled={isSubmitting} />
                  {formErrors.rsvpConfig && formErrors.rsvpConfig.rsvpEndTime && <p className="error-message-box">{formErrors.rsvpConfig.rsvpEndTime}</p>}
              </div>
          </div>
      )}

      <div className="profile-section-card" style={{padding: '15px'}}>
        <h3 className={styles.sectionHeading} style={{fontSize: '1.2rem', marginBottom: '10px', borderBottom: 'none', paddingBottom: '0'}}>Required Information from Attendees <span className="optional-label">(Optional)</span></h3>
        <div className="checkbox-group">
          <label className="form-label inline"><input type="checkbox" className="form-checkbox" checked={(rsvpConfig?.requiredAttendeeInfo || []).includes('phone')} onChange={() => handleRequiredAttendeeInfoChange('phone')} disabled={isSubmitting} /> Phone Number</label>
          <label className="form-label inline"><input type="checkbox" className="form-checkbox" checked={(rsvpConfig?.requiredAttendeeInfo || []).includes('address')} onChange={() => handleRequiredAttendeeInfoChange('address')} disabled={isSubmitting} /> Address</label>
          <label className="form-label inline"><input type="checkbox" className="form-checkbox" checked={(rsvpConfig?.requiredAttendeeInfo || []).includes('company')} onChange={() => handleRequiredAttendeeInfoChange('company')} disabled={isSubmitting} /> Company Name</label>
          <label className="form-label inline"><input type="checkbox" className="form-checkbox" checked={(rsvpConfig?.requiredAttendeeInfo || []).includes('jobTitle')} onChange={() => handleRequiredAttendeeInfoChange('jobTitle')} disabled={isSubmitting} /> Job Title</label>
          <label className="form-label inline"><input type="checkbox" className="form-checkbox" checked={(rsvpConfig?.requiredAttendeeInfo || []).includes('dietary')} onChange={() => handleRequiredAttendeeInfoChange('dietary')} disabled={isSubmitting} /> Dietary Restrictions</label>
        </div>
        {(rsvpConfig?.requiredAttendeeInfo || []).includes('dietary') && (
          <div className="form-group" style={{marginTop: '15px'}}>
            <label htmlFor="dietarySpecification" className="form-label">Specify Dietary Restrictions <span className="optional-label">(Optional)</span></label>
            <input type="text" id="dietarySpecification" name="dietarySpecification" className="input-field" value={rsvpConfig?.dietarySpecification || ''} onChange={handleInputChange} placeholder="e.g., Vegetarian, Gluten-Free" disabled={isSubmitting} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RsvpSetup;