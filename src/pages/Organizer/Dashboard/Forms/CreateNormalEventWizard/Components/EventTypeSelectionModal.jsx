import React from 'react';
import { FaTicketAlt, FaGift, FaUsers, FaLaptopCode } from 'react-icons/fa'; // Icons for event types
import Button from '../../../../../../components/Common/Button.jsx'; // Path from Components/ to Common/

import styles from '../NaksYetuEventLaunchpad.module.css'; // Use wizard's CSS module

const EVENT_TYPES_OPTIONS = [
  { id: 'ticketed', label: 'Ticketed Event', icon: FaTicketAlt, description: 'Sell tickets for concerts, festivals, and paid workshops.' },
  { id: 'free', label: 'Free Event', icon: FaGift, description: 'Host free gatherings, community meetups, or open days.' },
  { id: 'rsvp', label: 'RSVP Required', icon: FaUsers, description: 'Manage guest lists for exclusive parties or limited-capacity events.' },
  { id: 'online', label: 'Online Event', icon: FaLaptopCode, description: 'Organize webinars, virtual conferences, or live streams.' },
];

const EventTypeSelectionModal = ({ onSelectType, onClose }) => {
  return (
    <div className={styles.eventTypeSelectionModalContent}>
      <h3 className={styles.modalHeading}>Choose Your Event Type</h3>
      <p className={styles.modalDescription}>Select the option that best describes your event.</p>

      <div className={styles.eventTypeOptionsGrid}>
        {EVENT_TYPES_OPTIONS.map(type => (
          <button
            key={type.id}
            className={styles.eventTypeOptionCard}
            onClick={() => onSelectType(type.id)}
          >
            {type.icon && <type.icon className={styles.eventTypeOptionIcon} />}
            <h4 className={styles.eventTypeOptionTitle}>{type.label}</h4>
            <p className={styles.eventTypeOptionDescription}>{type.description}</p>
          </button>
        ))}
      </div>

      <div className={styles.modalActions}>
        <Button onClick={onClose} className="btn btn-secondary">Cancel</Button>
      </div>
    </div>
  );
};

export default EventTypeSelectionModal;