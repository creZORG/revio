// /src/pages/User/Dashboard/components/UserDashboardSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaHome, FaTicketAlt, FaCalendarCheck, FaHeart, FaUserCircle, FaCreditCard, FaSignOutAlt, FaBars,FaTimes,
    FaMoon, FaSun, FaBell // NEW: Added FaMoon, FaSun, FaBell for integration
} from 'react-icons/fa';
import styles from './UserDashboardSidebar.module.css'; // Import its own CSS module
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

// Map string icon names to actual React Icon components
const iconMap = {
    FaHome, FaTicketAlt, FaCalendarCheck, FaHeart, FaUserCircle, FaCreditCard, FaSignOutAlt, FaBars,
    FaMoon, FaSun, FaBell
};



const UserDashboardSidebar = ({ isSidebarOpen, setIsSidebarOpen, navItems, activeSection, setActiveSection, handleLogout, isLoading, isDisabled, userData, currentUser, theme, toggleTheme, unreadNotifications, setShowNotificationsModal }) => {
    const userAvatarUrl = userData?.avatarUrl || `https://placehold.co/36x36/${theme === 'dark' ? '333333' : 'FF4500'}/FFFFFF?text=${userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U'}`;
    const userName = userData?.displayName || currentUser?.email;

    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed} glassmorphism`}> {/* Use 'open' and 'closed' classes */}
            <div className={styles.sidebarHeader}>
                {isLoading ? (
                    <div style={{ width: '100%' }}>
                        <div style={{ height: '24px', backgroundColor: 'var(--naks-gray-100)', borderRadius: '4px', marginBottom: '8px' }}></div>
                    </div>
                ) : (
                    <>
                        <h1>Naks Yetu</h1>
                        {/* Mobile close button (FaTimes) */}
                        <button className={styles.sidebarCloseBtn} onClick={() => setIsSidebarOpen(false)}>
                            <FaTimes />
                        </button>
                    </>
                )}
            </div>
            <nav className={styles.sidebarNav}>
                <ul>
                    {/* User Mini Profile Info (Top of Sidebar) */}
                    {isLoading ? (
                        <li className={styles.sidebarProfilePlaceholder}>
                            <LoadingSkeleton width="36px" height="36px" style={{ borderRadius: '50%' }} />
                            {/* No name skeleton here as name is hidden when sidebar is closed */}
                        </li>
                    ) : (
                        <li className={styles.sidebarProfileInfo}>
                            <Link to="/dashboard/profile-settings" className={styles.userMiniProfileLink} onClick={() => { setActiveSection('profile-settings'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
                                <img src={userAvatarUrl} alt="User Avatar" className={styles.userMiniAvatar} />
                                <span className={styles.userMiniName}>{userName}</span> {/* Always rendered, but hidden by CSS when closed */}
                            </Link>
                        </li>
                    )}

                    {/* Navigation Items */}
                    {navItems.map(item => {
                        const IconComponent = iconMap[item.icon];
                        return (
                            <li key={item.id}>
                                {isLoading ? (
                                    <div style={{ width: '100%', padding: '12px 15px' }}>
                                        <LoadingSkeleton width="90%" height="20px" style={{ backgroundColor: 'var(--naks-gray-200)', borderRadius: '8px' }} />
                                    </div>
                                ) : (
                                    <button
                                        onClick={item.isLogout ? handleLogout : () => { setActiveSection(item.id); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
                                        className={`${styles.navButton} ${activeSection === item.id && !item.isLogout ? styles.active : ''}`}
                                        disabled={isDisabled}
                                    >
                                        {IconComponent && <IconComponent className={styles.navIcon} />}
                                        <span className={styles.navLabel}>{item.label}</span> {/* Always rendered, hidden by CSS when closed */}
                                    </button>
                                )}
                            </li>
                        );
                    })}

                    {/* Dark Mode Toggle & Notifications (Bottom of Sidebar) */}
                    <li className={styles.sidebarActionsBottom}>
                        {isLoading ? (
                            <>
                                <LoadingSkeleton width="45px" height="22px" style={{ borderRadius: '50px', marginBottom: '10px' }} />
                                <LoadingSkeleton width="36px" height="36px" style={{ borderRadius: '50%' }} />
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
                            </>
                        )}
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default UserDashboardSidebar;