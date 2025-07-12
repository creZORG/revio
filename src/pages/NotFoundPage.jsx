// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="p-5 text-center max-w-xl mx-auto bg-naks-white rounded-lg shadow-md my-8">
      <h2 className="text-4xl font-bold text-naks-black mb-4">404 - Page Not Found</h2>
      <p className="text-lg text-gray-700 mb-6">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-block bg-naks-pink text-naks-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-pink-700 transition-colors duration-300">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;