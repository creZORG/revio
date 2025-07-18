// /src/components/Events/Details/AboutSection.jsx
import React from 'react';
import styles from '../../Events/EventDetailPage.module.css'; // Use parent's main CSS module
import commonStyles from '../../Common/Button.module.css'; // For common styles like sectionContent, sectionTitle

const AboutSection = ({ event }) => {
  return (
    <section className={`${styles.sectionContent}`}>
      <h2 className={styles.sectionTitle}>About This Event</h2>
      <div className={styles.textContent}>
        <p>{event?.eventDescription || "No description provided for this event yet."}</p>
        <p><strong>Category:</strong> {event?.category || 'N/A'}</p>
        <p><strong>Age Categories:</strong> {event?.ageCategories?.join(', ') || 'All Ages'}</p>
        <p><strong>Tags:</strong> {event?.eventTags?.join(', ') || 'N/A'}</p>
      </div>
    </section>
  );
};

export default AboutSection;