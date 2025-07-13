import React from 'react';
import styles from '../AdminDashboardPage.module.css';
import {
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaChartLine,
  FaSignOutAlt,
  FaTimes,
  FaShieldAlt,
  FaPlusSquare,
  FaLink,
  FaChartBar
} from 'react-icons/fa';

const AdminSidebar = ({ isCollapsed, isMobileOpen, activeSection, setActiveSection, onLogout, onToggleCollapse }) => {
  // This is the corrected navigation list with the unified "Content" tab
  const navItems = [
    { id: 'overview', label: 'Overview', icon: FaTachometerAlt },
    { id: 'content', label: 'Content', icon: FaFileAlt }, // <-- The new unified tab
    { id: 'user-management', label: 'Users', icon: FaUsers },
    { id: 'create-content', label: 'Create', icon: FaPlusSquare },
    { id: 'link-creator', label: 'Link Creator', icon: FaLink },
    { id: 'ad-performance', label: 'Ad Performance', icon: FaChartBar },
    { id: 'global-settings', label: 'Settings', icon: FaCog },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'security-audit', label: 'Audit Log', icon: FaShieldAlt },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''} glassmorphism`}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>Naks Yetu</h1>
        <button onClick={onToggleCollapse} className={styles.sidebarToggleBtn}>
           <FaTimes />
        </button>
      </div>
      <nav className={styles.sidebarNav}>
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={activeSection === item.id ? styles.active : ''}
                title={item.label}
              >
                <item.icon /> <span>{item.label}</span>
              </button>
            </li>
          ))}
          <li className={styles.sidebarBottomItem}>
            <button onClick={onLogout} title="Logout">
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;