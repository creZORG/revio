import React from 'react';
import { NavLink } from 'react-router-dom'; // Using NavLink for active styling
import { FaTachometerAlt, FaCalendarAlt, FaChartBar, FaTags, FaWallet, FaCog } from 'react-icons/fa'; // Icons for navigation
import styles from '../OrganizerDashboardPage.module.css'; // Use main dashboard styles

const OrganizerSidebar = ({ activeTab, setActiveTab }) => {
    return (
        <aside className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
                <button
                    className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FaTachometerAlt className={styles.navIcon} />
                    Overview
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === 'my-events' ? styles.active : ''}`}
                    onClick={() => setActiveTab('my-events')}
                >
                    <FaCalendarAlt className={styles.navIcon} />
                    My Events
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === 'sales-analytics' ? styles.active : ''}`}
                    onClick={() => setActiveTab('sales-analytics')}
                >
                    <FaChartBar className={styles.navIcon} />
                    Sales Analytics
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === 'promotions' ? styles.active : ''}`}
                    onClick={() => setActiveTab('promotions')}
                >
                    <FaTags className={styles.navIcon} />
                    Promotions
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === 'wallet' ? styles.active : ''}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    <FaWallet className={styles.navIcon} />
                    Wallet
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === 'profile-settings' ? styles.active : ''}`}
                    onClick={() => setActiveTab('profile-settings')}
                >
                    <FaCog className={styles.navIcon} />
                    Profile Settings
                </button>
            </nav>
        </aside>
    );
};

export default OrganizerSidebar;