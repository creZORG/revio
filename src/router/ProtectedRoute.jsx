// src/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js'; // Corrected import path (was already correct, but just verify)

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, isAuthenticated, loading, userRole } = useAuth();

  // While authentication state is being determined, show nothing or a loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`ProtectedRoute: User role '${userRole}' does not match required role '${requiredRole}', redirecting to /dashboard`);
    // Redirect to a generic dashboard or an unauthorized page
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and role matches (or no role required), render the children
  return children;
};

export default ProtectedRoute;