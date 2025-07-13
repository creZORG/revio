import React from 'react';
import styles from './MobileNav.module.css';
import { FaTachometerAlt, FaUsers, FaPlusCircle } from 'react-icons/fa';

const MobileBottomNav = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'user-management', label: 'Users', icon: FaUsers },
    { id: 'overview', label: 'Overview', icon: FaTachometerAlt },
    { id: 'create-content', label: 'Create', icon: FaPlusCircle },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          className={`${styles.navButton} ${activeSection === item.id ? styles.active : ''}`}
        >
          <item.icon className={styles.navIcon} />
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;