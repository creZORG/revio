// /src/components/Events/EventDetailPage/Components/FreeEventInfo.jsx
import React from 'react';
import commonStyles from '../../EventDetailPage.module.css';
import styles from '../EventSidebarActions.module.css';

const FreeEventInfo = ({ event }) => {
  return (
    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
        <h2 className={styles.sidebarHeading}>Attend for Free</h2>
        <p className={styles.helperText}>No tickets or RSVP required for {event.eventName}. Simply show up and enjoy!</p>
        <button className={`${commonStyles.btn} ${commonStyles.btnSecondary} ${styles.actionButton}`}>Add to Calendar</button>
    </section>
  );
};

export default FreeEventInfo;