
// src/pages/ContactPage.jsx
import React from 'react';

const ContactPage = () => {
  return (
    <div className="p-5 text-center max-w-2xl mx-auto bg-naks-white rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold text-naks-black mb-4">Contact Us</h1>
      <p className="text-lg text-gray-700 mb-6">Have questions or feedback? Get in touch with the Naks Yetu team.</p>
      <p className="text-xl font-semibold text-naks-pink mb-2">Email: support@naksyetu.com</p>
      <p className="text-xl font-semibold text-naks-pink">Phone: +254 7XX XXX XXX</p>
      <p className="text-sm text-gray-500 mt-6">We aim to respond to all inquiries within 24-48 hours.</p>
    </div>
  );
};

export default ContactPage;