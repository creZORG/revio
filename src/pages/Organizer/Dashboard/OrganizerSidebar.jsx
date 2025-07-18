// src/pages/Organizer/Dashboard/OrganizerSidebar.jsx
import React from 'react';
import styles from './MobileNav.module.css';
import {
  XMarkIcon,
  HomeIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  GiftIcon,
  WalletIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'; // Importing specific icons

const OrganizerSidebar = ({ activeTab, setActiveTab, isSidebarOpen, toggleSidebar }) => {
  const navItems = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'my-events', name: 'My Events', icon: CalendarDaysIcon },
    { id: 'create-event', name: 'Create Event', icon: PlusCircleIcon },
    { id: 'promotions', name: 'Promotions', icon: GiftIcon },
    { id: 'wallet', name: 'Wallet', icon: WalletIcon },
    { id: 'rsvp-applicants', name: 'RSVP Applicants', icon: UsersIcon, disabled: true },
    { id: 'my-profile', name: 'My Profile', icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay (rendered first for z-index below sidebar) */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          {/* Naks Yetu Title with Gradient */}
          <h2 className={styles.naksYetuTitle}>
            Naks Yetu
          </h2>
          {/* Close button for mobile sidebar */}
          <button onClick={toggleSidebar} className={styles.closeButton}>
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon; // Component for the icon
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeTab === item.id ? styles.activeNavItem : ''} ${item.disabled ? styles.disabledNavItem : ''}`}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
              >
                <Icon className={styles.navItemIcon} />
                <span className={styles.navItemText}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default OrganizerSidebar;