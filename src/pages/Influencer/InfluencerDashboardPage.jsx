import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton.jsx';
import Modal from '../../components/Common/Modal.jsx';
import SetupUsernameModal from './SetupUsernameModal.jsx'; // Import the new modal

import styles from './InfluencerDashboardPage.module.css';

import { FaSpinner, FaTags, FaLink, FaUsers, FaCalendarAlt, FaDollarSign, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

const InfluencerDashboardPage = () => {
  const { currentUser, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [influencerProfile, setInfluencerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  const [myCoupons, setMyCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [couponsError, setCouponsError] = useState(null);

  // Fetch Influencer Profile and check for username
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !currentUser) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const profileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setInfluencerProfile(data);
          if (!data.username) {
            setShowUsernameSetup(true); // Force username setup if missing
          }
        } else {
          // If no profile, it might be a new user. Prompt for username.
          setInfluencerProfile({ uid: currentUser.uid, email: currentUser.email });
          setShowUsernameSetup(true);
        }
      } catch (err) {
        console.error("Error fetching influencer profile:", err);
        setProfileError("Failed to load profile. Please try again.");
        showNotification("Failed to load profile.", 'error');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, currentUser, authLoading, showNotification]);

  // Fetch Coupons associated with this influencer's username
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!influencerProfile?.username) {
        setLoadingCoupons(false);
        setMyCoupons([]);
        return;
      }
      setLoadingCoupons(true);
      setCouponsError(null);
      try {
        const q = query(
          collection(db, `artifacts/${appId}/public/coupons`),
          where('attachedInfluencerId', '==', influencerProfile.username),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedCoupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyCoupons(fetchedCoupons);
      } catch (err) {
        console.error("Error fetching influencer coupons:", err);
        setCouponsError("Failed to load your coupons.");
        showNotification("Failed to load coupons.", 'error');
      } finally {
        setLoadingCoupons(false);
      }
    };

    if (influencerProfile?.username) {
      fetchCoupons();
    }
  }, [influencerProfile?.username, showNotification]);

  // Handle successful username setup
  const onUsernameSetupSuccess = useCallback((username) => {
    setInfluencerProfile(prev => ({ ...prev, username }));
    setShowUsernameSetup(false);
    showNotification(`Username '${username}' set successfully!`, 'success');
    // Re-fetch coupons now that username is available
    // This will be triggered by the useEffect dependency on influencerProfile.username
  }, [showNotification]);


  if (authLoading || loadingProfile) {
    return (
      <div className={styles.dashboardContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <FaSpinner className="spinner" style={{ fontSize: '3rem', color: 'var(--naks-primary)' }} />
        <p style={{ marginLeft: '15px', color: 'var(--naks-text-primary)' }}>Loading Influencer Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'influencer') {
    showNotification('You must be logged in as an influencer to access this portal.', 'error');
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Influencer Portal</h1>

      {profileError && (
        <div className="error-message-box">
          <p>{profileError}</p>
        </div>
      )}

      {/* Username Setup Modal */}
      <Modal isOpen={showUsernameSetup} onClose={() => {}} title="Set Your Influencer Username">
        <SetupUsernameModal onSetupSuccess={onUsernameSetupSuccess} currentUser={currentUser} />
      </Modal>

      {!influencerProfile?.username ? (
        <div className={styles.emptyState}>
          <FaInfoCircle className={styles.emptyIcon} />
          <p>Please set up your unique influencer username to access your dashboard.</p>
          <button onClick={() => setShowUsernameSetup(true)} className="btn btn-primary">Set Username Now</button>
        </div>
      ) : (
        <>
          <div className={styles.profileSummaryCard}>
            <h2 className={styles.profileHeading}>Welcome, {influencerProfile.displayName || influencerProfile.username}!</h2>
            <p className={styles.profileDetail}>Your Influencer Username: <strong>{influencerProfile.username}</strong></p>
            <p className={styles.profileDetail}>Email: {influencerProfile.email}</p>
            <p className={styles.profileDetail}>Role: {influencerProfile.role}</p>
          </div>

          <h2 className={styles.sectionHeading}><FaTags /> Your Coupons</h2>
          {loadingCoupons ? (
            <LoadingSkeleton width="100%" height="200px" />
          ) : couponsError ? (
            <div className="error-message-box"><p>{couponsError}</p></div>
          ) : myCoupons.length === 0 ? (
            <div className={styles.emptyState}>
              <FaInfoCircle className={styles.emptyIcon} />
              <p>No coupons found attached to your username.</p>
              <p>Organizers can attach coupons to your unique username: <strong>{influencerProfile.username}</strong></p>
            </div>
          ) : (
            <div className={styles.couponListGrid}>
              {myCoupons.map(coupon => (
                <div key={coupon.id} className={styles.couponCard}>
                  <div className={styles.couponHeader}>
                    <h3 className={styles.couponCode}>{coupon.code}</h3>
                    <span className={`${styles.couponStatus} ${coupon.status === 'active' ? styles.active : styles.inactive}`}>
                      {coupon.status.toUpperCase()}
                    </span>
                  </div>
                  <p className={styles.couponDetail}>
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `KES ${parseFloat(coupon.discountValue).toLocaleString()} OFF`}
                  </p>
                  <p className={styles.couponDetail}>
                    <FaCalendarAlt /> Expires: {coupon.expiryDate ? new Date(coupon.expiryDate.toDate()).toLocaleDateString() : 'N/A'}
                  </p>
                  {coupon.usageLimit && (
                    <p className={styles.couponDetail}>
                      <FaUsers /> Uses: {coupon.usedCount || 0} / {coupon.usageLimit}
                    </p>
                  )}
                  {coupon.perUserLimit && (
                    <p className={styles.couponDetail}>
                      <FaUsers /> Per User: {coupon.perUserLimit}
                    </p>
                  )}
                  {coupon.applicableEventIds && coupon.applicableEventIds.length > 0 && (
                    <p className={styles.couponDetail}>
                      <FaInfoCircle /> Applicable to {coupon.applicableEventIds.length} event(s)
                    </p>
                  )}
                  <div className={styles.couponActions}>
                    <button onClick={() => {
                        // Simulate copy to clipboard
                        navigator.clipboard.writeText(coupon.code).then(() => {
                            showNotification(`Coupon code '${coupon.code}' copied!`, 'info');
                        }).catch(err => {
                            console.error("Failed to copy coupon code:", err);
                            showNotification("Failed to copy coupon code.", 'error');
                        });
                    }} className="btn btn-secondary btn-small">
                      <FaLink /> Copy Code
                    </button>
                    {/* Add a button to view applicable events if needed (opens modal/navigates) */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InfluencerDashboardPage;