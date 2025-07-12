// src/pages/Events/FreeEventsPage.jsx
import React from 'react';
import EventList from '../../components/Events/EventList.jsx';

const FreeEventsPage = () => {
  // In a real app, you would fetch free events here
  const dummyFreeEvents = [
    { id: 'fe1', title: 'Community Fun Run', date: '2025-08-01', location: 'Karura Forest', type: 'free', description: 'A run for all ages, promoting health.', imageUrl: 'https://placehold.co/300x200/1A1A1A/FFFFFF?text=Fun+Run' },
    { id: 'fe2', title: 'Art & Craft Fair', date: '2025-07-30', location: 'Village Market', type: 'free', description: 'Discover local artists and artisans.', imageUrl: 'https://placehold.co/300x200/FF69B4/FFFFFF?text=Art+Fair' },
    { id: 'fe3', title: 'Open Mic Night', date: '2025-08-20', location: 'Local Cafe', type: 'free', description: 'Share your talent or enjoy local artists.', imageUrl: 'https://placehold.co/300x200/A0522D/FFFFFF?text=Open+Mic' },
  ];

  return (
    <div className="p-5 max-w-6xl mx-auto bg-naks-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold text-naks-black mb-6 text-center">Free Events</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Explore events with no admission cost.</p>
      <EventList events={dummyFreeEvents} isLoading={false} />
    </div>
  );
};

export default FreeEventsPage;