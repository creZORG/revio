import React from 'react';

// A very basic skeleton loader. This will be expanded with actual layout-specific skeletons.
const LoadingSkeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`loading-skeleton ${className}`}
      style={{
        width: width,
        height: height,
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite ease-in-out',
        // Optional: add a small margin-bottom for stacked skeletons
        marginBottom: '8px'
      }}
    >
      {/* Visual content for skeleton */}
    </div>
  );
};

export default LoadingSkeleton;