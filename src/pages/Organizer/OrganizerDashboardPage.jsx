import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SetupProfileModal from './SetupProfileModal';
import AccountSuspendedModal from './AccountSuspendedModal';
import styles from './OrganizerDashboard.module.css';
import { FaTachometerAlt, FaPlusCircle, FaCalendarCheck, FaWallet, FaUserCircle } from 'react-icons/fa';

// Placeholder components for the tabs we will build later
const OrganizerOverview = () => <div className={styles.tabContent}><h2>Dashboard Overview</h2><p>Key metrics and upcoming event summaries will be displayed here.</p></div>;
const CreateEventWizard = () => <div className={styles.tabContent}><h2>Event Creation Wizard</h2><p>The high-tech, multi-step event creation form will live here.</p></div>;
const MyEvents = () => <div className={styles.tabContent}><h2>My Events</h2><p>A list of all created events (live, pending, draft) will be managed from this tab.</p></div>;
const Payouts = () => <div className={styles.tabContent}><h2>Payouts & Wallet</h2><p>Organizers can view their earnings and request payouts from this section.</p></div>;
const OrganizerProfile = () => <div className={styles.tabContent}><h2>My Profile</h2><p>Organizers can view and edit their public and private profile information here.</p></div>;


const OrganizerDashboardPage = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser || userRole !== 'organizer') {
      navigate('/auth');
      return;
    }

    // Check 1: Is the user's account suspended or banned?
    if (currentUser.status === 'suspended' || currentUser.status === 'banned') {
      setIsSuspended(true);
      return; // Stop further checks if suspended
    }

    // Check 2: Is the user's profile complete?
    const isProfileComplete = currentUser.isProfileComplete === true;
    setNeedsProfileSetup(!isProfileComplete);

  }, [currentUser, userRole, authLoading, navigate]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <OrganizerOverview />;
      case 'create-event': return <CreateEventWizard />;
      case 'my-events': return <MyEvents />;
      case 'payouts': return <Payouts />;
      case 'profile': return <OrganizerProfile />;
      default: return <OrganizerOverview />;
    }
  };

  if (authLoading || !currentUser) {
    return <div className={styles.fullPageLoader}>Loading Organizer Dashboard...</div>;
  }

  // --- NEW: Render suspension modal if account is restricted ---
  if (isSuspended) {
    return <AccountSuspendedModal />;
  }

  // --- CORRECTED: Render setup modal if profile is incomplete ---
  // It now hides the modal on completion instead of reloading the page.
  if (needsProfileSetup) {
    return <SetupProfileModal user={currentUser} onSetupComplete={() => setNeedsProfileSetup(false)} />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <h1 className={styles.logo}>Naks Yetu</h1>
        <nav className={styles.sidebarNav}>
          <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? styles.active : ''} title="Overview"><FaTachometerAlt /> <span>Overview</span></button>
          <button onClick={() => setActiveTab('my-events')} className={activeTab === 'my-events' ? styles.active : ''} title="My Events"><FaCalendarCheck /> <span>My Events</span></button>
          <button onClick={() => setActiveTab('payouts')} className={activeTab === 'payouts' ? styles.active : ''} title="Payouts"><FaWallet /> <span>Payouts</span></button>
          <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? styles.active : ''} title="My Profile"><FaUserCircle /> <span>My Profile</span></button>
        </nav>
        <button onClick={() => setActiveTab('create-event')} className={styles.createEventBtn}><FaPlusCircle /> <span>Create New Event</span></button>
      </aside>
      <main className={styles.mainContent}>
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default OrganizerDashboardPage;