import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useNotification } from '../../../contexts/NotificationContext.jsx';
import { useTheme } from '../../../contexts/ThemeContext.jsx';

import styles from './Navbar.module.css';

import {
  FaHome, FaCalendarAlt, FaMoon, FaSun, FaBars, FaUserCircle, FaBell, FaTags, FaPlusCircle, FaChartLine, FaUsers, FaTicketAlt, FaSignOutAlt
} from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, isAuthenticated, userRole, signOutUser } = useAuth(); // NEW: Get userRole
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]); // Placeholder for notifications

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

  return (
    <nav className={`${styles.navbar} glassmorphism`}>
      <div className={styles.navbarLeft}>
        <div className={styles.logoContainer}>
          <Link to="/events">
  <img
    src="https://platform.naksyetu.co.ke/uploads/asset_68716d04cf3b77.16292801.png"
    alt="Naks Yetu Logo"
    className={styles.logo}
  />
</Link>
          
        </div>
        {/* Mobile Hamburger Menu Toggle */}
        <button className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <FaBars />
        </button>
      </div>

      {/* Nav Links (Desktop & Mobile Overlay) */}
      <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.navItem}>
      
        </div>
        <div className={styles.navItem}>
          <Link to="/events" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
            <FaCalendarAlt /> <span className={styles.navText}>Events</span>
          </Link>
        </div>
        <div className={styles.navItem}>
        
        </div>

        {/* Conditional Dashboard Links based on role */}
        {isAuthenticated && userRole === 'organizer' && (
          <div className={styles.navItem}>
            <Link to="/dashboard/organizer" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}> {/* FIX: Corrected path */}
              <FaUserCircle /> <span className={styles.navText}>Organizer</span>
            </Link>
          </div>
        )}
        {isAuthenticated && userRole === 'influencer' && (
          <div className={styles.navItem}>
            <Link to="/dashboard/influencer" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}> {/* FIX: Corrected path */}
              <FaUsers /> <span className={styles.navText}>Influencer</span>
            </Link>
          </div>
        )}
        {isAuthenticated && userRole === 'admin' && (
          <div className={styles.navItem}>
            <Link to="/admin" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
              <FaChartLine /> <span className={styles.navText}>Admin</span>
            </Link>
          </div>
        )}

        {/* User Account & Notifications */}
        {isAuthenticated ? (
          <>
            <div className={styles.navItem}>
              <button className={styles.iconBtn} onClick={() => showNotification('Notifications coming soon!', 'info')}>
                <FaBell />
                {/* {unreadNotifications.length > 0 && (
                  <span className={styles.notificationBadge}>{unreadNotifications.length}</span>
                )} */}
              </button>
            </div>
            <div className={styles.navItem}>
              <Link to="/dashboard" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}> {/* Link to general user dashboard */}
                <img src={currentUser?.photoURL || "https://placehold.co/40x40/FF4500/FFFFFF?text=U"} alt="Account" className={styles.accountAvatar} />
                <span className={styles.navText}>Dashboard</span> {/* Changed from Account to Dashboard */}
              </Link>
            </div>
            {/* FIX: Removed Logout button from Navbar. It should be in dashboards/profile pages */}
          </>
        ) : (
          <div className={styles.navItem}>
            <Link to="/auth" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}> {/* Link to unified auth page */}
              <FaUserCircle /> <span className={styles.navText}>Login</span>
            </Link>
          </div>
        )}

        {/* Dark Mode Toggle (Last Item) */}
        <div className={styles.themeToggle} onClick={toggleTheme}>
          <div className={styles.toggleThumb}>
            <div className={`${styles.toggleIcon} ${styles.sunIcon} ${theme === 'dark' ? styles.opacity0 : ''}`}><FaSun /></div>
            <div className={`${styles.toggleIcon} ${styles.moonIcon} ${theme === 'dark' ? styles.opacity1 : ''}`}><FaMoon /></div>
            <div className={styles.stars}></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;