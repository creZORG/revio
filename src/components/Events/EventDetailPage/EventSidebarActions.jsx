// /src/components/Events/EventDetailPage/EventSidebarActions.jsx
import React from 'react';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram, FaPhone, FaEnvelope, FaShareAlt } from 'react-icons/fa';

import styles from './EventSidebarActions.module.css'; // Dedicated CSS for sidebar actions
import commonStyles from '../EventDetailPage.module.css'; // Common page-level styles for sections, titles

// Import EventTicketsSection (already created)
import EventTicketsSection from './EventTicketsSection.jsx';

const EventSidebarActions = ({
    event,
    organizer,
    onProceedToCheckout, // Passed from EventDetailPage
    setShowShareModal, // Passed from EventDetailPage
    setShowContactOrganizerModal, // Passed from EventDetailPage
    // CORRECTED: M-Pesa related props are now correctly destructured and passed
    isProcessingMpesa,
    mpesaError,
    setMpesaAmount,
    setMpesaPhoneNumber,
    mpesaPhoneNumber,
}) => {

    const renderActionContent = () => {
        switch (event.eventType) {
            case 'ticketed':
                return (
                    <EventTicketsSection
                        event={event}
                        onProceedToCheckout={onProceedToCheckout}
                        // CORRECTED: Pass all M-Pesa related props down
                        isProcessingMpesa={isProcessingMpesa}
                        mpesaError={mpesaError}
                        setMpesaAmount={setMpesaAmount}
                        setMpesaPhoneNumber={setMpesaPhoneNumber}
                        mpesaPhoneNumber={mpesaPhoneNumber}
                    />
                );
            case 'rsvp':
                return (
                    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
                        <h2 className={styles.sidebarHeading}>RSVP for Event</h2>
                        <p className={styles.helperText}>Confirm your attendance for this exclusive event.</p>
                        <button className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.actionButton}`}>Register Now</button>
                    </section>
                );
            case 'free':
                return (
                    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
                        <h2 className={styles.sidebarHeading}>Attend for Free</h2>
                        <p className={styles.helperText}>No tickets required, simply show up and enjoy!</p>
                        <button className={`${commonStyles.btn} ${commonStyles.btnSecondary} ${styles.actionButton}`}>Add to Calendar</button>
                    </section>
                );
            case 'online':
                return (
                    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
                        <h2 className={styles.sidebarHeading}>Join Online Event</h2>
                        <p className={styles.helperText}>Access the event from anywhere in the world.</p>
                        <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.actionButton}`}>Join Now</a>
                    </section>
                );
            case 'nightlife':
                return (
                    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
                        <h2 className={styles.sidebarHeading}>Nightlife Entry</h2>
                        <p className={styles.helperText}>Entrance fee: KES {event.entranceFee ? event.entranceFee.toFixed(2) : 'N/A'}</p>
                        <button className={`${commonStyles.btn} ${commonStyles.btnPrimary} ${styles.actionButton}`}>Pay at Door / Get Access</button>
                    </section>
                );
            default:
                return (
                    <section className={`${commonStyles.sectionContent} ${styles.actionSection}`}>
                        <h2 className={styles.sidebarHeading}>Event Actions</h2>
                        <p className={styles.helperText}>No specific actions available for this event type.</p>
                        <p>This event is for visibility only.</p>
                    </section>
                );
        }
    };

    return (
        <aside className={styles.sidebarColumn}>
            {renderActionContent()}

            {/* Share and Contact Section */}
            <section className={`${commonStyles.sectionContent} ${styles.shareContactSection}`}>
                <h3 className={styles.shareHeading}>Share & Contact</h3>
                <div className={styles.socialShareIcons}>
                    <button className={styles.socialIcon} onClick={() => setShowShareModal(true)}><FaShareAlt /></button>
                    {organizer?.instagramUrl && <a href={organizer.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaInstagram /></a>}
                    {organizer?.twitterUrl && <a href={organizer.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaTwitter /></a>}
                    {organizer?.facebookUrl && <a href={organizer.facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaFacebookF /></a>}
                    {organizer?.contactPhone && <a href={`tel:${organizer.contactPhone}`} className={styles.socialIcon}><FaPhone /></a>}
                    {organizer?.contactEmail && <a href={`mailto:${organizer.contactEmail}`} className={styles.socialIcon}><FaEnvelope /></a>}
                </div>
                <button className={`${commonStyles.btn} ${commonStyles.btnSecondary} ${styles.contactOrganizerButton}`} onClick={() => setShowContactOrganizerModal(true)}>Contact Organizer</button>
            </section>
        </aside>
    );
};

export default EventSidebarActions;