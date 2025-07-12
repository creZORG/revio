import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ToastNotification.module.css';
import { FaInfoCircle, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ToastNotification = ({ id, heading, message, type, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  const startDismissTimer = useCallback(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade-out animation before actual removal
        setTimeout(() => onClose(id), 300); // Match CSS fade-out duration
      }, duration);
    }
  }, [duration, id, onClose]);

  const clearDismissTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Show the toast
    setIsVisible(true);
    startDismissTimer();

    return () => {
      clearDismissTimer();
    };
  }, [startDismissTimer, clearDismissTimer]);

  const handleMouseEnter = () => {
    clearDismissTimer(); // Pause dismiss on hover
  };

  const handleMouseLeave = () => {
    startDismissTimer(); // Resume dismiss when mouse leaves
  };

  const handleDismiss = () => {
    clearDismissTimer();
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Match CSS fade-out duration
  };

  let iconComponent;
  let iconColor;
  switch (type) {
    case 'success':
      iconComponent = <FaCheckCircle />;
      iconColor = 'var(--naks-success)';
      break;
    case 'error':
      iconComponent = <FaTimesCircle />;
      iconColor = 'var(--naks-error)';
      break;
    case 'warning':
      iconComponent = <FaExclamationTriangle />;
      iconColor = 'var(--naks-warning)';
      break;
    case 'info':
    default:
      iconComponent = <FaInfoCircle />;
      iconColor = 'var(--naks-info)';
      break;
  }

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${isVisible ? styles.show : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.toastIcon} style={{ color: iconColor }}>
        {iconComponent}
      </div>
      <div className={styles.toastContent}>
        {heading && <h3 className={styles.toastHeading}>{heading}</h3>}
        <p className={styles.toastMessage}>{message}</p>
      </div>
      <button className={styles.toastDismissBtn} onClick={handleDismiss}>
        <FaTimes />
      </button>
    </div>
  );
};

export default ToastNotification;