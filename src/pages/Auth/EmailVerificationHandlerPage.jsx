import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Import Link
import { getAuth, applyActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSkeleton from '../../components/Common/LoadingSkeleton';

import styles from './AuthPage.module.css'; // Re-use auth page styles

import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

const EmailVerificationHandlerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const { showNotification } = useNotification();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const oobCode = queryParams.get('oobCode'); // Out-of-band code from Firebase email link

      if (!oobCode) {
        setStatus('error');
        setMessage('Verification link is invalid or expired.');
        showNotification('Invalid verification link.', 'error');
        return;
      }

      try {
        // Apply the action code (verifies email in Firebase Auth)
        await applyActionCode(auth, oobCode);

        // Update user's profile in Firestore to mark email as verified
        if (auth.currentUser) {
          const userProfileRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}/profiles`, auth.currentUser.uid);
          await updateDoc(userProfileRef, {
            emailVerified: true,
            status: 'active' // Set status to active after verification
          });
        }

        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
        showNotification('Email verified successfully!', 'success');
        setTimeout(() => {
          navigate('/auth?mode=login', { replace: true }); // Redirect to login page
        }, 3000);

      } catch (err) {
        console.error("Email verification error:", err);
        setStatus('error');
        let errorMessage = 'Failed to verify email. The link might be invalid or expired.';
        if (err.code === 'auth/invalid-action-code') {
          errorMessage = 'The verification link is invalid or has expired.';
        } else if (err.code === 'auth/user-disabled') {
          errorMessage = 'Your account has been disabled.';
        }
        setMessage(errorMessage);
        showNotification(errorMessage, 'error');
      }
    };

    verifyEmail();
  }, [location.search, auth, navigate, showNotification]);

  return (
    <div className={styles.pageWrapper} style={{minHeight: 'calc(100vh - 120px)', justifyContent: 'center'}}>
      <section className={`${styles.authContainer} ${styles.infoSection}`} style={{maxWidth: '700px', padding: '40px'}}>
        <h2 className={styles.authTitle}>Email Verification</h2>
        {status === 'verifying' && (
          <div style={{textAlign: 'center'}}>
            <FaSpinner className="spinner" style={{ fontSize: '3rem', color: 'var(--naks-primary)', marginBottom: '15px' }} />
            <p className="text-naks-text-secondary">{message}</p>
            <LoadingSkeleton width="80%" height="20px" style={{margin: '10px auto'}}/>
          </div>
        )}
        {status === 'success' && (
          <div style={{textAlign: 'center'}}>
            <FaCheckCircle style={{ fontSize: '3rem', color: 'var(--naks-success)', marginBottom: '15px' }} />
            <h3 style={{color: 'var(--naks-text-primary)', marginBottom: '10px'}}>{message}</h3>
            <Link to="/auth?mode=login" className="btn btn-primary" style={{marginTop: '20px'}}>Go to Login</Link>
          </div>
        )}
        {status === 'error' && (
          <div style={{textAlign: 'center'}}>
            <FaTimesCircle style={{ fontSize: '3rem', color: 'var(--naks-error)', marginBottom: '15px' }} />
            <h3 style={{color: 'var(--naks-text-primary)', marginBottom: '10px'}}>Verification Failed</h3>
            <p className="text-naks-text-secondary">{message}</p>
            <Link to="/auth" className="btn btn-secondary" style={{marginTop: '20px'}}>Try Again</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmailVerificationHandlerPage;