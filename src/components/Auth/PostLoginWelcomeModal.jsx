import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, sendEmailVerification } from 'firebase/auth';
// FIX: Import doc and setDoc from firebase/firestore
import { doc, getDoc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import Modal from '../Common/Modal.jsx';
import Button from '../Common/Button.jsx';

import styles from '../../pages/Auth/AuthPage.module.css'; // Re-use AuthPage styles for consistency

import { FaEnvelopeOpenText, FaRedo, FaUserPlus, FaUsers, FaSpinner, FaCheckCircle, FaInfoCircle, FaHourglassHalf } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const PostLoginWelcomeModal = ({ isOpen, onClose }) => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  const { showNotification } = useNotification();
  const auth = getAuth();

  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [daysLoggedIn, setDaysLoggedIn] = useState(0);
  const [organizerRequestStatus, setOrganizerRequestStatus] = useState(null);

  useEffect(() => {
    if (currentUser?.metadata?.creationTime) {
      const creationDate = new Date(currentUser.metadata.creationTime);
      const now = new Date();
      const diffTime = Math.abs(now - creationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLoggedIn(diffDays);
    }

    const fetchOrganizerRequestStatus = async () => {
      if (currentUser && userRole === 'user') {
        try {
          const docRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/organizerRequests`, currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOrganizerRequestStatus(docSnap.data().status);
          }
        } catch (err) {
          console.error("Error fetching organizer request status:", err);
        }
      }
    };
    fetchOrganizerRequestStatus();

  }, [currentUser, userRole]);

  const handleResendVerificationEmail = async () => {
    if (!auth.currentUser) {
      showNotification('No user logged in to resend email.', 'error');
      return;
    }
    setIsResendingEmail(true);
    try {
      await sendEmailVerification(auth.currentUser);
      showNotification('Verification email re-sent! Please check your inbox.', 'success');
    } catch (err) {
      console.error("Error resending verification email:", err);
      showNotification('Failed to resend verification email. Please try again later.', 'error');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleRequestOrganizerAccess = async () => {
    if (!currentUser) {
      showNotification('Please log in to request organizer access.', 'error');
      return;
    }
    if (organizerRequestStatus === 'pending') {
      showNotification('Your organizer request is already pending.', 'info');
      return;
    }
    if (organizerRequestStatus === 'approved') {
      showNotification('You are already an approved organizer!', 'info');
      return;
    }

    try {
      const requestRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/organizerRequests`, currentUser.uid);
      await setDoc(requestRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        requestDate: Timestamp.now(),
        status: 'pending',
        roleRequested: 'organizer',
      });
      setOrganizerRequestStatus('pending');
      showNotification('Organizer access request submitted! We will review it soon.', 'success');
    } catch (err) {
      console.error("Error requesting organizer access:", err);
      showNotification('Failed to submit organizer request.', 'error');
    }
  };


  if (!currentUser || !isAuthenticated || userRole === 'admin') {
    return null;
  }

  const isEmailVerified = currentUser.emailVerified;
  const isInfluencerReady = daysLoggedIn >= 7;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Welcome, ${currentUser.displayName || currentUser.email.split('@')[0]}!`}>
      <div className={styles.modalContent} style={{textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <h3 className={styles.modalHeading}>
          Welcome to <span className={styles.naksYetuGradient}>Naks Yetu</span>!
        </h3>
        <p className={styles.modalDescription}>
          We're excited to have you here. Here are a few things to get you started:
        </p>

        {/* Email Verification Section */}
        {!isEmailVerified && (
          <div className={styles.infoSection} style={{backgroundColor: 'var(--naks-warning-light)', border: '1px solid var(--naks-warning)', padding: '15px', borderRadius: '12px'}}>
            <h4 className={styles.infoTitle} style={{color: 'var(--naks-warning)', marginBottom: '10px'}}><FaInfoCircle /> Verify Your Email</h4>
            <p className={styles.infoDescription} style={{color: 'var(--naks-text-secondary)'}}>
              Please verify your email address (<strong>{currentUser.email}</strong>) for full account access and security.
            </p>
            <Button onClick={handleResendVerificationEmail} className="btn btn-secondary" disabled={isResendingEmail} style={{marginTop: '10px'}}>
              {isResendingEmail ? <FaSpinner className="spinner" /> : <FaRedo />} Resend Verification Email
            </Button>
          </div>
        )}

        {/* Role Switching Options */}
        {userRole === 'user' && (
          <div className={styles.infoSectionsWrapper} style={{gridTemplateColumns: '1fr', gap: '20px'}}>
            {/* Influencer Option */}
            <div className={`${styles.infoSection} ${styles.glassmorphismInfo}`} style={{padding: '20px', borderRadius: '12px'}}>
              <h4 className={`${styles.infoTitle} ${styles.gradientText}`}>Become an Influencer</h4>
              <p className={styles.infoDescription}>
                Promote events, share coupons, and earn commissions!
              </p>
              {isInfluencerReady ? (
                <Button onClick={() => navigate('/influencer/dashboard')} className="btn btn-primary" style={{marginTop: '10px'}}>
                  <FaUserPlus /> Go to Influencer Portal
                </Button>
              ) : (
                <Button className="btn btn-secondary" disabled>
                  <FaHourglassHalf /> Available in {7 - daysLoggedIn} days
                </Button>
              )}
              <p className={styles.modalDescriptionSmall} style={{marginTop: '10px'}}>
                You can switch to an Influencer account after 7 days of being a registered user.
              </p>
            </div>

            {/* Organizer Option */}
            <div className={`${styles.infoSection} ${styles.glassmorphismInfo}`} style={{padding: '20px', borderRadius: '12px'}}>
              <h4 className={`${styles.infoTitle} ${styles.gradientText}`}>Become an Organizer</h4>
              <p className={styles.infoDescription}>
                List your events, sell tickets, and manage your audience.
              </p>
              {organizerRequestStatus === 'pending' ? (
                <Button className="btn btn-secondary" disabled>
                  <FaHourglassHalf /> Request Pending
                </Button>
              ) : organizerRequestStatus === 'approved' ? (
                <Button onClick={() => navigate('/organizer/dashboard')} className="btn btn-primary">
                  <FaCheckCircle /> Go to Organizer Dashboard
                </Button>
              ) : (
                <Button onClick={handleRequestOrganizerAccess} className="btn btn-primary">
                  <FaUserPlus /> Request Organizer Access
                </Button>
              )}
              <p className={styles.modalDescriptionSmall} style={{marginTop: '10px'}}>
                Your request will be reviewed by our admin team.
              </p>
            </div>
          </div>
        )}

        <Button onClick={onClose} className="btn btn-secondary" style={{marginTop: '20px'}}>Continue to Naks Yetu</Button>
      </div>
    </Modal>
  );
};

export default PostLoginWelcomeModal;