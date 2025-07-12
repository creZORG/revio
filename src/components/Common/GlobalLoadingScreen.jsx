import React from 'react';
import styles from './GlobalLoadingScreen.module.css';
import { FaSpinner } from 'react-icons/fa'; // Using FaSpinner for now, can be replaced with custom animation

const GlobalLoadingScreen = () => {
  return (
    <div className={styles.loadingScreenOverlay}>
      <div className={styles.loadingContent}>
        <img src="https://i.postimg.cc/j5mxTwKr/naks-yetu-final-logo-CIRCLE-01.png" alt="Naks Yetu Logo" className={styles.loadingLogo} />
        <h1 className={styles.loadingText}>Loading <span className={styles.naksYetuGradient}>Naks Yetu</span>...</h1>
        <FaSpinner className={`${styles.spinner} ${styles.spin}`} />
        <p className={styles.loadingSubtitle}>Preparing your experience...</p>
      </div>
    </div>
  );
};

export default GlobalLoadingScreen;