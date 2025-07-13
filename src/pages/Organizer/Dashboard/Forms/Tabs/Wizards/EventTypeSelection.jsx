import React from 'react';
import styles from '../CreateEventWizard.module.css';
import { FaTicketAlt, FaGift, FaVideo, FaGlassCheers } from 'react-icons/fa';

const eventTypes = [
  {
    id: 'ticketed',
    name: 'Ticketed Event',
    description: 'Sell tickets for entry. Set prices, tiers, and sales dates.',
    icon: <FaTicketAlt />,
  },
  {
    id: 'free',
    name: 'Free Event',
    description: 'Offer free entry. Great for community gatherings and meetups.',
    icon: <FaGift />,
  },
  {
    id: 'online',
    name: 'Online Event',
    description: 'Host a virtual event with online streaming and interaction.',
    icon: <FaVideo />,
  },
  {
    id: 'nightlife',
    name: 'Nightlife',
    description: 'Create listings for club nights, parties, and special bar events.',
    icon: <FaGlassCheers />,
  },
];

const EventTypeSelection = ({ onSelect }) => {
  return (
    <div className={styles.selectionContainer}>
      <h3 className={styles.stepTitle}>What kind of event are you creating?</h3>
      <div className={styles.typeGrid}>
        {eventTypes.map((type) => (
          <button key={type.id} className={styles.typeCard} onClick={() => onSelect(type.id)}>
            <div className={styles.cardIcon}>{type.icon}</div>
            <h4 className={styles.cardTitle}>{type.name}</h4>
            <p className={styles.cardDescription}>{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventTypeSelection;