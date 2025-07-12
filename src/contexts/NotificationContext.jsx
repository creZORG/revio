import React, { createContext, useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs for toasts
import ToastNotification from '../components/Common/ToastNotification/ToastNotification.jsx'; // Import the new ToastNotification component

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // showNotification now accepts heading and duration
  const showNotification = useCallback((message, type = 'info', duration = 4000, heading = '') => {
    const id = uuidv4();
    setToasts(prevToasts => [...prevToasts, { id, heading, message, type, duration }]);
  }, []);

  const dismissNotification = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Render Toast Notifications container */}
      <div className="toast-container"> {/* This class should be defined in global CSS (index.css) */}
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            heading={toast.heading}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={dismissNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};