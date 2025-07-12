import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import { FaCalendarAlt, FaTicketAlt, FaUsers, FaEye,FaHeart, FaPlusCircle, FaEdit, FaChartBar, FaGift, FaCreditCard, FaCheckCircle } from 'react-icons/fa'; // Added more icons

import styles from './overview.module.css'; // NEW: Import dedicated CSS module
import organizerStyles from '../../organizer.module.css'; // For shared wizard-related styles if needed, or general dashboard styles

const OverviewTab = ({ totalEventsLive, ticketsSoldThisMonth, totalRsvps, tabDataLoading, setActiveSection }) => {
  // Mock data for Recent Activity, as per mockup. In real app, fetch from Firestore.
  const recentActivity = [
    { id: 1, text: "Purchased ticket for 'Nairobi Rhythm Fest'.", icon: FaTicketAlt, color: 'var(--naks-secondary)' },
    { id: 2, text: "Rated 'Modern African Art Showcase' 5 stars.", icon: FaChartBar, color: 'var(--naks-primary)' },
    { id: 3, text: "Favorited 'Laugh Out Loud Comedy Night'.", icon: FaHeart, color: 'var(--naks-secondary)' },
    { id: 4, text: "Downloaded ticket for 'Tech Summit 2025'.", icon: FaTicketAlt, color: 'var(--naks-primary)' },
  ];

  return (
    <div id="overview-section" className={`${organizerStyles.formSection} ${styles.overviewSection}`}> {/* Use formSection from organizer.module.css and overviewSection from its own module */}
      <h3 className={styles.overviewTitle}>Your Performance At A Glance</h3>
      <div className={styles.summaryGrid}>
        {tabDataLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className={styles.summaryCard}>
              <LoadingSkeleton width="36px" height="36px" style={{borderRadius: '50%', marginBottom: '5px'}} />
              <LoadingSkeleton width="60px" height="24px" style={{marginBottom: '2px'}} />
              <LoadingSkeleton width="90px" height="14px" />
            </div>
          ))
        ) : (
          <>
            <div className={styles.summaryCard}>
              <FaCalendarAlt className={styles.cardIcon} style={{color: 'var(--naks-primary)'}} />
              <span className={styles.cardValue}>{totalEventsLive}</span>
              <span className={styles.cardLabel}>Total Events Live</span>
            </div>
            <div className={styles.summaryCard}>
              <FaTicketAlt className={`${styles.cardIcon} ${styles.pink}`} /> {/* Use pink class */}
              <span className={styles.cardValue}>{ticketsSoldThisMonth.toLocaleString()}</span>
              <span className={styles.cardLabel}>Tickets Sold This Month</span>
            </div>
            <div className={styles.summaryCard}>
              <FaUsers className={`${styles.cardIcon} ${styles.blue}`} /> {/* Use blue class */}
              <span className={styles.cardValue}>{totalRsvps.toLocaleString()}</span>
              <span className={styles.cardLabel}>Total RSVPs</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.quickActionsSection}>
        <h3 className={styles.overviewTitle}>Quick Actions</h3>
        <div className={styles.quickActionsGrid}>
          <button className={styles.actionCard} onClick={() => setActiveSection('create-event')}>
            <FaPlusCircle className={styles.cardIcon} style={{color: 'var(--naks-secondary)'}} />
            <h4 className={styles.chooserTitle}>Create New Event</h4>
            <p className={styles.chooserDescription}>Start listing your next amazing event.</p>
          </button>
          <button className={styles.actionCard} onClick={() => setActiveSection('my-events')}>
            <FaEdit className={styles.cardIcon} style={{color: 'var(--naks-primary)'}} />
            <h4 className={styles.chooserTitle}>Manage Your Events</h4>
            <p className={styles.chooserDescription}>Edit details, view sales, update status.</p>
          </button>
        </div>
      </div>

      {/* Recent Activity Section (Optional, can be removed if too much for "small overview") */}
      <div className={styles.recentActivitySection}>
        <h3 className={styles.overviewTitle}>Recent Activity</h3>
        {tabDataLoading ? (
            <LoadingSkeleton width="100%" height="100px" />
        ) : (
            <ul className={styles.recentActivityList}>
                {recentActivity.length > 0 ? (
                    recentActivity.map(activity => (
                        <li key={activity.id}>
                            {activity.icon && <activity.icon style={{color: activity.color}} />}
                            {activity.text}
                        </li>
                    ))
                ) : (
                    <li>No recent activity to display.</li>
                )}
            </ul>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;