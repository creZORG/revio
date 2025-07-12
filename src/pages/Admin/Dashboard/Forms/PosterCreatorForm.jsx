import React, { useState, useCallback } from 'react';
import { db } from '../../../../utils/firebaseConfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../../hooks/useAuth.js';
import { useNotification } from '../../../../contexts/NotificationContext.jsx';
import Button from '../../../../components/Common/Button.jsx';
import LoadingSkeleton from '../../../../components/Common/LoadingSkeleton.jsx';

import styles from './AdminForms.module.css'; // Dedicated CSS for admin forms

import { FaPlus, FaImage, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const appId = "1:147113503727:web:1d9d351c30399b2970241a";

const PosterCreatorForm = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const storage = getStorage();

  const [posterData, setPosterData] = useState({
    title: '',
    description: '',
    bannerFile: null,
    bannerImageUrl: '',
    link: '', // Optional link for the poster
    category: '', // e.g., 'Music', 'Food', 'General'
    mainLocation: '', // e.g., 'Nakuru'
    startDate: '', // For display purposes, not functional date
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setPosterData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

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
      const imageRef = ref(storage, `admin_posters/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      setPosterData(prev => ({ ...prev, bannerImageUrl: downloadURL, bannerFile: file }));
      showNotification('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error("Error uploading image:", err);
      showNotification('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || currentUser.role !== 'admin') {
      showNotification('You do not have permission to create posters.', 'error');
      return;
    }

    const errors = {};
    if (!posterData.title.trim()) errors.title = 'Title is required.';
    if (!posterData.bannerImageUrl) errors.bannerImageUrl = 'Image is required.';
    if (!posterData.category.trim()) errors.category = 'Category is required.';
    if (!posterData.mainLocation.trim()) errors.mainLocation = 'Location is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotification('Please correct the errors in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    showNotification('Creating poster...', 'info');
    try {
      const postersCollectionRef = collection(db, `artifacts/${appId}/public/data_for_app/posters`);
      await addDoc(postersCollectionRef, {
        title: posterData.title,
        description: posterData.description,
        bannerImageUrl: posterData.bannerImageUrl,
        link: posterData.link,
        category: posterData.category,
        mainLocation: posterData.mainLocation,
        startDate: posterData.startDate, // Store as string, not Timestamp, as it's for display
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        type: 'poster', // Explicitly mark as poster
      });

      showNotification('Poster created successfully!', 'success');
      setPosterData({ // Reset form
        title: '', description: '', bannerFile: null, bannerImageUrl: '', link: '', category: '', mainLocation: '', startDate: ''
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error creating poster:", err);
      showNotification('Failed to create poster. ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionSubtitle}>Create New Poster</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="posterTitle" className="form-label">Poster Title <span className="required-star">*</span></label>
          <input type="text" id="posterTitle" name="title" className="input-field" value={posterData.title} onChange={handleInputChange} disabled={isSubmitting || isUploadingImage} placeholder="e.g., Nakuru Arts Fair" />
          {formErrors.title && <p className="error-message-box">{formErrors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="posterDescription" className="form-label">Description (Optional)</label>
          <textarea id="posterDescription" name="description" className="input-field" rows="3" value={posterData.description} onChange={handleInputChange} disabled={isSubmitting || isUploadingImage} placeholder="Brief description for the poster..."></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="bannerImage" className="form-label">Poster Image <span className="required-star">*</span></label>
          <div className={styles.fileUploadArea}>
            <input type="file" id="bannerImage" accept="image/*" onChange={handleImageUpload} disabled={isSubmitting || isUploadingImage} style={{ display: 'none' }} />
            <label htmlFor="bannerImage" className={styles.fileUploadLabel}>
              {posterData.bannerImageUrl ? (
                <img src={posterData.bannerImageUrl} alt="Poster Preview" className={styles.imagePreviewContainerImg} />
              ) : (
                <>
                  <FaImage className={styles.fileUploadIcon} />
                  <p className={styles.fileUploadText}>Click or drag to upload image (Max 5MB)</p>
                </>
              )}
            </label>
            {isUploadingImage && <p className={styles.uploadStatus}><FaSpinner className="spinner" /> Uploading...</p>}
          </div>
          {formErrors.bannerImageUrl && <p className="error-message-box">{formErrors.bannerImageUrl}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="posterLink" className="form-label">Optional Link (URL)</label>
          <input type="url" id="posterLink" name="link" className="input-field" value={posterData.link} onChange={handleInputChange} disabled={isSubmitting || isUploadingImage} placeholder="https://example.com/more-info" />
        </div>

        <div className="form-group">
          <label htmlFor="posterCategory" className="form-label">Category <span className="required-star">*</span></label>
          <input type="text" id="posterCategory" name="category" className="input-field" value={posterData.category} onChange={handleInputChange} disabled={isSubmitting || isUploadingImage} placeholder="e.g., Arts, Community, Food" />
          {formErrors.category && <p className="error-message-box">{formErrors.category}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="posterLocation" className="form-label">Main Location <span className="required-star">*</span></label>
          <input type="text" id="posterLocation" name="mainLocation" className="input-field" value={posterData.mainLocation} onChange={handleInputChange} disabled={isSubmitting || isUploadingImage} placeholder="e.g., Nakuru, Kenya" />
          {formErrors.mainLocation && <p className="error-message-box">{formErrors.mainLocation}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="posterStartDate" className="form-label">Display Date (Optional, e.g., Aug 12-15)</label>
          <input type="text" id="posterStartDate" name="startDate" className="input-field" value={posterData.startDate} onChange={handleInputChange} disabled={isSubmitting || isUploadingImage} placeholder="e.g., Aug 12-15, 2025" />
        </div>

        <div className={styles.actionButtons} style={{justifyContent: 'flex-end'}}>
          <Button type="submit" className="btn btn-primary" disabled={isSubmitting || isUploadingImage}>
            {isSubmitting ? <FaSpinner className="spinner" /> : <FaPlus />} Create Poster
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PosterCreatorForm;