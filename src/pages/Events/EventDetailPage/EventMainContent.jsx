import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../EventDetailPage.module.css'; // Use parent's CSS module

import GallerySection from '../../../components/Events/Details/GallerySection.jsx';

import { FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaInfoCircle } from 'react-icons/fa';

const EventMainContent = ({ event, organizer }) => {
  return (
    <div className={styles.mainContentColumn}> {/* Left column for PC */}
      {/* About Event Section */}
      <section className={styles.sectionContent}>
        <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>About This Event</h2>
        <div className={styles.textContent}>
          <p>{event.description}</p>
        </div>
      </section>

      {/* Event Gallery Section */}
      {(event.galleryImages && event.galleryImages.length > 0) && (
        <GallerySection galleryImages={event.galleryImages} eventName={event.eventName} loading={false} />
      )}

      {/* More Information (Refund Policy & Disclaimers, Sponsors) */}
      {(event.refundPolicyType || event.disclaimer || (event.sponsors && event.sponsors.length > 0)) && (
          <section className={styles.sectionContent}>
              <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>More Information</h2>
              <div className={styles.textContent}>
                  {event.refundPolicyType === 'naksyetu' && (
                      <p>This event adheres to the <Link to="/refund-policy" className="text-link">Naks Yetu Standard Refund Policy</Link>.</p>
                  )}
                  {event.refundPolicyType === 'custom' && (
                      <p>{event.customRefundPolicy || 'No custom refund policy provided.'}</p>
                  )}
                  {event.disclaimer && (
                      <>
                          <h4 style={{marginTop: '15px', marginBottom: '5px', color: 'var(--naks-text-primary)'}}>Disclaimer:</h4>
                          <p>{event.disclaimer}</p>
                      </>
                  )}
              </div>

              {event.sponsors && event.sponsors.length > 0 && (
                  <div className={styles.sponsorsSection} style={{marginTop: '30px', borderTop: '1px solid var(--naks-border-light)', paddingTop: '20px', boxShadow: 'none', background: 'none', border: 'none'}}>
                      <h3 className={`${styles.sectionTitle} ${styles.gradientText}`} style={{fontSize: '1.5rem', marginBottom: '15px', borderBottom: '1px solid var(--naks-border-light)', paddingBottom: '10px'}}>Event Sponsors</h3>
                      <div className={styles.sponsorsGrid}>
                          {event.sponsors.map((sponsor, index) => (
                              <div key={index} className={styles.sponsorLogoContainer}>
                                  <img src={sponsor.logoUrl || 'https://placehold.co/100x100/E0E0E0/808080?text=Logo'} alt={sponsor.name || 'Sponsor Logo'} className={styles.sponsorLogo} />
                                  {sponsor.name && <span className={styles.sponsorNameTooltip}>{sponsor.name}</span>}
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </section>
      )}

      {/* Organizer Branding Section (Below all other sections) */}
      {organizer && (
          <section className={styles.organizerInfoSection}>
              <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>About The Organizer</h2>
              <div className={styles.organizerInfo}>
                  <img src={organizer.avatarUrl || "https://placehold.co/80x80/E0E0E0/808080?text=Org"} alt={organizer.displayName} className={styles.organizerLogo} />
                  <div className={styles.organizerDetails}>
                      <h3 className={styles.organizerName}>{organizer.displayName || organizer.email}</h3>
                      <p className={organizer.organizerBio || 'No bio available.'}></p>
                      <div className={styles.organizerSocialLinks}>
                          {organizer.instagram && <a href={organizer.instagram} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaInstagram /></a>}
                          {organizer.twitter && <a href={organizer.twitter} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaTwitter /></a>}
                          {organizer.contactPhone && <a href={`tel:${organizer.contactPhone}`} className={styles.organizerSocialLink}><FaPhone /></a>}
                          {organizer.contactEmail && <a href={`mailto:${organizer.contactEmail}`} className={styles.organizerSocialLink}><FaEnvelope /></a>}
                      </div>
                      <button className={`btn btn-secondary ${styles.viewOtherEventsBtn}`}>Contact Organizer</button>
                      <button className={`btn btn-secondary ${styles.viewOtherEventsBtn}`} disabled>View Other Events by This Organizer</button>
                  </div>
              </div>
          </section>
      )}
    </div>
  );
};

export default EventMainContent;