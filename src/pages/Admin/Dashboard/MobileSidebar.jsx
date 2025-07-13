import React from 'react';
import styles from './MobileNav.module.css';
import { FaCog, FaChartLine, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const MobileSidebar = ({ isOpen, setIsOpen, activeSection, setActiveSection, onLogout }) => {
  const navItems = [
    { id: 'global-settings', label: 'Global Settings', icon: FaCog },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
  ];

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`${styles.mobileSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.mobileSidebarHeader}>
          <h3>Menu</h3>
          <button onClick={() => setIsOpen(false)} className={styles.closeButton}><FaTimes /></button>
        </div>
        <nav>
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => handleSectionClick(item.id)}
                  className={activeSection === item.id ? styles.active : ''}
                >
                  <item.icon /> <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button onClick={handleLogoutClick}>
                <FaSignOutAlt /> <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebar;