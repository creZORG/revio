import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collectionGroup, onSnapshot, query, orderBy, limit, where, getDocs, doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { useAuth } from '../../../../hooks/useAuth';
import { useNotification } from '../../../../contexts/NotificationContext';
import DataTable from '../components/DataTable';
import ChangeRoleModal from '../components/ChangeRoleModal';
import ChangeStatusModal from '../components/ChangeStatusModal';
import UserProfileModal from '../components/UserProfileModal';
import styles from './UserManagementTab.module.css';
import { FaSearch, FaUserEdit, FaUserSlash, FaUserShield, FaEye } from 'react-icons/fa';

// --- Helper Functions ---
const getSearchQuery = (term) => {
  if (/\S+@\S+\.\S+/.test(term)) return where('email', '==', term);
  if (/^\+?\d{10,15}$/.test(term)) return where('phoneNumber', '==', term);
  if (term.length === 28 && /^[a-zA-Z0-9]+$/.test(term)) return where('uid', '==', term);
  return where('displayName', '>=', term);
};

// This function is updated to include deviceInfo
const logAdminAction = async (adminUser, action, targetUser, details = {}) => {
  try {
    const logsRef = collection(db, "admin_logs");
    await addDoc(logsRef, {
      adminId: adminUser.uid,
      adminName: adminUser.displayName,
      action,
      targetUserId: targetUser.id,
      targetUserName: targetUser.displayName,
      details,
      timestamp: serverTimestamp(),
      // NEW: Device information is now logged with every action
      deviceInfo: navigator.userAgent
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};


const UserManagementTab = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { showNotification } = useNotification();

  // State for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // State for filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // --- Data Fetching ---
  useEffect(() => {
    setLoading(true);
    let q = collectionGroup(db, 'profiles');
    let constraints = [];

    // Apply filters
    if (roleFilter !== 'all') {
      constraints.push(where('role', '==', roleFilter));
    }
    if (statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }
    
    // Apply search or default view
    if (isSearching && searchTerm.trim()) {
        constraints.push(getSearchQuery(searchTerm.trim()));
    } else {
        constraints.push(orderBy("createdAt", "desc"));
        if (!roleFilter !== 'all' && !statusFilter !== 'all') {
            constraints.push(limit(10));
        }
    }
    
    q = query(q, ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        path: doc.ref.path,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
      }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSearching, searchTerm, roleFilter, statusFilter]);
  
  const handleSearch = (e) => {
      e.preventDefault();
      setIsSearching(!!searchTerm.trim());
  }

  // --- Action Handlers ---
  const openModal = (user, modalSetter) => {
    setSelectedUser(user);
    modalSetter(true);
  };

  const handleRoleChange = async (user, newRole) => {
    const userRef = doc(db, user.path);
    try {
      await updateDoc(userRef, { role: newRole });
      await logAdminAction(currentUser, 'Role Change', user, { from: user.role, to: newRole });
      showNotification(`${user.displayName}'s role updated to ${newRole}.`, 'success');
    } catch (error) {
      showNotification("Failed to update role.", 'error');
    }
  };

  const handleStatusChange = async (user, statusDetails) => {
    const userRef = doc(db, user.path);
    try {
      const { status, notify, suspensionEndDate } = statusDetails;
      await updateDoc(userRef, { status, suspensionEndDate: suspensionEndDate || null });
      await logAdminAction(currentUser, 'Status Change', user, { to: status, notifiedUser: notify });
      showNotification(`${user.displayName}'s status updated to ${status}.`, 'success');
      if (notify) {
        console.log(`Placeholder: Notifying ${user.email} about status change.`);
        // Here you would call a cloud function to send an email.
      }
    } catch (error) {
      showNotification("Failed to update status.", 'error');
    }
  };
  
  // --- Table Column Definitions ---
  const columns = useMemo(() => [
    { Header: 'Display Name', accessor: 'displayName' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Role', accessor: 'role', Cell: ({ value }) => <span className={`${styles.role} ${styles[value]}`}>{value}</span> },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`${styles.role} ${styles[value]}`}>{value || 'active'}</span> },
  ], []);

  const renderActionButtons = (user) => (
    <div className={styles.actionButtons}>
      <button onClick={() => openModal(user, setIsProfileModalOpen)} className={styles.actionIconBtn} title="View Profile"><FaEye /></button>
      <button onClick={() => openModal(user, setIsRoleModalOpen)} className={styles.actionIconBtn} title="Change Role"><FaUserShield /></button>
      <button onClick={() => openModal(user, setIsStatusModalOpen)} className={styles.actionIconBtn} title="Change Status"><FaUserSlash /></button>
    </div>
  );

  const usersWithActions = useMemo(() =>
    users.map(user => ({ ...user, actions: renderActionButtons(user) })),
    [users]
  );
  
  const columnsWithActions = useMemo(() => [
      ...columns, { Header: 'Actions', accessor: 'actions', Cell: ({ value }) => value }
  ], [columns]);

  return (
    <>
      <div className={styles.userManagementSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>User Management</h3>
        </div>

        <div className={styles.controlsContainer}>
            <form onSubmit={handleSearch} className={styles.searchContainer}>
                <input type="text" placeholder="Search by Name, Email, Phone, or UID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput}/>
                <button type="submit" className={styles.searchButton}><FaSearch /></button>
            </form>
            <div className={styles.filterGroup}>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={styles.filterSelect}>
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="organizer">Organizer</option>
                    <option value="influencer">Influencer</option>
                    <option value="admin">Admin</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
            </div>
        </div>

        <DataTable
          columns={columnsWithActions}
          data={usersWithActions}
          isLoading={loading}
          noDataMessage="No users match the current criteria."
        />
      </div>

      {/* Render Modals */}
      {selectedUser && (
          <>
            <ChangeRoleModal user={selectedUser} currentUser={currentUser} isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onRoleChange={handleRoleChange}/>
            <ChangeStatusModal user={selectedUser} isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} onStatusChange={handleStatusChange} />
            <UserProfileModal user={selectedUser} currentUser={currentUser} isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
          </>
      )}
    </>
  );
};

export default UserManagementTab;