import React from 'react';
import styles from '../../../Tabs/CreateEventWizard.module.css'; // Common wizard styles
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline'; // Icons for add/remove

const RsvpSetup = ({ rsvpCapacity, rsvpEnableWaitlist, rsvpQuestions, onRsvpChange }) => {
  const handleCapacityChange = (e) => {
    onRsvpChange({ rsvpCapacity: e.target.value });
  };

  const handleWaitlistToggle = (e) => {
    onRsvpChange({ rsvpEnableWaitlist: e.target.checked });
  };

  const handleRsvpQuestionsChange = (e) => {
    onRsvpChange({ rsvpQuestions: e.target.value });
  };

  return (
    <div>
      <h4 className="font-semibold text-lg mb-4">RSVP Details</h4>

      <div className={styles.formGroup}>
        <label htmlFor="rsvpCapacity" className={styles.formLabel}>RSVP Capacity Limit (Optional)</label>
        <TextInput
          id="rsvpCapacity"
          name="rsvpCapacity"
          value={rsvpCapacity}
          onChange={handleCapacityChange}
          type="number"
          placeholder="e.g., 100"
        />
        <p className="text-sm text-gray-500 mt-1">Leave empty for unlimited capacity.</p>
      </div>

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="rsvpEnableWaitlist"
          name="rsvpEnableWaitlist"
          checked={rsvpEnableWaitlist}
          onChange={handleWaitlistToggle}
          className={styles.checkboxInput}
        />
        <label htmlFor="rsvpEnableWaitlist" className={styles.checkboxLabel}>Enable Waitlist if Capacity is Reached</label>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="rsvpQuestions" className={styles.formLabel}>RSVP Questions (comma-separated, Optional)</label>
        <TextInput
          id="rsvpQuestions"
          name="rsvpQuestions"
          value={rsvpQuestions}
          onChange={handleRsvpQuestionsChange}
          isTextarea={true}
          rows={3}
          placeholder="e.g., Any dietary restrictions?, How did you hear about us?"
        />
        <p className="text-sm text-gray-500 mt-1">Attendees will be asked these questions during RSVP.</p>
      </div>
    </div>
  );
};

export default RsvpSetup;