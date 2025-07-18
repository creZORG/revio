import React from 'react';
import styles from './PermissionDenied.module.css'; // You'll need to create this CSS module too

const PermissionDenied = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Access Denied</h1>
      <p className={styles.message}>
        You do not have the necessary permissions to view this page.
      </p>
      <p className={styles.message}>
        Please log in with an account that has the required role.
      </p>
      {/* You can add a link to login or homepage here */}
      <a href="/auth" className={styles.button}>Go to Login</a>
      <a href="/" className={styles.button}>Go to Homepage</a>
    </div>
  );
};

export default PermissionDenied;