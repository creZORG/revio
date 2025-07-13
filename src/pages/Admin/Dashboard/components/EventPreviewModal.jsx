import React from 'react';
import Modal from '../../../../components/Common/Modal';
import styles from './Modals.module.css';
import { FaTicketAlt, FaDollarSign } from 'react-icons/fa';

const EventPreviewModal = ({ event, stats, isLoading, isOpen, onClose }) => {
  if (!event) return null;

  const formatCurrency = (amount) => `KES ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${event.name}`}>
      {isLoading ? (
        <p>Loading event stats...</p>
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.statGrid}>
            <div className={styles.statBox}>
              <FaTicketAlt className={styles.statIcon} />
              <span className={styles.statValue}>{stats.totalSales}</span>
              <span className={styles.statLabel}>Total Tickets Sold</span>
            </div>
            <div className={styles.statBox}>
              <FaDollarSign className={styles.statIcon} />
              <span className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</span>
              <span className={styles.statLabel}>Total Revenue</span>
            </div>
          </div>
          <div className={styles.detailsSection}>
            <h4>Event Details</h4>
            <p><strong>Organizer:</strong> {event.organizerName}</p>
            <p><strong>Status:</strong> <span className={styles.statusBadge}>{event.status}</span></p>
          </div>
        </div>
      )}
      <div className={styles.modalFooter}>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default EventPreviewModal;