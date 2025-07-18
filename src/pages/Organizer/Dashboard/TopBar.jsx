// src/pages/Organizer/Dashboard/TopBar.jsx
import React, { useState, useEffect } from 'react';
import styles from './MobileNav.module.css'; // Contains .topBar (outermost)
import topBarStyles from './TopBar.module.css'; // Contains internal layout for TopBar
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'; // Importing icons
import { useAuth } from '../../../hooks/useAuth'; // To get current user info

const TopBar = ({ activeTab, toggleSidebar }) => {
  const { currentUser } = useAuth();
  const [batteryLevel, setBatteryLevel] = useState(null);

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        return () => {
          battery.removeEventListener('levelchange', updateBattery);
        };
      });
    }
  }, []);

  const organizerDisplayName = currentUser?.displayName || "Organizer Name"; 

  const getTabTitle = (tabId) => {
    switch (tabId) {
      case 'overview': return 'Overview';
      case 'my-events': return 'My Events';
      case 'create-event': return 'Create Event';
      case 'promotions': return 'Promotions';
      case 'wallet': return 'Wallet';
      case 'rsvp-applicants': return 'RSVP Applicants';
      case 'my-profile': return 'My Profile';
      default: return 'Dashboard';
    }
  };

  const currentTabTitle = getTabTitle(activeTab);

  return (
    <header className={styles.topBar}> {/* Main bar styling (centered, rounded) */}
      {/* Desktop Layout - visible only on desktop */}
      <div className={topBarStyles.desktopLayout}>
        <div className={topBarStyles.desktopLeftSection}>
          {/* Sidebar Toggle for Desktop */}
          <button onClick={toggleSidebar} className={topBarStyles.desktopToggleButton}>
            <Bars3Icon className="h-6 w-6" /> 
          </button>
          <h2 className={topBarStyles.tabTitle}>
            {currentTabTitle}
          </h2>
        </div>

        <div className={topBarStyles.desktopCenterSection}>
          <span className={topBarStyles.organizerName}>
            {organizerDisplayName}
          </span>
        </div>

        <div className={topBarStyles.desktopRightSection}>
          {batteryLevel !== null && (
            <div className={topBarStyles.batteryIndicator}>
              <span className="text-sm">{batteryLevel}%</span>
            </div>
          )}
          <div className={topBarStyles.profilePicture}>
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
              />
            ) : (
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <button className={topBarStyles.notificationButton}>
            <BellIcon className="h-6 w-6" />
            <span className={topBarStyles.notificationBadge}>3</span>
          </button>
        </div>
      </div>

      {/* Mobile Layout - visible only on mobile, with centered toggle */}
      <div className={topBarStyles.mobileLayout}>
          {/* NEW: This is the ONLY item in the flexbox center for mobile layout */}
          <button onClick={toggleSidebar} className={topBarStyles.mobileToggleButton}> 
              <Bars3Icon className="h-8 w-8" /> {/* Even larger icon for extreme visibility */}
          </button>
          
          {/* Mobile Right Content (Profile + Notifications) - positioned absolutely */}{/* */}
          <div className={topBarStyles.mobileRightContentAbsolute}> 
              <div className={topBarStyles.profilePicture}>
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                    />
                  ) : (
                    <UserCircleIcon className="h-7 w-7 text-gray-400" /> 
                  )}
              </div>
              <button className={topBarStyles.notificationButton}>
                  <BellIcon className="h-6 w-6" />
                  <span className={topBarStyles.notificationBadge}>3</span>
              </button>
          </div>
      </div>
    </header>
  );
};

export default TopBar;