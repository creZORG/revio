import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import { FaTicketAlt, FaCalendarCheck, FaHeart, FaCheckCircle, FaStar } from 'react-icons/fa';

import styles from '../user.module.css'; // NEW: Import the CSS module

const OverviewTab = ({ upcomingTicketsCount, eventsAttendedCount, favoriteEventsCount, profileData, tabDataLoading }) => {
  return (
    <div>
      <h2>Welcome, {profileData?.displayName || 'User'}!</h2>
      <div className={styles.overviewSummaryGrid}> {/* Use styles.overviewSummaryGrid */}
        {tabDataLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className={styles.summaryCard}> {/* Use styles.summaryCard */}
              <LoadingSkeleton width="40px" height="40px" className="rounded-full mb-3" style={{backgroundColor: 'var(--background-color)'}} />
              <LoadingSkeleton width="60px" height="30px" className="mb-1" style={{backgroundColor: 'var(--background-color)'}} />
              <LoadingSkeleton width="90px" height="16px" style={{backgroundColor: 'var(--background-color)'}} />
            </div>
          ))
        ) : (
          <>
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}><FaTicketAlt /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{upcomingTicketsCount}</span>
                <span className={styles.cardLabel}>Upcoming Tickets</span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}><FaCalendarCheck style={{color: 'var(--naks-orange-logo)'}} /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{eventsAttendedCount}</span>
                <span className={styles.cardLabel}>Events Attended</span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.cardIcon}><FaHeart /></div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>{favoriteEventsCount}</span>
                <span className={styles.cardLabel}>Favorite Events</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="profile-section-card"> {/* This is a global class, keep as is */}
        <h3>Recent Activity</h3>
        {tabDataLoading ? (
            <LoadingSkeleton width="100%" height="100px" style={{backgroundColor: 'var(--background-color)'}} />
        ) : (
            <ul className={styles.activityList}> {/* Use styles.activityList */}
                {upcomingTicketsCount === 0 && eventsAttendedCount === 0 && favoriteEventsCount === 0 ? (
                  <p>No recent activity to display.</p>
                ) : (
                  <>
                    {upcomingTicketsCount > 0 && <li><FaCheckCircle /> You have {upcomingTicketsCount} upcoming tickets.</li>}
                    {eventsAttendedCount > 0 && <li><FaCalendarCheck style={{color: 'var(--naks-orange-logo)'}} /> You have attended {eventsAttendedCount} events.</li>}
                    {favoriteEventsCount > 0 && <li><FaHeart /> You have {favoriteEventsCount} favorite events.</li>}
                  </>
                )}
            </ul>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;