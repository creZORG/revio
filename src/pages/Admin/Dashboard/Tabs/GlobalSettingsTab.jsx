import React, { useState, useEffect } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, addDoc } from 'firebase/firestore';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

import styles from '../../AdminDashboardPage.module.css'; // Re-use main admin dashboard styles
import adminFormStyles from '../Forms/AdminForms.module.css'; // Admin form specific styles
import globalSettingsStyles from './GlobalSettingsTab.module.css'; // NEW: Dedicated CSS for GlobalSettingsTab

import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";
const AUTH_CONTROLS_DOC_REF = doc(db, `appSettings/authControls`);
const GLOBAL_NOTIFICATIONS_COLLECTION = collection(db, `artifacts/${appId}/public/data_for_app/globalNotifications`);

const GlobalSettingsTab = ({ currentUser, showNotification }) => {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [allowPublicSignup, setAllowPublicSignup] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [globalNotificationMessage, setGlobalNotificationMessage] = useState('');
  const [globalNotificationType, setGlobalNotificationType] = useState('info');
  const [isSendingGlobalNotification, setIsSendingGlobalNotification] = useState(false);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      setSettingsError(null);
      try {
        const docSnap = await getDoc(AUTH_CONTROLS_DOC_REF);
        if (docSnap.exists()) {
          setAllowPublicSignup(docSnap.data().allowPublicSignup || false);
        } else {
          await setDoc(AUTH_CONTROLS_DOC_REF, { allowPublicSignup: true, createdAt: Timestamp.now() });
          setAllowPublicSignup(true);
        }
      } catch (err) {
        console.error("Error fetching global settings:", err);
        setSettingsError("Failed to load global settings.");
        showNotification("Failed to load global settings.", 'error');
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [showNotification]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    showNotification('Saving settings...', 'info');
    try {
      await updateDoc(AUTH_CONTROLS_DOC_REF, {
        allowPublicSignup: allowPublicSignup,
        updatedAt: Timestamp.now(),
      });
      showNotification('Settings saved successfully!', 'success');
    } catch (err) {
      console.error("Error saving settings:", err);
      showNotification('Failed to save settings.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSendGlobalNotification = async () => {
    if (!globalNotificationMessage.trim()) {
      showNotification('Notification message cannot be empty.', 'error');
      return;
    }
    if (!window.confirm(`Send a global ${globalNotificationType.toUpperCase()} notification to ALL users: "${globalNotificationMessage}"?`)) {
      return;
    }

    setIsSendingGlobalNotification(true);
    showNotification('Sending global notification...', 'info');
    try {
      await addDoc(GLOBAL_NOTIFICATIONS_COLLECTION, {
        type: globalNotificationType,
        message: globalNotificationMessage,
        createdAt: Timestamp.now(),
        sender: currentUser.displayName || 'Admin',
        read: false,
      });
      showNotification('Global notification sent successfully!', 'success');
      setGlobalNotificationMessage('');
      setGlobalNotificationType('info');
    } catch (err) {
      console.error("Error sending global notification:", err);
      showNotification('Failed to send global notification.', 'error');
    } finally {
      setIsSendingGlobalNotification(false);
    }
  };


  if (loadingSettings) {
    return (
      <div className={styles.tabContainer}>
        <LoadingSkeleton width="100%" height="150px" style={{ marginBottom: '20px' }} />
        <LoadingSkeleton width="100%" height="200px" />
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="error-message-box">
        <p>{settingsError}</p>
      </div>
    );
  }

  return (
    <div className={styles.tabContainer}>
      <h2 className={styles.sectionTitle}>Global Settings</h2>

      <section className={adminFormStyles.formSection}>
        <h3 className={adminFormStyles.sectionSubtitle}>Authentication Controls</h3>
        <div className="form-group">
          <label className="form-label">Allow Public Sign-up:</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublicSignup}
                onChange={(e) => setAllowPublicSignup(e.target.checked)}
                disabled={isSavingSettings}
                className="mr-2"
              />
              {allowPublicSignup ? 'Enabled' : 'Disabled'}
            </label>
          </div>
          <p className="text-xs text-naks-text-secondary mt-1">
            Toggle to allow new users to sign up for accounts. If disabled, only pre-approved users can log in.
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="btn btn-primary" disabled={isSavingSettings}>
          {isSavingSettings ? <FaSpinner className="spinner" /> : <FaCheckCircle />} Save Settings
        </Button>
      </section>

      <section className={adminFormStyles.formSection}>
        <h3 className={adminFormStyles.sectionSubtitle}>Send Global Notification</h3>
        <div className="form-group">
          <label htmlFor="globalNotificationMessage" className="form-label">Message to all users:</label>
          <textarea
            id="globalNotificationMessage"
            className="input-field"
            rows="4"
            value={globalNotificationMessage}
            onChange={(e) => setGlobalNotificationMessage(e.target.value)}
            disabled={isSendingGlobalNotification}
            placeholder="Type your message here..."
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="notificationType" className="form-label">Notification Type:</label>
          <select
            id="notificationType"
            className="input-field"
            value={globalNotificationType}
            onChange={(e) => setGlobalNotificationType(e.target.value)}
            disabled={isSendingGlobalNotification}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <Button onClick={handleSendGlobalNotification} className="btn btn-primary" disabled={isSendingGlobalNotification || !globalNotificationMessage.trim()}>
          {isSendingGlobalNotification ? <FaSpinner className="spinner" /> : <FaPaperPlane />} Send Global Notification
        </Button>
      </section>
    </div>
  );
};

export default GlobalSettingsTab;