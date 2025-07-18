// /src/components/Events/EventDetailPage/Components/NightlifeSpecifics.jsx
import React from 'react';
import commonStyles from '../../EventDetailPage.module.css';
import styles from '../EventSidebarActions.module.css';

const NightlifeSpecifics = ({ event }) => {
  return (
    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
        <h2 className={styles.sidebarHeading}>Nightlife Entry</h2>
        <p className={styles.helperText}>Entrance fee: KES {event.entranceFee ? event.entranceFee.toFixed(2) : 'N/A'}</p>
        <p className={styles.helperText}>Age Restriction: {event.ageCategories?.includes('21_plus') ? '21+' : event.ageCategories?.includes('18_plus') ? '18+' : 'All Ages'}.</p>
        <button className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.actionButton}`}>Pay at Door / Get Access</button>
    </section>
  );
};

export default NightlifeSpecifics;