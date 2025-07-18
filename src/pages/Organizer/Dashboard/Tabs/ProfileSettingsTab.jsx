import React from 'react';

const ProfileSettingsTab = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-[calc(100vh-120px)]">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
      <p className="text-gray-600 mb-4">
        Manage your personal and organization details.
      </p>
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">Organization Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orgName">
              Organization Name
            </label>
            <input
              type="text"
              id="orgName"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Your Organization Name"
              value="Naks Yetu Organizers" // Placeholder value
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Contact Phone
            </label>
            <input
              type="tel"
              id="phone"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="+254..."
              value="+254712345678" // Placeholder value
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="about">
              About Your Organization
            </label>
            <textarea
              id="about"
              rows="4"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Tell us about your organization..."
              value="We are dedicated to bringing the best events to Nakuru!" // Placeholder value
              readOnly
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <img
                src="https://placehold.co/100x100/aabbcc/ffffff?text=Org+Logo"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Upload New Photo
              </button>
            </div>
          </div>
        </div>
        <button className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          Save Changes
        </button>
      </div>
      {/* The Partner Setup Popup will be triggered if profile is incomplete */}
      {/* <PartnerSetupModal /> */}
    </div>
  );
};

export default ProfileSettingsTab;