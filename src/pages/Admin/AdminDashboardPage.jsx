import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import Modal from '../../components/Common/Modal.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';
import Button from '../../components/Common/Button.jsx';
// Import Tab Components
import UserManagementTab from './Dashboard/Tabs/UserManagementTab.jsx';
import CreateContentTab from './Dashboard/Tabs/CreateContentTab.jsx';
import GlobalSettingsTab from './Dashboard/Tabs/GlobalSettingsTab.jsx';
import AnalyticsTab from './Dashboard/Tabs/AnalyticsTab.jsx'; // Placeholder

import {
  FaHome, FaUsers, FaPlusCircle, FaCog, FaChartLine, FaSignOutAlt, FaMoon, FaSun, FaBars, FaBell
} from 'react-icons/fa';

import styles from './AdminDashboardPage.module.css'; // Dedicated CSS for AdminDashboardPage

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const AdminDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading, signOutUser } = useAuth();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('user-management');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]); // Placeholder for notifications
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); // Placeholder for notifications modal

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== 'admin')) {
      showNotification('You must be logged in as an admin to access this dashboard.', 'error');
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, userRole, authLoading, navigate, showNotification]);

  const handleLogout = useCallback(async () => {
    try {
      await signOutUser();
      showNotification('Logged out successfully!', 'info');
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      showNotification('Failed to log out.', 'error');
    }
  }, [signOutUser, showNotification, navigate]);

  const adminNavItems = [
    { id: 'user-management', label: 'User Management', icon: FaUsers },
    { id: 'create-content', label: 'Create Content', icon: FaPlusCircle },
    { id: 'global-settings', label: 'Global Settings', icon: FaCog },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'user-management':
        return <UserManagementTab currentUser={currentUser} showNotification={showNotification} />;
      case 'create-content':
        return <CreateContentTab currentUser={currentUser} showNotification={showNotification} />;
      case 'global-settings':
        return <GlobalSettingsTab currentUser={currentUser} showNotification={showNotification} />;
      case 'analytics':
        return <AnalyticsTab currentUser={currentUser} showNotification={showNotification} />;
      default:
        return <UserManagementTab currentUser={currentUser} showNotification={showNotification} />;
    }
  };

  if (authLoading || !isAuthenticated || userRole !== 'admin') {
    return (
      <div className={styles.adminDashboardContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: 'var(--naks-primary)' }} />
        <p style={{ marginLeft: '15px', color: 'var(--naks-text-primary)' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboardContainer}>
      {/* Admin Dashboard Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Admin Panel</h3>
          <button className={styles.sidebarToggleBtn} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <FaBars />
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            {adminNavItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`${activeSection === item.id ? styles.active : ''}`}
                >
                  {item.icon && <item.icon />} <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <FaSignOutAlt /> <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
        {/* Dark Mode Toggle */}
        <div className={styles.themeToggle} onClick={toggleTheme}>
          <div className={styles.toggleThumb}>
            <div className={`${styles.toggleIcon} ${styles.sunIcon} ${theme === 'dark' ? styles.opacity0 : ''}`}><FaSun /></div>
            <div className={`${styles.toggleIcon} ${styles.moonIcon} ${theme === 'dark' ? styles.opacity1 : ''}`}><FaMoon /></div>
            <div className={styles.stars}></div>
          </div>
        </div>
      </aside>

      {/* Admin Dashboard Main Content */}
      <main className={styles.mainContent} style={{ marginLeft: isSidebarCollapsed ? '80px' : '250px' }}>
        <header className={styles.topBar}>
          <h2 id="current-section-title">
            {adminNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
          <div className={styles.topBarActions}>
            {/* Notification Bell Icon */}
            {isAuthenticated && currentUser && (
              <button className={styles.iconBtn} onClick={() => setShowNotificationsModal(true)}>
                <FaBell />
                {unreadNotifications.length > 0 && (
                  <span className={styles.notificationBadge}>{unreadNotifications.length}</span>
                )}
              </button>
            )}
            <div className={styles.userProfile}>
              <img src={currentUser?.photoURL || "https://placehold.co/40x40/FF4500/FFFFFF?text=A"} alt="Admin Avatar" className={styles.userAvatar} />
              <span className={styles.userName}>{currentUser?.displayName || currentUser?.email}</span>
            </div>
          </div>
        </header>

        <section id="dashboard-sections" className={styles.dashboardSections}>
          {renderSectionContent()}
        </section>
      </main>

      {/* Notifications Modal (Placeholder) */}
      <Modal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} title="Admin Notifications">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Notifications will appear here.</p>
          <Button onClick={() => setShowNotificationsModal(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;