import React, { useState } from 'react';
import styles from '../../../Tabs/CreateEventWizard.module.css'; // Access common wizard styles
import ImageUpload from '../../../../../../components/Common/ImageUpload.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
import TextInput from '../../../../../../components/Common/TextInput.jsx'; // For disclaimer
import RichTextEditor from '../../../../../../components/Common/RichTextEditor.jsx';
import { useAuth } from '../../../../../../hooks/useAuth.js';
import { uploadFileToFirebaseStorage, deleteFileFromFirebaseStorage } from '../../../../../../services/storageService.js';
import { useNotification } from '../../../../../../contexts/NotificationContext.jsx';





const BasicInfoStep = ({ formData, updateFormData, nextStep }) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const categories = ['Music', 'Arts & Culture', 'Tech & Innovation', 'Sports', 'Community', 'Business', 'Education', 'Food & Drink', 'Health & Wellness'];
  const ageCategories = ['All Ages', 'Under 18', '18+', '21+'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleBannerFileChange = async (file) => {
    // This console.log is crucial for debugging
    console.log('BasicInfoStep: Attempting banner upload. Current User UID:', currentUser?.uid, 'File received by onFilesChange:', file);
    setUploadError(null);
    
    // If file is null (image removed by ImageUpload component)
    if (!file) {
      if (formData.bannerImageUrl && formData.bannerImageUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        try {
          await deleteFileFromFirebaseStorage(formData.bannerImageUrl);
          showNotification('Old banner removed from storage.', 'info');
        } catch (error) {
          showNotification('Failed to remove old banner from storage.', 'error');
          console.error("Error deleting old banner:", error);
        }
      }
      updateFormData({ bannerFile: null, bannerImageUrl: '' });
      return;
    }

    if (!currentUser?.uid) {
      setUploadError("Authentication required to upload image. Please log in.");
      showNotification("Authentication required to upload image. Please log in.", 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const downloadURL = await uploadFileToFirebaseStorage(
        file,
        currentUser.uid,
        'event_banners', // Specific folder path for event banners
        (progress) => { setUploadProgress(progress); } // Progress callback
      );
      updateFormData({ bannerFile: file, bannerImageUrl: downloadURL });
      showNotification('Banner uploaded successfully!', 'success');
    } catch (error) {
      console.error("Error uploading banner:", error);
      setUploadError(`Banner upload failed: ${error.message}`);
      showNotification(`Banner upload failed: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRichTextChange = (content) => {
    updateFormData({ description: content });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Basic Event Information</h3>
      <p className="text-gray-600 mb-6">Tell us about your event's core details.</p>

      <div className={styles.formGroup}>
        <label htmlFor="eventName" className={styles.formLabel}>Event Title</label>
        <TextInput
          id="eventName"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          placeholder="e.g., Nakuru Music Festival 2025"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.formLabel}>Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={handleRichTextChange}
          placeholder="Provide a detailed description of your event..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Event Banner Image</label>
        <ImageUpload 
          onFilesChange={handleBannerFileChange} // Pass the File object to parent
          previewUrls={formData.bannerImageUrl ? [formData.bannerImageUrl] : []} // Pass current URL for preview
          multiple={false} // Ensure single file upload
          error={uploadError}
        />
        {isUploading && (
          <div className="text-sm text-gray-500 mt-2">Uploading: {uploadProgress.toFixed(0)}%</div>
        )}
        {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category" className={styles.formLabel}>Event Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={styles.formSelect}
          required
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="eventTags" className={styles.formLabel}>Tags (comma-separated)</label>
        <TextInput
          id="eventTags"
          name="eventTags"
          value={formData.eventTags}
          onChange={handleChange}
          placeholder="e.g., music, festival, pop, rock"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="targetAge" className={styles.formLabel}>Target Age Category</label>
        <select
          id="targetAge"
          name="targetAge"
          value={formData.targetAge}
          onChange={handleChange}
          className={styles.formSelect}
          required
        >
          <option value="">Select age category</option>
          {ageCategories.map(age => (
            <option key={age} value={age}>{age}</option>
          ))}
        </select>
      </div>

      <h4 className="text-lg font-semibold mt-8 mb-4">Location & Schedule</h4>
      <div className={styles.formGroup}>
        <label htmlFor="mainLocation" className={styles.formLabel}>Main Location (Nakuru Sub-County)</label>
        <TextInput
          id="mainLocation"
          name="mainLocation"
          value={formData.mainLocation}
          onChange={handleChange}
          placeholder="e.g., Nakuru West, Bahati"
          required={!formData.isOnlineEvent}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="specificAddress" className={styles.formLabel}>Specific Address/Venue</label>
        <TextInput
          id="specificAddress"
          name="specificAddress"
          value={formData.specificAddress}
          onChange={handleChange}
          placeholder="e.g., Nakuru Athletic Club, Section 58"
          required={!formData.isOnlineEvent}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="startDate" className={styles.formLabel}>Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className={styles.formInput}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="startTime" className={styles.formLabel}>Start Time</label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className={styles.formInput}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="endDate" className={styles.formLabel}>End Date (Optional)</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="endTime" className={styles.formLabel}>End Time (Optional)</label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className={styles.formInput}
        />
      </div>

      <p className="text-sm text-gray-500 mt-4">Contact Email will be fetched from your Organizer Profile.</p>

      <div className={styles.buttonGroup}>
        <Button onClick={nextStep} primary disabled={isUploading}>Next</Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;