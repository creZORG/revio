// /src/components/Common/CheckboxGroupInput.jsx
import React from 'react';
import { FaCheck } from 'react-icons/fa'; // Import check icon

import styles from './CheckboxGroupInput.module.css';
import commonStyles from '../../pages/Organizer/organizer.module.css'; // For formGroup, formLabel, error-message-box

const CheckboxGroupInput = ({
    label,
    id,
    name,
    options = [], // Array of { value, label } objects
    selectedValues = [], // Array of currently selected values
    onChange, // Function to call when selection changes (receives updated array of values)
    required = false,
    error,
    helperText,
}) => {
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let newSelectedValues;

        if (checked) {
            newSelectedValues = [...selectedValues, value];
        } else {
            newSelectedValues = selectedValues.filter(val => val !== value);
        }
        onChange({ target: { name: name || id, value: newSelectedValues } });
    };

    return (
        <div className={commonStyles.formGroup}>
            {label && (
                <label htmlFor={id} className={commonStyles.formLabel}>
                    {label} {required && <span className={commonStyles.requiredStar}>*</span>}
                </label>
            )}
            <div className={styles.checkboxGroupContainer} id={id}>
                {options.map((option) => {
                    const isChecked = selectedValues.includes(option.value);
                    return (
                        <label
                            key={option.value}
                            className={`${styles.checkboxLabel} ${isChecked ? styles.checked : ''}`}
                        >
                            <input
                                type="checkbox"
                                name={name || id}
                                value={option.value}
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                                className={styles.checkboxInput}
                                disabled={option.disabled} // Allow individual options to be disabled
                            />
                            <span className={styles.customCheckbox}>
                                <FaCheck />
                            </span>
                            {option.label}
                        </label>
                    );
                })}
            </div>
            {error && <p className={commonStyles.errorMessageBox}>{error}</p>}
            {helperText && <p className={styles.helperText}>{helperText}</p>}
        </div>
    );
};

export default CheckboxGroupInput;