// src/components/Common/TextInput.jsx
import React from 'react';

const TextInput = ({ label, id, value, onChange, type = 'text', placeholder, error, className = '', ...props }) => {
  const inputElement =
    type === 'textarea' ? (
      <textarea
        id={id}
        name={id} // Use id as name for consistency with useForm hook
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="common-text-input" // Apply common styles
        style={{ minHeight: props.minHeight || '80px', resize: props.resize || 'vertical' }} // Allow custom height/resize
        {...props}
      ></textarea>
    ) : (
      <input
        type={type}
        id={id}
        name={id} // Use id as name for consistency with useForm hook
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="common-text-input"
        style={{ borderColor: error ? 'red' : '#ccc' }} // Apply error styling
        {...props}
      />
    );

  return (
    <div className={`common-text-input-group ${className}`} style={{ marginBottom: '15px' }}>
      {label && <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>{label}</label>}
      {inputElement}
      {error && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>{error}</p>}
    </div>
  );
};

export default TextInput;