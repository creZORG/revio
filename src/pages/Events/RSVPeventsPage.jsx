// src/pages/Events/RSVPeventsPage.jsx
import React from 'react';
import EventList from '../../components/Events/EventList.jsx';

const RSVPeventsPage = () => {
  // In a real app, you would fetch RSVP events here
  const dummyRSVPEvents = [
    { id: 're1', title: 'Startup Pitch Night', date: '2025-08-10', location: 'Innovation Hub', type: 'rsvp', description: 'See the next big ideas.', imageUrl: 'https://placehold.co/300x200/A0522D/FFFFFF?text=Pitch+Night' },
    { id: 're2', title: 'Community Garden Workshop', date: '2025-09-01', location: 'Botanical Gardens', type: 'rsvp', description: 'Learn about sustainable gardening.', imageUrl: 'https://placehold.co/300x200/FF69B4/FFFFFF?text=Garden+WS' },
    { id: 're3', title: 'Book Club Meeting', date: '2025-08-05', location: 'Public Library', type: 'rsvp', description: 'Discuss the latest literary works.', imageUrl: 'https://placehold.co/300x200/1A1A1A/FFFFFF?text=Book+Club' },
  ];

  return (
    <div className="p-5 max-w-6xl mx-auto bg-naks-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold text-naks-black mb-6 text-center">RSVP Events</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Confirm your attendance for these events.</p>
      <EventList events={dummyRSVPEvents} isLoading={false} />
    </div>
  );
};

export default RSVPeventsPage;