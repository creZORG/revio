import React from 'react';
import { FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import styles from './SetupProfileModal.module.css'; // We can reuse the same styles

const AccountSuspendedModal = () => {
    const { signOutUser } = useAuth();

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <FaLock style={{ fontSize: '3rem', color: 'var(--naks-error)', marginBottom: '20px' }} />
                <h1 className={styles.title}>Account Access Restricted</h1>
                <p className={styles.subtitle}>
                    Your account has been suspended or banned. You are not permitted to access the organizer dashboard at this time.
                </p>
                <p className={styles.subtitle}>
                    If you believe this is an error, please contact support.
                </p>
                <button className="btn btn-secondary" onClick={signOutUser}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AccountSuspendedModal;