// src/pages/Events/TicketedEventsPage.jsx
import React from 'react';
import EventList from '../../components/Events/EventList.jsx';

const TicketedEventsPage = () => {
  // In a real app, you would fetch ticketed events here
  const dummyTicketedEvents = [
    { id: 'te1', title: 'Grand Tech Expo', date: '2025-07-25', location: 'KICC', type: 'ticketed', price: 100, description: 'Explore the latest in technology.', imageUrl: 'https://placehold.co/300x200/FF69B4/FFFFFF?text=Tech+Expo' },
    { id: 'te2', title: 'Nairobi Jazz Festival', date: '2025-09-05', location: 'Carnivore Grounds', type: 'ticketed', price: 250, description: 'Enjoy soulful jazz under the stars.', imageUrl: 'https://placehold.co/300x200/1A1A1A/FFFFFF?text=Jazz+Fest' },
    { id: 'te3', title: 'Comedy Night Live', date: '2025-08-18', location: 'Comedy Club', type: 'ticketed', price: 50, description: 'Laugh out loud with top comedians.', imageUrl: 'https://placehold.co/300x200/A0522D/FFFFFF?text=Comedy+Night' },
  ];

  return (
    <div className="p-5 max-w-6xl mx-auto bg-naks-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold text-naks-black mb-6 text-center">Ticketed Events</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Browse events where you can purchase tickets for entry.</p>
      <EventList events={dummyTicketedEvents} isLoading={false} />
    </div>
  );
};

export default TicketedEventsPage;