import React, { useState } from 'react';
import styles from '../EventDetailPage.module.css'; // Use parent's CSS module

// Import sub-components for rendering tab content
import TicketPurchaseSection from '../../../components/Events/Details/TicketPurchaseSection.jsx';
import RsvpFormSection from '../../../components/Events/Details/RsvpFormSection.jsx';
import OnlineEventInfo from '../../../components/Events/Details/OnlineEventInfo.jsx';
import FreeEventInfo from '../../../components/Events/Details/FreeEventInfo.jsx';
import NightlifeSpecifics from '../../../components/Events/Details/NightlifeSpecifics.jsx';
import GallerySection from '../../../components/Events/Details/GallerySection.jsx';

import { FaTicketAlt, FaInfoCircle, FaImage, FaFileAlt } from 'react-icons/fa';

const EventMobileTabs = ({ event, organizer, setMpesaAmount, setShowMpesaModal }) => {
  const [activeMobileTab, setActiveMobileTab] = useState('tickets');

  // Render appropriate event action/details component for the main action section
  const renderEventActionComponent = () => {
    if (!event) return null;

    const isNaksYetuTicketedEvent = event.isNaksYetuTicketed || (event.eventType === 'ticketed' && event.ticketTypes && event.ticketTypes.length > 0);

    const isBasicAdminEvent = !isNaksYetuTicketedEvent && (event.eventType === 'free' || event.eventType === 'rsvp' || event.eventType === 'online');

    if (isNaksYetuTicketedEvent) {
        return <TicketPurchaseSection event={event} onProceedToCheckout={(amount) => {setMpesaAmount(amount); setShowMpesaModal(true);}} />;
    } else if (event.eventType === 'rsvp' && !isBasicAdminEvent) {
        return <RsvpFormSection event={event} />;
    } else if (event.eventType === 'online' && !isBasicAdminEvent) {
        return <OnlineEventInfo event={event} />;
    } else if (event.eventType === 'free' && !isBasicAdminEvent) {
        return <FreeEventInfo event={event} />;
    } else if (event.category === 'Nightlife') {
        return <NightlifeSpecifics event={event} />;
    }
    return (
      <div className={styles.sectionContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
        <h2 className={styles.sidebarHeading}>Event Actions</h2>
        <p>No specific actions available for this event type.</p>
        <p>This event is for visibility only.</p>
      </div>
    );
  };

  // Render content for mobile tabs
  const renderTabContent = () => {
    switch (activeMobileTab) {
      case 'tickets':
        return renderEventActionComponent();
      case 'about':
        return (
          <section className={styles.sectionContent}>
            <h2 className={`${styles.sectionTitle} ${styles.gradientText}`}>About This Event</h2>
            <div className={styles.textContent}>
              <p>{event.description}</p>
            </div>
          </section>
        );
      case 'gallery':
        return (
          <GallerySection galleryImages={event.galleryImages} eventName={event.eventName} loading={false} />
        );
      case 'more-info':
        return (
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
        );
      default:
        return (
          <div className={styles.sectionContent} style={{textAlign: 'center', color: 'var(--naks-text-secondary)'}}>
            <p>Select a tab to view content.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.tabsContainer}>
        <nav className={styles.tabNav}>
            <button className={`${styles.tabButton} ${activeMobileTab === 'tickets' ? styles.active : ''}`} onClick={() => setActiveMobileTab('tickets')}>
                <FaTicketAlt /> {event.eventType === 'ticketed' ? 'Tickets' : event.eventType === 'rsvp' ? 'RSVP' : event.eventType === 'online' ? 'Online Info' : 'Free Info'}
            </button>
            <button className={`${styles.tabButton} ${activeMobileTab === 'about' ? styles.active : ''}`} onClick={() => setActiveMobileTab('about')}>
                <FaInfoCircle /> About
            </button>
            <button className={`${styles.tabButton} ${activeMobileTab === 'gallery' ? styles.active : ''}`} onClick={() => setActiveTab('gallery')}> {/* FIX: Use setActiveMobileTab */}
                <FaImage /> Gallery
            </button>
            <button className={`${styles.tabButton} ${activeMobileTab === 'more-info' ? styles.active : ''}`} onClick={() => setActiveMobileTab('more-info')}>
                <FaFileAlt /> More Info
            </button>
        </nav>
        <div className={styles.tabContent}>
            {renderTabContent()}
        </div>
    </div>
  );
};

export default EventMobileTabs;