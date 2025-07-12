import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import Modal from '../../../../components/Common/Modal.jsx';
import Button from '../../../../components/Common/Button.jsx';

import styles from './UserManagementTab.module.css'; // Dedicated CSS for UserManagementTab
import adminFormStyles from '../Forms/AdminForms.module.css'; // Admin form specific styles (for shared form elements)

import { FaSpinner, FaUserCircle, FaEnvelope, FaPhone, FaBan, FaCheckCircle, FaTimesCircle, FaRegEdit, FaInfoCircle, FaSearch, FaFilter, FaDownload, FaPaperPlane, FaHourglassHalf } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const UserManagementTab = ({ currentUser, showNotification }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fetch all user profiles
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const profilesRef = collection(db, `artifacts/${appId}/users`); // Top-level 'users' collection
        let q = query(profilesRef, orderBy('createdAt', 'desc'));

        if (filterRole !== 'all') {
          q = query(q, where('role', '==', filterRole));
        }
        if (filterStatus !== 'all') {
          q = query(q, where('status', '==', filterStatus));
        }

        const snapshot = await getDocs(q);
        let fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side search for display name or email
        if (searchQuery.trim()) {
          const lowerCaseQuery = searchQuery.toLowerCase();
          fetchedUsers = fetchedUsers.filter(user =>
            user.displayName?.toLowerCase().includes(lowerCaseQuery) ||
            user.email?.toLowerCase().includes(lowerCaseQuery) ||
            user.username?.toLowerCase().includes(lowerCaseQuery)
          );
        }

        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
        showNotification("Failed to load users.", 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole, searchQuery, filterStatus, showNotification]);


  const handleUpdateUserStatus = async (userId, newStatus, reason = '') => {
    if (!window.confirm(`Are you sure you want to change this user's status to '${newStatus}'?`)) {
      return;
    }
    setIsUpdatingUser(true);
    showNotification(`Updating user status to ${newStatus}...`, 'info');
    try {
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);
      await updateDoc(userProfileRef, {
        status: newStatus,
        banReason: newStatus === 'banned' || newStatus === 'suspended' ? reason : null,
        updatedAt: Timestamp.now(),
      });
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, status: newStatus, banReason: newStatus === 'banned' || newStatus === 'suspended' ? reason : null } : user));
      showNotification(`User status updated to ${newStatus}!`, 'success');
      setShowUserDetailsModal(false);
    } catch (err) {
      console.error("Error updating user status:", err);
      showNotification("Failed to update user status.", 'error');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleSendIndividualNotification = async (userId) => {
    if (!notificationMessage.trim()) {
      showNotification('Notification message cannot be empty.', 'error');
      return;
    }
    if (!window.confirm(`Send notification to ${selectedUser.displayName || selectedUser.email}: "${notificationMessage}"?`)) {
      return;
    }

    setIsUpdatingUser(true);
    showNotification('Sending notification...', 'info');
    try {
      const notificationsRef = collection(db, `artifacts/${appId}/users/${userId}/notifications`);
      await addDoc(notificationsRef, {
        type: 'info',
        message: notificationMessage,
        createdAt: Timestamp.now(),
        read: false,
        sender: currentUser.displayName || 'Admin',
      });
      showNotification('Notification sent successfully!', 'success');
      setNotificationMessage('');
    } catch (err) {
      console.error("Error sending notification:", err);
      showNotification('Failed to send notification.', 'error');
    } finally {
      setIsUpdatingUser(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.tabContainer}>
        <LoadingSkeleton width="100%" height="100px" style={{ marginBottom: '20px' }} />
        <LoadingSkeleton width="100%" height="300px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-box">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.tabContainer}>
      <h2 className={styles.sectionTitle}>User Management</h2>

      <div className={styles.filtersContainer}>
        <div className="form-group" style={{flexGrow: 1, marginBottom: 0}}>
          <label htmlFor="roleFilter" className="form-label" style={{display: 'none'}}>Filter by Role</label>
          <select id="roleFilter" className="input-field" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="organizer">Organizer</option>
            <option value="influencer">Influencer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group" style={{flexGrow: 1, marginBottom: 0}}>
          <label htmlFor="statusFilter" className="form-label" style={{display: 'none'}}>Filter by Status</label>
          <select id="statusFilter" className="input-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div className="form-group" style={{flexGrow: 2, marginBottom: 0}}>
          <label htmlFor="searchQuery" className="form-label" style={{display: 'none'}}>Search Users</label>
          <input
            type="text"
            id="searchQuery"
            className="input-field"
            placeholder="Search by name, email, or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="profile-section-card" style={{ textAlign: 'center', padding: '20px' }}>
          <p className="text-naks-text-secondary">No users found matching your criteria.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.displayName || user.username || user.email}</td>
                  <td>{user.email}</td>
                  <td>{user.role?.toUpperCase() || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                      {user.status?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td>{user.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button onClick={() => { setSelectedUser(user); setBanReason(user.banReason || ''); setNotificationMessage(''); setShowUserDetailsModal(true); }} className="btn btn-secondary btn-small">
                        <FaInfoCircle /> Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details and Status Update Modal */}
      <Modal isOpen={showUserDetailsModal} onClose={() => setShowUserDetailsModal(false)} title="User Details & Management">
        {selectedUser && (
          <div className={adminFormStyles.userDetailsModalContent}>
            <div className={adminFormStyles.userInfoSection}>
              <img src={selectedUser.avatarUrl || "https://placehold.co/80x80/E0E0E0/808080?text=U"} alt="User Avatar" className={adminFormStyles.userAvatar} />
              <h3>{selectedUser.displayName || selectedUser.username || selectedUser.email}</h3>
              <p><FaEnvelope /> {selectedUser.email}</p>
              {selectedUser.contactPhone && <p><FaPhone /> {selectedUser.contactPhone}</p>}
              {selectedUser.username && <p><FaUserCircle /> Username: {selectedUser.username}</p>}
              <p>Role: {selectedUser.role?.toUpperCase()}</p>
              <p>Current Status: <span className={`${adminFormStyles.statusBadge} ${adminFormStyles[selectedUser.status]}`}>{selectedUser.status?.toUpperCase()}</span></p>
              {selectedUser.banReason && <p className={adminFormStyles.banReasonText}><FaBan /> Reason: {selectedUser.banReason}</p>}
            </div>

            <div className={adminFormStyles.managementSection}>
              <h4>Update Status</h4>
              <div className={adminFormStyles.statusButtons}>
                <Button onClick={() => handleUpdateUserStatus(selectedUser.id, 'active')} className="btn btn-primary btn-small" disabled={isUpdatingUser || selectedUser.status === 'active'}>
                  <FaCheckCircle /> Set Active
                </Button>
                <Button onClick={() => handleUpdateUserStatus(selectedUser.id, 'pending')} className="btn btn-secondary btn-small" disabled={isUpdatingUser || selectedUser.status === 'pending'}>
                  <FaHourglassHalf /> Set Pending
                </Button>
                <Button onClick={() => { setBanReason(selectedUser.banReason || ''); handleUpdateUserStatus(selectedUser.id, 'suspended', banReason); }} className="btn btn-secondary btn-small" disabled={isUpdatingUser || selectedUser.status === 'suspended'}>
                  <FaBan /> Set Suspended
                </Button>
                <Button onClick={() => { setBanReason(selectedUser.banReason || ''); handleUpdateUserStatus(selectedUser.id, 'banned', banReason); }} className="btn btn-secondary btn-small" disabled={isUpdatingUser || selectedUser.status === 'banned'}>
                  <FaBan /> Set Banned
                </Button>
              </div>
              {(selectedUser.status === 'banned' || selectedUser.status === 'suspended') && (
                <div className="form-group" style={{width: '100%', marginTop: '15px'}}>
                  <label htmlFor="banReason" className="form-label">Reason for Ban/Suspension:</label>
                  <textarea id="banReason" className="input-field" rows="3" value={banReason} onChange={(e) => setBanReason(e.target.value)} disabled={isUpdatingUser} placeholder="Enter reason for ban/suspension..."></textarea>
                </div>
              )}

              <h4 style={{marginTop: '25px'}}>Send Notification</h4>
              <div className="form-group" style={{width: '100%'}}>
                <label htmlFor="notificationMessage" className="form-label">Message:</label>
                <textarea id="notificationMessage" className="input-field" rows="3" value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} disabled={isUpdatingUser} placeholder="Type your message here..."></textarea>
              </div>
              <Button onClick={() => handleSendIndividualNotification(selectedUser.id)} className="btn btn-primary" disabled={isUpdatingUser || !notificationMessage.trim()}>
                <FaPaperPlane /> Send Notification
              </Button>
            </div>

            <div className={adminFormStyles.modalActions}>
              <Button onClick={() => setShowUserDetailsModal(false)} className="btn btn-secondary">Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementTab;