// /src/pages/User/Dashboard/components/UserDashboardTopBar.jsx
import React from 'react';
import { FaMoon, FaSun, FaBell } from 'react-icons/fa';
import { useTheme } from '../../../../contexts/ThemeContext.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

import styles from './UserDashboardTopBar.module.css'; // Import its own CSS module

const UserDashboardTopBar = ({ currentSectionTitle, userData, currentUser, unreadNotifications, setShowNotificationsModal, isLoading, isDisabled }) => {
    const { theme, toggleTheme } = useTheme();

    const userAvatarUrl = userData?.avatarUrl || `https://placehold.co/40x40/${theme === 'dark' ? '333333' : 'FF4500'}/FFFFFF?text=${userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U'}`;
    const userName = userData?.displayName || currentUser?.email;

    return (
        <header className={`${styles.topBar} glassmorphism`}>
            {isLoading ? (
                <LoadingSkeleton width="200px" height="30px" />
            ) : (
                <h2 id="current-section-title">{currentSectionTitle}</h2>
            )}
            <div className={styles.topBarActions}>
                {isLoading ? (
                    <>
                        <LoadingSkeleton width="36px" height="36px" style={{ borderRadius: '50%' }} />
                        <LoadingSkeleton width="36px" height="36px" style={{ borderRadius: '50%' }} />
                        <LoadingSkeleton width="40px" height="40px" style={{ borderRadius: '50%', marginRight: '8px' }} />
                        <LoadingSkeleton width="100px" height="20px" />
                    </>
                ) : (
                    <>
                        {/* Dark Mode Toggle Button */}
                        <button id="dark-mode-toggle" className={styles.iconBtn} onClick={toggleTheme} disabled={isDisabled}>
                            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        {/* Notification Bell Icon */}
                        <button className={styles.iconBtn} onClick={() => setShowNotificationsModal(true)} disabled={isDisabled}>
                            <FaBell />
                            {unreadNotifications.length > 0 && (
                                <span className={styles.notificationBadge}>{unreadNotifications.length}</span>
                            )}
                        </button>
                        <div className={styles.userProfile}>
                            <img
                                src={userAvatarUrl}
                                alt="User Avatar"
                                className={styles.userAvatar}
                            />
                            <span className={styles.userName}>{userName}</span>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default UserDashboardTopBar;