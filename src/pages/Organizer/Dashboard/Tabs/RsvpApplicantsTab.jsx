import React from 'react';

const RsvpApplicantsTab = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-[calc(100vh-120px)]">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">RSVP Applicants</h2>
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <p className="font-bold">Feature Disabled</p>
        <p>This feature is currently disabled and under development. Please check back later.</p>
      </div>
      {/* Placeholder for future RSVP list */}
      <div className="mt-8">
        {/* RSVP applications will be listed here */}
      </div>
    </div>
  );
};

export default RsvpApplicantsTab;