import React, { useState } from 'react';
import { FaCalendarAlt, FaMoon } from 'react-icons/fa';

import styles from '../../organizer.module.css'; // Re-use organizer dashboard styles
import CreateNormalEventWizard from '../Forms/CreateNormalEventWizard/CreateNormalEventWizard.jsx';
import CreateNightlifeEventWizard from '../Forms/CreateNightlifeEventWizard/CreateNightlifeEventWizard.jsx';
import Modal from '../../../../components/Common/Modal.jsx'; // Import Modal component
import EventTypeSelectionModal from '../Forms/CreateNormalEventWizard/Components/EventTypeSelectionModal.jsx';// NEW: Import EventTypeSelectionModal

const CreateEventTab = () => {
  const [selectedEventType, setSelectedEventType] = useState(null); // 'normal' or 'nightlife'
  const [showNormalEventModal, setShowNormalEventModal] = useState(false); // NEW: State for normal event type selection modal

  const handleSelectNormalEventType = (type) => {
    // This function is called from within the modal
    setSelectedEventType('normal');
    // Pass the selected type to the wizard, or store it in state for the wizard to pick up
    // For now, we'll just set it in formData in the wizard's initial state
    setShowNormalEventModal(false); // Close the modal
    // The wizard will be rendered based on selectedEventType === 'normal'
  };

  if (selectedEventType === 'normal') {
    return <CreateNormalEventWizard onBack={() => setSelectedEventType(null)} />;
  }

  if (selectedEventType === 'nightlife') {
    return <CreateNightlifeEventWizard onBack={() => setSelectedEventType(null)} />;
  }

  return (
    <div className="section-content">
      <h3 className="section-title">What kind of event are you creating?</h3>
      <p className="section-description">Choose the event type that best suits your needs.</p>

      <div className={styles.eventTypeChooserGrid}>
        <button
          className={styles.eventTypeChooserCard}
          onClick={() => setShowNormalEventModal(true)} // Open modal for normal event
        >
          <FaCalendarAlt className={styles.chooserIcon} />
          <h4 className={styles.chooserTitle}>Normal Event</h4>
          <p className={styles.chooserDescription}>Concerts, festivals, workshops, free events, and more.</p>
        </button>

        <button
          className={styles.eventTypeChooserCard}
          onClick={() => setSelectedEventType('nightlife')}
        >
          <FaMoon className={styles.chooserIcon} />
          <h4 className={styles.chooserTitle}>Nightlife Event</h4>
          <p className={styles.chooserDescription}>Clubs, parties, DJ nights, and exclusive evening experiences.</p>
        </button>
      </div>

      {/* NEW: Modal for Normal Event Type Selection */}
      <Modal isOpen={showNormalEventModal} onClose={() => setShowNormalEventModal(false)} title="Select Normal Event Type">
        <EventTypeSelectionModal onSelectType={handleSelectNormalEventType} onClose={() => setShowNormalEventModal(false)} />
      </Modal>
    </div>
  );
};

export default CreateEventTab;