import React, { useCallback, useRef, useState } from 'react';
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowRight, FaSpinner, FaCloudUploadAlt, FaTimes, FaPlus } from 'react-icons/fa'; // Added icons

import styles from '../CreateNightlifeEventWizard.module.css'; // Wizard specific styles

const NAKURU_LOCATIONS = [
  "", "Nakuru City", "Naivasha", "Gilgil", "Molo", "Njoro", "Rongai", "Subukia", "Bahati",
  "Kuresoi North", "Kuresoi South", "Nakuru East", "Nakuru West"
];

const NightlifeBasicInfoStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, isSubmitting }) => {
  const bannerFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null); // Ref for gallery file input

  const handleInputChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'bannerFile') {
        const file = files[0];
        setFormData(prev => ({ ...prev, bannerFile: file }));
        if (file) {
          setFormData(prev => ({ ...prev, bannerImageUrl: URL.createObjectURL(file) }));
          setFormErrors(prev => ({ ...prev, bannerFile: undefined }));
        }
      } else if (name === 'galleryFiles') {
        // Handle multiple gallery files
        const newFiles = Array.from(files);
        const updatedGallery = [...(formData.galleryFiles || []), ...newFiles].slice(0, 6); // Max 6 images
        setFormData(prev => ({ ...prev, galleryFiles: updatedGallery }));
        setFormErrors(prev => ({ ...prev, galleryFiles: undefined }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, [formData.galleryFiles, setFormData, setFormErrors]);

  const handleRemoveGalleryImage = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      galleryFiles: prev.galleryFiles.filter((_, index) => index !== indexToRemove)
    }));
  }, [setFormData]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (!formData.eventName.trim()) errors.eventName = 'Event Title is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.bannerFile && !formData.bannerImageUrl) errors.bannerFile = 'Event Banner Image is required.';
    if (!formData.mainLocation) errors.mainLocation = 'Main Location is required.';
    if (!formData.specificAddress.trim()) errors.specificAddress = 'Specific Address/Venue is required.';
    if (!formData.startDate) errors.startDate = 'Start Date is required.';
    if (!formData.startTime) errors.startTime = 'Start Time is required.';
    if (!formData.contactEmail.trim()) errors.contactEmail = 'Contact Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.contactEmail = 'Invalid email format.';

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    if (isNaN(startDateTime.getTime())) errors.startDate = 'Invalid Start Date or Time.';
    else if (startDateTime < new Date()) errors.startDate = 'Start Date & Time cannot be in the past.';

    if (formData.endDate && formData.endTime) {
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      if (isNaN(endDateTime.getTime())) errors.endDate = 'Invalid End Date or Time.';
      else if (startDateTime && endDateTime <= startDateTime) errors.endDate = 'End Date & Time must be after Start Date & Time.';
    } else if (formData.endDate && !formData.endTime) {
        errors.endTime = 'End Time is required if End Date is provided.';
    } else if (!formData.endDate && formData.endTime) {
        errors.endDate = 'End Date is required if End Time is provided.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleNext = () => {
    if (validateStep()) {
      onNext(formData);
    } else {
      // Show a general notification if validation fails
      // (Assuming showNotification is available from a parent context or passed down)
      // showNotification('Please correct the errors in Basic Information.', 'error');
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Nightlife Event Basic Information</h3>
      <div className="form-group">
        <label htmlFor="eventName" className={styles.formLabel}>Event Title <span className={styles.requiredStar}>*</span></label>
        <input type="text" id="eventName" name="eventName" className={styles.inputField} placeholder="e.g., Electric Nights Party" required value={formData.eventName} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.eventName && <p className="error-message-box">{formErrors.eventName}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className={styles.formLabel}>Description <span className={styles.requiredStar}>*</span></label>
        <textarea id="description" name="description" className={styles.inputField} rows="6" placeholder="Provide a detailed description of your nightlife event..." required value={formData.description} onChange={handleInputChange} disabled={isSubmitting}></textarea>
        {formErrors.description && <p className="error-message-box">{formErrors.description}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="bannerFile" className={styles.formLabel}>Event Banner Image <span className={styles.requiredStar}>*</span></label>
        <input type="file" id="bannerFile" name="bannerFile" className={`${styles.inputField} ${styles.fileUploadArea}`} accept="image/*" onChange={handleInputChange} disabled={isSubmitting} ref={bannerFileInputRef} />
        <p className={styles.fileUploadText}>Recommended: JPG, PNG, WebP (Max 5MB)</p>
        {formErrors.bannerFile && <p className="error-message-box">{formErrors.bannerFile}</p>}
        {formData.bannerImageUrl && (
          <div className={styles.imagePreviewContainer}>
            <p className={styles.formLabel}>Image Preview:</p>
            <img src={formData.bannerImageUrl} alt="Banner Preview" className={styles.imagePreviewContainerImg} />
            {isSubmitting && <p className={styles.uploadStatus}><FaSpinner className="spinner" /> Uploading...</p>}
          </div>
        )}
      </div>

      {/* NEW: Gallery Upload Section for Nightlife Events */}
      <div className="form-group">
        <label htmlFor="galleryFiles" className={styles.formLabel}>Event Gallery Images <span className="optional-label">(Max 6 images)</span></label>
        <label htmlFor="galleryFiles" className={`${styles.fileUploadArea} ${styles.galleryUploadArea}`}>
            <FaCloudUploadAlt className={styles.fileUploadIcon} />
            <p className={styles.fileUploadText}>Drag & Drop gallery images here, or click to browse</p>
            <input type="file" id="galleryFiles" name="galleryFiles" className={styles.inputField} accept="image/*" multiple onChange={handleInputChange} disabled={isSubmitting || (formData.galleryFiles?.length || 0) >= 6} ref={galleryFileInputRef} />
        </label>
        {formErrors.galleryFiles && <p className="error-message-box">{formErrors.galleryFiles}</p>}
        
        {(formData.galleryFiles && formData.galleryFiles.length > 0) && (
            <div className={styles.filePreviewContainer}>
                {formData.galleryFiles.map((file, index) => (
                    <div key={index} className={styles.filePreviewItem}>
                        <img src={URL.createObjectURL(file)} alt={`Gallery Image ${index + 1}`} />
                        <button type="button" onClick={() => handleRemoveGalleryImage(index)} className={styles.removeFileBtn} disabled={isSubmitting}>
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="mainLocation" className={styles.formLabel}>Main Location <span className={styles.requiredStar}>*</span></label>
        <select id="mainLocation" name="mainLocation" className={styles.inputField} required value={formData.mainLocation} onChange={handleInputChange} disabled={isSubmitting}>
          {NAKURU_LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc || "Select Main Location"}</option>
          ))}
        </select>
        {formErrors.mainLocation && <p className="error-message-box">{formErrors.mainLocation}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="specificAddress" className={styles.formLabel}>Specific Address/Venue <span className={styles.requiredStar}>*</span></label>
        <input type="text" id="specificAddress" name="specificAddress" className={styles.inputField} placeholder="e.g., Club XYZ, Milimani" required value={formData.specificAddress} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.specificAddress && <p className="error-message-box">{formErrors.specificAddress}</p>}
      </div>

      <div className={`${styles.formGroup} ${styles.grid2}`}>
        <div>
          <label htmlFor="startDate" className={styles.formLabel}>Start Date <span className={styles.requiredStar}>*</span></label>
          <input type="date" id="startDate" name="startDate" className={styles.inputField} required value={formData.startDate} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.startDate && <p className="error-message-box">{formErrors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="startTime" className={styles.formLabel}>Start Time <span className={styles.requiredStar}>*</span></label>
          <input type="time" id="startTime" name="startTime" className={styles.inputField} required value={formData.startTime} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.startTime && <p className="error-message-box">{formErrors.startTime}</p>}
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.grid2}`}>
        <div>
          <label htmlFor="endDate" className={styles.formLabel}>End Date <span className="optional-label">(Optional)</span></label>
          <input type="date" id="endDate" name="endDate" className={styles.inputField} value={formData.endDate} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.endDate && <p className="error-message-box">{formErrors.endDate}</p>}
        </div>
        <div>
          <label htmlFor="endTime" className={styles.formLabel}>End Time <span className="optional-label">(Optional)</span></label>
          <input type="time" id="endTime" name="endTime" className={styles.inputField} value={formData.endTime} onChange={handleInputChange} disabled={isSubmitting} />
          {formErrors.endTime && <p className="error-message-box">{formErrors.endTime}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contactEmail" className={styles.formLabel}>Contact Email <span className={styles.requiredStar}>*</span></label>
        <input type="email" id="contactEmail" name="contactEmail" className={styles.inputField} placeholder="contact@yourevent.com" required value={formData.contactEmail} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.contactEmail && <p className="error-message-box">{formErrors.contactEmail}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="contactPhone" className={styles.formLabel}>Contact Phone <span className="optional-label">(Optional)</span></label>
        <input type="tel" id="contactPhone" name="contactPhone" className={styles.inputField} placeholder="+254 7XX XXX XXX" value={formData.contactPhone} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.contactPhone && <p className="error-message-box">{formErrors.contactPhone}</p>}
      </div>

      <div className={`${styles.actionButtons} ${styles.justifyEnd}`}>
        <Button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
          Next Step <FaArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default NightlifeBasicInfoStep;