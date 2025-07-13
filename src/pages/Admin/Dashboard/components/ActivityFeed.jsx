import React from 'react';
import styles from '../Tabs/OverviewTab.module.css';
import { FaTicketAlt, FaUserPlus, FaCalendarPlus, FaUserTie } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = ({ activities, isLoading }) => {

  const getIcon = (type) => {
    switch (type) {
      case 'sale': return <FaTicketAlt />;
      case 'user': return <FaUserPlus />;
      case 'event': return <FaCalendarPlus />;
      case 'request': return <FaUserTie />;
      default: return <FaTicketAlt />;
    }
  };

  if (isLoading) {
    return <p>Loading activities...</p>;
  }

  if (!activities || activities.length === 0) {
    return <p className={styles.noActivityMessage}>No recent platform activity.</p>;
  }

  return (
    <div className={styles.activityFeed}>
       <h3 className={styles.sectionTitle} style={{ fontSize: '1.5rem' }}>Recent Platform Activity</h3>
      {activities.map(activity => (
        <div key={activity.id} className={styles.activityItem}>
          <span className={`${styles.activityIcon} ${styles[activity.type]}`}>
            {getIcon(activity.type)}
          </span>
          <p className={styles.activityText} dangerouslySetInnerHTML={{ __html: activity.text }} />
          <span className={styles.activityTime}>
            {activity.timestamp ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;