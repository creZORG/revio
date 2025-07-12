// src/pages/Events/AllEventsPage.jsx
import React from 'react';
import EventList from '../../components/Events/EventList.jsx';

const AllEventsPage = () => {
  // In a real app, you would fetch all events here
  const dummyEvents = [
    { id: 'ev1', title: 'Grand Tech Expo', date: '2025-07-25', location: 'KICC', type: 'ticketed', price: 100, description: 'Explore the latest in technology.', imageUrl: 'https://placehold.co/300x200/FF69B4/FFFFFF?text=Tech+Expo' },
    { id: 'ev2', title: 'Community Fun Run', date: '2025-08-01', location: 'Karura Forest', type: 'free', description: 'A run for all ages, promoting health.', imageUrl: 'https://placehold.co/300x200/1A1A1A/FFFFFF?text=Fun+Run' },
    { id: 'ev3', title: 'Startup Pitch Night', date: '2025-08-10', location: 'Innovation Hub', type: 'rsvp', description: 'See the next big ideas.', imageUrl: 'https://placehold.co/300x200/A0522D/FFFFFF?text=Pitch+Night' },
    { id: 'ev4', title: 'Nairobi Jazz Festival', date: '2025-09-05', location: 'Carnivore Grounds', type: 'ticketed', price: 250, description: 'Enjoy soulful jazz under the stars.', imageUrl: 'https://placehold.co/300x200/FF69B4/FFFFFF?text=Jazz+Fest' },
    { id: 'ev5', title: 'Art & Craft Fair', date: '2025-07-30', location: 'Village Market', type: 'free', description: 'Discover local artists and artisans.', imageUrl: 'https://placehold.co/300x200/1A1A1A/FFFFFF?text=Art+Fair' },
  ];

  return (
    <div className="p-5 max-w-6xl mx-auto bg-naks-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold text-naks-black mb-6 text-center">All Events</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Discover all types of events happening on Naks Yetu.</p>
      <EventList events={dummyEvents} isLoading={false} />
    </div>
  );
};

export default AllEventsPage;