// src/pages/Organizer/Dashboard/Tabs/PromotionsTab.jsx
import React, { useState } from 'react';
import styles from './PromotionsTab.module.css'; // Dedicated styles for PromotionsTab
// Reusing form styles from CreateEventWizard for consistent form elements
import commonFormStyles from './CreateEventWizard.module.css'; 
import CouponCreator from '../Forms/Promotions/CouponCreator'; // Coupon creator component
import ShortLinkGenerator from '../Forms/Promotions/ShortLinkGenerator'; // Short link generator component

const PromotionsTab = () => {
  const [activePromotionSection, setActivePromotionSection] = useState('coupons'); // 'coupons' or 'shortlinks'

  // This handler function will confirm clicks
  const handleSectionClick = (section) => {
    console.log(`Promotions Tab: Switching to section: ${section}`);
    setActivePromotionSection(section);
  };

  return (
    <div className={styles.promotionsTabContainer}> {/* Main container for the tab */}
      <h2 className={commonFormStyles.stepTitle}>Promotions</h2> {/* Reusing wizard's title style */}
      <p className={commonFormStyles.formLabel} style={{marginBottom: '2rem'}}>
        Boost your event's reach! Create custom coupons and trackable short links.
      </p>

      {/* Section Navigation Buttons */}
      <div className={styles.sectionNav}>
        <button
          className={`${styles.sectionButton} ${activePromotionSection === 'coupons' ? styles.activeSectionButton : ''}`}
          onClick={() => handleSectionClick('coupons')}
        >
          Create Coupons
        </button>
        <button
          className={`${styles.sectionButton} ${activePromotionSection === 'shortlinks' ? styles.activeSectionButton : ''}`}
          onClick={() => handleSectionClick('shortlinks')}
        >
          Manage Short Links
        </button>
      </div>

      {/* Render Active Section Content */}
      <div className={styles.sectionContent}>
        {activePromotionSection === 'coupons' && <CouponCreator />}
        {activePromotionSection === 'shortlinks' && <ShortLinkGenerator />}
      </div>
    </div>
  );
};

export default PromotionsTab;