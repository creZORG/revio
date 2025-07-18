// /src/components/Events/EventDetailPage/Components/EventPCCardHero.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHeart, FaShareAlt, FaCalendarPlus, FaUser, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import styles from './EventPCCardHero.module.css'; // Dedicated CSS for this component
import commonStyles from '../../EventDetailPage.module.css'; // For general section/card styles

const EventPCCardHero = ({
    event,
    organizer,
    displayDateFull,
    displayTimeRange,
    displayLocation,
    handleSaveToggle,
    isSaved,
    setShowShareModal,
}) => {
    // Share dropdown state
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const shareDropdownRef = useRef(null);

    // Close share dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target)) {
                setShowShareDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleShareToggle = useCallback((e) => {
        e.stopPropagation();
        setShowShareDropdown(prev => !prev);
    }, []);

    return (
        <section className={`${styles.pcCardHeroContainer} ${commonStyles.sectionContent}`}> {/* Re-use sectionContent for card styling */}
            <div className={styles.pcCardHeroImageWrapper}>
                <img 
                    src={event.bannerImageUrl || 'https://placehold.co/400x600/E0E0E0/808080?text=Event+Banner'} 
                    alt={event.eventName} 
                    className={styles.pcCardHeroImage} 
                />
            </div>
            <div className={styles.pcCardHeroInfo}>
                <h1 className={styles.pcCardHeroTitle}>{event.eventName}</h1>
                <p className={styles.pcCardHeroMeta}><FaMapMarkerAlt /> {displayLocation}</p>
                <p className={styles.pcCardHeroMeta}><FaCalendarAlt /> {displayDateFull}</p>
                <p className={styles.pcCardHeroMeta}><FaClock /> {displayTimeRange}</p>
                {organizer && (
                    <Link to={`/events/organizer/${organizer.id}`} className={styles.pcCardOrganizerLink}>
                        by {organizer.displayName || organizer.email} <FaChevronRight />
                    </Link>
                )}
            </div>
            <div className={styles.pcCardHeroActions}>
                <button className={styles.pcCardActionButton} onClick={handleSaveToggle}>
                    <FaHeart className={isSaved ? styles.savedIcon : ''} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <div className={styles.shareDropdownContainer} ref={shareDropdownRef}>
                    <button className={styles.pcCardActionButton} onClick={handleShareToggle}>
                        <FaShareAlt />
                        <span>Share</span>
                    </button>
                    {showShareDropdown && (
                        <div className={styles.shareDropdownContent}>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"><FaFacebookF /> Facebook</a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out ' + event?.eventName + ' on Naks Yetu!')}`} target="_blank" rel="noopener noreferrer"><FaTwitter /> Twitter</a>
                            <a href={`whatsapp://send?text=${encodeURIComponent('Check out ' + event?.eventName + ' on Naks Yetu! ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>
                        </div>
                    )}
                </div>
                <button className={styles.pcCardActionButton}>
                    <FaCalendarPlus />
                    <span>Calendar</span>
                </button>
            </div>
        </section>
    );
};

export default EventPCCardHero;