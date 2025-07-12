import React, { useCallback, useRef, useState } from 'react';
import TextInput from '../../../../../../components/Common/TextInput.jsx';
import Button from '../../../../../../components/Common/Button.jsx';
// FIX: Ensure all required icons are correctly imported from 'react-icons/fa'
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaCloudUploadAlt, FaTimes, FaPlus, FaTag,
         FaMicrophoneAlt, FaCompactDisc, FaTree, FaHome, FaGuitar, FaMask,
         FaBeer, FaCocktail, FaUserAlt // Age category icons
} from 'react-icons/fa';

import styles from '../CreateNightlifeEventWizard.module.css'; // Wizard specific styles

const NIGHTLIFE_CATEGORIES = [
  { id: 'karaoke', label: 'Karaoke', icon: FaMicrophoneAlt },
  { id: 'dj', label: 'DJ', icon: FaCompactDisc },
  { id: 'park-and-chill', label: 'Park and Chill', icon: FaTree },
  { id: 'houseparty', label: 'House Party', icon: FaHome },
  { id: 'live-bands', label: 'Live Bands', icon: FaGuitar },
  { id: 'themed-party', label: 'Themed Party', icon: FaMask },
];

const NIGHTLIFE_AGE_CATEGORIES = [
  { id: '18plus', label: '18+', icon: FaBeer },
  { id: '21plus', label: '21+', icon: FaCocktail },
  { id: '35plus', label: '35+', icon: FaUserAlt },
];

const NightlifeSpecificsStep = ({ formData, setFormData, formErrors, setFormErrors, onNext, onPrev, isSubmitting }) => {
  const sponsorLogoInputRef = useRef(null);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const currentCategories = formData.selectedAgeCategories || [];
      if (checked) {
        setFormData(prev => ({ ...prev, selectedAgeCategories: [...currentCategories, value] }));
      } else {
        setFormData(prev => ({ ...prev, selectedAgeCategories: currentCategories.filter(cat => cat !== value) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  }, [formData.selectedAgeCategories, setFormData, setFormErrors]);

  const handleAddSponsor = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), { name: '', logoFile: null, logoUrl: '' }]
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
          updatedSponsors[index] = { name: '', logoFile: null, logoUrl: '' };
      }

      if (field === 'logoFile') {
        updatedSponsors[index].logoFile = file;
        updatedSponsors[index].logoUrl = file ? URL.createObjectURL(file) : ''; // For preview
      } else {
        updatedSponsors[index][field] = value;
      }
      return { ...prev, sponsors: updatedSponsors };
    });
  }, [setFormData]);


  const validateStep = useCallback(() => {
    const errors = {};
    if (!formData.selectedAgeCategories || formData.selectedAgeCategories.length === 0) {
      errors.selectedAgeCategories = 'At least one age category must be selected.';
    }
    if (formData.entranceFee && (isNaN(parseFloat(formData.entranceFee)) || parseFloat(formData.entranceFee) < 0)) {
      errors.entranceFee = 'Entrance Fee must be a non-negative number.';
    }
    
    // Validate sponsors
    formData.sponsors?.forEach((sponsor, index) => {
        if (!sponsor.name.trim()) {
            errors[`sponsors.${index}.name`] = 'Sponsor name is required.';
        }
        if (!sponsor.logoFile && !sponsor.logoUrl.trim()) {
            errors[`sponsors.${index}.logo`] = 'Sponsor logo is required.';
        }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, setFormErrors]);

  const handleSubmit = () => {
    if (validateStep()) {
      onNext(formData); // Pass all formData to the final submit handler
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionHeading}>Nightlife Specifics</h3>

      <div className="form-group">
        <label htmlFor="entranceFee" className={styles.formLabel}>Entrance Fee (KES) <span className="optional-label">(Optional)</span></label>
        <input type="number" id="entranceFee" name="entranceFee" className={styles.inputField} placeholder="e.g., 1000" min="0" step="0.01" value={formData.entranceFee} onChange={handleInputChange} disabled={isSubmitting} />
        {formErrors.entranceFee && <p className="error-message-box">{formErrors.entranceFee}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="disclaimer" className={styles.formLabel}>Disclaimer <span className="optional-label">(Optional)</span></label>
        <textarea id="disclaimer" name="disclaimer" className={styles.inputField} rows="4" placeholder="e.g., Rights of admission reserved. No under 18s allowed." value={formData.disclaimer} onChange={handleInputChange} disabled={isSubmitting}></textarea>
      </div>

      <div className="form-group">
        <label className={styles.formLabel}>Nightlife Categories <span className={styles.requiredStar}>*</span></label>
        <div className={styles.checkboxGroup}>
          {NIGHTLIFE_CATEGORIES.map(cat => (
            <label key={cat.id} className={styles.ageCategoryCheckboxLabel}>
              <input
                type="radio"
                name="category"
                value={cat.id}
                className={styles.ageCategoryCheckboxInput}
                checked={formData.category === cat.id}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                disabled={isSubmitting}
              />
              <span className={styles.ageCategoryCustomCheckbox}>
                {formData.category === cat.id && <FaCheckCircle />}
              </span>
              {cat.icon && <cat.icon className={styles.ageCategoryCheckboxIcon} />}
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
        {formErrors.category && <p className="error-message-box">{formErrors.category}</p>}
      </div>


      <div className="form-group">
        <label className={styles.formLabel}>Age Categories <span className={styles.requiredStar}>*</span></label>
        <div className={styles.ageCategoryCheckboxesContainer}>
          {NIGHTLIFE_AGE_CATEGORIES.map(age => (
            <label key={age.id} className={`${styles.ageCategoryCheckboxLabel} ${formData.selectedAgeCategories.includes(age.id) ? styles.active : ''}`}>
              <input
                type="checkbox"
                name="selectedAgeCategories"
                value={age.id}
                className={styles.ageCategoryCheckboxInput}
                checked={formData.selectedAgeCategories.includes(age.id)}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <span className={styles.ageCategoryCustomCheckbox}>
                {formData.selectedAgeCategories.includes(age.id) && <FaCheckCircle />}
              </span>
              {age.icon && <age.icon className={styles.ageCategoryCheckboxIcon} />}
              <span>{age.label}</span>
            </label>
          ))}
        </div>
        {formErrors.selectedAgeCategories && <p className="error-message-box">{formErrors.selectedAgeCategories}</p>}
      </div>

      {/* Coupon Availability */}
      <div className="form-group">
        <label className={styles.formLabel}>
          <input type="checkbox" id="hasCoupons" name="hasCoupons" className={styles.formCheckbox} checked={formData.hasCoupons || false} onChange={handleInputChange} disabled={isSubmitting} />
          <FaTag style={{marginRight: '8px', color: 'var(--naks-primary)'}} /> Coupons Available for this Event
        </label>
        <p className="text-xs text-naks-text-secondary mt-1">Check this if you plan to offer discount coupons for this event.</p>
      </div>

      {/* Sponsors Section */}
      <div className={styles.formSection} style={{border: 'none', boxShadow: 'none', padding: '0', backgroundColor: 'transparent'}}>
        <h3 className={styles.sectionHeading}>Event Sponsors <span className="optional-label">(Optional, Max 6)</span></h3>
        <div className={styles.filePreviewContainer} style={{justifyContent: 'flex-start'}}>
          {(formData.sponsors || []).map((sponsor, index) => (
            <div key={index} className={styles.sponsorLogoContainer}>
              <img src={sponsor.logoUrl || 'https://placehold.co/100x80/E0E0E0/808080?text=Logo'} alt={sponsor.name || 'Sponsor Logo'} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Sponsor Name"
                value={sponsor.name}
                onChange={(e) => handleSponsorInputChange(index, 'name', e.target.value)}
                disabled={isSubmitting}
                style={{fontSize: '0.75rem', padding: '4px', height: 'auto', border: 'none', textAlign: 'center'}}
              />
              <button type="button" onClick={() => handleRemoveSponsor(index)} className={styles.removeFileBtn} disabled={isSubmitting}>
                <FaTimes />
              </button>
              {formErrors[`sponsors.${index}.name`] && <p className="error-message-box" style={{position: 'absolute', bottom: '-20px', width: '100%'}}>{formErrors[`sponsors.${index}.name`]}</p>}
              {formErrors[`sponsors.${index}.logo`] && <p className="error-message-box" style={{position: 'absolute', bottom: '-20px', width: '100%'}}>{formErrors[`sponsors.${index}.logo`]}</p>}
            </div>
          ))}
          {(formData.sponsors?.length || 0) < 6 && (
            <label htmlFor="sponsorLogoInput" className={`${styles.fileUploadArea} ${styles.addSponsorArea}`} style={{width: '120px', height: '150px', border: '1px dashed var(--naks-border-medium)', backgroundColor: 'transparent', margin: '0'}}>
                <FaPlus className={styles.fileUploadIcon} style={{fontSize: '1.5rem', color: 'var(--naks-text-secondary)'}} />
                <p className={styles.fileUploadText} style={{fontSize: '0.75rem', color: 'var(--naks-text-secondary)'}}>Add Sponsor</p>
                <input type="file" id="sponsorLogoInput" name="sponsorLogo" accept="image/*" onChange={(e) => handleSponsorInputChange(formData.sponsors?.length || 0, 'logoFile', null, e.target.files[0])} disabled={isSubmitting} ref={sponsorLogoInputRef} style={{display: 'none'}} />
            </label>
          )}
        </div>
      </div>


      <div className={styles.actionButtons}>
        <Button onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
          <FaArrowLeft /> Previous
        </Button>
        <Button onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
};

export default NightlifeSpecificsStep;