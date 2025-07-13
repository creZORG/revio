import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Common/Modal';
import styles from './Modals.module.css';

const EventEditModal = ({ event, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', description: '', date: '' });

  useEffect(() => {
    if (event) {
      // Format the date correctly for the input field
      const eventDate = event.date?.seconds ? new Date(event.date.seconds * 1000).toISOString().split('T')[0] : '';
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date: eventDate,
      });
    }
  }, [event]);

  if (!event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Convert date back to a format you can use, e.g., a Firestore Timestamp
    const updatedData = {
      ...formData,
      date: new Date(formData.date),
    };
    onSave(event.id, updatedData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editing: ${event.name}`}>
      <div className={styles.modalContent}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Event Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.textInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="date">Event Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={styles.textInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Event Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={styles.textInput}
          />
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>
    </Modal>
  );
};

export default EventEditModal;