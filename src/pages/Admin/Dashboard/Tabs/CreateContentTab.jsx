import React, { useState } from 'react';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import PosterCreatorForm from '../Forms/PosterCreatorForm.jsx';
import CarouselManagerForm from '../Forms/CarouselManagerForm.jsx';

import styles from '../../AdminDashboardPage.module.css'; // Re-use main admin dashboard styles
import createContentTabStyles from './CreateContentTab.module.css'; // NEW: Dedicated CSS for CreateContentTab

import { FaImage, FaFilm } from 'react-icons/fa'; // Icons for sub-tabs

const CreateContentTab = ({ currentUser, showNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState('poster-creator');

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'poster-creator':
        return <PosterCreatorForm currentUser={currentUser} showNotification={showNotification} />;
      case 'carousel-manager':
        return <CarouselManagerForm currentUser={currentUser} showNotification={showNotification} />;
      default:
        return <PosterCreatorForm currentUser={currentUser} showNotification={showNotification} />;
    }
  };

  return (
    <div className={styles.tabContainer}>
      <h2 className={styles.sectionTitle}>Create & Manage Content</h2>

      <div className={createContentTabStyles.subTabNav}> {/* Use dedicated CSS for sub-tabs */}
        <button
          onClick={() => setActiveSubTab('poster-creator')}
          className={`${createContentTabStyles.subTabButton} ${activeSubTab === 'poster-creator' ? createContentTabStyles.active : ''}`}
        >
          <FaImage /> Create Poster
        </button>
        <button
          onClick={() => setActiveSubTab('carousel-manager')}
          className={`${createContentTabStyles.subTabButton} ${activeSubTab === 'carousel-manager' ? createContentTabStyles.active : ''}`}
        >
          <FaFilm /> Manage Carousel
        </button>
      </div>

      <div className={createContentTabStyles.subTabContent}>
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default CreateContentTab;