// /src/components/Common/RichTextEditor.jsx
import React from 'react';
// Removed react-quill and quill imports
// Removed 'react-quill/dist/quill.snow.css' import

const RichTextEditor = ({ value, onChange, placeholder, editorStyle, wrapperClassName, editorClassName, toolbarClassName, ...props }) => {
    // These classNames (editorClassName, toolbarClassName) and editorStyle are now effectively
    // applied to the overall wrapper div, as a simple textarea doesn't have such granular internal structures.
    // The wrapperClassName is the most relevant for external styling.

    return (
        <div className={wrapperClassName} style={editorStyle}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)} // onChange now passes plain string
                placeholder={placeholder}
                className={editorClassName} // Apply editorClassName to the textarea itself
                style={{
                    width: '100%',
                    minHeight: '150px', // Default min-height
                    border: '1px solid var(--naks-border-medium)',
                    borderRadius: '10px',
                    padding: '12px 15px',
                    backgroundColor: 'var(--naks-white-surface)',
                    color: 'var(--naks-text-primary)',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    outline: 'none',
                    resize: 'vertical', // Allow vertical resizing
                    ...editorStyle // Merge any inline styles passed
                }}
                {...props} // Pass any other standard textarea props like rows, cols etc.
            />
        </div>
    );
};

export default RichTextEditor;