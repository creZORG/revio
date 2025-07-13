import React, { useState } from 'react';
import styles from './CreateEventWizard.module.css';
import EventTypeSelection from './Wizards/EventTypeSelection';
// We will import other steps here later, e.g., BasicInfoStep, TicketSetupStep

const CreateEventWizard = () => {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState(null);
  const [eventData, setEventData] = useState({});

  const handleNextStep = (data) => {
    setEventData(prev => ({ ...prev, ...data }));
    setStep(prev => prev + 1);
  };

  const handleEventTypeSelect = (type) => {
    setEventType(type);
    handleNextStep({ eventType: type });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <EventTypeSelection onSelect={handleEventTypeSelect} />;
      // case 2:
      //   return <BasicInfoStep onNext={handleNextStep} eventData={eventData} />;
      // case 3:
      //   // ... and so on
      default:
        return <EventTypeSelection onSelect={handleEventTypeSelect} />;
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <h2>Create a New Event</h2>
        <p>Step {step} of 5</p> {/* We'll make this dynamic later */}
      </div>
      <div className={styles.wizardContent}>
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateEventWizard;