import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { db } from '../utils/firebaseConfig.js';
import { logoutUser } from '../services/authService.js';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

import LoadingSkeleton from '../components/Common/LoadingSkeleton.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';

// Import Tab Components
import OverviewTab from './User/Tabs/OverviewTab.jsx';
import MyTicketsTab from './User/Tabs/MyTicketsTab.jsx';
import EventsAttendedTab from './User/Tabs/EventsAttendedTab.jsx';
import MyFavoritesTab from './User/Tabs/MyFavoritesTab.jsx';
import ProfileSettingsTab from './User/Tabs/ProfileSettingsTab.jsx';
import PaymentMethodsTab from './User/Tabs/PaymentMethodsTab.jsx';

import { FaTachometerAlt, FaTicketAlt, FaCalendarCheck, FaHeart, FaCog, FaCreditCard, FaSignOutAlt, FaSpinner } from 'react-icons/fa';

import styles from './User/user.module.css'; // NEW: Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const UserDashboardPage = () => {
  const { currentUser, loading: authLoading, isAuthenticated, userRole } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [upcomingTicketsCount, setUpcomingTicketsCount] = useState(0);
  const [eventsAttendedCount, setEventsAttendedCount] = useState(0);
  const [favoriteEventsCount, setFavoriteEventsCount] = useState(0);
  const [tabDataLoading, setTabDataLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchDashboardOverviewData = async () => {
      if (!isAuthenticated || !currentUser) {
        setProfileLoading(false);
        setTabDataLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError(null);
      setTabDataLoading(true);

      try {
        const userProfileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
          const data = userProfileSnap.data();
          setProfileData(data);
        } else {
          setProfileError("User profile not found. Please contact support.");
          setProfileData({ email: currentUser.email, displayName: currentUser.displayName || currentUser.email.split('@')[0] });
        }

        const bookingsRef = collection(db, `artifacts/${appId}/public/bookings`);
        const qBookings = query(bookingsRef, where("userId", "==", currentUser.uid));
        const bookingsSnap = await getDocs(qBookings);
        setUpcomingTicketsCount(bookingsSnap.size);

        const attendedRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/attended_events`);
        const qAttended = query(attendedRef, where("userId", "==", currentUser.uid));
        const attendedSnap = await getDocs(qAttended);
        setEventsAttendedCount(attendedSnap.size);

        const favoritesRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/favorites`);
        const qFavorites = query(favoritesRef, where("userId", "==", currentUser.uid));
        const favoritesSnap = await getDocs(qFavorites);
        setFavoriteEventsCount(favoritesSnap.size);

      } catch (err) {
        console.error("Error fetching dashboard overview data from Firestore:", err);
        setProfileError("Failed to load dashboard overview data. Please try again.");
        setUpcomingTicketsCount(0);
        setEventsAttendedCount(0);
        setFavoriteEventsCount(0);
      } finally {
        setProfileLoading(false);
        setTabDataLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchDashboardOverviewData();
    }
  }, [authLoading, isAuthenticated, currentUser]);


  const handleLogout = async () => {
    try {
      await logoutUser();
      showNotification('You have been logged out.', 'success');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      showNotification('Failed to log out. Please try again.', 'error');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab
                  upcomingTicketsCount={upcomingTicketsCount}
                  eventsAttendedCount={eventsAttendedCount}
                  favoriteEventsCount={favoriteEventsCount}
                  profileData={profileData}
                  tabDataLoading={tabDataLoading}
               />;
      case 'my-tickets':
        return <MyTicketsTab currentUser={currentUser} showNotification={showNotification} tabDataLoading={tabDataLoading} />;
      case 'events-attended':
        return <EventsAttendedTab currentUser={currentUser} showNotification={showNotification} tabDataLoading={tabDataLoading} />;
      case 'my-favorites':
        return <MyFavoritesTab currentUser={currentUser} showNotification={showNotification} tabDataLoading={tabDataLoading} />;
      case 'profile-settings':
        return <ProfileSettingsTab currentUser={currentUser} profileData={profileData} showNotification={showNotification} />;
      case 'payment-methods':
        return <PaymentMethodsTab currentUser={currentUser} showNotification={showNotification} />;
      default:
        return <OverviewTab
                  upcomingTicketsCount={upcomingTicketsCount}
                  eventsAttendedCount={eventsAttendedCount}
                  favoriteEventsCount={favoriteEventsCount}
                  profileData={profileData}
                  tabDataLoading={tabDataLoading}
               />;
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className={`min-h-screen ${styles.userDashboardContainer} p-4 sm:p-6 lg:p-8 font-inter flex flex-col items-center justify-center`}> {/* Use styles.userDashboardContainer */}
        <LoadingSkeleton width="250px" height="40px" className="mb-6" />
        <div className={styles.userDashboardContainer}> {/* Use styles.userDashboardContainer */}
          <div className={styles.userDashboardSidebar}> {/* Use styles.userDashboardSidebar */}
            {Array(7).fill(0).map((_, i) => (
              <LoadingSkeleton key={i} width="90%" height="30px" className="mb-3 rounded-md" style={{backgroundColor: 'var(--secondary-color)'}} />
            ))}
          </div>
          <div className={styles.userDashboardContent}> {/* Use styles.userDashboardContent */}
            <LoadingSkeleton width="70%" height="36px" className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="profile-section-card">
                  <LoadingSkeleton width="50px" height="50px" className="rounded-full mb-3" />
                  <LoadingSkeleton width="70%" height="24px" className="mb-1" />
                  <LoadingSkeleton width="90%" height="16px" />
                </div>
              ))}
            </div>
            <LoadingSkeleton width="100%" height="150px" className="mt-6 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className={`min-h-screen flex justify-center items-center bg-background text-error-message-text font-inter`}>
        <p className="text-xl font-semibold">Please log in to view your profile.</p>
      </div>
    );
  }

  const profileNavItems = [
    { id: 'overview', label: 'Overview', icon: FaTachometerAlt },
    { id: 'my-tickets', label: 'My Tickets', icon: FaTicketAlt },
    { id: 'events-attended', label: 'Events Attended', icon: FaCalendarCheck },
    { id: 'my-favorites', label: 'My Favorites', icon: FaHeart },
    { id: 'profile-settings', label: 'Profile Settings', icon: FaCog },
    { id: 'payment-methods', label: 'Payment', icon: FaCreditCard },
    { id: 'logout', label: 'Logout', icon: FaSignOutAlt, action: handleLogout, isLogout: true },
  ];

  return (
    <div className={styles.userDashboardContainer}> {/* Main container for the dashboard layout */}
      {/* Profile Sidebar */}
      <aside className={styles.userDashboardSidebar}>
        <div className={styles.userDashboardSidebarHeader}> {/* Use styles.userDashboardSidebarHeader */}
          <h3>My Profile</h3>
          <p>{profileData?.email}</p>
        </div>
        <nav className={styles.userDashboardNav}> {/* Use styles.userDashboardNav */}
          <ul>
            {profileNavItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={item.isLogout ? item.action : () => setActiveTab(item.id)}
                  className={`${styles.userDashboardNav} ${item.isLogout ? styles.logoutBtn : ''} ${activeTab === item.id && !item.isLogout ? styles.active : ''}`}
                >
                  <item.icon />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Profile Content */}
      <section className={styles.userDashboardContent}>
        {profileError && (
          <div className="error-message-box">
            <p className="font-semibold">{profileError}</p>
            <p className="text-sm">Please check your internet connection or Firebase rules.</p>
          </div>
        )}

        {renderTabContent()}
      </section>
    </div>
  );
};

export default UserDashboardPage;