// /src/components/Events/Details/TermsSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../Events/EventDetailPage.module.css'; 
import commonStyles from '../../../components/Common/Button.module.css'; // For common textLink style

const TermsSection = ({ event }) => {
  const isCustomRefundPolicy = event?.refundPolicyType === 'custom';
  const refundPolicyLink = event?.refundPolicyType === 'naksyetu' ? '/refund-policy' : '#'; // Link to static policy

  return (
    <section className={`${styles.sectionContent} ${styles.termsSection}`}>
      <h2 className={styles.sectionTitle}>Terms & Policies</h2>
      <div className={styles.textContent}>
        <h3>Refund Policy:</h3>
        {isCustomRefundPolicy ? (
          <p>{event?.customRefundPolicy || "No custom refund policy provided."}</p>
        ) : (
          <p>This event follows the <Link to={refundPolicyLink} target="_blank" rel="noopener noreferrer" className={commonStyles.textLink}>Naks Yetu Standard Refund Policy</Link>.</p>
        )}
        
        <h3>General Terms:</h3>
        <p>By purchasing tickets or RSVPing for this event, you agree to the <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" className={commonStyles.textLink}>Naks Yetu Terms of Service</Link> and the event organizer's specific terms (if any, displayed during checkout or on event page).</p>
        
        {event?.disclaimer && ( 
          <>
            <h3>Additional Event Specifics/Disclaimer:</h3>
            <p>{event.disclaimer}</p>
          </>
        )}
      </div>
    </section>
  );
};

export default TermsSection;