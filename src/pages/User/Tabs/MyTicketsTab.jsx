// /src/pages/User/Tabs/MyTicketsTab.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaDownload, FaShareAlt, FaEye,FaQrcode } from 'react-icons/fa';
import { format } from 'date-fns';

import LoadingSkeleton from '../../../components/Common/LoadingSkeleton.jsx';
import Button from '../../../components/Common/Button.jsx';


import styles from './MyTicketsTab.module.css'; // Dedicated CSS for MyTicketsTab
import commonStyles from '../user.module.css'; // Common User Dashboard styles for sectionContent, sectionTitle


const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const MyTicketsTab = ({ currentUser, showNotification, tabDataLoading }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // CORRECTED COLLECTION REFERENCE PATH
        const bookingsRef = collection(db, `artifacts/${appId}/public/data_for_app/bookings`);
        // Assuming 'bookings' collection stores tickets associated with a userId
        const q = query(bookingsRef, where("userId", "==", currentUser.uid), orderBy("eventDate", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedTickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Mock data to enrich fetched tickets for display purposes
        const mockTickets = [
          {
            id: 'tkt_1',
            eventName: 'Nairobi Jazz Festival 2025',
            eventDate: '2025-08-20',
            eventTime: '19:00',
            location: 'KICC, Nairobi',
            ticketType: 'General Admission',
            quantity: 1,
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NAKSYETU-TKT-12345',
            status: 'Upcoming'
          },
          {
            id: 'tkt_2',
            eventName: 'Tech Summit Africa',
            eventDate: '2025-09-10',
            eventTime: '09:00',
            location: 'Online Event',
            ticketType: 'Virtual Pass',
            quantity: 1,
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NAKSYETU-TKT-67890',
            status: 'Upcoming'
          },
          {
            id: 'tkt_3',
            eventName: 'Weekend Foam Party',
            eventDate: '2025-07-20',
            eventTime: '22:00',
            location: 'Club Vibes',
            ticketType: 'VIP Access',
            quantity: 2,
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NAKSYETU-TKT-54321',
            status: 'Upcoming'
          }
        ];

        setTickets(fetchedTickets.length > 0 ? fetchedTickets : mockTickets); // Use fetched or mock if empty
      } catch (err) {
        console.error("Error fetching my tickets:", err);
        setError("Failed to load your tickets. Please try again.");
        showNotification("Failed to load your tickets.", 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [currentUser, showNotification]);

  const handleDownloadTicket = (ticketId) => {
    showNotification(`Downloading ticket ${ticketId}... (Mock Action)`, 'info');
    // In a real app, generate/download PDF or image
  };

  const handleShareTicket = (ticketId) => {
    showNotification(`Sharing ticket ${ticketId}... (Mock Action)`, 'info');
    // In a real app, open share sheet or copy link
  };

  const formatEventDateTime = (date, time) => {
    if (!date) return 'TBD';
    return format(new Date(`${date}T${time || '00:00'}`), 'MMM dd, yyyy @ hh:mm a');
  };

  if (loading || tabDataLoading) {
    return (
      <div className={`${commonStyles.sectionContent} ${commonStyles.loadingSection}`}>
        <h3 className={commonStyles.sectionTitle}>My Tickets</h3>
        <div className={styles.ticketsGrid}>
          {[...Array(3)].map((_, i) => ( // 3 skeleton ticket cards
            <div key={i} className={styles.ticketCard} style={{ height: '350px' }}>
              <LoadingSkeleton width="80%" height="24px" style={{ marginBottom: '15px' }} />
              <LoadingSkeleton width="100%" height="16px" style={{ marginBottom: '8px' }} />
              <LoadingSkeleton width="70%" height="16px" style={{ marginBottom: '8px' }} />
              <LoadingSkeleton width="50%" height="16px" style={{ marginBottom: '20px' }} />
              <LoadingSkeleton width="150px" height="150px" style={{ margin: '0 auto 15px auto', borderRadius: '8px' }} />
              <LoadingSkeleton width="100%" height="40px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${commonStyles.sectionContent} error-message-box`}>
        <p className="font-semibold">{error}</p>
        <p className="text-sm">Unable to load your tickets. Please check your connection.</p>
      </div>
    );
  }

  return (
    <div className={commonStyles.sectionContent}>
      <h3 className={commonStyles.sectionTitle}>My Tickets</h3>

      {tickets.length > 0 ? (
        <div className={styles.ticketsGrid}>
          {tickets.map(ticket => (
            <div key={ticket.id} className={styles.ticketCard}>
              <div className={styles.ticketHeader}>
                <h4 className={styles.ticketName}>{ticket.eventName}</h4>
                <span className={styles.ticketStatus}>{ticket.status}</span>
              </div>
              <div className={styles.ticketDetails}>
                <div className={styles.detailItem}>
                  <FaCalendarAlt />
                  <span>{formatEventDateTime(ticket.eventDate, ticket.eventTime)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaMapMarkerAlt />
                  <span>{ticket.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaTicketAlt />
                  <span>{ticket.quantity} x {ticket.ticketType}</span>
                </div>
              </div>
              {ticket.qrCodeUrl && (
                <div className={styles.ticketQRCode}>
                  <img src={ticket.qrCodeUrl} alt="QR Code" />
                </div>
              )}
              <div className={styles.ticketActions}>
                <Button className={styles.actionButton} onClick={() => showNotification(`Viewing details for ${ticket.eventName} (Mock)`, 'info')}>
                  <FaEye /> View Details
                </Button>
                <Button className={`${styles.actionButton} ${styles.primary}`} onClick={() => handleDownloadTicket(ticket.id)}>
                  <FaDownload /> Download Ticket
                </Button>
                <Button className={styles.actionButton} onClick={() => handleShareTicket(ticket.id)}>
                  <FaShareAlt /> Share
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noTicketsMessage}>
          You don't have any upcoming tickets yet. Start exploring events to find your next adventure!
        </p>
      )}
    </div>
  );
};

export default MyTicketsTab;