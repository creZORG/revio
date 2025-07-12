import React from 'react';
import styles from '../../AdminDashboardPage.module.css'; // Re-use main admin dashboard styles

const AnalyticsTab = () => {
  return (
    <div className={styles.tabContainer} style={{ textAlign: 'center', padding: '50px' }}>
      <h2 className={styles.sectionTitle}>Analytics & Reports</h2>
      <p className="text-naks-text-secondary">This section is under development.</p>
      <p className="text-naks-text-secondary">Future updates will include detailed event performance, user demographics, and financial reports.</p>
    </div>
  );
};

export default AnalyticsTab;