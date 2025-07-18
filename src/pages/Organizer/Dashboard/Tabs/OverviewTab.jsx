import React from 'react';

const OverviewTab = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-[calc(100vh-120px)]"> {/* Added min-height for better visual */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Overview</h2>
      <p className="text-gray-600">
        Welcome to your Organizer Dashboard! Here you'll find a summary of your events, sales, and overall performance.
      </p>
      {/* Placeholder for future widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-blue-800">Total Events</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-green-800">Total Tickets Sold</h3>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-purple-800">Pending Payouts</h3>
          <p className="text-2xl font-bold text-purple-600">Ksh 0.00</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;