// src/pages/Organizer/Dashboard/Tabs/MyEventsTab.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth.js'; // Corrected import path with extension
import { useNotification } from '../../../../contexts/NotificationContext.jsx'; // Corrected import path with extension
import { getOrganizerEvents, updateEventStatus } from '../../../../services/eventApiService.js'; // Corrected import path with extension
import { PencilSquareIcon, TrashIcon, EyeIcon, CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline'; // Icons for edit/delete
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx'; // Corrected import path with extension
import Modal from '../../../../components/Common/Modal.jsx'; // Corrected import path with extension
import commonButtonStyles from '../Tabs/CreateEventWizard.module.css'; // Reusing common button styles
import styles from './MyEventsTab.module.css'; // NEW: Import dedicated CSS module


const MyEventsTab = () => {
  const { currentUser, loadingAuth } = useAuth();
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log("MyEventsTab: Attempting to fetch events for Organizer UID:", currentUser?.uid);

      if (!currentUser?.uid) {
        setLoading(false);
        console.log("MyEventsTab: User not authenticated, cannot fetch events.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedEvents = await getOrganizerEvents(currentUser.uid);
        setEvents(fetchedEvents);
        console.log("MyEventsTab: Fetched events successfully:", fetchedEvents); 
        if (fetchedEvents.length === 0) {
            console.log("MyEventsTab: No events found for this organizer.");
        }
      } catch (err) {
        console.error("MyEventsTab: Failed to fetch organizer events:", err); 
        setError("Failed to load your events. Please try again later.");
        showNotification("Failed to load events: " + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (!loadingAuth) { 
      fetchEvents();
    }
  }, [currentUser, loadingAuth, showNotification]);

  const handleEditEvent = (eventId) => {
    showNotification(`Edit functionality for event ID: ${eventId} not yet implemented.`, 'info');
    console.log("Editing event:", eventId);
  };

  const confirmDeleteEvent = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await updateEventStatus(eventToDelete.id, 'taken_down');
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventToDelete.id ? { ...event, status: 'taken_down' } : event
        )
      );
      showNotification('Event successfully taken down.', 'success');
    } catch (err) {
      console.error("Failed to soft delete event:", err);
      showNotification(`Failed to take down event: ${err.message}`, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  if (loading || loadingAuth) {
    return (
      <div className={styles.myEventsTabContainer}> {/* Apply container styles */}
        <h2 className={styles.tabHeader}>My Events</h2> {/* Apply header style */}
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.myEventsTabContainer}> {/* Apply container styles */}
        <h2 className={styles.tabHeader}>My Events</h2> {/* Apply header style */}
        <p className={styles.errorMessage}>{error}</p> {/* Apply error message style */}
      </div>
    );
  }

  if (!currentUser?.uid) {
    return (
      <div className={styles.myEventsTabContainer}> {/* Apply container styles */}
        <h2 className={styles.tabHeader}>My Events</h2> {/* Apply header style */}
        <p className={styles.tabDescription}>Please log in as an organizer to view your events.</p> {/* Apply description style */}
      </div>
    );
  }

  return (
    <div className={styles.myEventsTabContainer}> {/* Apply container styles */}
      <h2 className={styles.tabHeader}>My Events</h2> {/* Apply header style */}
      <p className={styles.tabDescription}>Manage all your created events here. You can view details, edit, or check their status.</p>

      {events.length === 0 ? (
        <div className={styles.noEventsMessage}> {/* Apply no events message styles */}
          <p className={styles.noEventsTitle}>No events created yet.</p>
          <p className={styles.noEventsText}>Start by creating a new event using the "Create Event" tab.</p>
        </div>
      ) : (
        <div className={styles.eventsGrid}> {/* Apply events grid styles */}
          {events.map((event) => (
            <div 
              key={event.id} 
              className={`${styles.eventCard} ${event.status === 'taken_down' ? styles.eventCardTakenDown : ''}`} 
            >
              <div className={styles.eventCardHeader}>
                <h3 className={styles.eventTitle}>{event.eventName}</h3> 
                <div className={styles.eventActions}> 
                  {event.status !== 'taken_down' && (
                    <button 
                      onClick={() => handleEditEvent(event.id)} 
                      className={styles.actionButton} /* Apply action button style */
                      title="Edit Event"
                    >
                      <PencilSquareIcon className={styles.actionButton.icon} /> {/* Apply icon style */}
                    </button>
                  )}
                  <button 
                    onClick={() => confirmDeleteEvent(event)} 
                    className={styles.actionButton} /* Apply action button style */
                    title="Delete Event"
                  >
                    <TrashIcon className={styles.actionButton.icon} /> {/* Apply icon style */}
                  </button>
                </div>
              </div>
              <p className={styles.eventCategoryDate}>
                {event.category || 'N/A'} - {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'} at {event.startTime || 'N/A'}
              </p>
              <div className={styles.eventPerformance}> {/* Apply performance style */}
                <div className={styles.performanceItem}>
                    <EyeIcon className={styles.actionButton.icon} /> Views: <span className={styles.metricValue}>{event.pageViews || 0}</span>
                </div>
                <div className={styles.performanceItem}>
                    <CurrencyDollarIcon className={styles.actionButton.icon} /> Total Sales: <span className={styles.metricValue}>Ksh {event.totalSales ? event.totalSales.toFixed(2) : '0.00'}</span> {/* Placeholder for Total Sales */}
                </div>
                <div className={styles.performanceItem}>
                    <PresentationChartLineIcon className={styles.actionButton.icon} /> Revenue: <span className={styles.metricValue}>Ksh {event.revenueGenerated ? event.revenueGenerated.toFixed(2) : '0.00'}</span> {/* Placeholder for Revenue Generated */}
                </div>
                <div className={styles.performanceItem}>Status: 
                    <span className={`${styles.statusText} ${
                        event.status === 'active' ? styles.statusActive :
                        event.status === 'pending_review' ? styles.statusPending :
                        event.status === 'taken_down' ? styles.statusTakenDown : styles.statusOther
                    }`}>
                        {event.status ? event.status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
        <p className="mb-6">Are you sure you want to delete the event: <span className="font-semibold">{eventToDelete?.eventName}</span>?</p>
        <p className="text-sm text-gray-600 mb-6">This action will make the event unavailable to the public. You can contact support to reactivate it if needed.</p>
        <div className={styles.modalButtons}> {/* Apply modal button container style */}
          <button onClick={() => setIsDeleteModalOpen(false)} className={commonButtonStyles.secondaryButton}>Cancel</button>
          <button onClick={handleDeleteEvent} className={`${commonButtonStyles.primaryButton} ${commonButtonStyles.submitButton}`}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default MyEventsTab;