// /src/components/Events/EventDetailPage/EventMainContent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaPhone, FaEnvelope } from 'react-icons/fa';

import styles from './EventMainContent.module.css';
import commonStyles from '../EventDetailPage.module.css';

// NEW: Import EventGalleryCarousel
import EventGalleryCarousel from './Components/EventGalleryCarousel.jsx';

const EventMainContent = ({ event, organizer }) => {
    return (
        <main className={styles.mainInfoColumn}>
            {/* About Event Section */}
            <section className={commonStyles.sectionContent}>
                <h2 className={`${commonStyles.sectionTitle} ${styles.gradientText}`}>About This Event</h2>
                <div className={styles.textContent}>
                    <p>{event.eventDescription || 'No description available.'}</p>
                    {event.ageCategories && event.ageCategories.length > 0 && (
                        <p><strong>Age Categories:</strong> {event.ageCategories.map(cat => cat.replace(/_/g, ' ')).join(', ')}</p>
                    )}
                    {event.eventTags && event.eventTags.length > 0 && (
                        <p><strong>Tags:</strong> {event.eventTags.join(', ')}</p>
                    )}
                </div>
            </section>

            {/* Gallery Section - Now uses EventGalleryCarousel */}
            {event.galleryImages && event.galleryImages.length > 0 && ( /* Only render if images exist */
                <EventGalleryCarousel galleryImages={event.galleryImages} eventName={event.eventName} />
            )}

            {/* Organizer Branding Section */}
            {organizer && (
                <section className={commonStyles.sectionContent}>
                    <h2 className={`${commonStyles.sectionTitle} ${styles.gradientText}`}>About The Organizer</h2>
                    <div className={styles.organizerInfo}>
                        <img src={organizer.avatarUrl || "https://placehold.co/80x80/E0E0E0/808080?text=Org"} alt={organizer.displayName || organizer.email} className={styles.organizerLogo} />
                        <div className={styles.organizerDetails}>
                            <h3 className={styles.organizerName}>{organizer.displayName || organizer.email}</h3>
                            <p className={styles.organizerBio}>{organizer.organizerBio || 'No bio available.'}</p>
                            <div className={styles.organizerSocialLinks}>
                                {organizer.instagramUrl && <a href={organizer.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaInstagram /></a>}
                                {organizer.twitterUrl && <a href={organizer.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaTwitter /></a>}
                                {organizer.contactPhone && <a href={`tel:${organizer.contactPhone}`} className={styles.organizerSocialLink}><FaPhone /></a>}
                                {organizer.contactEmail && <a href={`mailto:${organizer.contactEmail}`} className={styles.organizerSocialLink}><FaEnvelope /></a>}
                            </div>
                            <Link to={`/events/organizer/${organizer.id}`} className={`btn btn-secondary ${styles.viewOtherEventsBtn}`}>View Other Events by This Organizer</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Policies Section */}
            {(event.refundPolicyType || event.customRefundPolicy || event.disclaimer) && (
                <section className={commonStyles.sectionContent}>
                    <h2 className={`${commonStyles.sectionTitle} ${styles.gradientText}`}>Refund Policy & Disclaimers</h2>
                    <div className={styles.textContent}>
                        {event.refundPolicyType === 'naksyetu_standard' && (
                            <p>This event adheres to the <Link to="/refund-policy" className={styles.textLink}>Naks Yetu Standard Refund Policy</Link>.</p>
                        )}
                        {event.refundPolicyType === 'custom' && (
                            <p>{event.customRefundPolicy || 'No custom refund policy provided.'}</p>
                        )}
                        {event.disclaimer && (
                            <>
                                <h4 className={styles.sectionSubtitle} style={{marginTop: '15px', marginBottom: '5px', color: 'var(--naks-text-primary)'}}>Disclaimer:</h4>
                                <p>{event.disclaimer}</p>
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Sponsors Section */}
            {event.sponsors && event.sponsors.length > 0 && (
                <section className={commonStyles.sectionContent}>
                    <h2 className={`${commonStyles.sectionTitle} ${styles.gradientText}`}>Event Sponsors</h2>
                    <div className={styles.sponsorsGrid}>
                        {event.sponsors.map((sponsor, index) => (
                            <a key={index} href={sponsor.website || '#'} target="_blank" rel="noopener noreferrer" className={styles.sponsorLogoContainer}>
                                <img src={sponsor.logoUrl || 'https://placehold.co/100x100/E0E0E0/808080?text=Logo'} alt={sponsor.name || 'Sponsor Logo'} className={styles.sponsorLogo} />
                                {sponsor.name && <span className={styles.sponsorNameTooltip}>{sponsor.name}</span>}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default EventMainContent;