import React, { useState } from 'react';
import Modal from '../../../../components/Common/Modal';
import styles from './Modals.module.css';

const ChangeStatusModal = ({ user, isOpen, onClose, onStatusChange }) => {
  if (!user) return null;

  const [newStatus, setNewStatus] = useState(user.status || 'active');
  const [suspensionTime, setSuspensionTime] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);

  const handleSubmit = () => {
    const statusDetails = {
      status: newStatus,
      notify: notifyUser,
      suspensionEndDate: newStatus === 'suspended' ? new Date(suspensionTime) : null
    };
    onStatusChange(user, statusDetails);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Change Status for ${user.displayName}`}>
      <div className={styles.modalContent}>
        <p>Current Status: <span className={styles.currentValue}>{user.status || 'active'}</span></p>
        <div className={styles.formGroup}>
          <label>New Status:</label>
          <div className={styles.radioGroup}>
            <label><input type="radio" value="active" checked={newStatus === 'active'} onChange={(e) => setNewStatus(e.target.value)} /> Active</label>
            <label><input type="radio" value="suspended" checked={newStatus === 'suspended'} onChange={(e) => setNewStatus(e.target.value)} /> Suspended</label>
            <label><input type="radio" value="banned" checked={newStatus === 'banned'} onChange={(e) => setNewStatus(e.target.value)} /> Banned</label>
          </div>
        </div>
        {newStatus === 'suspended' && (
          <div className={styles.formGroup}>
            <label htmlFor="suspension-time">Suspended Until:</label>
            <input
              type="datetime-local"
              id="suspension-time"
              value={suspensionTime}
              onChange={(e) => setSuspensionTime(e.target.value)}
              className={styles.textInput}
            />
          </div>
        )}
        <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={notifyUser} onChange={(e) => setNotifyUser(e.target.checked)} />
                Notify user about this change
            </label>
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Update Status</button>
      </div>
    </Modal>
  );
};

export default ChangeStatusModal;