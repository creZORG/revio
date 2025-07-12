import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

import styles from '../../organizer.module.css'; // Re-use organizer dashboard styles
import profileTabStyles from './ProfileTab.module.css'; // NEW: Dedicated CSS for ProfileTab

import { FaUserCircle, FaEnvelope, FaPhone, FaKey, FaCamera, FaInstagram, FaTwitter, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const ProfileTab = ({ currentUser, organizerData, showNotification }) => {
  const auth = getAuth();
  const storage = getStorage();

  const [profileData, setProfileData] = useState({
    displayName: organizerData?.displayName || '',
    username: organizerData?.username || '', // NEW: Username field
    email: organizerData?.email || '',
    contactPhone: organizerData?.contactPhone || '',
    organizerBio: organizerData?.organizerBio || '',
    avatarUrl: organizerData?.avatarUrl || 'https://placehold.co/80x80/E0E0E0/808080?text=Org',
    instagramUrl: organizerData?.instagramUrl || '',
    twitterUrl: organizerData?.twitterUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const avatarInputRef = useRef(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Username availability check state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailabilityError, setUsernameAvailabilityError] = useState('');
  const USERNAME_REGEX = /^[a-z0-9_]{5,12}$/;


  // Update local state when organizerData prop changes
  useEffect(() => {
    if (organizerData) {
      setProfileData({
        displayName: organizerData.displayName || '',
        username: organizerData.username || '',
        email: organizerData.email || '',
        contactPhone: organizerData.contactPhone || '',
        organizerBio: organizerData.organizerBio || '',
        avatarUrl: organizerData.avatarUrl || 'https://placehold.co/80x80/E0E0E0/808080?text=Org',
        instagramUrl: organizerData.instagramUrl || '',
        twitterUrl: organizerData.twitterUrl || '',
      });
    }
  }, [organizerData]);

  const handleProfileInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setProfileErrors(prev => ({ ...prev, [name]: undefined }));
    if (name === 'username') {
      setUsernameAvailabilityError(''); // Clear username error on change
    }
  }, []);

  const checkUsernameAvailability = useCallback(async (usernameToCheck) => {
    if (!usernameToCheck.trim()) {
      setUsernameAvailabilityError('Username cannot be empty.');
      return false;
    }
    if (!USERNAME_REGEX.test(usernameToCheck)) {
      setUsernameAvailabilityError('Username must be 5-12 lowercase letters, numbers, or underscores only.');
      return false;
    }

    setIsCheckingUsername(true);
    try {
      const q = query(
        collection(db, `artifacts/${appId}/users`),
        where('username', '==', usernameToCheck)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== currentUser.uid)) {
        setUsernameAvailabilityError('This username is already taken. Please choose another.');
        return false;
      }
      setUsernameAvailabilityError('');
      return true;
    } catch (err) {
      console.error("Error checking username availability:", err);
      setUsernameAvailabilityError('Failed to check username availability.');
      showNotification('Failed to check username availability.', 'error');
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  }, [currentUser, showNotification]);


  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // Max 2MB
      showNotification('Avatar image must be less than 2MB.', 'error');
      return;
    }

    setLoading(true);
    showNotification('Uploading avatar...', 'info');
    try {
      const avatarRef = ref(storage, `organizer_avatars/${currentUser.uid}/${file.name}`);
      await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(avatarRef);

      setProfileData(prev => ({ ...prev, avatarUrl: downloadURL }));
      showNotification('Avatar uploaded successfully!', 'success');
    } catch (err) {
      console.error("Error uploading avatar:", err);
      showNotification('Failed to upload avatar. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) {
      showNotification('You must be logged in to update your profile.', 'error');
      return;
    }

    const errors = {};
    if (!profileData.displayName.trim()) errors.displayName = 'Display Name is required.';
    if (!profileData.username.trim()) errors.username = 'Username is required.';
    else if (!USERNAME_REGEX.test(profileData.username)) errors.username = 'Username format is invalid.';
    else if (profileData.username !== organizerData?.username && !(await checkUsernameAvailability(profileData.username))) { // Only check if changed and invalid
        errors.username = usernameAvailabilityError || 'Username check failed.';
    }
    if (!profileData.email.trim()) errors.email = 'Contact Email is required.';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Invalid email format.';

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      showNotification('Please correct the errors in your profile information.', 'error');
      return;
    }

    setLoading(true);
    showNotification('Updating profile...', 'info');
    try {
      const profileRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, currentUser.uid);
      await setDoc(profileRef, {
        displayName: profileData.displayName,
        username: profileData.username.toLowerCase(), // Save username in lowercase
        email: profileData.email,
        contactPhone: profileData.contactPhone,
        organizerBio: profileData.organizerBio,
        avatarUrl: profileData.avatarUrl,
        instagramUrl: profileData.instagramUrl,
        twitterUrl: profileData.twitterUrl,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      console.error("Error updating profile:", err);
      showNotification('Failed to update profile. ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) {
      showNotification('You must be logged in to change your password.', 'error');
      return;
    }

    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required.';
    if (!newPassword) errors.newPassword = 'New password is required.';
    if (newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters.';
    if (newPassword !== confirmNewPassword) errors.confirmNewPassword = 'New passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      showNotification('Please correct the errors in password change form.', 'error');
      return;
    }

    setIsChangingPassword(true);
    showNotification('Changing password...', 'info');
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      showNotification('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordErrors({});
    } catch (err) {
      console.error("Error changing password:", err);
      let errorMessage = 'Failed to change password.';
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      showNotification(errorMessage, 'error');
      setPasswordErrors({ general: errorMessage });
    } finally {
      setIsChangingPassword(false);
    }
  };


  return (
    <div className={profileTabStyles.profileTabContainer}> {/* Use dedicated CSS module */}
      {/* Profile Information Section */}
      <section className={profileTabStyles.profileSectionCard}>
        <h2 className={profileTabStyles.sectionTitle}>Profile Information</h2>
        <div className={profileTabStyles.profileAvatarUpload}>
          <img src={profileData.avatarUrl} alt="Profile Avatar" className={profileTabStyles.profileAvatar} />
          <label htmlFor="avatar-upload" className={profileTabStyles.avatarUploadButton}>
            <FaCamera /> Change Photo
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} disabled={loading} style={{ display: 'none' }} />
          </label>
          {loading && <p className={profileTabStyles.uploadStatus}><FaSpinner className="spinner" /> Uploading...</p>}
        </div>

        <form className={profileTabStyles.profileForm}>
          <div className="form-group">
            <label htmlFor="displayName" className="form-label">Organizer Name <span className="required-star">*</span></label>
            <input type="text" id="displayName" name="displayName" className="input-field" value={profileData.displayName} onChange={handleProfileInputChange} disabled={loading} />
            {profileErrors.displayName && <p className="error-message-box">{profileErrors.displayName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username <span className="required-star">*</span></label>
            <input
              type="text"
              id="username"
              name="username"
              className="input-field"
              value={profileData.username}
              onChange={handleProfileInputChange}
              onBlur={() => checkUsernameAvailability(profileData.username)}
              disabled={loading || organizerData?.username} /* Disable if username is already set */
              placeholder="e.g., my_org_name"
            />
            {profileErrors.username && <p className="error-message-box">{profileErrors.username}</p>}
            {usernameAvailabilityError && <p className="error-message-box">{usernameAvailabilityError}</p>}
            {isCheckingUsername && <p className="text-naks-text-secondary" style={{fontSize: '0.85rem', marginTop: '5px'}}><FaSpinner className="spinner" /> Checking availability...</p>}
            {organizerData?.username && <p className="text-naks-text-secondary" style={{fontSize: '0.85rem', marginTop: '5px'}}><FaInfoCircle /> Username cannot be changed once set.</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Contact Email <span className="required-star">*</span></label>
            <input type="email" id="email" name="email" className="input-field" value={profileData.email} onChange={handleProfileInputChange} disabled={loading} />
            {profileErrors.email && <p className="error-message-box">{profileErrors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone" className="form-label">Phone Number</label>
            <input type="tel" id="contactPhone" name="contactPhone" className="input-field" value={profileData.contactPhone} onChange={handleProfileInputChange} disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="organizerBio" className="form-label">About Your Organization</label>
            <textarea id="organizerBio" name="organizerBio" className="input-field" rows="4" value={profileData.organizerBio} onChange={handleProfileInputChange} disabled={loading} placeholder="Tell us about your organization and what kind of events you host."></textarea>
          </div>

          <h3 className={profileTabStyles.sectionSubtitle}>Social Links</h3>
          <div className="form-group">
            <label htmlFor="instagramUrl" className="form-label"><FaInstagram /> Instagram Profile URL</label>
            <input type="url" id="instagramUrl" name="instagramUrl" className="input-field" value={profileData.instagramUrl} onChange={handleProfileInputChange} disabled={loading} placeholder="https://instagram.com/yourprofile" />
          </div>
          <div className="form-group">
            <label htmlFor="twitterUrl" className="form-label"><FaTwitter /> Twitter Profile URL</label>
            <input type="url" id="twitterUrl" name="twitterUrl" className="input-field" value={profileData.twitterUrl} onChange={handleProfileInputChange} disabled={loading} placeholder="https://twitter.com/yourprofile" />
          </div>

          <Button onClick={handleUpdateProfile} className="btn btn-primary full-width-btn" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaCheckCircle />} Update Profile
          </Button>
        </form>
      </section>

      {/* Change Password Section */}
      <section className={profileTabStyles.profileSectionCard}>
        <h2 className={profileTabStyles.sectionTitle}>Change Password</h2>
        <form className={profileTabStyles.profileForm}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password <span className="required-star">*</span></label>
            <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors(prev => ({ ...prev, currentPassword: undefined, general: undefined })); }} disabled={isChangingPassword} />
            {passwordErrors.currentPassword && <p className="error-message-box">{passwordErrors.currentPassword}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password <span className="required-star">*</span></label>
            <input type="password" id="newPassword" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors(prev => ({ ...prev, newPassword: undefined, general: undefined })); }} disabled={isChangingPassword} />
            {passwordErrors.newPassword && <p className="error-message-box">{passwordErrors.newPassword}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password <span className="required-star">*</span></label>
            <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => { setConfirmNewPassword(e.target.value); setPasswordErrors(prev => ({ ...prev, confirmNewPassword: undefined, general: undefined })); }} disabled={isChangingPassword} />
            {passwordErrors.confirmNewPassword && <p className="error-message-box">{passwordErrors.confirmNewPassword}</p>}
          </div>
          {passwordErrors.general && <p className="error-message-box">{passwordErrors.general}</p>}
          <Button onClick={handleChangePassword} className="btn btn-primary full-width-btn" disabled={isChangingPassword}>
            {isChangingPassword ? <FaSpinner className="spinner" /> : <FaKey />} Change Password
          </Button>
        </form>
      </section>
    </div>
  );
};

export default ProfileTab;