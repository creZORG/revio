// src/components/Common/ImageUpload.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ImageUpload.module.css'; // Import the CSS Module

const ImageUpload = ({ 
  label, 
  id, 
  onFilesChange = () => {}, // Provide a default empty function to prevent TypeError
  multiple = false, 
  previewUrls = [], 
  error, 
  className = '', 
  currentFiles = [], 
  ...props 
}) => {
  const fileInputRef = useRef(null);
  const [internalPreviewUrls, setInternalPreviewUrls] = useState(previewUrls);
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop visual feedback

  // Sync internal preview URLs with external prop.
  useEffect(() => {
    // Revoke old object URLs that are no longer in previewUrls prop
    const oldInternalUrls = new Set(internalPreviewUrls);
    previewUrls.forEach(url => oldInternalUrls.delete(url));
    oldInternalUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setInternalPreviewUrls(previewUrls);
  }, [previewUrls]);

  // Cleanup effect: Revoke all object URLs when component unmounts
  useEffect(() => {
    return () => {
      internalPreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [internalPreviewUrls]);


  // Callback to handle file input change or drag-and-drop
  const processFiles = useCallback((filesToProcess) => {
    if (!filesToProcess || filesToProcess.length === 0) {
      if (!multiple && typeof onFilesChange === 'function') {
        onFilesChange(null);
      }
      setInternalPreviewUrls([]);
      return;
    }

    const imageFiles = Array.from(filesToProcess).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      if (!multiple && typeof onFilesChange === 'function') {
        onFilesChange(null);
      }
      setInternalPreviewUrls([]);
      return;
    }

    const newObjectURLs = imageFiles.map(file => URL.createObjectURL(file));

    let filesToPassToParent;

    if (multiple) {
      filesToPassToParent = [...currentFiles, ...imageFiles];
      setInternalPreviewUrls(prev => [...prev, ...newObjectURLs]);
    } else {
      if (internalPreviewUrls.length > 0 && internalPreviewUrls[0].startsWith('blob:')) {
        URL.revokeObjectURL(internalPreviewUrls[0]);
      }
      filesToPassToParent = imageFiles[0];
      setInternalPreviewUrls(newObjectURLs);
    }
    
    if (typeof onFilesChange === 'function') {
      onFilesChange(filesToPassToParent);
    } else {
      console.error("ImageUpload Error: onFilesChange prop is not a function or is missing! Value received:", onFilesChange);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [internalPreviewUrls, multiple, currentFiles, onFilesChange]);


  const handleFileChange = (e) => {
    processFiles(e.target.files);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleRemoveImage = (indexToRemove) => {
    if (internalPreviewUrls[indexToRemove] && internalPreviewUrls[indexToRemove].startsWith('blob:')) {
      URL.revokeObjectURL(internalPreviewUrls[indexToRemove]);
    }

    const updatedPreviews = internalPreviewUrls.filter((_, index) => index !== indexToRemove);
    setInternalPreviewUrls(updatedPreviews);

    if (typeof onFilesChange === 'function') {
      if (multiple) {
        const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
        onFilesChange(updatedFiles);
      } else {
        onFilesChange(null);
      }
    } else {
      console.error("ImageUpload Error: onFilesChange prop is not a function when removing image! Value received:", onFilesChange);
    }
  };

  return (
    <div className={`${styles.imageUploadGroup} ${className}`}>
      {label && <label htmlFor={id} className={styles.imageUploadLabel}>{label}</label>}
      <input
        type="file"
        id={id}
        name={id}
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleFileChange}
        ref={fileInputRef}
        className={styles.hiddenInput}
        {...props}
      />
      <div
        className={`${styles.uploadArea} ${error ? styles.uploadAreaError : ''} ${isDragging ? styles.dragOver : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className={styles.uploadText}>Drag & Drop or Click to Upload {multiple ? 'Images' : 'Image'}</p>
        <p className={styles.uploadInfo}>JPG, PNG, WebP. Max 5MB per file.</p>
      </div>

      {internalPreviewUrls.length > 0 && (
        <div className={styles.previewContainer}>
          {internalPreviewUrls.map((url, index) => (
            <div key={url + index} className={styles.previewItem}>
              <img src={url} alt={`Preview ${index}`} className={styles.previewImage} />
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                className={styles.removeButton}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default ImageUpload;