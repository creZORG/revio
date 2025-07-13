import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, doc, onSnapshot, query, where, orderBy, getDocs, updateDoc, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useAuth } from '../../../../hooks/useAuth';
import DataTable from '../components/DataTable';
import EventEditModal from '../components/EventEditModal';
import EventPreviewModal from '../components/EventPreviewModal';
import styles from './ContentTab.module.css';
import { FaSearch, FaCheck, FaTimes, FaArrowDown, FaEdit, FaEye } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";
const eventsCollectionPath = `artifacts/${appId}/public/data_for_app/events`;
const ordersCollectionPath = `artifacts/${appId}/public/data_for_app/orders`;

// --- Real Logging Function ---
const logAdminAction = async (adminUser, action, targetEvent) => {
  try {
    const logsRef = collection(db, "admin_logs");
    await addDoc(logsRef, {
      adminId: adminUser.uid,
      adminName: adminUser.displayName,
      action: action,
      targetType: 'event',
      targetId: targetEvent.id,
      targetName: targetEvent.name,
      details: { newStatus: targetEvent.newStatus || 'N/A' },
      timestamp: serverTimestamp(),
      deviceInfo: navigator.userAgent
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};


const ContentTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();

  // Combined State for Filters and Search
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // 'name' or 'organizerName'

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Stats State
  const [eventStats, setEventStats] = useState({ totalSales: 0, totalRevenue: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // --- Unified Data Fetching ---
  useEffect(() => {
    setLoading(true);
    const eventsRef = collection(db, eventsCollectionPath);
    let queryConstraints = [];

    // Apply status filter (unless 'all' is selected)
    if (statusFilter !== 'all') {
      queryConstraints.push(where('status', '==', statusFilter));
    }

    // Apply search filter if a search term exists
    if (searchTerm.trim()) {
      queryConstraints.push(where(searchField, '>=', searchTerm.trim()));
      queryConstraints.push(where(searchField, '<=', searchTerm.trim() + '\uf8ff'));
    }
    
    // Always order by creation date
    queryConstraints.push(orderBy('createdAt', 'desc'));

    const q = query(eventsRef, ...queryConstraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      showNotification('Failed to fetch events.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter, searchTerm, searchField]);

  // --- Action Handlers ---
  const handleModerationAction = async (event, newStatus, actionVerb) => {
    const eventRef = doc(db, eventsCollectionPath, event.id);
    try {
      await updateDoc(eventRef, { status: newStatus });
      await logAdminAction(currentUser, `Event ${actionVerb}`, { ...event, newStatus });
      showNotification(`Event has been ${actionVerb}.`, 'success');
    } catch (error) {
      showNotification(`Failed to ${actionVerb.toLowerCase()} the event.`, 'error');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleSave = async (eventId, updatedData) => {
    const eventRef = doc(db, eventsCollectionPath, eventId);
    try {
      const dataToSave = { ...updatedData, date: Timestamp.fromDate(new Date(updatedData.date)) };
      await updateDoc(eventRef, dataToSave);
      await logAdminAction(currentUser, 'Event Edited', { id: eventId, name: dataToSave.name });
      showNotification('Event updated successfully!', 'success');
      setIsEditModalOpen(false);
    } catch (error) {
      showNotification('Failed to update event.', 'error');
    }
  };

  const handleView = async (event) => {
    setSelectedEvent(event);
    setIsPreviewModalOpen(true);
    setIsStatsLoading(true);
    try {
      const ordersRef = collection(db, ordersCollectionPath);
      const q = query(ordersRef, where('eventId', '==', event.id));
      const querySnapshot = await getDocs(q);
      let totalSales = 0;
      let totalRevenue = 0;
      querySnapshot.forEach(doc => {
        totalSales += doc.data().quantity || 1;
        totalRevenue += doc.data().totalPrice || 0;
      });
      setEventStats({ totalSales, totalRevenue });
    } catch (error) {
      setEventStats({ totalSales: 'N/A', totalRevenue: 'N/A' });
    } finally {
      setIsStatsLoading(false);
    }
  };

  const columns = useMemo(() => [
    { Header: 'Event Name', accessor: 'name' },
    { Header: 'Organizer', accessor: 'organizerName' },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value.seconds * 1000).toLocaleDateString() : 'N/A' },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`${styles.status} ${styles[value?.toLowerCase()]}`}>{value}</span> },
    { Header: 'Actions', accessor: 'id', Cell: ({ row: { original } }) => {
        const status = original.status?.toLowerCase();
        return (
            <div className={styles.actionButtons}>
                <button onClick={() => handleView(original)} className={`${styles.actionIconBtn} ${styles.view}`} title="View Stats"><FaEye /></button>
                <button onClick={() => handleEdit(original)} className={`${styles.actionIconBtn} ${styles.edit}`} title="Edit"><FaEdit /></button>
                {status === 'pending' && (
                  <>
                    <button onClick={() => handleModerationAction(original, 'live', 'Approved')} className={`${styles.actionIconBtn} ${styles.approve}`} title="Approve"><FaCheck /></button>
                    <button onClick={() => handleModerationAction(original, 'rejected', 'Rejected')} className={`${styles.actionIconBtn} ${styles.reject}`} title="Reject"><FaTimes /></button>
                  </>
                )}
                {status === 'live' && (
                  <button onClick={() => handleModerationAction(original, 'archived', 'Taken Down')} className={`${styles.actionIconBtn} ${styles.takedown}`} title="Take Down"><FaArrowDown /></button>
                )}
            </div>
        );
    }}
  ], []);

  return (
    <>
      <div className={styles.contentSection}>
        <div className={styles.controlsHeader}>
            <div className={styles.statusFilters}>
                <button onClick={() => setStatusFilter('pending')} className={statusFilter === 'pending' ? styles.activeFilter : ''}>Pending</button>
                <button onClick={() => setStatusFilter('live')} className={statusFilter === 'live' ? styles.activeFilter : ''}>Live</button>
                <button onClick={() => setStatusFilter('rejected')} className={statusFilter === 'rejected' ? styles.activeFilter : ''}>Rejected</button>
                <button onClick={() => setStatusFilter('archived')} className={statusFilter === 'archived' ? styles.activeFilter : ''}>Archived</button>
                <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? styles.activeFilter : ''}>All</button>
            </div>
            <div className={styles.searchContainer}>
                <select value={searchField} onChange={e => setSearchField(e.target.value)}>
                    <option value="name">by Event Name</option>
                    <option value="organizerName">by Organizer</option>
                </select>
                <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <DataTable
          columns={columns}
          data={events}
          isLoading={loading}
          noDataMessage="No events match the current filters."
        />
      </div>

      {/* Modals */}
      <EventEditModal event={selectedEvent} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} />
      <EventPreviewModal event={selectedEvent} stats={eventStats} isLoading={isStatsLoading} isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} />
    </>
  );
};

export default ContentTab;