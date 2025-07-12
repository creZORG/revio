import React, { useState, useCallback } from 'react';
// FIX: Import Timestamp from firebase/firestore
import { db } from '../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/Common/Button.jsx';

import styles from './InfluencerDashboardPage.module.css'; // Re-use styles

import { FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

const SetupUsernameModal = ({ onSetupSuccess, currentUser }) => {
  const { showNotification } = useNotification();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [mpesaNumberError, setMpesaNumberError] = useState('');

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const USERNAME_REGEX = /^[a-z0-9_]{5,12}$/;
  const MPESA_NUMBER_REGEX = /^2547\d{8}$/; 

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    setUsernameError('');
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    setFullNameError('');
  };

  const handleMpesaNumberChange = (e) => {
    setMpesaNumber(e.target.value);
    setMpesaNumberError('');
  };


  const checkUsernameAvailability = useCallback(async (currentUsername) => {
    if (!currentUsername.trim()) {
      setUsernameError('Username cannot be empty.');
      return false;
    }
    if (!USERNAME_REGEX.test(currentUsername)) {
      setUsernameError('Username must be 5-12 characters, lowercase letters, numbers, or underscores only.');
      return false;
    }

    setIsCheckingUsername(true);
    try {
      const q = query(
        collection(db, `artifacts/${appId}/users`),
        where('username', '==', currentUsername)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== currentUser.uid)) {
        setUsernameError('This username is already taken. Please choose another.');
        return false;
      }
      setUsernameError('');
      return true;
    } catch (err) {
      console.error("Error checking username availability:", err);
      setUsernameError('Failed to check username availability.');
      showNotification('Failed to check username availability.', 'error');
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  }, [currentUser, showNotification]);


  const handleSetupUsername = async () => {
    if (!currentUser) {
      showNotification('You must be logged in to set a username.', 'error');
      return;
    }

    let isValid = true;
    const errors = {};

    if (!username.trim()) errors.username = 'Username is required.';
    else if (!USERNAME_REGEX.test(username)) errors.username = 'Username must be 5-12 characters, lowercase letters, numbers, or underscores only.';
    else if (!(await checkUsernameAvailability(username))) isValid = false;

    if (!fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!mpesaNumber.trim()) errors.mpesaNumber = 'M-Pesa Number is required.';
    else if (!MPESA_NUMBER_REGEX.test(mpesaNumber)) errors.mpesaNumber = 'Invalid M-Pesa number format (e.g., 2547XXXXXXXX).';

    if (Object.keys(errors).length > 0) {
      setUsernameError(errors.username || '');
      setFullNameError(errors.fullName || '');
      setMpesaNumberError(errors.mpesaNumber || '');
      showNotification('Please correct the errors in the form.', 'error');
      return;
    }
    if (!isValid) return;


    setIsSubmitting(true);
    showNotification('Setting up your profile...', 'info');

    try {
      const profileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
      await setDoc(profileRef, {
        username: username,
        fullName: fullName,
        mpesaNumber: mpesaNumber,
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || fullName || username,
        role: 'influencer',
        createdAt: Timestamp.now(),
      }, { merge: true });

      onSetupSuccess(username);
      showNotification('Profile setup complete! Welcome to Naks Yetu Influencer Portal.', 'success');
    } catch (err) {
      console.error("Error setting username/profile:", err);
      showNotification('Failed to set up profile. ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.usernameSetupModalContent}>
      <h3 className={styles.modalHeading}>
        Congratulations, <span className={styles.naksYetuGradient}>Naks Yetu</span> Influencer!
      </h3>
      <p className={styles.modalDescription}>
        We're thrilled to have you on board! To get started and unlock your full portal, please set up your unique influencer profile.
      </p>
      <ul className={styles.modalDescription} style={{listStyle: 'none', paddingLeft: '0', textAlign: 'left', margin: '0 auto', maxWidth: '300px', fontSize: '0.95em'}}>
        <li><FaCheckCircle style={{color: 'var(--naks-success)', marginRight: '8px'}}/> Promote amazing events</li>
        <li><FaCheckCircle style={{color: 'var(--naks-success)', marginRight: '8px'}}/> Share exclusive coupon codes</li>
        <li><FaCheckCircle style={{color: 'var(--naks-success)', marginRight: '8px'}}/> Track your coupon usage & earnings</li>
      </ul>
      <p className={styles.modalDescription} style={{marginTop: '15px'}}>
        Your username will be used to link coupons to your profile. Your full name and M-Pesa number are required for payout purposes.
      </p>
      <p className={styles.modalDescriptionSmall}>
        You'll be able to change these details later in your Profile Settings.
      </p>

      <div className="form-group">
        <label htmlFor="influencerUsername" className="form-label">Unique Username <span className="required-star">*</span></label>
        <input
          type="text"
          id="influencerUsername"
          className="input-field"
          value={username}
          onChange={handleUsernameChange}
          onBlur={() => checkUsernameAvailability(username)}
          disabled={isSubmitting || isCheckingUsername}
          placeholder="e.g., john_doe_influencer"
        />
        {usernameError && <p className="error-message-box">{usernameError}</p>}
        {isCheckingUsername && <p className="text-naks-text-secondary" style={{fontSize: '0.85rem', marginTop: '5px'}}><FaSpinner className="spinner" /> Checking availability...</p>}
      </div>

      <div className="form-group">
        <label htmlFor="fullName" className="form-label">Full Name (as on ID) <span className="required-star">*</span></label>
        <input
          type="text"
          id="fullName"
          className="input-field"
          value={fullName}
          onChange={handleFullNameChange}
          disabled={isSubmitting}
          placeholder="e.g., Jane Wanjiku Doe"
        />
        {fullNameError && <p className="error-message-box">{fullNameError}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="mpesaNumber" className="form-label">M-Pesa Phone Number <span className="required-star">*</span></label>
        <input
          type="tel"
          id="mpesaNumber"
          className="input-field"
          value={mpesaNumber}
          onChange={handleMpesaNumberChange}
          disabled={isSubmitting}
          placeholder="e.g., 2547XXXXXXXX"
        />
        {mpesaNumberError && <p className="error-message-box">{mpesaNumberError}</p>}
      </div>

      <div className={styles.modalActions} style={{justifyContent: 'center'}}>
        <Button onClick={handleSetupUsername} className="btn btn-primary" disabled={isSubmitting || isCheckingUsername || !username.trim() || usernameError || !fullName.trim() || fullNameError || !mpesaNumber.trim() || mpesaNumberError}>
          {isSubmitting ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {isSubmitting ? 'Saving...' : 'Set Up Profile'}
        </Button>
      </div>
    </div>
  );
};

export default SetupUsernameModal;