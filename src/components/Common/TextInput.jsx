import React from 'react';
import styles from './TextInput.module.css'; // Assuming you have a TextInput.module.css

const TextInput = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    required = false,
    readOnly = false,
    className = '', // For external styling
    error = '', // Error message string
    icon: Icon = null, // React Icon component (e.g., FaUser)
    prefix = '', // Fixed prefix text (e.g., "254")
    ...props
}) => {
    const inputId = `input-${name}`;

    return (
        <div className={`${styles.inputGroup} ${className}`}>
            {label && <label htmlFor={inputId} className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}
            <div className={`${styles.inputWrapper} ${error ? styles.inputWrapperError : ''} ${readOnly ? styles.readOnly : ''}`}>
                {Icon && <Icon className={styles.inputIcon} />}
                {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    readOnly={readOnly}
                    className={styles.inputField}
                    {...props}
                />
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default TextInput;