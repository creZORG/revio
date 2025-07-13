import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, doc, onSnapshot, query, where, orderBy, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { useNotification } from '../../../../contexts/NotificationContext';
import DataTable from '../components/DataTable';
import EventEditModal from '../components/EventEditModal';
import EventPreviewModal from '../components/EventPreviewModal';
import styles from './ContentManagementTab.module.css';
import { FaSearch } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";
const eventsCollectionPath = `artifacts/${appId}/public/data_for_app/events`;
const ordersCollectionPath = `artifacts/${appId}/public/data_for_app/orders`;

const ContentManagementTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('eventName');

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Stats State
  const [eventStats, setEventStats] = useState({ totalSales: 0, totalRevenue: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const eventsRef = collection(db, eventsCollectionPath);
    let q = query(eventsRef, orderBy('createdAt', 'desc'));

    if (searchTerm.trim()) {
      const field = searchType === 'eventName' ? 'name' : 'organizerName';
      q = query(eventsRef, where(field, '>=', searchTerm), where(field, '<=', searchTerm + '\uf8ff'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [searchTerm, searchType]);

  useEffect(() => {
    const unsubscribe = fetchEvents();
    return () => unsubscribe.then(unsub => unsub());
  }, [fetchEvents]);

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleSave = async (eventId, updatedData) => {
    const eventRef = doc(db, eventsCollectionPath, eventId);
    try {
      // Convert date string back to Firestore Timestamp
      const dataToSave = {
        ...updatedData,
        date: Timestamp.fromDate(new Date(updatedData.date))
      };
      await updateDoc(eventRef, dataToSave);
      showNotification('Event updated successfully!', 'success');
      setIsEditModalOpen(false);
    } catch (error) {
      showNotification('Failed to update event.', 'error');
      console.error("Error updating event:", error);
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
        totalSales += doc.data().quantity || 1; // Assuming each order has a quantity
        totalRevenue += doc.data().totalPrice || 0;
      });

      setEventStats({ totalSales, totalRevenue });
    } catch (error) {
      console.error("Error fetching event stats:", error);
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
  ], []);

  return (
    <>
      <div className={styles.contentManagementSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Manage All Events</h3>
          <div className={styles.searchContainer}>
            <select value={searchType} onChange={e => setSearchType(e.target.value)}>
              <option value="eventName">Search by Event</option>
              <option value="organizerName">Search by Organizer</option>
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
          noDataMessage="No events found."
          onView={handleView}
          onEdit={handleEdit}
        />
      </div>

      {/* Modals */}
      <EventEditModal
        event={selectedEvent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
      <EventPreviewModal
        event={selectedEvent}
        stats={eventStats}
        isLoading={isStatsLoading}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </>
  );
};

export default ContentManagementTab;