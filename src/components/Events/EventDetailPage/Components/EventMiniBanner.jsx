// /src/components/Events/EventDetailPage/Components/EventMiniBanner.jsx
import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

import miniBannerStyles from './EventMiniBanner.module.css'; // Dedicated CSS for mini banner

const EventMiniBanner = ({ event, displayLocation, displayDateFull }) => {
    return (
        <div className={miniBannerStyles.miniBannerContainer}>
            <div className={miniBannerStyles.miniBannerImageWrapper}>
                <img 
                    src={event.bannerImageUrl || 'https://placehold.co/400x600/E0E0E0/808080?text=Event+Banner'} 
                    alt={event.eventName} 
                    className={miniBannerStyles.miniBannerImage} 
                />
            </div>
            <div className={miniBannerStyles.miniBannerInfo}>
                <h1 className={miniBannerStyles.miniBannerTitle}>{event.eventName}</h1>
                <p className={miniBannerStyles.miniBannerMeta}>
                    <FaMapMarkerAlt /> {displayLocation}
                </p>
                <p className={miniBannerStyles.miniBannerMeta}>
                    <FaCalendarAlt /> {displayDateFull}
                </p>
            </div>
        </div>
    );
};

export default EventMiniBanner;