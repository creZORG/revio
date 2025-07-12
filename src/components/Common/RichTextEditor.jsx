// src/components/Common/RichTextEditor.jsx
import React from 'react';

const RichTextEditor = ({ label, id, value, onChange, placeholder, error, className = '', ...props }) => {
  return (
    <div className={`rich-text-editor-group ${className}`} style={{ marginBottom: '15px' }}>
      {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>{label}</label>}
      <textarea
        id={id}
        name={id} // Use id as name for consistency with useForm hook
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '10px',
          border: `1px solid ${error ? 'red' : '#ccc'}`,
          borderRadius: '5px',
          fontSize: '1rem',
          resize: 'vertical',
          boxSizing: 'border-box' // Include padding and border in the element's total width and height
        }}
        {...props}
      ></textarea>
      {error && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>{error}</p>}
      <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
        *Note: This is a basic text area. A full rich text editor would allow formatting (bold, italics, lists, etc.).
      </p>
    </div>
  );
};

export default RichTextEditor;