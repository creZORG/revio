// /src/components/Common/TextInput.jsx
import React from 'react';
import styles from './TextInput.module.css';
import commonStyles from '../../pages/Organizer/organizer.module.css';
import { uploadFileToFirebaseStorage, deleteFileFromFirebaseStorage } from '../../services/storageService.js';
const TextInput = ({
    label,
    id,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    readOnly = false,
    disabled = false,
    error,
    helperText,
    icon: IconComponent,
    rows = 3,
    options = [],
    ...props
}) => {
    // Determine the base class names for the input element
    const baseInputClassName = `${commonStyles.inputField} ${error ? styles.inputError : ''} ${IconComponent ? styles.inputWithPadding : ''}`;

    return (
        <div className={commonStyles.formGroup}>
            {label && (
                <label htmlFor={id} className={commonStyles.formLabel}>
                    {label} {required && <span className={commonStyles.requiredStar}>*</span>}
                </label>
            )}
            <div className={`${styles.inputWrapper} ${IconComponent ? styles.hasIcon : ''}`}>
                {IconComponent && <IconComponent className={styles.inputIcon} />}
                {type === 'select' ? (
                    <select
                        id={id}
                        name={name || id}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        className={baseInputClassName}
                        {...props} // Spread any other valid HTML props here
                    >
                        {options.map((option, index) => (
                            <option key={option.value || index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        id={id}
                        name={name || id}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        disabled={disabled}
                        className={baseInputClassName}
                        rows={rows}
                        {...props} // Spread any other valid HTML props here
                    />
                ) : (
                    <input
                        id={id}
                        name={name || id}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        disabled={disabled}
                        className={baseInputClassName}
                        {...props} // Spread any other valid HTML props here
                    />
                )}
            </div>
            {error && <p className={commonStyles.errorMessageBox}>{error}</p>}
            {helperText && <p className={styles.helperText}>{helperText}</p>}
        </div>
    );
};

export default TextInput;