import React, { useCallback, useRef } from 'react';
import Button from '../../../../../../components/Common/Button.jsx';
import { FaArrowLeft, FaArrowRight, FaSpinner, FaCloudUploadAlt, FaTimes, FaPlus, FaTag, FaLink } from 'react-icons/fa';

import styles from '../NaksYetuEventLaunchpad.module.css';

const GalleryAndSponsorsStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, onPrev, isSubmitting }) => {
  const galleryFileInputRef = useRef(null);
  const sponsorLogoInputRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'galleryFiles') {
        const newFiles = Array.from(files);
        const updatedGallery = [...(formData.galleryFiles || []), ...newFiles].slice(0, 6);
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

  const handleAddSponsor = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), { name: '', logoFile: null, logoUrl: '', link: '' }]
    }));
  }, [setFormData]);

  const handleRemoveSponsor = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, index) => index !== indexToRemove)
    }));
  }, [setFormData]);

  const handleSponsorInputChange = useCallback((index, field, value, file = null) => {
    setFormData(prev => {
      const updatedSponsors = [...(prev.sponsors || [])];
      if (!updatedSponsors[index]) {
          updatedSponsors[index] = { name: '', logoFile: null, logoUrl: '', link: '' };
      }

      if (field === 'logoFile') {
        updatedSponsors[index].logoFile = file;
        updatedSponsors[index].logoUrl = file ? URL.createObjectURL(file) : '';
      } else {
        updatedSponsors[index][field] = value;
      }
      return { ...prev, sponsors: updatedSponsors };
    });
  }, [setFormData]);

  const validateStep = useCallback(() => {
    const errors = {};
    if (formData.galleryFiles && formData.galleryFiles.length > 0) {
        const totalGallerySize = formData.galleryFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalGallerySize > (7 * 1024 * 1024 * 6)) {
            errors.galleryFiles = 'Total gallery size exceeds 42MB (6 images x 7MB).';
        }
    }

    formData.sponsors?.forEach((sponsor, index) => {
        if (!sponsor.name.trim()) {
            errors[`sponsors.${index}.name`] = 'Sponsor name is required.';
        }
        if (!sponsor.logoFile && !sponsor.logoUrl.trim()) {
            errors[`sponsors.${index}.logo`] = 'Sponsor logo is required.';
        }
        if (sponsor.link && !/^https?:\/\/\S+$/.test(sponsor.link)) {
            errors[`sponsors.${index}.link`] = 'Invalid URL for sponsor link.';
        }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleNext = () => {
    if (validateStep()) {
      onNext(formData);
    } else {
      alert('Please correct the errors before proceeding.');
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Gallery & Sponsors</h3>

      {/* Gallery Upload Section (Only for Ticketed and Nightlife) */}
      {(formData.eventType === 'ticketed' || formData.isNightlife) && (
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
      )}

      {/* Sponsors Section */}
      <div className={styles.formSection} style={{border: 'none', boxShadow: 'none', padding: '0', backgroundColor: 'transparent'}}>
        <h3 className={styles.sectionHeading}>Event Sponsors <span className="optional-label">(Optional, Max 6)</span></h3>
        <div className={styles.sponsorsGrid}>
          {(formData.sponsors || []).map((sponsor, index) => (
            <div key={index} className={styles.sponsorItem}>
              <button type="button" onClick={() => handleRemoveSponsor(index)} className={styles.removeSponsorBtn} disabled={isSubmitting}>
                <FaTimes />
              </button>
              <label htmlFor={`sponsorLogoInput-${index}`} className={styles.sponsorLogoContainer}>
                <img src={sponsor.logoUrl || 'https://placehold.co/80x80/E0E0E0/808080?text=Logo'} alt={sponsor.name || 'Sponsor Logo'} className={styles.sponsorLogo} />
                <input type="file" id={`sponsorLogoInput-${index}`} name="logoFile" accept="image/*" onChange={(e) => handleSponsorInputChange(index, 'logoFile', null, e.target.files[0])} disabled={isSubmitting} style={{display: 'none'}} />
              </label>
              <input
                type="text"
                className={styles.sponsorInput}
                placeholder="Sponsor Name"
                value={sponsor.name}
                onChange={(e) => handleSponsorInputChange(index, 'name', e.target.value)}
                disabled={isSubmitting}
              />
              <input
                type="url"
                className={styles.sponsorInput}
                placeholder="Sponsor Link (URL)"
                value={sponsor.link}
                onChange={(e) => handleSponsorInputChange(index, 'link', e.target.value)}
                disabled={isSubmitting}
              />
              {formErrors[`sponsors.${index}.name`] && <p className="error-message-box">{formErrors[`sponsors.${index}.name`]}</p>}
              {formErrors[`sponsors.${index}.logo`] && <p className="error-message-box">{formErrors[`sponsors.${index}.logo`]}</p>}
              {formErrors[`sponsors.${index}.link`] && <p className="error-message-box">{formErrors[`sponsors.${index}.link`]}</p>}
            </div>
          ))}
          {(formData.sponsors?.length || 0) < 6 && (
            <label htmlFor="addSponsorInput" className={styles.addSponsorArea}>
                <FaPlus className={styles.fileUploadIcon} />
                <p className={styles.fileUploadText}>Add Sponsor</p>
                <input type="file" id="addSponsorInput" name="sponsorLogo" accept="image/*" onChange={(e) => handleSponsorInputChange(formData.sponsors?.length || 0, 'logoFile', null, e.target.files[0])} disabled={isSubmitting} ref={sponsorLogoInputRef} style={{display: 'none'}} />
            </label>
          )}
        </div>
      </div>

      {/* Coupon Availability */}
      <div className="form-group">
        <label className={styles.formLabel}>
          <input type="checkbox" id="hasCoupons" name="hasCoupons" className={styles.formCheckbox} checked={formData.hasCoupons || false} onChange={handleInputChange} disabled={isSubmitting} />
          <FaTag style={{marginRight: '8px', color: 'var(--naks-primary)'}} /> Coupons Available for this Event
        </label>
        <p className="text-xs text-naks-text-secondary mt-1">Check this if you plan to offer discount coupons for this event.</p>
      </div>


      <div className={styles.actionButtons}>
        <Button onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
          <FaArrowLeft /> Previous
        </Button>
        <Button onClick={handleNext} className="btn btn-primary" disabled={isSubmitting}>
          Next Step <FaArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default GalleryAndSponsorsStep;