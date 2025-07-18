// src/pages/Organizer/OrganizerDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './OrganizerDashboardPage.module.css';
import OrganizerSidebar from './Dashboard/OrganizerSidebar';
import TopBar from './Dashboard/TopBar';
import OverviewTab from './Dashboard/Tabs/OverviewTab';
import MyEventsTab from './Dashboard/Tabs/MyEventsTab';
import CreateEventTab from './Dashboard/Tabs/CreateEventTab';
import PromotionsTab from './Dashboard/Tabs/PromotionsTab';
import WalletTab from './Dashboard/Tabs/WalletTab';
import RsvpApplicantsTab from './Dashboard/Tabs/RsvpApplicantsTab';
import ProfileSettingsTab from './Dashboard/Tabs/ProfileSettingsTab';
import { useAuth } from '../../hooks/useAuth';
import PermissionDenied from '../../components/Common/PermissionDenied'; // Assuming path from previous step

const OrganizerDashboardPage = () => {
  const { currentUser, userRole, loadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // Default active tab
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  // Effect to close sidebar on tab change (for mobile)
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  // Show loading or permission denied if not an organizer
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Check if the user is an organizer
  if (!currentUser || userRole !== 'organizer') {
    return <PermissionDenied />;
  }

  // Function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'my-events':
        return <MyEventsTab />;
      case 'create-event':
        return <CreateEventTab />;
      case 'promotions':
        return <PromotionsTab />;
      case 'wallet':
        return <WalletTab />;
      case 'rsvp-applicants':
        return <RsvpApplicantsTab />;
      case 'my-profile':
        return <ProfileSettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Bar for desktop and mobile */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Sidebar for desktop and mobile */}
      <OrganizerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content area */}
      {/* NEW: Dynamically add a class if sidebar is open */}
      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.mainContentShifted : ''}`}>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default OrganizerDashboardPage;