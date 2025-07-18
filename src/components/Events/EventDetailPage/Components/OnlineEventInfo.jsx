// /src/components/Events/EventDetailPage/Components/OnlineEventInfo.jsx
import React from 'react';
import commonStyles from '../../EventDetailPage.module.css';
import styles from '../EventSidebarActions.module.css';

const OnlineEventInfo = ({ event }) => {
  return (
    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
        <h2 className={styles.sidebarHeading}>Join Online Event</h2>
        <p className={styles.helperText}>Access this event from anywhere in the world.</p>
        {event.onlineLink ? (
            <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.actionButton}`}>Join Now</a>
        ) : (
            <p className={styles.helperText} style={{color: 'var(--naks-error)'}}>Online link not yet available.</p>
        )}
    </section>
  );
};

export default OnlineEventInfo;