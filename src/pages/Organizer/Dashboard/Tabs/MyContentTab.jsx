import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import { FaPlus, FaEye, FaEdit, FaTrashAlt, FaChartBar, FaTicketAlt, FaStar,FaDollarSign, FaUsers } from 'react-icons/fa'; // Added FaTrashAlt, FaChartBar, FaTicketAlt, FaStar, FaUsers

import styles from './mycontent.module.css'; // NEW: Import dedicated CSS module
import organizerStyles from '../../organizer.module.css'; // For shared dashboard styles

const appId = "1:147113503727:web:1d9d351c30399b2970241a"; // Hardcoded appId

const MyContentTab = ({ currentUser, showNotification }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizerEvents = useCallback(async () => {
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch events created by the current organizer
      const eventsRef = collection(db, `artifacts/${appId}/public/data_for_app/events`);
      // Query for events where organizerId matches current user's UID
      // Also, filter out events that are 'deleted' or 'taken_down' for display in this list
      const q = query(
        eventsRef,
        where("organizerId", "==", currentUser.uid),
        where("status", "in", ["pending", "active", "rejected"]), // Only show these statuses
        orderBy("createdAt", "desc") // Order by creation date
      );
      const snapshot = await getDocs(q);
      const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching organizer events:", err);
      setError("Failed to load your events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrganizerEvents();
  }, [fetchOrganizerEvents]);

  const handleSoftDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to take down "${eventName}"? It will no longer be visible to users.`)) {
      return;
    }
    if (!currentUser || !currentUser.uid) {
      showNotification('You must be logged in to modify events.', 'error');
      return;
    }
    try {
      const eventDocRef = doc(db, `artifacts/${appId}/public/data_for_app/events`, eventId);
      await updateDoc(eventDocRef, { status: 'taken_down' }); // Set status to 'taken_down'
      showNotification(`Event "${eventName}" has been taken down.`, 'success');
      fetchOrganizerEvents(); // Re-fetch events to update the list
    } catch (err) {
      console.error("Error taking down event:", err);
      showNotification(`Failed to take down event: ${err.message}`, 'error');
    }
  };

  const handleEditEvent = (eventId) => {
    showNotification(`Editing event ID: ${eventId} (Feature coming soon!)`, 'info');
    // Implement navigation to an edit form later
    // navigate(`/dashboard/organizer/edit-event/${eventId}`);
  };

  if (loading) {
    return (
      <div className={`${organizerStyles.formSection} ${styles.myContentSection}`}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>My Events</h3>
          <LoadingSkeleton width="150px" height="40px" style={{borderRadius: '8px'}} />
        </div>
        <div className={styles.tableContainer}>
          <LoadingSkeleton width="100%" height="300px" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="error-message-box">{error}</p>;
  }

  return (
    <div className={`${organizerStyles.formSection} ${styles.myContentSection}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>My Events</h3>
        <Button onClick={() => setActiveSection('create-event')} className="btn btn-primary">
          <FaPlus /> Add New Event
        </Button>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.eventsTable}>
          <thead>
            <tr>
              <th>Event</th>
              <th>Status</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map(event => (
                <tr key={event.id}>
                  <td>
                    <img src={event.bannerImageUrl || "https://placehold.co/80x50/E0E0E0/808080?text=No+Img"} alt={event.eventName} className={styles.eventBannerThumbnail} />
                    {event.eventName}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status-${event.status.toLowerCase().replace(' ', '_')}`]}`}>
                      {event.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.statsRow}>
                      <span className={styles.statsItem}><FaEye /> <span className={styles.value}>{event.pageViews || 0}</span> Views</span>
                      <span className={styles.statsItem}><FaTicketAlt /> <span className={styles.value}>{event.ticketsSold || 0}</span> Sold</span>
                      <span className={styles.statsItem}><FaDollarSign /> <span className={styles.value}>{(event.totalSales || 0).toLocaleString()}</span> Sales</span> {/* Assuming totalSales field */}
                      <span className={styles.statsItem}><FaStar /> <span className={styles.value}>{event.averageRating || 'N/A'}</span> Rating</span> {/* Assuming averageRating field */}
                    </div>
                  </td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => handleEditEvent(event.id)} className={`${styles.actionIconBtn} ${styles.edit}`}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleSoftDeleteEvent(event.id, event.eventName)} className={`${styles.actionIconBtn} ${styles.delete}`}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: 'var(--naks-text-secondary)'}}>
                  No events found. Click "Add New Event" to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyContentTab;