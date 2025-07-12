import { useContext } from 'react';
import { EventContext } from '../contexts/EventContext.js'; // Note .js extension

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
