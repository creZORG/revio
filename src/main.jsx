// /src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Global CSS variables and base styles

import { AuthProvider } from './contexts/AuthContext.jsx'; // Assuming AuthProvider exists
import { NotificationProvider } from './contexts/NotificationContext.jsx'; // Assuming NotificationProvider exists
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // Assuming ThemeProvider exists
import { CartProvider } from './contexts/CartContext.jsx'; // NEW: Import CartProvider
import ErrorBoundary from './components/Common/ErrorBoundary.jsx'; // Assuming ErrorBoundary exists

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider> {/* AuthProvider is outside, so useAuth is available to CartProvider */}
        <NotificationProvider>
          <ThemeProvider>
            <CartProvider> {/* NEW: Wrap App with CartProvider, inside AuthProvider */}
              <App />
            </CartProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);