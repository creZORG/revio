// src/pages/Organizer/Dashboard/Tabs/CreateEventTab.jsx
import React from 'react';
import CreateEventWizard from './CreateEventWizard'; // Import the new wizard component

const CreateEventTab = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md"> {/* No min-h-[calc(100vh-120px)] here, let wizard manage height */}
      {/* The h2 and p from previous version are now handled within the wizard */}
      <CreateEventWizard /> {/* Render the new wizard */}
    </div>
  );
};

export default CreateEventTab;