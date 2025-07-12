import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../EventDetailPage.module.css'; // Use parent's CSS module

import {
  FaCalendarAlt, FaMapMarkerAlt, FaLink, FaTag, FaInfoCircle
} from 'react-icons/fa';

const EventHeroSection = ({ event, displayDateFull, displayEndDateFull, displayLocation, showNotification }) => {
  // Assume portrait layout for PC, mobile adapts
  const isPortraitLayout = true; // This will be handled by CSS media queries for mobile

  return (
    <section className={`${styles.eventHeroSection} ${styles.portraitLayout}`}>
      <div className={styles.eventHeroImageWrapper}>
        <img src={event.bannerImageUrl || "https://placehold.co/800x1200/E0E0E0/808080?text=Event+Banner"} alt={event.eventName} className={styles.eventHeroImage} />
      </div>
      <div className={styles.eventHeroContentWrapper}>
        <div className={styles.eventHeroContent}>
          <h1 className={styles.eventHeroTitle}>{event.eventName}</h1>
          <p className={styles.eventHeroMeta}><FaCalendarAlt /> {displayDateFull}{displayEndDateFull}</p>
          <p className={styles.eventHeroMeta}><FaMapMarkerAlt /> {displayLocation}</p>
          {event.eventType === 'online' && event.onlineEventUrl && (
              <p className={styles.eventHeroMeta}><FaLink /> <a href={event.onlineEventUrl} target="_blank" rel="noopener noreferrer" className="text-link">Join Online Event</a></p>
          )}

          {event.eventType === 'ticketed' && (event.isNaksYetuTicketed || true) && (
              <div className={styles.naksYetuBranding}>
                  <img src="https://i.postimg.cc/j5mxTwKr/naks-yetu-final-logo-CIRCLE-01.png" alt="Naks Yetu Logo" />
                  <span>Ticketed by Naks Yetu</span>
              </div>
          )}

          {event.hasCoupons && (
              <p className={styles.couponMessage}><FaTag /> Coupons are available for this event! <FaInfoCircle style={{fontSize: '0.9em', verticalAlign: 'middle'}} title="Look for codes from our influencers to get discounts!" /></p>
          )}
        </div>
        {/* Removed countdown from hero as per previous instructions */}
      </div>
    </section>
  );
};

export default EventHeroSection;