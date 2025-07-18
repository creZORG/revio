import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-4 font-inter">
      <div className="bg-gray-900 bg-opacity-80 rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full border border-purple-600 animate-fade-in">
        {/* Creative 404 illustration or icon */}
        <div className="mb-8">
          {/* Using a simple SVG for a 'broken link' or 'lost' visual */}
          <svg
            className="w-32 h-32 mx-auto text-purple-400 animate-bounce-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"
            ></path>
          </svg>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-purple-400 mb-4 animate-slide-up">
          404
        </h1>

        {/* Sub-heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-slide-up-delay-1">
          Lost in the Cosmos?
        </h2>

        {/* Descriptive message */}
        <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed animate-slide-up-delay-2">
          It seems you've ventured off the known path. The page you're looking for might have been
          beamed up, or it never existed in this galaxy.
        </p>

        {/* Call to action button */}
        <Link
          to="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in-delay-3"
        >
          Return to Base Camp
        </Link>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .animate-slide-up-delay-1 {
          animation: slideUp 0.8s ease-out 0.3s forwards;
          opacity: 0; /* Start hidden */
        }

        .animate-slide-up-delay-2 {
          animation: slideUp 0.8s ease-out 0.6s forwards;
          opacity: 0; /* Start hidden */
        }

        .animate-fade-in-delay-3 {
          animation: fadeIn 1s ease-out 0.9s forwards;
          opacity: 0; /* Start hidden */
        }

        .animate-bounce-slow {
          animation: bounceSlow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
