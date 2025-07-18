// /src/components/Events/Details/OrganizerSection.jsx
import React from 'react';
import { FaUserCircle, FaEnvelope, FaPhone, FaLink, FaInstagram, FaTwitter } from 'react-icons/fa';
import Button from '../../Common/Button.jsx'; 
import styles from '../../Events/EventDetailPage.module.css'; 

const OrganizerSection = ({ event, organizer, onContactOrganizer }) => {
  return (
    <section className={`${styles.sectionContent} ${styles.organizerInfoSection}`}>
      <h2 className={styles.sectionTitle}>About The Organizer</h2>
      <div className={styles.organizerInfo}>
        <img src={organizer?.profilePhotoUrl || "https://placehold.co/100x100/E0E0E0/808080?text=Org"} alt={organizer?.organizationName || organizer?.displayName || "Organizer Logo"} className={styles.organizerLogo} />
        <div className={styles.organizerDetails}>
          <h3 className={styles.organizerName}>{organizer?.organizationName || organizer?.displayName || "Unknown Organizer"}</h3>
          <p className={styles.organizerBio}>{organizer?.bio || "No bio provided."}</p>
          <div className={styles.organizerContact}>
            {organizer?.organizerEmail && <p><FaEnvelope /> {organizer.organizerEmail}</p>}
            {organizer?.organizerContactPhone && <p><FaPhone /> {organizer.organizerContactPhone}</p>}
          </div>
          <div className={styles.organizerSocialLinks}>
              {organizer?.instagramUrl && <a href={organizer.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaInstagram /></a>}
              {organizer?.twitterUrl && <a href={organizer.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaTwitter /></a>}
              {organizer?.websiteUrl && <a href={organizer.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaLink /></a>}
          </div>
          <Button onClick={onContactOrganizer} className={`${styles.contactOrganizerBtn}`}>
            Contact Organizer
          </Button>
          {organizer?.id && <Link to={`/organizer/${organizer.id}/events`} className={`${styles.contactOrganizerBtn} ${styles.viewOtherEventsBtn}`}>View Other Events by This Organizer</Link>}
        </div>
      </div>
    </section>
  );
};

export default OrganizerSection;