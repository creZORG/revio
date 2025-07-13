import React, { useState } from 'react';
import Modal from '../../../../components/Common/Modal';
import styles from './Modals.module.css';

const ROLES = ['user', 'organizer', 'influencer', 'admin'];

const ChangeRoleModal = ({ user, currentUser, isOpen, onClose, onRoleChange }) => {
  if (!user) return null;

  const [selectedRole, setSelectedRole] = useState(user.role);

  const canPromoteToAdmin = currentUser.role === 'admin' && currentUser.adminLevel >= 3;

  const availableRoles = ROLES.filter(role => {
    if (role === 'admin') {
      return canPromoteToAdmin;
    }
    return role !== user.role;
  });

  const handleSubmit = () => {
    if (selectedRole !== user.role) {
      onRoleChange(user, selectedRole);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Change Role for ${user.displayName}`}>
      <div className={styles.modalContent}>
        <p>Current Role: <span className={styles.currentValue}>{user.role}</span></p>
        <div className={styles.formGroup}>
          <label htmlFor="role-select">New Role:</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={styles.selectInput}
          >
            <option value={user.role} disabled>{user.role} (current)</option>
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {selectedRole === 'admin' && !canPromoteToAdmin && (
            <p className={styles.warningText}>You must be a Level 3 Admin to perform this action.</p>
          )}
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedRole === user.role || (selectedRole === 'admin' && !canPromoteToAdmin)}
        >
          Confirm Change
        </button>
      </div>
    </Modal>
  );
};

export default ChangeRoleModal;