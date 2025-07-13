import React from 'react';
import styles from '../Tabs/OverviewTab.module.css';

const StatCard = ({ icon, value, label, colorClass }) => {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[colorClass]}`}>
        {icon}
      </div>
      <div className={styles.statDetails}>
        <h3 className={styles.statValue}>{value}</h3>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;