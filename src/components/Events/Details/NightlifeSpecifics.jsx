import React from 'react';
// FIX: Corrected import paths
import { FaDollarSign, FaInfoCircle, FaEnvelope, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram } from 'react-icons/fa';


import styles from '../EventDetailPage.module.css'; // Use parent's CSS module

const NightlifeSpecifics = ({ event }) => {
  return (
    <aside className={`${styles.eventSidebarActions} ${styles.nightlifeTheme} glassmorphism`}>
      <h2 className={styles.sidebarHeading}>Nightlife Details</h2>
      
      {event.entranceFee && event.entranceFee > 0 ? (
        <p className={styles.nightlifeDetailText}>
          <FaDollarSign /> Entrance Fee: KES {event.entranceFee.toLocaleString()}
        </p>
      ) : (
        <p className={styles.nightlifeDetailText}>
          <FaDollarSign /> Free Entry
        </p>
      )}

      {event.disclaimer && (
        <p className={styles.nightlifeDetailText}>
          <FaInfoCircle /> Disclaimer: {event.disclaimer}
        </p>
      )}

      {/* Share and Contact Section */}
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

export default NightlifeSpecifics;