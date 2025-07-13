import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';

// Import all components for the dashboard
import AdminSidebar from './Dashboard/AdminSidebar.jsx';
import TopBar from './Dashboard/TopBar.jsx';
import PermissionDenied from './Dashboard/components/PermissionDenied.jsx';
import OverviewTab from './Dashboard/Tabs/OverviewTab.jsx';
import UserManagementTab from './Dashboard/Tabs/UserManagementTab.jsx';
import ContentTab from './Dashboard/Tabs/ContentTab.jsx'; 
import GlobalSettingsTab from './Dashboard/Tabs/GlobalSettingsTab.jsx';
import AnalyticsTab from './Dashboard/Tabs/AnalyticsTab.jsx';
import SecurityAuditTab from './Dashboard/Tabs/SecurityAuditTab.jsx';
import CreateContentTab from './Dashboard/Tabs/CreateContentTab.jsx';
import AdPerformanceTab from './Dashboard/Tabs/AdPerformanceTab.jsx';
import ShortlinkCreatorTab from './Dashboard/Tabs/ShortlinkCreatorTab.jsx';

import styles from './AdminDashboardPage.module.css';
import { FaSpinner } from 'react-icons/fa';

// Custom hook to detect if the screen is mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
};

const AdminDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole, adminLevel, loading: authLoading, signOutUser } = useAuth();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Effect to protect the route
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userRole !== 'admin')) {
      showNotification('You must be an admin to access this page.', 'error');
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, userRole, authLoading, navigate, showNotification]);

  // Logout handler
  const handleLogout = useCallback(() => {
    signOutUser().then(() => {
      showNotification('Logged out successfully!', 'info');
      navigate('/');
    });
  }, [signOutUser, showNotification, navigate]);

  // Function to render the correct tab based on the active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview': return <OverviewTab />;
      case 'content': return <ContentTab />; // <-- NEW UNIFIED TAB
      case 'user-management': return <UserManagementTab />;
      case 'create-content': return <CreateContentTab />;
      case 'link-creator': return <ShortlinkCreatorTab />;
      case 'ad-performance': return <AdPerformanceTab />;
      case 'global-settings': return <GlobalSettingsTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'security-audit': return <SecurityAuditTab />;
      default: return <OverviewTab />;
    }
  };

  // Titles for the top bar corresponding to each section
  const sectionTitles = {
    overview: 'Admin Overview',
    content: 'Content & Moderation', // <-- NEW UNIFIED TITLE
    'user-management': 'User Management',
    'create-content': 'Create Content',
    'link-creator': 'Shortlink Creator',
    'ad-performance': 'Ad Performance',
    'global-settings': 'Global Settings',
    analytics: 'Analytics & Reports',
    'security-audit': 'Security & Audit Log',
  };

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} /> <p>Verifying Permissions...</p>
      </div>
    );
  }

  // Access control check
  if (userRole === 'admin' && adminLevel < 1) {
    return <PermissionDenied />;
  }

  return (
    <div className={`${styles.dashboardContainer} ${isMobile && isSidebarOpen ? styles.mobileSidebarActive : ''}`}>
      <div className={`${styles.mobileOverlay} ${isMobile && isSidebarOpen ? styles.visible : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <AdminSidebar
        isCollapsed={!isSidebarOpen && !isMobile}
        isMobileOpen={isSidebarOpen && isMobile}
        activeSection={activeSection}
        setActiveSection={(section) => {
            setActiveSection(section);
            if (isMobile) setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className={`${styles.mainContent} ${!isSidebarOpen && !isMobile ? styles.collapsed : ''}`}>
        <TopBar
          sectionTitle={sectionTitles[activeSection]}
          theme={theme}
          onToggleTheme={toggleTheme}
          isMobile={isMobile}
          onMobileMenuClick={() => setIsSidebarOpen(true)}
        />
        <section className={styles.dashboardSections}>
          {renderSectionContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;