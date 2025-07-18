// src/pages/Organizer/Dashboard/Forms/CreateEventWizard/Steps/GalleryAndSponsorsStep.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect for cleanup in remove, useState for local states
import styles from '../../../Tabs/CreateEventWizard.module.css'; // Correct path to shared wizard styles
import Button from '../../../../../../components/Common/Button.jsx'; // Corrected import path with extension
import ImageUpload from '../../../../../../components/Common/ImageUpload.jsx'; // Corrected import path with extension
import TextInput from '../../../../../../components/Common/TextInput.jsx'; // Corrected import path with extension

import { useAuth } from '../../../../../../hooks/useAuth.js'; // Corrected import path with extension
import { uploadFileToFirebaseStorage, deleteFileFromFirebaseStorage } from '../../../../../../services/storageService.js'; // Corrected import path with extension
import { useNotification } from '../../../../../../contexts/NotificationContext.jsx'; // Corrected import path with extension
import { PlusCircleIcon, TrashIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import commonFormStyles from '../../../Tabs/CreateEventWizard.module.css';






const GalleryAndSponsorsStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  // State to track upload progress/errors for ALL gallery images
  const [galleryUploadStates, setGalleryUploadStates] = useState({}); 
  // State to track upload progress/errors for ALL sponsor logos
  const [sponsorLogoUploadStates, setSponsorLogoUploadStates] = useState({}); 

  // --- Gallery Image Handlers & Logic ---
  const MAX_GALLERY_IMAGES = 6; 
  const MAX_FILE_SIZE_MB = 6; 

  // This handler now receives an ARRAY of files from ImageUpload (since multiple={true})
  const handleGalleryFilesChange = async (files) => {
    console.log(`GalleryAndSponsorsStep: Handling gallery files change. User UID:`, currentUser?.uid, 'Files received by onFilesChange:', files);

    // Filter out files that exceed the limit or are not images
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showNotification(`File '${file.name}' is not an image.`, 'error');
        return false;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        showNotification(`File '${file.name}' size exceeds ${MAX_FILE_SIZE_MB}MB limit.`, 'error');
        return false;
      }
      return true;
    });

    // Determine how many new valid files can be added without exceeding MAX_GALLERY_IMAGES
    const currentImageCount = formData.galleryFiles.filter(Boolean).length; // Count non-null files
    const filesToAdd = validFiles.slice(0, MAX_GALLERY_IMAGES - currentImageCount);

    if (filesToAdd.length === 0) {
        if (validFiles.length > 0) { // If there were valid files, but couldn't add due to limit
            showNotification(`You can upload a maximum of ${MAX_GALLERY_IMAGES} gallery images.`, 'warning');
        }
        return;
    }

    if (!currentUser?.uid) {
      showNotification("Authentication required to upload image. Please log in.", 'error');
      return;
    }

    const newGalleryFiles = [...formData.galleryFiles];
    const newGalleryImageUrls = [...formData.galleryImageUrls];
    const newUploadStates = { ...galleryUploadStates };
    let uploadPromises = [];

    for (let i = 0; i < filesToAdd.length; i++) {
        const file = filesToAdd[i];
        // Find the first available (null) slot, or append if no null slots
        let slotIndex = newGalleryFiles.indexOf(null);
        if (slotIndex === -1) {
            slotIndex = newGalleryFiles.length; // Append to end
            newGalleryFiles.push(null);
            newGalleryImageUrls.push('');
        }

        newUploadStates[slotIndex] = { isUploading: true, progress: 0, error: null };
        setGalleryUploadStates({ ...newUploadStates }); // Update state immediately

        uploadPromises.push(
            uploadFileToFirebaseStorage(
                file,
                currentUser.uid,
                'event_galleries',
                (progress) => setGalleryUploadStates(prev => ({ ...prev, [slotIndex]: { ...prev[slotIndex], progress: progress } }))
            )
            .then(downloadURL => {
                newGalleryFiles[slotIndex] = file;
                newGalleryImageUrls[slotIndex] = downloadURL;
                showNotification(`Gallery image ${slotIndex + 1} uploaded successfully!`, 'success');
                return { success: true, index: slotIndex };
            })
            .catch(error => {
                console.error(`Error uploading gallery image ${slotIndex + 1}:`, error);
                const errorMsg = `Upload failed for ${file.name}: ${error.message}`;
                setGalleryUploadStates(prev => ({ ...prev, [slotIndex]: { ...prev[slotIndex], error: errorMsg } }));
                showNotification(errorMsg, 'error');
                newGalleryFiles[slotIndex] = null; // Clear file if upload fails
                newGalleryImageUrls[slotIndex] = '';
                return { success: false, index: slotIndex, error: errorMsg };
            })
            .finally(() => {
                setGalleryUploadStates(prev => ({ ...prev, [slotIndex]: { ...prev[slotIndex], isUploading: false, progress: 0 } }));
            })
        );
    }

    // Update formData after all uploads are initiated (or failed)
    // The actual URLs will be updated as promises resolve
    updateFormData({ galleryFiles: newGalleryFiles, galleryImageUrls: newGalleryImageUrls });

    // Wait for all uploads to complete (or fail)
    await Promise.all(uploadPromises);
  };


  const removeGalleryImage = async (indexToRemove) => {
    const oldUrl = formData.galleryImageUrls[indexToRemove];
    if (oldUrl && oldUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        try {
            await deleteFileFromFirebaseStorage(oldUrl);
            showNotification(`Gallery image ${indexToRemove + 1} removed from storage.`, 'info');
        } catch (error) {
            showNotification(`Failed to remove gallery image ${indexToRemove + 1} from storage.`, 'error');
            console.error("Error deleting old gallery image:", error);
        }
    }

    // Remove the slot from the form data arrays
    const newGalleryFiles = formData.galleryFiles.filter((_, i) => i !== indexToRemove);
    const newGalleryImageUrls = formData.galleryImageUrls.filter((_, i) => i !== indexToRemove);
    updateFormData({ galleryFiles: newGalleryFiles, galleryImageUrls: newGalleryImageUrls });
    
    setGalleryUploadStates(prev => { // Clear upload state for this index
      const newState = { ...prev };
      delete newState[indexToRemove]; 
      return newState;
    });
  };

  // --- Sponsor Handlers ---

  const addSponsor = () => {
    updateFormData(prevData => ({
      ...prevData,
      sponsors: [...prevData.sponsors, { name: '', logoFile: null, logoUrl: '', websiteUrl: '' }] 
    }));
  };

  const handleSponsorChange = (index, field, value) => {
    const newSponsors = [...formData.sponsors];
    newSponsors[index] = { ...newSponsors[index], [field]: value };
    updateFormData({ sponsors: newSponsors });
  };

  // This handler now receives a single File object from ImageUpload
  const handleSponsorLogoFileChange = async (file, index) => {
    console.log(`Sponsor: Handling logo change for index ${index}. User UID:`, currentUser?.uid, 'File:', file);
    
    setSponsorLogoUploadStates(prev => ({ ...prev, [index]: { isUploading: true, progress: 0, error: null } }));

    if (!file) { // If image is removed
      const oldUrl = formData.sponsors[index].logoUrl;
      if (oldUrl && oldUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        try {
          await deleteFileFromFirebaseStorage(oldUrl);
          showNotification(`Sponsor logo for ${formData.sponsors[index].name || 'Sponsor'} removed from storage.`, 'info');
        } catch (error) {
          showNotification(`Failed to remove sponsor logo for ${formData.sponsors[index].name || 'Sponsor'} from storage.`, 'error');
          console.error("Error deleting old sponsor logo:", error);
        }
      }
      const newSponsors = [...formData.sponsors];
      newSponsors[index].logoFile = null;
      newSponsors[index].logoUrl = '';
      updateFormData({ sponsors: newSponsors });
      setSponsorLogoUploadStates(prev => { 
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      return;
    }

    // File size limit for sponsor logo (e.g., 2MB)
    const MAX_SPONSOR_LOGO_SIZE_MB = 2;
    if (file.size > MAX_SPONSOR_LOGO_SIZE_MB * 1024 * 1024) {
        const errorMsg = `Sponsor logo size exceeds ${MAX_SPONSOR_LOGO_SIZE_MB}MB limit.`;
        showNotification(errorMsg, 'error');
        setSponsorLogoUploadStates(prev => ({ ...prev, [index]: { error: errorMsg, isUploading: false, progress: 0 } }));
        // Clear the file in form data if it exceeds size
        const newSponsors = [...formData.sponsors];
        newSponsors[index].logoFile = null;
        newSponsors[index].logoUrl = '';
        updateFormData({ sponsors: newSponsors });
        return;
    }

    if (!currentUser?.uid) {
      const errorMsg = "Authentication required to upload image. Please log in.";
      showNotification(errorMsg, 'error');
      setSponsorLogoUploadStates(prev => ({ ...prev, [index]: { error: errorMsg, isUploading: false, progress: 0 } }));
      return;
    }

    try {
      const folderPath = 'sponsor_logos';
      const downloadURL = await uploadFileToFirebaseStorage(
        file,
        currentUser.uid,
        folderPath,
        (progress) => setSponsorLogoUploadStates(prev => ({ ...prev, [index]: { ...prev[index], progress: progress } }))
      );

      const newSponsors = [...formData.sponsors];
      newSponsors[index].logoFile = file; // Store the File object
      newSponsors[index].logoUrl = downloadURL; // Store the URL
      updateFormData({ sponsors: newSponsors });
      showNotification(`Sponsor logo for ${formData.sponsors[index].name || 'Sponsor'} uploaded successfully!`, 'success');
    } catch (error) {
      console.error("Error uploading sponsor logo:", error);
      const errorMsg = `Sponsor logo upload failed: ${error.message}`;
      setSponsorLogoUploadStates(prev => ({ ...prev, [index]: { ...prev[index], error: errorMsg } }));
      showNotification(errorMsg, 'error');
    } finally {
      setSponsorLogoUploadStates(prev => ({ ...prev, [index]: { ...prev[index], isUploading: false, progress: 0 } }));
    }
  };

  const removeSponsor = async (indexToRemove) => {
    // Before removing the sponsor entry, delete its logo from storage if it exists
    const oldUrl = formData.sponsors[indexToRemove]?.logoUrl;
    if (oldUrl && oldUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        try {
            await deleteFileFromFirebaseStorage(oldUrl);
            showNotification(`Sponsor logo for ${formData.sponsors[indexToRemove].name || 'entry'} removed from storage.`, 'info');
        } catch (error) {
            showNotification(`Failed to remove sponsor logo for ${formData.sponsors[indexToRemove].name || 'entry'} from storage.`, 'error');
            console.error("Error deleting old sponsor logo:", error);
        }
    }

    const filteredSponsors = formData.sponsors.filter((_, i) => i !== indexToRemove);
    updateFormData({ sponsors: filteredSponsors });
    setSponsorLogoUploadStates(prev => { 
      const newState = { ...prev };
      delete newState[indexToRemove];
      return newState;
    });
  };

  // Determine if any upload is in progress to disable buttons
  const isAnyUploadInProgress = Object.values(galleryUploadStates).some(u => u?.isUploading) || 
                               Object.values(sponsorLogoUploadStates).some(u => u?.isUploading);

  return (
    <div className={styles.gallerySponsorsStepContainer}>
      <h3 className="text-xl font-semibold mb-4">Gallery & Sponsors</h3>
      <p className="text-gray-600 mb-6">Showcase your event with stunning visuals and highlight your partners. This step is completely optional.</p>

      {/* --- Gallery Section --- */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
            <PhotoIcon className="h-6 w-6 text-gray-600" />
            <span className={styles.sectionTitle}>Event Gallery Images</span>
        </div>
        
        {/* Single ImageUpload component for multiple gallery images */}
        <div className={styles.galleryUploadAreaContainer}>
            <ImageUpload
                onFilesChange={handleGalleryFilesChange} // This now expects an array of files
                previewUrls={formData.galleryImageUrls.filter(Boolean)} // Filter out empty strings/nulls for preview
                multiple={true} // Allow multiple file selection
                error={Object.values(galleryUploadStates).some(u => u?.error) ? "Some uploads failed." : null} // General error for gallery
                id="gallery-upload-main"
                // The label is now on the ImageUpload component itself
                label={`Upload up to ${MAX_GALLERY_IMAGES} images (max ${MAX_FILE_SIZE_MB}MB each)`} 
            />
            {isAnyUploadInProgress && Object.values(galleryUploadStates).some(u => u?.isUploading) && (
                <div className="text-sm text-gray-500 mt-2">
                    Uploading gallery images...
                    {Object.values(galleryUploadStates).map((state, idx) => state.isUploading && (
                        <span key={idx} className="ml-2">{state.progress?.toFixed(0)}% </span>
                    ))}
                </div>
            )}
            {Object.values(galleryUploadStates).some(u => u?.error) && (
                <p className="text-red-500 text-sm mt-2">Some gallery image uploads encountered errors.</p>
            )}
        </div>

        {/* Display existing/uploaded gallery image previews in a grid */}
        {formData.galleryImageUrls.length > 0 && (
            <div className={styles.galleryPreviewGrid}>
                {formData.galleryImageUrls.map((url, index) => url && ( // Only render if URL exists
                    <div key={index} className={styles.galleryPreviewItem}>
                        <img src={url} alt={`Gallery ${index + 1}`} className={styles.galleryPreviewImage} />
                        <button 
                            onClick={() => removeGalleryImage(index)} 
                            className={styles.removeGalleryImageButton}
                            title="Remove image"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- Sponsors Section --- */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
            <LinkIcon className="h-6 w-6 text-gray-600" />
            <span className={styles.sectionTitle}>Sponsors</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Add your event sponsors with their name, logo (upload file), and optional website link.</p>
        
        <div className={styles.sponsorsContainer}>
            {formData.sponsors.map((sponsor, index) => (
              <div key={index} className={styles.sponsorItemCard}>
                <div className="flex justify-end mb-2">
                  <button onClick={() => removeSponsor(index)} className={styles.removeSponsorButton} title="Remove Sponsor">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className={commonFormStyles.formGroup}> {/* Using common form styles */}
                  <label htmlFor={`sponsorName-${index}`} className={commonFormStyles.formLabel}>Sponsor Name</label>
                  <TextInput
                    id={`sponsorName-${index}`}
                    name={`sponsorName-${index}`}
                    value={sponsor.name}
                    onChange={(e) => handleSponsorChange(index, 'name', e.target.value)}
                    placeholder="e.g., Safaricom"
                    required={sponsor.name.length > 0 || sponsor.logoUrl.length > 0 || sponsor.websiteUrl.length > 0} 
                  />
                </div>
                <div className={commonFormStyles.formGroup}> {/* Using common form styles */}
                  <label className={commonFormStyles.formLabel}>Sponsor Logo</label> {/* Label for ImageUpload */}
                  <ImageUpload
                    onFilesChange={(file) => handleSponsorLogoFileChange(file, index)}
                    previewUrls={sponsor.logoUrl ? [sponsor.logoUrl] : []}
                    multiple={false}
                    error={sponsorLogoUploadStates[index]?.error}
                    id={`sponsor-logo-upload-${index}`} // Unique ID for each ImageUpload
                  />
                  {sponsorLogoUploadStates[index]?.isUploading && (
                    <div className="text-sm text-gray-500 mt-2">Uploading: {sponsorLogoUploadStates[index].progress?.toFixed(0)}%</div>
                  )}
                  {sponsorLogoUploadStates[index]?.error && <p className="text-red-500 text-sm mt-2">{sponsorLogoUploadStates[index].error}</p>}
                </div>
                <div className={commonFormStyles.formGroup}> {/* Using common form styles */}
                  <label htmlFor={`sponsorWebsite-${index}`} className={commonFormStyles.formLabel}>Sponsor Website URL (Optional)</label>
                  <TextInput
                    id={`sponsorWebsite-${index}`}
                    name={`sponsorWebsite-${index}`}
                    value={sponsor.websiteUrl}
                    onChange={(e) => handleSponsorChange(index, 'websiteUrl', e.target.value)}
                    placeholder="e.g., https://www.safaricom.co.ke"
                    type="url"
                  />
                </div>
              </div>
            ))}
            <button 
                onClick={addSponsor} 
                type="button" 
                className={`${commonFormStyles.secondaryButton} ${isAnyUploadInProgress ? commonFormStyles.disabledButton : ''}`}
                disabled={isAnyUploadInProgress}
            >
              <PlusCircleIcon className="h-5 w-5" /> Add Sponsor
            </button>
        </div>
      </div>

      {/* --- Navigation Buttons --- */}
      <div className={commonFormStyles.buttonGroup}>
        <button 
            onClick={prevStep} 
            className={`${commonFormStyles.prevButton} ${isAnyUploadInProgress ? commonFormStyles.disabledButton : ''}`}
            disabled={isAnyUploadInProgress}
        >
            Previous
        </button>
        <button 
            onClick={nextStep} 
            className={`${commonFormStyles.nextButton} ${isAnyUploadInProgress ? commonFormStyles.disabledButton : ''}`}
            disabled={isAnyUploadInProgress}
        >
            Next
        </button>
      </div>
    </div>
  );
};

export default GalleryAndSponsorsStep;