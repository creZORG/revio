import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useAuth } from '../../../../hooks/useAuth';
import DataTable from '../components/DataTable';
import styles from './EventModerationTab.module.css';
import { FaCheck, FaTimes, FaArrowDown, FaEdit } from 'react-icons/fa';

// This is the specific App ID for your project's data structure
const appId = "1:147113503727:web:1d9d351c30399b2970241a";

// --- Service Function to log admin actions ---
const logAdminAction = async (adminUser, action, targetEvent) => {
  // This function is a placeholder for your real logging function.
  // You would expand this to save to an 'admin_logs' collection.
  console.log(`Admin Action: ${adminUser.displayName} performed '${action}' on event '${targetEvent.name}'`);
};


const EventModerationTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // Default to 'pending' as it's the primary action queue
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();

  // Construct the correct, full path to the events collection
  const eventsCollectionPath = `artifacts/${appId}/public/data_for_app/events`;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const eventsCollectionRef = collection(db, eventsCollectionPath);
      let eventsQuery;

      // Build the query based on the selected filter
      if (filter === 'all') {
        eventsQuery = query(eventsCollectionRef, orderBy("createdAt", "desc"));
      } else {
        eventsQuery = query(eventsCollectionRef, where("status", "==", filter), orderBy("createdAt", "desc"));
      }
      
      const eventsSnapshot = await getDocs(eventsQuery);
      setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching events for moderation:", error);
      showNotification('Failed to fetch events. Check Firestore path and rules.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, eventsCollectionPath, showNotification]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAction = async (eventId, eventName, newStatus, actionVerb) => {
    // Construct the full path to the specific event document
    const eventRef = doc(db, eventsCollectionPath, eventId);
    try {
      await updateDoc(eventRef, { status: newStatus });
      await logAdminAction(currentUser, actionVerb, { name: eventName });
      showNotification(`Event has been ${actionVerb}.`, 'success');
      // Refresh the data by removing the updated item from the current view
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    } catch (error) {
      showNotification(`Failed to ${actionVerb.toLowerCase()} the event.`, 'error');
      console.error(`Error ${actionVerb.toLowerCase()}ing event:`, error);
    }
  };

  const columns = useMemo(() => [
    { Header: 'Event Name', accessor: 'name' },
    { Header: 'Organizer', accessor: 'organizerName' },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value.seconds * 1000).toLocaleDateString() : 'N/A' },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`${styles.status} ${styles[value?.toLowerCase()]}`}>
          {value}
        </span>
      ),
    },
  ], []);

  const renderActionButtons = (event) => {
    const status = event.status?.toLowerCase();
    return (
      <div className={styles.actionButtons}>
        {status === 'pending' && (
          <>
            <button onClick={() => handleAction(event.id, event.name, 'live', 'Approved')} className={`${styles.actionIconBtn} ${styles.approve}`} title="Approve"><FaCheck /></button>
            <button onClick={() => handleAction(event.id, event.name, 'rejected', 'Rejected')} className={`${styles.actionIconBtn} ${styles.reject}`} title="Reject"><FaTimes /></button>
          </>
        )}
        {status === 'live' && (
          <button onClick={() => handleAction(event.id, event.name, 'archived', 'Taken Down')} className={`${styles.actionIconBtn} ${styles.takedown}`} title="Take Down"><FaArrowDown /></button>
        )}
        <button onClick={() => alert(`Editing for "${event.name}" to be implemented.`)} className={`${styles.actionIconBtn} ${styles.edit}`} title="Edit"><FaEdit /></button>
      </div>
    );
  };

  const dataWithActions = useMemo(() =>
    events.map(event => ({
      ...event,
      actions: renderActionButtons(event)
    })), [events]
  );

  const columnsWithActions = useMemo(() => [
    ...columns,
    { Header: 'Actions', accessor: 'actions', Cell: ({ value }) => value }
  ], [columns]);


  return (
    <div className={styles.moderationSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Event Moderation Queue</h3>
        <div className={styles.filterContainer}>
          <button onClick={() => setFilter('pending')} className={filter === 'pending' ? styles.activeFilter : ''}>Pending</button>
          <button onClick={() => setFilter('live')} className={filter === 'live' ? styles.activeFilter : ''}>Live</button>
          <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? styles.activeFilter : ''}>Rejected</button>
          <button onClick={() => setFilter('archived')} className={filter === 'archived' ? styles.activeFilter : ''}>Archived</button>
          <button onClick={() => setFilter('all')} className={filter === 'all' ? styles.activeFilter : ''}>All</button>
        </div>
      </div>
      <DataTable
        columns={columnsWithActions}
        data={dataWithActions}
        isLoading={loading}
        noDataMessage="No events match the current filter."
      />
    </div>
  );
};

export default EventModerationTab;