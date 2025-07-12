import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent overlay
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'background-color 0.3s ease',
    }}>
      <div style={{
        backgroundColor: 'var(--naks-white-surface)', // Modal content background (dynamic)
        padding: '30px',
        borderRadius: '15px',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto',
        transition: 'background-color 0.3s ease',
        color: 'var(--naks-text-primary)', // Modal text color (dynamic)
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'var(--naks-text-secondary)', // Close icon color (dynamic)
          transition: 'color 0.2s ease',
        }}>
          <FaTimes />
        </button>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--naks-border-light)',
          color: 'var(--naks-secondary)', // FIX: Changed title color to pink
          textAlign: 'center',
        }}>
          {title}
        </h2>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;