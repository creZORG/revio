import React from 'react';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import { FaChartLine, FaChartBar, FaDownload } from 'react-icons/fa'; // Added FaDownload

import styles from '../../organizer.module.css'; // Import the CSS module

const AnalyticsTab = ({ currentUser, showNotification }) => {
  const loading = false;
  const error = null;

  if (loading) {
    return (
      <div className="section-content">
        <h3 className="section-title">Event Analytics</h3>
        <LoadingSkeleton width="100%" height="300px" />
      </div>
    );
  }

  if (error) {
    return <p className="error-message-box">{error}</p>;
  }

  return (
    <div className="section-content">
      <h3 className="section-title">Event Analytics</h3>
      <p className="text-naks-text-secondary">Visualizations and data will appear here to show your event performance.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="stat-card">
              <i className="fas fa-chart-bar text-naks-primary"></i>
              <h3>65%</h3>
              <p>Average Ticket Sell-Through</p>
          </div>
          <div className="stat-card">
              <i className="fas fa-users-viewfinder text-naks-info"></i> {/* Using FaUsersViewfinder as it's in the mockup */}
              <h3>4,500</h3>
              <p>Total Event Views</p>
          </div>
      </div>
      <div className="profile-section-card mt-8">
        <h3>Detailed Reports</h3>
        <p className="text-naks-text-secondary">Coming soon: Downloadable reports, custom date ranges, and more in-depth analytics.</p>
        <button className="btn btn-secondary mt-4"><FaDownload /> Generate Report</button>
      </div>
    </div>
  );
};

export default AnalyticsTab;