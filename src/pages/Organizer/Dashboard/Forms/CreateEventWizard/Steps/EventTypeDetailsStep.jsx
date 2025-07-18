import React from 'react';
import styles from '../../../Tabs/CreateEventWizard.module.css';
import Button from '../../../../../../components/Common/Button.jsx';
import TextInput from '../../../../../../components/Common/TextInput.jsx'; // For disclaimer
import RichTextEditor from '../../../../../../components/Common/RichTextEditor.jsx';
import TicketSetup from '../Components/TicketSetup.jsx'; // Will create this
import RsvpSetup from '../Components/RsvpSetup.jsx'; // Will create this

const EventTypeDetailsStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });

    // Reset related fields when checkboxes change
    if (name === 'isTicketed' && !checked) updateFormData({ ticketTypes: [] });
    if (name === 'isOnlineEvent' && !checked) updateFormData({ onlineEventUrl: '', onlineEventType: '' });
    if (name === 'isRsvp' && !checked) updateFormData({ rsvpCapacity: '', rsvpEnableWaitlist: false, rsvpQuestions: '' });
    if (name === 'isFreeEvent' && !checked) updateFormData({ donationOption: false });
  };

  const handleTicketTypesChange = (newTicketTypes) => {
    updateFormData({ ticketTypes: newTicketTypes });
  };

  const handleRsvpChange = (newRsvpData) => {
    updateFormData(newRsvpData);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Event Type Details</h3>
      <p className="text-gray-600 mb-6">Define how attendees will access your event.</p>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>How will attendees access your event?</label>
        <div className="flex flex-col gap-2">
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isTicketed"
              name="isTicketed"
              checked={formData.isTicketed}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="isTicketed" className={styles.checkboxLabel}>This is a Ticketed Event</label>
          </div>

          {formData.isTicketed && (
            <div className="ml-6 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <TicketSetup 
                ticketTypes={formData.ticketTypes} 
                onTicketTypesChange={handleTicketTypesChange} 
              />
            </div>
          )}

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isOnlineEvent"
              name="isOnlineEvent"
              checked={formData.isOnlineEvent}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="isOnlineEvent" className={styles.checkboxLabel}>This is an Online Event</label>
          </div>

          {formData.isOnlineEvent && (
            <div className="ml-6 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className={styles.formGroup}>
                <label htmlFor="onlineEventUrl" className={styles.formLabel}>Online Event URL</label>
                <TextInput
                  id="onlineEventUrl"
                  name="onlineEventUrl"
                  value={formData.onlineEventUrl}
                  onChange={handleChange}
                  placeholder="e.g., https://zoom.us/my-webinar"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="onlineEventType" className={styles.formLabel}>Online Event Type</label>
                <TextInput
                  id="onlineEventType"
                  name="onlineEventType"
                  value={formData.onlineEventType}
                  onChange={handleChange}
                  placeholder="e.g., Zoom Webinar, Google Meet"
                />
              </div>
            </div>
          )}

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isRsvp"
              name="isRsvp"
              checked={formData.isRsvp}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="isRsvp" className={styles.checkboxLabel}>This is an RSVP Event</label>
          </div>

          {formData.isRsvp && (
            <div className="ml-6 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <RsvpSetup 
                rsvpCapacity={formData.rsvpCapacity}
                rsvpEnableWaitlist={formData.rsvpEnableWaitlist}
                rsvpQuestions={formData.rsvpQuestions}
                onRsvpChange={handleRsvpChange}
              />
            </div>
          )}

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isFreeEvent"
              name="isFreeEvent"
              checked={formData.isFreeEvent}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            <label htmlFor="isFreeEvent" className={styles.checkboxLabel}>This is a Free Event</label>
          </div>

          {formData.isFreeEvent && (
            <div className="ml-6 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="donationOption"
                  name="donationOption"
                  checked={formData.donationOption}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                />
                <label htmlFor="donationOption" className={styles.checkboxLabel}>Enable Donation Option</label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <Button onClick={prevStep} secondary>Previous</Button>
        <Button onClick={nextStep} primary>Next</Button>
      </div>
    </div>
  );
};

export default EventTypeDetailsStep;