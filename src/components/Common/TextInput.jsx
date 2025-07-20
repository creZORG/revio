// src/components/Common/TextInput.jsx
import React from 'react';
import styles from './TextInput.module.css'; // Assuming you have this CSS module

/**
 * A reusable text input component with optional icon and error display.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - The label for the input field.
 * @param {string} props.id - The unique ID for the input field.
 * @param {string} props.name - The name attribute for the input field.
 * @param {string} props.type - The type of input (e.g., 'text', 'email', 'password', 'tel').
 * @param {string} props.value - The current value of the input field (controlled component).
 * @param {function} props.onChange - The handler function for input changes.
 * @param {string} [props.placeholder=''] - The placeholder text.
 * @param {boolean} [props.required=false] - Whether the input is required.
 * @param {string} [props.error=''] - Error message to display.
 * @param {function} [props.icon] - React component for an icon (e.g., UserIcon from Heroicons).
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @param {string} [props.className=''] - Additional class names for the input container.
 */
const TextInput = ({
    label,
    id,
    name,
    type,
    value,
    onChange,
    placeholder = '',
    required = false,
    error = '',
    icon: Icon, // Renamed to Icon to avoid conflict with 'icon' prop
    disabled = false,
    className = '' // For passing additional styles from parent
}) => {
    return (
        <div className={`${styles.inputGroup} ${className}`}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label} {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.inputWrapper}>
                {Icon && (
                    <div className={styles.iconContainer}>
                        <Icon className={styles.icon} />
                    </div>
                )}
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value} // This is key for controlled component
                    onChange={onChange} // This is key for controlled component
                    placeholder={placeholder}
                    required={required}
                    className={`${styles.input} ${error ? styles.inputError : ''} ${Icon ? styles.inputWithIcon : ''}`}
                    disabled={disabled}
                />
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default TextInput;
