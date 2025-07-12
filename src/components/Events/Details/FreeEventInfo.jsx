import React from 'react';
// FIX: Corrected import paths
import { FaCheckCircle, FaDollarSign, FaEnvelope, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import Button from '../../Common/Button.jsx';
 // Use parent's CSS module
import styles from '../EventDetailPage.module.css';
const FreeEventInfo = ({ event }) => {
  return (
    <aside className={`${styles.eventSidebarActions} glassmorphism`}>
      <h2 className={styles.sidebarHeading}>Free Event</h2>
      <p className={styles.freeEventInfoText}>
        This event has free entry! Just show up and enjoy.
      </p>
      {event.donationOption && (
        <p className={styles.freeEventInfoText}>
          <FaDollarSign /> Donations are welcome to support the event.
        </p>
      )}
      <Button className={`btn btn-primary ${styles.checkoutBtn} glassmorphism-button`}>
        Attend for Free <FaCheckCircle />
      </Button>
      {/* Share and Contact Section - Can be a separate component or inline */}
      <div className={styles.shareContactSection}>
        <h3 className={styles.shareHeading}>Share This Event</h3>
        <div className={styles.socialShareIcons}>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaFacebookF /></a>
          <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(event.eventName)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaTwitter /></a>
          <a href={`https://wa.me/?text=${encodeURIComponent(event.eventName + " - " + window.location.href)}`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaWhatsapp /></a>
          <a href={`https://www.instagram.com/direct/new/`} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaInstagram /></a>
        </div>
        <button className={`btn btn-secondary ${styles.contactOrganizerBtn} glassmorphism-button`} onClick={() => alert(`Contacting organizer ${event.contactEmail || 'N/A'}`)}>
          <FaEnvelope /> Contact Organizer
        </button>
      </div>
    </aside>
  );
};

export default FreeEventInfo;