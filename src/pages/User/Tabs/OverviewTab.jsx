// /src/pages/User/Tabs/OverviewTab.jsx
import React from 'react';
import { FaTicketAlt, FaCalendarCheck, FaHeart, FaUserCircle } from 'react-icons/fa';

import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';

import styles from './OverviewTab.module.css'; // Dedicated CSS for OverviewTab
import commonStyles from '../user.module.css'; // Common User Dashboard styles for sectionContent, sectionTitle

const UserOverviewTab = ({ upcomingTicketsCount, eventsAttendedCount, favoriteEventsCount, userData, tabDataLoading }) => {

    if (tabDataLoading) {
        return (
            <div className={`${commonStyles.sectionContent} ${commonStyles.loadingSection}`}>
                <h3 className={commonStyles.sectionTitle}>Dashboard Overview</h3>
                <div className={styles.statCardsGrid}>
                    {[...Array(4)].map((_, i) => ( // 4 skeleton cards
                        <div key={i} className={styles.statCard}>
                            <LoadingSkeleton width="40px" height="40px" style={{ marginBottom: '10px', borderRadius: '50%' }} />
                            <LoadingSkeleton width="80px" height="30px" />
                            <LoadingSkeleton width="120px" height="20px" />
                        </div>
                    ))}
                </div>
                <LoadingSkeleton width="100%" height="200px" style={{ marginTop: '30px', borderRadius: '15px' }} />
            </div>
        );
    }

    return (
        <div className={commonStyles.sectionContent}>
            <h3 className={commonStyles.sectionTitle}>Dashboard Overview</h3>

            <div className={styles.statCardsGrid}>
                <div className={styles.statCard}>
                    <FaTicketAlt />
                    <h3>{upcomingTicketsCount}</h3>
                    <p>Upcoming Tickets</p>
                </div>
                <div className={styles.statCard}>
                    <FaCalendarCheck />
                    <h3>{eventsAttendedCount}</h3>
                    <p>Events Attended</p>
                </div>
                <div className={styles.statCard}>
                    <FaHeart />
                    <h3>{favoriteEventsCount}</h3>
                    <p>Favorite Events</p>
                </div>
                <div className={styles.statCard}>
                    <FaUserCircle />
                    <h3>{userData?.displayName || userData?.email || 'Guest'}</h3>
                    <p>Welcome!</p>
                </div>
            </div>

            {/* Placeholder for Recent Activity */}
            <h3 className={commonStyles.sectionTitle} style={{ fontSize: '1.5rem', marginTop: '30px' }}>Recent Activity</h3>
            <div className={styles.activityFeed}>
                <p className={styles.noActivityMessage}>No recent activity to display. Start exploring events!</p>
            </div>
        </div>
    );
};

export default UserOverviewTab;