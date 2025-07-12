// src/components/Common/ImageUpload.jsx
import React, { useState, useRef, useEffect } from 'react';

const ImageUpload = ({ label, id, onFilesChange, multiple = false, previewUrls = [], error, className = '', ...props }) => {
  const fileInputRef = useRef(null);
  const [internalPreviewUrls, setInternalPreviewUrls] = useState(previewUrls);

  useEffect(() => {
    setInternalPreviewUrls(previewUrls);
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setInternalPreviewUrls(multiple ? [...internalPreviewUrls, ...newPreviewUrls] : newPreviewUrls);

    // Pass the actual File objects up to the parent component
    onFilesChange(multiple ? [...(props.currentFiles || []), ...files] : files[0]);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedPreviews = internalPreviewUrls.filter((_, index) => index !== indexToRemove);
    setInternalPreviewUrls(updatedPreviews);

    // Logic to update the actual files array in the parent component
    if (multiple && props.currentFiles) {
      const updatedFiles = props.currentFiles.filter((_, index) => index !== indexToRemove);
      onFilesChange(updatedFiles);
    } else {
      onFilesChange(null); // Clear single file
    }
  };

  return (
    <div className={`image-upload-group ${className}`} style={{ marginBottom: '15px' }}>
      {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>{label}</label>}
      <input
        type="file"
        id={id}
        name={id}
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }} // Hide default input
        {...props}
      />
      <div
        style={{
          border: `2px dashed ${error ? 'red' : '#ccc'}`,
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f0f0f0',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
          if (files.length > 0) {
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setInternalPreviewUrls(multiple ? [...internalPreviewUrls, ...newPreviewUrls] : newPreviewUrls);
            onFilesChange(multiple ? [...(props.currentFiles || []), ...files] : files[0]);
          }
        }}
      >
        <p style={{ margin: 0, color: '#555' }}>Drag & Drop or Click to Upload {multiple ? 'Images' : 'Image'}</p>
        <p style={{ fontSize: '0.8em', color: '#888' }}>JPG, PNG, WebP. Max 5MB per file.</p>
      </div>

      {internalPreviewUrls.length > 0 && (
        <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {internalPreviewUrls.map((url, index) => (
            <div key={url + index} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
              <img src={url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                style={{
                  position: 'absolute', top: '5px', right: '5px',
                  backgroundColor: 'rgba(255,0,0,0.7)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '25px', height: '25px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.8em', fontWeight: 'bold'
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>{error}</p>}
    </div>
  );
};

export default ImageUpload;