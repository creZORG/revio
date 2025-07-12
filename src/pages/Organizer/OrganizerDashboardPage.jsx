import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { db } from '../../utils/firebaseConfig.js';
import { logoutUser } from '../../services/authService.js';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, onSnapshot } from 'firebase/firestore';

import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import Modal from '../../components/Common/Modal.jsx';

// Import Tab Components
import DashboardOverviewTab from './Dashboard/Tabs/OverviewTab.jsx';
import MyContentTab from './Dashboard/Tabs/MyContentTab.jsx';
import CreateEventTab from './Dashboard/Tabs/CreateEventTab.jsx';
import ProfileTab from './Dashboard/Tabs/ProfileTab.jsx';
import RsvpApplicantsTab from './Dashboard/Tabs/RsvpApplicantsTab.jsx';
import PromotionsTab from './Dashboard/Tabs/PromotionsTab.jsx';
import WalletTab from './Dashboard/Tabs/WalletTab.jsx'; // NEW: Import WalletTab

import {
  FaHome, FaCalendarAlt, FaPlusCircle, FaChartLine,FaTimesCircle, FaUserCircle, FaSignOutAlt, FaMoon, FaSun, FaBars, FaUsers, FaTicketAlt, FaTags,
  FaBell, FaWallet // Added FaWallet icon
} from 'react-icons/fa';

import styles from './organizer.module.css';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const OrganizerDashboardPage = () => {
  const { currentUser, loading: authLoading, isAuthenticated, userRole } = useAuth();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [organizerData, setOrganizerData] = useState(null);
  const [organizerLoading, setOrganizerLoading] = useState(true);
  const [organizerError, setOrganizerError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [totalEventsLive, setTotalEventsLive] = useState(0);
  const [ticketsSoldThisMonth, setTicketsSoldThisMonth] = useState(0);
  const [totalRsvps, setTotalRsvps] = useState(0);

  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // NEW: State for banned/suspended modal
  const [showAccessRestrictedModal, setShowAccessRestrictedModal] = useState(false);
  const [accessRestrictedMessage, setAccessRestrictedMessage] = useState('');
  const [accessRestrictedReason, setAccessRestrictedReason] = useState('');


  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      showNotification('You have been logged out.', 'success');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      showNotification('Failed to log out. Please try again.', 'error');
    }
  }, [showNotification, navigate]);

  const organizerNavItems = [
    { id: 'overview', label: 'Overview', icon: FaHome },
    { id: 'my-events', label: 'My Events', icon: FaCalendarAlt },
    { id: 'create-event', label: 'Create Event', icon: FaPlusCircle },
    { id: 'promotions', label: 'Promotions', icon: FaTags },
    { id: 'wallet', label: 'Wallet', icon: FaWallet }, // NEW: Wallet Tab
    { id: 'rsvp-applicants', label: 'RSVP Applicants', icon: FaUsers },
    { id: 'profile', label: 'My Profile', icon: FaUserCircle },
  ];

  // Fetch and listen for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.uid) return;

    const notificationsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/notifications`);
    const q = query(notificationsRef, where('read', '==', false), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUnreadNotifications(notifications);
      if (notifications.length > 0) {
        showNotification(`You have ${notifications.length} new notifications!`, 'info');
      }
    }, (err) => {
      console.error("Error listening to notifications:", err);
      showNotification("Failed to load notifications.", 'error');
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser, showNotification]);


  useEffect(() => {
    const fetchOrganizerOverviewData = async () => {
      if (!isAuthenticated || !currentUser) {
        setOrganizerLoading(false);
        return;
      }

      setOrganizerLoading(true);
      setOrganizerError(null);

      try {
        const organizerProfileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
        const organizerProfileSnap = await getDoc(organizerProfileRef);

        if (organizerProfileSnap.exists()) {
          const data = organizerProfileSnap.data();
          setOrganizerData(data);

          // NEW: Check organizer status for access restriction
          if (data.status === 'banned' || data.status === 'suspended' || !data.username) {
            let message = '';
            let reason = data.banReason || 'No specific reason provided.';
            if (data.status === 'banned') {
              message = 'Your organizer account has been banned.';
            } else if (data.status === 'suspended') {
              message = 'Your organizer account has been suspended.';
            } else if (!data.username) {
              message = 'Please set up your unique username to access the dashboard.';
              reason = 'Username not set.';
            }
            setAccessRestrictedMessage(message);
            setAccessRestrictedReason(reason);
            setShowAccessRestrictedModal(true);
            showNotification(message, 'error');
            return; // Stop loading dashboard content
          }

        } else {
          // If no profile, it might be a new user. Default to pending.
          setOrganizerData({ email: currentUser.email, displayName: currentUser.displayName || currentUser.email.split('@')[0], organizerStatus: 'pending' });
          // For new organizers, if username is not set, they will be prompted by ProfileTab
        }

        // Fetch counts for overview cards (only if not restricted)
        const eventsRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
        const qEvents = query(eventsRef, where("organizerId", "==", currentUser.uid));
        const eventsSnap = await getDocs(qEvents);
        setTotalEventsLive(eventsSnap.size);

        setTicketsSoldThisMonth(1245); // Mock
        setTotalRsvps(320); // Mock

      } catch (err) {
        console.error("Error fetching organizer overview data from Firestore:", err);
        setOrganizerError("Failed to load organizer dashboard data. Please try again.");
        setTotalEventsLive(0);
        setTicketsSoldThisMonth(0);
        setTotalRsvps(0);
      } finally {
        setOrganizerLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && userRole === 'organizer') {
      fetchOrganizerOverviewData();
    }
  }, [authLoading, isAuthenticated, currentUser, userRole, showNotification]);


  const renderSectionContent = () => {
    // NEW: Check if access is restricted
    if (organizerData?.status === 'banned' || organizerData?.status === 'suspended' || !organizerData?.username) {
      return (
        <div className="section-content" style={{ textAlign: 'center', padding: '50px' }}>
          <h3 className={styles.sectionTitle} style={{color: 'var(--sys-error)'}}>Access Restricted</h3>
          <p className="text-naks-text-secondary">{accessRestrictedMessage}</p>
          {accessRestrictedReason && <p className="text-naks-text-secondary">Reason: {accessRestrictedReason}</p>}
          <p className="text-naks-text-secondary" style={{marginTop: '20px'}}>
            Please contact support if you believe this is a mistake.
          </p>
          <button onClick={handleLogout} className="btn btn-primary" style={{marginTop: '30px'}}>Logout</button>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return <DashboardOverviewTab
                   totalEventsLive={totalEventsLive}
                   ticketsSoldThisMonth={ticketsSoldThisMonth}
                   totalRsvps={totalRsvps}
                   tabDataLoading={organizerLoading}
                   setActiveSection={setActiveSection}
                 />;
      case 'my-events':
        return <MyContentTab currentUser={currentUser} showNotification={showNotification} />;
      case 'create-event':
        return <CreateEventTab currentUser={currentUser} showNotification={showNotification} />;
      case 'promotions':
        return <PromotionsTab currentUser={currentUser} showNotification={showNotification} />;
      case 'wallet': // NEW: Render WalletTab
        return <WalletTab currentUser={currentUser} organizerData={organizerData} showNotification={showNotification} />;
      case 'rsvp-applicants':
        return <RsvpApplicantsTab currentUser={currentUser} showNotification={showNotification} />;
      case 'profile':
        return <ProfileTab currentUser={currentUser} organizerData={organizerData} showNotification={showNotification} />;
      default:
        return <DashboardOverviewTab
                   totalEventsLive={totalEventsLive}
                   ticketsSoldThisMonth={ticketsSoldThisMonth}
                   totalRsvps={totalRsvps}
                   tabDataLoading={organizerLoading}
                   setActiveSection={setActiveSection}
                 />;
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showNotification('Please log in to access the organizer dashboard.', 'info');
      navigate('/auth', { replace: true });
    } else if (!authLoading && isAuthenticated && userRole !== 'organizer') {
      showNotification('You do not have permission to access the organizer dashboard.', 'error');
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, userRole, navigate, showNotification]);


  if (authLoading || organizerLoading) {
    return (
      <div className={styles.organizerDashboardContainer}>
        <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Organizer Dashboard</h3>
            <button className={styles.sidebarToggleBtn} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <FaBars />
            </button>
          </div>
          <nav className={styles.sidebarNav}>
            <ul>
              {organizerNavItems.map((item, i) => (
                <li key={item.id || i}>
                  <LoadingSkeleton width="90%" height="30px" style={{backgroundColor: 'var(--naks-gray-100)', borderRadius: '8px'}} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className={styles.mainContent} style={{marginLeft: isSidebarCollapsed ? '80px' : '250px'}}>
          <header className={styles.topBar}>
            <h2 id="current-section-title">{organizerNavItems.find(item => item.id === activeSection)?.label || 'Loading...'}</h2>
            <div className={styles.topBarActions}>
              <LoadingSkeleton width="40px" height="40px" style={{borderRadius: '50%'}} />
              <LoadingSkeleton width="100px" height="20px" />
            </div>
          </header>
          <section className={styles.dashboardSections}>
            <div className="profile-section-card">
              <LoadingSkeleton width="100%" height="300px" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'organizer') {
    return null;
  }

  return (
    <div className={styles.organizerDashboardContainer}>
      {/* Organizer Dashboard Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>DASH</h3>
          <button className={styles.sidebarToggleBtn} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <FaBars />
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            {organizerNavItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={item.action ? item.action : () => setActiveSection(item.id)}
                  className={`${activeSection === item.id ? styles.active : ''}`}
                  // Disable navigation if access is restricted
                  disabled={organizerData?.status === 'banned' || organizerData?.status === 'suspended' || !organizerData?.username}
                >
                  {item.icon && <item.icon />} <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button onClick={handleLogout} className={activeSection === 'logout' ? styles.active : ''}>
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

      {/* Organizer Dashboard Main Content */}
      <main className={styles.mainContent} style={{marginLeft: isSidebarCollapsed ? '80px' : '250px'}}>
        <header className={styles.topBar}>
          <h2 id="current-section-title">
            {organizerNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
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
              <img src={organizerData?.avatarUrl || `https://placehold.co/40x40/${theme === 'dark' ? '333333' : 'FF4500'}/FFFFFF?text=${organizerData?.displayName ? organizerData.displayName.charAt(0).toUpperCase() : 'O'}`} alt="Organizer Avatar" className={styles.userAvatar} />
              <span className={styles.userName}>{organizerData?.displayName || currentUser?.email}</span>
            </div>
          </div>
        </header>

        <section id="dashboard-sections" className={styles.dashboardSections}>
          {organizerError && (
            <div className="error-message-box">
              <p className="font-semibold">{organizerError}</p>
              <p className="text-sm">Please check your internet connection or Firebase rules.</p>
            </div>
          )}
          {renderSectionContent()}
        </section>
      </main>

      {/* Notifications Modal */}
      <Modal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} title="Notifications">
        <div className={styles.notificationsModalContent}>
          {unreadNotifications.length === 0 ? (
            <p className="text-naks-text-secondary" style={{textAlign: 'center'}}>No unread notifications.</p>
          ) : (
            <ul className={styles.notificationList}>
              {unreadNotifications.map(notification => (
                <li key={notification.id} className={styles.notificationItem}>
                  <div className={styles.notificationIcon} style={{color: notification.type === 'error' ? 'var(--naks-error)' : notification.type === 'warning' ? 'var(--naks-warning)' : 'var(--naks-info)'}}>
                    {notification.type === 'error' ? <FaTimesCircle /> : notification.type === 'warning' ? <FaInfoCircle /> : <FaInfoCircle />}
                  </div>
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    <span className={styles.notificationTime}>{notification.createdAt?.toDate().toLocaleString()}</span>
                    {notification.link && (
                      <Link to={notification.link} onClick={() => { markNotificationAsRead(notification.id); setShowNotificationsModal(false); }} className={styles.notificationLink}>View Details</Link>
                    )}
                  </div>
                  <button onClick={() => markNotificationAsRead(notification.id)} className={styles.markReadButton}>Mark as Read</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {/* NEW: Access Restricted Modal (for banned/suspended/username not set) */}
      <Modal isOpen={showAccessRestrictedModal} onClose={() => { /* Prevent closing if banned/suspended */ if (organizerData?.status !== 'banned' && organizerData?.status !== 'suspended') setShowAccessRestrictedModal(false); }} title="Access Restricted">
        <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <FaTimesCircle style={{ fontSize: '3rem', color: 'var(--sys-error)', marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--naks-text-primary)', marginBottom: '10px' }}>{accessRestrictedMessage}</h3>
          {accessRestrictedReason && <p style={{ color: 'var(--naks-text-secondary)' }}>Reason: {accessRestrictedReason}</p>}
          <p style={{ color: 'var(--naks-text-secondary)', marginTop: '20px' }}>
            Please contact support if you believe this is a mistake or need assistance.
          </p>
          <button onClick={handleLogout} className="btn btn-primary" style={{ marginTop: '30px' }}>Logout</button>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizerDashboardPage;