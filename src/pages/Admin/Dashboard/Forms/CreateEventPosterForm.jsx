import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebaseConfig';
import { useAuth } from '../../../../hooks/useAuth';
import { useNotification } from '../../../../contexts/NotificationContext';
import styles from './AdminForms.module.css';
import DataTable from '../components/DataTable';
import ImageUpload from '../../../../components/Common/ImageUpload'; // Assuming this component exists
import Modal from '../../../../components/Common/Modal';

const CreateEventPosterForm = () => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [eventName, setEventName] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [eventType, setEventType] = useState('paid');
  const [eventDate, setEventDate] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);

  // Fetch posters in real-time
  useEffect(() => {
    const postersRef = collection(db, 'display_events');
    const q = query(postersRef, where('status', '!=', 'deleted'), orderBy('status'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posterData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosters(posterData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setEventName('');
    setBannerUrl('');
    setEventType('paid');
    setEventDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName || !bannerUrl || !eventDate) {
      showNotification('Please fill all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'display_events'), {
        name: eventName,
        bannerUrl,
        type: eventType,
        date: eventDate,
        status: 'live',
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });
      showNotification('Event Poster created successfully!', 'success');
      resetForm();
    } catch (error) {
      console.error("Error creating event poster:", error);
      showNotification('Failed to create poster.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDelete = async (poster) => {
    if (window.confirm(`Are you sure you want to delete the poster for "${poster.name}"?`)) {
      const posterRef = doc(db, 'display_events', poster.id);
      try {
        await updateDoc(posterRef, { status: 'deleted' });
        showNotification('Poster deleted.', 'success');
      } catch (error) {
        showNotification('Failed to delete poster.', 'error');
      }
    }
  };
  
  const openEditModal = (poster) => {
      setEditingPoster(poster);
      setIsEditModalOpen(true);
  }

  const handleUpdatePoster = async (e) => {
      e.preventDefault();
      const posterRef = doc(db, 'display_events', editingPoster.id);
      try {
          await updateDoc(posterRef, {
              name: editingPoster.name,
              bannerUrl: editingPoster.bannerUrl,
              type: editingPoster.type,
              date: editingPoster.date,
          });
          showNotification('Poster updated successfully!', 'success');
          setIsEditModalOpen(false);
          setEditingPoster(null);
      } catch (error) {
          showNotification('Failed to update poster.', 'error');
      }
  }

  const columns = useMemo(() => [
    { Header: 'Event Name', accessor: 'name' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Date', accessor: 'date' },
  ], []);

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h3 className={styles.formTitle}>Create New Event Poster</h3>
        <div className={styles.formGrid}>
            <div className={styles.formGroup}>
                <label>Event Name</label>
                <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g., NaxVegas Vibez" />
            </div>
            <div className={styles.formGroup}>
                <label>Event Date</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
                <label>Event Type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}>
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                    <option value="rsvp">RSVP</option>
                </select>
            </div>
        </div>
        <div className={styles.formGroup}>
          <label>Event Banner (Upload or Link)</label>
          <ImageUpload onUpload={url => setBannerUrl(url)} folder="event-posters" />
          <input type="text" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="Or paste image URL here" style={{marginTop: '10px'}} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Event Poster'}
        </button>
      </form>

      <div className={styles.managementSection}>
        <h3 className={styles.formTitle}>Manage Posters</h3>
        <DataTable
            columns={columns}
            data={posters}
            isLoading={loading}
            onEdit={openEditModal}
            onDelete={handleSoftDelete}
        />
      </div>

      {editingPoster && (
          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${editingPoster.name}`}>
              <form onSubmit={handleUpdatePoster} className={styles.formContainer} style={{padding: 0, boxShadow: 'none'}}>
                  <div className={styles.formGroup}>
                      <label>Event Name</label>
                      <input type="text" value={editingPoster.name} onChange={e => setEditingPoster({...editingPoster, name: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                      <label>Event Date</label>
                      <input type="date" value={editingPoster.date} onChange={e => setEditingPoster({...editingPoster, date: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                      <label>Event Type</label>
                      <select value={editingPoster.type} onChange={e => setEditingPoster({...editingPoster, type: e.target.value})}>
                          <option value="paid">Paid</option>
                          <option value="free">Free</option>
                          <option value="rsvp">RSVP</option>
                      </select>
                  </div>
                   <div className={styles.formGroup}>
                      <label>Banner URL</label>
                      <input type="text" value={editingPoster.bannerUrl} onChange={e => setEditingPoster({...editingPoster, bannerUrl: e.target.value})} />
                  </div>
                  <div className={styles.modalFooter}>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
              </form>
          </Modal>
      )}
    </div>
  );
};

export default CreateEventPosterForm;