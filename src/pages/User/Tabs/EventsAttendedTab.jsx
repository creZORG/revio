import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Button from '../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import { FaCalendarCheck, FaStar, FaFlag } from 'react-icons/fa';

import styles from '../user.module.css'; // NEW: Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const EventsAttendedTab = ({ currentUser, showNotification, tabDataLoading }) => {
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendedEvents = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const attendedRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/attended_events`);
        const q = query(attendedRef, orderBy("attendedDate", "desc"));
        const snapshot = await getDocs(q);
        const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAttendedEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching attended events:", err);
        setError("Failed to load your attended events.");
        setAttendedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendedEvents();
  }, [currentUser]);

  const handleRateEvent = (eventId) => {
    showNotification(`Rating event ${eventId}... (Simulated)`, 'info');
  };

  const handleReportIssue = (eventId) => {
    showNotification(`Reporting issue for event ${eventId}... (Simulated)`, 'info');
  };

  if (loading || tabDataLoading) {
    return (
      <div>
        <h2>Events Attended</h2>
        <LoadingSkeleton width="100%" height="150px" className="mb-4" style={{backgroundColor: 'var(--background-color)'}} />
        <LoadingSkeleton width="100%" height="150px" className="mb-4" style={{backgroundColor: 'var(--background-color)'}} />
      </div>
    );
  }

  if (error) {
    return <p className="error-message-box">{error}</p>;
  }

  return (
    <div>
      <h2>Events Attended</h2>
      {attendedEvents.length > 0 ? (
        <div className={styles.attendedEventList}> {/* Use styles.attendedEventList */}
          {attendedEvents.map(event => (
            <div key={event.id} className={styles.attendedEventItem}> {/* Use styles.attendedEventItem */}
              <div className={styles.eventDetails}> {/* Use styles.eventDetails */}
                <span className={styles.attendedEventName}>{event.eventName || 'Event Name'}</span>
                <span className={styles.attendedEventDate}> {/* Use styles.attendedEventDate */}
                  <FaCalendarCheck /> Attended: {event.attendedDate ? new Date(event.attendedDate.toDate()).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className={styles.eventActions}> {/* Use styles.eventActions */}
                <span className={styles.yourRating}> {/* Use styles.yourRating */}
                  Your rating:
                  {event.rating ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className={`ml-1 ${i < event.rating ? 'fas fa-star' : 'far fa-star'}`} />
                    ))
                  ) : (
                    <span className="ml-1">Not yet rated</span>
                  )}
                </span>
                <Button onClick={() => handleRateEvent(event.id)} className="btn action-btn">
                  <FaStar /> Rate
                </Button>
                <Button onClick={() => handleReportIssue(event.id)} className="btn action-btn">
                  <FaFlag /> Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-section-card placeholder-content">
          <FaCalendarCheck style={{color: 'var(--naks-orange-logo)'}} />
          <p>No events attended yet.</p>
          <Link to="/events" className="btn btn-primary">Find Events</Link>
        </div>
      )}
    </div>
  );
};

export default EventsAttendedTab;