// src/hooks/useEvents.js
import React, { useContext, useState, useEffect } from 'react';
// FIX: Ensure it imports EventContext as a NAMED export and from the .js file
import { EventContext } from '../contexts/EventContext.jsx'; 
// The rest of your useEvents.js code should be fine, including:
// import { getEventById } from '../services/eventApiService.js'; // Example if you have this in your useEvents hook
// ... potentially other imports like from useAuth ...

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === null) { 
    throw new Error('useEvents must be used within an EventProvider');
  }
  // Assuming your hook then returns { events, loading, error } from the context
  return context;
};