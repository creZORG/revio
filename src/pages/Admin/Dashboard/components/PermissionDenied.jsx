import React from 'react';
import styles from './PermissionDenied.module.css';
import { FaLock } from 'react-icons/fa';

const PermissionDenied = () => {
  return (
    <div className={styles.permissionDeniedContainer}>
      <div className={styles.contentBox}>
        <FaLock className={styles.lockIcon} />
        <h2 className={styles.title}>Access Denied</h2>
        <p className={styles.message}>
          Your account has admin privileges, but you have not been assigned an access level.
        </p>
        <p className={styles.message}>
          Please contact the system developer to have your access level configured.
        </p>
        <a href="mailto:mark@naksyetu.co.ke" className={styles.contactLink}>
          Contact Developer
        </a>
      </div>
    </div>
  );
};

export default PermissionDenied;