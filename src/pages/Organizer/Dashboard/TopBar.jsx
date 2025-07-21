import React from 'react';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
// CRITICAL FIX: Use the correct path for OrganizerDashboardPage.module.css
import styles from '../OrganizerDashboardPage.module.css'; // Corrected path: one level up
import mobileNavStyles from './MobileNav.module.css';

const TopBar = ({ setActiveTab, isMobile }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    return (
        <header className={styles.topBar}> {/* Use styles from OrganizerDashboardPage.module.css */}
            {isMobile && (
                <button className={mobileNavStyles.menuButton} onClick={toggleMobileSidebar}>
                    <FaBars />
                </button>
            )}
            <div className={styles.topBarTitle}>Organizer Dashboard</div>
            <div className={styles.topBarActions}>
                <button className={styles.actionButton}>
                    <FaBell />
                </button>
                <button className={styles.actionButton}>
                    <FaUserCircle />
                </button>
            </div>

            {isMobile && isMobileSidebarOpen && (
                <div className={mobileNavStyles.mobileSidebarOverlay} onClick={toggleMobileSidebar}>
                    <aside className={mobileNavStyles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
                        <nav className={mobileNavStyles.mobileSidebarNav}>
                            <button className={mobileNavStyles.navItem} onClick={() => { setActiveTab('overview'); toggleMobileSidebar(); }}>Overview</button>
                            <button className={mobileNavStyles.navItem} onClick={() => { setActiveTab('my-events'); toggleMobileSidebar(); }}>My Events</button>
                            <button className={mobileNavStyles.navItem} onClick={() => { setActiveTab('sales-analytics'); toggleMobileSidebar(); }}>Sales Analytics</button>
                            <button className={mobileNavStyles.navItem} onClick={() => { setActiveTab('promotions'); toggleMobileSidebar(); }}>Promotions</button>
                            <button className={mobileNavStyles.navItem} onClick={() => { setActiveTab('wallet'); toggleMobileSidebar(); }}>Wallet</button>
                            <button className={mobileNavStyles.navItem} onClick={() => { setActiveTab('profile-settings'); toggleMobileSidebar(); }}>Profile Settings</button>
                        </nav>
                    </aside>
                </div>
            )}
        </header>
    );
};

export default TopBar;