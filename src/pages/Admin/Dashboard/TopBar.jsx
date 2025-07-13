import React from 'react';
import styles from '../AdminDashboardPage.module.css';
import { FaMoon, FaSun, FaBars } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';

const TopBar = ({ sectionTitle, theme, onToggleTheme, isMobile, onMobileMenuClick }) => {
  const { currentUser, adminLevel } = useAuth();

  return (
    <header className={`${styles.topBar} glassmorphism`}>
      <div className={styles.headerLeft}>
        {isMobile && (
          <button onClick={onMobileMenuClick} className={`${styles.iconBtn} ${styles.mobileMenuBtn}`}>
            <FaBars />
          </button>
        )}
        <h2 className={styles.currentSectionTitle}>{sectionTitle}</h2>
      </div>

      <div className={styles.topBarActions}>
        <button onClick={onToggleTheme} className={styles.iconBtn}>
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
        {!isMobile && currentUser && (
          <div className={styles.userProfile}>
            <img
              src={currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`}
              alt="Admin Avatar"
              className={styles.userAvatar}
            />
            <div className={styles.userInfo}>
                <span className={styles.userName}>{currentUser.displayName || 'Admin'}</span>
                {adminLevel > 0 && (
                    <span className={styles.adminLevelBadge}>Admin Level {adminLevel}</span>
                )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;