import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import { FaUsers, FaDownload, FaSpinner } from 'react-icons/fa';

import styles from '../../organizer.module.css'; // Import the CSS module

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const RsvpApplicantsTab = ({ currentUser, showNotification }) => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [rsvpApplicants, setRsvpApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchRsvpData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const eventsRef = collection(db, `artifacts/${appId}/public/events`);
      const qEvents = query(eventsRef, where("organizerId", "==", currentUser.uid), where("eventType", "==", "rsvp"), orderBy("startDate", "desc"));
      const eventsSnap = await getDocs(qEvents);
      const fetchedEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(fetchedEvents);

      if (selectedEventId) {
        const applicantsRef = collection(db, `artifacts/${appId}/public/rsvps`);
        const qApplicants = query(applicantsRef, where("eventId", "==", selectedEventId), orderBy("rsvpedAt", "asc"));
        const applicantsSnap = await getDocs(qApplicants);
        setRsvpApplicants(applicantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setRsvpApplicants([]);
      }

    } catch (err) {
      console.error("Error fetching RSVP data:", err);
      setError("Failed to load RSVP data.");
      setEvents([]);
      setRsvpApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedEventId]);

  useEffect(() => {
    fetchRsvpData();
  }, [fetchRsvpData]);

  const handleEventSelect = (e) => {
    setSelectedEventId(e.target.value);
    setRsvpApplicants([]);
  };

  const handleDownloadCSV = useCallback(() => {
    if (rsvpApplicants.length === 0) {
      showNotification('No applicants to download for the selected event.', 'info');
      return;
    }

    setIsDownloading(true);
    showNotification('Preparing CSV download...', 'info');

    try {
      const headers = ["Name", "Email", "Phone", "RSVP Date", "Status"];
      const csvRows = [
        headers.join(','),
        ...rsvpApplicants.map(applicant => {
          const name = applicant.displayName || 'N/A';
          const email = applicant.email || 'N/A';
          const phone = applicant.phoneNumber || 'N/A';
          const rsvpDate = applicant.rsvpedAt ? new Date(applicant.rsvpedAt.toDate()).toLocaleString() : 'N/A';
          const status = applicant.status || 'Confirmed';
          return `"${name}","${email}","${phone}","${rsvpDate}","${status}"`;
        })
      ];

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `rsvp_applicants_${selectedEventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      showNotification('CSV downloaded successfully!', 'success');
    } catch (err) {
      console.error("Error generating CSV:", err);
      showNotification('Failed to download CSV: ' + err.message, 'error');
    } finally {
      setIsDownloading(false);
    }
  }, [rsvpApplicants, selectedEventId, showNotification]);


  if (loading) {
    return (
      <div className="section-content">
        <h3 className="section-title">RSVP Applicants</h3>
        <LoadingSkeleton width="100%" height="300px" />
      </div>
    );
  }

  if (error) {
    return <p className="error-message-box">{error}</p>;
  }

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="section-content">
      <h3 className="section-title">RSVP Applicants</h3>

      <div className="form-group">
        <label htmlFor="rsvpEventSelect" className="form-label">Select RSVP Event:</label>
        <select
          id="rsvpEventSelect"
          className="input-field"
          value={selectedEventId}
          onChange={handleEventSelect}
        >
          <option value="">-- Select an Event --</option>
          {events.length > 0 ? (
            events.map(event => (
              <option key={event.id} value={event.id}>{event.eventName}</option>
            ))
          ) : (
            <option value="" disabled>No RSVP events found.</option>
          )}
        </select>
      </div>

      {selectedEventId && (
        <div className="profile-section-card mt-6">
          <div className="section-header" style={{borderBottom: 'none', paddingBottom: '0'}}>
            <h4 className="section-title" style={{fontSize: '1.2rem', marginBottom: '0'}}>Applicants for "{selectedEvent?.eventName}" ({rsvpApplicants.length} total)</h4>
            <Button onClick={handleDownloadCSV} className="btn btn-secondary" disabled={rsvpApplicants.length === 0 || isDownloading}>
              {isDownloading ? <FaSpinner className="spinner mr-2" /> : <FaDownload />}
              {isDownloading ? 'Downloading...' : 'Download CSV'}
            </Button>
          </div>

          {rsvpApplicants.length > 0 ? (
            <div className="table-container mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>RSVP Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvpApplicants.map(applicant => (
                    <tr key={applicant.id}>
                      <td>{applicant.displayName || 'N/A'}</td>
                      <td>{applicant.email || 'N/A'}</td>
                      <td>{applicant.phoneNumber || 'N/A'}</td>
                      <td>{applicant.rsvpedAt ? new Date(applicant.rsvpedAt.toDate()).toLocaleString() : 'N/A'}</td>
                      <td>{applicant.status || 'Confirmed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="placeholder-content text-center mt-4">
              <FaUsers style={{color: 'var(--naks-info)'}} />
              <p>No applicants for this event yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RsvpApplicantsTab;