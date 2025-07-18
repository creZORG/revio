// /src/components/Events/EventDetailPage/EventHeroSection.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHeart, FaShareAlt, FaCalendarPlus, FaEnvelope, FaPhone, FaInstagram, FaTwitter, FaFacebookF, FaChevronRight, FaUser } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import styles from './EventHeroSection.module.css';
import commonStyles from '../EventDetailPage.module.css';

const EventHeroSection = ({
    event,
    organizer,
    displayDateFull,
    displayTimeRange,
    displayLocation,
    handleSaveToggle,
    isSaved,
    setShowShareModal,
    isMobileView,
    isCompactPc = false,
}) => {

    const eventDateTime = event?.startDate instanceof Date ? event.startDate : null;
    const saleStartDate = event?.ticketDetails?.[0]?.salesStartDate instanceof Date ? event.ticketDetails[0].salesStartDate : null;
    
    const calendarDayOfWeek = eventDateTime ? format(eventDateTime, 'EEE').toUpperCase() : 'N/A';
    const calendarDayOfMonth = eventDateTime ? format(eventDateTime, 'dd') : '--';
    const calendarMonth = eventDateTime ? format(eventDateTime, 'MMM').toUpperCase() : '---';

    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const shareDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
                setShowShareDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMobileShareToggle = useCallback((e) => {
        e.stopPropagation();
        setShowShareDropdown(prev => !prev);
    }, []);

    return (
        <section className={`${styles.heroSection} ${isCompactPc ? styles.compactPcLayout : ''}`}>
            {/* Background Image Wrapper for all views */}
            <div className={styles.heroImageWrapper}>
                <img src={event.bannerImageUrl || 'https://placehold.co/1920x1080.png?text=Event+Banner'} alt={event.eventName} className={styles.heroImage} />
                
                {/* PC-only Overlay and Content (Full-size PC) */}
                {!isMobileView && !isCompactPc && (
                    <>
                        <div className={styles.heroOverlay}></div>
                        <div className={styles.heroContentWrapperPC}>
                            {eventDateTime && (
                                <div className={styles.calendarCard}>
                                    <span className={styles.calendarDayOfWeek}>{calendarDayOfWeek}</span>
                                    <span className={styles.calendarDayOfMonth}>{calendarDayOfMonth}</span>
                                    <span className={styles.calendarMonth}>{calendarMonth}</span>
                                </div>
                            )}
                            <h1 className={styles.heroTitlePC}>{event.eventName}</h1>
                            <p className={styles.heroSubtitlePC}>{event.eventDescription}</p>
                            <div className={styles.heroMetaGroupPC}>
                                <p className={styles.heroMetaItemPC}>
                                    <FaCalendarAlt /> <span>{displayDateFull}</span>
                                </p>
                                <p className={styles.heroMetaItemPC}>
                                    <FaClock /> <span>{displayTimeRange}</span>
                                </p>
                                <p className={styles.heroMetaItemPC}>
                                    <FaMapMarkerAlt /> <span>{displayLocation}</span>
                                </p>
                                {organizer && (
                                    <p className={styles.heroMetaItemPC}>
                                        <FaUser /> <span>by {organizer.displayName || organizer.email}</span>
                                    </p>
                                )}
                            </div>
                            <div className={styles.actionButtonsPC}>
                                <button className={styles.actionButtonPC} onClick={handleSaveToggle}>
                                    <FaHeart className={isSaved ? styles.savedIcon : ''} />
                                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                                </button>
                                <button className={styles.actionButtonPC} onClick={() => setShowShareModal(true)}>
                                    <FaShareAlt />
                                    <span>Share</span>
                                </button>
                                <button className={styles.actionButtonPC}>
                                    <FaCalendarPlus />
                                    <span>Calendar</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile-only Info Bar (Below image, not overlaid) */}
            {isMobileView && (
                <div className={`${styles.mobileInfoBar} ${commonStyles.glassmorphism}`}>
                    <div className={styles.mobileInfoBarContent}>
                        <h1 className={styles.mobileEventName}>{event.eventName}</h1>
                        <p className={styles.mobileMetaText}>
                            <FaMapMarkerAlt /> {displayLocation}
                        </p>
                        <p className={styles.mobileMetaText}>
                            <FaCalendarAlt /> {displayDateFull}
                        </p>
                        <p className={styles.mobileMetaText}> {/* Time range added here */}
                            <FaClock /> {displayTimeRange}
                        </p>
                        {organizer && (
                            <Link to={`/events/organizer/${organizer.id}`} className={styles.mobileOrganizerLink}>
                                by {organizer.displayName || organizer.email}
                            </Link>
                        )}
                    </div>
                    <div className={styles.mobileInfoBarActions}>
                        <button className={styles.mobileActionButton} onClick={handleSaveToggle}>
                            <FaHeart className={isSaved ? styles.savedIcon : ''} />
                        </button>
                        <div className={styles.shareDropdownContainer} ref={shareDropdownRef}>
                            <button className={styles.mobileActionButton} onClick={handleMobileShareToggle}>
                                <FaShareAlt />
                            </button>
                            {showShareDropdown && (
                                <div className={styles.shareDropdownContent}>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"><FaFacebookF /> Facebook</a>
                                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out ' + event?.eventName + ' on Naks Yetu!')}`} target="_blank" rel="noopener noreferrer"><FaTwitter /> Twitter</a>
                                    <a href={`whatsapp://send?text=${encodeURIComponent('Check out ' + event?.eventName + ' on Naks Yetu! ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>
                                </div>
                            )}
                        </div>
                        <button className={styles.mobileActionButton}>
                            <FaCalendarPlus />
                        </button>
                    </div>
                </div>
            )}

            {/* NEW: Compact PC Content (for left column) */}
            {!isMobileView && isCompactPc && (
                <div className={styles.compactPcContentWrapper}>
                    <div className={styles.compactPcImageContainer}>
                         <img src={event.bannerImageUrl || 'https://placehold.co/1920x1080.png?text=Event+Banner'} alt={event.eventName} className={styles.compactPcImage} />
                    </div>
                    <div className={styles.compactPcInfo}>
                        <h1 className={styles.compactPcTitle}>{event.eventName}</h1>
                        <p className={styles.compactPcMetaItem}>
                            <FaMapMarkerAlt /> {displayLocation}
                        </p>
                        <p className={styles.compactPcMetaItem}>
                            <FaCalendarAlt /> {displayDateFull}
                        </p>
                        <p className={styles.compactPcMetaItem}>
                            <FaClock /> {displayTimeRange}
                        </p>
                        {organizer && (
                            <p className={styles.compactPcMetaItem}>
                                <FaUser /> by {organizer.displayName || organizer.email}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default EventHeroSection;