// src/App.jsx
import React from 'react';
// import AppRouter from './router/AppRouter.jsx'; // We will modify AppRouter to not contain BrowserRouter
import { BrowserRouter as Router } from 'react-router-dom'; // NEW: Import BrowserRouter here
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/Common/ErrorBoundary.jsx';
import './index.css';

// Import the main App content component (which will now be what AppRouter was)
import AppContent from './router/AppContent.jsx'; // NEW: Create this file


function App() {
  return (
    <ErrorBoundary>
      {/* CRITICAL FIX: BrowserRouter is now at the top level */}
      <Router>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              {/* AppContent will contain your Navbar, main, Footer and Routes */}
              <AppContent />
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;