import React, { useState, useEffect } from 'react';
import { db } from '../../../utils/firebaseConfig.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

import TextInput from '../../../components/Common/TextInput.jsx';
import Button from '../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import { FaSave, FaKey, FaInfoCircle } from 'react-icons/fa';

import styles from '../user.module.css'; // NEW: Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const ProfileSettingsTab = ({ currentUser, profileData, showNotification }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileData) {
      setFullName(profileData.displayName || '');
      setPhoneNumber(profileData.phoneNumber || '');
      setLoading(false);
    } else if (currentUser) {
      setLoading(true);
    }
  }, [profileData, currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentUser) {
      showNotification('User not logged in.', 'error');
      return;
    }

    try {
      const userProfileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
      await updateDoc(userProfileRef, {
        displayName: fullName,
        phoneNumber: phoneNumber,
      });
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile: ' + error.message, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentUser) {
      setPasswordChangeError('User not logged in.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);

      showNotification('Password updated successfully!', 'success');
      setPasswordChangeSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordChangeError('Current password is incorrect.');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordChangeError('Please log out and log in again, then try changing your password.');
      } else {
        setPasswordChangeError('Failed to change password: ' + error.message);
      }
      showNotification('Failed to change password.', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Profile Settings</h2>
        <LoadingSkeleton width="100%" height="250px" className="mb-6" style={{backgroundColor: 'var(--background-color)'}} />
        <LoadingSkeleton width="100%" height="200px" style={{backgroundColor: 'var(--background-color)'}} />
      </div>
    );
  }

  return (
    <div>
      <h2>Profile Settings</h2>
      <div className="profile-section-card mb-6">
        <h3>Personal Information</h3>
        <form onSubmit={handleUpdateProfile} className={styles.profileSettingsForm}> {/* Use styles.profileSettingsForm */}
          <TextInput
            label="Full Name"
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />
          <TextInput
            label="Email Address"
            id="userEmail"
            name="userEmail"
            type="email"
            value={profileData?.email || ''}
            readOnly
            disabled
            className="opacity-70 cursor-not-allowed"
          />
          <p className={styles.formHint}>Email cannot be changed.</p> {/* Use styles.formHint */}
          <TextInput
            label="Phone Number"
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+2547XXXXXXXX"
          />
          <Button type="submit" className="btn btn-primary">
            <FaSave /> Save Profile
          </Button>
        </form>
      </div>

      <div className="profile-section-card">
        <h3>Change Password</h3>
        <form onSubmit={handleChangePassword} className={styles.passwordChangeForm}> {/* Use styles.passwordChangeForm */}
          <TextInput
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <TextInput
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextInput
            label="Confirm New Password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          {passwordChangeError && <p className="error-message-box">{passwordChangeError}</p>}
          {passwordChangeSuccess && <p className="error-message-box" style={{backgroundColor: 'var(--sys-success)', borderColor: 'var(--sys-success)', color: 'white'}}>{passwordChangeSuccess}</p>}
          <Button type="submit" className="btn btn-primary">
            <FaKey /> Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsTab;