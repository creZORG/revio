import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../../hooks/useAuth.js';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';
import Modal from '../../../../components/Common/Modal.jsx';

import styles from './AdminForms.module.css'; // Dedicated CSS for admin forms

import { FaPlus, FaImage, FaSpinner, FaCheckCircle, FaRegEdit, FaTrashAlt, FaLink, FaSort } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const CarouselManagerForm = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const storage = getStorage();

  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItemToEdit, setCurrentItemToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', imageUrl: '', link: '', order: '' });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch carousel items
  useEffect(() => {
    const fetchCarouselItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const carouselRef = collection(db, `artifacts/${appId}/public/data_for_app/carouselItems`);
        const q = query(carouselRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCarouselItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching carousel items:", err);
        setError("Failed to load carousel items.");
        showNotification("Failed to load carousel items.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCarouselItems();
  }, [showNotification]);

  const handleEditItem = (item) => {
    setCurrentItemToEdit(item);
    setEditForm({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      order: item.order || '',
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!isAuthenticated || currentUser.role !== 'admin') {
      showNotification('You do not have permission to delete carousel items.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this carousel item? This action cannot be undone.')) {
      return;
    }

    setIsSavingItem(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/data_for_app/carouselItems`, itemId));
      setCarouselItems(prev => prev.filter(item => item.id !== itemId));
      showNotification('Carousel item deleted successfully!', 'success');
    } catch (err) {
      console.error("Error deleting carousel item:", err);
      showNotification('Failed to delete carousel item.', 'error');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // Max 5MB
      showNotification('Image must be less than 5MB.', 'error');
      return;
    }

    setIsUploadingImage(true);
    showNotification('Uploading image...', 'info');
    try {
      const imageRef = ref(storage, `carousel_images/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      setEditForm(prev => ({ ...prev, imageUrl: downloadURL }));
      showNotification('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error("Error uploading image:", err);
      showNotification('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || currentUser.role !== 'admin') {
      showNotification('You do not have permission to save carousel items.', 'error');
      return;
    }

    const errors = {};
    if (!editForm.title.trim()) errors.title = 'Title is required.';
    if (!editForm.imageUrl) errors.imageUrl = 'Image is required.';
    if (isNaN(parseInt(editForm.order))) errors.order = 'Order must be a number.';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showNotification('Please correct the errors in the form.', 'error');
      return;
    }

    setIsSavingItem(true);
    try {
      const itemData = {
        title: editForm.title,
        imageUrl: editForm.imageUrl,
        link: editForm.link,
        order: parseInt(editForm.order),
        updatedAt: Timestamp.now(),
      };

      if (currentItemToEdit?.id) { // Editing existing item
        await updateDoc(doc(db, `artifacts/${appId}/public/data_for_app/carouselItems`, currentItemToEdit.id), itemData);
        showNotification('Carousel item updated successfully!', 'success');
      } else { // Creating new item
        await addDoc(collection(db, `artifacts/${appId}/public/data_for_app/carouselItems`), {
          ...itemData,
          createdAt: Timestamp.now(),
        });
        showNotification('New carousel item created successfully!', 'success');
      }
      setShowEditModal(false);
      setCurrentItemToEdit(null);
      // Re-fetch items to ensure list is updated
      const carouselRef = collection(db, `artifacts/${appId}/public/data_for_app/carouselItems`);
      const q = query(carouselRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setCarouselItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (err) {
      console.error("Error saving carousel item:", err);
      showNotification('Failed to save carousel item. ' + err.message, 'error');
    } finally {
      setIsSavingItem(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.formSection}>
        <LoadingSkeleton width="100%" height="200px" className="mb-4" />
        <LoadingSkeleton width="100%" height="150px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-box">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionSubtitle}>Manage Homepage Carousel</h3>
      
      <Button onClick={() => { setCurrentItemToEdit(null); setEditForm({ title: '', imageUrl: '', link: '', order: '' }); setShowEditModal(true); }} className="btn btn-primary">
        <FaPlus /> Add New Carousel Item
      </Button>

      {carouselItems.length === 0 ? (
        <div className="profile-section-card" style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
          <p className="text-naks-text-secondary">No carousel items added yet.</p>
        </div>
      ) : (
        <div className={styles.tableContainer} style={{marginTop: '20px'}}>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Title</th>
                <th>Image</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {carouselItems.map(item => (
                <tr key={item.id}>
                  <td>{item.order}</td>
                  <td>{item.title}</td>
                  <td><img src={item.imageUrl} alt={item.title} style={{width: '80px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                  <td>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer"><FaLink /></a> : 'N/A'}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button onClick={() => handleEditItem(item)} className="btn btn-secondary btn-small">
                        <FaRegEdit /> Edit
                      </Button>
                      <Button onClick={() => handleDeleteItem(item.id)} className="btn btn-secondary btn-small" disabled={isSavingItem}>
                        <FaTrashAlt /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Carousel Item Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={currentItemToEdit ? 'Edit Carousel Item' : 'Add New Carousel Item'}>
        <form onSubmit={handleSaveItem} className={styles.modalForm}>
          <div className="form-group">
            <label htmlFor="itemTitle" className="form-label">Title <span className="required-star">*</span></label>
            <input type="text" id="itemTitle" name="title" className="input-field" value={editForm.title} onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} disabled={isSavingItem || isUploadingImage} placeholder="e.g., Summer Festival Banner" />
            {editErrors.title && <p className="error-message-box">{editErrors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="itemImage" className="form-label">Image <span className="required-star">*</span></label>
            <div className={styles.fileUploadArea}>
              <input type="file" id="itemImage" accept="image/*" onChange={handleImageUpload} disabled={isSavingItem || isUploadingImage} style={{ display: 'none' }} />
              <label htmlFor="itemImage" className={styles.fileUploadLabel}>
                {editForm.imageUrl ? (
                  <img src={editForm.imageUrl} alt="Item Preview" className={styles.imagePreviewContainerImg} />
                ) : (
                  <>
                    <FaImage className={styles.fileUploadIcon} />
                    <p className={styles.fileUploadText}>Click or drag to upload image (Max 5MB)</p>
                  </>
                )}
              </label>
              {isUploadingImage && <p className={styles.uploadStatus}><FaSpinner className="spinner" /> Uploading...</p>}
            </div>
            {editErrors.imageUrl && <p className="error-message-box">{editErrors.imageUrl}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="itemLink" className="form-label">Link (URL)</label>
            <input type="url" id="itemLink" name="link" className="input-field" value={editForm.link} onChange={(e) => setEditForm(prev => ({ ...prev, link: e.target.value }))} disabled={isSavingItem || isUploadingImage} placeholder="https://naksyetu.com/events/item-id" />
          </div>

          <div className="form-group">
            <label htmlFor="itemOrder" className="form-label">Display Order <span className="required-star">*</span></label>
            <input type="number" id="itemOrder" name="order" className="input-field" value={editForm.order} onChange={(e) => setEditForm(prev => ({ ...prev, order: e.target.value }))} disabled={isSavingItem || isUploadingImage} placeholder="e.g., 1 (lower number appears first)" />
            {editErrors.order && <p className="error-message-box">{editErrors.order}</p>}
          </div>

          <div className={styles.modalActions}>
            <Button onClick={() => setShowEditModal(false)} className="btn btn-secondary" disabled={isSavingItem}>Cancel</Button>
            <Button type="submit" className="btn btn-primary" disabled={isSavingItem || isUploadingImage}>
              {isSavingItem ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
              {isSavingItem ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CarouselManagerForm;