import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css'; // New CSS module for landing page

const LandingPage = () => {
  return (
    <div className={styles.landingPageContainer}>
      <h1 className={styles.landingTitle}>Welcome to Naks Yetu!</h1>
      <p className={styles.landingSubtitle}>Discover and experience amazing events in Nakuru.</p>
      <div className={styles.landingActions}>
        <Link to="/events" className="btn btn-primary">Explore Events</Link>
        <Link to="/organizer/dashboard" className="btn btn-secondary">For Organizers</Link>
        <Link to="/influencer/dashboard" className="btn btn-secondary">For Influencers</Link>
      </div>
      <p className={styles.landingFooter}>Your ultimate guide to local experiences.</p>
    </div>
  );
};

export default LandingPage;