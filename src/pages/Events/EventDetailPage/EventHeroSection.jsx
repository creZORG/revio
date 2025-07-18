// /src/pages/Events/EventDetailPage/EventHeroSection.jsx
import React, { useState, useEffect } from 'react';
// No need for FaMapMarkerAlt, FaCalendarAlt, FaClock, FaLink, FaTag, FaInfoCircle, FaUserCircle as text/icons are moved
// No need for format from date-fns here as date formatting is done in parent or EventMeta
import styles from './EventHeroSection.module.css'; // Dedicated CSS for Hero Section

const EventHeroSection = ({ event }) => { // Only needs event prop
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (event?.bannerImageUrl) {
            setImageUrl(event.bannerImageUrl); 
        }
    }, [event?.bannerImageUrl]);

    return (
        <section className={styles.heroSection}>
            <img src={imageUrl} alt={event?.eventName || "Event Banner"} className={styles.heroImage} />
            <div className={styles.heroOverlay}>
                {/* No text or icons here anymore */}
            </div>
        </section>
    );
};

export default EventHeroSection;