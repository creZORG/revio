// /src/components/Events/EventDetailPage/Components/RsvpFormSection.jsx
import React from 'react';
import commonStyles from '../../EventDetailPage.module.css'; // For sectionContent, sectionTitle
import styles from '../EventSidebarActions.module.css'; // Reusing sidebar action styles

const RsvpFormSection = ({ event }) => {
  return (
    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
        <h2 className={styles.sidebarHeading}>RSVP for {event.eventName || 'Event'}</h2>
        <p className={styles.helperText}>Confirm your attendance for this exclusive event.</p>
        <p className={styles.helperText}>Your RSVP will be managed by the organizer.</p>
        <button className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.actionButton}`}>Register Now</button>
    </section>
  );
};

export default RsvpFormSection;