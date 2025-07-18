// /src/components/Events/EventDetailPage/EventMobileTabs.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaInfoCircle, FaImage, FaFileAlt, FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram, FaPhone, FaEnvelope, FaUserCircle } from 'react-icons/fa'; // Added FaUserCircle

import styles from './EventMobileTabs.module.css';
import commonStyles from '../EventDetailPage.module.css';

// Import placeholder sub-components for tab content
import TicketPurchaseSection from './Components/TicketPurchaseSection.jsx';
import GallerySection from './Components/GallerySection.jsx';
import RsvpFormSection from './Components/RsvpFormSection.jsx';
import OnlineEventInfo from './Components/OnlineEventInfo.jsx';
import FreeEventInfo from './Components/FreeEventInfo.jsx'; // CORRECTED PATH: Removed extra 'Components/'
import NightlifeSpecifics from './Components/NightlifeSpecifics.jsx';









const EventMobileTabs = ({
    event,
    organizer,
    onProceedToCheckout,
    setShowShareModal,
    setShowContactOrganizerModal,
    isProcessingMpesa,
    mpesaError,
    setMpesaAmount,
    setMpesaPhoneNumber,
    mpesaPhoneNumber,
    isPcViewTabs = false, // NEW: Prop to indicate PC view for tabs
}) => {
    // Active tab state is managed here, allowing it to control both mobile and PC tabs
    const [activeTab, setActiveTab] = useState('tickets');

    // Render appropriate event action/details component for the main action section
    const renderEventActionComponent = () => {
        if (!event) return null;

        switch (event.eventType) {
            case 'ticketed':
                return (
                    <TicketPurchaseSection
                        event={event}
                        onProceedToCheckout={onProceedToCheckout}
                        isProcessingMpesa={isProcessingMpesa}
                        mpesaError={mpesaError}
                        setMpesaAmount={setMpesaAmount}
                        setMpesaPhoneNumber={setMpesaPhoneNumber}
                        mpesaPhoneNumber={mpesaPhoneNumber}
                    />
                );
            case 'rsvp':
                return <RsvpFormSection event={event} />;
            case 'free':
                return <FreeEventInfo event={event} />;
            case 'online':
                return <OnlineEventInfo event={event} />;
            case 'nightlife':
                return <NightlifeSpecifics event={event} />;
            default:
                return (
                    <div className={commonStyles.sectionContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
                        <h2 className={styles.sidebarHeading}>Event Actions</h2>
                        <p>No specific actions available for this event type.</p>
                        <p>This event is for visibility only.</p>
                    </div>
                );
        }
    };

    // Render content for mobile/PC tabs based on activeTab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'tickets':
                return renderEventActionComponent();
            case 'about':
                return (
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
                );
            case 'gallery':
                return (
                    <GallerySection galleryImages={event.galleryImages} eventName={event.eventName} loading={false} />
                );
            case 'organizer':
                return (
                    <section className={commonStyles.sectionContent}>
                        <h2 className={`${commonStyles.sectionTitle} ${styles.gradientText}`}>About The Organizer</h2>
                        <div className={styles.organizerInfo}>
                            <img src={organizer?.avatarUrl || "https://placehold.co/80x80/E0E0E0/808080?text=Org"} alt={organizer?.displayName || organizer?.email} className={styles.organizerLogo} />
                            <div className={styles.organizerDetails}>
                                <h3 className={styles.organizerName}>{organizer?.displayName || organizer?.email}</h3>
                                <p className={styles.organizerBio}>{organizer?.organizerBio || 'No bio available.'}</p>
                                <div className={styles.organizerSocialLinks}>
                                    {organizer?.instagramUrl && <a href={organizer.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaInstagram /></a>}
                                    {organizer?.twitterUrl && <a href={organizer.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaTwitter /></a>}
                                    {organizer?.facebookUrl && <a href={organizer.facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.organizerSocialLink}><FaFacebookF /></a>}
                                    {organizer?.contactPhone && <a href={`tel:${organizer.contactPhone}`} className={styles.organizerSocialLink}><FaPhone /></a>}
                                    {organizer?.contactEmail && <a href={`mailto:${organizer.contactEmail}`} className={styles.organizerSocialLink}><FaEnvelope /></a>}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            case 'policies':
                return (
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
                );
            default:
                return (
                    <div className={commonStyles.sectionContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
                        <p>Select a tab to view content.</p>
                    </div>
                );
        }
    };

    return (
        <div className={`${styles.tabsContainer} ${isPcViewTabs ? styles.pcViewTabs : ''}`}> {/* Apply pcViewTabs class for PC styling */}
            <nav className={styles.tabNav}>
                <button className={`${styles.tabButton} ${activeTab === 'tickets' ? styles.active : ''}`} onClick={() => setActiveTab('tickets')}>
                    <FaTicketAlt /> <span>{event.eventType === 'ticketed' ? 'Tickets' : event.eventType === 'rsvp' ? 'RSVP' : event.eventType === 'online' ? 'Online' : 'Free'}</span>
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'about' ? styles.active : ''}`} onClick={() => setActiveTab('about')}>
                    <FaInfoCircle /> <span>About</span>
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'gallery' ? styles.active : ''}`} onClick={() => setActiveTab('gallery')} disabled={!(event.galleryImages && event.galleryImages.length > 0)}>
                    <FaImage /> <span>Gallery</span>
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'organizer' ? styles.active : ''}`} onClick={() => setActiveTab('organizer')}>
                    <FaUserCircle /> <span>Organizer</span>
                </button>
                <button className={`${styles.tabButton} ${activeTab === 'policies' ? styles.active : ''}`} onClick={() => setActiveTab('policies')}>
                    <FaFileAlt /> <span>Policies</span>
                </button>
            </nav>
            <div className={styles.tabContent}>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default EventMobileTabs;