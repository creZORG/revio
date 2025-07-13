import React from 'react';
import Modal from '../../../../components/Common/Modal';
import styles from './Modals.module.css';
import { FaUserShield, FaCheckCircle } from 'react-icons/fa';

const UserProfileModal = ({ user, currentUser, isOpen, onClose }) => {
  if (!user) return null;

  const renderAdminProfile = () => (
    <div className={`${styles.profileContent} ${styles.redacted}`}>
      <div className={styles.redactedHeader}>
        <FaUserShield className={styles.redactedIcon} />
        <h3>Administrator Profile</h3>
      </div>
      <p className={styles.profileInfo}>
        <strong>Name:</strong> {user.displayName}
        <span className={styles.badge} style={{ backgroundColor: '#E6336B', color: 'white' }}><FaCheckCircle /> Verified</span>
        <span className={styles.badge} style={{ backgroundColor: '#A0522D', color: 'white' }}>Naks Yetu Staff</span>
      </p>
      <p className={styles.redactedMessage}>
        You do not have sufficient permissions to view the full details of this administrator.
      </p>
    </div>
  );

  const renderRegularProfile = () => (
     <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
            <img src={user.photoURL} alt={user.displayName} className={styles.profileAvatar} />
            <div>
                <h3 className={styles.profileName}>{user.displayName}</h3>
                <p className={styles.profileUsername}>@{user.username || 'N/A'}</p>
            </div>
        </div>
        <div className={styles.profileDetailsGrid}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.id}</p>
            <p><strong>Role:</strong> <span className={styles.roleBadge}>{user.role}</span></p>
            <p><strong>Status:</strong> <span className={styles.statusBadge}>{user.status || 'active'}</span></p>
            <p><strong>Joined:</strong> {user.createdAt}</p>
            {user.role === 'organizer' && <p><strong>Events Organized:</strong> {user.eventsOrganized || 0}</p>}
            {user.role === 'influencer' && <p><strong>Influencer Tier:</strong> {user.influencerTier || 'N/A'}</p>}
        </div>
    </div>
  );

  // Determine which profile to render
  const isViewingAdmin = user.role === 'admin';
  const viewerIsSufficientLevel = currentUser.role === 'admin' && currentUser.adminLevel >= 4;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      {isViewingAdmin && !viewerIsSufficientLevel ? renderAdminProfile() : renderRegularProfile()}
      <div className={styles.modalFooter}>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default UserProfileModal;