// /src/pages/UserDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { db } from '../utils/firebaseConfig.js';
import { logoutUser } from '../services/authService.js'; // Corrected import syntax
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx'; // Corrected import syntax
import { useTheme } from '../contexts/ThemeContext.jsx'; // Corrected import syntax
import Modal from '../components/Common/Modal.jsx'; // Corrected import syntax

// Import User Dashboard-specific components
import UserDashboardSidebar from './User/Dashboard/components/UserDashboardSidebar.jsx';

// Import User Dashboard Tab Components
import UserOverviewTab from './User/Tabs/OverviewTab.jsx';
import MyTicketsTab from './User/Tabs/MyTicketsTab.jsx';
import EventsAttendedTab from './User/Tabs/EventsAttendedTab.jsx';
import MyFavoritesTab from './User/Tabs/MyFavoritesTab.jsx';
import ProfileSettingsTab from './User/Tabs/ProfileSettingsTab.jsx';
import PaymentMethodsTab from './User/Tabs/PaymentMethodsTab.jsx';

import {
  FaTimesCircle, FaInfoCircle, FaHome, FaTicketAlt, FaCalendarCheck, FaHeart, FaUserCircle, FaCreditCard, FaSignOutAlt, FaSpinner, FaBell, FaSun, FaMoon, FaBars
} from 'react-icons/fa';

import styles from './UserDashboardPage.module.css';


const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const UserDashboardPage = () => {
  const { currentUser, loading: authLoading, isAuthenticated, userRole } = useAuth();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  const [upcomingTicketsCount, setUpcomingTicketsCount] = useState(0);
  const [eventsAttendedCount, setEventsAttendedCount] = useState(0);
  const [favoriteEventsCount, setFavoriteEventsCount] = useState(0);
  const [tabDataLoading, setTabDataLoading] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    setUnreadNotifications(prev => prev.filter(n => n.id !== notificationId));
    showNotification('Notification marked as read.', 'info');
  }, [showNotification]);


  useEffect(() => {
    const fetchUserDataAndOverview = async () => {
      if (!isAuthenticated || !currentUser) {
        setUserLoading(false);
        setTabDataLoading(false);
        return;
      }

      setUserLoading(true);
      setUserError(null);
      setTabDataLoading(true);

      try {
        const userProfileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
          const data = userProfileSnap.data();
          setUserData(data);
        } else {
          setUserData({ email: currentUser.email, displayName: currentUser.displayName || currentUser.email.split('@')[0] });
        }

        const bookingsRef = collection(db, `artifacts/${appId}/public/data_for_app/bookings`);
        const qBookings = query(bookingsRef, where("userId", "==", currentUser.uid));
        const bookingsSnap = await getDocs(qBookings);
        setUpcomingTicketsCount(bookingsSnap.size);

        const attendedRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/attended_events`);
        const qAttended = query(attendedRef);
        const attendedSnap = await getDocs(qAttended);
        setEventsAttendedCount(attendedSnap.size);

        const favoritesRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`);
        const qFavorites = query(favoritesRef);
        const favoritesSnap = await getDocs(qFavorites);
        setFavoriteEventsCount(favoritesSnap.size);

        const notificationsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/notifications`);
        const qNotifications = query(notificationsRef, where('read', '==', false), orderBy('createdAt', 'desc'));
        const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUnreadNotifications(notifications);
            if (notifications.length > 0 && !showNotificationsModal) {
                showNotification(`You have ${notifications.length} new notifications!`, 'info');
            }
        }, (err) => {
            console.error("Error listening to notifications:", err);
            showNotification("Failed to load notifications.", 'error');
        });
        return () => unsubscribeNotifications();

      } catch (err) {
        console.error("Error fetching user data or overview data from Firestore:", err);
        setUserError("Failed to load dashboard data. Please try again.");
        setUpcomingTicketsCount(0);
        setEventsAttendedCount(0);
        setFavoriteEventsCount(0);
      } finally {
        setUserLoading(false);
        setTabDataLoading(false);
      }
    };

    if (!authLoading) {
      if (isAuthenticated) {
        fetchUserDataAndOverview();
      } else {
        showNotification('Please log in to access your dashboard.', 'info');
        navigate('/auth', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, currentUser, navigate, showNotification, showNotificationsModal]);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <UserOverviewTab
                  upcomingTicketsCount={upcomingTicketsCount}
                  eventsAttendedCount={eventsAttendedCount}
                  favoriteEventsCount={favoriteEventsCount}
                  userData={userData}
                  tabDataLoading={tabDataLoading}
               />;
      case 'my-tickets':
        return <MyTicketsTab currentUser={currentUser} showNotification={showNotification} tabDataLoading={tabDataLoading} />;
      case 'events-attended':
        return <EventsAttendedTab currentUser={currentUser} showNotification={showNotification} tabDataLoading={tabDataLoading} />;
      case 'my-favorites':
        return <MyFavoritesTab currentUser={currentUser} showNotification={showNotification} tabDataLoading={tabDataLoading} />;
      case 'profile-settings':
        return <ProfileSettingsTab currentUser={currentUser} userData={userData} showNotification={showNotification} />;
      case 'payment-methods':
        return <PaymentMethodsTab currentUser={currentUser} showNotification={showNotification} />;
      default:
        return <UserOverviewTab
                  upcomingTicketsCount={upcomingTicketsCount}
                  eventsAttendedCount={eventsAttendedCount}
                  favoriteEventsCount={favoriteEventsCount}
                  userData={userData}
                  tabDataLoading={tabDataLoading}
               />;
    }
  };

  // Define user nav items for sidebar
  const userNavItems = [
    { id: 'overview', label: 'Overview', icon: 'FaHome' },
    { id: 'my-tickets', label: 'My Tickets', icon: 'FaTicketAlt' },
    { id: 'events-attended', label: 'Events Attended', icon: 'FaCalendarCheck' },
    { id: 'my-favorites', label: 'My Favorites', icon: 'FaHeart' },
    { id: 'profile-settings', label: 'Profile Settings', icon: 'FaUserCircle' },
    { id: 'payment-methods', label: 'Payment Methods', icon: 'FaCreditCard' },
    { id: 'logout', label: 'Logout', icon: 'FaSignOutAlt', action: handleLogout, isLogout: true },
  ];

  // Logic to determine main content margin based on sidebar visibility
  const mainContentClasses = `${styles.mainContent} ${!isSidebarOpen ? styles.sidebarHiddenMargin : ''}`;

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
    // Control mobile overlay visibility
    if (window.innerWidth <= 1024) { // Assuming 1024px is the breakpoint for mobile overlay
        setShowMobileOverlay(prev => !prev);
        document.body.classList.toggle('no-scroll', !isSidebarOpen); // Prevent body scroll when overlay is open
    }
  };

  // Close sidebar and overlay on navigation (for mobile)
  const handleSidebarNavClick = (sectionId) => {
    setActiveTab(sectionId);
    if (window.innerWidth <= 1024) { // Close sidebar if on mobile breakpoint
      setIsSidebarOpen(false);
      setShowMobileOverlay(false);
      document.body.classList.remove('no-scroll');
    }
  };


  // Loading state skeleton for initial render
  if (authLoading || userLoading) {
    return (
      <div className={`${styles.dashboardContainer}`}>
        <UserDashboardSidebar
          isSidebarOpen={isSidebarOpen} // Pass isSidebarOpen
          setIsSidebarOpen={toggleSidebar} // Pass toggle function
          navItems={userNavItems}
          activeSection=""
          setActiveSection={() => {}}
          handleLogout={() => {}}
          isLoading={true}
          isDisabled={true}
          userData={null}
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          unreadNotifications={[]}
          setShowNotificationsModal={() => {}}
        />
        <main className={mainContentClasses}>
          {/* External Mobile Toggle for loading state */}
          <button className={`${styles.mobileToggleBtn} ${!isSidebarOpen ? '' : styles.hidden}`} onClick={toggleSidebar}> {/* Added hidden class when sidebar is open */}
              <FaBars />
          </button>
          <section className={styles.dashboardSections}>
            <div className={`${styles.sectionContent} ${styles.loadingSection}`}>
              <LoadingSkeleton width="100%" height="300px" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Fallback if not authenticated after loading
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--naks-bg-light)', color: 'var(--naks-text-primary)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 'semibold' }}>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <UserDashboardSidebar
        isSidebarOpen={isSidebarOpen} // Pass sidebar state
        setIsSidebarOpen={toggleSidebar} // Pass toggle function
        navItems={userNavItems}
        activeSection={activeTab}
        setActiveSection={handleSidebarNavClick} // Use click handler
        handleLogout={handleLogout}
        isDisabled={false}
        userData={userData}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        unreadNotifications={unreadNotifications}
        setShowNotificationsModal={setShowNotificationsModal}
      />

      {/* Main Content Area */}
      <main className={mainContentClasses}>
        {/* External Toggle Button */}
        <button className={`${styles.mobileToggleBtn} ${isSidebarOpen ? styles.hidden : ''}`} onClick={toggleSidebar}> {/* Added hidden class when sidebar is open */}
            <FaBars />
        </button>

        {/* Mobile Overlay */}
        {showMobileOverlay && <div className={styles.mobileOverlay} onClick={toggleSidebar}></div>}

        <section id="dashboard-sections" className={styles.dashboardSections}>
          {userError && (
            <div className="error-message-box">
              <p className="font-semibold">{userError}</p>
              <p className="text-sm">Please check your internet connection or Firebase rules.</p>
          </div>
          )}

          {renderTabContent()}
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
    </div>
  );
};

export default UserDashboardPage;