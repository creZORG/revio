import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Button from '../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';

import styles from '../user.module.css'; // NEW: Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const MyTicketsTab = ({ currentUser, showNotification, tabDataLoading }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const ticketsRef = collection(db, `artifacts/${appId}/public/bookings`);
        const q = query(ticketsRef, where("userId", "==", currentUser.uid), orderBy("eventDate", "desc"));
        const snapshot = await getDocs(q);
        const fetchedTickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(fetchedTickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load your tickets.");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentUser]);

  const handleDownloadTicket = (ticketId) => {
    showNotification(`Downloading ticket ${ticketId}... (Simulated)`, 'info');
  };

  if (loading || tabDataLoading) {
    return (
      <div>
        <h2>My Tickets</h2>
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
      <h2>My Tickets</h2>
      {tickets.length > 0 ? (
        <div className={styles.ticketList}> {/* Use styles.ticketList */}
          {tickets.map(ticket => (
            <div key={ticket.id} className={styles.ticketItem}> {/* Use styles.ticketItem */}
              <div className={styles.ticketInfo}> {/* Use styles.ticketInfo */}
                <span className={styles.ticketEventName}>{ticket.eventName || 'Event Name'}</span>
                <span className={styles.ticketDateLocation}> {/* Use styles.ticketDateLocation */}
                  <FaCalendarAlt /> {ticket.eventDate ? new Date(ticket.eventDate.toDate()).toLocaleDateString() : 'N/A'}
                  <span>|</span>
                  <FaMapMarkerAlt /> {ticket.location || 'N/A'}
                </span>
                <span className={styles.ticketTypeQty}>{ticket.ticketType || 'Standard Ticket'} (x{ticket.quantity || 1})</span>
              </div>
              <div className={styles.ticketActions}> {/* Use styles.ticketActions */}
                <span className={styles.ticketPrice}>Ksh {ticket.price ? ticket.price.toLocaleString() : 'N/A'}</span>
                <Button onClick={() => handleDownloadTicket(ticket.id)} className="btn action-btn">
                  <FaDownload /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-section-card placeholder-content">
          <FaTicketAlt />
          <p>No tickets purchased yet.</p>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      )}
    </div>
  );
};

export default MyTicketsTab;