import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../../../components/Common/Modal.jsx';
import TextInput from '../../../../components/Common/TextInput.jsx';
import Button from '../../../../components/Common/Button.jsx';
import { FaUsers, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';

const RsvpConfigModal = ({ isOpen, onClose, onSaveRsvpConfig, initialRsvpConfig = {} }) => {
  const { showNotification } = useNotification();
  const [config, setConfig] = useState(() => ({
    capacityLimit: initialRsvpConfig.capacityLimit || '',
    enableWaitlist: initialRsvpConfig.enableWaitlist || false,
    rsvpStartDate: initialRsvpConfig.rsvpStartDate || '',
    rsvpStartTime: initialRsvpConfig.rsvpStartTime || '',
    rsvpEndDate: initialRsvpConfig.rsvpEndDate || '',
    rsvpEndTime: initialRsvpConfig.rsvpEndTime || '',
    requiredAttendeeInfo: initialRsvpConfig.requiredAttendeeInfo || [],
    dietarySpecification: initialRsvpConfig.dietarySpecification || '',
  }));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig({
        capacityLimit: initialRsvpConfig.capacityLimit || '',
        enableWaitlist: initialRsvpConfig.enableWaitlist || false,
        rsvpStartDate: initialRsvpConfig.rsvpStartDate || '',
        rsvpStartTime: initialRsvpConfig.rsvpStartTime || '',
        rsvpEndDate: initialRsvpConfig.rsvpEndDate || '',
        rsvpEndTime: initialRsvpConfig.rsvpEndTime || '',
        requiredAttendeeInfo: initialRsvpConfig.requiredAttendeeInfo || [],
        dietarySpecification: initialRsvpConfig.dietarySpecification || '',
      });
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, initialRsvpConfig]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const handleRequiredAttendeeInfoChange = useCallback((field) => {
    setConfig(prev => {
      const currentInfo = prev.requiredAttendeeInfo || [];
      if (currentInfo.includes(field)) {
        return { ...prev, requiredAttendeeInfo: currentInfo.filter(item => item !== field) };
      } else {
        return { ...prev, requiredAttendeeInfo: [...currentInfo, field] };
      }
    });
  }, []);

  const validateConfig = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (config.capacityLimit && (isNaN(parseInt(config.capacityLimit)) || parseInt(config.capacityLimit) <= 0)) {
      newErrors.capacityLimit = 'Capacity must be a positive integer.';
      isValid = false;
    }

    if (config.capacityLimit && parseInt(config.capacityLimit) > 0) {
        if (!config.rsvpStartDate) { newErrors.rsvpStartDate = 'Start date required.'; isValid = false; }
        if (!config.rsvpStartTime) { newErrors.rsvpStartTime = 'Start time required.'; isValid = false; }
        if (!config.rsvpEndDate) { newErrors.rsvpEndDate = 'End date required.'; isValid = false; }
        if (!config.rsvpEndTime) { newErrors.rsvpEndTime = 'End time required.'; isValid = false; }

        const rsvpStartDateTime = new Date(`${config.rsvpStartDate}T${config.rsvpStartTime}`);
        const rsvpEndDateTime = new Date(`${config.rsvpEndDate}T${config.rsvpEndTime}`);
        const now = new Date();

        if (isNaN(rsvpStartDateTime.getTime())) { newErrors.rsvpStartDate = 'Invalid date/time.'; isValid = false; }
        else if (rsvpStartDateTime < now) { newErrors.rsvpStartDate = 'Cannot be in the past.'; isValid = false; }

        if (isNaN(rsvpEndDateTime.getTime())) { newErrors.rsvpEndDate = 'Invalid date/time.'; isValid = false; }
        else if (rsvpEndDateTime <= rsvpStartDateTime) { newErrors.rsvpEndDate = 'Must be after start.'; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  }, [config]);

  const handleSave = async () => {
    if (!validateConfig()) {
      showNotification('Please correct errors in RSVP configuration.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await onSaveRsvpConfig(config);
      showNotification('RSVP configuration saved!', 'success');
      onClose();
    } catch (err) {
      console.error("Error saving RSVP config:", err);
      showNotification('Failed to save RSVP configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure RSVP">
      <div className="space-y-4">
        <TextInput
          label="Capacity Limit (Optional)"
          id="capacityLimit"
          name="capacityLimit"
          type="number"
          value={config.capacityLimit}
          onChange={handleInputChange}
          error={errors.capacityLimit}
          min="1"
          placeholder="e.g., 100"
        />
        <div className="form-group"> {/* Use global form-group */}
          <label className="form-label inline-flex items-center cursor-pointer"> {/* Use global form-label */}
            <input
              type="checkbox"
              id="enableWaitlist"
              name="enableWaitlist"
              className="form-checkbox" // Use global form-checkbox
              checked={config.enableWaitlist}
              onChange={handleInputChange}
              disabled={!config.capacityLimit || parseInt(config.capacityLimit) <= 0}
            />
            <span className="ml-2 text-text-color">Enable Waitlist (if capacity is reached)</span>
          </label>
          <p className="text-xs text-naks-text-secondary mt-1">Attendees will be added to a waitlist if the event reaches its capacity.</p>
        </div>

        {config.capacityLimit && parseInt(config.capacityLimit) > 0 && (
            <div className="profile-section-card"> {/* Re-use card for grouping */}
                <h3>RSVP Period</h3>
                <TextInput
                    label="Start Date"
                    id="rsvpStartDate"
                    name="rsvpStartDate"
                    type="date"
                    value={config.rsvpStartDate}
                    onChange={handleInputChange}
                    error={errors.rsvpStartDate}
                    required
                />
                <TextInput
                    label="Start Time"
                    id="rsvpStartTime"
                    name="rsvpStartTime"
                    type="time"
                    value={config.rsvpStartTime}
                    onChange={handleInputChange}
                    error={errors.rsvpStartTime}
                    required
                />
                <TextInput
                    label="End Date"
                    id="rsvpEndDate"
                    name="rsvpEndDate"
                    type="date"
                    value={config.rsvpEndDate}
                    onChange={handleInputChange}
                    error={errors.rsvpEndDate}
                    required
                />
                <TextInput
                    label="End Time"
                    id="rsvpEndTime"
                    name="rsvpEndTime"
                    type="time"
                    value={config.rsvpEndTime}
                    onChange={handleInputChange}
                    error={errors.rsvpEndTime}
                    required
                />
            </div>
        )}

        <div className="profile-section-card"> {/* Re-use card for grouping */}
          <h3>Required Information from Attendees (Optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {/* Use global grid classes */}
            <label className="form-label inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox" checked={config.requiredAttendeeInfo.includes('phone')} onChange={() => handleRequiredAttendeeInfoChange('phone')} />
              <span className="ml-2 text-text-color">Phone Number</span>
            </label>
            <label className="form-label inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox" checked={config.requiredAttendeeInfo.includes('address')} onChange={() => handleRequiredAttendeeInfoChange('address')} />
              <span className="ml-2 text-text-color">Address</span>
            </label>
            <label className="form-label inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox" checked={config.requiredAttendeeInfo.includes('company')} onChange={() => handleRequiredAttendeeInfoChange('company')} />
              <span className="ml-2 text-text-color">Company Name</span>
            </label>
            <label className="form-label inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox" checked={config.requiredAttendeeInfo.includes('jobTitle')} onChange={() => handleRequiredAttendeeInfoChange('jobTitle')} />
              <span className="ml-2 text-text-color">Job Title</span>
            </label>
            <label className="form-label inline-flex items-center cursor-pointer">
              <input type="checkbox" className="form-checkbox" checked={config.requiredAttendeeInfo.includes('dietary')} onChange={() => handleRequiredAttendeeInfoChange('dietary')} />
              <span className="ml-2 text-text-color">Dietary Restrictions</span>
            </label>
          </div>
          {config.requiredAttendeeInfo.includes('dietary') && (
            <TextInput
              label="Specify Dietary Restrictions"
              id="dietarySpecification"
              name="dietarySpecification"
              type="text"
              value={config.dietarySpecification}
              onChange={handleInputChange}
              placeholder="e.g., Vegetarian, Gluten-Free"
              className="mt-3" // Use global margin-top
            />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6"> {/* Use global flex/gap/margin-top */}
        <Button onClick={onClose} className="btn btn-secondary">Cancel</Button>
        <Button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <FaSpinner className="spinner mr-2" /> : null}
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </Modal>
  );
};

export default RsvpConfigModal;